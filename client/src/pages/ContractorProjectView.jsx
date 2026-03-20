import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RouteVerifier from '../components/RouteVerifier';
import { ArrowLeft, MapPin, Calendar, Wallet, Loader2, Camera, X, CheckCircle2, Lock } from 'lucide-react';
import { formatIndianCurrency } from '../utils/currency';

const ContractorProjectView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [capturedPhotos, setCapturedPhotos] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const storedUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
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

    // --- LOGIC: Stage Based Restriction ---
    // We assume 1 batch of 4 photos is required per milestone/stage.
    const completedBatches = project ? Math.floor((project.images?.length || 0) / 4) : 0;
    
    // FIX: Ensure we count at least 1 stage if milestones are empty
    const currentMilestones = Math.max(project?.milestones?.length || 0, 1);
    
    // Lock only if we have completed verification for ALL current milestones
    const isStageLocked = completedBatches >= currentMilestones;

    const handleImageCapture = (file) => {
        if (capturedPhotos.length >= 4) return;
        
        // Create a local preview URL
        const previewUrl = URL.createObjectURL(file);
        const newPhoto = { file, previewUrl, id: Date.now() };
        
        setCapturedPhotos(prev => [...prev, newPhoto]);
    };

    const removePhoto = (photoId) => {
        setCapturedPhotos(prev => prev.filter(p => p.id !== photoId));
    };

    const uploadAllPhotos = async () => {
        if (capturedPhotos.length !== 4) return alert("Please capture exactly 4 photos.");
        
        setIsUploading(true);
        try {
            // Sequential Upload
            for (let i = 0; i < capturedPhotos.length; i++) {
                const photo = capturedPhotos[i];
                const formData = new FormData();
                formData.append('file', photo.file);
                formData.append('description', `Stage ${completedBatches + 1} Verification - Point ${i + 1}`);
                
                await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}/upload-image?contractor_id=${storedUser.contractor_id}`, {
                    method: 'POST',
                    body: formData
                });
            }
            alert("Verification Batch Uploaded Successfully!");
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    if (!project) return <div className="p-10 text-center flex justify-center"><Loader2 className="animate-spin"/></div>;

    return (
        <div className="max-w-6xl mx-auto pb-20 pt-6 px-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-earth-900/60 mb-6 hover:text-earth-900">
                <ArrowLeft size={20}/> Back to Dashboard
            </button>

            {/* Header Card */}
            <div className="bg-white p-8 rounded-[2rem] border border-sand-200 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-sand-100 text-earth-900/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{project.category}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isStageLocked ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {isStageLocked ? 'Stage Verified' : 'Action Required'}
                        </span>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-earth-900">{project.project_name}</h1>
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
                
                {/* --- LEFT: VERIFICATION ZONE --- */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-earth-900 flex items-center gap-2">
                            <MapPin className="text-clay-500"/> Geo-Verification Zone
                        </h2>
                        {capturedPhotos.length > 0 && (
                            <span className="text-xs font-bold bg-sand-100 px-3 py-1 rounded-full text-earth-900/60">
                                {capturedPhotos.length} / 4 Photos Ready
                            </span>
                        )}
                    </div>

                    <div className="bg-white p-2 rounded-[2rem] border border-sand-200 shadow-sm h-[600px] relative overflow-hidden">
                        {isStageLocked ? (
                            <div className="absolute inset-0 z-10 bg-sand-50/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 shadow-lg">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-earth-900 mb-2">Stage Verified</h3>
                                <p className="text-earth-900/60 max-w-md">
                                    You have already uploaded 4 photos for the current milestone. 
                                    Please wait for the Official to review and update the project stage before uploading new evidence.
                                </p>
                            </div>
                        ) : (
                            <RouteVerifier 
                                mode="verify"
                                initialStart={project.start_point}
                                initialEnd={project.end_point}
                                onImageUpload={handleImageCapture} // Pass handler
                            />
                        )}
                    </div>

                    {/* --- PREVIEW & UPLOAD ACTION AREA --- */}
                    {!isStageLocked && (
                        <div className="bg-white p-6 rounded-[2rem] border border-sand-200 shadow-lg mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-earth-900 flex items-center gap-2">
                                    <Camera size={20} className="text-clay-500"/> Evidence Preview
                                </h3>
                                <span className="text-xs text-earth-900/40 uppercase font-bold tracking-wider">
                                    {4 - capturedPhotos.length} Slots Remaining
                                </span>
                            </div>

                            <div className="grid grid-cols-4 gap-4 mb-6">
                                {/* Photo Slots */}
                                {[0, 1, 2, 3].map((index) => {
                                    const photo = capturedPhotos[index];
                                    return (
                                        <div key={index} className="aspect-square rounded-xl bg-sand-50 border-2 border-dashed border-sand-300 flex items-center justify-center relative overflow-hidden group">
                                            {photo ? (
                                                <>
                                                    <img src={photo.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <button 
                                                        onClick={() => removePhoto(photo.id)}
                                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] py-1 text-center font-bold">
                                                        Pt. {index + 1}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center p-2">
                                                    <Camera size={20} className="mx-auto text-sand-300 mb-1"/>
                                                    <span className="text-[10px] text-sand-400 font-bold">Empty</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <button 
                                onClick={uploadAllPhotos}
                                disabled={capturedPhotos.length !== 4 || isUploading}
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                                    capturedPhotos.length === 4 
                                    ? 'bg-earth-900 text-white hover:bg-earth-800 shadow-earth-900/20' 
                                    : 'bg-sand-100 text-earth-900/30 cursor-not-allowed'
                                }`}
                            >
                                {isUploading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                                {isUploading ? "Syncing with Server..." : capturedPhotos.length === 4 ? "Submit Verification Batch" : `Capture ${4 - capturedPhotos.length} More Photos to Submit`}
                            </button>
                        </div>
                    )}
                </div>

                {/* --- RIGHT: HISTORY SIDEBAR --- */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-sand-200 h-full max-h-[800px] overflow-y-auto custom-scrollbar">
                        <h3 className="font-bold text-earth-900 mb-4 sticky top-0 bg-white z-10 pb-4 border-b border-sand-100">
                            Upload History
                        </h3>
                        <div className="space-y-6">
                            {/* Group images into batches of 4 for display logic if possible, or just list them */}
                            {project.images && project.images.length > 0 ? (
                                project.images.map((img, i) => (
                                    <div key={i} className="group relative rounded-2xl overflow-hidden border border-sand-200">
                                        <img src={img.url} className="w-full h-40 object-cover bg-sand-100" alt="Evidence" />
                                        <div className="p-3 bg-sand-50">
                                            <p className="text-xs font-bold text-earth-900 truncate">{img.description}</p>
                                            <p className="text-[10px] text-earth-900/50 mt-1">
                                                {new Date(img.uploaded_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-earth-900/40 text-sm italic">
                                    No history available.
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