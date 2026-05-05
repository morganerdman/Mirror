const ONET_BASE = 'https://www.onetonline.org';

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

function extractSummaryLink(html) {
  const m = html.match(/href="(\/link\/summary\/[0-9]{2}-[0-9]{4}\.[0-9]{2})"/i);
  return m ? m[1] : null;
}

function extractTasks(html) {
  const section = html.match(/Tasks[\s\S]{0,5000}?(<ul[\s\S]*?<\/ul>)/i);
  if (!section) return [];
  const ul = section[1];
  const tasks = [...ul.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) => stripHtml(m[1]))
    .filter(Boolean)
    .slice(0, 4);
  return tasks;
}

export async function fetchOnetOccupation(query, { timeoutMs = 8000 } = {}) {
  const search = withTimeout(`${ONET_BASE}/find/quick?s=${encodeURIComponent(query)}`, timeoutMs);
  try {
    const searchRes = await fetch(search.url, { signal: search.ctrl.signal });
    const searchHtml = await searchRes.text();
    const rel = extractSummaryLink(searchHtml);
    if (!rel) {
      return { ok: false, query, error: 'no_onet_match' };
    }
    const url = `${ONET_BASE}${rel}`;
    const pageReq = withTimeout(url, timeoutMs);
    try {
      const pageRes = await fetch(pageReq.url, { signal: pageReq.ctrl.signal });
      const pageHtml = await pageRes.text();
      const titleMatch = pageHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const title = titleMatch ? stripHtml(titleMatch[1]) : query;
      const tasks = extractTasks(pageHtml);
      return {
        ok: true,
        provider: 'onet',
        query,
        title,
        tasks,
        url,
        sourceRef: {
          id: 'onet',
          label: 'O*NET OnLine',
          url,
          tier: 'structured',
          reason: 'Live O*NET occupation summary/tasks reference.',
        },
      };
    } finally {
      pageReq.clear();
    }
  } catch (e) {
    return { ok: false, query, error: `onet_fetch_failed:${String(e.message || e)}` };
  } finally {
    search.clear();
  }
}
