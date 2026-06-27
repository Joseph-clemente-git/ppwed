import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Budget from './pages/Budget';
import GISMap from './pages/GISMap';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/gis" element={<GISMap />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
