import { useState } from 'react';

const suggestions = ['Generate reels', 'Create AI music', 'Build website', 'Remove background'];

const SearchBar = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');

  return (
    <div className="space-y-3">
      <div className="glass p-3 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to create?"
          className="bg-transparent flex-1 p-3 outline-none"
        />
        <button onClick={() => onSearch(query)} disabled={loading} className="bg-violet px-4 rounded-xl">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {suggestions.map((term) => (
          <button key={term} onClick={() => onSearch(term)} className="text-xs border border-neon/30 px-3 py-1 rounded-full">
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
