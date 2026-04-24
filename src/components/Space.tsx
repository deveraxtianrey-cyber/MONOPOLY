import React from 'react';
import { BoardSpace } from '../data/boardData';
import { Player } from '../engine/GameEngine';
import { SoulIcon } from './SoulIcon';
import { RitualistSprite } from './RitualistSprite';
import { motion, AnimatePresence } from 'motion/react';

interface SpaceProps {
  key?: React.Key;
  space: BoardSpace;
  players: Player[];
  style: React.CSSProperties;
  position: 'top' | 'bottom' | 'left' | 'right' | 'corner';
  owner?: Player;
  houses?: number;
  isMortgaged?: boolean;
  isSparkling?: boolean;
  onClick?: () => void;
}

const colorMap: Record<string, string> = {
  brown: 'bg-[#5c4033]',
  lightblue: 'bg-[#87ceeb]',
  pink: 'bg-[#ff69b4]',
  orange: 'bg-[#ff8c00]',
  red: 'bg-[#8b0000]', // Darker red for horror theme
  yellow: 'bg-[#b8860b]', // Dark goldenrod
  green: 'bg-[#006400]', // Dark green
  darkblue: 'bg-[#00008b]',
};

export default function Space({ space, players, style, position, owner, houses = 0, isMortgaged, isSparkling, onClick }: SpaceProps) {
  const isCorner = position === 'corner';
  const isClickable = space.type === 'property' || space.type === 'railroad' || space.type === 'utility';
  
  let containerClass = 'flex-col';
  let colorBarClass = 'h-1/4 w-full';
  
  if (position === 'top') {
    containerClass = 'flex-col-reverse';
    colorBarClass = 'h-1/4 w-full';
  } else if (position === 'left') {
    containerClass = 'flex-row-reverse';
    colorBarClass = 'w-1/4 h-full';
  } else if (position === 'right') {
    containerClass = 'flex-row';
    colorBarClass = 'w-1/4 h-full';
  }

  return (
    <div 
      style={style} 
      onClick={isClickable ? onClick : undefined}
      className={`flex relative overflow-hidden ${isCorner ? 'p-2 flex-col' : containerClass} ${isClickable ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''} ${isSparkling ? 'animate-sparkle shadow-[inset_0_0_20px_rgba(234,179,8,0.5)]' : ''}`}
    >
      {isMortgaged && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-2 animate-in fade-in zoom-in duration-300">
          <div className="w-full bg-red-950/80 border-y-2 border-red-600/50 -rotate-[25deg] py-1 shadow-[0_0_15px_rgba(153,27,27,0.8)] backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-[7px] md:text-[9px] font-serif font-bold text-red-500 uppercase tracking-[0.4em] drop-shadow-sm select-none">MORTGAGED</span>
          </div>
        </div>
      )}
      {space.colorGroup && !isCorner && (
        <div className={`shrink-0 ${colorBarClass} bg-transparent relative flex items-center justify-center pointer-events-none`}>
          {/* Gravestones / Mausoleums */}
          {houses > 0 && (
            <div className={`absolute inset-0 flex items-center justify-center gap-[1px] ${position === 'left' || position === 'right' ? 'flex-col' : 'flex-row'}`}>
              {houses === 5 ? (
                <div 
                  className="relative flex items-center justify-center w-3.5 h-4.5 md:w-4 md:h-5" 
                  title="Mausoleum"
                >
                  {/* Building Body */}
                  <div className="absolute inset-x-0 bottom-0 h-3/4 bg-stone-800 border-2 border-black shadow-[0_2px_6px_rgba(0,0,0,0.8)] z-10" />
                  {/* Peaked Roof */}
                  <div 
                    className="absolute inset-x-0 top-0 h-1/3 bg-stone-900 border-x-2 border-t-2 border-black z-10" 
                    style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
                  />
                  {/* Glowing Entrance (Player Color) */}
                  <div className={`absolute bottom-0 w-1/3 h-1/5 ${owner?.color || 'bg-red-600'} opacity-70 z-20 blur-[1px] shadow-[0_0_8px_rgba(255,255,255,0.3)]`} />
                </div>
              ) : (
                Array.from({ length: houses }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-green-600 border border-black shadow-sm" title="Gravestone" />
                ))
              )}
            </div>
          )}
        </div>
      )}
      
      {isCorner ? (
        <div className="flex-1 flex flex-col w-full h-full relative z-10 p-1 bg-transparent">
          <div className="flex-1 flex flex-col items-center justify-center p-1 relative">
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 flex-wrap p-1 z-20">
              {/* For Jail, only show jailed players here. For other corners, show all players. */}
              {players.filter(p => space.id !== 10 || p.inJail).map(p => {
                let rotation = 0;
                if (space.id === 0) rotation = -45; // Go (Bottom-Right)
                else if (space.id === 10) rotation = 45; // Jail (Bottom-Left)
                else if (space.id === 20) rotation = 135; // Free Parking (Top-Left)
                else if (space.id === 30) rotation = -135; // Go To Jail (Top-Right)
                
                return (
                  <motion.div 
                    layoutId={`player-${p.id}`} 
                    transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.3 }} 
                    key={p.id} 
                    className="pointer-events-auto"
                    animate={{ rotate: rotation }}
                    title={p.name + (p.inJail ? " (In Jail)" : "")} 
                  >
                    <RitualistSprite 
                      characterId={p.characterId || 1} 
                      inJail={p.inJail} 
                      color={p.color} 
                      name={p.name} 
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
          {space.id === 10 && (
            <div className="h-1/3 w-full flex items-center justify-center relative bg-transparent mt-1">
              <div className="flex items-center justify-center gap-1 flex-wrap p-1 z-10">
                {players.filter(p => !p.inJail).map(p => {
                  let rotation = 45; // Points towards the center from the visiting area
                  return (
                    <motion.div 
                      layoutId={`player-${p.id}`} 
                      transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.3 }} 
                      key={p.id} 
                      className="pointer-events-auto"
                      animate={{ rotate: rotation }}
                      title={`${p.name} (Just Visiting)`} 
                    >
                      <RitualistSprite 
                        characterId={p.characterId || 1} 
                        inJail={false} 
                        color={p.color} 
                        name={p.name} 
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col items-center justify-center p-1 text-center min-w-0 min-h-0 pointer-events-none">
            {/* Text hidden to let background show through */}
          </div>

          {/* Players */}
          {players.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 flex-wrap pointer-events-none p-1">
              {players.map(p => {
                let rotation = 0;
                if (position === 'top') rotation = 180;
                else if (position === 'left') rotation = 90;
                else if (position === 'right') rotation = -90;
                
                return (
                  <motion.div 
                    layoutId={`player-${p.id}`}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      duration: 0.3 
                    }}
                    key={p.id} 
                    className="pointer-events-auto"
                    animate={{ rotate: rotation }}
                    title={p.name}
                  >
                    <RitualistSprite 
                      characterId={p.characterId || 1} 
                      inJail={p.inJail} 
                      color={p.color} 
                      name={p.name} 
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Ownership Highlight */}
      {owner && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className={`absolute inset-0 ${owner.color} opacity-25`} />
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${owner.color} opacity-90`} />
          <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${owner.color} opacity-90`} />
          <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${owner.color} opacity-90`} />
          <div className={`absolute top-0 bottom-0 right-0 w-1.5 ${owner.color} opacity-90`} />
        </div>
      )}
    </div>
  );
}
