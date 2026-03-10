import Tool from '../models/Tool.js';
import { cosineSimilarity } from '../utils/vector.js';

// MVP: local cosine similarity over Mongo embeddings.
// Upgrade path: Supabase pgvector RPC call in this service.
export const findSimilarTools = async (queryEmbedding, limit = 10) => {
  const tools = await Tool.find({ embedding: { $exists: true, $not: { $size: 0 } } }).lean();

  return tools
    .map((tool) => ({ ...tool, similarity: cosineSimilarity(queryEmbedding, tool.embedding) }))
    .filter((tool) => tool.similarity >= 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
};
