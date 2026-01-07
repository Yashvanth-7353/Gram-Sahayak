import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Plus, Search, MapPin, Calendar, 
  User, CheckCircle2, Clock, AlertCircle, X, 
  Loader2, ChevronDown, Save, Filter
} from 'lucide-react';
import { formatIndianCurrency } from '../utils/currency';

const OfficialProjects = () => {
  const [projects, setProjects] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // User Context
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const officialId = storedUser?.id;

  // --- 1. INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!officialId) return;

        const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/users/officials/${storedUser.government_id}`);
        const profile = await profileRes.json();
        
        const projectsRes = await fetch(`${import.meta.env.VITE_API_URL}/projects/?village_name=${profile.village_name}`);
        const projectsData = await projectsRes.json();
        setProjects(projectsData);

        const contractorsRes = await fetch(`${import.meta.env.VITE_API_URL}/users/contractors`);
        const contractorsData = await contractorsRes.json();
        setContractors(contractorsData);

      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [officialId, storedUser.government_id]);

  // --- 2. CREATE PROJECT HANDLER ---
  const handleCreateProject = async (formData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/?official_id=${officialId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        const newProject = { ...formData, id: result.id, status: 'Pending', milestones: ['Project Initiated'] };
        setProjects([newProject, ...projects]);
        setIsCreateOpen(false);
        alert("Project Created Successfully!");
      } else {
        alert("Failed to create project");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- 3. UPDATE STATUS HANDLER ---
  const handleUpdateStatus = async (projectId, newStatus, newMilestone) => {
    try {
      const url = new URL(`${import.meta.env.VITE_API_URL}/projects/${projectId}/status`);
      url.searchParams.append("status", newStatus);
      url.searchParams.append("official_id", officialId);
      if (newMilestone) url.searchParams.append("new_milestone", newMilestone);

      const response = await fetch(url, { method: 'PATCH' });

      if (response.ok) {
        setProjects(prev => prev.map(p => 
          p.id === projectId 
            ? { ...p, status: newStatus, milestones: newMilestone ? [...(p.milestones || []), newMilestone] : p.milestones }
            : p
        ));
        setSelectedProject(null);
        alert("Project Status Updated Successfully!");
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- FILTER LOGIC ---
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.contractor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900">Manage Projects</h1>
          <p className="text-earth-900/60 mt-1">Oversee infrastructure development in your village.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-earth-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-earth-800 transition-all shadow-lg shadow-earth-900/20"
        >
          <Plus size={20} /> New Project
        </button>
      </div>

      {/* SEARCH & FILTER TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-900/30" size={20} />
          <input 
            type="text"
            placeholder="Search projects by name or contractor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-sand-200 outline-none focus:border-clay-500 focus:ring-1 focus:ring-clay-500 transition-all"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative w-full md:w-64">
           <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-900/30" size={20} />
           <select
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value)}
             className="w-full pl-12 pr-10 py-4 bg-white rounded-2xl border border-sand-200 outline-none focus:border-clay-500 appearance-none cursor-pointer font-medium text-earth-900"
           >
             <option value="All">All Status</option>
             <option value="Pending">Pending</option>
             <option value="In Progress">In Progress</option>
             <option value="Completed">Completed</option>
             <option value="Halted">Halted</option>
           </select>
           <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-900/30 pointer-events-none" size={16} />
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-earth-900/40" /></div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-sand-50 rounded-[2rem] border-2 border-dashed border-sand-300">
          <Building2 size={48} className="mx-auto text-earth-900/20 mb-4" />
          <h3 className="text-xl font-bold text-earth-900 mb-2">No Projects Found</h3>
          <p className="text-earth-900/60">Try adjusting your filters or create a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              layoutId={project.id}
              onClick={() => setSelectedProject(project)}
              className="group bg-white p-6 rounded-[2rem] border border-sand-200 hover:shadow-xl hover:border-clay-500/30 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  project.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                  'bg-orange-50 text-orange-700'
                }`}>
                  {project.status}
                </span>
                <span className="text-xs font-bold text-earth-900/40 bg-sand-100 px-2 py-1 rounded-md">
                  {project.category}
                </span>
              </div>

              <h3 className="font-bold text-xl text-earth-900 mb-2 line-clamp-2">{project.project_name}</h3>
              
              <div className="space-y-2 mb-6 text-sm text-earth-900/60">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-clay-500" /> 
                  <span className="truncate">{project.contractor_name || "Unassigned"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-clay-500" /> 
                  <span className="truncate">{project.location}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-sand-100 flex justify-between items-center relative z-10">
                <div>
                   <p className="text-[10px] font-bold text-earth-900/40 uppercase">Budget</p>
                   <p className="font-serif font-bold text-lg text-earth-900">{formatIndianCurrency(project.allocated_budget)}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-earth-900/40 uppercase">Deadline</p>
                   <p className="font-bold text-xs text-earth-900">
                     {new Date(project.due_date).toLocaleDateString()}
                   </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {isCreateOpen && (
          <CreateProjectModal 
            onClose={() => setIsCreateOpen(false)} 
            onSubmit={handleCreateProject}
            contractors={contractors}
            officialName={storedUser.name}
            villageName={projects[0]?.village_name || ""} 
          />
        )}
        {selectedProject && (
          <ProjectDetailsUpdateModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)}
            onUpdate={handleUpdateStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUB-COMPONENT: CREATE FORM MODAL ---
const CreateProjectModal = ({ onClose, onSubmit, contractors, officialName, villageName }) => {
  const [formData, setFormData] = useState({
    project_name: "", category: "Roads", description: "",
    location: "", allocated_budget: "", start_date: "", due_date: "",
    contractor_id: "", contractor_name: "", contractor_address: "",
    village_name: villageName, approved_by: officialName
  });

  const handleContractorChange = (e) => {
    const selectedId = e.target.value;
    const selectedC = contractors.find(c => c.contractor_id === selectedId);
    setFormData({
      ...formData,
      contractor_id: selectedId,
      contractor_name: selectedC ? selectedC.name : "",
      contractor_address: "Registered Contractor" 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(window.confirm("Are you sure you want to launch this new project?")) {
      onSubmit({
        ...formData,
        allocated_budget: Number(formData.allocated_budget)
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-6 border-b border-sand-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-serif font-bold text-earth-900">Create New Project</h2>
          <button onClick={onClose}><X className="text-earth-900/50 hover:text-red-500" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-earth-900 mb-2">Project Title</label>
              <input required className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-clay-500"
                value={formData.project_name} onChange={e => setFormData({...formData, project_name: e.target.value})}
                placeholder="e.g. Laying Concrete Road in Ward 4"
              />
            </div>
            {/* ... (Other form fields remain same as previous version) ... */}
            <div>
              <label className="block text-sm font-bold text-earth-900 mb-2">Category</label>
              <select className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none"
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {["Roads", "Water Supply", "Electricity", "Sanitation", "Public Buildings"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-earth-900 mb-2">Budget (₹)</label>
              <input type="number" required className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none"
                value={formData.allocated_budget} onChange={e => setFormData({...formData, allocated_budget: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-earth-900 mb-2">Start Date</label>
              <input type="date" required className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none"
                value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-earth-900 mb-2">Due Date</label>
              <input type="date" required className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none"
                value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-earth-900 mb-2">Assign Contractor</label>
              <div className="relative">
                <select required className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none appearance-none"
                  value={formData.contractor_id} onChange={handleContractorChange}
                >
                  <option value="">Select a Registered Contractor</option>
                  {contractors.map(c => (
                    <option key={c.id} value={c.contractor_id}>{c.name} (ID: {c.contractor_id})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-900/40 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-earth-900 mb-2">Location Detail</label>
              <input required className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none"
                value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                placeholder="e.g. Near Government School"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-earth-900 mb-2">Description</label>
              <textarea rows={3} required className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none resize-none"
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-sand-200">
             <button type="submit" className="w-full py-4 bg-earth-900 text-white rounded-xl font-bold hover:bg-clay-600 transition-all">
               Launch Project
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- SUB-COMPONENT: DETAILS & UPDATE MODAL ---
const ProjectDetailsUpdateModal = ({ project, onClose, onUpdate }) => {
  const [status, setStatus] = useState(project.status);
  const [milestone, setMilestone] = useState("");
  const [updating, setUpdating] = useState(false);

  // LOGIC: Filter valid statuses based on current state (Unidirectional Flow)
  const getAvailableStatuses = (current) => {
    if (current === 'Pending') return ['Pending', 'In Progress', 'Completed', 'Halted'];
    if (current === 'In Progress') return ['In Progress', 'Completed', 'Halted'];
    if (current === 'Halted') return ['Halted', 'In Progress', 'Completed'];
    if (current === 'Completed') return ['Completed']; // Locked
    return [current];
  };

  const availableOptions = getAvailableStatuses(project.status);
  const isLocked = project.status === 'Completed';

  const handleUpdate = async () => {
    if (!window.confirm("Are you sure you want to update this project's status/milestones?")) return;
    
    setUpdating(true);
    await onUpdate(project.id, status, milestone);
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row"
      >
        {/* Left: Project Details (Read Only) */}
        <div className="p-8 md:w-3/5 space-y-6">
           <div>
             <span className="text-[10px] font-bold text-earth-900/40 uppercase tracking-widest bg-sand-100 px-2 py-1 rounded">
               {project.category}
             </span>
             <h2 className="text-2xl font-serif font-bold text-earth-900 mt-3">{project.project_name}</h2>
             <p className="text-earth-900/60 text-sm mt-2">{project.description}</p>
           </div>
           
           <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-sand-50 rounded-xl">
                 <p className="text-[10px] font-bold text-earth-900/40 uppercase">Budget</p>
                 <p className="font-bold text-earth-900">{formatIndianCurrency(project.allocated_budget)}</p>
              </div>
              <div className="p-3 bg-sand-50 rounded-xl">
                 <p className="text-[10px] font-bold text-earth-900/40 uppercase">Contractor</p>
                 <p className="font-bold text-earth-900 truncate">{project.contractor_name}</p>
              </div>
           </div>

           <div>
             <h3 className="font-bold text-earth-900 text-sm mb-3">Milestone History</h3>
             <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
               {project.milestones?.map((m, i) => (
                 <div key={i} className="flex gap-3 text-xs">
                   <div className="flex flex-col items-center">
                     <div className="w-2 h-2 rounded-full bg-clay-500" />
                     {i !== project.milestones.length - 1 && <div className="w-px h-full bg-sand-200 my-1" />}
                   </div>
                   <span className="text-earth-900/70">{m}</span>
                 </div>
               ))}
             </div>
           </div>
        </div>

        {/* Right: Update Action Panel */}
        <div className="bg-sand-50 p-8 md:w-2/5 border-l border-sand-200 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-earth-900 text-lg flex items-center gap-2">
              <Save size={18} className="text-clay-500" /> Update Status
            </h3>
            <button onClick={onClose}><X size={20} className="text-earth-900/30 hover:text-red-500" /></button>
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-xs font-bold text-earth-900/60 uppercase mb-2">Current Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                disabled={isLocked}
                className="w-full p-3 bg-white border border-sand-200 rounded-xl outline-none focus:border-clay-500 disabled:bg-sand-100 disabled:text-earth-900/40"
              >
                {availableOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {isLocked && <p className="text-[10px] text-red-500 mt-1 font-bold">Project is Completed & Locked</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-earth-900/60 uppercase mb-2">Add New Milestone</label>
              <textarea 
                rows={3}
                placeholder={isLocked ? "Project closed." : "e.g. 50% Road Layering Done..."}
                value={milestone} 
                onChange={(e) => setMilestone(e.target.value)}
                disabled={isLocked}
                className="w-full p-3 bg-white border border-sand-200 rounded-xl outline-none resize-none focus:border-clay-500 placeholder:text-earth-900/30 text-sm disabled:bg-sand-100"
              />
            </div>
          </div>

          <button 
            onClick={handleUpdate}
            disabled={updating || isLocked}
            className="w-full mt-6 py-3 bg-clay-500 text-white rounded-xl font-bold hover:bg-clay-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OfficialProjects;