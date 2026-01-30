// src/components/SchemeDetailsModal.jsx
import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

const SchemeDetailsModal = ({ scheme, onClose }) => {
  if (!scheme) return null;

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
          className="bg-sand-50 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()} 
        >
          
          {/* Header */}
          <div className="bg-earth-900 p-8 text-sand-50 relative shrink-0">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all"
            >
              <X size={20} />
            </button>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-clay-500/20 border border-clay-500/30 text-clay-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Building2 size={12} /> {scheme.scheme_dept}
            </div>
            
            <h2 className="text-2xl md:text-3xl font-serif font-bold leading-tight">
              {scheme.scheme_name}
            </h2>
            <p className="text-sand-50/60 font-mono text-sm mt-2">ID: {scheme.scheme_id}</p>
          </div>

          {/* Scrollable Body */}
          <div className="p-8 overflow-y-auto">
            <div className="prose prose-stone max-w-none">
              <h3 className="text-lg font-bold text-earth-900 flex items-center gap-2 mb-3">
                <FileText size={20} className="text-clay-500" />
                Scheme Details
              </h3>
              <p className="text-earth-900/70 leading-relaxed text-lg">
                {scheme.scheme_desc}
              </p>
            </div>

            <div className="mt-8 bg-sand-100 rounded-2xl p-6 border border-sand-200">
              <h4 className="font-bold text-earth-900 mb-4">Eligibility & Benefits</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-earth-900/80">
                  <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
                  <span>Verified farmers/beneficiaries in the village registry.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-earth-900/80">
                  <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
                  <span>Aadhaar card linked to bank account required.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-sand-200 bg-white shrink-0 flex gap-4">
            <button 
              className="flex-1 py-3.5 bg-earth-900 text-white rounded-xl font-bold hover:bg-clay-600 transition-colors flex items-center justify-center gap-2"
              onClick={() => alert("Application process starting...")}
            >
              Apply Now <ArrowRight size={18} />
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-3.5 border-2 border-sand-200 text-earth-900 font-bold rounded-xl hover:bg-sand-50 transition-colors"
            >
              Close
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default SchemeDetailsModal;