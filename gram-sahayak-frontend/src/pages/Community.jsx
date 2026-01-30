import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, User, Shield, MoreHorizontal, 
  ArrowBigUp, MessageCircle, Loader2, Image as ImageIcon, X 
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
  const [postImage, setPostImage] = useState(null); 
  const [isPosting, setIsPosting] = useState(false);

  // Reply State
  const [activePostId, setActivePostId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const [upvotedPosts, setUpvotedPosts] = useState(new Set());

  const categories = ["General", "Water", "Roads", "Electricity", "Sanitation"];

  // 1. Fetch Feed
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser?.id) return;
        setUserData(storedUser);

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
      const formData = new FormData();
      formData.append('content', newPostContent);
      formData.append('category', selectedCategory);
      if (postImage) {
        formData.append('image', postImage);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/community/discuss?user_id=${userData.id}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const newPost = {
          id: result.id,
          user_name: result.assigned_identity,
          user_role: userData.role,
          content: newPostContent,
          category: selectedCategory,
          image_url: result.image_url,
          created_at: new Date().toISOString(),
          upvotes: 0,
          replies: []
        };
        setPosts([newPost, ...posts]);
        setNewPostContent("");
        setPostImage(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  // 3. Toggle Upvote
  const handleUpvote = async (e, postId) => {
    e.stopPropagation(); 
    const isCurrentlyUpvoted = upvotedPosts.has(postId);
    
    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id === postId) {
        return { 
          ...p, 
          upvotes: Math.max(0, p.upvotes + (isCurrentlyUpvoted ? -1 : 1)) 
        };
      }
      return p;
    }));

    setUpvotedPosts(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyUpvoted) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/community/${postId}/upvote?user_id=${userData.id}`, {
        method: 'PATCH'
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(prevPosts => prevPosts.map(p => 
          p.id === postId ? { ...p, upvotes: data.upvotes } : p
        ));
      }
    } catch (err) {
      console.error("Upvote failed", err);
    }
  };

  // 4. Handle Reply
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

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 px-4 overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-earth-900">Village Square</h1>
          <p className="text-xs text-earth-900/60 truncate max-w-xs">
            Anonymous discussions for {posts[0]?.village_name || "your community"}.
          </p>
        </div>
        <div className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1 bg-sand-200 rounded-full text-[10px] font-bold text-earth-900/60 uppercase tracking-widest whitespace-nowrap">
           <Shield size={12} className="text-clay-500" /> Identity Protected
        </div>
      </div>

      {/* --- CREATE POST CARD --- */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand-200">
        <form onSubmit={handlePostSubmit}>
          <div className="flex gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-sand-100 flex items-center justify-center text-earth-900/40 shrink-0">
              <User size={16} />
            </div>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's happening?"
              className="flex-1 bg-transparent border-none outline-none text-base text-earth-900 placeholder:text-earth-900/30 resize-none min-h-[50px] py-1"
            />
          </div>

          {/* Image Preview (Mobile Optimized) */}
          {postImage && (
            <div className="mb-3 ml-0 sm:ml-11 relative inline-block">
              <img 
                src={URL.createObjectURL(postImage)} 
                alt="Preview" 
                className="h-16 w-auto rounded-lg border border-sand-200 object-cover" 
              />
              <button 
                type="button" 
                onClick={() => setPostImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600"
              >
                <X size={10} />
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-sand-100 ml-0 sm:ml-11">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Category Scroll */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none mask-fade">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${
                      selectedCategory === cat 
                        ? 'bg-earth-900 text-white' 
                        : 'bg-sand-100 text-earth-900/60 hover:bg-sand-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="relative shrink-0">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setPostImage(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button type="button" className="p-1.5 hover:bg-sand-100 rounded-full text-clay-600 transition-colors">
                  <ImageIcon size={16} />
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!newPostContent.trim() || isPosting}
              className="w-full sm:w-auto justify-center px-4 py-1.5 bg-clay-500 text-white rounded-lg text-xs font-bold hover:bg-clay-600 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isPosting ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Post</>}
            </button>
          </div>
        </form>
      </div>

      {/* --- FEED --- */}
      {loading ? (
        <div className="py-10 flex justify-center text-earth-900/40">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 text-earth-900/40 text-sm">
          <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
          <p>No discussions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                activePostId === post.id ? 'border-clay-500 shadow-md' : 'border-sand-200 hover:border-sand-300'
              }`}
            >
              <div className="p-4 cursor-pointer" onClick={() => setActivePostId(activePostId === post.id ? null : post.id)}>
                
                {/* Post Header */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      post.user_role === 'official' ? 'bg-earth-900 text-white' : 'bg-sand-200 text-earth-900/50'
                    }`}>
                      {post.user_role === 'official' ? <Shield size={14} /> : post.user_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-xs ${post.user_role === 'official' ? 'text-earth-900' : 'text-clay-600'}`}>
                          {post.user_name}
                        </span>
                        {post.user_role === 'official' && (
                          <span className="bg-earth-100 text-earth-800 text-[9px] font-bold px-1 py-px rounded">OFFICIAL</span>
                        )}
                        <span className="text-[10px] text-earth-900/30">• {timeAgo(post.created_at)}</span>
                      </div>
                      <span className="text-[10px] text-earth-900/40 bg-sand-100 px-1.5 rounded-sm">{post.category}</span>
                    </div>
                  </div>
                  <button className="text-earth-900/30 hover:text-earth-900">
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                {/* Content - Adjusted indent for mobile */}
                <p className="text-earth-900 text-sm leading-relaxed whitespace-pre-wrap ml-0 sm:ml-10 mb-3">
                  {post.content}
                </p>

                {/* Image - Adjusted indent for mobile */}
                {post.image_url && (
                  <div className="ml-0 sm:ml-10 mb-3 rounded-xl overflow-hidden border border-sand-200 max-w-[200px]">
                    <img src={post.image_url} alt="Attachment" className="w-full h-auto object-cover" />
                  </div>
                )}

                {/* Actions - Adjusted indent for mobile */}
                <div className="flex items-center gap-4 text-earth-900/50 text-xs font-bold ml-0 sm:ml-10">
                  <button 
                    onClick={(e) => handleUpvote(e, post.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                      upvotedPosts.has(post.id) 
                        ? 'bg-clay-100 text-clay-600' 
                        : 'hover:bg-sand-100 hover:text-earth-900'
                    }`}
                  >
                    <ArrowBigUp size={16} className={upvotedPosts.has(post.id) ? 'fill-current' : ''} /> 
                    {post.upvotes || 0}
                  </button>

                  <button className={`flex items-center gap-1 transition-colors ${activePostId === post.id ? 'text-clay-500' : 'hover:text-clay-500'}`}>
                    <MessageCircle size={16} /> {post.replies?.length || 0}
                  </button>
                </div>
              </div>

              {/* --- COMMENTS SECTION --- */}
              <AnimatePresence>
                {activePostId === post.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-sand-50 border-t border-sand-200"
                  >
                    {/* Reduced padding-left for mobile */}
                    <div className="p-4 pl-4 sm:pl-14 space-y-4">
                      
                      {post.replies && post.replies.length > 0 ? (
                        <div className="space-y-3">
                          {post.replies.map((reply, idx) => (
                            <div key={idx} className="flex gap-2">
                              <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                reply.user_role === 'official' ? 'bg-earth-900 text-white' : 'bg-white border border-sand-200 text-earth-900/40'
                              }`}>
                                {reply.user_role === 'official' ? <Shield size={10} /> : reply.user_name.charAt(0)}
                              </div>
                              <div className="bg-white p-2.5 rounded-xl rounded-tl-none border border-sand-200 shadow-sm flex-1">
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className={`text-[10px] font-bold ${reply.user_role === 'official' ? 'text-earth-900' : 'text-clay-600'}`}>
                                    {reply.user_name}
                                  </span>
                                  <span className="text-[9px] text-earth-900/30">{timeAgo(reply.created_at)}</span>
                                </div>
                                <p className="text-earth-900 text-xs">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] text-earth-900/40 italic">No replies yet.</div>
                      )}

                      <form onSubmit={(e) => handleReplySubmit(e, post.id)} className="flex gap-2 items-center">
                        <input 
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Reply..."
                          className="w-full bg-white border border-sand-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-clay-500 focus:ring-1 focus:ring-clay-500"
                        />
                        <button 
                          type="submit"
                          disabled={!replyContent.trim() || isReplying}
                          className="p-2 text-clay-500 hover:text-clay-700 disabled:opacity-50"
                        >
                          {isReplying ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        </button>
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