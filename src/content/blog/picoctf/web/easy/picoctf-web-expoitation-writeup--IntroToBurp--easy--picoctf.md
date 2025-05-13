---
title: "PicoCTF Web Expoitation Writeup | IntroToBurp | Easy | PicoCTF"
description: ""
pubDate: "2025-05-09T10:02:41.000Z"
tags: ["easy", "ctf", "picoctf", "web", "easy-web", "easy-picoctf-web", "easy-picoctf", "picoctf-web"]
---

### PicoCTF Web Expoitation Writeup | IntroToBurp | Easy | PicoCTF


**Originally posted on <a href="https://medium.com/@bl0ss0mx5/picogym-web-exploitation-writeup-introtoburp-easy-picoctf-5e2d55d14b1a" target="_blank" rel="noopener noreferrer">my Medium page</a>.**

---

In this challenge, we’re introduced to using Burp Suite, a powerful tool for intercepting and analyzing web traffic between your browser and a server. Our goal is to interact with a website, capture the HTTP requests, and look for hidden information or flags within them.

*Let’s fire up Burp Suite and hunt down that flag!*

## 🔧 What is Burp Suite?
__Burp Suite__ is an integrated platform for web application security testing. It works as an intercepting proxy that sits between your browser and the internet, allowing you to view, modify, and forward HTTP/HTTPS requests and responses.

It’s widely used for:

- Capturing and analyzing web traffic
- Intercepting and modifying requests
- Testing web application vulnerabilities
and much more.

## 📖 How to Open and Set Up Burp Suite:
I’m using __Firefox__ with __FoxyProxy__ installed for easier proxy management. Here’s how I set it up:

1. Open Burp Suite on your system.
2. Go to Proxy → Options and note the proxy listener settings (default is 127.0.0.1:8080).
3. In Firefox, open FoxyProxy and add a new proxy:
  - Proxy Type: HTTP
  - IP Address: 127.0.0.1
  - Port: 8080
Save and enable this proxy.


  ![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*EanZQT7ga7m3r2IrPLFDgw.png)

4. Now, when you browse the target website, Burp Suite will capture the requests.

## 🕵️‍♂️ Walkthrough:

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*zxnvJKg1JnxCEjj-gtR4Ew.png)

After launching the challenge instance, we’re given a link. Clicking on it opens the target website.

Since this challenge is about using Burp Suite, enable FoxyProxy to route the browser traffic through Burp.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*BWDxblV92t2tz-5MEDrShw.png)

Now we can see the HTTP request for the page appear in Burp Suite → Proxy → HTTP history.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*rzSm95TpssfszNaSGb3WXA.png)

On the website, head to the registration page and fill in all the fields with random data.

![](https://miro.medium.com/v2/resize:fit:580/format:webp/1*_1VdMQNSuIomLZgy9QdaWQ.png)

After clicking Register, the site asks for an OTP (One Time Password).

![](https://miro.medium.com/v2/resize:fit:520/format:webp/1*C-Wuq0r87EtiO7x6AMVEBQ.png)

Let’s enter any random value for the OTP and click Submit. An “invalid” message appears — this is where the fun starts.

![](https://miro.medium.com/v2/resize:fit:370/format:webp/1*xgDMKUQo8ZxFCIDk4UbDDQ.png)

Go to Burp Suite → HTTP History and find the submit request we just sent.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*Zg2qQvDzfbKmDYM70s7s8A.png)

Right-click the request and choose Send to Repeater (or press Ctrl + R).

```
📌 What is Burp Repeater?

Burp Repeater is a feature in Burp Suite that allows you to manually modify and resend HTTP requests to the server and observe the responses. It’s perfect for testing different payloads, parameters, or making adjustments to see how the server responds — without having to reload the page or interact with the website directly.
```
![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*9VeIhnWo4b_QK2fj2kyhkw.png)

In the Repeater tab, notice

 - The request method is POST.
 - The OTP value is being sent in the request body (not in the URL since it’s a POST request).
Since we don’t have the correct OTP, why not see what happens if we simply delete the otp parameter entirely?

Remove the line containing the otp field from the request body.

```
Important:
⚠️ After removing the line, make sure there are two empty lines at the bottom of the request before sending it.
This is necessary because, in HTTP protocol, an empty line indicates the end of headers (or body for certain requests). If you don’t leave those, the server might not process the request correctly.
```
Click Send.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*MLhLHsEHhYa4_-iyXqBGEQ.png)

Woah — the server responds with the flag!

```
The flag: picoCTF{#0TP_Bypvss_SuCc3$S_3e3ddc76}
```


---

📖 **Want more CTF and OSINT writeups like this? Check out <a href="https://medium.com/@bl0ss0mx5" target="_blank" rel="noopener noreferrer">my Medium page here</a>.**

---

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=3ff6189bb4a3)