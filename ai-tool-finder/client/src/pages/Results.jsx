import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ToolCard from '../components/ToolCard';
import { searchTools } from '../services/api';

const Results = () => {
  const [params] = useSearchParams();
  const [data, setData] = useState({ topTools: [], alternatives: [], intent: null });

  useEffect(() => {
    const run = async () => {
      const q = params.get('q');
      if (!q) return;
      const result = await searchTools(q);
      setData(result);
    };
    run();
  }, [params]);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Top Tools</h2>
      {data.intent && <p className="text-sm text-white/70">Intent: {data.intent.category} → {data.intent.subcategory}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {data.topTools.map((tool) => <ToolCard key={tool._id || tool.name} tool={tool} />)}
      </div>
      <h3 className="text-xl font-semibold">Alternatives</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {data.alternatives.map((tool) => <ToolCard key={tool._id || tool.name} tool={tool} />)}
      </div>
    </section>
  );
};

export default Results;
