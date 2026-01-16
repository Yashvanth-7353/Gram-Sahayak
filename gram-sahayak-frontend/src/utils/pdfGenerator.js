// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateComplaintPDF = (complaint) => {
  const doc = new jsPDF();

  // --- 1. HEADER ---
  doc.setFontSize(22);
  doc.setTextColor(44, 62, 80); // Earth-900 color approx
  doc.text("Gram-Sahayak", 14, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(100);
  doc.text("Grievance Resolution Report", 14, 30);
  
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35); // Horizontal Line

  // --- 2. COMPLAINT DETAILS ---
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("1. Complaint Details", 14, 45);

  const complaintData = [
    ["Complaint ID", complaint.id || complaint._id],
    ["Title", complaint.complaint_name],
    ["Date Raised", new Date(complaint.created_at).toLocaleDateString()],
    ["Raised By", `${complaint.villager_name} (${complaint.villager_phone})`],
    ["Location", complaint.location],
    ["Description", complaint.complaint_desc],
  ];

  doc.autoTable({
    startY: 50,
    head: [],
    body: complaintData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', width: 40 } }, // Label column bold
  });

  // --- 3. RESOLUTION DETAILS ---
  let finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.text("2. Action Taken Report (ATR)", 14, finalY);

  const resolutionData = [
    ["Resolved By", `${complaint.resolved_by} (Official)`],
    ["Resolved Date", new Date(complaint.resolved_at).toLocaleDateString()],
    ["Resolution Notes", complaint.resolution_notes || "No notes provided."],
  ];

  doc.autoTable({
    startY: finalY + 5,
    head: [],
    body: resolutionData,
    theme: 'grid', // Grid theme for resolution to make it look official
    headStyles: { fillColor: [44, 62, 80] },
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', width: 40 } },
  });

  // --- 4. FOOTER (Signatures) ---
  finalY = doc.lastAutoTable.finalY + 30;
  
  doc.setFontSize(10);
  doc.text("__________________________", 14, finalY);
  doc.text("Official Signature", 14, finalY + 5);

  doc.text("__________________________", 140, finalY);
  doc.text("Gram Panchayat Seal", 140, finalY + 5);

  // --- 5. SAVE ---
  doc.save(`Resolution_Report_${complaint.id.substring(0,6)}.pdf`);
};