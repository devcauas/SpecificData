import { getCollection, type CollectionEntry } from 'astro:content';
import type { Series } from '../data/series';

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

export interface SeriesRosterEntry {
  order: number;
  title: string;
  /** null quando ainda não há post publicado nesse lugar da série. */
  href: string | null;
  /** Só existe quando o post está publicado. */
  description: string | null;
}

/**
 * Roteiro completo da série (src/data/series.ts) cruzado com os arquivos
 * reais: cada posição vira link só se o post correspondente existe e está
 * publicado; caso contrário mostra o título planejado, sem link. Existe pra
 * a série aparecer inteira mesmo antes de todo post estar escrito.
 */
export async function getSeriesRoster(series: Series): Promise<SeriesRosterEntry[]> {
  const files = await getSeriesPosts(series.slug);

  return series.posts.map((planned) => {
    const file = files.find((f) => f.data.series?.order === planned.order);
    if (file && !file.data.draft) {
      return {
        order: planned.order,
        title: file.data.title,
        href: `/blog/${file.id}`,
        description: file.data.description,
      };
    }
    return {
      order: planned.order,
      title: file?.data.title ?? planned.title,
      href: null,
      description: null,
    };
  });
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

/** Forma URL-segura de uma tag: minúsculas, sem acento, espaço vira hífen. */
export function slugifyTag(tag: string): string {
  return tag
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export interface TagGroup {
  /** Forma usada na URL — única por grupo. */
  slug: string;
  /** Grafia original da tag, usada como rótulo. Vem do primeiro post encontrado. */
  tag: string;
  /** Posts de todas as tags que colidem nesse slug (ex.: "RAG" e "rag"), sem duplicar. */
  posts: Post[];
}

/**
 * Agrupa as tags dos posts visíveis pelo slug (lib/posts.ts:slugifyTag), não
 * pela grafia. Duas tags que só diferem em acento/maiúscula (ex.: "Busca
 * Vetorial" e "busca-vetorial") colidiriam na mesma URL /tag/<slug> — agrupar
 * aqui evita que getStaticPaths gere dois caminhos com o mesmo param, o que
 * quebraria o build.
 */
export async function getTagGroups(): Promise<TagGroup[]> {
  const posts = await getPublishedPosts();
  const groups = new Map<string, TagGroup>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = slugifyTag(tag);
      const group = groups.get(slug);
      if (group) {
        group.posts.push(post);
      } else {
        groups.set(slug, { slug, tag, posts: [post] });
      }
    }
  }

  return [...groups.values()].sort((a, b) => a.tag.localeCompare(b.tag, 'pt-BR'));
}

/** Tempo de leitura em minutos, ignorando blocos de código. */
export function getReadingTime(body: string): number {
  const withoutCodeBlocks = body.replace(/```[\s\S]*?```/g, '');
  const words = withoutCodeBlocks.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
