import { useEffect, useState } from 'react';
import ToolCompare from '../components/ToolCompare';
import { compareTools, getTools } from '../services/api';

const Compare = () => {
  const [tools, setTools] = useState([]);
  const [selected, setSelected] = useState([]);
  const [table, setTable] = useState(null);

  useEffect(() => {
    getTools().then(setTools);
  }, []);

  const toggle = (id) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(-3)));
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Compare AI Tools</h2>
      <div className="grid md:grid-cols-3 gap-3">
        {tools.slice(0, 12).map((tool) => (
          <button key={tool._id} className={`glass p-3 text-left ${selected.includes(tool._id) ? 'ring-2 ring-neon' : ''}`} onClick={() => toggle(tool._id)}>
            {tool.name}
          </button>
        ))}
      </div>
      <button className="bg-violet px-4 py-2 rounded-lg" onClick={async () => setTable((await compareTools(selected)).table)}>
        Compare Selected
      </button>
      <ToolCompare table={table} />
    </section>
  );
};

export default Compare;
