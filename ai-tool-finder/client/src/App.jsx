import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Compare from './pages/Compare';
import Home from './pages/Home';
import Results from './pages/Results';
import ToolDetail from './pages/ToolDetail';
import Trending from './pages/Trending';

const App = () => (
  <div className="min-h-screen max-w-6xl mx-auto p-4 space-y-6">
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/results" element={<Results />} />
      <Route path="/tool/:id" element={<ToolDetail />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/trending" element={<Trending />} />
    </Routes>
    <Footer />
  </div>
);

export default App;
