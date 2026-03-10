import Tool from '../models/Tool.js';
import { generateEmbedding } from '../services/embeddingService.js';
import { scrapeTools } from '../services/scraperService.js';

export const updateTools = async () => {
  const scraped = await scrapeTools();

  for (const tool of scraped) {
    const embedding = await generateEmbedding(`${tool.name} ${tool.description} ${(tool.tags || []).join(' ')}`);

    await Tool.findOneAndUpdate(
      { name: tool.name },
      {
        ...tool,
        embedding,
        'analytics.recentBoost': 5,
        lastLaunchedAt: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  return scraped.length;
};
