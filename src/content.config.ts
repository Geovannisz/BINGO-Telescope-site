import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const newsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string().default('BINGO Team'),
    image: z.string().optional(),
    summary: z.string(),
  }),
});

const teamCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/team" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    institution: z.string(),
    photo: z.string().optional(),
    bio: z.string().optional(),
    category: z.string().default('Pesquisador'),
  }),
});

const publicationsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/publications" }),
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    date: z.date(),
    link: z.string().optional(),
    summary: z.string().optional(),
  }),
});

export const collections = {
  'news': newsCollection,
  'team': teamCollection,
  'publications': publicationsCollection,
};
