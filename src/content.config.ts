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
    audience: z.string().optional(),
    topic: z.string().optional(),
    country: z.string().optional(),
  }),
});

const teamCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/team" }),
  schema: z.object({
    /* ── Basic Info ── */
    name: z.string(),
    role: z.enum([
      'Coordenador Geral',
      'Pesquisador Sênior',
      'Pós-doc',
      'Doutorando',
      'Mestrando',
      'Iniciação Científica',
      'Engenheiro',
      'Colaborador Externo',
    ]),
    institution: z.string(),
    photo: z.string().optional(),
    stage: z.union([
      z.string(),
      z.array(z.string())
    ]).transform(val => Array.isArray(val) ? val : [val]).default(['Coordenação']),
    city: z.string().optional(),
    area: z.string().optional(),
    email: z.string().optional(),
    lattes: z.string().optional(),
    orcid: z.string().optional(),
    linkedin: z.string().optional(),
    researchgate: z.string().optional(),

    /* ── Trajectory ── */
    bio: z.string().optional(),
    interest_origin: z.string().optional(),
    motivation: z.string().optional(),
    years_researching: z.string().optional(),
    research_lines: z.string().optional(),
    memorable_experience: z.string().optional(),

    /* ── Current Research ── */
    project_title: z.string().optional(),
    project_description: z.string().optional(),
    project_problem: z.string().optional(),
    project_importance: z.string().optional(),
    project_methods: z.string().optional(),
    project_results: z.string().optional(),
    project_challenges: z.string().optional(),

    /* ── Outreach / Fun ── */
    explain_simple: z.string().optional(),
    biggest_curiosity: z.string().optional(),
    common_myth: z.string().optional(),
    impressive_discovery: z.string().optional(),
    career_advice: z.string().optional(),

    /* ── Publications ── */
    publications: z.array(z.object({
      title: z.string().optional(),
      authors: z.string().optional(),
      date: z.union([z.date(), z.string()]).optional(),
      link: z.string().optional(),
      summary: z.string().optional(),
    })).optional(),
    books_chapters: z.string().optional(),
    groups_labs: z.string().optional(),
    future_projects: z.string().optional(),

    /* ── Authorization ── */
    authorized: z.boolean().default(true),
    credit_name: z.string().optional(),
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
