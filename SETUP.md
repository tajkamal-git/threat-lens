# ThreatLens — Splunk Connection Setup

This guide is calibrated to your confirmed Splunk environment:

```
index       = main
sourcetype  = WinEventLog:Security
Splunk Web  = http://localhost:8000
License     = Free
Auth method = Username + Password
```

> **Why username/password instead of a token:** Splunk's token authentication
> (Settings → Tokens) requires a licensed or trial Enterprise install. The
> Free license does not expose that menu. ThreatLens's backend already
> supports both — when `SPLUNK_TOKEN` is left empty, it automatically falls
> back to HTTP Basic Auth using `SPLUNK_USERNAME` + `SPLUNK_PASSWORD`. No code
> changes are needed for this path.

---

## 1. Set a Splunk password you're comfortable putting in an env var

You shared a password in a previous chat message — please change it now:

`http://localhost:8000` → username (top right) → **Change Password**

Since Free license has a single `admin` user with no role restrictions, this
account will have full access to ThreatLens's read queries. Keep the env var
private — never commit it to Git, never paste it in chat again.

---

## 2. Expose Splunk to the internet (required — Vercel cannot reach `localhost`)

Pick one:

### Option A — Cloudflare Tunnel (recommended, permanent, free)

```bash
winget install Cloudflare.cloudflared
cloudflared tunnel --url https://localhost:8089
```

You'll get a URL like:
```
https://random-words-here.trycloudflare.com
```
This becomes your `SPLUNK_BASE_URL`. No port number needed.

### Option B — Ngrok (quick, temporary)

```bash
ngrok tcp 8089
```

You'll get:
```
Forwarding  tcp://4.tcp.ngrok.io:14523 -> localhost:8089
```
Your `SPLUNK_BASE_URL` becomes `https://4.tcp.ngrok.io:14523`.

> Free ngrok URLs change every restart — fine for testing, switch to Cloudflare
> Tunnel before a portfolio demo so the link stays stable.

---

## 3. Set Vercel Environment Variables

Go to your Vercel project → **Settings → Environment Variables** → add each:

| Variable | Value |
|---|---|
| `SPLUNK_BASE_URL` | Your tunnel URL from step 2 |
| `SPLUNK_USERNAME` | `admin` (or your Splunk username) |
| `SPLUNK_PASSWORD` | Your new Splunk password |
| `SPLUNK_INDEX` | `main` |
| `SPLUNK_SOURCETYPE` | `WinEventLog:Security` |
| `SPLUNK_VERIFY_SSL` | `false` |

Leave `SPLUNK_TOKEN` unset — the backend skips it automatically and uses
Basic Auth instead.

Apply to **Production** (and **Preview** if you want PR previews to also
connect).

---

## 4. Redeploy and verify

After saving the variables: **Deployments → ⋯ → Redeploy**.

Then visit:
```
https://your-site.vercel.app/api/health
```

Expected response:
```json
{
  "status": "connected",
  "mode": "splunk",
  "splunk": {
    "reachable": true,
    "version": "9.x.x",
    "serverName": "your-hostname"
  }
}
```

If `"status": "error"` — check the `error` field for the exact Splunk HTTP
error. With Basic Auth, the most common causes are:

| Error | Cause |
|---|---|
| HTTP 401 | Wrong username/password |
| HTTP 403 | User lacks REST API search permission (rare on Free — `admin` has full access) |
| ECONNREFUSED / timeout | Tunnel not running, or wrong port |
| Self-signed certificate error | `SPLUNK_VERIFY_SSL` not set to `false` |

---

## 5. What ThreatLens does with your data

Your environment's confirmed EventCodes were mapped to ThreatLens severities
and MITRE ATT&CK techniques:

| EventCode | Event | Count Seen | Severity | MITRE Technique |
|---|---|---|---|---|
| 4673 | Sensitive Privilege Use | 24,604 | **High** | T1134 — Access Token Manipulation |
| 4702 | Scheduled Task Updated | 161 | **High** | T1053.005 — Scheduled Task |
| 5379 | Credential Manager Read | 198 | **High** | T1555.004 — Windows Credential Manager |
| 4670 | Permissions Changed | 440 | **High** | T1222.001 — File/Directory Permissions |
| 4688 | Process Creation | 1,599 | Medium | T1059 — Command and Scripting Interpreter |
| 4663 | Object Access | 7,365 | Medium | T1083 — File and Directory Discovery |
| 4656 | Handle Requested | 11,317 | Medium | T1083 — File and Directory Discovery |
| 4690 | Handle Duplication | 10,476 | Medium | T1134 — Access Token Manipulation |
| 5152 | Network Packet Blocked | 535 | Medium | T1562.004 — Disable/Modify Firewall |
| 4624 | Successful Logon | 135 | Low | T1078 — Valid Accounts |
| 4627 | Group Membership | 135 | Low | T1078 — Valid Accounts |

You currently have **no 4625 (failed logon)** events. If you want
brute-force/password-spray detections to populate, check the audit policy on
your Windows VM:

```
Local Security Policy → Advanced Audit Policy → Logon/Logoff
→ Audit Logon: enable Failure
```
Then generate a few failed logins (wrong password) and they'll show up as
High-mapped alerts (the normalizer already has the 4625 → T1110 Brute Force
mapping ready).

---

## 6. Adjusting the mapping later

If you add more Sysmon, firewall, or Linux auth data later, the
EventCode-to-severity logic lives in one place:

```
api/_lib/normalizers.ts
```

Add new EventCodes to the `eventCodeToSeverity()` and `eventCodeToMitre()`
functions — the rest of the platform (dashboard, alerts, incidents, live
feed) will pick them up automatically with no other changes needed.

---

## 7. A note on Splunk Free license limits

A few platform behaviors to keep in mind while testing:

- **No scheduled saved searches** on some Free builds — not used by
  ThreatLens anyway (we use `exec_mode=oneshot`, which works fine on Free).
- **60 MB/day indexing cap** — fine for a portfolio lab, but high-volume
  EventCodes like 4673 (24k+ events) can burn through that quickly if you're
  also ingesting other sourcetypes. Monitor via **Settings → Licensing**.
- **No distributed search / clustering** — irrelevant for a single-instance
  lab setup like this one.
- **No alerting actions** — ThreatLens's own alert logic runs entirely in the
  Vercel API layer, not inside Splunk, so this doesn't block anything.
