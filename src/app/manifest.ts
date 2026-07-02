import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Projeto Praças",
    short_name: "Praças",
    description: "Sistema de acompanhamento e avaliação de praças",
    start_url: "/",
    display: "standalone",
    background_color: "##D9EAC6",
    theme_color: "#608E66",
    icons: [
      {
        src: "/favicon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/favicon/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
