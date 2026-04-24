const https = require('https');

async function queryOpenRouter(prompt, systemPrompt = 'You are an AI transit optimization expert. Provide detailed, professional analysis.') {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return {
      success: false,
      error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env file.',
    };
  }

  const data = JSON.stringify({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Public Transit Optimizer',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            resolve({ success: false, error: parsed.error.message || 'API error' });
          } else {
            const content = parsed.choices?.[0]?.message?.content || 'No response generated';
            resolve({
              success: true,
              content,
              model: parsed.model,
              usage: parsed.usage,
            });
          }
        } catch (e) {
          resolve({ success: false, error: 'Failed to parse API response' });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ success: false, error: e.message });
    });

    req.write(data);
    req.end();
  });
}

module.exports = { queryOpenRouter };
