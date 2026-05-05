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
        system,
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

    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Proxy failure' });
  }
}
