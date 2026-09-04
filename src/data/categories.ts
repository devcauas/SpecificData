export type CategorySlug = 'mcp-agentes' | 'apis-integracao' | 'bastidores';

export interface Category {
  slug: CategorySlug;
  label: string;
  /** Rótulo curto usado no filtro do arquivo ("Todos 12 · MCP 6 · APIs 4 · Bastidores 2"). */
  shortLabel: string;
  description: string;
}

export const categories: Category[] = [
  {
    slug: 'mcp-agentes',
    label: 'MCP & Agentes',
    shortLabel: 'MCP',
    description: 'MCP, Claude, agentes, tool use.',
  },
  {
    slug: 'apis-integracao',
    label: 'APIs & Integração',
    shortLabel: 'APIs',
    description: 'REST, OpenAPI, contratos, autenticação.',
  },
  {
    slug: 'bastidores',
    label: 'Bastidores',
    shortLabel: 'Bastidores',
    description: 'O que aprendi construindo, incluindo os erros.',
  },
];

export function getCategory(slug: CategorySlug): Category {
  const category = categories.find((c) => c.slug === slug);
  if (!category) throw new Error(`Categoria desconhecida: ${slug}`);
  return category;
}
