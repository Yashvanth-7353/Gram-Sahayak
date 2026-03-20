
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
import OfficialDashboard from './pages/OfficialDashboard';
import CreateProject from './pages/CreateProject';
import ContractorProjectView from './pages/ContractorProjectView';
import OfficialCommunityAI from './pages/OfficialCommunityAI';
import VillagerProjects from './pages/VillagerProjects';

// Feature Pages
import Complaints from './pages/Complaints';
import Community from './pages/Community';
import ContractorProjects from './pages/ContractorProjects';
import ContractorConnect from './pages/ContractorConnect';
import OfficialProjects from './pages/OfficialProjects';
import OfficialComplaints from './pages/OfficialComplaints';
import RouteVerifier from './components/RouteVerifier';
// Helper Component: Decides which dashboard to show based on User Role
const RoleBasedDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (user?.role === 'contractor') {
    return <ContractorDashboard />;
  } else if (user?.role === 'official') {
    return <OfficialDashboard />;
  }
  
  return <VillageDashboard />;
};

const RoleBasedProjectsRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.role === 'official') return <OfficialProjects />;
  if (user?.role === 'contractor') return <ContractorProjects />;
  if (user?.role === 'villager') return <VillagerProjects />;
  return <div className="p-10">Access Denied</div>;
};

const RoleBasedComplaintsRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (user?.role === 'official') {
    return <OfficialComplaints />;
  }
  // Default to Villager view
  return <Complaints />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/route-verifier" element={<RouteVerifier />} />
        {/* Project Flow Routes */}
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/contractor-projects/:id" element={<ContractorProjectView />} />
        
        {/* Dashboard Routes (Protected by Sidebar Layout) */}
        <Route path="/dashboard" element={<Sidebar />}>
          
          {/* Index: Automatically renders Villager, Contractor, or Official Dashboard */}
          <Route index element={<RoleBasedDashboard />} />
          
          {/* Feature Routes */}
          <Route path="complaints" element={<RoleBasedComplaintsRoute />} />
          <Route path="community" element={<Community />} />
          <Route path="community-ai" element={<OfficialCommunityAI />} />
          
          <Route path="connect" element={<ContractorConnect />} />
          <Route path="projects" element={<RoleBasedProjectsRoute />} />
          
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