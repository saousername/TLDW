from flask import Flask, request
from youtube_transcript_api import YouTubeTranscriptApi

app = Flask(__name__)


@app.route('/api/get_captions')
def get_captions():
	video_id = request.args.get("video_id")
	captionList = YouTubeTranscriptApi.get_transcript(video_id)
	captionString = ""

	print(captionList)

	for caption in captionList:
		captionString += caption['text'] + " "

	print(captionString)
	return captionString


app.run(host='0.0.0.0', port=81)