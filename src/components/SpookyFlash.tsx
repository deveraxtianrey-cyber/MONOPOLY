import React, { useEffect } from 'react';

export function SpookyFlash() {
  useEffect(() => {
    // Play the spooky transition sound
    const audio = new Audio('/spooky.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.warn("Ritual sound was silenced by the browser's will:", e));

    return () => {
      // Silence the manifestation when it finishes
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <img 
        src="/spooky.gif" 
        alt="Spooky Flash" 
        className="w-full h-full object-cover" 
      />
      {/* Optional glitch filter or vignette can be added here */}
      <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay animate-pulse pointer-events-none" />
    </div>
  );
}
