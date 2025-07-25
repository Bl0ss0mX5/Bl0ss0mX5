import { z, defineCollection } from "astro:content";

// Blog schema (existing)
const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.string().optional(),
  heroImage: z.string().optional(),
  badge: z.string().optional(),
  tags: z
    .array(z.string())
    .refine(items => new Set(items).size === items.length, {
      message: "tags must be unique",
    })
    .optional(),
});

// Project schema (existing)
const projectSchema = z.object({
  title: z.string(),
  desc: z.string(),
  img: z.string(),
  url: z.string(),
  badge: z.string().optional(),
  pubDate: z.coerce.date(),
  tags: z.array(z.string()).optional(),
});

// 🔥 Research schema (new)
const researchSchema = z.object({
  title: z.string(),
  pubDate: z.coerce.date(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type BlogSchema = z.infer<typeof blogSchema>;
export type ProjectSchema = z.infer<typeof projectSchema>;
export type ResearchSchema = z.infer<typeof researchSchema>;

const blogCollection = defineCollection({ schema: blogSchema });
const projectCollection = defineCollection({ schema: projectSchema });
const researchCollection = defineCollection({ schema: researchSchema });

export const collections = {
  blog: blogCollection,
  projects: projectCollection,
  research: researchCollection, 
};
