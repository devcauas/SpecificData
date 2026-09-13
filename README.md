# SpecificData

[specificdata.dev](https://specificdata.dev)

Blog sobre IA aplicada: explica conceitos novos a partir do que o desenvolvedor já domina, mostrando onde as analogias com APIs tradicionais funcionam e onde quebram.

## Stack

- [Astro](https://astro.build) `^5.1.0`, site estático (sem SSR, sem backend)
- Node `22` (ver `.node-version`)
- Integrações: `@astrojs/sitemap`, `@astrojs/rss`, `astro-og-canvas` (geração
  de imagens OG em `src/pages/og/`)
- Markdown processado com `rehype-slug`, `rehype-autolink-headings` e
  `rehype-external-links`
- Deploy: Cloudflare Workers servindo `./dist` como static assets
  (`wrangler.jsonc`), sem Worker script

## Comandos

```bash
npm install
npm run dev      # dev server, mostra drafts
npm run build    # build de produção, esconde drafts
npm run preview  # serve o build local
```

## Estrutura

```
src/
  content/blog/     # posts em Markdown
  pages/            # rotas (index, blog, tag, categoria, serie, og, rss.xml)
  components/       # componentes Astro
  layouts/          # layouts de página
  data/             # dados estruturados (ex.: séries)
  lib/              # utilitários
  styles/           # CSS global
  assets/covers/    # capas de post
public/             # estáticos servidos as-is (favicon, fonts, _headers, robots.txt)
```

Ver `CLAUDE.md` para convenções e `BRIEF.md` para a especificação completa.
