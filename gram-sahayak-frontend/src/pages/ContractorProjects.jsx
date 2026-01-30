// src/pages/ContractorProjects.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Calendar, MapPin, ArrowUpRight, Clock } from 'lucide-react';
import { formatIndianCurrency } from '../utils/currency';

const ContractorProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser?.contractor_id) {
            console.error("No contractor ID");
            setLoading(false); return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/contractor/${storedUser.contractor_id}`);
        
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
          setFilteredProjects(data);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // --- UPDATED FILTER LOGIC ---
  useEffect(() => {
    if (filterStatus === 'All') {
      setFilteredProjects(projects);
    } else if (filterStatus === 'Allocated') {
      setFilteredProjects(projects.filter(p => p.status === 'Project Allocated'));
    } else if (filterStatus === 'Completed') {
      setFilteredProjects(projects.filter(p => p.status === 'Completed & Verified'));
    } else if (filterStatus === 'In Progress') {
      // Grouping all intermediate stages
      const inProgressStages = [
        'Foundation Laid', 
        'Construction Mid-Phase', 
        'Finishing Touches'
      ];
      setFilteredProjects(projects.filter(p => inProgressStages.includes(p.status)));
    }
  }, [filterStatus, projects]);

  const getStatusColor = (status) => {
    if (status === 'Completed & Verified') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'Project Allocated') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-orange-50 text-orange-700 border-orange-200'; // For In Progress stages
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900">My Projects</h1>
          <p className="text-earth-900/60 mt-1">Manage your allocated works.</p>
        </div>
        
        {/* Updated Filter Buttons */}
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-sand-200 shadow-sm overflow-x-auto">
          {['All', 'Allocated', 'In Progress', 'Completed'].map((status) => (
            <button key={status} onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${filterStatus === status ? 'bg-earth-900 text-white shadow-md' : 'text-earth-900/60 hover:bg-sand-100 hover:text-earth-900'}`}>
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-earth-900/50 flex flex-col items-center">
          <div className="animate-spin mb-4"><Clock /></div>Loading projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 text-center bg-sand-50 rounded-[2rem] border-2 border-dashed border-sand-300">
          <Briefcase size={48} className="mx-auto text-earth-900/20 mb-4" />
          <h3 className="text-xl font-bold text-earth-900 mb-2">No Projects Found</h3>
          <p className="text-earth-900/40">Try changing the filter category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div key={project.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => navigate(`/contractor-projects/${project.id}`)}
                className="group bg-white rounded-[2rem] p-6 border border-sand-200 hover:border-clay-500/30 hover:shadow-xl transition-all cursor-pointer flex flex-col h-full relative overflow-hidden">
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-sand-100 flex items-center justify-center text-earth-900/40 group-hover:bg-earth-900 group-hover:text-white transition-colors">
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                <div className="relative z-10 mb-6">
                  <h3 className="font-bold text-xl text-earth-900 mb-2 line-clamp-2 leading-tight">{project.project_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-earth-900/60 mb-1">
                    <MapPin size={14} className="text-clay-500" /> <span className="truncate">{project.location}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-sand-100 flex items-center justify-between relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-earth-900/40 uppercase tracking-wider">Budget</span>
                    <span className="font-serif font-bold text-lg text-earth-900">{formatIndianCurrency(project.allocated_budget)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ContractorProjects;