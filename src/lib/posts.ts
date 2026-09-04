import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

const WORDS_PER_MINUTE = 200;

function isVisible(post: Post): boolean {
  return import.meta.env.PROD ? !post.data.draft : true;
}

/** Posts visíveis no ambiente atual, ordenados por data decrescente. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', isVisible);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Todos os posts de uma série, ordenados por series.order. */
export async function getSeriesPosts(slug: string): Promise<Post[]> {
  const posts = await getCollection('blog', (post) => post.data.series?.slug === slug);
  return posts.sort((a, b) => a.data.series!.order - b.data.series!.order);
}

export interface SeriesNeighbors {
  prev: Post | null;
  next: Post | null;
  index: number;
  total: number;
}

/** Post anterior/próximo dentro da série do post informado, considerando só posts visíveis. */
export async function getSeriesNeighbors(post: Post): Promise<SeriesNeighbors | null> {
  if (!post.data.series) return null;

  const seriesPosts = (await getSeriesPosts(post.data.series.slug)).filter(isVisible);
  const index = seriesPosts.findIndex((p) => p.id === post.id);
  if (index === -1) return null;

  return {
    prev: index > 0 ? seriesPosts[index - 1] : null,
    next: index < seriesPosts.length - 1 ? seriesPosts[index + 1] : null,
    index: index + 1,
    total: seriesPosts.length,
  };
}

/** Tags únicas presentes nos posts visíveis, ordenadas alfabeticamente. */
export async function getAllTags(): Promise<string[]> {
  const posts = await getPublishedPosts();
  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.data.tags) tags.add(tag);
  }
  return [...tags].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/** Posts visíveis que carregam a tag informada, ordenados por data decrescente. */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.data.tags.includes(tag));
}

/** Tempo de leitura em minutos, ignorando blocos de código. */
export function getReadingTime(body: string): number {
  const withoutCodeBlocks = body.replace(/```[\s\S]*?```/g, '');
  const words = withoutCodeBlocks.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
