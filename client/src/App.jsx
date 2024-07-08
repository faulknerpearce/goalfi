import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navbar, Home, Services } from './components';

import Discover from './pages/Discover';
import Dashboard from './pages/Dashboard';
import Rewards from './pages/Rewards';
import About from './pages/About';

const App = () => (
  <Router>
    <div className="min-h-screen gradient-bg-welcome"> 
      <Navbar />
      <Routes>
        <Route path="/" element={<div><Home /><Services /></div>} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  </Router>
);

export default App;