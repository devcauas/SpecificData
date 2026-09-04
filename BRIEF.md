# SpecificData — Brief de construção

Documento de especificação do blog. Serve como fonte única de verdade para a
construção do site. Ler por inteiro antes de escrever código.

---

## 1. Identidade

**Nome:** SpecificData
**Domínio:** specificdata.dev
**Autor:** Cauã Souza Almeida
**GitHub:** https://github.com/devcauas
**LinkedIn:** https://www.linkedin.com/in/cauã-souza-almeida-2a922b231

**Tagline:** IA aplicada, explicada a partir do que você já sabe.

**Posicionamento:** a maioria do conteúdo sobre IA e agentes explica tudo do zero,
como se fosse tecnologia sem ancestral. Não é. MCP é arquitetura cliente-servidor
com descoberta de capacidades — quem já consumiu uma REST API entende em cinco
minutos, desde que alguém faça a tradução. O blog faz essa tradução.

**Método (vale para todo post):** pegue o conceito novo, ancore num conceito que o
leitor já domina, mostre onde a analogia quebra. O terceiro passo é o que separa
este blog de um tutorial qualquer.

**Público:** dev que sabe programar, consome APIs no dia a dia e está perdido no
vocabulário de IA. Não é iniciante em programação, não é pesquisador de ML.

**Voz:** segunda pessoa, presente, frases curtas. Sem "neste artigo veremos".
Sem emoji em título. Código sempre completo e executável — nunca `...` no meio.

---

## 2. Arquitetura de informação

| Rota | Página | Função |
|---|---|---|
| `/` | Home | Posicionamento + série em andamento + últimos posts |
| `/blog` | Arquivo | Lista completa, filtro por categoria |
| `/blog/[slug]` | Post | O conteúdo |
| `/serie/[slug]` | Série | Todos os posts de uma série, em ordem |
| `/tag/[tag]` | Tag | Posts com aquela tag |
| `/sobre` | Sobre | Bio, stack, contato |

Geradas automaticamente: `/rss.xml`, `/sitemap-index.xml`, `/404`, imagem OG por post.

**Sem** paginação até passar de 30 posts. **Sem** busca até passar de 40. **Sem**
comentários, newsletter ou analytics invasivo na v1.

---

## 3. Modelo de conteúdo

Um post é um arquivo Markdown em `src/content/blog/<slug>.md`.

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(70),
      description: z.string().min(50).max(160), // vira meta description e card
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      category: z.enum(['mcp-agentes', 'apis-integracao', 'bastidores']),
      tags: z.array(z.string()).default([]),
      series: z
        .object({
          slug: z.string(),
          order: z.number().int().positive(),
        })
        .optional(),
      cover: image().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
