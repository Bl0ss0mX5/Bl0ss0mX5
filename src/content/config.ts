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

// Store schema (existing)
const storeSchema = z.object({
  title: z.string(),
  description: z.string(),
  custom_link_label: z.string(),
  custom_link: z.string().optional(),
  updatedDate: z.coerce.date(),
  pricing: z.string().optional(),
  oldPricing: z.string().optional(),
  badge: z.string().optional(),
  checkoutUrl: z.string().optional(),
  heroImage: z.string().optional(),
});

// Project schema (existing)
const projectSchema = z.object({
  title: z.string(),
  desc: z.string(),
  img: z.string(),
  url: z.string(),
  badge: z.string().optional(),
  pubDate: z.coerce.date(),
  tags: z.array(z.string()).optional()
});

const writeupsSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.string().optional(),
  heroImage: z.string().optional(), // ✅ Not z.string()
  badge: z.string().optional(),
  tags: z
    .array(z.string())
    .refine((items) => new Set(items).size === items.length, {
      message: "tags must be unique",
    })
    .optional(),
});

export type BlogSchema = z.infer<typeof blogSchema>;
export type StoreSchema = z.infer<typeof storeSchema>;
export type ProjectSchema = z.infer<typeof projectSchema>;
export type WriteupSchema = z.infer<typeof writeupsSchema>;

const blogCollection = defineCollection({ schema: blogSchema });
const storeCollection = defineCollection({ schema: storeSchema });
const projectCollection = defineCollection({ schema: projectSchema });
const writeupCollection = defineCollection({ schema: writeupsSchema }); // ✅ new

export const collections = {
  blog: blogCollection,
  store: storeCollection,
  projects: projectCollection,
  writeups: writeupCollection, // ✅ registered
};
