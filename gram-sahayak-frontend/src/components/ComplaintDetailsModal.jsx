import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, FileText, Paperclip, CheckCircle2, Clock, RotateCcw, AlertTriangle } from 'lucide-react';

const ComplaintDetailsModal = ({ complaint, onClose, onReopen }) => {
  const [reopening, setReopening] = useState(false);

  if (!complaint) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    // Handle escalation text in status
    if (status?.includes("Higher")) return 'bg-red-100 text-red-700 border-red-200';
    
    switch (status?.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'in progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleReopenClick = async () => {
    if (window.confirm("Are you sure this issue wasn't resolved properly? This will escalate the complaint.")) {
      setReopening(true);
      await onReopen(complaint.id);
      setReopening(false);
    }
  };

  const isResolved = complaint.status === 'Resolved';
  const isEscalated = complaint.is_escalated || (complaint.status && complaint.status.includes("Higher"));

  return createPortal(
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        {/* Blurred Backdrop */}
        <div 
          className="absolute inset-0 bg-earth-900/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-sand-50 w-full max-w-2xl rounded-[2rem] shadow-2xl border border-sand-200 relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()} 
        >
          {/* Header */}
          <div className="p-6 md:p-8 bg-white border-b border-sand-200 flex justify-between items-start">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-3 ${getStatusColor(complaint.status)}`}>
                 {complaint.status === 'Resolved' ? <CheckCircle2 size={12} /> : isEscalated ? <AlertTriangle size={12} /> : <Clock size={12} />}
                 {isEscalated ? "Escalated" : complaint.status}
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth-900">
                {complaint.complaint_name}
              </h2>
              <p className="text-xs font-mono text-earth-900/40 mt-2">
                Ticket ID: {complaint.id.slice(-6).toUpperCase()}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-sand-100 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 md:p-8 overflow-y-auto space-y-8">
            
            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-earth-900/50 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} /> Description
              </h3>
              <div className="p-4 bg-white rounded-xl border border-sand-200 text-earth-900 leading-relaxed whitespace-pre-wrap">
                {complaint.complaint_desc}
              </div>
            </div>

            {/* Meta Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-sand-200">
                  <div className="text-xs font-bold text-earth-900/50 uppercase mb-1 flex items-center gap-2">
                    <MapPin size={14} /> Location
                  </div>
                  <div className="font-bold text-earth-900">{complaint.location}</div>
                  <div className="text-xs text-earth-900/60 mt-1">{complaint.village_name}</div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-sand-200">
                  <div className="text-xs font-bold text-earth-900/50 uppercase mb-1 flex items-center gap-2">
                    <Calendar size={14} /> Submitted On
                  </div>
                  <div className="font-bold text-earth-900">{formatDate(complaint.created_at)}</div>
              </div>
            </div>

            {/* Attachments Section */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-earth-900/50 uppercase tracking-wider flex items-center gap-2">
                  <Paperclip size={16} /> Attachments
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {complaint.attachments.map((url, idx) => (
                    <a 
                      key={idx} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group relative aspect-square bg-sand-200 rounded-xl overflow-hidden border border-sand-300 hover:border-clay-500 transition-colors"
                    >
                      {url.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                        <img src={url} alt="Proof" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-earth-900/50">
                          <FileText size={32} />
                          <span className="text-xs mt-2 font-bold">View File</span>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* RESOLUTION SECTION */}
            {(complaint.resolution_notes || isResolved) && (
              <div className="p-5 bg-green-50 rounded-2xl border border-green-200 space-y-3">
                 <h3 className="text-green-800 font-bold flex items-center gap-2">
                   <CheckCircle2 size={18} /> Official Resolution
                 </h3>
                 <p className="text-green-900/80 text-sm leading-relaxed">
                   {complaint.resolution_notes || "No notes provided."}
                 </p>
                 <div className="text-xs text-green-700/50 font-bold">
                   Resolved by: {complaint.resolved_by || 'Official'} on {formatDate(complaint.resolved_at)}
                 </div>
              </div>
            )}

            {/* --- REOPEN ACTION (New Feature) --- */}
            {isResolved && (
              <div className="pt-4 border-t border-sand-200">
                <div className="bg-white p-4 rounded-xl border border-sand-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-earth-900 text-sm">Not satisfied with the resolution?</h4>
                    <p className="text-xs text-earth-900/50 mt-1">If the issue persists, you can reopen this ticket.</p>
                  </div>
                  <button 
                    onClick={handleReopenClick}
                    disabled={reopening}
                    className="whitespace-nowrap px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {reopening ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                    Reopen Complaint
                  </button>
                </div>
              </div>
            )}

          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default ComplaintDetailsModal;