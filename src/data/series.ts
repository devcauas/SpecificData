export type SeriesStatus = 'em-andamento' | 'completa';

export interface SeriesPlannedPost {
  order: number;
  title: string;
}

export interface Series {
  slug: string;
  title: string;
  description: string;
  status: SeriesStatus;
  /**
   * Roteiro completo da série (BRIEF §7), na ordem planejada. Existe
   * independente de já haver arquivo em src/content/blog — é o que permite
   * mostrar "o que vem a seguir" mesmo antes do post ser escrito.
   */
  posts: SeriesPlannedPost[];
}

export const series: Series[] = [
  {
    slug: 'mcp-para-quem-sabe-api',
    title: 'MCP para quem já sabe API',
    description:
      'Se você já consome REST API, você já entende a maior parte de MCP. Esta série faz a tradução, capacidade por capacidade, até o ponto onde a analogia quebra.',
    status: 'em-andamento',
    posts: [
      { order: 1, title: 'Se você entende REST, você já entende 80% de MCP' },
      { order: 2, title: 'Tools, Resources e Prompts: os três tipos de capacidade' },
      { order: 3, title: 'stdio vs HTTP: onde seu servidor MCP roda' },
      { order: 4, title: 'Seu primeiro MCP server em 40 linhas' },
      { order: 5, title: 'Plugando no Claude: o lado cliente' },
      { order: 6, title: 'Onde a analogia quebra' },
    ],
  },
];

export function getSeries(slug: string): Series {
  const found = series.find((s) => s.slug === slug);
  if (!found) throw new Error(`Série desconhecida: ${slug}`);
  return found;
}
