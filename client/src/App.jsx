import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navbar, Home, Services } from './components';

import Discover from './pages/Discover';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Testing from './pages/Admin';

const App = () => (
  <Router>
    <div className="min-h-screen gradient-bg-background"> 
      <Navbar />
      <Routes>
        <Route path="/" element={<div><Home /><Services /></div>} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<Testing />} />
      </Routes>
    </div>
  </Router>
);

export default App;