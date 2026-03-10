import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="glass px-6 py-4 flex items-center justify-between">
    <Link to="/" className="text-neon font-bold text-xl">AI Tool Finder</Link>
    <div className="flex gap-4 text-sm text-white/90">
      <Link to="/trending">Trending</Link>
      <Link to="/compare">Compare</Link>
    </div>
  </nav>
);

export default Navbar;
