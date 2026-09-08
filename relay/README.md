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

Set the repo's **Watch** dropdown to *All Activity*.

Watching alone is not enough. The relay authenticates with **your** token, so
every issue it files is authored by you, and GitHub does not email you about
your own actions by default. Without the setting below the pipeline looks
healthy — issues appear, the worker returns 200, the composer reports success —
while nothing ever reaches your inbox.

> **Settings → Notifications → Customize email updates → Include your own
> updates**, then Save.

That setting is global: you will also start getting mail for issues and PRs you
touch in every other repo, including work ones. A filter on
`from:notifications@github.com` plus this repo's name keeps it manageable. If
that trade is not worth it, swap the GitHub API call in `worker.js` for a direct
send through an email API instead.

### 2. Create a token

A **fine-grained** personal access token, not a classic one:

- Repository access: *Only select repositories* → the inbox repo
- Permissions: *Issues* → **Read and write**. Nothing else.

Scoped this way, a leaked token can only open issues in an empty private repo.

### 3. Deploy

Needs a Cloudflare account; the free plan is enough. Check `wrangler.toml`
first: `GITHUB_REPO` must match the inbox repo, and `ALLOWED_ORIGINS` must list
every origin that will POST here. Add `http://localhost:3000` (the dev server's
port) while developing.

```sh
cd relay
npx wrangler login
npx wrangler deploy                    # creates the worker, prints its URL
npx wrangler secret put GITHUB_TOKEN   # paste the token
```

Deploy before setting the secret, so the worker exists to attach it to. Secrets
apply immediately — no redeploy needed.

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
