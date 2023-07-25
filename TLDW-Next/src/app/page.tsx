"use client";

import Image from 'next/image'
import { useState } from 'react'
// import MarkdownIt from 'markdown-it';
// import sanitizeHtml from 'sanitize-html';
import ReactMarkdown from 'react-markdown'
import { test_spit } from './test_spit';

export default function Home() {
  const testing = false;
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [spit, setSpit] = useState(!testing ? 'Not generated a summary yet...' : (test_spit));

  async function generateSummary() {
		setLoading(true);
		const responseObject = await fetch(`/api/generate?videoUrl=${videoUrl}`);

		if (responseObject.status !== 200) {
			setSpit('error: api call failed!');
			setLoading(false);
			return;
		}

		const responseJson = await responseObject.json();
		const responseSpit = responseJson.spit;

		console.log(responseSpit);
		setSpit(responseSpit);
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
                Too Long, Don't Watch
              </h2>
            </div>
            <p className="text-center">
              Enter a video URL and we'll give you the gist of what you'd learn from the video.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-3 max-w-[500px] w-full">
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
            <p className="2xl:max-w-[70vw] text-center text-lg text-blue-600 tracking-tight">LOADING</p>
            <p className="2xl:max-w-[70vw] text-center font-light text-blue-400 tracking-tight">
              This shouldn't take more than a minute or so though.
            </p>
            <img
              className="w-full"
              alt="Funny loading GIF of child sat on chair bored while waiting for page to load"
              src="https://media.tenor.com/Y7ShQ_3hnn8AAAAd/me-waiting-for-my-friends-to-get-online.gif"
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
