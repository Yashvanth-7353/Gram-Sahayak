import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Activity, CheckCircle2, Clock, User, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DashboardHome = () => {
  const { t } = useLanguage();

  // Mock Data aligned with PPT (Rampura Village Context)
  const schemes = [
    { title: "Pradhan Mantri Gram Sadak Yojana", id: "PMGSY-Ph3", benefit: "Rural Connectivity" },
    { title: "Jal Jeevan Mission", id: "JJM-2025", benefit: "Piped Water Supply" },
  ];

  const projects = [
    { 
      name: "Main Market Road Repair", 
      status: "In Progress", 
      progress: 78, 
      aiScore: "92% Match", // PPT: AI Visual Verification
      date: "Due: Jan 20" 
    },
    { 
      name: "School Zone Speed Breakers", 
      status: "Pending Approval", 
      progress: 0, 
      aiScore: "Verifying...", 
      date: "Due: Feb 15" 
    },
  ];

  const complaints = [
    {
      id: "#GR-204",
      issue: "Pothole on North St.",
      status: "Unresolved",
      daysLeft: 2, // PPT: Automated Escalation Logic
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. Digital Villager Identity Card */}
      {/* Design: Loamy Soil Texture with Clay Accents */}
      <div className="relative overflow-hidden rounded-[2rem] bg-earth-900 text-sand-50 p-8 shadow-2xl">
        {/* Abstract Grain/Texture */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-clay-500 rounded-full blur-[80px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-24 h-24 rounded-2xl bg-sand-50/10 border border-sand-50/20 backdrop-blur-md flex items-center justify-center text-3xl font-serif font-bold text-clay-400 shadow-inner">
            VP
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
              {t.dashboard.welcome}, <span className="text-clay-400">Vishwa</span>
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-earth-100/80 text-sm font-medium">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <MapPin size={14} className="text-clay-500" /> Rampura Village
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <User size={14} className="text-clay-500" /> UID: 1RV24IS413
              </span>
            </div>
          </div>

          <button className="bg-clay-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-clay-600 transition shadow-lg shadow-clay-500/30 flex items-center gap-2">
             Edit Profile
          </button>
        </div>
      </div>

      {/* 2. Bento Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard 
          label={t.dashboard.stats.active_projects} 
          value="3" 
          icon={<Activity size={20} />} 
          color="bg-earth-100 text-earth-900" 
        />
        <StatsCard 
          label="Pending Reports" 
          value="1" 
          icon={<AlertTriangle size={20} />} 
          color="bg-clay-100 text-clay-700" 
        />
        <StatsCard 
          label="Community Score" 
          value="Top 10%" 
          icon={<CheckCircle2 size={20} />} 
          color="bg-sand-200 text-earth-800" 
        />
        <StatsCard 
          label="Schemes Active" 
          value="2" 
          icon={<Calendar size={20} />} 
          color="bg-white text-gray-600 border border-sand-200" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. Main Feed: Projects & Escalations */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: Urgent Attention (PPT Escalation Feature) */}
          <div className="bg-clay-50 border border-clay-100 rounded-[2rem] p-6">
            <h2 className="text-lg font-serif font-bold text-earth-900 mb-4 flex items-center gap-2">
              <Clock className="text-clay-600" size={20} />
              Attention Needed
            </h2>
            {complaints.map((c, i) => (
              <div key={i} className="bg-white rounded-xl p-4 flex justify-between items-center shadow-sm border border-clay-100">
                <div>
                  <h4 className="font-bold text-earth-900">{c.issue}</h4>
                  <p className="text-xs text-gray-500">{c.id} • {c.status}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-clay-600 uppercase tracking-wider">Auto-Escalation</span>
                  <p className="text-earth-900 font-bold">in {c.daysLeft} days</p>
                </div>
              </div>
            ))}
          </div>

          {/* Section: Live Projects (PPT Zero-Ghost Project Feature) */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-earth-900 mb-6 flex items-center gap-3">
              <Activity className="text-earth-900" />
              {t.dashboard.local_projects}
            </h2>
            
            <div className="space-y-4">
              {projects.map((project, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-sand-200 hover:border-earth-200 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-earth-900">{project.name}</h3>
                      <p className="text-sm text-gray-500 font-medium">{project.date}</p>
                    </div>
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      project.status === 'In Progress' 
                        ? 'bg-earth-100 text-earth-800' 
                        : 'bg-sand-200 text-gray-600'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Progress & AI Verification */}
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-bold text-earth-900">Completion</span>
                        <span className="text-earth-900">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-sand-100 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="bg-earth-900 h-full rounded-full" 
                        />
                      </div>
                    </div>
                    
                    {/* Unique Feature: AI Verification Score */}
                    <div className="text-right pl-4 border-l border-sand-200">
                      <p className="text-[10px] uppercase text-gray-400 font-bold">AI Verified</p>
                      <p className={`text-sm font-bold ${project.aiScore.includes('92') ? 'text-emerald-600' : 'text-clay-500'}`}>
                        {project.aiScore}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Sidebar: Schemes & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-sand-100 rounded-[2rem] p-6 border border-sand-200">
            <h2 className="text-lg font-serif font-bold text-earth-900 mb-4">{t.dashboard.schemes_title}</h2>
            <div className="space-y-3">
              {schemes.map((scheme, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-sand-200 shadow-sm hover:shadow-md transition cursor-pointer group">
                  <h3 className="font-bold text-earth-900 text-sm leading-tight mb-1">{scheme.title}</h3>
                  <p className="text-xs text-clay-600 font-medium mb-3">{scheme.benefit}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-sand-100 px-2 py-1 rounded text-gray-500">{scheme.id}</span>
                    <ArrowUpRight size={16} className="text-earth-900 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 text-sm font-bold text-earth-900 border-2 border-dashed border-earth-900/20 rounded-xl hover:bg-white transition">
              View All Schemes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper Component: Bento Grid Item
const StatsCard = ({ label, value, icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`${color} p-5 rounded-[1.5rem] flex flex-col items-center justify-center text-center shadow-sm h-32`}
  >
    <div className="mb-2 opacity-80">{icon}</div>
    <span className="text-2xl font-black">{value}</span>
    <span className="text-xs opacity-70 font-medium uppercase tracking-wide mt-1">{label}</span>
  </motion.div>
);

export default DashboardHome;