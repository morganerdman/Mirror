let groundingFns = null;
let groundingAttempted = false;

async function getGroundingFns() {
  if (groundingAttempted) return groundingFns;
  groundingAttempted = true;
  try {
    const mod = await import('../server/source-grounding.mjs');
    if (
      typeof mod.buildLiveGrounding === 'function' &&
      typeof mod.buildGroundingAppendix === 'function' &&
      typeof mod.injectSourcesIntoProfileUpdate === 'function'
    ) {
      groundingFns = {
        buildLiveGrounding: mod.buildLiveGrounding,
        buildGroundingAppendix: mod.buildGroundingAppendix,
        injectSourcesIntoProfileUpdate: mod.injectSourcesIntoProfileUpdate,
      };
    }
  } catch {
    groundingFns = null;
  }
  return groundingFns;
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, anthropic-version');
}

function asText(content) {
  if (!Array.isArray(content)) return '';
  return content
    .filter((block) => block && block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
  if (!apiKey) {
    res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY' });
    return;
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const { system, messages } = body;
  if (typeof system !== 'string' || !Array.isArray(messages)) {
    res.status(400).json({ error: 'Expected JSON body: { system: string, messages: Message[] }' });
    return;
  }

  let finalSystem = system;
  let grounding = null;
  const fns = await getGroundingFns();
  if (fns) {
    try {
      grounding = await fns.buildLiveGrounding({ system, messages });
      finalSystem = system + fns.buildGroundingAppendix(grounding);
    } catch {
      grounding = null;
      finalSystem = system;
    }
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 8192,
        system: finalSystem,
        messages,
      }),
    });

    const raw = await upstream.text();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    if (!upstream.ok) {
      res.status(upstream.status).json({
        error: parsed?.error?.message || parsed?.error || raw || 'Anthropic API error',
      });
      return;
    }

    let text = asText(parsed?.content);
    if (!text && typeof parsed?.completion === 'string') {
      text = parsed.completion;
    }

    if (fns && grounding && text) {
      try {
        text = fns.injectSourcesIntoProfileUpdate(text, grounding);
      } catch {
        // Fall back to raw text when enrichment fails.
      }
    }

    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Proxy failure' });
  }
}
