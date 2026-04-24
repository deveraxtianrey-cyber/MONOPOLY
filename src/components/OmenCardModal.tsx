import React, { useState, useEffect } from 'react';
import { OmenCard } from '../data/omenCards';
import { motion } from 'motion/react';

interface OmenCardModalProps {
  card: OmenCard;
  onAcknowledge: () => void;
  isMyTurn: boolean;
}

export const OmenCardModal: React.FC<OmenCardModalProps> = ({ card, onAcknowledge, isMyTurn }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" style={{ perspective: '1000px' }}>
      <motion.div 
        initial={{ scale: 0.5, y: 300, rotateY: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          y: 0, 
          rotateY: isFlipped ? 180 : 0,
          opacity: 1
        }}
        transition={{ 
          duration: 0.8, 
          type: "spring", 
          stiffness: 100, 
          damping: 20 
        }}
        className="relative w-full max-w-sm aspect-[2/3]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Back of the card */}
        <div 
          className="absolute inset-0 rounded-xl shadow-2xl overflow-hidden bg-cover bg-center border-2 border-zinc-900"
          style={{ backfaceVisibility: 'hidden', backgroundImage: 'url(/omen-bg.png)' }}
        >
        </div>

        {/* Front of the card */}
        <div 
          className="absolute inset-0 shadow-[0_0_30px_rgba(168,85,247,0.4)] flex flex-col"
          style={{ transform: "rotateY(180deg)", backfaceVisibility: 'hidden', backgroundImage: 'url(/omen-front-bg.png)', backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundColor: '#09090b', borderRadius: '14px' }}
        >
          {/* Subtle blood splatter overlays over the frame text area, maybe we can keep it for texture */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/blood-splatter.png')] opacity-20 mix-blend-overlay pointer-events-none rounded-[14px]"></div>
          
          <div className="relative z-10 w-full h-full flex flex-col px-12 py-16 md:px-14 md:py-20">
            <div className="flex-shrink-0 text-center flex flex-col items-center">
              <h2 className="font-serif text-2xl md:text-3xl text-purple-500 mb-1 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">Omen</h2>
              <h3 className="font-sans text-base md:text-lg text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight">{card.title}</h3>
            </div>
            
            <div className="flex-1 flex flex-col justify-center items-center py-2">
              <p className="text-zinc-200 text-center text-sm md:text-base leading-snug font-serif italic drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                "{card.description}"
              </p>
            </div>
            
            <div className="flex-shrink-0 mt-auto">
              <button
                onClick={onAcknowledge}
                disabled={!isMyTurn}
                className={`w-full py-2.5 md:py-3 text-sm md:text-base border rounded-lg font-mono uppercase tracking-wider transition-all backdrop-blur-sm ${
                  isMyTurn 
                    ? 'bg-purple-950/80 hover:bg-purple-900/90 text-purple-200 border-purple-900/50 shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.8)]' 
                    : 'bg-zinc-900/50 text-zinc-600 border-zinc-800 cursor-not-allowed opacity-70'
                }`}
              >
                {isMyTurn ? 'Accept Fate' : 'Witnessing Fate...'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
