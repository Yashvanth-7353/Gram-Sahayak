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
                    const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/users/officials/${storedUser.government_id}`);
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
            location: `${officialVillage} Main Area`, 
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Project Launched Successfully!");
                navigate('/dashboard/projects');
            } else {
                const errorData = await response.json();
                alert(`Failed: ${errorData.detail || "Unknown Error"}`);
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
