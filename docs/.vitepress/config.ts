import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "KarinJS",
  description:
    "The enterprise-friendly, module-less backend framework built for Bun.",

  // Limpia las URLs (quita el .html)
  cleanUrls: true,

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    // Logo en la barra de navegación (opcional, si tienes uno)
    // logo: '/logo.png',

    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/introduction" },
      {
        text: "Changelog",
        link: "https://github.com/jefjesuswt/karin-js/blob/main/packages/core/CHANGELOG.md",
      },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "What is KarinJS?", link: "/introduction" },
          { text: "Getting Started", link: "/getting-started" },
        ],
      },
      {
        text: "Core Concepts",
        items: [
          { text: "Controllers", link: "/controllers" },
          { text: "Services & DI", link: "/services" },
          { text: "Validation (Pipes)", link: "/pipes" },
          { text: "Exception Handling", link: "/exception-handling" },
        ],
      },
      {
        text: "Advanced",
        collapsed: true,
        items: [
          // Aquí irán Guards e Interceptors cuando los terminemos de pulir
          { text: "Guards (WIP)", link: "#" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/jefjesuswt/karin-js" },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2025 Jeffrey Jimenez",
    },

    search: {
      provider: "local",
    },
  },
});
