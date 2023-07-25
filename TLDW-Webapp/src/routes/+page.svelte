<script>
	import MarkdownIt from 'markdown-it';
	import sanitizeHtml from 'sanitize-html';
	import { afterUpdate } from 'svelte';
	import { test_spit } from '../test_spit';

	const md = new MarkdownIt();

	let videoUrl = '';
	const testing = false;
	let spit = !testing ? 'Not generated a summary yet...' : formatSpit(test_spit);
	let loading = false;
	let pre_spit = '';

	async function generateSummary() {
		loading = true;
		const responseObject = await fetch(`https://tldw-transcription-service-272d748790d5.herokuapp.com/api/get_captions?video_id=${videoUrl}`);

		if (responseObject.status !== 200) {
			spit = 'error: api call failed!';
			loading = false;
			return;
		}

		const responseJson = await responseObject.json();
		const responseSpit = responseJson.spit;

		console.log(responseSpit);
		spit = formatSpit(responseSpit);
		loading = false;
	}

	// @ts-ignore
	function formatSpit(toFormat) {
		return sanitizeHtml(md.render(toFormat), {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'img'])
		});
	}
</script>

<div class="px-5 py-7 md:p-8 lg:p-14 xl:p-20 flex flex-col items-center justify-center">
	<div class="flex flex-col items-center justify-center space-y-10">
		<div class="flex flex-col items-center justify-center max-w-[400px] space-y-3">
			<div class="flex flex-col items-center justify-center space-y-1">
				<h1 class="text-center font-semibold text-4xl text-blue-600 tracking-tighter">TLDW</h1>
				<h2 class="text-center font-light text-xl text-blue-500 tracking-tighter">
					Too Long, Don't Watch
				</h2>
			</div>
			<p class="text-center">
				Enter a video URL and we'll give you the gist of what you'd learn from the video.
			</p>
		</div>

		<div class="flex flex-col items-center justify-center space-y-3 max-w-[500px] w-full">
			<input
				class="bg-gray-100 p-3 w-full"
				bind:value={videoUrl}
				name="videoUrl"
				type="text"
				placeholder="YouTube Video URL"
				disabled={loading}
			/>
			<button
				class="bg-blue-600 px-10 py-3 w-full text-white"
				disabled={loading}
				on:click={generateSummary}
			>
				Generate Summary
			</button>
		</div>
	</div>

	<div class="w-full bg-black h-[1px] bg-opacity-20 my-10 lg:my-16" />

	{#if loading}
		<div class="flex flex-col items-center justify-center max-w-[400px] space-y-1">
			<p class="2xl:max-w-[70vw] text-center text-lg text-blue-600 tracking-tight">LOADING</p>
			<p class="2xl:max-w-[70vw] text-center font-light text-blue-400 tracking-tight">
				This shouldn't take more than a minute or so though.
			</p>
			<img
				class="w-full"
				alt="Funny loading GIF of child sat on chair bored while waiting for page to load"
				src="https://media.tenor.com/Y7ShQ_3hnn8AAAAd/me-waiting-for-my-friends-to-get-online.gif"
			/>
		</div>
	{:else}
		<!-- <p class="2xl:max-w-[70vw] text-left text-lg leading-9 tracking-wide" id="response">
            {spit}
        </p> -->
		<div class="2xl:max-w-[70vw] prose-sm md:prose-md lg:prose-lg prose-li:list-disc">
			{@html spit}
		</div>
	{/if}
</div>
