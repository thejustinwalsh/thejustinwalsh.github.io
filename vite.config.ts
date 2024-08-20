import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { insertHtml, h } from "vite-plugin-insert-html";
import { VitePWA } from "vite-plugin-pwa";
import { siteMetadata } from "./site-data.json";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        "404": resolve(__dirname, "404.html"),
        xr: resolve(__dirname, "xr.html"),
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["/icons/*png"],

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: siteMetadata.title,
        short_name: siteMetadata.shortName,
        description: siteMetadata.description,
        theme_color: siteMetadata.themeColor,
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff,woff2,json}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },

      devOptions: {
        enabled: false,
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
    }),
    insertHtml({
      head: [
        h("title", {}, siteMetadata.title),
        h("meta", { name: "description", content: siteMetadata.description }),
        h("meta", { property: "og:title", content: siteMetadata.title }),
        h("meta", { property: "og:description", content: siteMetadata.description }),
        h("meta", { property: "og:url", content: siteMetadata.siteUrl }),
        h("meta", { property: "og:image", content: siteMetadata.image }),
        h("meta", { name: "twitter:title", content: siteMetadata.title }),
        h("meta", { name: "twitter:description", content: siteMetadata.description }),
        h("meta", { property: "twitter:url", content: siteMetadata.siteUrl }),
        h("meta", { property: "twitter:domain", content: siteMetadata.siteUrl }),
        h("meta", { property: "twitter:creator", content: siteMetadata.author }),
        h("meta", { name: "twitter:card", content: "summary" }),
        h("meta", { name: "twitter:image", content: siteMetadata.image }),
        h("meta", { name: "msapplication-TileColor", content: siteMetadata.themeColor }),
      ],
    }),
  ],
});
