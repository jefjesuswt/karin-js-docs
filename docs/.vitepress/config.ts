import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // Configuración Global (Compartida)
  title: "KarinJS",
  description:
    "The enterprise-friendly, module-less backend framework built for Bun.",
  head: [["link", { rel: "icon", href: "/karin.png" }]],
  cleanUrls: true,

  // Configuración compartida del tema (Logo, buscador, social)
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
  // CONFIGURACIÓN DE IDIOMAS (Locales)
  // ---------------------------------------------------------------
  locales: {
    // 1. Configuración para Inglés (Raíz)
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
            items: [
              { text: "Guards (WIP)", link: "#" }, // En inglés sigue WIP
            ],
          },
        ],
        footer: {
          message: "Released under the MIT License.",
          copyright: "Copyright © 2025 Jeffrey Jimenez",
        },
      },
    },

    // 2. Configuración para Español (/es/)
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
            items: [
              { text: "Guards", link: "/es/guards" }, // Aquí sí enlazamos el archivo traducido
            ],
          },
        ],
        footer: {
          message: "Lanzado bajo la licencia MIT.",
          copyright: "Copyright © 2025 Jeffrey Jimenez",
        },
        // Traducción de etiquetas de la interfaz
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
