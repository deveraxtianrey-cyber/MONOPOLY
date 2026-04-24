import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RitualistSpriteProps {
  characterId: number;
  inJail: boolean;
  isMoving?: boolean;
  color: string; // Tailwind bg color class
  name: string;
}

export function RitualistSprite({ characterId, inJail, isMoving, color, name }: RitualistSpriteProps) {
  const [frame, setFrame] = useState(1);

  useEffect(() => {
    // Both idle and jail have 2 frames switching every 1 second
    const interval = setInterval(() => {
      setFrame(f => (f === 1 ? 2 : 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  let spritePath = `/characters/char${characterId}_`;
  if (isMoving) {
    spritePath += 'move';
  } else if (inJail) {
    spritePath += `jail${frame}`;
  } else {
    spritePath += `idle${frame}`;
  }
  spritePath += '.png';

  return (
    <div className="relative flex items-center justify-center p-0.5">
      {/* Spectral Aura (Player Color) - Enhanced for better distinction */}
      <div className={`absolute inset-0 rounded-full blur-[3px] opacity-60 animate-pulse ${color}`} />
      
      {/* The Ritualist Manifestation */}
      <AnimatePresence mode="wait">
        <motion.img
          key={spritePath}
          src={spritePath}
          alt={name}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.8 }}
          transition={{ duration: 0.2 }}
          className="relative w-6 h-6 md:w-8 md:h-8 object-contain z-10 drop-shadow-[0_0_2px_rgba(0,0,0,0.9)]"
        />
      </AnimatePresence>

      {/* Under-shadow for depth - Adjusted for smaller sprite */}
      <div className="absolute bottom-0 w-3 h-1 bg-black/40 rounded-[100%] blur-[1px] -z-10" />
    </div>
  );
}
