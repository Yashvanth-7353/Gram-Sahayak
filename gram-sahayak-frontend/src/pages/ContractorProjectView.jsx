import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RouteVerifier from '../components/RouteVerifier';
import { ArrowLeft, MapPin, Calendar, Wallet } from 'lucide-react';
import { formatIndianCurrency } from '../utils/currency';

const ContractorProjectView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const storedUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        // Fetch Project Details
        const fetchProject = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}`);
                const data = await res.json();
                setProject(data);
            } catch (err) {
                console.error("Failed to load project", err);
            }
        };
        fetchProject();
    }, [id]);

    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', 'Site Verification Photo');
        
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}/upload-image?contractor_id=${storedUser.contractor_id}`, {
                method: 'POST',
                body: formData
            });
            alert("Image Uploaded Successfully!");
            window.location.reload(); 
        } catch (err) {
            alert("Upload failed");
        }
    };

    if (!project) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20 pt-6 px-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-earth-900/60 mb-6 hover:text-earth-900">
                <ArrowLeft size={20}/> Back to Dashboard
            </button>

            {/* Header Card */}
            <div className="bg-white p-8 rounded-[2rem] border border-sand-200 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="bg-sand-100 text-earth-900/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{project.category}</span>
                    <h1 className="text-3xl font-serif font-bold text-earth-900 mt-2">{project.project_name}</h1>
                    <p className="text-earth-900/60 mt-1">{project.description}</p>
                </div>
                <div className="flex gap-6 text-sm">
                    <div className="flex flex-col items-end">
                        <span className="text-earth-900/40 font-bold uppercase text-[10px]">Budget</span>
                        <span className="font-bold text-lg text-earth-900 flex items-center gap-1">
                            <Wallet size={16}/> {formatIndianCurrency(project.allocated_budget)}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-earth-900/40 font-bold uppercase text-[10px]">Deadline</span>
                        <span className="font-bold text-lg text-earth-900 flex items-center gap-1">
                            <Calendar size={16}/> {new Date(project.due_date).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Verification Map */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-earth-900 flex items-center gap-2">
                        <MapPin className="text-clay-500"/> Geo-Verification Zone
                    </h2>
                    <div className="bg-white p-2 rounded-[2rem] border border-sand-200 shadow-sm h-[600px]">
                        <RouteVerifier 
                            mode="verify"
                            initialStart={project.start_point}
                            initialEnd={project.end_point}
                            onImageUpload={handleImageUpload}
                        />
                    </div>
                </div>

                {/* Sidebar: Gallery & Status */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-sand-200">
                        <h3 className="font-bold text-earth-900 mb-4">Project Gallery</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {project.images?.map((img, i) => (
                                <img key={i} src={img.url} className="w-full h-24 object-cover rounded-xl bg-sand-100" />
                            ))}
                            {(!project.images || project.images.length === 0) && (
                                <div className="col-span-2 text-center py-8 text-earth-900/40 text-sm italic">
                                    No photos uploaded yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractorProjectView;
