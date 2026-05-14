// 3-strategy JSON parser
function parseAIJson(text) {
  try { return JSON.parse(text); } catch {}
  try {
    const stripped = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(stripped);
  } catch {}
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) return JSON.parse(text.slice(start, end + 1));
  } catch {}
  return null;
}

async function queryOpenRouter(prompt, systemPrompt = 'You are an AI transit optimization expert. Provide detailed, professional analysis.', options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = 'anthropic/claude-3-5-sonnet-20241022';

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return {
      success: false,
      error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env file.',
    };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title': 'AI Public Transit Optimizer',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `API error: ${response.status} - ${errText}` };
    }

    const parsed = await response.json();
    if (parsed.error) {
      return { success: false, error: parsed.error.message || 'API error' };
    }
    const content = parsed.choices?.[0]?.message?.content || 'No response generated';
    return { success: true, content, model: parsed.model, usage: parsed.usage };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

module.exports = { queryOpenRouter, parseAIJson };
