// src/pages/Signup.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';

const Signup = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    email: '',
    phone_number: '',
    village_name: '',
    taluk: '',
    district: '',
    state: 'Karnataka',
    password: '',
    role: 'villager' // Fixed value as per schema
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error on edit
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Basic Client-side Validation
    if (formData.phone_number.length !== 10 || isNaN(formData.phone_number)) {
      setError("Please enter a valid 10-digit phone number");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Prepare data (ensure age is integer)
      const payload = {
        ...formData,
        age: parseInt(formData.age, 10)
      };

      // 2. API Call
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup/villager`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed. Please try again.');
      }

      // 3. Success
      alert(`Account created for ${data.name}! Please login.`);
      navigate('/login');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 relative">
        <Navbar />
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-earth-100/50 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
         <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-clay-400/5 rounded-full blur-[150px] translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        
        <div className="mb-10">
          <Link to="/login" className="inline-flex items-center gap-2 text-earth-900/60 hover:text-earth-900 mb-6 transition-colors">
            <ArrowLeft size={20} /> Back to Login
          </Link>
          <h1 className="font-serif font-black text-4xl md:text-5xl text-earth-900 mb-4">
            {t.auth.signup_title}
          </h1>
          <p className="text-xl text-clay-600 font-medium max-w-xl">
            {t.auth.signup_subtitle}
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl border border-sand-200 p-8 md:p-12"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            
            {/* --- Section 1: Personal Details --- */}
            <div className="md:col-span-2">
              <h3 className="flex items-center gap-2 text-earth-900 font-bold text-lg border-b border-sand-200 pb-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-clay-100 text-clay-600 flex items-center justify-center text-sm">1</span>
                {t.auth.section_personal}
              </h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-earth-900 pl-1">{t.auth.label_name}</label>
              <input name="name" type="text" required onChange={handleChange} className="input-field" placeholder="e.g. Ramesh Gowda" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-sm font-bold text-earth-900 pl-1">{t.auth.label_age}</label>
                 <input name="age" type="number" required onChange={handleChange} className="input-field" placeholder="25" />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-bold text-earth-900 pl-1">{t.auth.label_gender}</label>
                 <select name="gender" required onChange={handleChange} className="input-field">
                   <option value="">Select</option>
                   <option value="Male">{t.auth.gender_male}</option>
                   <option value="Female">{t.auth.gender_female}</option>
                   <option value="Other">{t.auth.gender_other}</option>
                 </select>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-earth-900 pl-1">{t.auth.label_email}</label>
              <input name="email" type="email" required onChange={handleChange} className="input-field" placeholder="ramesh@example.com" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-earth-900 pl-1">{t.auth.label_phone}</label>
              <input 
                name="phone_number" 
                type="tel" 
                pattern="[0-9]{10}" 
                title="10 digit mobile number"
                required 
                onChange={handleChange} 
                className="input-field" 
                placeholder="9876543210" 
              />
            </div>

            {/* --- Section 2: Location & Security --- */}
            <div className="md:col-span-2 mt-4">
              <h3 className="flex items-center gap-2 text-earth-900 font-bold text-lg border-b border-sand-200 pb-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-earth-100 text-earth-800 flex items-center justify-center text-sm">2</span>
                {t.auth.section_location}
              </h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-earth-900 pl-1">{t.auth.label_village}</label>
              <input name="village_name" type="text" required onChange={handleChange} className="input-field" placeholder="e.g. Rampura" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-earth-900 pl-1">{t.auth.label_taluk}</label>
              <input name="taluk" type="text" required onChange={handleChange} className="input-field" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-earth-900 pl-1">{t.auth.label_district}</label>
              <input name="district" type="text" required onChange={handleChange} className="input-field" />
            </div>

             <div className="space-y-2">
              <label className="text-sm font-bold text-earth-900 pl-1">{t.auth.label_state}</label>
              <input name="state" type="text" defaultValue="Karnataka" required onChange={handleChange} className="input-field" />
            </div>

            <div className="md:col-span-2 space-y-2 pt-4">
              <label className="text-sm font-bold text-earth-900 pl-1">{t.auth.label_password}</label>
              <input name="password" type="password" required onChange={handleChange} className="input-field" placeholder="Create a strong password" />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 pt-8">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-5 bg-clay-500 hover:bg-clay-600 text-white rounded-2xl font-bold text-xl shadow-xl shadow-clay-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 /> {t.auth.btn_signup}</>}
              </button>
            </div>

          </form>
        </motion.div>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          padding: 1rem 1.25rem;
          background-color: #F5F7F5;
          border: 2px solid transparent;
          border-radius: 1rem;
          outline: none;
          color: #1A2F25;
          font-weight: 500;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: #E76F51;
          background-color: #ffffff;
        }
        .input-field::placeholder {
          color: #1A2F25;
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
};

export default Signup;