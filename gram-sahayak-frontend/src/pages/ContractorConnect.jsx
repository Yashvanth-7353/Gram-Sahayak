import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, User, Building2, MapPin, 
  Loader2, Briefcase, ChevronRight, Lock
} from 'lucide-react';

const ContractorConnect = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const storedUser = JSON.parse(localStorage.getItem('user'));

  // 1. Fetch Contractor's Projects on Mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!storedUser?.contractor_id) return;
        const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/contractor/${storedUser.contractor_id}`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // 2. Fetch Chat History when Project Selected
  useEffect(() => {
    if (!selectedProject) return;

    const fetchChat = async () => {
      setChatLoading(true);
      try {
        const url = new URL(`${import.meta.env.VITE_API_URL}/project-chat/${selectedProject.id}`);
        url.searchParams.append("user_id", storedUser.contractor_id);
        url.searchParams.append("role", "contractor");

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Chat load error", err);
      } finally {
        setChatLoading(false);
        scrollToBottom();
      }
    };

    fetchChat();
    // Optional: Set up a polling interval here for live updates
    const interval = setInterval(fetchChat, 5000); 
    return () => clearInterval(interval);

  }, [selectedProject]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // 3. Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProject) return;
    setSending(true);

    try {
      const payload = {
        project_id: selectedProject.id,
        sender_id: storedUser.contractor_id,
        sender_role: "contractor",
        content: newMessage
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/project-chat/send`, {
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
      
      {/* --- LEFT: PROJECT LIST --- */}
      <div className={`md:w-1/3 w-full flex flex-col bg-white rounded-[2rem] border border-sand-200 overflow-hidden ${selectedProject ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-sand-200 bg-sand-50/50">
          <h2 className="text-xl font-serif font-bold text-earth-900 flex items-center gap-2">
            <Building2 size={20} className="text-clay-500" /> Select Project
          </h2>
          <p className="text-xs text-earth-900/60 mt-1">
            Choose a project to chat with its assigned official.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-earth-900/40" /></div>
          ) : projects.length === 0 ? (
            <div className="text-center py-10 text-earth-900/40 text-sm">No projects assigned yet.</div>
          ) : (
            projects.map((p) => (
              <motion.button
                key={p.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedProject(p)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedProject?.id === p.id 
                    ? 'bg-earth-900 text-white border-earth-900 shadow-md' 
                    : 'bg-white border-sand-200 hover:border-clay-400 text-earth-900'
                }`}
              >
                <h3 className="font-bold text-sm truncate">{p.project_name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    selectedProject?.id === p.id ? 'bg-white/20' : 'bg-sand-100'
                  }`}>
                    {p.village_name}
                  </span>
                  <ChevronRight size={16} className={`opacity-50 ${selectedProject?.id === p.id ? 'text-white' : 'text-earth-900'}`} />
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* --- RIGHT: CHAT WINDOW --- */}
      <div className={`flex-1 flex flex-col bg-white rounded-[2rem] border border-sand-200 overflow-hidden shadow-xl ${!selectedProject ? 'hidden md:flex' : 'flex'}`}>
        
        {selectedProject ? (
          <>
            {/* Chat Header */}
            <div className="p-4 md:p-6 border-b border-sand-200 flex items-center justify-between bg-sand-50/50">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedProject(null)} 
                  className="md:hidden p-2 hover:bg-sand-200 rounded-full"
                >
                  <ChevronRight size={20} className="rotate-180" />
                </button>
                <div>
                  <h3 className="font-bold text-earth-900 flex items-center gap-2">
                    {selectedProject.project_name}
                    <Lock size={14} className="text-green-600" />
                  </h3>
                  <p className="text-xs text-earth-900/50 flex items-center gap-1">
                    <MapPin size={12} /> Official Channel • {selectedProject.village_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-sand-50/30">
              {chatLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-earth-900/30" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 text-earth-900/30">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Start a secure conversation with the official.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender_role === 'contractor';
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
                          <p className="text-[10px] font-bold text-clay-600 mb-1 uppercase tracking-wider">
                            {msg.sender_name} (Official)
                          </p>
                        )}
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className={`text-[10px] mt-2 text-right ${isMe ? 'text-white/50' : 'text-earth-900/30'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-sand-200">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message regarding this project..."
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
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-earth-900/30 p-8 text-center">
            <div className="w-20 h-20 bg-sand-100 rounded-full flex items-center justify-center mb-6">
              <Briefcase size={32} />
            </div>
            <h3 className="text-xl font-bold text-earth-900/50 mb-2">No Project Selected</h3>
            <p className="max-w-xs">Select a project from the list to view secure communications with the assigned government official.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ContractorConnect;