import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Layout & Dashboard Components
import Sidebar from './components/Sidebar'; // This acts as the Dashboard Layout
import VillageDashboard from './pages/VillageDashboard';
import ContractorDashboard from './pages/ContractorDashboard';

// Feature Pages
import Complaints from './pages/Complaints';
import Community from './pages/Community';

// Helper Component: Decides which dashboard to show based on User Role
const RoleBasedDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (user?.role === 'contractor') {
    return <ContractorDashboard />;
  }
  
  // Default to Villager Dashboard
  return <VillageDashboard />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Dashboard Routes (Protected by Sidebar Layout) */}
        <Route path="/dashboard" element={<Sidebar />}>
          
          {/* Index: Automatically renders Villager or Contractor Dashboard */}
          <Route index element={<RoleBasedDashboard />} />
          
          {/* Feature Routes */}
          <Route path="complaints" element={<Complaints />} />
          <Route path="community" element={<Community />} />
          
          {/* Placeholders for future expansion */}
          <Route path="projects" element={<div className="p-10 text-center text-earth-900/50 font-bold">Project Management Module (Coming Soon)</div>} />
          <Route path="settings" element={<div className="p-10 text-center text-earth-900/50 font-bold">Settings Page</div>} />
          
        </Route>

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;