"use client";

import Image from 'next/image'
import { useState } from 'react'
// import MarkdownIt from 'markdown-it';
// import sanitizeHtml from 'sanitize-html';
import ReactMarkdown from 'react-markdown'
import { test_spit } from './test_spit';
import { Configuration, OpenAIApi } from "openai";

export default function Home() {
  const testing = false;
  const [videoUrl, setVideoUrl] = useState("");
  const [AiAPIKey, setAiAPIKeyDirectly] = useState(localStorage.getItem('aiApiKey') || '');
  const [loading, setLoading] = useState(false);
  const [spit, setSpit] = useState(!testing ? 'Not generated a summary yet...' : (test_spit));
  const [error, setError] = useState("");

  function setAiAPIKey(apiKey: string) {
    localStorage.setItem('aiApiKey', apiKey);
    setAiAPIKeyDirectly(apiKey);
  }

  async function processTranscriptionThroughAI(transcription: string): Promise<string> {
    const configuration = new Configuration({
        apiKey: AiAPIKey,
    });

    const openai = new OpenAIApi(configuration);

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-4-0613",
            messages: [
                { "role": "system", "content": "The user will give you a transcription of a YouTube video. You should use this transcription to summarise the video into a TLDW (Too long, don't watch). You should use markdown to format the notes in a way that is efficient to read. Use bullet points when necessary." },
                { role: "user", content: transcription }
            ],
        });

        const responseString: string | undefined = completion.data.choices[0]?.message?.content;

        return responseString || "";
    } catch (error: any) {
        console.log(error);
        return error.toString();
    }
}

  async function generateSummary() {
    setLoading(true);
    const transcriptResponseObject = await fetch(`https://tldw-transcription-service-272d748790d5.herokuapp.com/api/get_transcript?videoUrl=${videoUrl}`);
    // const responseObject = await fetch(`http://127.0.0.1:5000/api/summarize_video?videoUrl=${videoUrl}`);

    if (transcriptResponseObject.status !== 200) {
      const rjson = await transcriptResponseObject.json()
      setSpit(`## An error occured while connecting to the API.\n### Error Message: ${"```" + rjson.errorMessage + "```" || "Error was external so no valid error message can be provided. Likely to be a timeout or heroku error."}`);
      setLoading(false);
      return;
    }

    const responseJson = await transcriptResponseObject.json();
    const responseTranscript = responseJson.transcription;

    const spit = await processTranscriptionThroughAI(responseTranscript) || "Error";

    console.log(responseTranscript);
    setSpit(spit);
    setLoading(false);
  }

  // @ts-ignore
  // function formatSpit(toFormat) {
  // 	return sanitizeHtml(md.render(toFormat), {
  // 		allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'img'])
  // 	});
  // }

  return (
    <>
      <div className="px-5 py-7 md:p-8 lg:p-14 xl:p-20 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-10">
          <div className="flex flex-col items-center justify-center max-w-[400px] space-y-3">
            <div className="flex flex-col items-center justify-center space-y-1">
              <h1 className="text-center font-semibold text-4xl text-blue-600 tracking-tighter">TLDW</h1>
              <h2 className="text-center font-light text-xl text-blue-500 tracking-tighter">
                Too Long, Don&apos;t Watch
              </h2>
            </div>
            <p className="text-center">
              Enter a video URL and we&apos;ll give you the gist of what you&apos;d learn from the video.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-3 max-w-[500px] w-full">
            <input
              className="bg-gray-100 p-3 w-full"
              value={AiAPIKey}
              onChange={((e) => setAiAPIKey(e.target.value))}
              name="apiKey"
              type="text"
              placeholder="OpenAI API Key"
              disabled={loading}
            />
            <input
              className="bg-gray-100 p-3 w-full"
              value={videoUrl}
              onChange={((e) => setVideoUrl(e.target.value))}
              name="videoUrl"
              type="text"
              placeholder="YouTube Video URL"
              disabled={loading}
            />
            <button
              className="bg-blue-600 px-10 py-3 w-full text-white"
              disabled={loading}
              onClick={generateSummary}
            >
              Generate Summary
            </button>
          </div>
        </div>

        <div className="w-full bg-black h-[1px] bg-opacity-20 my-10 lg:my-16" />

        {loading ?
          <div className="flex flex-col items-center justify-center max-w-[400px] space-y-1">
            <p className="2xl:max-w-[70vw] text-center text-lg text-blue-600 tracking-tight">GENERATING...</p>
            <p className="2xl:max-w-[70vw] text-center font-light text-blue-400 tracking-tight">
              This shouldn&apos;t take more than a minute or so.
            </p>
            <img
              className="w-full"
              alt="Funny loading GIF of child sat on chair bored while waiting for page to load"
              src="https://media.tenor.com/3dFHbSGVvqgAAAAC/robot-dancing.gif"
            />
          </div>
          :
          <ReactMarkdown className="2xl:max-w-[70vw] prose-sm md:prose-md lg:prose-lg prose-li:list-disc">
            {spit}
          </ReactMarkdown>
        }
      </div >
    </>
  )
}
