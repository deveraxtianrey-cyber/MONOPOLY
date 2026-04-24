import React from 'react';
import { Player } from '../engine/GameEngine';
import { SoulIcon } from './SoulIcon';
import { RitualistSprite } from './RitualistSprite';

interface VictoryModalProps {
  winner: Player;
  onRestart: () => void;
}

export function VictoryModal({ winner, onRestart }: VictoryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl transition-all">
      {/* Victory GIF Manifestation (Full Screen) */}
      <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
        <img 
          src="/victory.gif" 
          alt="Victory Manifestation" 
          className="w-full h-full object-cover" 
        />
        {/* Darkening overlay for text legibility */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      <div className="bg-black/10 backdrop-blur-md w-full max-w-2xl rounded-lg border-2 border-red-900 shadow-2xl shadow-red-900/50 flex flex-col overflow-hidden relative p-8 items-center text-center z-10">
        <div className="z-10 flex flex-col items-center w-full">
          <h1 className="text-5xl md:text-7xl font-serif text-red-600 tracking-widest uppercase mb-6 animate-pulse">
            The Grand Ritual
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-300 font-serif mb-8">
            The Void has chosen its Master.
          </p>

          <div className="bg-black/60 border border-red-900/50 rounded-lg p-8 w-full max-w-md mb-8 backdrop-blur-sm relative group overflow-hidden">
            <div className="absolute inset-0 bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <RitualistSprite 
                characterId={winner.characterId} 
                inJail={false} 
                color={winner.color} 
                name={winner.name}
              />
              <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-2xl animate-pulse -z-10" />
            </div>
            <h2 className="text-4xl font-serif text-white mb-2 tracking-widest uppercase">{winner.name}</h2>
            <p className="text-red-400 font-mono text-xl flex items-center justify-center gap-2">
              Soul Fragments: <SoulIcon className="w-5 h-5" />{winner.balance}
            </p>
          </div>

          <p className="text-zinc-500 text-sm mb-8 italic">
            All other souls have been extinguished. Eternal damnation awaits them.
          </p>

          <button 
            onClick={onRestart}
            className="bg-red-900 hover:bg-red-800 text-white font-serif uppercase tracking-widest px-8 py-4 rounded transition-colors border border-red-700 hover:border-red-500 shadow-lg relative overflow-hidden group"
          >
            <span className="relative z-10">Begin Anew</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </div>
      </div>
    </div>
  );
}
