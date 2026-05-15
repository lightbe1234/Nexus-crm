import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Hexagon, Mail, Lock, Eye, EyeOff, User, ArrowRight, ShieldCheck, Briefcase } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        name,
        role,
        createdAt: serverTimestamp()
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-outfit">
      {/* Left Side: Branding / Hero */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 z-10" />
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
          alt="Team"
        />
        <div className="absolute inset-0 bg-slate-900/40 z-10" />
        <div className="relative z-20 flex flex-col justify-between p-16 w-full h-full">
          <div className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
              <Hexagon size={28} className="text-white fill-white" />
            </div>
            AgencyOS
          </div>
          <div className="max-w-xl">
            <h2 className="text-5xl font-black text-white mb-6 leading-tight tracking-tighter">Join the enterprise. Build together.</h2>
            <p className="text-lg text-slate-300 font-medium leading-relaxed">Create your account and get immediate access to project management, client tracking, and financial oversight tools.</p>
            <div className="mt-12 flex gap-3">
              <div className="h-1.5 w-6 bg-slate-700 rounded-full" />
              <div className="h-1.5 w-12 bg-blue-500 rounded-full" />
              <div className="h-1.5 w-6 bg-slate-700 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form Area */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile logo */}
          <div className="flex lg:hidden text-2xl font-black text-slate-900 items-center gap-2 mb-12 tracking-tighter">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Hexagon size={20} className="text-white fill-white" />
            </div>
            AgencyOS
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Create account</h1>
            <p className="text-slate-500 font-medium">Set up your institutional profile to get started.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSignup}>
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-start gap-3">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Role Toggle */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Account Type</label>
              <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-2xl gap-1">
                {['Employee', 'Admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      role === r
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {r === 'Admin' ? <ShieldCheck size={14} strokeWidth={3} /> : <Briefcase size={14} strokeWidth={3} />}
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400 transition-all shadow-sm"
                  placeholder="Jane Smith"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Corporate Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400 transition-all shadow-sm"
                  placeholder="name@agency.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400 transition-all shadow-sm"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 text-center flex items-center justify-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <a href="#" className="hover:text-slate-900 transition-colors">IT Support</a>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}
