// src/pages/VillageDashboard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Calendar, Activity, CheckCircle2, Clock, 
  User, ArrowUpRight, ShieldCheck, Mail, Phone, Home 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ProjectDetailsModal from '../components/ProjectDetailsModal'; // Import the new modal

const VillageDashboard = () => {
  const { t } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]); // State for projects
  const [selectedProject, setSelectedProject] = useState(null); // State for modal
  const [loading, setLoading] = useState(true);

  // Mock Schemes (Static for now)
  const schemes = [
    { title: "Pradhan Mantri Gram Sadak Yojana", id: "PMGSY-2025", benefit: "Road Construction" },
    { title: "Jal Jeevan Mission", id: "JJM-24", benefit: "Clean Water" },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser || !storedUser.phone_number) {
           console.warn("No phone number found.");
           return;
        }

        // 1. Fetch User Profile
        const userRes = await fetch(`${import.meta.env.VITE_API_URL}/users/villagers/${storedUser.phone_number}`);
        if (!userRes.ok) throw new Error('Failed to fetch user');
        const user = await userRes.json();
        setUserData(user);

        // 2. Fetch Projects for this Village
        // Note: Village name matches the key in the API query param
        const projectsRes = await fetch(`${import.meta.env.VITE_API_URL}/projects/?village_name=${user.village_name}`);
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-earth-900">
        <Activity className="animate-spin mr-2" /> Loading...
      </div>
    );
  }

  if (!userData) return <div className="text-center p-10">User data not found.</div>;

  return (
    <div className="space-y-8">
      
      {/* --- ID CARD SECTION (No changes needed here) --- */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-earth-900 rounded-[2rem] p-8 md:p-10 text-sand-50 overflow-hidden shadow-2xl shadow-earth-900/20"
      >
         {/* ... (Keep existing ID Card JSX) ... */}
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
                     <span className="text-base text-sand-50/70">{userData.state}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatsCard label={t.dashboard.stats.active_projects} value={projects.length.toString().padStart(2, '0')} icon={<Activity className="text-clay-500" />} delay={0.1} />
        <StatsCard label={t.dashboard.stats.pending_complaints} value="01" icon={<Clock className="text-earth-900" />} delay={0.2} alert={true} />
        <StatsCard label="Upvotes Given" value="12" icon={<CheckCircle2 className="text-green-600" />} delay={0.3} />
        <StatsCard label="Schemes Applied" value="02" icon={<Calendar className="text-blue-600" />} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LOCAL PROJECTS SECTION (Dynamic) --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-earth-900 flex items-center gap-3">
              <div className="w-2 h-8 bg-clay-500 rounded-full" />
              {t.dashboard.local_projects} ({userData.village_name})
            </h2>
          </div>
          
          <div className="grid gap-4">
            {projects.length > 0 ? (
              projects.map((project, idx) => (
                <motion.div 
                  key={project.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedProject(project)} // OPEN MODAL
                  className="bg-white rounded-[1.5rem] p-6 border border-sand-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] font-bold uppercase tracking-wider text-clay-600 bg-clay-50 px-2 py-0.5 rounded">
                           {project.category}
                         </span>
                      </div>
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
                  
                  {/* Decorative Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-sand-100 mt-4">
                    <div className="text-xs text-earth-900/40 font-medium">
                       Budget: ₹{project.allocated_budget?.toLocaleString('en-IN')}
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
          </div>
        </div>

        {/* --- SCHEMES PANEL (Static) --- */}
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-bold text-earth-900">{t.dashboard.schemes_title}</h2>
          <div className="space-y-4">
            {schemes.map((scheme, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white p-6 rounded-[1.5rem] border border-sand-200 shadow-sm group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-clay-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                <h3 className="font-bold text-earth-900 relative z-10">{scheme.title}</h3>
                <p className="text-sm text-earth-900/60 mt-2 relative z-10">{scheme.benefit}</p>
                <div className="mt-4 flex justify-between items-end relative z-10">
                  <span className="text-xs font-mono bg-sand-100 px-2 py-1 rounded text-earth-900/50">{scheme.id}</span>
                  <div className="w-8 h-8 rounded-full bg-earth-900 text-sand-50 flex items-center justify-center group-hover:bg-clay-500 transition-colors">
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
             <button className="w-full py-4 text-sm font-bold text-earth-900/60 border-2 border-dashed border-sand-300 rounded-2xl hover:bg-white hover:border-earth-900 hover:text-earth-900 transition-all">
              + View All Schemes
            </button>
          </div>
        </div>
      </div>

      {/* --- RENDER MODAL --- */}
      <ProjectDetailsModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />

    </div>
  );
};

// Reusable Stats Component
const StatsCard = ({ label, value, icon, delay, alert }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className={`bg-white p-5 md:p-6 rounded-[2rem] border transition-all hover:shadow-xl ${
      alert ? 'border-clay-500/30 bg-clay-50' : 'border-sand-200'
    }`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl ${alert ? 'bg-white' : 'bg-sand-100'}`}>
        {icon}
      </div>
      {alert && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
    </div>
    <div className="text-3xl font-serif font-bold text-earth-900">{value}</div>
    <div className="text-xs font-bold text-earth-900/40 uppercase tracking-wide mt-1">{label}</div>
  </motion.div>
);

export default VillageDashboard;