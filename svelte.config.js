// Build setup added to render the exported kb; the export itself came without one.
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'], layout: { runbook } })],
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', strict: false }),
    alias: { '#lib': 'src/lib', '#lib/*': 'src/lib/*' },
    prerender: { entries: ['/kb', '/kb/incidents/4471', '/kb/incidents/4471-split', '/kb/triage/dedupe', '/kb/decisions/0001-dedupe-by-subject'], handleHttpError: 'warn' },
  },
};
