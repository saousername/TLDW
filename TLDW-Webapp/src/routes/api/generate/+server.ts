import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

import { Configuration, OpenAIApi } from "openai";

// 1. Get YouTube video transcript from YouTube's API
// 2. Give transcript to ChatGPT API with a prompt "Summarize this video for me given the above transcript"
// 3. Return answer to the user
// 4. Profit

// TODO: SWAP TO ENVIRONMENT VARIABLE WITH PROCESS.ENV OR SVELTE ALTERNATIVE AND CREATE .ENV FILE (DON'T FORGOT TO DEFINE .ENV VARIABLE ON VERCEL)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function getVideoCaptions(videoUrl: string): Promise<string | null> {
    try {
        const videoId = extractVideoIdFromUrl(videoUrl);
        if (!videoId) {
            throw new Error("Unable to extract Video ID from URL.");
        }
        const transcriptionCall = await fetch(`https://tldw-transcription-service-272d748790d5.herokuapp.com/api/get_captions?video_id=${videoId}`)

        const transcription = transcriptionCall.text();

        return transcription;
    } catch (error: any) {
        console.error('Error fetching captions:', error.message);
        return null;
    }
}

// Helper function to extract video ID from the URL
function extractVideoIdFromUrl(url: string): string | null {
    const videoIdRegex = /(?:v=|\/embed\/|\/watch\?v=|\/\w+\/\w+\/|\/v\/)([^&?\n]+)/;
    const match = url.match(videoIdRegex);
    return match && match[1];
}

export async function GET({ request, params, url }: RequestEvent) {
    const searchParams = url.searchParams;
    const videoUrl: string | null = searchParams.get("videoUrl");

    if (!videoUrl) {
        console.log("No video URL provided");
        throw new Error("No video URL provided");
    }

    const transcription = await getVideoCaptions(videoUrl);

    if (!transcription) {
        console.log("No transcription found")
        throw new Error("No transcription found");
    }

    // TODO: Make call to GPT
    const spit = await processTranscriptionThroughAI(transcription);

    if (!spit) {
        throw new Error("No spit");
    }

    return json({ spit: spit });
}

async function processTranscriptionThroughAI(transcription: string): Promise<string | undefined> {
    const configuration = new Configuration({
        apiKey: OPENAI_API_KEY,
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

        return responseString;
    } catch (error: any) {
        console.log(error);
        return error.toString();
    }
}

