import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const categories = ['Video', 'Audio', 'Coding', 'Design', 'Marketing'];

const Home = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (query) => {
    if (!query) return;
    setLoading(true);
    navigate(`/results?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="space-y-8">
      <h1 className="text-4xl font-bold">Google for AI Tools</h1>
      <p className="text-white/70">Search, compare, and discover the best AI tools for any task.</p>
      <SearchBar onSearch={submit} loading={loading} />
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <span key={category} className="border border-violet/40 rounded-full px-3 py-1 text-xs">{category}</span>
        ))}
      </div>
    </section>
  );
};

export default Home;
