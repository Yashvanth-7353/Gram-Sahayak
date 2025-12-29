import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      
      {/* Simple Footer Placeholder */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center">
        <p>&copy; 2025 Gram-Sahayak. Built for RV College of Engineering.</p>
      </footer>
    </div>
  );
};

export default Home;