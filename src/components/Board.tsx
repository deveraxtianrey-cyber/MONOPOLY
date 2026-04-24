import React from 'react';
import { boardData, BoardSpace } from '../data/boardData';
import Space from './Space';
import { Player, PropertyState } from '../engine/GameEngine';
import Dice from './Dice';
import { SoulIcon } from './SoulIcon';

interface BoardProps {
  players: Player[];
  diceValues: [number, number];
  isRolling: boolean;
  logs: string[];
  turnPhase: string;
  currentPlayer: Player;
  isMyTurn: boolean;
  pendingProperty: BoardSpace | null;
  properties: Record<number, PropertyState>;
  onRoll: () => void;
  onPayJailFine: () => void;
  onUseGetOutOfJailFreeCard: () => void;
  onBuyProperty: () => void;
  onSkipBuyProperty: () => void;
  onEndTurn: () => void;
  onSpaceClick: (spaceId: number) => void;
  onPayDebt?: () => void;
  onDeclareBankruptcy?: () => void;
  debtAmount?: number;
  bankruptAnimations?: { id: string, playerName: string, position: number }[];
  tradedPropertyIds?: number[];
  timeLeftFormatted?: string;
  isTimerCritical?: boolean;
}

export default function Board({ 
  players, 
  diceValues, 
  isRolling, 
  logs,
  turnPhase,
  currentPlayer,
  isMyTurn,
  pendingProperty,
  properties,
  bankruptAnimations,
  onRoll,
  onPayJailFine,
  onUseGetOutOfJailFreeCard,
  onBuyProperty,
  onSkipBuyProperty,
  onEndTurn,
  onSpaceClick,
  onPayDebt,
  onDeclareBankruptcy,
  debtAmount,
  tradedPropertyIds = [],
  timeLeftFormatted,
  isTimerCritical
}: BoardProps) {
  return (
    <div 
      className="w-full max-w-4xl aspect-square bg-zinc-950 border-4 border-zinc-800 grid gap-[1px] p-[1px] mx-auto shadow-2xl shadow-red-900/20 bg-center"
      style={{ backgroundImage: 'url(/board-bg.png)', backgroundSize: '100% 100%', gridTemplateColumns: '1.6fr repeat(9, 1fr) 1.6fr', gridTemplateRows: '1.6fr repeat(9, 1fr) 1.6fr' }}
    >
      {/* Center Area */}
      <div className="col-start-2 col-end-11 row-start-2 row-end-11 flex flex-col items-center justify-center relative overflow-hidden pointer-events-none">
        
        {/* Card Stacks */}
        <div className="absolute bottom-4 md:bottom-8 w-full flex justify-center gap-24 md:gap-64 pointer-events-none">
          <div className="pointer-events-auto group">
            <div className="transition-transform duration-500 ease-out group-hover:-translate-y-4 group-hover:scale-105">
              <div className="group-hover:animate-float-swerve">
                <div 
                  className="w-20 h-32 md:w-28 md:h-44 bg-zinc-950 border-2 border-yellow-900/50 rounded-md shadow-[0_0_15px_rgba(161,98,7,0.3)] rotate-[12deg] transition-colors duration-500 group-hover:border-yellow-600 group-hover:shadow-[0_10px_25px_rgba(161,98,7,0.5)] relative overflow-hidden bg-cover bg-center"
                  style={{ backgroundImage: 'url(/torment-bg.png)' }}
                >
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-auto group">
            <div className="transition-transform duration-500 ease-out group-hover:-translate-y-4 group-hover:scale-105">
              <div className="group-hover:animate-float-swerve">
                <div 
                  className="w-20 h-32 md:w-28 md:h-44 bg-zinc-950 border-2 border-purple-900/50 rounded-md shadow-[0_0_15px_rgba(88,28,135,0.3)] rotate-[-12deg] transition-colors duration-500 group-hover:border-purple-500 group-hover:shadow-[0_10px_25px_rgba(88,28,135,0.5)] relative overflow-hidden bg-cover bg-center"
                  style={{ backgroundImage: 'url(/omen-bg.png)' }}
                >
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 md:gap-3 z-10 pointer-events-none">
          {/* Dice Container */}
          <div className="flex gap-4 pointer-events-auto">
            <Dice value={diceValues[0]} rolling={isRolling} />
            <Dice value={diceValues[1]} rolling={isRolling} />
          </div>

          {/* Controls */}
          <div className="w-3/4 max-w-sm bg-zinc-950/90 backdrop-blur-sm border border-red-900/30 p-3 md:p-4 rounded-lg shadow-xl pointer-events-auto flex flex-col gap-2">
            {!isMyTurn ? (
              <div className="py-2 md:py-4 flex flex-col items-center justify-center">
                {timeLeftFormatted && (
                  <div className={`text-[10px] md:text-xs font-mono mb-2 px-3 py-0.5 rounded-full border ${isTimerCritical ? 'text-red-500 border-red-900 animate-pulse bg-red-950/20' : 'text-zinc-500 border-zinc-800 bg-black/40'}`}>
                    ⏳ {timeLeftFormatted}
                  </div>
                )}
                <h2 className="text-sm md:text-base font-serif text-red-600 text-center mb-1 animate-pulse">
                  Waiting for {currentPlayer.name}'s Turn
                </h2>
                <div className="w-12 h-1 bg-red-950 rounded-full overflow-hidden mt-2">
                   <div className="w-full h-full bg-red-600 animate-loading-bar origin-left"></div>
                </div>
              </div>
            ) : (
              <>
                {timeLeftFormatted && (
                  <div className={`text-[10px] md:text-xs font-mono mb-2 px-3 py-0.5 rounded-full border self-center ${isTimerCritical ? 'text-red-500 border-red-900 animate-pulse bg-red-950/20' : 'text-zinc-500 border-zinc-800 bg-black/40'}`}>
                    ⏳ {timeLeftFormatted}
                  </div>
                )}
                <h2 className="text-sm md:text-base font-serif text-red-600 text-center mb-1">
                  {currentPlayer.name}'s Turn
                </h2>
                
                {turnPhase === 'ROLL' && (
                  <button 
                    onClick={onRoll}
                    disabled={isRolling}
                    className={`w-full py-1.5 md:py-2 text-xs md:text-sm ${isRolling ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-red-900 hover:bg-red-800 text-white cursor-pointer'} font-serif uppercase tracking-wider rounded transition-colors`}
                  >
                    {isRolling ? 'Rolling...' : 'Roll Dice'}
                  </button>
                )}

                {turnPhase === 'JAIL_DECISION' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={onRoll}
                        disabled={isRolling}
                        className={`flex-1 py-1.5 md:py-2 text-xs md:text-sm ${isRolling ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer'} font-serif uppercase tracking-wider rounded transition-colors`}
                      >
                        Roll Doubles
                      </button>
                      <button 
                        onClick={onPayJailFine}
                        disabled={isRolling || currentPlayer.balance < 50}
                        className={`flex-1 py-1.5 md:py-2 text-xs md:text-sm ${isRolling || currentPlayer.balance < 50 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-red-900 hover:bg-red-800 text-white cursor-pointer'} font-serif uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1`}
                      >
                        Pay <SoulIcon className="w-4 h-4" />50
                      </button>
                    </div>
                    {currentPlayer.getOutOfJailFreeCards && currentPlayer.getOutOfJailFreeCards.length > 0 ? (
                      <button 
                        onClick={onUseGetOutOfJailFreeCard}
                        disabled={isRolling}
                        className={`w-full py-1.5 md:py-2 text-xs md:text-sm ${isRolling ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-yellow-900 hover:bg-yellow-800 text-white cursor-pointer'} font-serif uppercase tracking-wider rounded transition-colors`}
                      >
                        Use Get Out of Jail Free Card ({currentPlayer.getOutOfJailFreeCards.length})
                      </button>
                    ) : null}
                  </div>
                )}

                {turnPhase === 'BUY_DECISION' && pendingProperty && (
                  <>
                    <p className="text-xs md:text-sm text-zinc-300 text-center mb-1 flex items-center justify-center gap-1">
                      Buy <span className="text-white font-bold">{pendingProperty.name}</span> for <span className="text-red-400 font-mono flex items-center gap-0.5"><SoulIcon className="w-3 h-3" />{pendingProperty.price}</span>?
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={onBuyProperty}
                        disabled={currentPlayer.balance < (pendingProperty.price || 0)}
                        className={`flex-1 py-1.5 md:py-2 text-xs md:text-sm ${currentPlayer.balance < (pendingProperty.price || 0) ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-green-900 hover:bg-green-800 text-white cursor-pointer'} font-serif uppercase tracking-wider rounded transition-colors`}
                      >
                        Buy
                      </button>
                      <button 
                        onClick={onSkipBuyProperty}
                        className="flex-1 py-1.5 md:py-2 text-xs md:text-sm bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer font-serif uppercase tracking-wider rounded transition-colors"
                      >
                        Skip
                      </button>
                    </div>
                  </>
                )}

                {turnPhase === 'END_TURN' && (
                  <button 
                    onClick={onEndTurn}
                    className="w-full py-1.5 md:py-2 text-xs md:text-sm bg-red-900 hover:bg-red-800 text-white cursor-pointer font-serif uppercase tracking-wider rounded transition-colors"
                  >
                    End Turn
                  </button>
                )}

                {turnPhase === 'DESPERATION' && (
                  <>
                    <p className="text-xs md:text-sm text-red-400 text-center mb-1 font-bold animate-pulse">
                      Desperation Phase!
                    </p>
                    <p className="text-xs text-zinc-300 text-center mb-2 flex items-center justify-center gap-1">
                      You owe <span className="text-white font-mono flex items-center gap-0.5"><SoulIcon className="w-3 h-3" />{debtAmount}</span>. Sell barricades or desecrate lands to raise funds.
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={onPayDebt}
                        disabled={currentPlayer.balance < (debtAmount || 0)}
                        className={`flex-1 py-1.5 md:py-2 text-xs md:text-sm ${currentPlayer.balance < (debtAmount || 0) ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-green-900 hover:bg-green-800 text-white cursor-pointer'} font-serif uppercase tracking-wider rounded transition-colors`}
                      >
                        Pay Debt
                      </button>
                      <button 
                        onClick={onDeclareBankruptcy}
                        className="flex-1 py-1.5 md:py-2 text-xs md:text-sm bg-red-950 hover:bg-red-900 text-white cursor-pointer font-serif uppercase tracking-wider rounded transition-colors border border-red-800"
                      >
                        Give Up Soul
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Activity Log */}
          <div className="w-4/5 max-w-md bg-transparent rounded-lg p-2 md:p-3 h-20 md:h-28 overflow-y-auto overflow-x-hidden flex flex-col pointer-events-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="font-mono text-[0.55rem] md:text-xs text-zinc-400 space-y-1 text-center flex flex-col w-full">
              {[...logs].reverse().map((log, i) => (
                <div key={i} className={`break-words whitespace-normal w-full ${i === 0 ? "text-zinc-200" : "opacity-70"}`}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bankrupt Animations */}
      {bankruptAnimations?.map(anim => {
        let colStart = 0;
        let rowStart = 0;
        const spaceId = anim.position;

        if (spaceId === 0) { colStart = 11; rowStart = 11; }
        else if (spaceId >= 1 && spaceId <= 9) { colStart = 11 - spaceId; rowStart = 11; }
        else if (spaceId === 10) { colStart = 1; rowStart = 11; }
        else if (spaceId >= 11 && spaceId <= 19) { colStart = 1; rowStart = 11 - (spaceId - 10); }
        else if (spaceId === 20) { colStart = 1; rowStart = 1; }
        else if (spaceId >= 21 && spaceId <= 29) { colStart = spaceId - 19; rowStart = 1; }
        else if (spaceId === 30) { colStart = 11; rowStart = 1; }
        else if (spaceId >= 31 && spaceId <= 39) { colStart = 11; rowStart = spaceId - 29; }

        return (
          <div 
            key={anim.id}
            className="z-50 pointer-events-none flex items-center justify-center relative"
            style={{ gridColumnStart: colStart, gridRowStart: rowStart }}
          >
            <div className="absolute w-16 h-16 bg-red-600 rounded-full opacity-75 animate-ping"></div>
            <div className="absolute bg-black border-2 border-red-600 text-red-500 font-serif font-bold text-xs md:text-sm px-2 py-1 rounded shadow-[0_0_15px_rgba(220,38,38,0.8)] animate-bounce whitespace-nowrap">
              BANKRUPT!
              <div className="text-[8px] md:text-[10px] text-zinc-400 text-center">{anim.playerName}</div>
            </div>
          </div>
        );
      })}

      {/* Spaces */}
      {boardData.map((space) => {
        let colStart = 0;
        let rowStart = 0;

        if (space.id === 0) { colStart = 11; rowStart = 11; }
        else if (space.id >= 1 && space.id <= 9) { colStart = 11 - space.id; rowStart = 11; }
        else if (space.id === 10) { colStart = 1; rowStart = 11; }
        else if (space.id >= 11 && space.id <= 19) { colStart = 1; rowStart = 11 - (space.id - 10); }
        else if (space.id === 20) { colStart = 1; rowStart = 1; }
        else if (space.id >= 21 && space.id <= 29) { colStart = space.id - 19; rowStart = 1; }
        else if (space.id === 30) { colStart = 11; rowStart = 1; }
        else if (space.id >= 31 && space.id <= 39) { colStart = 11; rowStart = space.id - 29; }

        const spacePlayers = players.filter(p => p.position === space.id);
        const propertyState = properties[space.id];
        const owner = propertyState?.ownerId ? players.find(p => p.id === propertyState.ownerId) : undefined;

        return (
          <Space 
            key={space.id} 
            space={space} 
            players={spacePlayers}
            owner={owner}
            houses={propertyState?.houses || 0}
            isMortgaged={propertyState?.isMortgaged || false}
            isSparkling={tradedPropertyIds.includes(space.id)}
            onClick={() => onSpaceClick(space.id)}
            style={{ gridColumnStart: colStart, gridRowStart: rowStart }} 
            position={
              space.id > 0 && space.id < 10 ? 'bottom' :
              space.id > 10 && space.id < 20 ? 'left' :
              space.id > 20 && space.id < 30 ? 'top' :
              space.id > 30 && space.id < 40 ? 'right' : 'corner'
            }
          />
        );
      })}
    </div>
  );
}
