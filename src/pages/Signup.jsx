import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Employee'); // Default to Employee, but we allow changing for testing
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        name,
        role,
        createdAt: serverTimestamp()
      });
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-background antialiased min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] relative bg-primary overflow-hidden">
        <img 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYDtrnibaU0dn-5fn90oiP1w9hJShbtnwyafa6mc7S8BEw5g-GySKZbWCic__bX7DFSddfF1p9EA45g9ufMGgKQhH9-E32RNyV-w8LONsC9BLFiimMRz7WJ16bJk7ZmbY9GTO-LkTJDFHF0RUy9H1zogIvzHUtDtZeZ1295T_4uTGKtX7acp-9Lsubp4qH21RW5dk-qRWYqXx6JO601ZcwwHy4svmt1nbBTlEG7ByYZziU3lcPLEKRib5mBhnLbffk-xLNXuIorQY" 
          alt="Office" 
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="font-h1 text-h1 text-on-primary flex items-center gap-2 tracking-tight">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>hexagon</span>
            AgencyOS
          </div>
          <div className="max-w-md">
            <h2 className="font-h1 text-h1 text-on-primary mb-4">Join the team.</h2>
            <p className="font-body-md text-body-md text-on-primary/80">Get started by creating your account.</p>
          </div>
        </div>
      </div>
      
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-surface">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h1 className="font-h1 text-h1 text-on-background mb-2">Create an account</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Sign up to get started.</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSignup}>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            {/* Role Selection (for testing purposes) */}
            <div className="flex p-1 bg-surface-container-high rounded border border-outline-variant mb-8 relative">
              <button 
                type="button"
                onClick={() => setRole('Employee')}
                className={`flex-1 py-2 font-label-md text-label-md rounded shadow-sm relative z-10 transition-colors ${role === 'Employee' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-background'}`}
              >
                Employee
              </button>
              <button 
                type="button"
                onClick={() => setRole('Admin')}
                className={`flex-1 py-2 font-label-md text-label-md rounded shadow-sm relative z-10 transition-colors ${role === 'Admin' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-background'}`}
              >
                Admin
              </button>
            </div>
            
            {/* Name Input */}
            <div>
              <label className="block font-label-md text-label-md text-on-background mb-1.5">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body-md text-body-md text-on-background placeholder:text-outline/60" 
                placeholder="John Doe" 
              />
            </div>
            
            {/* Email Input */}
            <div>
              <label className="block font-label-md text-label-md text-on-background mb-1.5">Corporate Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body-md text-body-md text-on-background placeholder:text-outline/60" 
                placeholder="name@agency.com" 
              />
            </div>
            
            {/* Password Input */}
            <div>
              <label className="block font-label-md text-label-md text-on-background mb-1.5">Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body-md text-body-md text-on-background placeholder:text-outline/60" 
                placeholder="••••••••" 
              />
            </div>
            
            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full py-2.5 bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              Sign Up
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            Already have an account? <a href="/login" className="text-primary hover:underline">Log in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
