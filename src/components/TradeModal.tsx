import React, { useState } from 'react';
import { Player, PropertyState, TradeOffer } from '../engine/GameEngine';
import { boardData } from '../data/boardData';
import { SoulIcon } from './SoulIcon';

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

interface TradeModalProps {
  currentPlayer: Player;
  players: Player[];
  properties: Record<number, PropertyState>;
  initialTrade?: TradeOffer;
  onClose: () => void;
  onSubmitTrade: (tradeOffer: any) => void;
}

export default function TradeModal({ currentPlayer, players, properties, initialTrade, onClose, onSubmitTrade }: TradeModalProps) {
  const [targetPlayerId, setTargetPlayerId] = useState<string | null>(initialTrade ? initialTrade.initiatorId : null);

  // Trade offer state
  const [offerMoney, setOfferMoney] = useState<number>(initialTrade ? (initialTrade.requestMoney || 0) : 0);
  const [requestMoney, setRequestMoney] = useState<number>(initialTrade ? (initialTrade.offerMoney || 0) : 0);
  const [offerProperties, setOfferProperties] = useState<number[]>(initialTrade ? (initialTrade.requestProperties || []) : []);
  const [requestProperties, setRequestProperties] = useState<number[]>(initialTrade ? (initialTrade.offerProperties || []) : []);
  const [offerCards, setOfferCards] = useState<string[]>(initialTrade?.requestCards || []);
  const [requestCards, setRequestCards] = useState<string[]>(initialTrade?.offerCards || []);

  const otherPlayers = players.filter(p => p.id !== currentPlayer.id);
  const targetPlayer = players.find(p => p.id === targetPlayerId);

  // Get properties owned by players
  const currentPlayerProperties = Object.entries(properties)
    .filter(([_, state]) => state.ownerId === currentPlayer.id)
    .map(([id, _]) => boardData[parseInt(id)]);

  const targetPlayerProperties = targetPlayerId 
    ? Object.entries(properties)
        .filter(([_, state]) => state.ownerId === targetPlayerId)
        .map(([id, _]) => boardData[parseInt(id)])
    : [];

  const toggleOfferProperty = (id: number) => {
    setOfferProperties(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleOfferCard = (id: string, isSelected: boolean) => {
    if (isSelected) {
      const index = offerCards.indexOf(id);
      if (index > -1) {
        const newOfferCards = [...offerCards];
        newOfferCards.splice(index, 1);
        setOfferCards(newOfferCards);
      }
    } else {
      setOfferCards([...offerCards, id]);
    }
  };

  const toggleRequestProperty = (id: number) => {
    setRequestProperties(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleRequestCard = (id: string, isSelected: boolean) => {
    if (isSelected) {
      const index = requestCards.indexOf(id);
      if (index > -1) {
        const newRequestCards = [...requestCards];
        newRequestCards.splice(index, 1);
        setRequestCards(newRequestCards);
      }
    } else {
      setRequestCards([...requestCards, id]);
    }
  };

  const handleCreateTrade = () => {
    onSubmitTrade({
      targetPlayerId,
      offerMoney,
      requestMoney,
      offerProperties,
      requestProperties,
      offerCards,
      requestCards
    });
  };

  if (!targetPlayerId) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-md w-full p-6 shadow-2xl">
          <h2 className="text-2xl font-serif text-red-500 mb-4 text-center">Select Player to Trade With</h2>
          <div className="flex flex-col gap-3">
            {otherPlayers.map(p => (
              <button
                key={p.id}
                onClick={() => setTargetPlayerId(p.id)}
                className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded text-left flex items-center gap-3 transition-colors"
              >
                <div className={`w-4 h-4 rounded-full ${p.color}`} />
                <span className="text-zinc-200 font-serif text-lg">{p.name}</span>
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="mt-6 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-serif uppercase tracking-wider"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-4xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <h2 className="text-2xl font-serif text-red-500 mb-6 text-center">{initialTrade ? 'Negotiate Trade' : 'Propose Trade'}</h2>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto min-h-0">
          {/* Current Player Side */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-zinc-700 pb-2">
              <div className={`w-4 h-4 rounded-full ${currentPlayer.color}`} />
              <h3 className="text-xl font-serif text-zinc-200">{currentPlayer.name} (You)</h3>
            </div>
            
            <div className="bg-zinc-950 p-4 rounded border border-zinc-800">
              <label className="text-sm text-zinc-400 mb-2 uppercase tracking-wider font-serif flex items-center gap-1">Souls to Offer (Max: <SoulIcon className="w-3 h-3" />{currentPlayer.balance})</label>
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-mono text-xl"><SoulIcon className="w-5 h-5" /></span>
                <input 
                  type="number" 
                  min="0" 
                  max={currentPlayer.balance}
                  value={offerMoney}
                  onChange={(e) => setOfferMoney(Math.min(currentPlayer.balance, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white font-mono w-full focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex-1 bg-zinc-950 p-4 rounded border border-zinc-800 overflow-y-auto">
              <label className="block text-sm text-zinc-400 mb-3 uppercase tracking-wider font-serif">Properties & Items to Offer</label>
              {currentPlayerProperties.length === 0 && (!currentPlayer.getOutOfJailFreeCards || currentPlayer.getOutOfJailFreeCards.length === 0) ? (
                <p className="text-zinc-500 italic text-sm">No properties or items owned.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {currentPlayerProperties.map(prop => {
                    const hasHouses = properties[prop.id].houses > 0;
                    return (
                      <button
                        key={prop.id}
                        onClick={() => !hasHouses && toggleOfferProperty(prop.id)}
                        disabled={hasHouses}
                        className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
                          offerProperties.includes(prop.id) 
                            ? 'bg-red-900/40 border-red-500/50 text-white' 
                            : hasHouses
                              ? 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                        }`}
                        title={hasHouses ? "Properties with gravestones/mausoleums cannot be traded." : ""}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {prop.colorGroup && <div className={`w-2 h-2 rounded-full ${colorMap[prop.colorGroup] || 'bg-zinc-600'}`} />}
                            <span>{prop.name}</span>
                          </div>
                          {hasHouses && <span className="text-[10px] uppercase font-bold text-red-900/40 tracking-tighter">Upgraded</span>}
                        </div>
                      </button>
                    );
                  })}
                  {currentPlayer.getOutOfJailFreeCards?.map((cardId, i) => {
                    const countInOffer = offerCards.filter(c => c === cardId).length;
                    const indexOfType = currentPlayer.getOutOfJailFreeCards!.slice(0, i).filter(c => c === cardId).length;
                    const isSelected = indexOfType < countInOffer;
                    return (
                      <button
                        key={`${cardId}-${i}`}
                        onClick={() => toggleOfferCard(cardId, isSelected)}
                        className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
                          isSelected 
                            ? 'bg-red-900/40 border-red-500/50 text-white' 
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        🎟️ Get Out of Jail Free Card
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Target Player Side */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-zinc-700 pb-2">
              <div className={`w-4 h-4 rounded-full ${targetPlayer?.color}`} />
              <h3 className="text-xl font-serif text-zinc-200">{targetPlayer?.name}</h3>
            </div>
            
            <div className="bg-zinc-950 p-4 rounded border border-zinc-800">
              <label className="text-sm text-zinc-400 mb-2 uppercase tracking-wider font-serif flex items-center gap-1">Souls to Request (Max: <SoulIcon className="w-3 h-3" />{targetPlayer?.balance})</label>
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-mono text-xl"><SoulIcon className="w-5 h-5" /></span>
                <input 
                  type="number" 
                  min="0" 
                  max={targetPlayer?.balance || 0}
                  value={requestMoney}
                  onChange={(e) => setRequestMoney(Math.min(targetPlayer?.balance || 0, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white font-mono w-full focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex-1 bg-zinc-950 p-4 rounded border border-zinc-800 overflow-y-auto">
              <label className="block text-sm text-zinc-400 mb-3 uppercase tracking-wider font-serif">Properties & Items to Request</label>
              {targetPlayerProperties.length === 0 && (!targetPlayer?.getOutOfJailFreeCards || targetPlayer.getOutOfJailFreeCards.length === 0) ? (
                <p className="text-zinc-500 italic text-sm">No properties or items owned.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {targetPlayerProperties.map(prop => {
                    const hasHouses = properties[prop.id].houses > 0;
                    return (
                      <button
                        key={prop.id}
                        onClick={() => !hasHouses && toggleRequestProperty(prop.id)}
                        disabled={hasHouses}
                        className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
                          requestProperties.includes(prop.id) 
                            ? 'bg-red-900/40 border-red-500/50 text-white' 
                            : hasHouses
                              ? 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                        }`}
                        title={hasHouses ? "Properties with gravestones/mausoleums cannot be traded." : ""}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {prop.colorGroup && <div className={`w-2 h-2 rounded-full ${colorMap[prop.colorGroup] || 'bg-zinc-600'}`} />}
                            <span>{prop.name}</span>
                          </div>
                          {hasHouses && <span className="text-[10px] uppercase font-bold text-red-900/40 tracking-tighter">Upgraded</span>}
                        </div>
                      </button>
                    );
                  })}
                  {targetPlayer?.getOutOfJailFreeCards?.map((cardId, i) => {
                    const countInRequest = requestCards.filter(c => c === cardId).length;
                    const indexOfType = targetPlayer.getOutOfJailFreeCards!.slice(0, i).filter(c => c === cardId).length;
                    const isSelected = indexOfType < countInRequest;
                    return (
                      <button
                        key={`${cardId}-${i}`}
                        onClick={() => toggleRequestCard(cardId, isSelected)}
                        className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
                          isSelected 
                            ? 'bg-red-900/40 border-red-500/50 text-white' 
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        🎟️ Get Out of Jail Free Card
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4 pt-4 border-t border-zinc-800">
          <button
            onClick={() => setTargetPlayerId(null)}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-serif uppercase tracking-wider transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleCreateTrade}
            disabled={offerMoney === 0 && requestMoney === 0 && offerProperties.length === 0 && requestProperties.length === 0 && offerCards.length === 0 && requestCards.length === 0}
            className="flex-1 py-3 bg-red-900 hover:bg-red-800 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded font-serif uppercase tracking-wider transition-colors"
          >
            Propose Trade
          </button>
        </div>
      </div>
    </div>
  );
}
