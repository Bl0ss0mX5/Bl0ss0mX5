import Parser from 'rss-parser';
import TurndownService from 'turndown';
import fs from 'fs';
import path from 'path';

const parser = new Parser();
const turndownService = new TurndownService();

// Replace with your Medium username (without @)
const username = "bl0ss0mx5";
const feedUrl = `https://medium.com/feed/@${username}`;

async function importMediumPosts() {
  const feed = await parser.parseURL(feedUrl);

  feed.items.forEach((item) => {
    const slug = item.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    const markdownContent = turndownService.turndown(item['content:encoded']);

    const frontmatter = `---
title: "${item.title}"
description: "${item.contentSnippet?.slice(0, 160) || ''}"
pubDate: "${new Date(item.pubDate).toISOString()}"
heroImage: "/post_img.webp"
badge: "Medium"
tags: ["imported", "medium"]
layout: "../../layouts/BlogPostLayout.astro"
---

`;

    const finalContent = frontmatter + markdownContent;

    const filePath = path.join("src", "content", "blog", `${slug}.md`);
    fs.writeFileSync(filePath, finalContent, "utf8");
    console.log(`✅ Imported: ${item.title}`);
  });
}

importMediumPosts();
