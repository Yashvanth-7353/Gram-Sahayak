// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, MapPin, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-sand-50/80 backdrop-blur-lg border-b border-sand-200 py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-earth-900 p-2.5 rounded-xl text-sand-50 group-hover:rotate-6 transition-transform">
              <MapPin size={24} />
            </div>
            <span className="font-serif font-bold text-2xl text-earth-900 tracking-tight">
              Gram<span className="text-clay-500">Sahayak</span>
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-earth-900 font-medium px-4 py-2 rounded-full border border-earth-900/20 hover:bg-earth-100 transition"
            >
              <Languages size={18} />
              <span className="text-sm">{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>
            
            <Link to="/login" className="text-earth-900 hover:text-clay-600 font-bold px-4 transition-colors">
              {t.nav.login}
            </Link>
            
            <Link to="/signup">
              <button className="bg-clay-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-clay-600 transition-colors shadow-lg shadow-clay-500/30">
                {t.nav.signup}
              </button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <button onClick={toggleLanguage} className="text-earth-900 p-2 rounded-full bg-sand-200 font-bold text-xs">
              {lang === 'en' ? 'KN' : 'EN'}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-earth-900 p-2">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-sand-50 border-b border-sand-200 shadow-xl p-4 flex flex-col gap-3">
          <Link to="/login" className="w-full text-center py-3 text-earth-900 font-bold bg-sand-200 rounded-xl" onClick={() => setIsOpen(false)}>
            {t.nav.login}
          </Link>
          <Link to="/signup" className="w-full text-center py-3 text-white font-bold bg-clay-500 rounded-xl" onClick={() => setIsOpen(false)}>
            {t.nav.signup}
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;