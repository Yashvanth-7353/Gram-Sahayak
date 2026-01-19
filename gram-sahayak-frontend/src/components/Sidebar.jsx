// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, MessageSquare, AlertCircle, Settings, Menu, X, LogOut, 
  Briefcase, HardHat, Users, Bot, Languages 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { t, toggleLanguage, lang } = useLanguage(); // <--- Get toggle function and current lang
  const location = useLocation();
  const navigate = useNavigate();

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Guest', role: 'villager' };

  // 1. Define Menus (Now using translations)
// src/components/Sidebar.jsx

// ... existing code ...

  // 1. Define Menus
  const villagerItems = [
    { icon: <LayoutDashboard size={20} />, label: t.dashboard.menu.home, path: "/dashboard" },
    { icon: <Briefcase size={20} />, label: t.sidebar.projects, path: "/dashboard/projects" }, // <--- Add this
    { icon: <AlertCircle size={20} />, label: t.dashboard.menu.complaints, path: "/dashboard/complaints" },
    { icon: <MessageSquare size={20} />, label: t.dashboard.menu.forum, path: "/dashboard/community" },
  ];

// ... existing code ...

  const contractorItems = [
    { icon: <LayoutDashboard size={20} />, label: t.sidebar.overview, path: "/dashboard" },
    { icon: <HardHat size={20} />, label: t.sidebar.my_projects, path: "/dashboard/projects" },
    { icon: <Users size={20} />, label: t.sidebar.official_connect, path: "/dashboard/connect" }, 
  ];

  const officialItems = [
    { icon: <LayoutDashboard size={20} />, label: t.sidebar.admin_overview, path: "/dashboard" },
    { icon: <Briefcase size={20} />, label: t.sidebar.manage_projects, path: "/dashboard/projects" },
    { icon: <AlertCircle size={20} />, label: t.sidebar.grievances, path: "/dashboard/complaints" },
    { icon: <MessageSquare size={20} />, label: t.sidebar.village_square, path: "/dashboard/community" },
    { icon: <Bot size={20} />, label: t.sidebar.community_ai, path: "/dashboard/community-ai" },
    { icon: <Users size={20} />, label: t.sidebar.contractor_chat, path: "/dashboard/connect" },
  ];

  // 2. Select Menu based on Role
  let navItems = villagerItems;
  if (user.role === 'contractor') {
    navItems = contractorItems;
  } else if (user.role === 'official') {
    navItems = officialItems;
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-sand-50 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-earth-900/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-72 bg-white border-r border-sand-200 z-50 
        transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-8 flex items-center justify-between">
            <div>
              <span className="font-serif font-bold text-2xl text-earth-900 tracking-tight">
                Gram<span className="text-clay-500">Sahayak</span>
              </span>
              <p className="text-xs text-earth-900/40 font-medium tracking-widest uppercase mt-1">
                {user.role === 'contractor' ? 'Partner Portal' : user.role === 'official' ? 'Admin Console' : 'Village OS'}
              </p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-earth-900">
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-earth-900 text-sand-50 shadow-lg shadow-earth-900/20' 
                      : 'text-earth-900/70 hover:bg-sand-100 hover:text-earth-900'
                  }`}
                >
                  <span className={`${isActive ? 'text-clay-400' : 'text-earth-900/40 group-hover:text-earth-900'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions: Language & User */}
          <div className="p-4 m-4 bg-sand-50 rounded-3xl border border-sand-200 space-y-3">
            
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-earth-900/60 hover:bg-white hover:text-earth-900 transition-all border border-transparent hover:border-sand-200"
            >
              <div className="w-8 h-8 rounded-full bg-clay-100 flex items-center justify-center text-clay-600">
                <Languages size={16} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-bold uppercase tracking-wider">Language</p>
                <p className="text-sm font-medium">{lang === 'en' ? 'English' : 'ಕನ್ನಡ'}</p>
              </div>
            </button>

            {/* User Profile */}
            <div className="pt-3 border-t border-sand-200">
              <div className="flex items-center gap-3 mb-3 px-1">
                <div className="w-10 h-10 bg-earth-900 rounded-full flex items-center justify-center text-white font-serif font-bold text-lg shadow-md">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-earth-900 truncate">{user.name}</p>
                  <p className="text-xs text-clay-600 font-medium capitalize">{user.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-500/80 hover:text-red-600 py-2 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut size={14} /> {t.sidebar?.sign_out || "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 relative">
        <div className="md:hidden bg-white/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-sand-200 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-earth-900">
            <Menu size={24} />
          </button>
          <span className="font-serif font-bold text-earth-900">Gram Sahayak</span>
          <div className="w-8" />
        </div>

        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Sidebar;