import Analytics from '../models/Analytics.js';
import Tool from '../models/Tool.js';
import { detectIntent } from '../services/aiService.js';
import { generateEmbedding } from '../services/embeddingService.js';
import { findSimilarTools } from '../services/vectorSearchService.js';

export const searchTools = async (req, res) => {
  const { q = '' } = req.query;
  if (!q.trim()) {
    return res.status(400).json({ error: 'Query parameter q is required.' });
  }

  const intent = await detectIntent(q);
  const queryEmbedding = await generateEmbedding(`${q} ${intent.category} ${intent.subcategory}`);

  const [semanticMatches, categoryMatches] = await Promise.all([
    findSimilarTools(queryEmbedding, 10),
    Tool.find({ category: { $regex: intent.category.split(' ')[0], $options: 'i' } }).limit(6).lean(),
  ]);

  await Analytics.create({ type: 'search', term: q, metadata: { intent } });

  return res.json({
    query: q,
    intent,
    topTools: semanticMatches,
    alternatives: categoryMatches,
  });
};
