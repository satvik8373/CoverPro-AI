import { motion } from 'framer-motion';

const ToolCard = ({ tool }) => (
  <motion.article whileHover={{ y: -4 }} className="glass p-4 space-y-2">
    <h3 className="text-lg font-semibold">{tool.name}</h3>
    <p className="text-sm text-white/80">{tool.description}</p>
    <div className="flex justify-between text-xs text-neon">
      <span>{tool.pricing}</span>
      <span>⭐ {tool.rating ?? 'N/A'}</span>
    </div>
  </motion.article>
);

export default ToolCard;
