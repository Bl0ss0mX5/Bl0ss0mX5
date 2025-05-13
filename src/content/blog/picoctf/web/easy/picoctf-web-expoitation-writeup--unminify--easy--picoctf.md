---
title: "PicoCTF Web Expoitation Writeup | Unminify | Easy | PicoCTF"
description: ""
pubDate: "2025-05-09T10:02:41.000Z"
tags: ["easy", "ctf", "picoctf", "web", "easy-web", "easy-picoctf-web", "easy-picoctf", "picoctf-web"]
---

### PicoCTF Web Expoitation Writeup | Unminify | Easy | PicoCTF


**Originally posted on <a href="https://medium.com/@bl0ss0mx5/picogym-web-exploitation-writeup-unminify-easy-picoctf-310bfdf5d922" target="_blank" rel="noopener noreferrer">my Medium page</a>.**

---

In this challenge, we’re presented with a website where the source code has been minified (squished into a single line) to make it harder to read. Our task is to inspect the page, carefully go through the compressed code, and uncover the hidden flag. Let’s jump in and see what we can find!

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*cgh-9vrKx1xdYaB4gcFKhQ.png)

**Walkthrough:**

After launching the challenge instance, we get a link to a website.
Click on it to open the page.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*5SfRr1Ry55VprGqc7zt7sw.png)

Since the description mentions that the source code is minified, let’s take a look at it.

**Step 1:**  
Press *Ctrl + U* to view the page source.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*udUr4XD9gPvAtTMZk-AyVQ.png)

**Step 2:**
To make the long line of code easier to read, turn on **Line Wrap** in your browser’s source view.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*eH21iaQuMFdGYDoFoaTECQ.png)

**Step 3:**
Now, let’s search for the flag. Since PicoCTF flags always follow the format *picoCTF{}*, we can search for picoCTF.

Press *Ctrl + F*, type *picoCTF* in the search box, and look through the matches.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*AB50WhhLKUegxt6g9ciMEQ.png)

**Step 4:**
On the **12th match**, we find our flag!

The flag is: **picoCTF{pr3tty_c0d3_51d374f0}**

---

📖 **Want more CTF and OSINT writeups like this? Check out <a href="https://medium.com/@bl0ss0mx5" target="_blank" rel="noopener noreferrer">my Medium page here</a>.**

---

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=3ff6189bb4a3)