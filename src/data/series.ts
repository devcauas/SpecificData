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

// Nenhuma série definida ainda — ver BRIEF.md §7. A infraestrutura (schema,
// getSeriesPosts/getSeriesRoster/getSeriesNeighbors, SeriesNav) fica pronta
// pra quando a primeira série real for criada.
export const series: Series[] = [];

export function getSeries(slug: string): Series {
  const found = series.find((s) => s.slug === slug);
  if (!found) throw new Error(`Série desconhecida: ${slug}`);
  return found;
}
