import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Briefcase, Building2, ArrowRight, Loader2, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState('villager');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    identifier: '', 
    password: ''
  });

  // --- DEMO CREDENTIALS CONFIGURATION ---
  const DEMO_CREDS = {
    villager: {
      label: "Phone No.",
      id: "9876543210",
      pass: "1234"
    },
    contractor: {
      label: "Contractor ID",
      id: "con2",
      pass: "1234"
    },
    official: {
      label: "Official ID",
      id: "GOV-MND-2045",
      pass: "1234"
    }
  };

  // Helper to auto-fill credentials for recruiters
  const fillDemoCreds = () => {
    setFormData({
      identifier: DEMO_CREDS[role].id,
      password: DEMO_CREDS[role].pass
    });
  };

  const getIdentifierLabel = () => {
    switch(role) {
      case 'contractor': return t.auth.label_contractor_id;
      case 'official': return t.auth.label_gov_id;
      default: return t.auth.label_phone;
    }
  };

  const getIdentifierKey = () => {
    switch(role) {
      case 'contractor': return 'contractor_id';
      case 'official': return 'government_id';
      default: return 'phone_number';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const key = getIdentifierKey();
    const payload = {
      [key]: formData.identifier,
      password: formData.password
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login/${role}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      const userSession = {
        id: data.id,
        name: data.name,
        role: role, 
        phone_number: role === 'villager' ? formData.identifier : undefined,
        contractor_id: role === 'contractor' ? formData.identifier : undefined,
        government_id: role === 'official' ? formData.identifier : undefined
      };

      localStorage.setItem('user', JSON.stringify(userSession));

      navigate('/dashboard');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 relative overflow-hidden">
      <Navbar />
      
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-earth-100 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-clay-400/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-[2rem] shadow-2xl border border-sand-200 p-8 md:p-12 relative overflow-hidden">
            
            <div className="text-center mb-10">
              <h1 className="font-serif font-bold text-3xl text-earth-900 mb-2">{t.auth.login_title}</h1>
              <p className="text-earth-900/60">{t.auth.login_subtitle}</p>
            </div>

            {/* Role Switcher */}
            <div className="flex p-1 bg-sand-100 rounded-2xl mb-8">
              {[
                { id: 'villager', icon: User, label: t.auth.role_villager },
                { id: 'contractor', icon: Briefcase, label: t.auth.role_contractor },
                { id: 'official', icon: Building2, label: t.auth.role_official }
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => { 
                    setRole(r.id); 
                    setError(null); 
                    setFormData({ identifier: '', password: '' }); // Clear form on tab switch
                  }}
                  type="button"
                  className={`flex-1 flex flex-col items-center py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    role === r.id 
                      ? 'bg-white text-clay-600 shadow-lg scale-105' 
                      : 'text-earth-900/50 hover:text-earth-900'
                  }`}
                >
                  <r.icon size={20} className="mb-1" />
                  <span className="text-xs">{r.label}</span>
                </button>
              ))}
            </div>

            {/* --- DEMO CREDENTIALS BOX --- */}
            <motion.div 
              key={role} // Re-animate on role change
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8 p-4 bg-blue-50/80 border border-blue-100 rounded-2xl backdrop-blur-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                  <Info size={14} /> Demo Credentials
                </h3>
                <button 
                  type="button"
                  onClick={fillDemoCreds}
                  className="text-[10px] bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-sm"
                >
                  Auto-fill
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-500">{DEMO_CREDS[role].label}:</span>
                  <span className="font-mono font-bold text-blue-900">{DEMO_CREDS[role].id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-500">Password:</span>
                  <span className="font-mono font-bold text-blue-900">{DEMO_CREDS[role].pass}</span>
                </div>
              </div>
            </motion.div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-earth-900 mb-2 pl-1">
                  {getIdentifierLabel()}
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-6 py-4 bg-sand-50 border-2 border-transparent focus:border-clay-500 rounded-2xl outline-none transition-all font-medium text-earth-900 placeholder:text-earth-900/30"
                  placeholder={
                    role === 'villager' ? '9876543210' : 
                    role === 'contractor' ? 'con2' : 
                    'GOV-MND-2045'
                  }
                  value={formData.identifier}
                  onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-earth-900 mb-2 pl-1">
                  {t.auth.label_password}
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-6 py-4 bg-sand-50 border-2 border-transparent focus:border-clay-500 rounded-2xl outline-none transition-all font-medium text-earth-900"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-earth-900 text-sand-50 rounded-2xl font-bold text-lg hover:bg-earth-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>{t.auth.btn_login} <ArrowRight className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>

            {role === 'villager' && (
              <div className="mt-8 text-center">
                <p className="text-earth-900/60 text-sm">
                  {t.auth.no_account}{' '}
                  <Link to="/signup" className="text-clay-600 font-bold hover:underline">
                    {t.auth.signup_link}
                  </Link>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;