```

**Categoria x tag x série** — a distinção que evita o caos no arquivo:

- **Categoria:** taxonomia fechada, uma por post, vira filtro e menu. Três, só.
  - `mcp-agentes` — MCP, Claude, agentes, tool use
  - `apis-integracao` — REST, OpenAPI, contratos, autenticação
  - `bastidores` — o que aprendi construindo, incluindo os erros
- **Tag:** livre, várias por post, alimenta "posts relacionados".
- **Série:** sequência ordenada. É o que dá ao leitor um caminho em vez de uma pilha.

**Derivado, nunca digitado:** tempo de leitura (calculado do corpo), slug (do nome
do arquivo), post anterior/próximo da série (calculado pelo `order`).

`draft: true` não entra no build de produção. Em `astro dev` aparece, com marcação
visual de rascunho.

---

## 4. Estrutura de pastas

```
specificdata/
├── CLAUDE.md
├── BRIEF.md                      ← este arquivo
├── astro.config.mjs
├── package.json
├── public/
│   └── fonts/                    ← woff2 auto-hospedados
├── src/
│   ├── content.config.ts
│   ├── content/
│   │   └── blog/
│   │       └── *.md
│   ├── data/
│   │   ├── site.ts               ← nome, url, autor, links sociais
│   │   ├── categories.ts         ← slug, label, descrição
│   │   └── series.ts             ← slug, título, descrição, status
│   ├── components/
│   │   ├── PostCard.astro
│   │   ├── SeriesNav.astro       ← anterior/próximo dentro da série
│   │   ├── CategoryFilter.astro
│   │   ├── Prose.astro           ← estilos do corpo do post
│   │   └── Head.astro            ← meta tags, OG, JSON-LD
│   ├── layouts/
│   │   ├── Base.astro
│   │   └── Post.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── sobre.astro
│   │   ├── rss.xml.ts
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── serie/[slug].astro
│   │   └── tag/[tag].astro
│   └── styles/
│       └── global.css            ← tokens + reset + tipografia
```

Nada de config espalhada por componente. Tudo que é dado do site vive em `src/data/`.

---

## 5. Especificação das páginas

### Home

Ordem dos blocos, de cima para baixo:

1. **Hero.** O nome do blog em tratamento tipográfico grande, a tagline e duas
   frases dizendo o que o leitor encontra. Sem foto, sem botão "leia mais",
   sem ilustração genérica.
2. **Série em andamento.** O bloco mais importante da home. Título da série,
   uma frase de descrição, e os posts numerados em lista vertical — publicados
   como link, os não publicados em cinza com o título já visível. Mostrar o que
   vem a seguir é o que faz o leitor voltar.
3. **Últimos posts.** Seis, em lista. Título, descrição, categoria, data.
4. **Sobre em uma linha** + links (GitHub, LinkedIn, RSS).

Com 3 posts publicados a home tem que parecer intencional, não vazia. Por isso a
série vem antes dos últimos posts: ela preenche com promessa, não com filler.

### Post

Cabeçalho com título, descrição, data e tempo de leitura. Se pertence a uma série:
uma barra acima do título com o nome da série e a posição (`MCP para quem já sabe
API · parte 2 de 6`), linkando para `/serie/[slug]`.

Corpo com largura máxima de 68 caracteres. Blocos de código podem sangrar até
a largura total do container — código respira mal em coluna estreita.

Rodapé do post: navegação anterior/próximo **dentro da série** (não cronológica —
em conteúdo sequencial, cronologia é ruído), tags, e link para o índice da série.

### Arquivo (`/blog`)

Título, contagem total, filtro por categoria em linha (`Todos 12 · MCP 6 · APIs 4
· Bastidores 2`). O filtro é HTML+CSS ou um punhado de JS — não vale um framework.

Lista agrupada por ano quando passar de 20 posts.

---

## 6. Direção visual

O tema do blog é **especificação**: contratos, schemas, o documento que define
como duas partes conversam. A referência visual não é blog de tecnologia — é
documento técnico bem tipografado.

O site de inspiração (datainaction.dev) é fundo escuro. Vamos para o oposto:
claro, alta legibilidade, densidade de documento. Diferencia e serve melhor a
texto longo.

**Tokens:**

```css
--paper:    #EFEFEA;   /* off-white neutro frio, não creme */
--ink:      #1C2321;   /* tinta profunda com fundo esverdeado, não preto */
--muted:    #5F6B66;   /* metadados, datas */
--rule:     #C9CCC4;   /* filetes e bordas */
--known:    #3D5A80;   /* azul — o que o leitor já sabe (API, REST) */
--new:      #7A3E6B;   /* ameixa — o que é novo (MCP, agentes) */
--code-bg:  #E4E5DF;
```

Os dois acentos são **semânticos, não decorativos**: azul marca o conceito
conhecido, ameixa marca o conceito novo. Diagramas de analogia usam esse par
consistentemente. Se um acento aparecer sem carregar esse significado, remova.

**Tipografia:**

- Corpo: **Source Serif 4** — desenhada para leitura em tela, e serifa em blog
  técnico é incomum o suficiente para ter personalidade. `line-height: 1.7`.
- Interface, títulos e rótulos: **IBM Plex Sans**.
- Código: **IBM Plex Mono**.

Plex tem origem em documentação de engenharia, o que casa com o tema. As três
auto-hospedadas em `public/fonts/`, `font-display: swap`, subset latin.

**Regras:**

- Alinhamento à esquerda em tudo. Nada centralizado exceto o container.
- Sem rótulo em caixa alta acima de título. Sem `→` colado em texto de link.
- Sem card com sombra. Separação por filete de 1px em `--rule`.
- Uma animação no site inteiro, no máximo. Provavelmente nenhuma.
- Foco de teclado visível, `prefers-reduced-motion` respeitado, contraste AA.

---

## 7. Conteúdo inicial

Nenhuma série definida ainda. `src/data/series.ts` exporta `series: []` —
a infraestrutura (campo `series` no schema, `src/pages/serie/[slug].astro`,
os helpers `getSeriesPosts`/`getSeriesRoster`/`getSeriesNeighbors` em
`src/lib/posts.ts`, o componente `SeriesNav.astro`) fica pronta pra quando a
primeira série for definida. Até lá, `/serie/[slug]` não gera nenhuma página e
o bloco de série da home não renderiza.

**Ritmo de publicação (vale pra qualquer série futura):** só publique o [N]
quando o [N+1] estiver em rascunho. Assim nunca falta próximo post no cano.

---

## 8. Plano de execução

Construir em fases. Cada fase termina com `npm run build` passando e o resultado
revisado no navegador antes de começar a próxima. Não pule para a fase seguinte
com a anterior meio pronta.

**Fase 1 — Fundação**
Projeto Astro com TypeScript strict. `content.config.ts` com o schema da seção 3.
`src/data/` preenchido. Tokens e fontes em `global.css`. Layout `Base.astro` com
`Head.astro` (meta, OG, JSON-LD do tipo `BlogPosting`).
*Pronto quando:* build passa e uma página em branco renderiza com a tipografia certa.

**Fase 2 — Post**
`Post.astro`, `Prose.astro`, `[slug].astro`, `SeriesNav.astro`. Realce de sintaxe
via Shiki (nativo do Astro) com tema claro combinando com a paleta.
*Pronto quando:* o post [1] da série renderiza completo e legível.

**Fase 3 — Listagens**
Home, `/blog` com filtro, `/serie/[slug]`, `/tag/[tag]`, `PostCard.astro`.
*Pronto quando:* navegar entre as páginas funciona sem link morto.

**Fase 4 — Distribuição**
`rss.xml`, sitemap, `robots.txt`, 404, imagem OG gerada por post
(`@vercel/og` ou `astro-og-canvas`).
*Pronto quando:* o link do post colado no LinkedIn mostra o preview correto.

**Fase 5 — Publicação**
Deploy no Cloudflare Pages, domínio, verificação de Lighthouse.
*Pronto quando:* está no ar em specificdata.dev.

---

## 9. Checklist de qualidade

Antes de considerar qualquer fase concluída:

- [ ] `npm run build` sem erro e sem warning
- [ ] Nenhum `console.log` ou TODO esquecido
- [ ] Responsivo a partir de 360px
- [ ] Todo link de navegação tem estado de foco visível
- [ ] Lighthouse: Performance 100, Accessibility 100, SEO 100
- [ ] Zero JavaScript enviado em página de post
- [ ] Contraste de texto mínimo 4.5:1 em toda combinação usada
