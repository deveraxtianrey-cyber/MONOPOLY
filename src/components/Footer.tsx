import React from 'react';

/**
 * Footer - Manifests the developer's mark as a permanent fixture of the ritual.
 */
export function Footer() {
  return (
    <footer className="w-full py-6 mt-8 border-t border-red-900/10 flex flex-col items-center gap-1.5 z-20">
      <p className="text-[10px] font-serif text-zinc-600 uppercase tracking-widest">
        Developed by <span className="text-zinc-400">Christian Rey M. De Vera</span>
      </p>
      <a 
        href="https://github.com/deveraxtianrey-cyber" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[9px] font-mono text-red-900/60 hover:text-red-500 transition-colors uppercase tracking-[0.3em] flex items-center gap-1.5 group"
      >
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">👁️</span>
        https://github.com/deveraxtianrey-cyber
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">👁️</span>
      </a>
    </footer>
  );
}
