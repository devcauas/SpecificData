export type CategorySlug = 'mcp-agentes' | 'apis-integracao' | 'bastidores';

export interface Category {
  slug: CategorySlug;
  label: string;
  /** Rótulo curto usado no filtro do arquivo ("Todos 12 · MCP 6 · APIs 4 · Bastidores 2"). */
  shortLabel: string;
  description: string;
  /**
   * Acento semântico da categoria (CLAUDE.md / BRIEF §6): apis-integracao usa
   * --known (o que o leitor já sabe), mcp-agentes usa --new (o conceito novo),
   * bastidores fica neutro em --muted. Mesmo valor usado na barra de 3px do
   * PostCard e nos tiles da home — centralizado aqui para não divergir.
   */
  accent: string;
}

export const categories: Category[] = [
  {
    slug: 'mcp-agentes',
    label: 'MCP & Agentes',
    shortLabel: 'MCP',
    description: 'MCP, Claude, agentes, tool use.',
    accent: 'var(--new)',
  },
  {
    slug: 'apis-integracao',
    label: 'APIs & Integração',
    shortLabel: 'APIs',
    description: 'REST, OpenAPI, contratos, autenticação.',
    accent: 'var(--known)',
  },
  {
    slug: 'bastidores',
    label: 'Bastidores',
    shortLabel: 'Bastidores',
    description: 'O que aprendi construindo, incluindo os erros.',
    accent: 'var(--muted)',
  },
];

export function getCategory(slug: CategorySlug): Category {
  const category = categories.find((c) => c.slug === slug);
  if (!category) throw new Error(`Categoria desconhecida: ${slug}`);
  return category;
}
