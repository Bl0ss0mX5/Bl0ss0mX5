---
title: "TryHackMe Hackfinity Battle 2025: Task7 — Catch Me If You Can 2 | OSINT"
description: ""
pubDate: "2025-03-25T19:02:07.000Z"
tags: ["osint", "ctf", "hackfinity", "tryhackme"]
---

### TryHackMe Hackfinity Battle 2025: Task7 — Catch Me If You Can 2 | OSINT | CTF Writeup


**Originally posted on <a href="https://medium.com/@bl0ss0mx5/tryhackme-hackfinity-battle-2025-task7-catch-me-if-you-can-2-osint-ctf-writeup-c2c124cf9699" target="_blank" rel="noopener noreferrer">my Medium page</a>.**

---

### The Challenge

![](https://cdn-images-1.medium.com/max/720/1*JTqNcNX-8AlGR7gPw3CQhw.jpeg)

The task file is given below

![](https://cdn-images-1.medium.com/max/720/1*Ql9_36POoqjlPJ8fF4gBrQ.jpeg)

### Analyzing the Image

To begin, I closely examined the picture. To speed up my investigation, I performed a **reverse image search on Google**. This method helped me identify discrepancies between the challenge image and publicly available versions.

![](https://cdn-images-1.medium.com/max/1024/1*PcNV1QSRjfK5BuTa9dJwsQ.png)

After carefully inspecting the results, I noticed **one key difference** — something inside a **box** stood out. This was likely the cipher text embedded in the image.

![](https://cdn-images-1.medium.com/max/426/1*WoY9gb5E9i2DSxn-R2ACGg.png)

### Identifying the Cipher

To determine what type of cipher was used, I searched for the extracted text on Google.

![](https://cdn-images-1.medium.com/max/225/1*XU-WFpvZtEPEEIC9q0aSPA.png)

This led me to a **known cipher format — pigpen** that helped me decode the hidden message. After running it through a decoder (planetcalc)

![](https://cdn-images-1.medium.com/max/636/1*ZgdF_4R_qPrRsMLWiaAyyg.png)

I got the phrase as “MEET AT TORII PORTAL”.

So the place is **“TORII PORTAL”**

### Extracting the Flag

Since **CTF flags** typically follow a structured format, I deduced that the flag must incorporate the keyword “**torii portal**” in some way. Following the **TryHackMe flag format**, I submitted:

> THM{torii\_portal}

And voilà! The flag was accepted, confirming the solution.

---

📖 **Want more CTF and OSINT writeups like this? Check out <a href="https://medium.com/@bl0ss0mx5" target="_blank" rel="noopener noreferrer">my Medium page here</a>.**

---

### Key Takeaways

*   **Reverse image search** is a powerful tool for identifying differences in challenge images.
*   Recognizing **common cipher patterns** can significantly speed up the decoding process.

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=c2c124cf9699)
