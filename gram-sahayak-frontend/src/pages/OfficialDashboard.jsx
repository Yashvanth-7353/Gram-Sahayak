// src/pages/OfficialDashboard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Users, AlertTriangle, Wallet, 
  TrendingUp, Activity, CheckCircle2, 
  Bot, Sparkles, ArrowRight 
} from 'lucide-react';
import { formatIndianCurrency } from '../utils/currency';
import { Link, useNavigate } from 'react-router-dom';

const OfficialDashboard = () => {
  const navigate = useNavigate();
  const [officialData, setOfficialData] = useState(null);
  const [stats, setStats] = useState({
    budgetTotal: 0,
    budgetSpent: 0,
    activeProjects: 0,
    pendingComplaints: 0,
    villageMood: "Analyzing..."
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || !storedUser.government_id) return;

        // 1. Fetch Official Profile
        const userRes = await fetch(`${import.meta.env.VITE_API_URL}/users/officials/${storedUser.government_id}`);
        const userData = await userRes.json();
        setOfficialData(userData);

        // 2. Fetch Projects (for Budget & Status)
        const projectsRes = await fetch(`${import.meta.env.VITE_API_URL}/projects/village/${userData.village_name}`);
        const projects = await projectsRes.json();

        // 3. Calculate Stats
        const totalBudget = projects.reduce((acc, p) => acc + (p.allocated_budget || 0), 0);
        const spentBudget = projects
          .filter(p => p.status === 'Completed & Verified' || p.status === 'In Progress' || p.status === 'Foundation Laid' || p.status === 'Construction Mid-Phase' || p.status === 'Finishing Touches')
          .reduce((acc, p) => acc + (p.allocated_budget || 0), 0);
        
        // Mock Insight Fetch
        const sentimentScore = 0.4; 

        setStats({
          budgetTotal: totalBudget,
          budgetSpent: spentBudget,
          activeProjects: projects.filter(p => p.status !== 'Completed & Verified' && p.status !== 'Project Allocated').length,
          pendingComplaints: userData.assigned_complaints?.length || 0,
          villageMood: sentimentScore > 0.2 ? "Positive 😊" : sentimentScore < -0.2 ? "Critical 😡" : "Neutral 😐"
        });

      } catch (error) {
        console.error("Dashboard load failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-earth-900">Loading Admin Dashboard...</div>;
  if (!officialData) return <div className="p-10 text-center text-red-500">Access Denied.</div>;

  return (
    <div className="space-y-8">
      
      {/* --- 1. HEADER: PROFILE & AI TOOL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-earth-900 rounded-[2rem] p-8 text-sand-50 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-clay-500 rounded-full blur-[60px] opacity-50" />
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-white/10">
              Admin Access
            </span>
            <h1 className="text-3xl font-serif font-bold mb-1">{officialData.name}</h1>
            
            {/* FIXED: Changed text color to visible light shade */}
            <p className="text-sand-50/60 text-sm font-bold mb-6">
              Village: {officialData.village_name}
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-4 text-sm font-bold opacity-80">
            <div className="flex items-center gap-2">
              <Building2 size={16} /> ID: {officialData.government_id}
            </div>
          </div>
        </motion.div>

        {/* Community Pulse AI Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ y: -2 }}
          onClick={() => navigate('/dashboard/community-ai')}
          className="lg:col-span-2 bg-gradient-to-br from-earth-900 to-earth-800 p-8 rounded-[2rem] text-white shadow-xl shadow-earth-900/20 cursor-pointer relative overflow-hidden group flex flex-col justify-center"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Bot size={140} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner shrink-0">
              <Sparkles size={32} className="text-sand-100" />
            </div>
            <div>
                <h3 className="text-2xl font-bold mb-2">Community Pulse AI</h3>
                <p className="text-white/60 text-sm mb-0 leading-relaxed max-w-lg">
                Analyze community discussions, identify trending needs, and summarize grievances using advanced AI insights.
                </p>
            </div>
            <div className="md:ml-auto mt-4 md:mt-0">
                <div className="inline-flex items-center gap-2 text-sm font-bold bg-white/20 px-6 py-3 rounded-xl backdrop-blur-md group-hover:bg-white group-hover:text-earth-900 transition-all whitespace-nowrap">
                    Launch Tool <ArrowRight size={16} />
                </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- 2. KEY METRICS (Backend Data) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatsCard 
          label="Budget Utilized" 
          value={formatIndianCurrency(stats.budgetSpent)} 
          subValue={`of ${formatIndianCurrency(stats.budgetTotal)}`}
          icon={<Wallet className="text-clay-500" />} 
          delay={0.1} 
        />
        <StatsCard 
          label="Active Projects" 
          value={stats.activeProjects} 
          icon={<Building2 className="text-blue-600" />} 
          delay={0.2} 
        />
        <StatsCard 
          label="Pending Grievances" 
          value={stats.pendingComplaints} 
          icon={<AlertTriangle className="text-red-500" />} 
          delay={0.3} 
          highlight={stats.pendingComplaints > 5}
        />
        <StatsCard 
          label="Village Mood" 
          value={stats.villageMood} 
          icon={<Users className="text-purple-600" />} 
          delay={0.4} 
          isText={true}
        />
      </div>

      {/* --- 3. QUICK ACTIONS (Full Width) --- */}
      {/* Removed System Alerts, expanded Quick Actions */}
      <div className="bg-sand-50 rounded-[2rem] p-6 border border-sand-200">
         <div className="flex justify-between items-center mb-6">
           <h3 className="font-bold text-earth-900 text-lg">Quick Actions</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Link to="projects" className="bg-white p-4 rounded-xl border border-sand-200 hover:border-clay-500 hover:shadow-md transition-all text-left group flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <Building2 size={24} />
              </div>
              <div>
                <div className="font-bold text-earth-900">New Project</div>
                <div className="text-xs text-earth-900/50 mt-1">Start infrastructure</div>
              </div>
           </Link>
           <Link to="complaints" className="bg-white p-4 rounded-xl border border-sand-200 hover:border-clay-500 hover:shadow-md transition-all text-left group flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className="font-bold text-earth-900">Resolve Issues</div>
                <div className="text-xs text-earth-900/50 mt-1">{stats.pendingComplaints} pending</div>
              </div>
           </Link>
         </div>
      </div>

    </div>
  );
};

// Reusable Stats Component
const StatsCard = ({ label, value, subValue, icon, delay, highlight, isText }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className={`bg-white p-5 rounded-[2rem] border transition-all flex flex-col h-full ${
      highlight ? 'border-red-200 shadow-lg shadow-red-50' : 'border-sand-200 hover:shadow-xl'
    }`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2.5 rounded-2xl shrink-0 ${highlight ? 'bg-red-50' : 'bg-sand-100'}`}>
        {icon}
      </div>
      <div className="text-xs font-bold text-earth-900/50 uppercase tracking-wide leading-tight">
        {label}
      </div>
    </div>
    <div className="mt-auto">
      <div className={`font-serif font-bold text-earth-900 leading-tight break-all ${isText ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
        {value}
      </div>
      {subValue && (
        <div className="text-xs font-medium text-earth-900/40 mt-1">{subValue}</div>
      )}
    </div>
  </motion.div>
);

export default OfficialDashboard;