import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import nodeResolve from '@rollup/plugin-node-resolve';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// rollupOptions: {
		//   external: [
		// 	"node:markdown-it",
		// 	"node:sanitize-html",
		//   ]
		// }
		build: {
			// Add the rollup plugin to the build configuration
			rollupOptions: {
			  plugins: [
				nodeResolve(),
			  ],
			},
		  },
	}
});
