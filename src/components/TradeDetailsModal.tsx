import React from 'react';
import { TradeOffer, Player, PropertyState } from '../engine/GameEngine';
import { boardData } from '../data/boardData';
import { SoulIcon } from './SoulIcon';

interface TradeDetailsModalProps {
  trade: TradeOffer;
  players: Player[];
  properties: Record<number, PropertyState>;
  currentPlayerId: string;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  onNegotiate: () => void;
  turnPhase: string;
}

export default function TradeDetailsModal({ trade, players, properties, currentPlayerId, onClose, onAccept, onReject, onNegotiate, turnPhase }: TradeDetailsModalProps) {
  const initiator = players.find(p => p.id === trade.initiatorId);
  const target = players.find(p => p.id === trade.targetId);

  if (!initiator || !target) return null;

  const isTarget = currentPlayerId === trade.targetId;

  const initiatorHasMoney = initiator.balance >= (trade.offerMoney || 0);
  const targetHasMoney = target.balance >= (trade.requestMoney || 0);
  const initiatorHasProperties = (trade.offerProperties || []).every(id => properties[id]?.ownerId === initiator.id);
  const targetHasProperties = (trade.requestProperties || []).every(id => properties[id]?.ownerId === target.id);
  const initiatorHasCards = !trade.offerCards || trade.offerCards.every(id => {
    const countInOffer = trade.offerCards!.filter(c => c === id).length;
    const countInInventory = initiator.getOutOfJailFreeCards?.filter(c => c === id).length || 0;
    return countInInventory >= countInOffer;
  });
  const targetHasCards = !trade.requestCards || trade.requestCards.every(id => {
    const countInRequest = trade.requestCards!.filter(c => c === id).length;
    const countInInventory = target.getOutOfJailFreeCards?.filter(c => c === id).length || 0;
    return countInInventory >= countInRequest;
  });

  const isTradeValid = initiatorHasMoney && targetHasMoney && initiatorHasProperties && targetHasProperties && initiatorHasCards && targetHasCards;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 rounded-t-lg">
          <h2 className="text-2xl font-serif text-red-600">Trade Details</h2>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="text-center mb-6">
            <span className="text-xl text-zinc-300 font-bold">{initiator.name}</span>
            <span className="text-zinc-600 mx-4">proposed a trade to</span>
            <span className="text-xl text-zinc-300 font-bold">{target.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Initiator's Offer */}
            <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
              <h3 className="text-red-500 font-serif mb-4 text-center border-b border-zinc-800 pb-2">
                {initiator.name} Offers
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Souls</div>
                  <div className={`font-mono text-lg flex items-center gap-1 ${!initiatorHasMoney ? 'text-zinc-500 line-through' : 'text-red-400'}`}><SoulIcon />{trade.offerMoney}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Properties & Items</div>
                  {trade.offerProperties.length === 0 && (!trade.offerCards || trade.offerCards.length === 0) ? (
                    <div className="text-zinc-600 italic text-sm">None</div>
                  ) : (
                    <div className="space-y-1">
                      {(trade.offerProperties || []).map(id => {
                        const hasProp = properties[id]?.ownerId === initiator.id;
                        return (
                          <div key={id} className={`text-sm ${!hasProp ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                            {boardData[id].name}
                          </div>
                        );
                      })}
                      {trade.offerCards?.map((id, i) => {
                        const countInOffer = trade.offerCards!.slice(0, i + 1).filter(c => c === id).length;
                        const countInInventory = initiator.getOutOfJailFreeCards?.filter(c => c === id).length || 0;
                        const hasCard = countInInventory >= countInOffer;
                        return (
                          <div key={`${id}-${i}`} className={`text-sm ${!hasCard ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                            🎟️ Get Out of Jail Free Card
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Target's Request */}
            <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
              <h3 className="text-red-500 font-serif mb-4 text-center border-b border-zinc-800 pb-2">
                {initiator.name} Wants
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Souls</div>
                  <div className={`font-mono text-lg flex items-center gap-1 ${!targetHasMoney ? 'text-zinc-500 line-through' : 'text-red-400'}`}><SoulIcon />{trade.requestMoney}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Properties & Items</div>
                  {trade.requestProperties.length === 0 && (!trade.requestCards || trade.requestCards.length === 0) ? (
                    <div className="text-zinc-600 italic text-sm">None</div>
                  ) : (
                    <div className="space-y-1">
                      {(trade.requestProperties || []).map(id => {
                        const hasProp = properties[id]?.ownerId === target.id;
                        return (
                          <div key={id} className={`text-sm ${!hasProp ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                            {boardData[id].name}
                          </div>
                        );
                      })}
                      {trade.requestCards?.map((id, i) => {
                        const countInRequest = trade.requestCards!.slice(0, i + 1).filter(c => c === id).length;
                        const countInInventory = target.getOutOfJailFreeCards?.filter(c => c === id).length || 0;
                        const hasCard = countInInventory >= countInRequest;
                        return (
                          <div key={`${id}-${i}`} className={`text-sm ${!hasCard ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                            🎟️ Get Out of Jail Free Card
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {!isTradeValid && (
            <div className="mt-6 p-3 bg-red-950/50 border border-red-900 rounded text-red-400 text-sm text-center">
              This trade is no longer valid because one or both players lack the required resources.
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900 rounded-b-lg flex justify-end gap-3">
          {isTarget ? (
            <>
              <button 
                onClick={onReject}
                className="px-6 py-2 bg-red-900 hover:bg-red-800 text-white font-serif uppercase tracking-wider rounded transition-colors"
              >
                Reject
              </button>
              <button 
                onClick={onNegotiate}
                disabled={!isTradeValid || turnPhase === 'DESPERATION'}
                className={`px-6 py-2 font-serif uppercase tracking-wider rounded transition-colors ${
                  !isTradeValid || turnPhase === 'DESPERATION' ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-blue-800 hover:bg-blue-700 text-white'
                }`}
              >
                Negotiate
              </button>
              <button 
                onClick={onAccept}
                disabled={!isTradeValid || turnPhase === 'DESPERATION'}
                className={`px-6 py-2 font-serif uppercase tracking-wider rounded transition-colors ${
                  !isTradeValid || turnPhase === 'DESPERATION' ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                }`}
              >
                Accept
              </button>
            </>
          ) : (
            currentPlayerId === trade.initiatorId && (
              <button 
                onClick={onReject}
                className="px-6 py-2 bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 font-serif uppercase tracking-wider rounded transition-colors shadow-[0_0_10px_rgba(153,27,27,0.2)]"
              >
                Retract Offer
              </button>
            )
          )}
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-serif uppercase tracking-wider rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
