import Analytics from '../models/Analytics.js';
import Tool from '../models/Tool.js';
import { generateEmbedding } from '../services/embeddingService.js';

export const getTools = async (_req, res) => {
  const tools = await Tool.find().sort({ createdAt: -1 }).limit(200).lean();
  return res.json(tools);
};

export const getToolById = async (req, res) => {
  const tool = await Tool.findById(req.params.id).lean();
  if (!tool) return res.status(404).json({ error: 'Tool not found' });

  await Analytics.create({ type: 'click', toolId: tool._id });
  return res.json(tool);
};

export const createTool = async (req, res) => {
  const payload = req.body;
  const embedding = await generateEmbedding(`${payload.name} ${payload.description} ${(payload.tags || []).join(' ')}`);

  const tool = await Tool.create({ ...payload, embedding });
  return res.status(201).json(tool);
};

export const compareTools = async (req, res) => {
  const { ids = [] } = req.body;
  const tools = await Tool.find({ _id: { $in: ids } }).lean();

  const table = {
    feature: ['Video generation', 'Price', 'Ease of use'],
    rows: tools.map((tool) => ({
      tool: tool.name,
      values: [
        tool.tags?.some((t) => /video/i.test(t)) ? '✔' : '—',
        tool.pricing,
        `${Math.max(1, Math.round((tool.rating || 3.5) * 2))}/10`,
      ],
    })),
  };

  return res.json({ tools, table });
};

export const getTrendingTools = async (_req, res) => {
  const tools = await Tool.find().lean();
  const ranked = tools
    .map((tool) => ({ ...tool, score: (tool.analytics?.clicks || 0) + (tool.analytics?.searches || 0) + (tool.analytics?.recentBoost || 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return res.json(ranked);
};

export const trackTimeSpent = async (req, res) => {
  const { toolId, seconds } = req.body;
  await Analytics.create({ type: 'time_spent', toolId, value: seconds });
  return res.status(201).json({ ok: true });
};
