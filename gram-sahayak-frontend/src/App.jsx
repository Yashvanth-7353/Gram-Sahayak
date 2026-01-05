// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Layout & Dashboard Components
import Sidebar from './components/Sidebar';
import VillageDashboard from './pages/VillageDashboard';
import ContractorDashboard from './pages/ContractorDashboard';
import OfficialDashboard from './pages/OfficialDashboard'; // <--- IMPORT THIS

// Feature Pages
import Complaints from './pages/Complaints';
import Community from './pages/Community';
import ContractorProjects from './pages/ContractorProjects';
import ContractorConnect from './pages/ContractorConnect';

// Helper Component: Decides which dashboard to show based on User Role
const RoleBasedDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (user?.role === 'contractor') {
    console.log("Rendering Contractor Dashboard");
    return <ContractorDashboard />;
  } else if (user?.role === 'official') {
    console.log("Rendering Official Dashboard");
    return <OfficialDashboard />;
    
  }
  
  // Default to Villager Dashboard
  console.log("Rendering Villager Dashboard");
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
          
          {/* Index: Automatically renders Villager, Contractor, or Official Dashboard */}
          <Route index element={<RoleBasedDashboard />} />
          
          {/* Feature Routes */}
          <Route path="complaints" element={<Complaints />} />
          <Route path="community" element={<Community />} />
          <Route path="projects" element={<ContractorProjects />} />
          <Route path="connect" element={<ContractorConnect />} />
          
          {/* Settings Placeholder */}
          <Route path="settings" element={<div className="p-10 text-center text-earth-900/50 font-bold">Settings Page</div>} />
          
        </Route>

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;