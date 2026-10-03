import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte()
  ],
  define: {
    __DEFAULT_CHAIN_ID__: JSON.stringify(process.env.VITE_DEFAULT_CHAIN_ID || "0x1"),
  },
})
