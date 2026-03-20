import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Send, User, Building2, MapPin, 
  Loader2, Briefcase, ChevronRight, Lock, ShieldCheck, HardHat
} from 'lucide-react';

const ContractorConnect = () => {
  // Lists
  const [listItems, setListItems] = useState([]); 
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Chat Data
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  // Parse user once
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const isOfficial = storedUser?.role === 'official';
  
  // EXTRACT PRIMITIVES FOR DEPENDENCY ARRAYS (Prevents Infinite Loop)
  const currentUserId = storedUser?.id;
  const currentGovId = storedUser?.government_id;
  const currentContractorId = storedUser?.contractor_id;

  // --- 1. LOAD LEFT SIDEBAR DATA ---
  useEffect(() => {
    const fetchContextData = async () => {
      setLoading(true);
      try {
        if (isOfficial) {
          // === LOGIC FOR OFFICIAL ===
          if (!currentGovId) return;

          // 1. Get Official Profile
          const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/users/officials/${currentGovId}`);
          const profile = await profileRes.json();
          const myVillage = profile.village_name;

          // 2. Get All Projects in this Village (FIXED ENDPOINT)
          // OLD: /projects/?village_name=...
          // NEW: /projects/village/...
          const projectsRes = await fetch(`${import.meta.env.VITE_API_URL}/projects/village/${myVillage}`);
          let projects = [];
          if (projectsRes.ok) {
             projects = await projectsRes.json();
          }

          // Safety Check: Ensure projects is an array
          if (!Array.isArray(projects)) projects = [];

          // 3. Get All Contractors
          const contractorsRes = await fetch(`${import.meta.env.VITE_API_URL}/users/contractors`);
          const allContractors = await contractorsRes.json();

          // 4. Map Contractors
          const activeContractors = [];
          const seenIds = new Set();

          projects.forEach(p => {
            if (p.contractor_id && !seenIds.has(p.contractor_id)) {
              const contractorDetails = allContractors.find(c => c.contractor_id === p.contractor_id);
              if (contractorDetails) {
                seenIds.add(p.contractor_id);
                activeContractors.push({
                  id: contractorDetails.id, 
                  display_name: contractorDetails.name,
                  subtitle: `Contractor • ${p.contractor_id}`,
                  project_context: p.project_name, 
                  role: 'contractor'
                });
              }
            }
          });
          setListItems(activeContractors);

        } else {
          // === LOGIC FOR CONTRACTOR ===
          if (!currentContractorId) return;

          // Fixed Endpoint if needed (assuming /projects/contractor/{id} exists)
          const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/contractor/${currentContractorId}`);
          let data = [];
          if (response.ok) {
             data = await response.json();
          }
          
          if (Array.isArray(data)) {
              const formatted = data.map(p => ({
                id: p.id, 
                display_name: p.project_name,
                subtitle: p.village_name,
                village_name: p.village_name, 
                role: 'project' 
              }));
              setListItems(formatted);
          }
        }
      } catch (err) {
        console.error("Failed to load list", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContextData();
  }, [isOfficial, currentGovId, currentContractorId]);

  // --- 2. LOAD CHAT HISTORY ---
  useEffect(() => {
    if (!selectedItem || !currentUserId) return;

    const initializeChat = async () => {
      setChatLoading(true);
      setMessages([]);

      try {
        let receiverId = null;

        if (isOfficial) {
          receiverId = selectedItem.id;
        } else {
          // Contractor Logic: Find the official for the selected project's village
          const officialsRes = await fetch(`${import.meta.env.VITE_API_URL}/users/officials`);
          const officialsList = await officialsRes.json();
          const targetOfficial = officialsList.find(o => o.village_name === selectedItem.village_name);
          
          if (targetOfficial) {
            receiverId = targetOfficial.id;
            // Update selected item safely without causing loop
            // NOTE: Directly mutating state object is risky, but works for immediate read here
            selectedItem.receiverId = targetOfficial.id;
            selectedItem.receiverName = targetOfficial.name;
          }
        }

        if (receiverId) {
          const url = new URL(`${import.meta.env.VITE_API_URL}/official-contractor-chat/history`);
          url.searchParams.append("user1", currentUserId);
          url.searchParams.append("user2", receiverId);

          const historyRes = await fetch(url);
          if (historyRes.ok) {
            const historyData = await historyRes.json();
            setMessages(historyData);
          }
        }

      } catch (err) {
        console.error("Chat load error", err);
      } finally {
        setChatLoading(false);
        scrollToBottom();
      }
    };

    initializeChat();
    
    // Polling interval
    const interval = setInterval(initializeChat, 10000); 
    return () => clearInterval(interval);

  }, [selectedItem?.id, isOfficial, currentUserId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // --- 3. SEND MESSAGE ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedItem) return;
    
    const receiverId = isOfficial ? selectedItem.id : selectedItem.receiverId;
    if (!receiverId) return;

    setSending(true);

    try {
      const payload = {
        sender_id: currentUserId,
        receiver_id: receiverId,
        content: newMessage
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/official-contractor-chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const msg = await response.json();
        setMessages([...messages, msg]);
        setNewMessage("");
        scrollToBottom();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] max-w-7xl mx-auto flex flex-col md:flex-row gap-6 pb-4">
      
      {/* LEFT: LIST */}
      <div className={`md:w-1/3 w-full flex flex-col bg-white rounded-[2rem] border border-sand-200 overflow-hidden ${selectedItem ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-sand-200 bg-sand-50/50">
          <h2 className="text-xl font-serif font-bold text-earth-900 flex items-center gap-2">
            {isOfficial ? <HardHat size={20} className="text-clay-500" /> : <Building2 size={20} className="text-clay-500" />} 
            {isOfficial ? "Select Contractor" : "Select Project Context"}
          </h2>
          <p className="text-xs text-earth-900/60 mt-1">
            {isOfficial ? "Chat with contractors active in your village." : "Chat with the official regarding a project."}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-earth-900/40" /></div>
          ) : listItems.length === 0 ? (
            <div className="text-center py-10 text-earth-900/40 text-sm">
              {isOfficial ? "No active contractors found." : "No projects assigned."}
            </div>
          ) : (
            listItems.map((item, idx) => (
              <motion.button
                key={item.id || idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedItem(item)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedItem?.id === item.id 
                    ? 'bg-earth-900 text-white border-earth-900 shadow-md' 
                    : 'bg-white border-sand-200 hover:border-clay-400 text-earth-900'
                }`}
              >
                <h3 className="font-bold text-sm truncate">{item.display_name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    selectedItem?.id === item.id ? 'bg-white/20' : 'bg-sand-100'
                  }`}>
                    {item.subtitle}
                  </span>
                  <ChevronRight size={16} className={`opacity-50 ${selectedItem?.id === item.id ? 'text-white' : 'text-earth-900'}`} />
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: CHAT */}
      <div className={`flex-1 flex flex-col bg-white rounded-[2rem] border border-sand-200 overflow-hidden shadow-xl ${!selectedItem ? 'hidden md:flex' : 'flex'}`}>
        
        {selectedItem ? (
          <>
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-sand-200 flex items-center justify-between bg-sand-50/50">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedItem(null)} className="md:hidden p-2 hover:bg-sand-200 rounded-full">
                  <ChevronRight size={20} className="rotate-180" />
                </button>
                <div>
                  <h3 className="font-bold text-earth-900 flex items-center gap-2">
                    {isOfficial ? selectedItem.display_name : (selectedItem.receiverName || 'Connecting...')}
                    {isOfficial ? <HardHat size={16} className="text-clay-600" /> : <ShieldCheck size={16} className="text-green-600" />}
                  </h3>
                  <p className="text-xs text-earth-900/50 flex items-center gap-1">
                    <Lock size={12} /> Secure Channel • {isOfficial ? selectedItem.project_context : selectedItem.village_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-sand-50/30">
              {chatLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-earth-900/30" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 text-earth-900/30">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Start the discussion.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender_id === currentUserId;
                  return (
                    <motion.div 
                      key={msg.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-sm ${
                        isMe 
                          ? 'bg-earth-900 text-white rounded-br-none' 
                          : 'bg-white border border-sand-200 text-earth-900 rounded-bl-none'
                      }`}>
                        {!isMe && (
                          <p className="text-[10px] font-bold text-clay-600 mb-1 uppercase tracking-wider flex items-center gap-1">
                            {msg.sender_role === 'government_official' ? <ShieldCheck size={10} /> : <HardHat size={10} />}
                            {msg.sender_role.replace('_', ' ')}
                          </p>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-2 text-right ${isMe ? 'text-white/50' : 'text-earth-900/30'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-sand-200">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 outline-none focus:border-clay-500 focus:ring-1 focus:ring-clay-500 transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || sending}
                  className="bg-clay-500 hover:bg-clay-600 text-white p-3 rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-clay-500/20"
                >
                  {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-earth-900/30 p-8 text-center">
            <div className="w-20 h-20 bg-sand-100 rounded-full flex items-center justify-center mb-6">
              <Briefcase size={32} />
            </div>
            <h3 className="text-xl font-bold text-earth-900/50 mb-2">
              {isOfficial ? "Select a Contractor" : "Select a Project"}
            </h3>
            <p className="max-w-xs">
              {isOfficial 
                ? "Choose a contractor working in your village to start chatting."
                : "Select a project to chat with the assigned village official."
              }
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ContractorConnect;