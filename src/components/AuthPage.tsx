import React, { useState } from 'react';
import { BloodEffects } from './BloodEffects';
import { Footer } from './Footer';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthPageProps {
  onLogin: () => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
      }
      onLogin();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background styling for Monstropoly */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/lobby-bg.jpg" 
          alt="Lobby Background" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Ethereal Smoke Layers */}
        <div className="smoke-layer animate-smoke-1" />
        <div className="smoke-layer animate-smoke-2" />
        <div className="smoke-layer animate-smoke-3" />
        
        {/* Crimson Ritual Effects */}
        <BloodEffects />
      </div>
      
      <header className="z-10 mb-12 text-center animate-pulse-slow">
        <h1 className="text-6xl md:text-8xl font-serif text-red-600 tracking-[0.2em] uppercase mb-2 drop-shadow-[0_0_15px_rgba(153,27,27,0.6)]">
          Monstropoly
        </h1>
        <p className="text-zinc-500 text-xs font-serif italic uppercase tracking-[0.4em] opacity-60">
          The Ritual Begins
        </p>
      </header>

      <div className="z-10 bg-zinc-950 border border-red-900/30 p-8 rounded-lg shadow-2xl max-w-md w-full relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-800 to-transparent opacity-50"></div>
        
        <p className="text-zinc-500 text-[10px] font-serif italic uppercase tracking-widest text-center mb-6 border-b border-red-900/20 pb-2">
          {isLogin ? "Enter the nightmare once more..." : "Yield your soul to begin..."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-xs font-serif text-red-500 mb-1 uppercase tracking-widest">
                Display Name
              </label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-black border border-zinc-800 text-zinc-300 px-4 py-2 rounded focus:outline-none focus:border-red-800 transition-colors font-mono text-sm shadow-inner"
                placeholder="Choose your moniker..."
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-serif text-red-500 mb-1 uppercase tracking-widest">
              Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-800 text-zinc-300 px-4 py-2 rounded focus:outline-none focus:border-red-800 transition-colors font-mono text-sm shadow-inner"
              placeholder="your.soul@void.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-serif text-red-500 mb-1 uppercase tracking-widest">
              Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-800 text-zinc-300 px-4 py-2 rounded focus:outline-none focus:border-red-800 transition-colors font-mono text-sm shadow-inner"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-500 text-red-500 p-3 rounded text-sm text-center font-mono">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded uppercase tracking-[0.2em] font-serif transition-all duration-300 shadow-[0_0_15px_rgba(153,27,27,0.2)] mt-4
              ${isLoading ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed' : 'bg-red-950 hover:bg-red-900 border-red-800 text-red-100 hover:shadow-[0_0_25px_rgba(153,27,27,0.4)]'}`}
          >
            {isLoading ? 'Wait...' : isLogin ? 'Enter' : 'Sacrifice'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-zinc-600">
            {isLogin ? "Don't have an account?" : "Already doomed?"}{' '}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-red-500 hover:text-red-400 underline decoration-red-900/50 hover:decoration-red-500 transition-colors"
            >
              {isLogin ? 'Sign up here' : 'Log in here'}
            </button>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
