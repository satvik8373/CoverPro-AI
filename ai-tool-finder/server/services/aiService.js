import axios from 'axios';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const fallbackIntent = (query) => {
  const lower = query.toLowerCase();
  if (lower.includes('video') || lower.includes('reel')) return { category: 'video generation', subcategory: 'short video' };
  if (lower.includes('music') || lower.includes('song')) return { category: 'audio generation', subcategory: 'music' };
  if (lower.includes('website') || lower.includes('landing')) return { category: 'web development', subcategory: 'site builder' };
  return { category: 'general ai tools', subcategory: 'discovery' };
};

export const detectIntent = async (query) => {
  if (!process.env.GEMINI_API_KEY) return fallbackIntent(query);

  try {
    const prompt = `Analyze this user query and return strict JSON only with keys category and subcategory. Query: ${query}`;
    const { data } = await axios.post(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return fallbackIntent(query);
    return JSON.parse(text);
  } catch {
    return fallbackIntent(query);
  }
};
