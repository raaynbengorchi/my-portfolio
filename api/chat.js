const OPENROUTER_MODEL = 'openrouter/free';
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callOpenRouterWithRetry(messages, apiKey, attempt = 0) {
    const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://rayanbengourchi.vercel.app',
            'X-Title': 'Rayan Portfolio'
        },
        body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages,
            temperature: 0.7,
            max_tokens: 2048
        })
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMsg = data.error?.message || '';
        const isRetryable = response.status === 429 || response.status === 500 || 
                           response.status === 502 || response.status === 503 ||
                           errorMsg.toLowerCase().includes('rate limit') ||
                           errorMsg.toLowerCase().includes('temporarily unavailable') ||
                           errorMsg.toLowerCase().includes('timeout');
        
        if (isRetryable && attempt < MAX_RETRIES) {
            const delay = BASE_DELAY_MS * Math.pow(2, attempt);
            console.warn(`OpenRouter attempt ${attempt + 1} failed (${response.status}: ${errorMsg}), retrying in ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
            return callOpenRouterWithRetry(messages, apiKey, attempt + 1);
        }
        
        throw new Error(errorMsg || `Failed to fetch from OpenRouter (${response.status})`);
    }

    return data;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    try {
        const data = await callOpenRouterWithRetry(messages, apiKey);

        // OpenRouter returns OpenAI-compatible format directly
        return res.status(200).json(data);
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        const errMsg = error instanceof Error ? error.message : String(error);
        const userMsg = errMsg.toLowerCase().includes('rate limit') || 
                        errMsg.toLowerCase().includes('temporarily unavailable') ||
                        errMsg.toLowerCase().includes('timeout') ||
                        errMsg.includes('429') || errMsg.includes('500') ||
                        errMsg.includes('502') || errMsg.includes('503')
            ? "I'm temporarily unavailable. Please try again in a moment."
            : 'Sorry, I could not generate a response.';
        return res.status(500).json({ error: userMsg });
    }
}