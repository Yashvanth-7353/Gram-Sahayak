import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, FileText, X, Send, 
  MapPin, Camera, Loader2, CheckCircle2, Clock, Paperclip
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';

const Complaints = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('list'); 
  const [loading, setLoading] = useState(false);
  const [userComplaints, setUserComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    complaint_name: '',
    complaint_desc: '',
    location: ''
  });
  const [files, setFiles] = useState({ photos: [], pdf: null });
  const [submitStatus, setSubmitStatus] = useState(null);

  // 1. Fetch History
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser?.phone_number) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/complaints/villager/${storedUser.phone_number}`);
        if (response.ok) {
          const data = await response.json();
          setUserComplaints(data);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };
    if (activeTab === 'list') {
      fetchHistory();
    }
  }, [activeTab]);

  // 2. File Handling
  const handleFileChange = (e, type) => {
    if (type === 'photos') {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => ({ ...prev, photos: [...prev.photos, ...newFiles] }));
    } else {
      setFiles(prev => ({ ...prev, pdf: e.target.files[0] }));
    }
  };

  const removeFile = (index, type) => {
    if (type === 'photos') {
      setFiles(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
    } else {
      setFiles(prev => ({ ...prev, pdf: null }));
    }
  };

  // 3. Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);

    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (!storedUser?.phone_number) {
      alert("Please login first");
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append('phone_number', storedUser.phone_number);
      payload.append('complaint_name', formData.complaint_name);
      payload.append('complaint_desc', formData.complaint_desc);
      payload.append('location', formData.location);

      files.photos.forEach(photo => payload.append('files', photo));
      if (files.pdf) payload.append('files', files.pdf);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/complaints/raise`, {
        method: 'POST',
        body: payload, 
      });

      if (!response.ok) throw new Error("Submission Failed");

      setSubmitStatus('success');
      setFormData({ complaint_name: '', complaint_desc: '', location: '' });
      setFiles({ photos: [], pdf: null });
      
      setTimeout(() => {
        setActiveTab('list');
        setSubmitStatus(null);
      }, 2000);

    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // 4. Reopen Handler (NEW)
  const handleReopen = async (complaintId) => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser?.phone_number) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/complaints/${complaintId}/reopen`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: storedUser.phone_number })
      });

      if (response.ok) {
        const updatedComplaint = await response.json();
        
        // Update List
        setUserComplaints(prev => prev.map(c => 
          c.id === complaintId ? updatedComplaint : c
        ));
        
        // Update Modal View or Close it
        setSelectedComplaint(updatedComplaint);
        alert("Complaint Reopened. It has been sent back for review.");
      } else {
        const err = await response.json();
        alert(err.detail || "Failed to reopen complaint");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900">Grievance Redressal</h1>
          <p className="text-earth-900/60 mt-2">Report issues directly to your village officials.</p>
        </div>
        
        <div className="bg-sand-100 p-1.5 rounded-xl flex gap-1 self-start">
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white text-earth-900 shadow-sm' : 'text-earth-900/50 hover:text-earth-900'}`}
          >
            My Complaints
          </button>
          <button 
            onClick={() => setActiveTab('raise')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'raise' ? 'bg-clay-500 text-white shadow-md' : 'text-earth-900/50 hover:text-earth-900'}`}
          >
            <AlertCircle size={16} /> Raise New
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* VIEW 1: FORM */}
        {activeTab === 'raise' ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[2rem] p-6 md:p-10 shadow-xl border border-sand-200 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-clay-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

             {submitStatus === 'success' ? (
               <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                   <CheckCircle2 size={40} />
                 </div>
                 <h2 className="text-2xl font-bold text-earth-900">Complaint Submitted!</h2>
                 <p className="text-earth-900/60 mt-2">Official support will reach out soon.</p>
               </div>
             ) : (
               <form onSubmit={handleSubmit} className="relative z-10 max-w-3xl mx-auto space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-earth-900 mb-2 pl-1">Issue Title</label>
                      <input 
                        required
                        value={formData.complaint_name}
                        onChange={e => setFormData({...formData, complaint_name: e.target.value})}
                        className="w-full px-6 py-4 bg-sand-50 border-2 border-transparent focus:border-clay-500 rounded-xl outline-none font-medium text-earth-900 placeholder:text-earth-900/30"
                        placeholder="e.g., Broken Handpump in Ward 4"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-sm font-bold text-earth-900 mb-2 pl-1">Location / Landmark</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-clay-500" size={20} />
                            <input 
                              required
                              value={formData.location}
                              onChange={e => setFormData({...formData, location: e.target.value})}
                              className="w-full pl-12 pr-6 py-4 bg-sand-50 border-2 border-transparent focus:border-clay-500 rounded-xl outline-none font-medium text-earth-900"
                              placeholder="e.g., Near Primary School"
                            />
                          </div>
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-earth-900 mb-2 pl-1">Attach Photos</label>
                          <div className="relative group">
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'photos')}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="w-full px-4 py-3.5 bg-sand-50 border-2 border-dashed border-sand-300 rounded-xl text-earth-900/50 flex items-center gap-3 group-hover:border-clay-500 group-hover:bg-white transition-all">
                              <Camera size={20} />
                              <span className="text-sm font-medium">Click to upload images</span>
                            </div>
                          </div>
                       </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-earth-900 mb-2 pl-1">Detailed Description</label>
                      <textarea 
                        required
                        rows={4}
                        value={formData.complaint_desc}
                        onChange={e => setFormData({...formData, complaint_desc: e.target.value})}
                        className="w-full px-6 py-4 bg-sand-50 border-2 border-transparent focus:border-clay-500 rounded-xl outline-none font-medium text-earth-900 resize-none"
                        placeholder="Describe the issue in detail..."
                      />
                    </div>
                    {(files.photos.length > 0 || files.pdf) && (
                      <div className="p-4 bg-sand-50 rounded-xl space-y-3">
                         {files.photos.map((file, idx) => (
                           <div key={idx} className="flex items-center justify-between text-sm bg-white p-2 rounded-lg border border-sand-200">
                             <div className="flex items-center gap-2 text-earth-900">
                               <FileText size={16} className="text-clay-500" /> {file.name}
                             </div>
                             <button type="button" onClick={() => removeFile(idx, 'photos')} className="text-red-400 hover:text-red-600"><X size={16}/></button>
                           </div>
                         ))}
                         {files.pdf && (
                           <div className="flex items-center justify-between text-sm bg-white p-2 rounded-lg border border-sand-200">
                             <div className="flex items-center gap-2 text-earth-900">
                               <Paperclip size={16} className="text-red-500" /> {files.pdf.name}
                             </div>
                             <button type="button" onClick={() => removeFile(0, 'pdf')} className="text-red-400 hover:text-red-600"><X size={16}/></button>
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-sand-200">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-4 bg-earth-900 text-sand-50 rounded-xl font-bold text-lg hover:bg-clay-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-earth-900/10 disabled:opacity-70"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Submit Complaint</>}
                    </button>
                  </div>
               </form>
             )}
          </motion.div>
        ) : (
          
          /* VIEW 2: LIST */
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {userComplaints.length > 0 ? (
              userComplaints.map((complaint, idx) => {
                const isEscalated = complaint.is_escalated || (complaint.status && complaint.status.includes("Higher"));
                return (
                  <motion.div 
                    key={idx}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedComplaint(complaint)}
                    className={`bg-white p-6 rounded-[1.5rem] border hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full ${
                      isEscalated ? 'border-red-200 shadow-red-50' : 'border-sand-200'
                    }`}
                  >
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-sand-100 p-3 rounded-full text-earth-900/50 group-hover:text-clay-600 transition-colors">
                        <FileText size={24} />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' : 
                        isEscalated ? 'bg-red-100 text-red-700' :
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {isEscalated ? 'Escalated' : complaint.status}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="font-bold text-xl text-earth-900 mb-2 group-hover:text-clay-600 transition-colors line-clamp-2">
                      {complaint.complaint_name}
                    </h3>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-earth-900/40 font-medium mb-6">
                      <Clock size={12} /> 
                      {new Date(complaint.created_at).toLocaleDateString('en-IN', { 
                        year: 'numeric', month: 'long', day: 'numeric' 
                      })}
                    </div>
                    
                    {/* Centered View Details */}
                    <div className="mt-auto pt-4 border-t border-sand-100 flex justify-center">
                       <span className="text-sm font-bold text-earth-900 underline decoration-clay-500/30 group-hover:decoration-clay-500 transition-all">
                         View Details
                       </span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center bg-sand-50 rounded-[2rem] border-2 border-dashed border-sand-300">
                <div className="w-16 h-16 bg-sand-200 text-earth-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} />
                </div>
                <h3 className="text-xl font-bold text-earth-900 mb-2">No Complaints Found</h3>
                <p className="text-earth-900/60 max-w-md mx-auto">
                  You haven't raised any issues yet. Click on "Raise New" to report a problem in your village.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ComplaintDetailsModal 
        complaint={selectedComplaint} 
        onClose={() => setSelectedComplaint(null)}
        onReopen={handleReopen} // <--- Pass the new handler here
      />
    </div>
  );
};

export default Complaints;