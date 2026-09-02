import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const news = await getCollection('news', ({ data }) => data.published !== false);
  const sortedNews = news.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Telescópio BINGO — Notícias e Atualizações',
    description: 'Últimas notícias, comunicados e atualizações científicas do Radiotelescópio BINGO.',
    site: context.site ?? 'https://bingotelescope.org',
    items: sortedNews.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
      link: `/news/${post.id}/`,
      author: post.data.author || 'BINGO Team',
    })),
    customData: `<language>pt-BR</language>`,
  });
}
