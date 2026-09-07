/**
 * Mail relay for the portfolio's composer window.
 *
 * The site is a static bundle and cannot hold a secret, so this worker holds
 * the GitHub token instead and files each message as an issue in a PRIVATE
 * repo. Watching that repo turns every submission into an email notification.
 *
 * Deploy with wrangler. Required bindings:
 *   GITHUB_TOKEN     secret  fine-grained PAT, Issues:write on the inbox repo only
 *   GITHUB_REPO      var     "owner/name" of the private inbox repo
 *   ALLOWED_ORIGINS  var     comma-separated origins permitted to POST here
 */

const LIMITS = { email: 254, subject: 120, message: 4000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const corsHeaders = (origin, allowed) => {
  // Echo the origin only when it is on the list; a bare response otherwise
  // means the browser blocks the read, which is the intent.
  if (!allowed.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
};

const json = (status, body, headers) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });

/** Strips control characters and clamps length. */
const clean = (value, max) =>
  typeof value === 'string'
    ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max)
    : '';

/**
 * Wraps visitor text in a fence long enough to survive any backticks inside
 * it, so a message can never break out into the surrounding markdown.
 */
const fence = (text) => {
  const longestRun = (text.match(/`+/g) ?? []).reduce((max, run) => Math.max(max, run.length), 0);
  const ticks = '`'.repeat(Math.max(3, longestRun + 1));
  return `${ticks}\n${text}\n${ticks}`;
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';
    const allowed = (env.ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
    const cors = corsHeaders(origin, allowed);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json(405, { error: 'Method not allowed' }, cors);
    if (!allowed.includes(origin)) return json(403, { error: 'Origin not allowed' }, cors);

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json(400, { error: 'Expected JSON' }, cors);
    }

    // Honeypot. Report success so the bot has nothing to tune against.
    if (typeof payload.website === 'string' && payload.website.trim()) {
      return json(200, { ok: true }, cors);
    }

    const email = clean(payload.email, LIMITS.email);
    const subject = clean(payload.subject, LIMITS.subject).replace(/\s+/g, ' ');
    const message = clean(payload.message, LIMITS.message);

    if (!EMAIL_PATTERN.test(email)) return json(400, { error: 'Invalid email address' }, cors);
    if (!subject) return json(400, { error: 'Subject is required' }, cors);
    if (!message) return json(400, { error: 'Message is required' }, cors);

    const country = request.headers.get('CF-IPCountry') ?? 'unknown';
    const body = [
      `**From:** ${email}`,
      `**Received:** ${new Date().toISOString()}`,
      `**Country:** ${country}`,
      '',
      '---',
      '',
      fence(message)
    ].join('\n');

    const response = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'portfolio-mail-relay',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: subject, body })
    });

    if (!response.ok) {
      // The upstream detail stays in the log, not in the visitor's browser.
      console.error('GitHub rejected the issue', response.status, await response.text());
      return json(502, { error: 'Could not file the message' }, cors);
    }

    return json(200, { ok: true }, cors);
  }
};
