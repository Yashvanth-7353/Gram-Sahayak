import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

// --- FIX THESE IMPORTS ---
// Make sure this points to "DashboardLayout.jsx" in your components folder
import DashboardLayout from '/src/components/Sidebar'; 
// Make sure this points to "DashboardHome.jsx" in your pages folder
import DashboardHome from '/src/pages/VillageDashboard';
// -------------------------
import Login from './pages/Login';
import Signup from './pages/Signup';
import Complaints from './pages/Complaints';
import Forum from './pages/Community';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="forum" element={<Forum />} />
          <Route path="settings" element={<div>Settings Page</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;