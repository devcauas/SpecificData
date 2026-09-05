// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import githubLightHighContrast from '@shikijs/themes/github-light-high-contrast';

// O tema padrão do Shiki é calibrado pra fundo branco; nosso .astro-code usa
// --code-bg (#E4E5DF), mais escuro. github-light-high-contrast já resolve a
// maioria das cores de token pra AA (4.5:1) contra esse fundo — só a cor de
// comentário ainda ficava em 3.98:1, corrigida aqui pra 4.61:1.
const codeTheme = structuredClone(githubLightHighContrast);
for (const rule of codeTheme.settings ?? codeTheme.tokenColors ?? []) {
  if (rule.settings?.foreground === '#66707b') {
    rule.settings.foreground = '#5c6671';
  }
}

// https://astro.build/config
export default defineConfig({
  // O domínio specificdata.dev ainda não foi registrado — o site está servido
  // em specificdata.cauaalmeida2005.workers.dev. Volte para specificdata.dev
  // quando/se o domínio próprio for registrado e apontado pro deploy.
  site: 'https://specificdata.cauaalmeida2005.workers.dev',
  build: {
    // CSS por página é pequeno o bastante pra virar <style> inline e eliminar
    // a requisição bloqueante de render.
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      // imagens OG são endpoints binários, não páginas — não pertencem ao sitemap
      filter: (page) => !page.includes('/og/'),
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: codeTheme,
      wrap: false,
    },
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          properties: {
            className: ['heading-anchor'],
            ariaHidden: 'true',
            tabIndex: -1,
          },
          content: { type: 'text', value: '#' },
        },
      ],
      [rehypeExternalLinks, { rel: ['noopener', 'noreferrer'] }],
    ],
  },
});
