import React from 'react';
import { BoardSpace } from '../data/boardData';
import { PropertyState } from '../engine/GameEngine';
import { SoulIcon } from './SoulIcon';

interface PropertyCardProps {
  space: BoardSpace;
  propertyState?: PropertyState;
  ownsMonopoly?: boolean;
  canBuyHouse?: boolean;
  canSellHouse?: boolean;
  ownedRailroadsCount?: number;
  ownedUtilitiesCount?: number;
  ownerColor?: string;
  ownerName?: string;
  currentPlayerId?: string;
  onBuyHouse?: () => void;
  onSellHouse?: () => void;
  onMortgage?: () => void;
  onUnmortgage?: () => void;
  canMortgage?: boolean;
  canUnmortgage?: boolean;
  onClose: () => void;
}

const colorMap: Record<string, string> = {
  brown: 'bg-[#5c4033]',
  lightblue: 'bg-[#87ceeb]',
  pink: 'bg-[#ff69b4]',
  orange: 'bg-[#ff8c00]',
  red: 'bg-[#8b0000]',
  yellow: 'bg-[#b8860b]',
  green: 'bg-[#006400]',
  darkblue: 'bg-[#00008b]',
};

export default function PropertyCard({ 
  space, 
  propertyState, 
  ownsMonopoly,
  canBuyHouse,
  canSellHouse,
  ownedRailroadsCount = 0,
  ownedUtilitiesCount = 0,
  ownerColor,
  ownerName,
  currentPlayerId,
  onBuyHouse,
  onSellHouse,
  onMortgage,
  onUnmortgage,
  canMortgage,
  canUnmortgage,
  onClose 
}: PropertyCardProps) {
  if (space.type !== 'property' && space.type !== 'railroad' && space.type !== 'utility') {
    return null;
  }

  const houses = propertyState?.houses || 0;
  const highlightClass = ownerColor 
    ? `${ownerColor} text-white font-bold shadow-[0_0_10px_rgba(255,255,255,0.2)] border border-white/20` 
    : 'bg-red-100 text-zinc-950 font-bold border border-red-900/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-[300px] md:max-w-[340px] shadow-2xl shadow-red-900/50 flex flex-col relative rounded-xl"
        style={{ backgroundImage: 'url(/property-front-bg.png)', backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundColor: '#e5e5e5', minHeight: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-2 right-4 text-zinc-900 hover:text-red-900 font-black z-20 text-3xl drop-shadow-md"
        >
          &times;
        </button>

        {/* Inner container to clear the thorn borders */}
        <div className="flex flex-col flex-1 w-full h-full px-10 py-12 md:px-12 md:py-14 text-zinc-950 font-serif font-bold relative z-10">
          
          {space.type === 'property' && (
            <>
              <div className="mb-2">
                <div className={`${space.colorGroup ? colorMap[space.colorGroup] : 'bg-zinc-800'} border-2 border-black p-2 md:p-3 text-center text-white shadow-md`}>
                  <h3 className="font-serif text-[9px] md:text-[10px] uppercase tracking-widest opacity-80 mb-0.5">Title Deed</h3>
                  <h2 className="font-serif text-lg md:text-xl uppercase font-black leading-none drop-shadow-md">{space.name}</h2>
                </div>
              </div>

              <div className="text-zinc-950 font-serif text-[11px] md:text-xs flex flex-col gap-1">
                <div className={`text-center mb-1 px-1 py-0.5 rounded ${houses === 0 && !ownsMonopoly ? highlightClass : ''}`}>
                  Rent <SoulIcon className="inline w-2.5 h-2.5" />{space.rent?.[0]}
                </div>
                <div className={`flex justify-between px-1 py-0.5 rounded ${houses === 0 && ownsMonopoly ? highlightClass : ''}`}>
                  <span>Rent with color set</span>
                  <span className="flex items-center gap-0.5"><SoulIcon className="w-2.5 h-2.5" />{(space.rent?.[0] || 0) * 2}</span>
                </div>
                <div className={`flex justify-between px-1 py-0.5 rounded ${houses === 1 ? highlightClass : ''}`}>
                  <span>Rent with 1 Gravestone</span>
                  <span className="flex items-center gap-0.5"><SoulIcon className="w-2.5 h-2.5" />{space.rent?.[1]}</span>
                </div>
                <div className={`flex justify-between px-1 py-0.5 rounded ${houses === 2 ? highlightClass : ''}`}>
                  <span>Rent with 2 Gravestones</span>
                  <span className="flex items-center gap-0.5"><SoulIcon className="w-2.5 h-2.5" />{space.rent?.[2]}</span>
                </div>
                <div className={`flex justify-between px-1 py-0.5 rounded ${houses === 3 ? highlightClass : ''}`}>
                  <span>Rent with 3 Gravestones</span>
                  <span className="flex items-center gap-0.5"><SoulIcon className="w-2.5 h-2.5" />{space.rent?.[3]}</span>
                </div>
                <div className={`flex justify-between px-1 py-0.5 rounded ${houses === 4 ? highlightClass : ''}`}>
                  <span>Rent with 4 Gravestones</span>
                  <span className="flex items-center gap-0.5"><SoulIcon className="w-2.5 h-2.5" />{space.rent?.[4]}</span>
                </div>
                <div className={`text-center mt-1 mb-1 px-1 py-0.5 rounded ${houses === 5 ? highlightClass : ''}`}>
                  Rent with MAUSOLEUM <SoulIcon className="inline w-2.5 h-2.5" />{space.rent?.[5]}
                </div>
                
                <div className="border-t border-zinc-900/50 my-1" />
                
                <div className="flex justify-between text-[10px] md:text-[11px]">
                  <span>Mortgage Value</span>
                  <span className="flex items-center gap-0.5"><SoulIcon className="w-2 h-2" />{(space.price || 0) / 2}</span>
                </div>
                <div className="flex justify-between text-[10px] md:text-[11px]">
                  <span>Gravestones cost</span>
                  <span className="flex items-center gap-0.5"><SoulIcon className="w-2 h-2" />{space.houseCost} each</span>
                </div>
                <div className="flex justify-between text-[10px] md:text-[11px]">
                  <span>Mausoleums, plus 4 gravestones</span>
                  <span className="flex items-center gap-0.5"><SoulIcon className="w-2 h-2" />{space.houseCost}</span>
                </div>
              </div>
            </>
          )}

          {space.type === 'railroad' && (
            <div className="text-zinc-950 font-serif text-xs md:text-sm flex flex-col gap-2 mt-4">
              <div className="text-center mb-4">
                <div className="text-5xl mb-2 drop-shadow-md">🚂</div>
                <h2 className="font-serif text-xl uppercase font-black leading-tight drop-shadow-sm">{space.name}</h2>
              </div>
              
              <div className={`flex justify-between px-1 py-0.5 rounded ${ownedRailroadsCount === 1 ? highlightClass : ''}`}>
                <span>Rent</span>
                <span className="flex items-center gap-0.5"><SoulIcon className="w-3 h-3" />25</span>
              </div>
              <div className={`flex justify-between px-1 py-0.5 rounded ${ownedRailroadsCount === 2 ? highlightClass : ''}`}>
                <span>If 2 Railroads are owned</span>
                <span className="flex items-center gap-0.5"><SoulIcon className="w-3 h-3" />50</span>
              </div>
              <div className={`flex justify-between px-1 py-0.5 rounded ${ownedRailroadsCount === 3 ? highlightClass : ''}`}>
                <span>If 3 Railroads are owned</span>
                <span className="flex items-center gap-0.5"><SoulIcon className="w-3 h-3" />100</span>
              </div>
              <div className={`flex justify-between px-1 py-0.5 rounded ${ownedRailroadsCount === 4 ? highlightClass : ''}`}>
                <span>If 4 Railroads are owned</span>
                <span className="flex items-center gap-0.5"><SoulIcon className="w-3 h-3" />200</span>
              </div>
              
              <div className="border-t border-zinc-900/50 my-2" />
              
              <div className="flex justify-between text-[10px] md:text-[11px]">
                <span>Mortgage Value</span>
                <span className="flex items-center gap-0.5"><SoulIcon className="w-2 h-2" />100</span>
              </div>
            </div>
          )}

          {space.type === 'utility' && (
            <div className="text-zinc-950 font-serif text-xs md:text-sm flex flex-col gap-2 mt-4">
              <div className="text-center mb-4">
                <div className="text-5xl mb-2 drop-shadow-md">{space.id === 12 ? '⚡' : '💧'}</div>
                <h2 className="font-serif text-xl uppercase font-black leading-tight drop-shadow-sm">{space.name}</h2>
              </div>
              
              <p className={`text-[11px] md:text-xs text-center mb-2 px-1 py-1 rounded leading-relaxed ${ownedUtilitiesCount === 1 ? highlightClass : ''}`}>
                If one "Utility" is owned rent is 4 times amount shown on dice.
              </p>
              <p className={`text-[11px] md:text-xs text-center mb-2 px-1 py-1 rounded leading-relaxed ${ownedUtilitiesCount === 2 ? highlightClass : ''}`}>
                If both "Utilities" are owned rent is 10 times amount shown on dice.
              </p>
              
              <div className="border-t border-zinc-900/50 my-2" />
              
              <div className="flex justify-between text-[10px] md:text-[11px]">
                <span>Mortgage Value</span>
                <span className="flex items-center gap-0.5"><SoulIcon className="w-2 h-2" />75</span>
              </div>
            </div>
          )}

          {/* Status Footer */}
          {propertyState && (
            <div className="flex flex-col gap-2 border-t-2 border-zinc-900/50 pt-2 mt-auto">
              <div className="text-center text-[10px] md:text-xs font-black">
                {propertyState.ownerId ? (
                  <span className="font-bold text-red-900 uppercase">
                    Owned by {ownerName || 'Unknown Player'}
                    {propertyState.isMortgaged && " (MORTGAGED)"}
                  </span>
                ) : (
                  <span className="text-zinc-900 font-bold uppercase flex items-center justify-center gap-1 drop-shadow-sm">Unowned - Price: <SoulIcon className="w-3 h-3" />{space.price}</span>
                )}
              </div>
              
              {propertyState.ownerId === currentPlayerId && (
                <div className="flex flex-col gap-1.5 mt-1">
                  {space.type === 'property' && (
                    <div className="flex gap-1.5">
                      <button 
                        onClick={onBuyHouse}
                        disabled={!canBuyHouse}
                        className={`flex-1 py-1 text-[9px] md:text-[10px] font-black uppercase rounded border border-black shadow shadow-black/30 ${canBuyHouse ? 'bg-green-900 hover:bg-green-800 text-white' : 'bg-green-950/40 text-green-900/50 cursor-not-allowed'}`}
                      >
                        Buy {houses === 4 ? 'Mausoleum' : 'Gravestone'}
                      </button>
                      <button 
                        onClick={onSellHouse}
                        disabled={!canSellHouse}
                        className={`flex-1 py-1 text-[9px] md:text-[10px] font-black uppercase rounded border border-black shadow shadow-black/30 ${canSellHouse ? 'bg-red-900 hover:bg-red-800 text-white' : 'bg-red-950/40 text-red-900/50 cursor-not-allowed'}`}
                      >
                        Sell {houses === 5 ? 'Mausoleum' : 'Gravestone'}
                      </button>
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    {!propertyState.isMortgaged ? (
                      <button 
                        onClick={onMortgage}
                        disabled={!canMortgage}
                        className={`flex-1 py-1 text-[9px] md:text-[10px] font-black uppercase rounded border border-black flex items-center justify-center gap-1 shadow shadow-black/30 ${canMortgage ? 'bg-yellow-900 hover:bg-yellow-800 text-white' : 'bg-yellow-950/40 text-yellow-900/50 cursor-not-allowed'}`}
                      >
                        Mortgage (<SoulIcon className="w-2.5 h-2.5" />{Math.floor((space.price || 0) / 2)})
                      </button>
                    ) : (
                      <button 
                        onClick={onUnmortgage}
                        disabled={!canUnmortgage}
                        className={`flex-1 py-1 text-[9px] md:text-[10px] font-black uppercase rounded border border-black flex items-center justify-center gap-1 shadow shadow-black/30 ${canUnmortgage ? 'bg-blue-900 hover:bg-blue-800 text-white' : 'bg-blue-950/40 text-blue-900/50 cursor-not-allowed'}`}
                      >
                        Unmortgage (<SoulIcon className="w-2.5 h-2.5" />{Math.ceil((space.price || 0) / 2 * 1.1)})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
