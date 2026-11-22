// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import { unified } from "@astrojs/markdown-remark";
import { remarkCountyFacts } from "./src/lib/remark-county-facts.mjs";

// Set `site` to the publication's production URL before deploying.
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    // MDX profiles inherit this processor, including the county facts plugin.
    processor: unified({ remarkPlugins: [remarkCountyFacts] }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
