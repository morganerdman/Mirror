import { fetchBlsOccupation } from './source-clients/bls.mjs';
import { fetchOnetOccupation } from './source-clients/onet.mjs';

const DEFAULT_QUERIES = [
  'book conservator',
  'medical illustrator',
  'textile designer',
  'science journalist',
];

const KEYWORD_HINTS = [
  { re: /\b(sew|sewing|denim|fabric|textile)\b/i, query: 'textile designer' },
  { re: /\b(book|archive|paper|library|conserv)\b/i, query: 'book conservator' },
  { re: /\b(illustrat|anatomy|medical art)\b/i, query: 'medical illustrator' },
  { re: /\b(journal|write|documentary|story)\b/i, query: 'science journalist' },
  { re: /\b(prosthetic|orthotic|brace)\b/i, query: 'orthotist and prosthetist' },
];

function extractSidebarSnapshot(systemText) {
  const m = String(systemText || '').match(/sidebar_profile_snapshot:\s*(\{[\s\S]*?\})\s*(?:\n|$)/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

function textFromProfile(profile) {
  if (!profile || typeof profile !== 'object') return '';
  const fields = ['essence', 'values', 'workStyle', 'interests', 'social', 'pressure'];
  return fields
    .flatMap((k) => (Array.isArray(profile[k]) ? profile[k].map((x) => x?.text || '') : []))
    .join(' ');
}

function deriveQueries({ system, messages }) {
  const profile = extractSidebarSnapshot(system);
  const latestUser = [...(messages || [])].reverse().find((m) => m?.role === 'user')?.content || '';
  const corpus = `${latestUser} ${textFromProfile(profile)}`;
  const seeded = KEYWORD_HINTS.filter((k) => k.re.test(corpus)).map((k) => k.query);
  const merged = [...new Set([...seeded, ...DEFAULT_QUERIES])].slice(0, 4);
  return merged;
}

function summarizeGrounded(query, bls, onet) {
  return {
    query,
    title: bls?.title || onet?.title || query,
    salaryRange: bls?.salary || null,
    outlook: bls?.outlook || null,
    tasks: onet?.tasks || [],
    sourceRefs: [bls?.sourceRef, onet?.sourceRef].filter(Boolean),
  };
}

export async function buildLiveGrounding({ system, messages }) {
  const queries = deriveQueries({ system, messages });
  const results = [];

  for (const query of queries) {
    const [bls, onet] = await Promise.all([
      fetchBlsOccupation(query).catch((e) => ({ ok: false, error: String(e) })),
      fetchOnetOccupation(query).catch((e) => ({ ok: false, error: String(e) })),
    ]);
    const grounded = summarizeGrounded(query, bls.ok ? bls : null, onet.ok ? onet : null);
    if (grounded.sourceRefs.length) results.push(grounded);
  }

  return {
    source_status: results.length ? 'ok' : 'degraded',
    queries,
    occupations: results,
  };
}

export function buildGroundingAppendix(grounding) {
  const occs = grounding?.occupations || [];
  if (!occs.length) {
    return '\n\n---\nLIVE_SOURCE_GROUNDING\nsource_status: degraded\nnotes: Live BLS/O*NET grounding unavailable for this turn. Do not fabricate numeric claims. Prefer uncertainty language.\n';
  }

  const lines = [
    '',
    '---',
    'LIVE_SOURCE_GROUNDING',
    'source_status: ok',
    'Use ONLY facts below for salary/outlook/task claims when providing recommendations.',
  ];
  occs.forEach((o, idx) => {
    lines.push(`occupation_${idx + 1}: ${o.title}`);
    if (o.salaryRange) lines.push(`- salary: ${o.salaryRange}`);
    if (o.outlook) lines.push(`- outlook: ${o.outlook}`);
    if (o.tasks?.length) lines.push(`- tasks: ${o.tasks.join(' | ')}`);
    o.sourceRefs.forEach((s) => lines.push(`- source: ${s.label} (${s.url})`));
  });
  return `\n${lines.join('\n')}\n`;
}

function normalize(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function pickBestGrounding(careerTitle, occupations) {
  const t = normalize(careerTitle);
  let best = null;
  let bestScore = -1;
  for (const o of occupations || []) {
    const q = normalize(o.query);
    const h = normalize(o.title);
    let score = 0;
    if (t.includes(q) || q.includes(t)) score += 2;
    if (t.includes(h) || h.includes(t)) score += 2;
    const words = q.split(' ').filter(Boolean);
    score += words.filter((w) => t.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = o;
    }
  }
  return bestScore > 0 ? best : null;
}

export function injectSourcesIntoProfileUpdate(rawText, grounding) {
  const m = String(rawText || '').match(/<profile_update>([\s\S]*?)<\/profile_update>/);
  if (!m) return rawText;

  let data;
  try {
    data = JSON.parse(m[1].trim());
  } catch {
    return rawText;
  }
  if (!data?.recommendations || !Array.isArray(data.recommendations.careers)) return rawText;

  const occupations = grounding?.occupations || [];
  data.recommendations.source_status = grounding?.source_status || 'degraded';
  data.recommendations.careers = data.recommendations.careers.map((c) => {
    const best = pickBestGrounding(c.title, occupations);
    if (!best) return c;
    return {
      ...c,
      sources: best.sourceRefs,
      grounded_salary: best.salaryRange || null,
      grounded_outlook: best.outlook || null,
      grounded_tasks: best.tasks || [],
    };
  });

  const patched = `<profile_update>\n${JSON.stringify(data, null, 2)}\n</profile_update>`;
  return String(rawText).replace(/<profile_update>[\s\S]*?<\/profile_update>/, patched);
}
