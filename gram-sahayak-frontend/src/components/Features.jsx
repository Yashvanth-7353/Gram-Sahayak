import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Languages, BarChart3, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Features = () => {
  const { t } = useLanguage();

  const featuresList = [
    {
      icon: <Camera className="w-8 h-8 text-blue-500" />,
      title: t.features.card1_title,
      desc: t.features.card1_desc,
    },
    {
      icon: <Languages className="w-8 h-8 text-emerald-500" />,
      title: t.features.card2_title,
      desc: t.features.card2_desc,
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-purple-500" />,
      title: t.features.card3_title,
      desc: t.features.card3_desc,
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-500" />,
      title: t.features.card4_title,
      desc: t.features.card4_desc,
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
            {t.features.title}
          </h2>
          <p className="mt-3 text-base md:text-lg text-gray-600">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresList.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="mb-4 bg-white w-14 h-14 rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;