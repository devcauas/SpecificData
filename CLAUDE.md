# SpecificData

Blog técnico de Cauã Souza Almeida. Astro, site estático, sem backend.
A especificação completa está em `BRIEF.md` — leia antes de mudanças estruturais.

## O que este blog é

Explica IA aplicada partindo do que o dev já sabe. Todo post ancora o conceito
novo num conceito conhecido e depois mostra onde a analogia quebra.

## Convenções que não são óbvias pelo código

- **Categoria é enum fechado de três valores.** Adicionar uma quarta categoria é
  decisão editorial, não refactor. Pergunte antes.
- **Tag é livre, categoria não.** Não converta uma na outra.
- **Navegação de post segue a série, não a cronologia.** Em conteúdo sequencial,
  ordem de publicação é ruído.
- **Os dois acentos são semânticos.** `--known` (azul) marca o conceito que o
  leitor já domina; `--new` (ameixa) marca o conceito novo. Nunca use nenhum dos
  dois como decoração. Os acentos se estendem às categorias, mantendo o
  significado original: `apis-integracao` usa `--known`, `mcp-agentes` usa
  `--new`, `bastidores` fica neutro em `--muted`. Nenhum acento aparece fora
  desse mapeamento.
- **Zero JS em página de post.** Se uma feature exige JS no post, ela sai.
- **Card de post tem borda de 1px em `--ink` e fundo `--card`**, ligeiramente
  mais claro que o papel. Continua sem sombra e sem raio grande — a borda é o
  único delimitador. Sem rótulo em caixa alta, sem `→` colado em link — são os
  tells que o design foge de propósito.

## Escrita

- Segunda pessoa, presente, frases curtas.
- Sem "neste artigo veremos", sem emoji em título.
- Código sempre completo e executável. Nunca `...` no meio de um exemplo.
- `description` no frontmatter tem 50–160 caracteres — é meta description e card.

## Comandos

```bash
npm run dev      # dev server, mostra drafts
npm run build    # build de produção, esconde drafts
npm run preview  # serve o build local
```

## Ao criar um post

Arquivo em `src/content/blog/<slug>.md`. Preencher todo o frontmatter do schema
em `src/content.config.ts`. Se pertence a uma série, `series.slug` precisa existir
em `src/data/series.ts` e `series.order` não pode colidir com outro post.

- **Os posts são escritos por mim, não gerados.** Claude Code constrói o site,
  nunca redige conteúdo editorial. Arquivo de teste para validar layout usa
  prefixo `_` e é descartável.

## Capa de post (opcional)

- Arquivo em `src/assets/covers/<slug-da-imagem>.jpg` (ou `.png`/`.webp` —
  qualquer formato que o `image()` do Astro aceite).
- No frontmatter, `cover` é caminho relativo ao próprio arquivo `.md`, não à
  raiz do projeto: `cover: ../../assets/covers/<arquivo>.jpg`.
- **Proporção recomendada: 3:2** (ex.: 1200×800). O `PostCard` corta pra 3:2
  via CSS (`object-fit: cover`) não importa o que você mande, mas mandar
  perto de 3:2 evita corte feio no rosto/foco da imagem.
- Sem `cover` no frontmatter, o card renderiza só texto — não é erro, não
  precisa de imagem em todo post.

## Segurança

- Nunca usar `set:html`. Se parecer necessário, pergunte antes.
  - **Exceção única:** o JSON-LD em `Head.astro`. `<script type="application/ld+json">`
    só pode ser preenchido assim no Astro, e os dados vêm só do próprio site
    (`site.ts`, frontmatter dos posts), nunca de input externo. Obrigatório nesse
    caso: escapar todo caractere de abertura de tag do JSON para a sequência
    Unicode equivalente antes do `set:html` (ver `Head.astro`), porque
    `JSON.stringify` não faz esse escape sozinho e um valor com `</script>`
    quebraria a tag. Qualquer outro uso de `set:html` continua proibido — pergunte
    antes.
- Nenhum segredo no repositório, nem em exemplo de código de post.
- Link externo sempre com `rel="noopener noreferrer"`.
- Dependência nova precisa de justificativa — o site é estático e sem JS.