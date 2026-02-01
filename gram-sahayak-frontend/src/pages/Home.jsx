import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import { Github, Linkedin, Code2, Heart, Mail } from 'lucide-react'; // Added Mail

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      
      {/* Compact & Themed Footer */}
      <footer className="bg-[#2c241b] text-stone-300 py-10 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center text-center">
          
          {/* 1. Project Header (More Compact) */}
          <div className="mb-8">
            <h3 className="text-lg font-serif font-bold text-sand-50 mb-1 flex items-center justify-center gap-2">
              <Code2 size={20} className="text-emerald-500" /> Gram-Sahayak
            </h3>
            
          </div>

          {/* 2. Developer Highlight (The Main Focus) */}
          <div className="w-full max-w-2xl bg-white/5 rounded-xl p-6 border border-white/10 shadow-xl backdrop-blur-sm relative overflow-hidden group">
            {/* Subtle glow effect behind the card */}
            <div className="absolute top-0 left-1/4 w-1/2 h-full bg-emerald-500/10 blur-[50px] -z-10 group-hover:bg-emerald-500/20 transition-all duration-700"></div>

            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-4">
              Designed & Developed By
            </h4>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16">
              
              {/* Developer 1 */}
              <div className="flex flex-col items-center">
                <span className="text-white font-medium text-base mb-2 hover:text-emerald-300 transition-colors cursor-default">
                  Yashvanth M U
                </span>
                <div className="flex gap-3 mb-2">
                  <a href="https://github.com/Yashvanth-7353" target="_blank" rel="noreferrer" className="text-stone-400 hover:text-white hover:scale-110 transition-all">
                    <Github size={18} />
                  </a>
                  <a href="https://www.linkedin.com/in/yashvanth-m-u-720598282/" target="_blank" rel="noreferrer" className="text-stone-400 hover:text-blue-400 hover:scale-110 transition-all">
                    <Linkedin size={18} />
                  </a>
                </div>
                {/* Email Display */}
                <a href="mailto:yashavanth.mu870@gmail.com" className="flex items-center gap-1.5 text-grey hover:text-emerald-400 transition-colors text-[11px] group/email">
                  <Mail size={12} />
                  <span>yashavanth.mu870@gmail.com</span>
                </a>
              </div>

              {/* Vertical Divider */}
              <div className="hidden sm:block w-px h-10 bg-white/10"></div>

              {/* Developer 2 */}
              <div className="flex flex-col items-center">
                <span className="text-white font-medium text-base mb-2 hover:text-emerald-300 transition-colors cursor-default">
                  Vishwa Panchal
                </span>
                <div className="flex gap-3 mb-2">
                  <a href="https://github.com/vishwapanchal" target="_blank" rel="noreferrer" className="text-stone-400 hover:text-white hover:scale-110 transition-all">
                    <Github size={18} />
                  </a>
                  <a href="https://www.linkedin.com/in/thevishwapanchal" target="_blank" rel="noreferrer" className="text-stone-400 hover:text-blue-400 hover:scale-110 transition-all">
                    <Linkedin size={18} />
                  </a>
                </div>
                {/* Email Display */}
                <a href="mailto:thevishwapanchal@gmail.com" className="flex items-center gap-1.5 text-grey hover:text-emerald-400 transition-colors text-[11px] group/email">
                  <Mail size={12} />
                  <span>thevishwapanchal@gmail.com</span>
                </a>
              </div>

            </div>
          </div>

          {/* 3. Minimal Copyright */}
          <div className="mt-8 text-[10px] text-gray flex items-center gap-1.5">
            <span>Made with</span>
            <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" />
            <span>by curious learners • Bengaluru, India</span>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Home;