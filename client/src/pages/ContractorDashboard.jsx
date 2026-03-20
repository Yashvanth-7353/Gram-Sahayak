// src/pages/ContractorDashboard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, CheckCircle2, AlertTriangle, Clock, 
  Wallet, Phone, Mail, ArrowUpRight
} from 'lucide-react';
import { formatIndianCurrency } from '../utils/currency';
import ProjectDetailsModal from '../components/ProjectDetailsModal';

const ContractorDashboard = () => {
  const [contractorData, setContractorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser || !storedUser.contractor_id) {
           console.warn("No contractor session found.");
           return;
        }

        // 1. Fetch Full Contractor Dashboard Data (Profile + Stats + Projects)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/contractors/${storedUser.contractor_id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch contractor data');
        }

        const data = await response.json();
        setContractorData(data);

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center text-earth-900">
      Loading Contractor Portal...
    </div>
  );
  
  if (!contractorData) return <div className="p-10 text-center text-red-500">Contractor data not found.</div>;

  return (
    <div className="space-y-8">
      
      {/* --- 1. CONTRACTOR PROFILE CARD --- */}
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
              {contractorData.name}
            </h1>
            <div className="flex items-center gap-2 text-clay-400 font-bold tracking-widest text-xs uppercase">
               <Briefcase size={14} />
               <span>ID: {contractorData.contractor_id}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
               <h3 className="text-sand-50/40 text-xs font-bold uppercase tracking-wider">Mobile</h3>
               <div className="flex items-center gap-3 text-lg">
                  <Phone size={18} className="text-clay-500" /> 
                  <span className="tracking-wide">{contractorData.phone_number}</span>
               </div>
            </div>
            <div className="space-y-3">
               <h3 className="text-sand-50/40 text-xs font-bold uppercase tracking-wider">Email</h3>
               <div className="flex items-center gap-3 text-lg">
                  <Mail size={18} className="text-clay-500" /> 
                  <span>{contractorData.email}</span>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- 2. STATS GRID (From API Response) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatsCard 
          label="Total Contract Value" 
          value={formatIndianCurrency(contractorData.stats.total_contract_value)} 
          icon={<Wallet className="text-clay-500" />} 
          delay={0.1} 
        />
        <StatsCard 
          label="Active Projects" 
          value={contractorData.stats.active_projects_count} 
          icon={<Briefcase className="text-blue-600" />} 
          delay={0.2} 
        />
        <StatsCard 
          label="Projects Completed" 
          value={contractorData.stats.projects_completed_count} 
          icon={<CheckCircle2 className="text-green-600" />} 
          delay={0.3} 
        />
        <StatsCard 
          label="Pending Issues" 
          value={contractorData.stats.pending_issues_count} 
          icon={<AlertTriangle className="text-red-500" />} 
          delay={0.4} 
        />
      </div>

      {/* --- 3. ACTIVE WORK ORDERS (From API Response) --- */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-earth-900 flex items-center gap-3">
            <div className="w-2 h-8 bg-clay-500 rounded-full" />
            Active Work Orders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contractorData.active_projects.length > 0 ? (
            contractorData.active_projects.map((project, idx) => (
              <motion.div 
                key={project.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedProject(project)}
                className="bg-white p-6 rounded-[2rem] border border-sand-200 hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-earth-900/60 bg-sand-100 px-2 py-1 rounded">
                    <CheckCircle2 size={12} /> {project.status}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-bold text-xl text-earth-900 mb-2 group-hover:text-clay-600 transition-colors">
                  {project.project_name}
                </h3>
                <p className="text-sm text-earth-900/60 mb-6 flex items-center gap-2">
                   <Clock size={14} /> Start: {new Date(project.start_date).toLocaleDateString()}
                </p>

                {/* Deadlines & Value */}
                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xs text-earth-900/60 font-bold">{project.location}</span>
                    <div className="font-bold text-earth-900">
                      {formatIndianCurrency(project.allocated_budget)}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="pt-4 border-t border-sand-100">
                    <button className="w-full py-2 rounded-xl bg-sand-50 text-earth-900 text-sm font-bold group-hover:bg-earth-900 group-hover:text-white transition-colors flex items-center justify-center gap-2">
                      Manage Project <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-sand-50 rounded-[2rem] border-2 border-dashed border-sand-300">
              <Briefcase size={40} className="mx-auto text-earth-900/20 mb-4" />
              <h3 className="text-xl font-bold text-earth-900 mb-2">No Active Projects</h3>
              <p className="text-earth-900/60">You don't have any active projects currently.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reusing Modal (It handles partial data gracefully) */}
      <ProjectDetailsModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </div>
  );
};

// Reusable Stats Component
const StatsCard = ({ label, value, icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="bg-white p-5 rounded-[2rem] border border-sand-200 hover:shadow-xl transition-all flex flex-col h-full"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2.5 rounded-2xl bg-sand-100 shrink-0">
        {icon}
      </div>
      <div className="text-xs font-bold text-earth-900/50 uppercase tracking-wide leading-tight">
        {label}
      </div>
    </div>
    <div className="mt-auto font-serif font-bold text-earth-900 text-2xl md:text-3xl leading-tight break-all">
      {value}
    </div>
  </motion.div>
);

export default ContractorDashboard;