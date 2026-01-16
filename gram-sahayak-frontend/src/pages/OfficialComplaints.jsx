import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, CheckCircle2, Clock, MapPin, 
  Search, Filter, FileText, X, Upload, Loader2, User
} from 'lucide-react';
import { formatIndianCurrency } from '../utils/currency';
import { Download } from 'lucide-react'; // Add Download icon
import { generateComplaintPDF } from '../utils/pdfGenerator'; // Import utility

const OfficialComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const governmentId = storedUser?.government_id;

  // --- 1. FETCH COMPLAINTS ---
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        if (!governmentId) return;
        const response = await fetch(`${import.meta.env.VITE_API_URL}/complaints/official/${governmentId}`);
        if (response.ok) {
          const data = await response.json();
          setComplaints(data);
        }
      } catch (err) {
        console.error("Failed to load complaints", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [governmentId]);

  // --- 2. HANDLE RESOLUTION ---
  const handleResolveSubmit = async (complaintId, formData) => {
    try {
      // Append Official ID as required by API
      formData.append('official_id', governmentId);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/complaints/${complaintId}/resolve`, {
        method: 'PATCH',
        body: formData, // Sending as FormData for file upload
      });

      if (response.ok) {
        const updatedComplaint = await response.json();
        
        // Update local state
        setComplaints(prev => prev.map(c => 
          c.id === complaintId ? updatedComplaint : c
        ));
        setSelectedComplaint(null);
        alert("Complaint Resolved Successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to resolve complaint");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // --- FILTER LOGIC ---
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.complaint_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "All") return matchesSearch;
    if (filterStatus === "Escalated") return matchesSearch && c.is_escalated;
    return matchesSearch && c.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900">Grievance Redressal</h1>
          <p className="text-earth-900/60 mt-1">Review and resolve issues reported by villagers.</p>
        </div>
        
        {/* Stats Summary */}
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-bold">
             ⚠️ {complaints.filter(c => c.is_escalated).length} Escalated
          </div>
          <div className="px-4 py-2 bg-sand-50 text-earth-900 rounded-xl border border-sand-200 text-sm font-bold">
             🕒 {complaints.filter(c => c.status === 'Pending').length} Pending
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-900/30" size={20} />
          <input 
            type="text"
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-sand-200 outline-none focus:border-clay-500 transition-all"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Pending', 'Resolved', 'Escalated'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                filterStatus === status 
                  ? 'bg-earth-900 text-white shadow-lg' 
                  : 'bg-white text-earth-900/60 border border-sand-200 hover:bg-sand-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* COMPLAINTS GRID */}
      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-earth-900/40" /></div>
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-20 bg-sand-50 rounded-[2rem] border-2 border-dashed border-sand-300">
          <CheckCircle2 size={48} className="mx-auto text-earth-900/20 mb-4" />
          <h3 className="text-xl font-bold text-earth-900 mb-2">All Caught Up!</h3>
          <p className="text-earth-900/60">No complaints matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard 
              key={complaint.id} 
              complaint={complaint} 
              onSelect={() => setSelectedComplaint(complaint)} 
            />
          ))}
        </div>
      )}

      {/* RESOLVE MODAL */}
      <AnimatePresence>
        {selectedComplaint && (
          <ResolveModal 
            complaint={selectedComplaint} 
            onClose={() => setSelectedComplaint(null)} 
            onSubmit={handleResolveSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- UPDATED SUB-COMPONENT: CARD ---
const ComplaintCard = ({ complaint, onSelect }) => {
  const isEscalated = complaint.is_escalated || (complaint.status && complaint.status.includes("Higher Officials"));
  const isResolved = complaint.status === 'Resolved';

  return (
    <motion.div 
      layout
      onClick={onSelect}
      className={`bg-white p-6 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full ${
        isEscalated ? 'border-red-200 shadow-red-50' : 'border-sand-200 hover:shadow-xl hover:border-clay-500/30'
      }`}
    >
      {/* Escalation Strip */}
      {isEscalated && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
      )}

      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isResolved ? 'bg-green-100 text-green-700' :
          isEscalated ? 'bg-red-100 text-red-700' :
          'bg-orange-50 text-orange-700'
        }`}>
          {isEscalated ? "Escalated (>15 Days)" : complaint.status}
        </span>
        <span className="text-xs text-earth-900/40 font-bold flex items-center gap-1">
          <Clock size={12} /> {complaint.days_pending || 0} days ago
        </span>
      </div>

      <h3 className="font-bold text-xl text-earth-900 mb-2 line-clamp-2">{complaint.complaint_name}</h3>
      <div className="flex items-center gap-2 text-sm text-earth-900/60 mb-6">
        <MapPin size={14} className="text-clay-500" /> {complaint.location}
      </div>

      {/* User Info & Actions */}
      <div className="mt-auto pt-4 border-t border-sand-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sand-100 flex items-center justify-center text-earth-900/50">
            <User size={14} />
          </div>
          <div>
            <p className="text-xs font-bold text-earth-900">{complaint.villager_name}</p>
            <p className="text-[10px] text-earth-900/50">{complaint.villager_phone}</p>
          </div>
        </div>

        {/* --- DOWNLOAD REPORT BUTTON (Only for Resolved) --- */}
        {isResolved && (
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent opening the modal when clicking download
              generateComplaintPDF(complaint);
            }}
            className="p-2 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors tooltip"
            title="Download Official Report"
          >
            <Download size={18} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// --- SUB-COMPONENT: RESOLVE MODAL ---
const ResolveModal = ({ complaint, onClose, onSubmit }) => {
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const isEscalated = complaint.is_escalated || complaint.status.includes("Higher Officials");
  const isResolved = complaint.status === 'Resolved';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append('resolution_notes', notes);
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    await onSubmit(complaint.id, formData);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-sand-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-serif font-bold text-earth-900">Complaint Details</h2>
          <button onClick={onClose}><X className="text-earth-900/50 hover:text-red-500" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Details Section */}
          <div className="bg-sand-50 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-xl text-earth-900">{complaint.complaint_name}</h3>
            <p className="text-earth-900/70">{complaint.complaint_desc}</p>
            
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold uppercase text-earth-900/40 mb-2">Attachments</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {complaint.attachments.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden border border-sand-200 shrink-0 hover:opacity-80">
                      <img src={url} alt="Proof" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Section */}
          {!isResolved && !isEscalated ? (
            <form onSubmit={handleSubmit} className="space-y-4 border-t border-sand-200 pt-6">
              <h3 className="font-bold text-lg text-earth-900 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-600" /> Mark as Resolved
              </h3>
              
              <div>
                <label className="block text-sm font-bold text-earth-900 mb-2">Resolution Notes</label>
                <textarea 
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the action taken..."
                  className="w-full p-3 bg-white border border-sand-200 rounded-xl outline-none focus:border-clay-500 min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-earth-900 mb-2">Upload Proof (Images)</label>
                <div className="relative group cursor-pointer">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={(e) => setFiles(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full p-4 border-2 border-dashed border-sand-300 rounded-xl flex items-center justify-center gap-2 text-earth-900/50 group-hover:border-clay-500 group-hover:text-clay-600 transition-all">
                    <Upload size={20} />
                    <span>{files.length > 0 ? `${files.length} files selected` : "Click to upload images"}</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3 bg-earth-900 text-white rounded-xl font-bold hover:bg-clay-600 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" /> : "Submit Resolution"}
              </button>
            </form>
          ) : (
            <div className={`p-4 rounded-xl text-center font-bold border ${
              isEscalated 
                ? 'bg-red-50 text-red-700 border-red-100' 
                : 'bg-green-50 text-green-700 border-green-100'
            }`}>
              {isEscalated 
                ? "⛔ This complaint has been migrated to higher officials due to delay." 
                : `✅ Resolved by ${complaint.resolved_by} on ${new Date(complaint.resolved_at).toLocaleDateString()}`
              }
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OfficialComplaints;