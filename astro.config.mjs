import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import preact from "@astrojs/preact";
import markdownIntegration from '@astropub/md'

// https://astro.build/config
export default defineConfig({
    markdown: {
        drafts: true
    },
    integrations: [mdx({
        drafts: true
    }), preact(), markdownIntegration()]
});