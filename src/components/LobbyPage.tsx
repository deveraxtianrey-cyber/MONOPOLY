import React, { useState } from 'react';
import { BloodEffects } from './BloodEffects';
import { Footer } from './Footer';

interface LobbyPageProps {
  onJoinLobby: (code: string) => void;
  onCreateLobby: () => void;
  onLogout: () => void;
}

export function LobbyPage({ onJoinLobby, onCreateLobby, onLogout }: LobbyPageProps) {
  const [joinCode, setJoinCode] = useState('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim().length > 0) {
      onJoinLobby(joinCode.toUpperCase().trim());
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden focus:outline-none">
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
          The Ancient Gathering
        </p>
      </header>

      <div className="z-10 bg-zinc-950 border border-red-900/30 p-8 rounded-lg shadow-2xl max-w-md w-full relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-800 to-transparent opacity-50"></div>
        
        <div className="flex flex-col items-center mb-8">
           <h2 className="text-sm font-serif text-zinc-500 tracking-[0.2em] uppercase mb-1">
             The AnteChamber
           </h2>
           <p className="text-zinc-600 text-[10px] font-serif italic uppercase tracking-widest border-t border-red-900/20 pt-1">
             Gather your fellow souls before the torment begins...
           </p>
        </div>

        <div className="space-y-8">
          {/* Create Lobby Section */}
          <div className="bg-black/50 border border-red-900/20 p-6 rounded relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-900/5 group-hover:bg-red-900/10 transition-colors pointer-events-none" />
            <h2 className="text-xl font-serif text-red-500 mb-2 uppercase tracking-widest text-center">Form a Pact</h2>
            <p className="text-zinc-500 text-xs text-center mb-4">
              Create a new domain and invite others to their doom.
            </p>
            <button 
              onClick={onCreateLobby}
              className="w-full bg-red-950 hover:bg-red-900 border border-red-800 text-red-100 py-3 rounded uppercase tracking-[0.2em] font-serif transition-all duration-300 hover:shadow-[0_0_15px_rgba(153,27,27,0.4)]"
            >
              Summon Lobby
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-zinc-800 flex-1"></div>
            <span className="text-xs font-serif text-red-500 uppercase tracking-widest">or</span>
            <div className="h-px bg-zinc-800 flex-1"></div>
          </div>

          {/* Join Lobby Section */}
          <div className="bg-black/50 border border-zinc-800/50 p-6 rounded relative">
            <h2 className="text-xl font-serif text-zinc-400 mb-2 uppercase tracking-widest text-center">Answer the Call</h2>
            <p className="text-zinc-500 text-xs text-center mb-4">
              Enter the pact code to join an existing domain.
            </p>
            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full bg-black border border-zinc-700 text-zinc-300 px-4 py-3 rounded focus:outline-none focus:border-red-800 transition-colors font-mono text-center text-lg shadow-inner uppercase tracking-widest"
                  placeholder="ENTER CODE"
                  maxLength={6}
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 py-3 rounded uppercase tracking-[0.2em] font-serif transition-all duration-300 hover:text-white"
              >
                Join Lobby
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center text-[10px] space-y-2">
            <p className="text-zinc-700 italic border-t border-red-900/10 pt-4">
              "The void does not claim only property, but the souls who dwell within."
            </p>
          <button 
            onClick={onLogout}
            className="text-xs font-serif text-zinc-600 hover:text-red-500 transition-colors uppercase tracking-widest pt-2 block w-full"
          >
            Flee the nightmare (Logout)
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
