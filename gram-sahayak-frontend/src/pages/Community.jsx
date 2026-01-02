import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, User, Shield, MoreHorizontal, 
  ThumbsUp, MessageCircle, Share2, Loader2, Sparkles 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Community = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  
  // New Post State
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [isPosting, setIsPosting] = useState(false);

  // Reply State
  const [activePostId, setActivePostId] = useState(null); // Which post is expanded
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const categories = ["General", "Water", "Roads", "Electricity", "Sanitation"];

  // 1. Fetch Feed & User Data
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser?.id) return;
        setUserData(storedUser);

        // Fetch feed using User ID (API filters by village automatically)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/community/feed?user_id=${storedUser.id}&limit=50`);
        
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (err) {
        console.error("Failed to load feed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  // 2. Handle New Post
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setIsPosting(true);

    try {
      const payload = {
        content: newPostContent,
        category: selectedCategory,
        is_anonymous: true // UI default
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/community/discuss?user_id=${userData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        // Optimistically add to top of list
        const newPost = {
          id: result.id,
          user_name: result.assigned_identity,
          user_role: userData.role,
          content: newPostContent,
          category: selectedCategory,
          created_at: new Date().toISOString(),
          upvotes: 0,
          replies: []
        };
        setPosts([newPost, ...posts]);
        setNewPostContent("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  // 3. Handle Reply Submit
  const handleReplySubmit = async (e, postId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setIsReplying(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/community/${postId}/comment?user_id=${userData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update local state to show new comment
        const updatedPosts = posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              replies: [...post.replies, {
                user_name: result.identity,
                user_role: userData.role,
                content: replyContent,
                created_at: new Date().toISOString()
              }]
            };
          }
          return post;
        });
        
        setPosts(updatedPosts);
        setReplyContent("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReplying(false);
    }
  };

  // Helper: Format Time
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900">Village Square</h1>
          <p className="text-earth-900/60 mt-2">Anonymous discussions for {posts[0]?.village_name || "your community"}.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-sand-200 rounded-full text-xs font-bold text-earth-900/60 uppercase tracking-widest">
           <Shield size={14} className="text-clay-500" /> Identity Protected
        </div>
      </div>

      {/* --- CREATE POST CARD --- */}
      <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-sand-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-clay-50 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
        
        <form onSubmit={handlePostSubmit} className="relative z-10">
          <div className="flex gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-sand-100 flex items-center justify-center text-earth-900/40">
              <User size={20} />
            </div>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's happening in the village?"
              className="flex-1 bg-transparent border-none outline-none text-lg text-earth-900 placeholder:text-earth-900/30 resize-none min-h-[80px]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-sand-100">
            {/* Category Selector */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'bg-earth-900 text-white' 
                      : 'bg-sand-100 text-earth-900/60 hover:bg-sand-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button 
              type="submit" 
              disabled={!newPostContent.trim() || isPosting}
              className="px-6 py-2.5 bg-clay-500 text-white rounded-xl font-bold hover:bg-clay-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-clay-500/20"
            >
              {isPosting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Post</>}
            </button>
          </div>
        </form>
      </div>

      {/* --- FEED --- */}
      {loading ? (
        <div className="py-20 flex justify-center text-earth-900/40">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-earth-900/40">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
          <p>No discussions yet. Be the first to speak!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-[2rem] border transition-all overflow-hidden ${
                activePostId === post.id ? 'border-clay-500 shadow-lg ring-1 ring-clay-100' : 'border-sand-200 hover:border-sand-300'
              }`}
            >
              <div className="p-6 md:p-8 cursor-pointer" onClick={() => setActivePostId(activePostId === post.id ? null : post.id)}>
                
                {/* Post Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      post.user_role === 'official' ? 'bg-earth-900 text-white' : 'bg-sand-200 text-earth-900/50'
                    }`}>
                      {post.user_role === 'official' ? <Shield size={18} /> : post.user_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${post.user_role === 'official' ? 'text-earth-900' : 'text-clay-600'}`}>
                          {post.user_name}
                        </span>
                        {post.user_role === 'official' && (
                          <span className="bg-earth-100 text-earth-800 text-[10px] font-bold px-1.5 py-0.5 rounded">OFFICIAL</span>
                        )}
                      </div>
                      <span className="text-xs text-earth-900/40">{timeAgo(post.created_at)} • {post.category}</span>
                    </div>
                  </div>
                  <button className="text-earth-900/30 hover:text-earth-900">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Post Content */}
                <p className="text-earth-900 text-lg leading-relaxed mb-6">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-6 text-earth-900/50 text-sm font-bold">
                  <button className="flex items-center gap-2 hover:text-clay-500 transition-colors">
                    <ThumbsUp size={18} /> {post.upvotes || 0}
                  </button>
                  <button className={`flex items-center gap-2 transition-colors ${activePostId === post.id ? 'text-clay-500' : 'hover:text-clay-500'}`}>
                    <MessageCircle size={18} /> {post.replies?.length || 0} Replies
                  </button>
                  <button className="flex items-center gap-2 hover:text-earth-900 transition-colors ml-auto">
                    <Share2 size={18} /> Share
                  </button>
                </div>
              </div>

              {/* --- COMMENTS SECTION (EXPANDABLE) --- */}
              <AnimatePresence>
                {activePostId === post.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-sand-50 border-t border-sand-200"
                  >
                    <div className="p-6 md:p-8 space-y-6">
                      
                      {/* Existing Replies */}
                      {post.replies && post.replies.length > 0 ? (
                        <div className="space-y-4">
                          {post.replies.map((reply, idx) => (
                            <div key={idx} className="flex gap-3">
                              <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                reply.user_role === 'official' ? 'bg-earth-900 text-white' : 'bg-white border border-sand-200 text-earth-900/40'
                              }`}>
                                {reply.user_role === 'official' ? <Shield size={14} /> : reply.user_name.charAt(0)}
                              </div>
                              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-sand-200 shadow-sm flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className={`text-xs font-bold ${reply.user_role === 'official' ? 'text-earth-900' : 'text-clay-600'}`}>
                                    {reply.user_name}
                                  </span>
                                  <span className="text-[10px] text-earth-900/30">{timeAgo(reply.created_at)}</span>
                                </div>
                                <p className="text-earth-900 text-sm">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-sm text-earth-900/40 italic py-4">
                          No replies yet. Start the conversation!
                        </div>
                      )}

                      {/* Reply Input */}
                      <form onSubmit={(e) => handleReplySubmit(e, post.id)} className="flex gap-3 items-end">
                        <div className="w-8 h-8 rounded-full bg-clay-100 flex items-center justify-center text-clay-600 font-bold text-xs">
                          Me
                        </div>
                        <div className="flex-1 relative">
                          <textarea 
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full bg-white border border-sand-300 rounded-2xl px-4 py-3 pr-12 text-sm outline-none focus:border-clay-500 focus:ring-1 focus:ring-clay-500 resize-none h-[50px]"
                          />
                          <button 
                            type="submit"
                            disabled={!replyContent.trim() || isReplying}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-clay-500 hover:text-clay-700 disabled:opacity-50"
                          >
                            {isReplying ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          </button>
                        </div>
                      </form>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;