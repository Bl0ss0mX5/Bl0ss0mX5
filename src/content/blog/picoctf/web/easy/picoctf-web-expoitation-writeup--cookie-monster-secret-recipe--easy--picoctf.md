---
title: "PicoCTF Web Expoitation Writeup | Cookie Monster Secret Recipe | Easy | PicoCTF"
description: ""
pubDate: "2025-05-09T09:32:37.000Z"
tags: ["easy", "ctf", "picoctf", "web", "easy-web", "easy-picoctf-web", "easy-picoctf", "picoctf-web"]
---

### PicoCTF Web Expoitation Writeup | Cookie Monster Secret Recipe | Easy | PicoCTF


**Originally posted on <a href="https://medium.com/@bl0ss0mx5/picoctf-web-expoitation-writeup-cookie-monster-secret-recipe-easy-picoctf-c611aed73cb9" target="_blank" rel="noopener noreferrer">my Medium page</a>.**

---

In this challenge, we’re tasked with finding Cookie Monster’s secret recipe hidden somewhere on his website. Let’s investigate and uncover the hidden flag!

![](https://cdn-images-1.medium.com/max/659/1*KmXnGwXIik0Xq20VMATQ2Q.png)

By clicking on the challenge link, we’re redirected to a website titled **Cookie Monster’s Secret Recipe**.

![](https://cdn-images-1.medium.com/max/584/1*7L5TFfnzJNxsyJ0Cwj6hmQ.png)

Since the challenge hints at a _“cookie recipe,”_ it made sense to check if the website was using any actual **cookies**. Sometimes CTF challenges love hiding clues inside HTTP cookies, so let’s explore that possibility.

### 🔍 Inspecting the Webpage:

Open the browser’s developer tools by pressing Ctrl + Shift + I (or right-click → **Inspect**).  
Now, navigate to the **Application** tab → **Cookies** section.

![](https://cdn-images-1.medium.com/max/963/1*7LY00TMmFc32tlZ5f9QUPA.png)

And there it is — we spot a cookie value:

> cGljb0NURntjMDBrMWVfbTBuc3Rlcl9sMHZlc19jMDBraWVzXzc3MUQ1RUIwfQ%3D%3D

### 🍳 Decoding the Cookie:

Notice the %3D at the end? That’s a URL-encoded = sign. This indicates the entire string might be **URL-encoded**.

**Step 1:** Use [CyberChef](https://gchq.github.io/CyberChef/) — an awesome tool for encoding/decoding.

![](https://cdn-images-1.medium.com/max/1024/1*3Gn2EIBTx99dSmUHrQDHRg.png)

*   Search for URL Decode in the operations tab and drag it into the recipe section.
*   Paste the cookie value in the input box.

![](https://cdn-images-1.medium.com/max/1024/1*yD_wGO0vHBw5vUMhgfxKmw.png)

Now we get: _cGljb0NURntjMDBrMWVfbTBuc3Rlcl9sMHZlc19jMDBraWVzXzc3MUQ1RUIwfQ==_

**Step 2:** Notice the == at the end? That’s a classic hint for **Base64 encoding**.

*   In CyberChef, search for From Base64 and drag it below the previous operation.

![](https://cdn-images-1.medium.com/max/1024/1*mSljovU0RQ_jmfHsLov1gQ.png)

The output reveals our flag.

> The flag is: **picoCTF{c00k1e\_m0nster\_l0ves\_c00kies\_771D5EB0}**

---

📖 **Want more CTF and OSINT writeups like this? Check out <a href="https://medium.com/@bl0ss0mx5" target="_blank" rel="noopener noreferrer">my Medium page here</a>.**

---

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=c611aed73cb9)