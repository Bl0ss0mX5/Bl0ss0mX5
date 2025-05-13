---
title: "PicoCTF Web Expoitation Writeup | WebDecode | Easy | PicoCTF"
description: ""
pubDate: "2025-05-09T10:02:41.000Z"
tags: ["easy", "ctf", "picoctf", "web", "easy-web", "easy-picoctf-web", "easy-picoctf", "picoctf-web"]
---

### PicoCTF Web Expoitation Writeup | WebDecode | Easy | PicoCTF


**Originally posted on <a href="https://medium.com/@bl0ss0mx5/picoctf-web-expoitation-writeup-webdecode-easy-picoctf-3ff6189bb4a3" target="_blank" rel="noopener noreferrer">my Medium page</a>.**

---

In this challenge, we’re asked to put our web inspection skills to the test. The goal is to explore the website using the browser’s developer tools and uncover the hidden flag. Let’s dive in and see what we can find!

![](https://cdn-images-1.medium.com/max/660/1*vb3NsYiCfurPi-8LBZJkTA.png)

After launching the challenge instance, we’re given a link to check out. By clicking on it, we get redirected to a simple website.

![](https://cdn-images-1.medium.com/max/1024/1*gDHNLXRUaDhiH_pSy-FdRg.png)

**Step 1:**  
Let’s start by viewing the page’s source code — press Ctrl + U or right-click → **View Page Source**.

![](https://cdn-images-1.medium.com/max/1024/1*3e6bP7B16huietYM8bZ1YA.png)

Here, we don’t see anything unusual except three links:

*   index.html
*   about.html
*   contact.html

Since we’re already on index.html, let’s head over to about.html.

![](https://cdn-images-1.medium.com/max/1024/1*JmQKRHpvPg1x_IsDB6wMzg.png)

**Step 2:**  
On the **about.html** page, we might be able to find something interesting.  
Let’s inspect the page using Ctrl + Shift + I or right-click → **Inspect**.

![](https://cdn-images-1.medium.com/max/1024/1*rBA1T0XmC4VFQDtN4hHveg.png)

While checking, we find a suspicious-looking string: **_cGljb0NURnt3ZWJfc3VjYzNzc2Z1bGx5X2QzYzBkZWRfZGYwZGE3Mjd9_**

**Step 3:**  
This string only contains letters and numbers, which is a strong sign it might be **Base64 encoded**.

Let’s head over to [**CyberChef**](https://gchq.github.io/CyberChef/) to decode it:

*   Open CyberChef
*   Paste the string in the input box.
*   Search for From Base64 and drag it into the recipe section.

![](https://cdn-images-1.medium.com/max/1024/1*vMMwIYbwTEXNm8F-pKB29w.png)

Yay! This is base64 encoded and the decoded string is **the flag**!!

> The flag is: picoCTF{web\_succ3ssfully\_d3c0ded\_df0da727}

---

📖 **Want more CTF and OSINT writeups like this? Check out <a href="https://medium.com/@bl0ss0mx5" target="_blank" rel="noopener noreferrer">my Medium page here</a>.**

---

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=3ff6189bb4a3)