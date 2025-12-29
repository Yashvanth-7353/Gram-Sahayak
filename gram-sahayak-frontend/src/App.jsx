import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

// --- FIX THESE IMPORTS ---
// Make sure this points to "DashboardLayout.jsx" in your components folder
import DashboardLayout from '/src/components/Sidebar'; 
// Make sure this points to "DashboardHome.jsx" in your pages folder
import DashboardHome from '/src/pages/VillageDashboard';
// -------------------------

const Login = () => <div className="h-screen flex items-center justify-center">Login Page Placeholder</div>;
const Signup = () => <div className="h-screen flex items-center justify-center">Signup Page Placeholder</div>;

// Placeholder for nested dashboard pages
const Complaints = () => <div className="text-xl font-bold text-gray-500">My Complaints Page (Coming Soon)</div>;
const Forum = () => <div className="text-xl font-bold text-gray-500">Community Forum (Coming Soon)</div>;

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