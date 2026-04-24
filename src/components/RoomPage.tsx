import { characters } from '../data/characters';
import { RitualistSprite } from './RitualistSprite';

export interface RoomPlayer {
  id: string;
  name: string;
  color: string | null;
  characterId: number | null;
  isReady: boolean;
}

interface RoomPageProps {
  lobbyCode: string;
  hostId: string;
  currentUser: RoomPlayer;
  players: RoomPlayer[];
  settings: {
    maxPlayers: number;
    startingSouls: number;
  };
  onVesselSelect: (characterId: number, color: string) => void;
  onToggleReady: () => void;
  onUpdateSettings: (settings: { maxPlayers: number, startingSouls: number }) => void;
  onStartGame: () => void;
  onLeave: () => void;
  onPassLeadership: (playerId: string) => void;
  onKickPlayer: (playerId: string) => void;
}

export function RoomPage({ 
  lobbyCode, 
  hostId, 
  currentUser, 
  players, 
  settings,
  onVesselSelect, 
  onToggleReady, 
  onUpdateSettings,
  onStartGame, 
  onLeave,
  onPassLeadership,
  onKickPlayer
}: RoomPageProps) {
  // A vessel is taken if another player has selected its characterId
  const takenVesselIds = players.filter(p => p.id !== currentUser.id && p.characterId).map(p => p.characterId);
  
  const allReady = players.length > 1 && players.every(p => p.isReady);
  const isHost = hostId === currentUser.id;

  return (
    <div className="min-h-screen bg-black text-zinc-300 flex flex-col items-center p-4 font-sans relative overflow-hidden">
      {/* Background styling */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/lobby-bg.jpg" 
          alt="Lobby Background" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      <div className="z-10 w-full max-w-4xl flex flex-col h-full bg-zinc-950 border border-red-900/30 p-6 rounded-lg shadow-2xl relative mt-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-800 to-transparent opacity-50"></div>
        
        <header className="mb-8 grid grid-cols-1 md:grid-cols-3 items-center border-b border-zinc-800 pb-4 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-serif text-red-700 tracking-widest uppercase leading-none">The Gathering</h1>
            <p className="text-zinc-500 text-[10px] font-serif italic mt-1 uppercase tracking-wider">
              Select your Vessel. Prepare for Torment.
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] mb-1 font-serif">Pact Code</span>
            <span className="font-mono text-2xl text-red-600 font-bold tracking-[0.2em] bg-red-950/20 px-6 py-1 border border-red-900/30 rounded-full shadow-inner shadow-red-900/10">
              {lobbyCode}
            </span>
          </div>

          <div className="hidden md:block">
            {/* Balanced Spacer */}
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8 flex-1">
          {/* Manifest of Souls (Players list) */}
          <div className="w-full md:w-1/3 flex flex-col">
            <h2 className="text-lg font-serif text-zinc-400 mb-4 uppercase tracking-widest border-b border-zinc-800 pb-2">Manifest of Souls</h2>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {players.map(player => (
                <div key={player.id} className={`p-3 border rounded flex items-center justify-between group ${player.id === currentUser.id ? 'bg-zinc-900 border-red-900/50' : 'bg-black/50 border-zinc-800'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      {player.characterId ? (
                        <RitualistSprite 
                          characterId={player.characterId} 
                          inJail={false} 
                          color={player.color || 'bg-zinc-800'} 
                          name={player.name}
                        />
                      ) : (
                        <div className={`w-4 h-4 rounded-full border border-zinc-700 ${player.color || 'bg-transparent'}`} />
                      )}
                    </div>
                    <span className={`font-mono text-sm ${player.id === currentUser.id ? 'text-white font-bold' : 'text-zinc-300'}`}>
                      {player.name}
                    </span>
                    {player.id === hostId && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-950/40 border border-red-900/30 text-[8px] uppercase tracking-widest text-red-500 font-serif" title="The High Priest (Leader)">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" /></svg>
                        Priest
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isHost && player.id !== currentUser.id && (
                      <div className="flex items-center gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onPassLeadership(player.id)}
                          className="p-1.5 rounded bg-zinc-900 hover:bg-red-950/40 text-zinc-600 hover:text-red-500 transition-colors border border-zinc-800 hover:border-red-900/50"
                          title="Pass High Priest status"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" /></svg>
                        </button>
                        <button 
                          onClick={() => onKickPlayer(player.id)}
                          className="p-1.5 rounded bg-zinc-900 hover:bg-red-950/40 text-zinc-600 hover:text-red-500 transition-colors border border-zinc-800 hover:border-red-900/50"
                          title="Exile soul from ritual"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>
                        </button>
                      </div>
                    )}
                    <span className={`text-xs uppercase tracking-wider ${player.isReady ? 'text-green-500' : 'text-yellow-600'}`}>
                      {player.isReady ? 'Ready' : 'Waiting'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
              <button 
                onClick={onToggleReady}
                disabled={!currentUser.characterId}
                className={`w-full py-3 rounded uppercase tracking-[0.2em] font-serif transition-all duration-300 
                  ${currentUser.isReady ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-red-950 hover:bg-red-900 text-red-100 border border-red-800 hover:shadow-[0_0_15px_rgba(153,27,27,0.4)]'}
                  ${!currentUser.characterId ? 'opacity-50 cursor-not-allowed bg-zinc-900 border-zinc-800 text-zinc-600' : ''}`}
              >
                {currentUser.isReady ? 'Revoke Readiness' : 'I Am Ready'}
              </button>
              
              {isHost && (
                <button
                  onClick={onStartGame}
                  disabled={!allReady}
                  className={`w-full py-3 rounded uppercase tracking-[0.2em] font-serif transition-colors
                    ${allReady ? 'bg-green-950 hover:bg-green-900 text-green-100 border border-green-800' : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'}`}
                >
                  Commence Ritual
                </button>
              )}
            </div>
          </div>

          {/* Vessels (Character selection) */}
          <div className="w-full md:w-2/3 flex flex-col">
            <h2 className="text-lg font-serif text-zinc-400 mb-4 uppercase tracking-widest border-b border-zinc-800 pb-2">Select Vessel</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-2">
              {characters.map(char => {
                const isTaken = takenVesselIds.includes(char.id);
                const isSelected = currentUser.characterId === char.id;

                return (
                  <button
                    key={char.id}
                    onClick={() => !isTaken && onVesselSelect(char.id, char.color)}
                    disabled={isTaken || currentUser.isReady}
                    className={`flex flex-col items-center gap-1 p-2 rounded border transition-all duration-200 group
                      ${isSelected ? 'bg-red-950/30 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] scale-105 z-10' : 'bg-black border-zinc-800 hover:border-zinc-700'}
                      ${isTaken ? 'opacity-20 cursor-not-allowed grayscale' : 'cursor-pointer'}
                      ${currentUser.isReady && !isSelected ? 'opacity-40 cursor-not-allowed' : ''}
                    `}
                    title={char.description}
                  >
                    <div className="w-12 h-12 flex items-center justify-center mb-1">
                      <RitualistSprite 
                        characterId={char.id} 
                        inJail={false} 
                        color={char.color} 
                        name={char.name}
                      />
                    </div>
                    <span className={`text-[9px] uppercase font-serif tracking-widest text-center leading-tight transition-colors ${isSelected ? 'text-red-500' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                      {isTaken ? 'Possessed' : char.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 border-t border-zinc-800 pt-6">
              <div className="bg-black/40 border border-red-900/20 rounded-lg p-5">
                <h2 className="text-sm font-serif text-red-700 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-800"></span>
                  Ritual Constraints
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-serif">Souls In Pact</label>
                      <span className="text-lg font-mono text-red-500 leading-none">{settings.maxPlayers}</span>
                    </div>
                    <div className="relative pt-1">
                      {isHost ? (
                        <input 
                          type="range" 
                          min="2" 
                          max="6" 
                          value={settings.maxPlayers}
                          onChange={(e) => onUpdateSettings({ ...settings, maxPlayers: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-red-700 hover:accent-red-600 transition-all shadow-inner"
                        />
                      ) : (
                        <div className="w-full h-1.5 bg-zinc-900 rounded-lg relative overflow-hidden shadow-inner">
                          <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-950 to-red-800" style={{ width: `${(settings.maxPlayers / 6) * 100}%` }}></div>
                        </div>
                      )}
                      <div className="flex justify-between mt-1 px-0.5">
                        <span className="text-[8px] text-zinc-700 font-mono">2</span>
                        <span className="text-[8px] text-zinc-700 font-mono">6</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-serif block mb-1">Initial Life Fragments</label>
                    {isHost ? (
                      <div className="flex items-center gap-1 bg-zinc-900/50 border border-zinc-800 rounded p-1 group focus-within:border-red-900 transition-colors">
                        <button 
                          onClick={() => onUpdateSettings({ ...settings, startingSouls: Math.max(1500, settings.startingSouls - 100) })}
                          className="w-8 h-8 flex items-center justify-center bg-zinc-950 hover:bg-zinc-800 text-zinc-500 hover:text-red-500 rounded transition-colors font-mono"
                        >-</button>
                        <input 
                          type="number" 
                          min="1500" 
                          step="100"
                          value={settings.startingSouls}
                          onChange={(e) => onUpdateSettings({ ...settings, startingSouls: Math.max(1500, parseInt(e.target.value) || 1500) })}
                          className="w-full bg-transparent text-sm text-center text-red-500 font-mono focus:outline-none"
                        />
                        <button 
                          onClick={() => onUpdateSettings({ ...settings, startingSouls: settings.startingSouls + 100 })}
                          className="w-8 h-8 flex items-center justify-center bg-zinc-950 hover:bg-zinc-800 text-zinc-500 hover:text-red-500 rounded transition-colors font-mono"
                        >+</button>
                      </div>
                    ) : (
                      <div className="h-10 flex items-center justify-center bg-zinc-950/30 border border-zinc-900 rounded text-red-900/50 font-mono text-sm tracking-widest">
                        {settings.startingSouls}
                      </div>
                    )}
                  </div>
                </div>
                
                {isHost && (
                  <p className="mt-4 text-[9px] text-zinc-600 italic font-serif text-center border-t border-zinc-900 pt-3 uppercase tracking-wider">
                    As the Host, you govern the laws of this torment.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-6 right-8">
          <button 
            onClick={onLeave} 
            className="group flex items-center gap-3 px-4 py-2 bg-red-950/20 border border-red-900/30 rounded-full hover:bg-red-900/40 hover:border-red-600 transition-all duration-300 shadow-lg hover:shadow-red-900/40"
            title="Abort Ritual"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-serif text-red-700 group-hover:text-red-500 transition-colors">Abort Ritual</span>
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-full border border-zinc-700 group-hover:border-red-500 group-hover:scale-110 transition-all">
              <svg 
                className="w-4 h-4 text-red-700 group-hover:text-red-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V17a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
