---
title: "Se você entende REST, você já entende 80% de MCP"
description: "Post de teste para validar o CSS do corpo do artigo — títulos, listas, código, citação e tabela. Conteúdo descartável."
date: 2026-09-04
category: mcp-agentes
tags: ["teste", "layout"]
series:
  slug: mcp-para-quem-sabe-api
  order: 1
draft: true
featured: false
---

Este parágrafo existe só para testar a medida de linha, o `line-height` e o
espaçamento vertical do corpo do post. Ele precisa ser longo o suficiente para
quebrar em várias linhas dentro da coluna de 68 caracteres, para que dê para
ver como o texto se comporta numa coluna estreita ao lado de um bloco de
código que sangra até a borda do container. Nenhuma frase aqui carrega
conteúdo técnico real — é só massa de teste.

## Do endpoint à tool

Um heading de nível 2 marca uma seção nova. Ele deve vir em IBM Plex Sans, com
mais espaço acima do que abaixo — o título pertence ao parágrafo que vem
depois dele, não ao que veio antes. Passe o mouse (ou dê foco via teclado) no
título para ver a âncora aparecer à esquerda.

### O contrato de entrada

Um heading de nível 3 é um degrau abaixo. Aqui testamos código inline como
`response.status_code` dentro de uma frase normal, para conferir se o fundo
`--code-bg` aparece sem borda e sem atrapalhar a leitura.

Duas listas, para testar espaçamento e marcadores:

1. Primeiro passo do processo hipotético.
2. Segundo passo, um pouco mais longo só para ver a quebra de linha dentro do
   item da lista numerada.
3. Terceiro e último passo.

- Item solto de lista não ordenada.
- Outro item, só para ter mais de um.
- Terceiro item de teste.

Bloco de código em Python, completo e executável:

```python
def add(a: int, b: int) -> int:
    return a + b


print(add(2, 3))
```

Bloco de código em TypeScript, completo e executável:

```typescript
function add(a: number, b: number): number {
  return a + b;
}

console.log(add(2, 3));
```

> Uma citação curta só para testar o filete à esquerda em `--rule` e o
> recuo do texto citado.

Uma tabela pequena, sem zebra, só com filete de 1px separando as linhas:

| Conceito REST    | Conceito MCP     | Nota                          |
| ----------------- | ----------------- | ------------------------------ |
| Endpoint           | Tool               | Ambos são uma ação chamável   |
| OpenAPI            | Descoberta de tools | Ambos descrevem o contrato    |
| Cliente escolhe    | Modelo escolhe     | Aqui a analogia começa a quebrar |

Por fim, um link de teste para a [especificação do MCP](https://modelcontextprotocol.io),
só para conferir sublinhado e cor dentro do corpo do post.
