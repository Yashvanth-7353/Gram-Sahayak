// src/pages/VillageDashboard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Calendar, Activity, CheckCircle2, Clock, 
  User, ArrowUpRight, ShieldCheck, Mail, Phone, Home,
  Wallet, Zap, Smile, Users, ChevronDown 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
import { formatIndianCurrency } from '../utils/currency';

const VillageDashboard = () => {
  const { t } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [schemes, setSchemes] = useState([]); 
  const [stats, setStats] = useState({
    budget_used: 0,
    issues_resolved: 0,
    village_mood: "Neutral 😐",
    personal_impact: 0,
    next_meeting: "TBD"
  });
  
  // --- Pagination State ---
  const [visibleProjects, setVisibleProjects] = useState(4);
  const [visibleSchemes, setVisibleSchemes] = useState(4);

  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser || !storedUser.phone_number) {
           console.warn("No session found.");
           return;
        }

        // 1. Fetch User Profile
        const userRes = await fetch(`${import.meta.env.VITE_API_URL}/users/villagers/${storedUser.phone_number}`);
        if (!userRes.ok) throw new Error('Failed to fetch user');
        const user = await userRes.json();
        setUserData(user);

        // 2. Fetch Projects (FIXED URL)
        // OLD: /projects/?village_name=...
        // NEW: /projects/village/...
        const projectsRes = await fetch(`${import.meta.env.VITE_API_URL}/projects/village/${user.village_name}`);
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }

        // 3. Fetch Dashboard Stats
        const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/stats?villager_id=${user.id}`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // 4. Fetch Government Schemes
        const schemesRes = await fetch(`${import.meta.env.VITE_API_URL}/schemes/`);
        if (schemesRes.ok) {
          const schemesData = await schemesRes.json();
          setSchemes(schemesData);
        }

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- Handlers for Load More ---
  const loadMoreProjects = () => setVisibleProjects(prev => prev + 4);
  const loadMoreSchemes = () => setVisibleSchemes(prev => prev + 4);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-earth-900">
        <Activity className="animate-spin mr-2" /> Loading Dashboard...
      </div>
    );
  }

  if (!userData) return <div className="text-center p-10">User data not found.</div>;

  return (
    <div className="space-y-8">
      
      {/* --- 1. ID CARD SECTION --- */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-earth-900 rounded-[2rem] p-8 md:p-10 text-sand-50 overflow-hidden shadow-2xl shadow-earth-900/20"
      >
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#E76F51 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        <div className="relative z-10">
          <div className="border-b border-sand-50/10 pb-6 mb-6">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-sand-50 mb-2">
              {userData.name}
            </h1>
            <div className="flex items-center gap-3 text-clay-400 font-bold tracking-widest text-xs uppercase">
               <ShieldCheck size={16} />
               <span>Villager ID: {userData.id.slice(-6).toUpperCase()}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
            <div className="space-y-4">
              <h3 className="text-sand-50/40 text-sm font-bold uppercase tracking-wider">Personal</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <User size={18} className="text-clay-500" />
                   <span className="text-lg">{userData.age} Years, {userData.gender}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sand-50/40 text-sm font-bold uppercase tracking-wider">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <Phone size={18} className="text-clay-500" />
                   <span className="text-lg tracking-wide">{userData.phone_number}</span>
                </div>
                <div className="flex items-center gap-3">
                   <Mail size={18} className="text-clay-500" />
                   <span className="text-lg">{userData.email}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sand-50/40 text-sm font-bold uppercase tracking-wider">Location</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                   <Home size={18} className="text-clay-500 mt-1" />
                   <div className="flex flex-col text-lg leading-snug">
                     <span>{userData.village_name}</span>
                     <span className="text-base text-sand-50/70">{userData.taluk}, {userData.district}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- 2. STATS GRID --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        <StatsCard label="Budget Utilized" value={formatIndianCurrency(stats.budget_used)} icon={<Wallet className="text-clay-500" />} delay={0.1} />
        <StatsCard label="Issues Resolved" value={stats.issues_resolved} icon={<CheckCircle2 className="text-green-600" />} delay={0.2} />
        <StatsCard label="Village Mood" value={stats.village_mood} icon={<Smile className="text-yellow-600" />} delay={0.3} />
        <StatsCard label="My Impact" value={stats.personal_impact} icon={<Zap className="text-purple-600" />} delay={0.4} />
        <StatsCard label="Next Gram Sabha" value={stats.next_meeting} icon={<Users className="text-blue-600" />} delay={0.5} isText={true} className="col-span-2 md:col-span-2 lg:col-span-1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- 3. LOCAL PROJECTS SECTION --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-earth-900 flex items-center gap-3">
              <div className="w-2 h-8 bg-clay-500 rounded-full" />
              {t.dashboard.local_projects}
            </h2>
          </div>
          
          <div className="grid gap-4">
            {projects.length > 0 ? (
              // SLICING PROJECTS ARRAY
              projects.slice(0, visibleProjects).map((project, idx) => (
                <motion.div 
                  key={project.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedProject(project)}
                  className="bg-white rounded-[1.5rem] p-6 border border-sand-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-clay-600 bg-clay-50 px-2 py-0.5 rounded mb-1 inline-block">
                        {project.category}
                      </span>
                      <h3 className="text-lg font-bold text-earth-900 group-hover:text-clay-600 transition-colors">
                        {project.project_name}
                      </h3>
                      <p className="text-sm text-earth-900/60 mt-1 line-clamp-2">{project.description}</p>
                    </div>
                    
                    <span className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wide ${
                      project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      project.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-sand-100 mt-4">
                    <div className="text-xs text-earth-900/40 font-medium">
                       Budget: {formatIndianCurrency(project.allocated_budget)}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-earth-900 hover:underline">
                       View Details <ArrowUpRight size={14} />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center bg-sand-100 rounded-[2rem] border border-dashed border-sand-300 text-earth-900/50">
                No active projects found in {userData.village_name}.
              </div>
            )}
            
            {/* View More Button for Projects */}
            {visibleProjects < projects.length && (
              <button 
                onClick={loadMoreProjects}
                className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-earth-900/60 border border-sand-300 rounded-xl hover:bg-white hover:border-clay-500 hover:text-clay-600 transition-all"
              >
                View More Projects <ChevronDown size={16} />
              </button>
            )}
          </div>
        </div>

        {/* --- 4. GOVERNMENT SCHEMES PANEL --- */}
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-bold text-earth-900">{t.dashboard.schemes_title}</h2>
          <div className="space-y-4">
            {schemes.length > 0 ? (
              // SLICING SCHEMES ARRAY
              schemes.slice(0, visibleSchemes).map((scheme, idx) => (
                <motion.div 
                  key={scheme.id || idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-white p-6 rounded-[1.5rem] border border-sand-200 shadow-sm group cursor-pointer relative overflow-hidden flex flex-col h-full"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-clay-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                  
                  <div className="relative z-10">
                    <h3 className="font-bold text-earth-900 text-lg leading-tight mb-2">
                      {scheme.scheme_name}
                    </h3>
                    
                    <p className="text-sm text-earth-900/60 line-clamp-3 mb-4">
                      {scheme.scheme_desc}
                    </p>
                    
                    <div className="flex justify-between items-end mt-auto">
                      <span className="text-[10px] font-mono bg-sand-100 px-2 py-1 rounded text-earth-900/50 uppercase tracking-wider">
                        {scheme.scheme_id}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-earth-900 text-sand-50 flex items-center justify-center group-hover:bg-clay-500 transition-colors shadow-lg">
                        <ArrowUpRight size={16} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
               <div className="p-6 text-center bg-sand-50 rounded-2xl border border-dashed border-sand-300 text-sm text-earth-900/40">
                 No schemes available at the moment.
               </div>
            )}
            
            {/* View More Button for Schemes */}
            {visibleSchemes < schemes.length && (
              <button 
                onClick={loadMoreSchemes}
                className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-earth-900/60 border border-sand-300 rounded-xl hover:bg-white hover:border-clay-500 hover:text-clay-600 transition-all"
              >
                View More Schemes <ChevronDown size={16} />
              </button>
            )}
          </div>
        </div>

      </div>

      <ProjectDetailsModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />

    </div>
  );
};

// Reusable Stats Component
const StatsCard = ({ label, value, icon, delay, isText, className = "" }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className={`bg-white p-5 rounded-[2rem] border border-sand-200 transition-all hover:shadow-xl flex flex-col h-full ${className}`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2.5 rounded-2xl bg-sand-100 shrink-0">
        {icon}
      </div>
      <div className="text-xs font-bold text-earth-900/50 uppercase tracking-wide leading-tight">
        {label}
      </div>
    </div>
    <div className={`mt-auto font-serif font-bold text-earth-900 leading-tight break-all ${isText ? 'text-lg' : 'text-2xl md:text-3xl'}`}>
      {value}
    </div>
  </motion.div>
);

export default VillageDashboard;