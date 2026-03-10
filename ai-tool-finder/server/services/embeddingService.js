import axios from 'axios';
import { toUnitVector } from '../utils/vector.js';

const HF_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';

const fallbackEmbedding = (text) => {
  const vec = new Array(32).fill(0);
  [...text].forEach((ch, idx) => {
    vec[idx % 32] += ch.charCodeAt(0) / 255;
  });
  return toUnitVector(vec);
};

export const generateEmbedding = async (text) => {
  if (!process.env.HUGGINGFACE_API_KEY) return fallbackEmbedding(text);

  try {
    const { data } = await axios.post(
      HF_URL,
      { inputs: text, options: { wait_for_model: true } },
      { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
    );

    if (Array.isArray(data?.[0])) return toUnitVector(data[0]);
    if (Array.isArray(data)) return toUnitVector(data);
    return fallbackEmbedding(text);
  } catch {
    return fallbackEmbedding(text);
  }
};
