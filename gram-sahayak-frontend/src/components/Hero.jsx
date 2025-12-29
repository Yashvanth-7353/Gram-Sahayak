import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <div className="relative pt-28 pb-16 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs md:text-sm font-bold mb-6 border border-emerald-200">
            <Activity size={14} /> {t.hero.tag}
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
            {t.hero.title_part1} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              {t.hero.title_part2}
            </span>
          </h1>

          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 px-2">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              {t.hero.btn_report} <ArrowRight size={20} />
            </motion.button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg text-gray-700 hover:bg-gray-100 transition border border-gray-200 bg-white">
              {t.hero.btn_dashboard}
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Hero;