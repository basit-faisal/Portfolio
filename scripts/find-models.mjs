/**
 * Dev-only: searches poly.pizza and lists CC0 results with their model ids,
 * so candidates can be shortlisted before downloading.
 *
 *   node scripts/find-models.mjs CRT "Retro Computer"
 */
const queries = process.argv.slice(2);
if (queries.length === 0) {
  console.error('usage: node scripts/find-models.mjs <query> [query...]');
  process.exit(1);
}

const seen = new Map();

for (const query of queries) {
  const res = await fetch(`https://poly.pizza/search/${encodeURIComponent(query)}`);
  const html = await res.text();

  const marker = 'window.__SERVER_APP_STATE__ =';
  const start = html.indexOf(marker);
  if (start === -1) {
    console.error(`no state blob for "${query}"`);
    continue;
  }

  // The blob is followed by other script content; scan for its balanced end.
  let depth = 0;
  let end = -1;
  const from = html.indexOf('{', start);
  for (let i = from; i < html.length; i++) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}') {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }

  let state;
  try {
    state = JSON.parse(html.slice(from, end));
  } catch (err) {
    console.error(`could not parse state for "${query}": ${err.message}`);
    continue;
  }

  for (const item of state.initialData?.result ?? []) {
    const id = item.url?.split('/').pop();
    if (!id || seen.has(id)) continue;
    seen.set(id, {
      title: item.title,
      creator: item.creator?.username,
      licence: item.licence, // poly.pizza spells it this way
      id,
      query
    });
  }
}

const rows = [...seen.values()];
const line = (r) =>
  `${r.id}  ${r.title.padEnd(30)} by ${(r.creator ?? '?').padEnd(22)} [${r.licence}]`;

const cc0 = rows.filter((r) => /CC0/i.test(r.licence ?? ''));
const ccby = rows.filter((r) => /CC-?BY/i.test(r.licence ?? ''));

console.log(`${rows.length} unique results\n`);
console.log(`--- CC0 (${cc0.length}) ---`);
cc0.forEach((r) => console.log(line(r)));
console.log(`\n--- CC-BY, needs credit (${ccby.length}) ---`);
ccby.forEach((r) => console.log(line(r)));
