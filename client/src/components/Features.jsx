// src/components/Features.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Languages, BarChart3, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Features = () => {
  const { t } = useLanguage();

  // Grid Layout: 'span' controls width on desktop
  const features = [
    {
      icon: <Camera size={32} />,
      title: t.features.card1_title,
      desc: t.features.card1_desc,
      bg: "bg-clay-500",
      text: "text-white",
      span: "md:col-span-2",
    },
    {
      icon: <BarChart3 size={32} />,
      title: t.features.card2_title,
      desc: t.features.card2_desc,
      bg: "bg-sand-200",
      text: "text-earth-900",
      span: "md:col-span-1",
    },
    {
      icon: <Languages size={32} />,
      title: t.features.card3_title, // Updated to use translation key
      desc: t.features.card3_desc,   // Updated to use translation key
      bg: "bg-earth-900",
      text: "text-sand-50",
      span: "md:col-span-1",
    },
    {
      icon: <ShieldCheck size={32} />,
      title: t.features.card4_title, // Updated to use translation key
      desc: t.features.card4_desc,   // Updated to use translation key
      bg: "bg-white",
      text: "text-earth-900",
      span: "md:col-span-2",
      border: true
    },
  ];

  return (
    <section className="py-24 px-4 bg-sand-100">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-16 text-center md:text-left max-w-2xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold text-earth-900 mb-4"
          >
            {t.features.title}
          </motion.h2>
          <p className="text-xl text-earth-900/60 font-light">{t.features.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className={`${f.span} ${f.bg} ${f.text} rounded-[2.5rem] p-8 relative group overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${f.border ? 'border border-sand-300' : ''}`}
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${f.text === 'text-white' ? 'bg-white/20' : 'bg-earth-900/10'}`}>
                  {f.icon}
                </div>
                
                <div>
                  <h3 className="text-2xl font-serif font-bold mb-3">{f.title}</h3>
                  <p className="opacity-80 leading-relaxed text-sm md:text-base">{f.desc}</p>
                </div>
              </div>

              {/* Interaction Decor */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0">
                <ArrowRight />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;