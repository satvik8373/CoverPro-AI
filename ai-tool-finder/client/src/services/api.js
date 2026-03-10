const json = async (res) => {
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

export const searchTools = async (query) => json(await fetch(`/api/search?q=${encodeURIComponent(query)}`));
export const getTrendingTools = async () => json(await fetch('/api/tools/trending'));
export const getTools = async () => json(await fetch('/api/tools'));
export const compareTools = async (ids) =>
  json(
    await fetch('/api/tools/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
  );
