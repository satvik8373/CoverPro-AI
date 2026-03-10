import { useEffect, useState } from 'react';
import ToolCard from '../components/ToolCard';
import { getTrendingTools } from '../services/api';

const Trending = () => {
  const [tools, setTools] = useState([]);

  useEffect(() => {
    getTrendingTools().then(setTools);
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Trending AI Tools</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {tools.map((tool) => <ToolCard key={tool._id || tool.name} tool={tool} />)}
      </div>
    </section>
  );
};

export default Trending;
