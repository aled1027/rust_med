import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import Icons from 'unplugin-icons/vite';


export default defineConfig({
  plugins: [
    sveltekit(),
    Icons({
      compiler: 'svelte',   // ensures the plugin generates Svelte components
      // optional: autoInstall: true,
      // optional: scale, defaultStyle, defaultClass, iconCustomizer, etc.
    }),],
});
