// src/components/ProjectDetailsModal.jsx
import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Calendar, MapPin, User, Building2, Wallet, 
  CheckCircle2, ImageIcon, Loader2, Clock, ShieldCheck
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ProjectDetailsModal = ({ project, onClose }) => {
  if (!project) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Map Logic
  const hasMapData = project.start_point?.lat && project.end_point?.lat;
  const mapCenter = hasMapData ? [project.start_point.lat, project.start_point.lng] : [12.9716, 77.5946];
  const routePositions = hasMapData ? [
    [project.start_point.lat, project.start_point.lng],
    [project.end_point.lat, project.end_point.lng]
  ] : [];

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-earth-900/60 backdrop-blur-md" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-sand-50 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-6 right-6 z-20">
            <button onClick={onClose} className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors shadow-sm">
              <X size={24} className="text-earth-900" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
            
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="flex items-center gap-2 px-3 py-1 bg-white border border-sand-200 rounded-full text-xs font-bold uppercase tracking-widest text-clay-600">
                  <Building2 size={14} /> {project.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    project.status === "Completed & Verified" ? "bg-green-100 text-green-700 border-green-200" :
                    project.status === "Project Allocated" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    "bg-orange-50 text-orange-700 border-orange-200"
                  }`}>
                  {project.status}
                </span>
                <span className="text-xs font-mono text-earth-900/40">ID: {project.id}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-earth-900 mb-4 leading-tight">
                {project.project_name}
              </h2>
              <p className="text-lg text-earth-900/70 leading-relaxed bg-white p-6 rounded-2xl border border-sand-200">
                {project.description}
              </p>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-5 bg-white rounded-2xl border border-sand-200 shadow-sm">
                <div className="flex items-center gap-2 text-earth-900/40 mb-2 text-xs font-bold uppercase"><Wallet size={16} /> Budget</div>
                <p className="font-bold text-earth-900 text-xl">{formatCurrency(project.allocated_budget)}</p>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-sand-200 shadow-sm md:col-span-2">
                <div className="flex items-center gap-2 text-earth-900/40 mb-2 text-xs font-bold uppercase"><User size={16} /> Contractor</div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-earth-900 text-lg truncate">{project.contractor_name}</p>
                    <p className="text-xs text-earth-900/50">ID: {project.contractor_id}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-bold uppercase text-earth-900/40">Approved By</p>
                     <p className="text-sm font-medium text-earth-900">{project.approved_by}</p>
                  </div>
                </div>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-sand-200 shadow-sm">
                <div className="flex items-center gap-2 text-earth-900/40 mb-2 text-xs font-bold uppercase"><Clock size={16} /> Timeline</div>
                <div className="text-sm">
                    <div className="flex justify-between mb-1"><span>Start:</span> <span className="font-bold">{formatDate(project.start_date)}</span></div>
                    <div className="flex justify-between"><span>Due:</span> <span className="font-bold text-red-600">{formatDate(project.due_date)}</span></div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            {hasMapData && (
              <div className="mb-8 rounded-3xl overflow-hidden border border-sand-200 h-64 relative z-0">
                 <MapContainer center={mapCenter} zoom={15} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[project.start_point.lat, project.start_point.lng]}><Popup>Start Point</Popup></Marker>
                    <Marker position={[project.end_point.lat, project.end_point.lng]}><Popup>End Point</Popup></Marker>
                    <Polyline positions={routePositions} color="blue" weight={5} />
                 </MapContainer>
                 <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-2">
                    <MapPin size={12} className="text-blue-600"/> Project Location: {project.location}
                 </div>
              </div>
            )}

            {/* Milestones & Gallery */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Milestones */}
              <div className="bg-sand-50 rounded-3xl border border-sand-200 p-6">
                <h3 className="font-serif font-bold text-xl text-earth-900 mb-6 flex items-center gap-2">
                  <Loader2 size={20} className="text-clay-500" /> Milestones
                </h3>
                {project.milestones && project.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {project.milestones.map((m, idx) => {
                        const title = typeof m === 'string' ? m : m.title;
                        const status = typeof m === 'string' ? 'Completed' : m.status;
                        return (
                            <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-sand-100 shadow-sm">
                                <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center text-white ${status === 'Completed' ? 'bg-green-500' : 'bg-sand-300'}`}>
                                    <CheckCircle2 size={12}/>
                                </div>
                                <div>
                                    <p className="font-bold text-earth-900 text-sm">{title}</p>
                                    <p className="text-xs text-earth-900/50">{status}</p>
                                </div>
                            </div>
                        )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-earth-900/40 italic">No milestones yet.</div>
                )}
              </div>

              {/* Gallery */}
              <div className="bg-sand-50 rounded-3xl border border-sand-200 p-6">
                <h3 className="font-serif font-bold text-xl text-earth-900 mb-6 flex items-center gap-2">
                  <ImageIcon size={20} className="text-clay-500" /> Site Progress
                </h3>
                {project.images && project.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {project.images.map((img, idx) => {
                      const src = typeof img === 'string' ? img : img.url;
                      const desc = typeof img === 'string' ? `Image ${idx+1}` : img.description;
                      const date = typeof img === 'string' ? null : img.uploaded_at;
                      return (
                        <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden bg-white border border-sand-200 shadow-sm">
                          <img src={src} alt={desc} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <p className="text-white text-xs font-bold truncate">{desc}</p>
                            {date && <p className="text-white/60 text-[10px]">{formatDate(date)}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-sand-200 rounded-2xl">
                    <ImageIcon size={32} className="mx-auto text-sand-300 mb-2" />
                    <p className="text-earth-900/40 text-sm">No photos uploaded yet.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default ProjectDetailsModal;