import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SummaryPage from './SummaryPage';
import Home from './Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Jarayed" element={<Home />} />
        <Route path="/summary" element={<SummaryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
