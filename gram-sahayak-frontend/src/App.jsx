import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

// Create placeholder pages for Login/Signup to avoid errors
const Login = () => <div className="h-screen flex items-center justify-center text-2xl">Login Page (Coming Soon)</div>;
const Signup = () => <div className="h-screen flex items-center justify-center text-2xl">Signup Page (Coming Soon)</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;