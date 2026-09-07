# Mail relay

Backend for the desktop's **New Message** window. A visitor's message becomes an
issue in a private GitHub repo, and GitHub's watch notifications turn that issue
into an email.

The portfolio is a static bundle on GitHub Pages, so it cannot hold a secret.
This worker exists solely to hold the GitHub token server-side.

**The composer works without this.** With `VITE_CONTACT_ENDPOINT` unset it hands
the drafted message to the visitor's own mail client instead. Deploy the relay
when you want messages delivered without that hop.

## Setup

### 1. Create the inbox repo

A new **private** repo, e.g. `basit-faisal/portfolio-inbox`. Private matters:
issues in a public repo are world-readable and search-indexed, which would
publish the sender's email address.

Make sure you are *Watching* it (All Activity) so new issues email you.

### 2. Create a token

A **fine-grained** personal access token, not a classic one:

- Repository access: *Only select repositories* → the inbox repo
- Permissions: *Issues* → **Read and write**. Nothing else.

Scoped this way, a leaked token can only open issues in an empty private repo.

### 3. Deploy

```sh
cd relay
npx wrangler secret put GITHUB_TOKEN   # paste the token
npx wrangler deploy
```

Edit `wrangler.toml` first if your repo name or origins differ. Add
`http://localhost:5173` to `ALLOWED_ORIGINS` while developing.

### 4. Point the site at it

`wrangler deploy` prints the worker URL. Put it in `.env.local` at the repo root
(gitignored via `*.local`):

```
VITE_CONTACT_ENDPOINT=https://portfolio-mail-relay.<your-subdomain>.workers.dev
```

Vite inlines this at **build time**, so rebuild after changing it. If you deploy
via GitHub Actions, set it as a repository variable and expose it to the build
step — it is a public URL, not a secret.

## What it protects against

- **Token exposure** — the token never reaches the browser.
- **Other sites posting to it** — `ALLOWED_ORIGINS` is enforced server-side.
- **Bots** — a honeypot field is accepted and silently discarded.
- **Markdown injection** — the message is wrapped in a fence sized to survive
  any backticks it contains, so it cannot break out into the issue body.
- **Oversized payloads** — every field is length-clamped before use.

Not handled: **rate limiting**, which needs state a plain worker does not have.
If you start seeing abuse, add a Cloudflare rate-limiting rule on the worker
route — the free plan covers it and needs no code change.
