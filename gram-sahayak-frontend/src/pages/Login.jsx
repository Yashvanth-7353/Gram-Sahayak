import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Briefcase, Building2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
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

      // --- FIX: EXPLICITLY SAVE ROLE FROM STATE ---
      // We use the 'role' state variable to ensure it matches 'official', 'contractor', or 'villager'
      // exactly as App.jsx expects it.
      const userSession = {
        id: data.id,
        name: data.name,
        role: role, // <--- CHANGED THIS (was data.role)
        phone_number: role === 'villager' ? formData.identifier : undefined,
        contractor_id: role === 'contractor' ? formData.identifier : undefined,
        government_id: role === 'official' ? formData.identifier : undefined
      };

      localStorage.setItem('user', JSON.stringify(userSession));

      // 4. Redirect
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
                  onClick={() => { setRole(r.id); setError(null); }}
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
                  placeholder={role === 'villager' ? '9876543210' : ''}
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