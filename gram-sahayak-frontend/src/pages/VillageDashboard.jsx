import React from 'react';
import { motion } from 'framer-motion';
// FIX: Added 'User' to the imports below
import { MapPin, Calendar, Activity, CheckCircle2, Clock, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DashboardHome = () => {
  const { t } = useLanguage();

  // Mock Data (Replace with Backend API later)
  const schemes = [
    { title: "Pradhan Mantri Gram Sadak Yojana", id: "PMGSY-2025", benefit: "Road Construction" },
    { title: "Jal Jeevan Mission", id: "JJM-24", benefit: "Clean Water" },
  ];

  const projects = [
    { name: "Main Market Road Repair", status: "In Progress", progress: 60, date: "Due: Jan 20" },
    { name: "School Zone Speed Breakers", status: "Pending Approval", progress: 10, date: "Due: Feb 15" },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Digital Villager ID Card (The Profile Header) */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-bl-full"></div>
        
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/30">
            VP
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{t.dashboard.welcome}, Vishwa Panchal</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-emerald-100 text-sm">
              <span className="flex items-center gap-1"><MapPin size={14} /> Rampura Village, Karnataka</span>
              {/* This line caused the error before because User wasn't imported */}
              <span className="flex items-center gap-1"><User size={14} /> Male, 21 Years</span>
              <span className="flex items-center gap-1">UID: 1RV24IS413</span>
            </div>
          </div>
          <button className="bg-white text-emerald-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-50 transition">
            Edit Profile
          </button>
        </div>
      </div>

      {/* 2. Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label={t.dashboard.stats.active_projects} value="3" icon={<Activity className="text-blue-500" />} />
        <StatsCard label={t.dashboard.stats.pending_complaints} value="1" icon={<Clock className="text-orange-500" />} />
        <StatsCard label="Upvotes Given" value="12" icon={<CheckCircle2 className="text-green-500" />} />
        <StatsCard label="Schemes Applied" value="2" icon={<Calendar className="text-purple-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. Local Projects (Main Focus) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Activity size={20} className="text-emerald-600" />
            {t.dashboard.local_projects}
          </h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
            {projects.map((project, idx) => (
              <div key={idx} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{project.name}</h3>
                    <p className="text-xs text-gray-500">{project.date}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {project.status}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Government Schemes Side Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">{t.dashboard.schemes_title}</h2>
          <div className="space-y-3">
            {schemes.map((scheme, idx) => (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                key={idx} 
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-emerald-500 transition"
              >
                <h3 className="font-bold text-gray-700 text-sm">{scheme.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{scheme.benefit}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{scheme.id}</span>
                  <span className="text-xs text-emerald-600 font-bold hover:underline">Apply &rarr;</span>
                </div>
              </motion.div>
            ))}
            
            <button className="w-full py-2 text-sm text-center text-gray-500 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:text-emerald-600 transition">
              View All Schemes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper Component for Stats
const StatsCard = ({ label, value, icon }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
    <div className="mb-2 bg-gray-50 p-2 rounded-full">{icon}</div>
    <span className="text-2xl font-bold text-gray-900">{value}</span>
    <span className="text-xs text-gray-500 mt-1">{label}</span>
  </div>
);

export default DashboardHome;