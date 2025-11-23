---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "KarinJS"
  text: "El Framework Empresarial para Bun"
  # "Sanity" se traduce mejor como algo lógico, intuitivo o sensato (en el sentido de 'common sense')
  tagline: Velocidad pura. Diseño pragmático.
  actions:
    - theme: brand
      text: Primeros Pasos
      link: /es/getting-started
    - theme: alt
      text: Ver en GitHub
      link: https://github.com/jefjesuswt/karin-js

features:
  - title: ⚡ Nativo para Bun
    details: Soporte nativo para el runtime de Bun. Sin parches (hacks), solo rendimiento crudo y arranques instantáneos.

  - title: 🗂️ Arquitectura Module-less
    details: Organiza por funcionalidades, no por módulos técnicos complejos. Escaneo automático de controladores y servicios.

  - title: 💉 Inyección de Dependencias
    details: Contenedor de DI robusto impulsado por tsyringe. Patrones familiares como @injectable y @singleton.

  - title: 🛡️ Tipado Estricto
    details: Escrito en TypeScript desde su base. Integración con Zod para validación estricta en tiempo de ejecución.
---
