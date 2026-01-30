#!/bin/bash

echo "Updating Frontend API Integrations..."

# ---------------------------------------------------------
# 1. Update CreateProject.jsx (POST /projects/create)
# ---------------------------------------------------------
cat <<EOF > src/pages/CreateProject.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RouteVerifier from '../components/RouteVerifier';
import { ArrowLeft, Save, MapPin, RefreshCw } from 'lucide-react';

const CreateProject = () => {
    const navigate = useNavigate();
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    const [formData, setFormData] = useState({
        project_name: '', description: '', contractor_id: '', contractor_name: '', budget: '', category: 'Roads'
    });
    const [points, setPoints] = useState({ start: null, end: null });
    const [loading, setLoading] = useState(false);
    const [officialVillage, setOfficialVillage] = useState(null);
    const [mapKey, setMapKey] = useState(0); 

    useEffect(() => {
        const fetchContextData = async () => {
            try {
                if (storedUser?.government_id) {
                    const profileRes = await fetch(\`\${import.meta.env.VITE_API_URL}/users/officials/\${storedUser.government_id}\`);
                    const profile = await profileRes.json();
                    setOfficialVillage(profile.village_name);
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };
        fetchContextData();
    }, [storedUser]);

    const handleResetMap = () => {
        setPoints({ start: null, end: null });
        setMapKey(prev => prev + 1); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!points.start || !points.end) return alert("Please select Start and End points on the map");

        setLoading(true);

        const payload = {
            project_name: formData.project_name,
            description: formData.description,
            category: formData.category,
            village_name: officialVillage || "Unknown Village",
            location: \`\${officialVillage} Main Area\`, 
            start_point: points.start,
            end_point: points.end,
            contractor_name: formData.contractor_name,
            contractor_id: formData.contractor_id,
            allocated_budget: parseFloat(formData.budget),
            approved_by: storedUser?.name || "Official",
            start_date: new Date().toISOString(),
            due_date: new Date(Date.now() + 86400000 * 30).toISOString(),
            status: "Proposed",
            milestones: [] 
        };

        try {
            // UPDATED: POST to /projects/create
            const response = await fetch(\`\${import.meta.env.VITE_API_URL}/projects/create\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Project Launched Successfully!");
                navigate('/dashboard/projects');
            } else {
                const errorData = await response.json();
                alert(\`Failed: \${errorData.detail || "Unknown Error"}\`);
            }
        } catch (err) {
            console.error(err);
            alert("Network Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 pt-6 px-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-earth-900/60 mb-6 hover:text-earth-900">
                <ArrowLeft size={20}/> Back to Projects
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-earth-900">Launch New Project</h1>
                {officialVillage && (
                    <span className="flex items-center gap-2 bg-sand-100 text-earth-900 px-4 py-2 rounded-full text-sm font-bold mt-2 md:mt-0">
                        <MapPin size={16} className="text-clay-500"/> Village: {officialVillage}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-[2rem] border border-sand-200 shadow-sm h-fit">
                    <div>
                        <label className="block text-sm font-bold text-earth-900 mb-2">Project Name</label>
                        <input required className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-clay-500"
                            placeholder="e.g. Laying Concrete Road"
                            onChange={e => setFormData({...formData, project_name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-earth-900 mb-2">Budget (₹)</label>
                            <input type="number" required className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200"
                                onChange={e => setFormData({...formData, budget: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-earth-900 mb-2">Category</label>
                            <select className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200"
                                onChange={e => setFormData({...formData, category: e.target.value})}
                            >
                                <option>Roads</option>
                                <option>Water Supply</option>
                                <option>Electricity</option>
                                <option>Sanitation</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-earth-900 mb-2">Contractor ID</label>
                            <input required className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-clay-500"
                                placeholder="e.g. CON123"
                                onChange={e => setFormData({...formData, contractor_id: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-earth-900 mb-2">Contractor Name</label>
                            <input required className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-clay-500"
                                placeholder="e.g. Ramesh Infra"
                                onChange={e => setFormData({...formData, contractor_name: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-earth-900 mb-2">Description</label>
                        <textarea className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200" rows={3}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <button disabled={loading} className="w-full py-4 bg-earth-900 text-white rounded-xl font-bold hover:bg-earth-800 transition-all flex justify-center items-center gap-2">
                        <Save size={20}/> {loading ? "Launching..." : "Confirm & Launch"}
                    </button>
                </form>

                <div className="space-y-4">
                     <div className="bg-sand-100 p-4 rounded-xl text-earth-900/80 text-sm flex justify-between items-center">
                        <div>
                            <strong>Instructions:</strong>
                            <ul className="list-disc ml-4 mt-1 space-y-1 text-xs">
                                <li>Click once to set <b>Start Point</b> (Green).</li>
                                <li>Click again to set <b>End Point</b> (Red).</li>
                            </ul>
                        </div>
                        <button type="button" onClick={handleResetMap} className="bg-white border border-sand-300 text-earth-900 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors flex items-center gap-2">
                            <RefreshCw size={14}/> Reset Map
                        </button>
                    </div>
                    <div className="h-[500px] rounded-[2rem] overflow-hidden border border-sand-200 shadow-inner relative">
                        <RouteVerifier key={mapKey} mode="create" onPointsSelected={(start, end) => setPoints({ start, end })} />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CreateProject;
EOF

# ---------------------------------------------------------
# 2. Update OfficialProjects.jsx (GET /village/{name}, PATCH /status)
# ---------------------------------------------------------
cat <<EOF > src/pages/OfficialProjects.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Plus, Search, MapPin, 
  User, Loader2, ChevronDown, Save, Filter, X
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
        const profileRes = await fetch(\`\${import.meta.env.VITE_API_URL}/users/officials/\${storedUser.government_id}\`);
        const profile = await profileRes.json();
        
        // UPDATED: GET /projects/village/{name}
        const projectsRes = await fetch(\`\${import.meta.env.VITE_API_URL}/projects/village/\${profile.village_name}\`);
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
  }, [storedUser]);

  // --- UPDATE STATUS ---
  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      // UPDATED: PATCH /projects/{id}/status with JSON Body
      const response = await fetch(\`\${import.meta.env.VITE_API_URL}/projects/\${projectId}/status\`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, status: newStatus } : p
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
             <option value="Pending">Pending</option>
             <option value="Proposed">Proposed</option>
             <option value="In Progress">In Progress</option>
             <option value="Completed">Completed</option>
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
                <span className={\`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider \${
                  project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  project.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                  'bg-orange-50 text-orange-700'
                }\`}>
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
    if (current === 'Proposed') return ['Proposed', 'Pending', 'In Progress'];
    if (current === 'Pending') return ['Pending', 'In Progress', 'Completed'];
    if (current === 'In Progress') return ['In Progress', 'Completed'];
    return [current];
  };
  const availableOptions = getAvailableStatuses(project.status);
  const handleUpdate = async () => {
    if (!window.confirm("Update Status?")) return;
    setUpdating(true);
    await onUpdate(project.id, status);
    setUpdating(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row">
        <div className="p-8 md:w-3/5 space-y-6">
           <h2 className="text-2xl font-serif font-bold text-earth-900 mt-3">{project.project_name}</h2>
           <p className="text-earth-900/60 text-sm mt-2">{project.description}</p>
           <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-sand-50 rounded-xl"><p className="text-[10px] font-bold text-earth-900/40 uppercase">Budget</p><p className="font-bold text-earth-900">{formatIndianCurrency(project.allocated_budget)}</p></div>
              <div className="p-3 bg-sand-50 rounded-xl"><p className="text-[10px] font-bold text-earth-900/40 uppercase">Contractor</p><p className="font-bold text-earth-900 truncate">{project.contractor_name}</p></div>
           </div>
        </div>
        <div className="bg-sand-50 p-8 md:w-2/5 border-l border-sand-200 flex flex-col">
          <div className="flex justify-between items-start mb-6"><h3 className="font-bold text-earth-900 text-lg flex items-center gap-2"><Save size={18} className="text-clay-500" /> Update Status</h3><button onClick={onClose}><X size={20} className="text-earth-900/30 hover:text-red-500" /></button></div>
          <div className="space-y-6 flex-1">
            <label className="block text-xs font-bold text-earth-900/60 uppercase mb-2">Current Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-3 bg-white border border-sand-200 rounded-xl outline-none">
                {availableOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <button onClick={handleUpdate} disabled={updating} className="w-full mt-6 py-3 bg-clay-500 text-white rounded-xl font-bold hover:bg-clay-600 transition-all flex items-center justify-center gap-2">
            {updating ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
export default OfficialProjects;
EOF

# ---------------------------------------------------------
# 3. Update ContractorProjects.jsx (GET /contractor/{id})
# ---------------------------------------------------------
cat <<EOF > src/pages/ContractorProjects.jsx
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

        // UPDATED: GET /projects/contractor/{id}
        const response = await fetch(\`\${import.meta.env.VITE_API_URL}/projects/contractor/\${storedUser.contractor_id}\`);
        
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

  useEffect(() => {
    if (filterStatus === 'All') setFilteredProjects(projects);
    else setFilteredProjects(projects.filter(p => p.status === filterStatus));
  }, [filterStatus, projects]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-orange-50 text-orange-700 border-orange-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div><h1 className="text-3xl font-serif font-bold text-earth-900">My Projects</h1><p className="text-earth-900/60 mt-1">Manage your works.</p></div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-sand-200 shadow-sm overflow-x-auto">
          {['All', 'In Progress', 'Pending', 'Completed'].map((status) => (
            <button key={status} onClick={() => setFilterStatus(status)}
              className={\`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all \${filterStatus === status ? 'bg-earth-900 text-white shadow-md' : 'text-earth-900/60 hover:bg-sand-100 hover:text-earth-900'}\`}>
              {status}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="py-20 text-center text-earth-900/50 flex flex-col items-center"><div className="animate-spin mb-4"><Clock /></div>Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 text-center bg-sand-50 rounded-[2rem] border-2 border-dashed border-sand-300"><Briefcase size={48} className="mx-auto text-earth-900/20 mb-4" /><h3 className="text-xl font-bold text-earth-900 mb-2">No Projects Found</h3></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div key={project.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => navigate(\`/contractor-projects/\${project.id}\`)}
                className="group bg-white rounded-[2rem] p-6 border border-sand-200 hover:border-clay-500/30 hover:shadow-xl transition-all cursor-pointer flex flex-col h-full relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className={\`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border \${getStatusColor(project.status)}\`}>{project.status}</span>
                  <div className="w-8 h-8 rounded-full bg-sand-100 flex items-center justify-center text-earth-900/40 group-hover:bg-earth-900 group-hover:text-white transition-colors"><ArrowUpRight size={16} /></div>
                </div>
                <div className="relative z-10 mb-6">
                  <h3 className="font-bold text-xl text-earth-900 mb-2 line-clamp-2 leading-tight">{project.project_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-earth-900/60 mb-1"><MapPin size={14} className="text-clay-500" /> <span className="truncate">{project.location}</span></div>
                </div>
                <div className="mt-auto pt-4 border-t border-sand-100 flex items-center justify-between relative z-10">
                  <div className="flex flex-col"><span className="text-[10px] font-bold text-earth-900/40 uppercase tracking-wider">Budget</span><span className="font-serif font-bold text-lg text-earth-900">{formatIndianCurrency(project.allocated_budget)}</span></div>
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
EOF

echo "Updates Complete. Please restart your frontend server."