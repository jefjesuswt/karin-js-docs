// docs/.vitepress/theme/index.ts
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // Aquí podríamos inyectar slots si quisiéramos meter componentes custom
      // antes o después del contenido, pero por ahora con CSS basta.
    });
  },
  enhanceApp({ app, router, siteData }) {
    // ...
  },
} satisfies Theme;
