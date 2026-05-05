const BLS_BASE = 'https://www.bls.gov';

function stripHtml(s) {
  return String(s || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function withTimeout(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  return { url, ctrl, clear: () => clearTimeout(id) };
}

function extractFirstOohLink(html) {
  const links = [...html.matchAll(/href="(\/ooh\/[^"]+?\.htm)"/gi)].map((m) => m[1]);
  const filtered = links.filter((l) => !/\/ooh\/a-z-index\.htm/i.test(l));
  return filtered[0] || null;
}

function extractMedianPay(pageText) {
  const a = pageText.match(/The median annual wage for [^.]+ was \$([0-9,]+)/i);
  if (a) return `$${a[1]}`;
  const b = pageText.match(/Median Pay[^$]*\$([0-9,]+)/i);
  if (b) return `$${b[1]}`;
  return null;
}

function extractOutlook(pageText) {
  const m = pageText.match(/Employment of [^.]+ is projected to (?:grow|decline) ([^.]+\.)/i);
  if (m) return m[0];
  const n = pageText.match(/Job Outlook[^.]*\./i);
  return n ? n[0] : null;
}

export async function fetchBlsOccupation(query, { timeoutMs = 8000 } = {}) {
  const search = withTimeout(`${BLS_BASE}/ooh/search.htm?query=${encodeURIComponent(query)}`, timeoutMs);
  try {
    const searchRes = await fetch(search.url, { signal: search.ctrl.signal });
    const searchHtml = await searchRes.text();
    const rel = extractFirstOohLink(searchHtml);
    if (!rel) {
      return { ok: false, query, error: 'no_bls_match' };
    }
    const url = `${BLS_BASE}${rel}`;
    const pageReq = withTimeout(url, timeoutMs);
    try {
      const pageRes = await fetch(pageReq.url, { signal: pageReq.ctrl.signal });
      const pageHtml = await pageRes.text();
      const pageText = stripHtml(pageHtml);
      const titleMatch = pageHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const title = titleMatch ? stripHtml(titleMatch[1]) : query;
      const salary = extractMedianPay(pageText);
      const outlook = extractOutlook(pageText);
      return {
        ok: true,
        provider: 'bls',
        query,
        title,
        salary,
        outlook,
        url,
        sourceRef: {
          id: 'bls',
          label: 'BLS Occupational Outlook Handbook',
          url,
          tier: 'structured',
          reason: 'Live occupation salary/outlook reference from BLS OOH.',
        },
      };
    } finally {
      pageReq.clear();
    }
  } catch (e) {
    return { ok: false, query, error: `bls_fetch_failed:${String(e.message || e)}` };
  } finally {
    search.clear();
  }
}
