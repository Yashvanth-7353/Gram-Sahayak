// src/components/Hero.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // <--- Import useNavigate
import { useLanguage } from '../context/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();
  const navigate = useNavigate(); // <--- Initialize hook

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center px-4 sm:px-6 lg:px-12 pt-24 overflow-hidden bg-sand-50">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-gradient-to-b from-earth-100 to-transparent rounded-full blur-[100px] -z-10 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-gradient-to-t from-clay-400/10 to-transparent rounded-full blur-[80px] -z-10 -translate-x-1/4" />

      <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left: Typography & Messaging */}
        <div className="lg:col-span-7 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-earth-900/10 bg-white/50 backdrop-blur-sm text-earth-900 font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-clay-500 animate-pulse"/>
            {t.hero.tag}
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-black text-earth-900 leading-[0.95] tracking-tight mb-8">
              <motion.span 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="block"
              >
                {t.hero.title_part1}
              </motion.span>
              <motion.span 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="block text-clay-600 italic"
              >
                {t.hero.title_part2}
              </motion.span>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-earth-900/70 max-w-xl font-light leading-relaxed border-l-4 border-clay-500 pl-6 mb-10"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button 
              onClick={handleLoginRedirect} // <--- Added onClick
              className="group relative px-8 py-4 bg-earth-900 text-sand-50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <span className="relative z-10 font-bold text-lg flex items-center justify-center gap-2">
                {t.hero.btn_report} <ArrowUpRight className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button 
              onClick={handleLoginRedirect} // <--- Added onClick
              className="px-8 py-4 bg-transparent border-2 border-earth-900 text-earth-900 rounded-2xl font-bold text-lg hover:bg-earth-50 transition-colors"
            >
              {t.hero.btn_dashboard}
            </button>
          </motion.div>
        </div>

        {/* Right: GIF Display */}
        <div className="lg:col-span-5 relative mt-8 lg:mt-0">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1, delay: 0.3 }}
             className="relative rounded-[2rem] shadow-2xl border border-sand-200 overflow-hidden animate-float bg-white aspect-square md:aspect-auto h-full max-h-[600px] flex items-center justify-center"
           >
             <img 
               src="/hero-animation.gif"
               alt="Gram Sahayak Animation" 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-earth-900/5 pointer-events-none" />
           </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Hero;