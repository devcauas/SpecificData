export type SeriesStatus = 'em-andamento' | 'completa';

export interface Series {
  slug: string;
  title: string;
  description: string;
  status: SeriesStatus;
}

export const series: Series[] = [
  {
    slug: 'mcp-para-quem-sabe-api',
    title: 'MCP para quem já sabe API',
    description:
      'Se você já consome REST API, você já entende a maior parte de MCP. Esta série faz a tradução, capacidade por capacidade, até o ponto onde a analogia quebra.',
    status: 'em-andamento',
  },
];

export function getSeries(slug: string): Series {
  const found = series.find((s) => s.slug === slug);
  if (!found) throw new Error(`Série desconhecida: ${slug}`);
  return found;
}
