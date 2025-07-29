---
title: "WWCTF 2025 — The Needle"
description: ""
pubDate: "2025-07-29"
tags: ["wwctf", "writeup", "web", "ctf", "the-needle"]
---

WWCTF 2025 — The Needle
=======================


![Bl0ss0mX5](https://miro.medium.com/v2/resize:fill:64:64/1*1x4owoOKdhRD7FXEzE-SjQ.jpeg)


Hack, solve, and conquer — a CTF designed to challenge minds of all levels.

**The Needle — A Tale of Burp, Blindness, and Brute-Force Brilliance**
---------------------

They said, _“It’s just a beginner challenge.”_  
I said, _“Cool. Let me just interrogate your database..”_
![alt text](https://miro.medium.com/v2/resize:fit:640/format:webp/1*TEC-ZiwxCFad4eca3aWV_A.png)

---

**The Mysterious Portal**
-------------------------

One day, in the dim glow of my terminal, I stumbled upon a suspiciously innocent-looking webpage 😯

There it was:  
A _search box_.  
A button.  
And a message that mocked me with every keystroke:  
_“Can you find the needle?”_ 😶‍🌫️

![alt text](https://miro.medium.com/v2/resize:fit:640/format:webp/1*Ncwi2M3GNONE6eeL5E0nUw.png)

A lie.  
A riddle.  
A **trap** 💀.

So naturally, I did what any responsible cybersecurity enthusiast would do: 😎

🕵️‍♂️ I **inspected the source code**.

---

🎥 **The Smoking Gun (PHP edition)**
------------------------------------

<pre>
if(isset($_GET['id'])) {  
            @$searchQ = $_GET['id'];  
            @$sql = "SELECT information FROM info WHERE id = '$searchQ'";  
            @$result = mysqli_query($conn, $sql);  
            @$row_count = mysqli_num_rows($result);  
              
            if ($row_count > 0) {  
                echo "Yes, We found it !!";  
            } else {  
                echo "Nothing here";  
            }  
            $conn->close();  
        }
</pre>

💀 _The ‘@’ signs were trying to hush the errors, but they couldn’t silence the truth…_

There it was: raw, vulnerable **SQL Injection**, ripe for exploitation.

Time to go full **Matrix Mode**😈

![gif](https://miro.medium.com/v2/resize:fit:640/format:webp/0*L7qrLlX7YGHGzrFA.gif)

---

🎯**First Blood — The Injection Begins**
----------------------------------------

I whispered to the search box:

<pre>
?id=1' OR '1'='1
</pre>

And it replied, like an obedient pet:

> _✅ Yes, We found it !!_

🕳️ **We were in.**

But then…

No output.  
No data.  
Just that **same boring message**😬

> _It’s like finding the treasure chest but the loot inside says: “LOL. Just kidding.” 😐_

So what now?

![gif](image.png)

---

🕶️ **Welcome to Blind Town**
-----------------------------

I cracked my knuckles.  
Blind SQL Injection, huh?

I turned to my old friend — **Burp Suite** 🤓.

![burpsuite logo](https://miro.medium.com/v2/resize:fit:600/format:webp/0*gkA2VcpNvDud0xaN)

_Together, we’ve broken tougher firewalls and spilled more secrets than a reality show contestant._

It was time to **brute-force the truth**, **one character at a time**.

---

⚔️ **The Interrogation Begins**
-------------------------------

The plan:  
_Torture the database… politely._

I constructed the ultimate query:
<pre>
?id=1' AND SUBSTRING((SELECT information FROM info LIMIT 1), 1, 1) = 'w' -- </pre>

If the first character was ‘w’, the page would say:

> _✅ Yes, We found it !!_

If wrong:

> _❌ “Nothing here”_

🎩 I set up Burp Intruder:
----

*   **Position**: Replaced `'w'` with a wildcard: `§A§`
*   **Mode**: _Sniper_ (no actual snipers were harmed)
*   **Payload**: A–Z, a–z, 0–9, symbols
*   **Grep Match**: `"Yes, We found it !!"`

![burp](https://miro.medium.com/v2/resize:fit:720/format:webp/1*KCFiU4v2bkb6I1YCZ1D5Xw.png)

I hit **“Start Attack”**, sat back, and watched as Burp **brutally guessed each character**.

![gif](https://miro.medium.com/v2/resize:fit:640/format:webp/0*XCF-ZCwhwIVFkXIM.gif)

Letter by letter, pixel by pixel, **the flag emerged from the shadows**.

---

🚨 **The Flag Rises**
---------------------

After minutes of delicious digital interrogation, the secret was finally unveiled:
<pre>
wwf{s1mpl3_***}
</pre>
(No spoilers here, let the thrill of discovery be yours😜)

---

**Epilogue: Lessons from the Needle**
-------------------------------------

*   Never trust a quiet PHP script.
*   If there’s no output, look for a side-channel.
*   Burp Suite is not just a tool — it’s a lifestyle.
*   Brute-forcing may be noisy, but truth has a way of **screaming back**.

> _This Summer:_ The Needle: Burp Protocol

![gif](https://miro.medium.com/v2/resize:fit:640/format:webp/0*abDOG6JAzDm-OEZm.gif)

You can check out more of my work here:

*   🔗 **GitHub:** [github.com/Bl0ss0mX5](https://github.com/Bl0ss0mX5)
*   📝 **Medium** [medium.com/@bl0ss0mx5](https://medium.com/@bl0ss0mx5)