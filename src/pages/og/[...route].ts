import { OGImageRoute } from 'astro-og-canvas';
import { getPublishedPosts } from '../../lib/posts';
import { site } from '../../data/site';

const posts = await getPublishedPosts();

const pages: Record<string, { title: string; description: string }> = {
  default: { title: site.name, description: site.tagline },
};

for (const post of posts) {
  pages[post.id] = { title: post.data.title, description: post.data.description };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    padding: 80,
    bgGradient: [[239, 239, 234]], // --paper
    border: { color: [201, 204, 196], width: 2, side: 'block-end' }, // --rule
    font: {
      title: {
        color: [28, 35, 33], // --ink
        size: 64,
        lineHeight: 1.25,
        families: ['IBM Plex Sans'],
        weight: 'Bold',
      },
      description: {
        color: [95, 107, 102], // --muted
        size: 32,
        lineHeight: 1.5,
        families: ['Source Serif 4'],
      },
    },
    fonts: [
      './public/fonts/ibm-plex-sans-variable.woff2',
      './public/fonts/source-serif-4-variable.woff2',
    ],
  }),
});
