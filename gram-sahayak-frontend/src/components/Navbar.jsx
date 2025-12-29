import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, MapPin, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, toggleLanguage, t } = useLanguage();

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <MapPin size={24} />
            </div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">
              Gram<span className="text-emerald-600">Sahayak</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium px-3 py-1 rounded-md border border-gray-200 hover:border-emerald-600 transition"
            >
              <Languages size={18} />
              {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
            </button>
            <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
              {t.nav.login}
            </Link>
            <Link to="/signup">
              <button className="bg-emerald-600 text-white px-5 py-2 rounded-full font-medium hover:bg-emerald-700 transition shadow-md">
                {t.nav.signup}
              </button>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="text-gray-600 p-2 rounded-full hover:bg-gray-100"
            >
              <span className="font-bold text-sm">{lang === 'en' ? 'KN' : 'EN'}</span>
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-800 p-1">
              {isOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Full Width for easier tapping) */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 absolute w-full shadow-lg">
          <div className="px-4 py-4 space-y-4 flex flex-col items-center">
            <Link 
              to="/login" 
              className="w-full text-center py-3 text-lg text-gray-700 font-medium bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              {t.nav.login}
            </Link>
            <Link 
              to="/signup" 
              className="w-full text-center py-3 text-lg text-white font-bold bg-emerald-600 rounded-lg shadow-md"
              onClick={() => setIsOpen(false)}
            >
              {t.nav.signup}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;