export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is not configured with an API key yet.' });
    return;
  }

  try {
    const { content, max_tokens } = req.body || {};
    if (!content) {
      res.status(400).json({ error: 'Missing content in request.' });
      return;
    }

    const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5-5',
        max_tokens: max_tokens || 1100,
        messages: [{ role: 'user', content }]
      })
    });

    const data = await anthropicResp.json();
    if (!anthropicResp.ok) {
      res.status(anthropicResp.status).json({ error: (data.error && data.error.message) || 'AI request failed.' });
      return;
    }

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error.' });
  }
}

