import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles, Loader2, ArrowLeft, MessageSquare, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OfficialCommunityAI = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem('user'));

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Determine the best ID to send (government_id is preferred for officials)
      const userId = storedUser.government_id || storedUser.id || storedUser._id;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/community/official/ask?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data.answer);
      } else {
        setError(data.detail || "Failed to get AI response");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Preset queries for quick access
  const quickQueries = [
    "What is the most requested infrastructure project?",
    "Summarize the complaints about water supply.",
    "What is the general sentiment of the village this week?",
    "List top 3 urgent issues mentioned by villagers."
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-6 px-4">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-earth-900/60 mb-6 hover:text-earth-900 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-earth-900 rounded-2xl mb-4 shadow-lg shadow-earth-900/20">
          <Bot size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-earth-900">Community Pulse AI</h1>
        <p className="text-earth-900/60 mt-2 max-w-lg mx-auto">
          Analyze community discussions, identify trending needs, and summarize grievances using AI.
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-earth-900/5 border border-sand-200 overflow-hidden relative">
        {/* Chat / Result Area */}
        <div className="p-8 min-h-[300px] flex flex-col justify-center items-center bg-sand-50/50">
          
          {!response && !loading && !error && (
            <div className="text-center opacity-50">
              <Sparkles size={48} className="mx-auto mb-3 text-clay-500" />
              <p className="font-medium text-earth-900">Ask a question to generate insights</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center animate-pulse">
              <Loader2 size={40} className="text-earth-900 animate-spin mb-4" />
              <p className="text-earth-900/60 font-medium">Analyzing village discussions...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl flex items-center gap-3 border border-red-100">
              <AlertCircle size={24} />
              <p>{error}</p>
            </div>
          )}

          {response && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full text-left"
            >
              <h3 className="text-xs font-bold text-earth-900/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-clay-500" /> AI Analysis Result
              </h3>
              <div className="prose prose-earth max-w-none text-earth-900 leading-relaxed bg-white p-6 rounded-2xl border border-sand-100 shadow-sm whitespace-pre-line">
                {response}
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white p-6 border-t border-sand-200">
          {/* Quick Chips */}
          {!response && (
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {quickQueries.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(q)}
                  className="text-xs font-bold px-3 py-1.5 bg-sand-100 text-earth-900/70 rounded-full hover:bg-earth-900 hover:text-white transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleAskAI} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. What are the major concerns regarding roads?"
              className="w-full pl-6 pr-14 py-4 bg-sand-50 rounded-full border border-sand-200 focus:border-earth-900 focus:ring-1 focus:ring-earth-900 outline-none transition-all placeholder:text-earth-900/30 text-earth-900 font-medium shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 p-2 bg-earth-900 text-white rounded-full hover:bg-earth-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OfficialCommunityAI;