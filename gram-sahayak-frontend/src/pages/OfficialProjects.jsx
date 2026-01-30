// src/pages/OfficialProjects.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Plus, Search, MapPin, 
  User, Loader2, ChevronDown, Save, Filter, X,
  Calendar, ImageIcon, Clock, CheckCircle2
} from 'lucide-react';
import { formatIndianCurrency } from '../utils/currency';

const OfficialProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem('user'));

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!storedUser?.government_id) return;
        
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/users/officials/${storedUser.government_id}`);
        const profile = await profileRes.json();
        
        const projectsRes = await fetch(`${import.meta.env.VITE_API_URL}/projects/village/${profile.village_name}`);
        if (projectsRes.ok) {
            const projectsData = await projectsRes.json();
            setProjects(projectsData);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [storedUser?.government_id]); 

  // --- UPDATE STATUS (FIXED) ---
  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      // FIXED: Send status in JSON body to match Pydantic model 'ProjectUpdateStatus'
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/${projectId}/status`, { 
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }) 
      });

      if (response.ok) {
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, status: newStatus } : p
        ));
        setSelectedProject(null);
        alert("Project Status Updated Successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to update status: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error while updating status.");
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.contractor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900">Manage Projects</h1>
          <p className="text-earth-900/60 mt-1">Oversee infrastructure development in your village.</p>
        </div>
        <button 
          onClick={() => navigate('/create-project')}
          className="bg-earth-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-earth-800 transition-all shadow-lg shadow-earth-900/20"
        >
          <Plus size={20} /> New Project
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-900/30" size={20} />
          <input type="text" placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-sand-200 outline-none focus:border-clay-500" />
        </div>
        <div className="relative w-full md:w-64">
           <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-900/30" size={20} />
           <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
             className="w-full pl-12 pr-10 py-4 bg-white rounded-2xl border border-sand-200 outline-none focus:border-clay-500 appearance-none cursor-pointer font-medium text-earth-900">
             <option value="All">All Status</option>
             <option value="Project Allocated">Project Allocated</option>
             <option value="Foundation Laid">Foundation Laid</option>
             <option value="Construction Mid-Phase">Construction Mid-Phase</option>
             <option value="Finishing Touches">Finishing Touches</option>
             <option value="Completed & Verified">Completed & Verified</option>
           </select>
           <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-900/30 pointer-events-none" size={16} />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-earth-900/40" /></div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-sand-50 rounded-[2rem] border-2 border-dashed border-sand-300">
          <Building2 size={48} className="mx-auto text-earth-900/20 mb-4" />
          <h3 className="text-xl font-bold text-earth-900 mb-2">No Projects Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <motion.div key={project.id} layoutId={project.id} onClick={() => setSelectedProject(project)}
              className="group bg-white p-6 rounded-[2rem] border border-sand-200 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  project.status === 'Completed & Verified' ? 'bg-green-100 text-green-700' :
                  project.status === 'Project Allocated' ? 'bg-blue-50 text-blue-700' :
                  'bg-orange-50 text-orange-700'
                }`}>
                  {project.status}
                </span>
                <span className="text-xs font-bold text-earth-900/40 bg-sand-100 px-2 py-1 rounded-md">{project.category}</span>
              </div>
              <h3 className="font-bold text-xl text-earth-900 mb-2 line-clamp-2">{project.project_name}</h3>
              <div className="space-y-2 mb-6 text-sm text-earth-900/60">
                <div className="flex items-center gap-2"><User size={14} className="text-clay-500" /> <span className="truncate">{project.contractor_name}</span></div>
                <div className="flex items-center gap-2"><MapPin size={14} className="text-clay-500" /> <span className="truncate">{project.location}</span></div>
              </div>
              <div className="pt-4 border-t border-sand-100 flex justify-between items-center relative z-10">
                <div><p className="text-[10px] font-bold text-earth-900/40 uppercase">Budget</p><p className="font-serif font-bold text-lg text-earth-900">{formatIndianCurrency(project.allocated_budget)}</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedProject && <ProjectDetailsUpdateModal project={selectedProject} onClose={() => setSelectedProject(null)} onUpdate={handleUpdateStatus} />}
      </AnimatePresence>
    </div>
  );
};

const ProjectDetailsUpdateModal = ({ project, onClose, onUpdate }) => {
  const [status, setStatus] = useState(project.status);
  const [updating, setUpdating] = useState(false);
  
  const getAvailableStatuses = (current) => {
    const stages = [
        "Project Allocated", 
        "Foundation Laid", 
        "Construction Mid-Phase", 
        "Finishing Touches", 
        "Completed & Verified"
    ];

    const currentIndex = stages.indexOf(current);
    if (currentIndex === -1) return stages;

    const nextStage = stages[currentIndex + 1];
    let options = [current];
    if (nextStage) options.push(nextStage);
    options.push("Halted");
    
    if (current === "Halted") return stages;

    return options;
  };
  
  const availableOptions = getAvailableStatuses(project.status);
  
  const handleUpdate = async () => {
    if (!window.confirm("Update Status? This will unlock the next phase for the contractor.")) return;
    setUpdating(true);
    await onUpdate(project.id, status);
    setUpdating(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* LEFT SIDE: DETAILS & IMAGES (Scrollable) */}
        <div className="p-8 md:w-3/5 overflow-y-auto custom-scrollbar bg-white">
           <div className="mb-6">
             <div className="flex justify-between items-start">
               <span className="text-[10px] font-bold text-earth-900/40 uppercase tracking-widest bg-sand-100 px-2 py-1 rounded">
                 {project.category}
               </span>
               <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                 project.status === 'Completed & Verified' ? 'text-green-700 border-green-200 bg-green-50' : 
                 'text-blue-700 border-blue-200 bg-blue-50'
               }`}>
                 {project.status}
               </span>
             </div>
             <h2 className="text-3xl font-serif font-bold text-earth-900 mt-3 leading-tight">{project.project_name}</h2>
             <p className="text-earth-900/60 text-sm mt-3 leading-relaxed">{project.description}</p>
           </div>
           
           <div className="grid grid-cols-2 gap-4 text-sm mb-8">
              <div className="p-4 bg-sand-50 rounded-2xl border border-sand-100">
                 <p className="text-[10px] font-bold text-earth-900/40 uppercase mb-1">Budget</p>
                 <p className="font-bold text-earth-900 text-lg">{formatIndianCurrency(project.allocated_budget)}</p>
              </div>
              <div className="p-4 bg-sand-50 rounded-2xl border border-sand-100">
                 <p className="text-[10px] font-bold text-earth-900/40 uppercase mb-1">Contractor</p>
                 <p className="font-bold text-earth-900 truncate">{project.contractor_name}</p>
                 <p className="text-xs text-earth-900/40 truncate">{project.contractor_id}</p>
              </div>
              <div className="p-4 bg-sand-50 rounded-2xl border border-sand-100">
                 <p className="text-[10px] font-bold text-earth-900/40 uppercase mb-1">Start Date</p>
                 <div className="flex items-center gap-2 font-medium text-earth-900">
                    <Calendar size={14} className="text-clay-500"/> {formatDate(project.start_date)}
                 </div>
              </div>
              <div className="p-4 bg-sand-50 rounded-2xl border border-sand-100">
                 <p className="text-[10px] font-bold text-earth-900/40 uppercase mb-1">Due Date</p>
                 <div className="flex items-center gap-2 font-medium text-earth-900">
                    <Clock size={14} className="text-clay-500"/> {formatDate(project.due_date)}
                 </div>
              </div>
           </div>

            {project.milestones && project.milestones.length > 0 && (
                <div className="mb-8">
                    <h3 className="font-bold text-earth-900 text-sm mb-4 flex items-center gap-2">
                        <Loader2 size={16} className="text-clay-500"/> Milestone History
                    </h3>
                    <div className="space-y-3 pl-2 border-l-2 border-sand-200">
                        {project.milestones.map((m, i) => (
                            <div key={i} className="pl-4 relative">
                                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-sand-100 border-2 border-white box-content shadow-sm flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-clay-500"></div>
                                </div>
                                <p className="text-sm text-earth-900/80">{typeof m === 'string' ? m : m.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

           <div>
               <h3 className="font-bold text-earth-900 text-sm mb-4 flex items-center gap-2">
                   <ImageIcon size={16} className="text-clay-500"/> Site Progress Photos
               </h3>
               {project.images && project.images.length > 0 ? (
                   <div className="grid grid-cols-2 gap-3">
                       {project.images.map((img, idx) => (
                           <div key={idx} className="group relative rounded-xl overflow-hidden bg-sand-100 border border-sand-200 aspect-video cursor-pointer">
                               <img 
                                   src={img.url} 
                                   alt="Progress" 
                                   className="w-full h-full object-cover transition-transform group-hover:scale-105"
                               />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                   <p className="text-white text-xs font-medium truncate">{img.description}</p>
                                   <p className="text-white/60 text-[10px]">{formatDate(img.uploaded_at)}</p>
                               </div>
                           </div>
                       ))}
                   </div>
               ) : (
                   <div className="p-8 text-center bg-sand-50 rounded-2xl border border-dashed border-sand-300">
                       <ImageIcon size={32} className="mx-auto text-earth-900/20 mb-2"/>
                       <p className="text-sm text-earth-900/40">No progress images uploaded yet.</p>
                   </div>
               )}
           </div>
        </div>

        {/* RIGHT SIDE: STATUS UPDATE (Fixed) */}
        <div className="bg-sand-50 p-8 md:w-2/5 border-l border-sand-200 flex flex-col shadow-[inset_10px_0_20px_-10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-earth-900 text-lg flex items-center gap-2">
              <Save size={18} className="text-clay-500" /> Update Phase
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <X size={20} className="text-earth-900/50 hover:text-red-500" />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            <div>
                <label className="block text-xs font-bold text-earth-900/60 uppercase mb-2">Select Next Stage</label>
                <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="w-full p-4 bg-white border border-sand-200 rounded-xl outline-none focus:border-clay-500 focus:ring-4 focus:ring-clay-500/10 transition-all font-medium text-earth-900"
                >
                    {availableOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs text-blue-800 leading-relaxed flex gap-2">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5"/>
                    <span>
                        <strong>Approval Required:</strong> Moving to the next stage confirms you have verified the contractor's photos for the current stage.
                    </span>
                </p>
            </div>
          </div>

          <button 
            onClick={handleUpdate} 
            disabled={updating} 
            className="w-full mt-6 py-4 bg-earth-900 text-white rounded-xl font-bold hover:bg-earth-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-earth-900/20 active:scale-[0.98]"
          >
            {updating ? <Loader2 className="animate-spin" size={18} /> : "Confirm Stage Update"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OfficialProjects;