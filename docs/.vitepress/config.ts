import { defineConfig } from "vitepress";

export default defineConfig({
  // ---------------------------------------------------------------
  // GLOBAL CONFIG
  // ---------------------------------------------------------------
  title: "KarinJS",
  description:
    "A Bun-native, module-less architecture framework built for speed, clarity, and developer velocity.",
  head: [["link", { rel: "icon", href: "/karin.png" }]],
  cleanUrls: true,

  themeConfig: {
    logo: "/karin.png",
    socialLinks: [
      { icon: "github", link: "https://github.com/jefjesuswt/karin-js" },
    ],
    search: {
      provider: "local",
    },
  },

  // ---------------------------------------------------------------
  // LOCALES
  // ---------------------------------------------------------------
  locales: {
    // =============================================================
    // ENGLISH (ROOT)
    // =============================================================
    root: {
      label: "English",
      lang: "en",

      themeConfig: {
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
            items: [{ text: "Guards (WIP)", link: "#" }],
          },
        ],

        footer: {
          message: "Released under the MIT License.",
          copyright: "© 2025 Jeffrey Jimenez",
        },
      },
    },

    // =============================================================
    // SPANISH
    // =============================================================
    es: {
      label: "Español",
      lang: "es",
      link: "/es/",

      themeConfig: {
        nav: [
          { text: "Inicio", link: "/es/" },
          { text: "Guía", link: "/es/introduction" },
          {
            text: "Changelog",
            link: "https://github.com/jefjesuswt/karin-js/blob/main/packages/core/CHANGELOG.md",
          },
        ],

        sidebar: [
          {
            text: "Introducción",
            items: [
              { text: "¿Qué es KarinJS?", link: "/es/introduction" },
              { text: "Primeros Pasos", link: "/es/getting-started" },
            ],
          },
          {
            text: "Conceptos Clave",
            items: [
              { text: "Controladores", link: "/es/controllers" },
              { text: "Servicios e ID", link: "/es/services" },
              { text: "Validación (Pipes)", link: "/es/pipes" },
              { text: "Manejo de Excepciones", link: "/es/exception-handling" },
            ],
          },
          {
            text: "Avanzado",
            collapsed: true,
            items: [{ text: "Guards", link: "/es/guards" }],
          },
        ],

        footer: {
          message: "Lanzado bajo la licencia MIT.",
          copyright: "© 2025 Jeffrey Jimenez",
        },

        // UI Labels
        docFooter: {
          prev: "Página anterior",
          next: "Página siguiente",
        },
        outline: {
          label: "En esta página",
        },
        lastUpdated: {
          text: "Actualizado hace",
        },
        darkModeSwitchLabel: "Apariencia",
        sidebarMenuLabel: "Menú",
        returnToTopLabel: "Volver arriba",
      },
    },
  },
});
