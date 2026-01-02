// src/components/ProjectDetailsModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, User, Building2, Wallet, CheckCircle2, Clock } from 'lucide-react';

const ProjectDetailsModal = ({ project, onClose }) => {
  if (!project) return null;

  // Format Date Helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      {/* Backdrop with Blur */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-earth-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto"
      >
        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()} // Prevent close on clicking content
          className="bg-sand-50 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          
          {/* Header Image & Actions */}
          <div className="relative h-48 md:h-64 bg-earth-900">
            {project.images && project.images.length > 0 ? (
              <img 
                src={project.images[0]} 
                alt={project.project_name} 
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sand-50/20">
                <Building2 size={64} />
              </div>
            )}
            
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition-all"
            >
              <X size={24} />
            </button>

            {/* Status Badge */}
            <div className="absolute bottom-6 left-6 md:left-10">
              <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg ${
                project.status === 'Completed' ? 'bg-green-500 text-white' :
                project.status === 'In Progress' ? 'bg-blue-500 text-white' :
                'bg-orange-500 text-white'
              }`}>
                {project.status}
              </span>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            
            {/* Title & Description */}
            <div className="mb-8">
              <div className="flex items-center gap-3 text-clay-600 font-bold text-sm uppercase tracking-widest mb-2">
                <Building2 size={16} />
                {project.category}
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-earth-900 mb-4">
                {project.project_name}
              </h2>
              <p className="text-lg text-earth-900/70 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              
              {/* Location */}
              <div className="p-4 bg-white rounded-2xl border border-sand-200">
                <div className="flex items-center gap-3 text-earth-900/50 mb-2">
                  <MapPin size={20} />
                  <span className="text-xs font-bold uppercase">Location</span>
                </div>
                <p className="font-bold text-earth-900">{project.location}</p>
                <p className="text-sm text-earth-900/60">{project.village_name}</p>
              </div>

              {/* Budget */}
              <div className="p-4 bg-white rounded-2xl border border-sand-200">
                <div className="flex items-center gap-3 text-earth-900/50 mb-2">
                  <Wallet size={20} />
                  <span className="text-xs font-bold uppercase">Budget</span>
                </div>
                <p className="font-bold text-earth-900">₹{project.allocated_budget?.toLocaleString('en-IN')}</p>
                <p className="text-sm text-earth-900/60">Approved by: {project.approved_by}</p>
              </div>

              {/* Timeline */}
              <div className="p-4 bg-white rounded-2xl border border-sand-200">
                <div className="flex items-center gap-3 text-earth-900/50 mb-2">
                  <Calendar size={20} />
                  <span className="text-xs font-bold uppercase">Timeline</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="block text-earth-900/40 text-xs">Start</span>
                    <span className="font-bold text-earth-900">{formatDate(project.start_date)}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-earth-900/40 text-xs">Due</span>
                    <span className="font-bold text-earth-900">{formatDate(project.due_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contractor & Milestones Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Contractor Details */}
              <div className="bg-sand-100/50 rounded-3xl p-6 border border-sand-200">
                <h3 className="font-serif font-bold text-xl text-earth-900 mb-4 flex items-center gap-2">
                  <User size={20} className="text-clay-500" /> Contractor
                </h3>
                <div className="space-y-3">
                  <p className="font-bold text-lg text-earth-900">{project.contractor_name}</p>
                  <p className="text-sm text-earth-900/60 flex items-center gap-2">
                    <span className="bg-white px-2 py-1 rounded border border-sand-200 text-xs font-mono">
                      {project.contractor_id}
                    </span>
                  </p>
                  <p className="text-sm text-earth-900/70 border-t border-sand-200 pt-3 mt-2">
                    {project.contractor_address}
                  </p>
                </div>
              </div>

              {/* Milestones / Status History */}
              <div className="bg-sand-100/50 rounded-3xl p-6 border border-sand-200">
                <h3 className="font-serif font-bold text-xl text-earth-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-clay-500" /> Progress
                </h3>
                <div className="space-y-4">
                  {project.milestones && project.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 min-w-[1.25rem] h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-sm font-medium text-earth-900">{milestone}</span>
                    </div>
                  ))}
                  <div className="flex items-start gap-3 opacity-50">
                    <div className="mt-1 h-5 w-5 rounded-full border-2 border-dashed border-earth-900/30"></div>
                    <span className="text-sm text-earth-900/50">Next Milestone Pending...</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Gallery Grid (If more than 1 image) */}
            {project.images && project.images.length > 1 && (
               <div className="mt-10">
                 <h3 className="font-serif font-bold text-xl text-earth-900 mb-4">Site Photos</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {project.images.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`Site ${idx}`} 
                        className="rounded-xl h-32 w-full object-cover border border-sand-200"
                      />
                    ))}
                 </div>
               </div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectDetailsModal;