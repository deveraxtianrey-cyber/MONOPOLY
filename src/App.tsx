/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import PropertyCard from './components/PropertyCard';
import TradeModal from './components/TradeModal';
import TradeDetailsModal from './components/TradeDetailsModal';
import { TormentCardModal } from './components/TormentCardModal';
import { OmenCardModal } from './components/OmenCardModal';
import { VictoryModal } from './components/VictoryModal';
import { SoulIcon } from './components/SoulIcon';
import { GameEngine, Player, TradeOffer } from './engine/GameEngine';
import { boardData } from './data/boardData';
import { AuthPage } from './components/AuthPage';
import { LobbyPage } from './components/LobbyPage';
import { BloodEffects } from './components/BloodEffects';
import { Footer } from './components/Footer';
import { RoomPage, RoomPlayer } from './components/RoomPage';
import { SpookyFlash } from './components/SpookyFlash';
import { BackgroundMusic } from './components/BackgroundMusic';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { ref, set, onValue, update, get, child, remove, off, onDisconnect } from 'firebase/database';
import { auth, db } from './firebase';

const initialPlayers: Player[] = [
  { id: '1', name: 'Player 1', position: 0, balance: 1500, inJail: false, jailTurns: 0, color: 'bg-red-500', characterId: 1 },
  { id: '2', name: 'Player 2', position: 0, balance: 1500, inJail: false, jailTurns: 0, color: 'bg-blue-500', characterId: 2 },
  { id: '3', name: 'Player 3', position: 0, balance: 1500, inJail: false, jailTurns: 0, color: 'bg-green-500', characterId: 3 },
  { id: '4', name: 'Player 4', position: 0, balance: 1500, inJail: false, jailTurns: 0, color: 'bg-yellow-500', characterId: 4 },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lobbyCode, setLobbyCode] = useState<string | null>(null);
  const [hostId, setHostId] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([
    { id: '1', name: 'Player 1', color: null, characterId: null, isReady: false }
  ]);
  const [engine, setEngine] = useState(() => new GameEngine(initialPlayers));
  const [logs, setLogs] = useState<string[]>([]);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [isRolling, setIsRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<[number, number]>([1, 1]);
  const [turnPhase, setTurnPhase] = useState(engine.turnPhase);
  const [timeLeft, setTimeLeft] = useState(360);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [viewingTrade, setViewingTrade] = useState<TradeOffer | null>(null);
  const [negotiatingTrade, setNegotiatingTrade] = useState<TradeOffer | null>(null);
  const [bankruptAnimations, setBankruptAnimations] = useState<{ id: string, playerName: string, position: number }[]>([]);
  const [tradedPropertyIds, setTradedPropertyIds] = useState<number[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lobbySettings, setLobbySettings] = useState({ maxPlayers: 6, startingSouls: 1500 });

  // Dice Roll Sound Placeholder
  const diceRollAudio = React.useRef<HTMLAudioElement | null>(null);
  const DICE_ROLL_SFX = '/dice-roll.mp3'; // PLACEHOLDER: Replace with actual ritual sound path

  useEffect(() => {
    if (!diceRollAudio.current) {
      diceRollAudio.current = new Audio(DICE_ROLL_SFX);
      diceRollAudio.current.loop = true;
      diceRollAudio.current.volume = 0.1; // Faint whisper for atmospheric ritual
    }

    if (isRolling) {
      diceRollAudio.current.currentTime = 0;
      diceRollAudio.current.play().catch(e => console.log("Ritual audio suppressed by browser until interaction."));
    } else {
      diceRollAudio.current.pause();
    }
  }, [isRolling]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setIsAuthenticated(true);
        const savedCode = localStorage.getItem('monopoly_lobby_code');
        if (savedCode) {
          setLobbyCode(savedCode);
        }
      } else {
        setIsAuthenticated(false);
        setLobbyCode(null);
        setGameStarted(false);
        localStorage.removeItem('monopoly_lobby_code');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!lobbyCode || !currentUser) return;

    const lobbyRef = ref(db, `lobbies/${lobbyCode}`);
    const unsubscribe = onValue(lobbyRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setLobbyCode(null);
        setGameStarted(false);
        setTurnPhase('ROLL');
        localStorage.removeItem('monopoly_lobby_code');
        return;
      }

      // Check if current user is still in this lobby
      const playersList: RoomPlayer[] = Object.values(data.players || {});
      const isStillInLobby = playersList.some(p => p.id === currentUser?.uid);
      
      if (!isStillInLobby && data.status !== 'started') {
        // If the game hasn't started and we're not in the lobby, we were either kicked or left
        setLobbyCode(null);
        setGameStarted(false);
        setTurnPhase('ROLL');
        localStorage.removeItem('monopoly_lobby_code');
        return;
      }
      setRoomPlayers(playersList);
      
      // Healing mechanism: If host is missing from players, reassign
      const currentHostExists = playersList.some(p => p.id === data.hostId);
      if (!currentHostExists && playersList.length > 0) {
        // First remaining player takes over
        const newHostId = playersList[0].id;
        if (currentUser?.uid === newHostId) {
          update(lobbyRef, { hostId: newHostId });
        }
      }

      setHostId(data.hostId);
      
      const settings = data.settings || { maxPlayers: 6, startingSouls: 1500 };
      setLobbySettings(settings);

      if (data.status === 'started' && !gameStarted) {
        const sortedPlayers = playersList.map((rp) => ({
          id: rp.id,
          name: rp.name,
          position: 0,
          balance: settings.startingSouls,
          inJail: false,
          jailTurns: 0,
          color: rp.color || 'bg-red-500',
          characterId: rp.characterId || 1
        }));
        
        const newEngine = new GameEngine(sortedPlayers);
        setEngine(newEngine);
        setPlayers(sortedPlayers);
        setTurnPhase(newEngine.turnPhase);
        setGameStarted(true);
      }
    });

    // Setup presence cleanup on disconnect
    const presenceRef = ref(db, `lobbies/${lobbyCode}/players/${currentUser.uid}`);
    onDisconnect(presenceRef).remove();
    
    return () => {
      off(lobbyRef);
      onDisconnect(presenceRef).cancel();
    };
  }, [lobbyCode, currentUser, gameStarted]);

  useEffect(() => {
    if (!lobbyCode || !gameStarted) return;

    const gameRef = ref(db, `games/${lobbyCode}`);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      engine.importState(data);
      
      setPlayers([...engine.players]);
      setTurnPhase(engine.turnPhase);
      setDiceValues([engine.lastRoll?.die1 || 1, engine.lastRoll?.die2 || 1]);
      setLogs(engine.gameLogs.slice(-10));
      setIsRolling(engine.isDiceRolling);
    });

    return () => off(gameRef);
  }, [lobbyCode, gameStarted]);

  const updateGameState = () => {
    setPlayers([...engine.players]);
    setTurnPhase(engine.turnPhase);
    
    // Always push state to Firebase when a local action is taken
    if (currentUser && lobbyCode) {
      set(ref(db, `games/${lobbyCode}`), engine.exportState());
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    
    // Passive Sweeper: Clean up old 'waiting' lobbies (> 1 hour)
    const cleanupRef = ref(db, 'lobbies');
    get(cleanupRef).then((snapshot) => {
      const lobbies = snapshot.val();
      if (!lobbies) return;

      const now = Date.now();
      const ONE_HOUR = 3600000;

      Object.entries(lobbies).forEach(([code, data]: [string, any]) => {
        if (data.status === 'waiting' && data.createdAt && (now - data.createdAt > ONE_HOUR)) {
          console.log(`Pruning stagnant ritual: ${code} (Antique Gathering)`);
          remove(ref(db, `lobbies/${code}`));
          remove(ref(db, `games/${code}`));
        }
      });
    });
  }, [currentUser]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (turnPhase === 'MOVING') {
      interval = setInterval(() => {
        engine.stepMove();
        // Locally update state for animation
        setPlayers([...engine.players]);
        setTurnPhase(engine.turnPhase);
        
        // Only the current player pushes the final resting state
        if (engine.pendingMoveSteps === 0) {
          const currentPlayer = engine.getCurrentPlayer();
          if (currentUser && currentPlayer && currentUser.uid === currentPlayer.id) {
             set(ref(db, `games/${lobbyCode}`), engine.exportState());
          }
        }
      }, 200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [turnPhase, lobbyCode, currentUser]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (engine.isDiceRolling) {
      setIsRolling(true);
      interval = setInterval(() => {
        setDiceValues([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
      }, 50);
    } else {
      setIsRolling(false);
      if (engine.lastRoll) {
        setDiceValues([engine.lastRoll.die1, engine.lastRoll.die2]);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [engine.isDiceRolling, engine.lastRoll]);

  // Turn Timer Logic
  useEffect(() => {
    if (!gameStarted || turnPhase === 'GAME_OVER') return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - engine.turnStartedAt) / 1000);
      const remaining = Math.max(0, 360 - elapsed);
      setTimeLeft(remaining);

      // Auto-bankruptcy for timed out players (Host handles this)
      if (remaining === 0 && hostId === currentUser?.uid) {
        const currentPlayer = engine.getCurrentPlayer();
        if (currentPlayer) {
          console.log(`Ritualist ${currentPlayer.name} timed out. Soul Extinguished.`);
          engine.handleElimination(currentPlayer.id);
          updateGameState();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, turnPhase, engine.turnStartedAt, hostId, currentUser]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRoll = () => {
    if (currentUser?.uid !== engine.getCurrentPlayer().id) return;
    if (isRolling || (engine.turnPhase !== 'ROLL' && engine.turnPhase !== 'JAIL_DECISION')) return;
    
    // Set rolling in Firebase
    engine.isDiceRolling = true;
    updateGameState();

    // Trigger local animation timer to finish the roll
    setTimeout(() => {
      const roll = engine.rollDice();
      engine.isDiceRolling = false;
      updateGameState();
    }, 1000);
  };

  const handlePayJailFine = () => {
    if (currentUser?.uid !== engine.getCurrentPlayer().id) return;
    engine.payJailFine();
    updateGameState();
  };

  const handleUseGetOutOfJailFreeCard = () => {
    if (currentUser?.uid !== engine.getCurrentPlayer().id) return;
    engine.useGetOutOfJailFreeCard();
    updateGameState();
  };

  const handleAcknowledgeCard = () => {
    if (currentUser?.uid !== engine.getCurrentPlayer().id) return;
    engine.acknowledgeCard();
    updateGameState();
  };

  const handleBuyProperty = () => {
    if (currentUser?.uid !== engine.getCurrentPlayer().id) return;
    engine.buyProperty();
    updateGameState();
  };

  const handleSkipBuyProperty = () => {
    if (currentUser?.uid !== engine.getCurrentPlayer().id) return;
    engine.skipBuyProperty();
    updateGameState();
  };

  const handleEndTurn = () => {
    if (currentUser?.uid !== engine.getCurrentPlayer().id) return;
    engine.endTurn();
    updateGameState();
  };

  const handlePayDebt = () => {
    if (currentUser?.uid !== engine.getCurrentPlayer().id) return;
    engine.payDebt(currentPlayer.id);
    updateGameState();
  };

  const handleDeclareBankruptcy = () => {
    const player = accountPlayer;
    if (!player) return;
    const animId = Math.random().toString();
    setBankruptAnimations(prev => [...prev, {
      id: animId,
      playerName: player.name,
      position: player.position
    }]);
    
    setTimeout(() => {
      setBankruptAnimations(prev => prev.filter(a => a.id !== animId));
    }, 3000);

    engine.handleElimination(player.id);
    updateGameState();
  };

  const handleBuyHouse = (propertyId: number) => {
    const property = engine.properties[propertyId];
    if (currentUser?.uid !== property?.ownerId) return;
    if (currentUser?.uid !== engine.getCurrentPlayer().id) return;
    engine.buyHouse(propertyId);
    updateGameState();
  };

  const handleSellHouse = (propertyId: number) => {
    const property = engine.properties[propertyId];
    if (currentUser?.uid !== property?.ownerId) return;
    if (currentUser?.uid !== engine.getCurrentPlayer().id) return;
    engine.sellHouse(propertyId);
    updateGameState();
  };

  const currentPlayer = engine.getCurrentPlayer();
  const accountPlayer = players.find(p => p.id === currentUser?.uid) || currentPlayer;
  const pendingProperty = engine.pendingPropertyId !== null ? boardData[engine.pendingPropertyId] : null;

  // Get properties owned by current account
  const ownedProperties = currentUser ? Object.entries(engine.properties)
    .filter(([_, state]) => (state as any).ownerId === currentUser.uid)
    .map(([id, _]) => boardData[parseInt(id)]) : [];

  if (!isAuthenticated) {
    return (
      <>
        <BackgroundMusic />
        <AuthPage onLogin={() => setIsAuthenticated(true)} />
        {isFlashing && <SpookyFlash />}
      </>
    );
  }

  if (!lobbyCode) {
    return (
      <>
        <BackgroundMusic />
        <LobbyPage 
          onJoinLobby={async (code) => {
            const lobbySnapshot = await get(child(ref(db), `lobbies/${code}`));
            if (lobbySnapshot.exists()) {
              const data = lobbySnapshot.val();
              
              if (data.status === 'started') {
                alert("This Ritual has already commenced. You cannot join.");
                return;
              }

              const settings = data.settings || { maxPlayers: 6, startingSouls: 1500 };
              
              // Expiration Check: If the lobby is in 'waiting' status and older than 1 hour
              const now = Date.now();
              const ONE_HOUR = 3600000;
              if (data.status === 'waiting' && data.createdAt && (now - data.createdAt > ONE_HOUR)) {
                alert("This Ritual Gathering has faded into history. It is too ancient to join.");
                remove(ref(db, `lobbies/${code}`));
                return;
              }

              const currentPlayers = Object.keys(data.players || {}).length;
              
              if (currentPlayers >= settings.maxPlayers) {
                alert("The Pact is full. No more souls can enter.");
                return;
              }

              const userData = {
                id: currentUser!.uid,
                name: currentUser!.displayName || 'Player ' + currentUser!.uid.substring(0, 4),
                color: null,
                isReady: false
              };
              await update(ref(db, `lobbies/${code}/players/${currentUser!.uid}`), userData);
              
              // Trigger spooky flash before joining
              setIsFlashing(true);
              setTimeout(() => {
                setIsFlashing(false);
               setLobbyCode(code);
               localStorage.setItem('monopoly_lobby_code', code);
             }, 1000);
            } else {
              alert("Lobby not found. The pact does not exist.");
            }
          }}
          onCreateLobby={async () => {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            const userData = {
              id: currentUser!.uid,
              name: currentUser!.displayName || 'Player ' + currentUser!.uid.substring(0, 4),
              color: null,
              isReady: false
            };
            const lobbyData = {
              code: code,
              hostId: currentUser!.uid,
              status: 'waiting',
              createdAt: Date.now(),
              settings: {
                maxPlayers: 6,
                startingSouls: 1500
              },
              players: {
                [currentUser!.uid]: userData
              }
            };
            await set(ref(db, `lobbies/${code}`), lobbyData);
            
            // Trigger spooky flash before creating
            setIsFlashing(true);
            setTimeout(() => {
              setIsFlashing(false);
              setLobbyCode(code);
              localStorage.setItem('monopoly_lobby_code', code);
            }, 1000);
          }}
          onLogout={() => signOut(auth)}
        />
        {isFlashing && <SpookyFlash />}
      </>
    );
  }

  const roomCurrentUser = roomPlayers.find(p => p.id === currentUser?.uid) || {
    id: currentUser?.uid || '',
    name: currentUser?.displayName || '',
    color: null,
    isReady: false
  };

  // We need the settings from the snapshot we already have in the useEffect

  // Update lobbySettings state when roomPlayers changes (this is a bit hacky, better to update in the listener)
  // I will go back and add the state to the listener in the next step or just do it now.
  
  if (!gameStarted) {
    return (
      <>
        <BackgroundMusic />
        <RoomPage 
          lobbyCode={lobbyCode}
          hostId={hostId || ''}
          currentUser={roomCurrentUser}
          players={roomPlayers}
          settings={lobbySettings}
          onVesselSelect={(characterId, color) => {
            update(ref(db, `lobbies/${lobbyCode}/players/${currentUser!.uid}`), { characterId, color });
          }}
          onToggleReady={() => {
            update(ref(db, `lobbies/${lobbyCode}/players/${currentUser!.uid}`), { isReady: !roomCurrentUser.isReady });
          }}
          onUpdateSettings={(settings) => {
            update(ref(db, `lobbies/${lobbyCode}`), { settings });
          }}
          onStartGame={async () => {
          const settings = lobbySettings;
          const newPlayers = roomPlayers.map((rp) => ({
             id: rp.id, 
             name: rp.name, 
             position: 0, 
             balance: settings.startingSouls, 
             inJail: false, 
             jailTurns: 0, 
             getOutOfJailFreeCards: [],
             color: rp.color || 'bg-red-500',
             characterId: rp.characterId || 1 // Fallback to 1 if not selected (should be blocked by UI)
          }));
          const newEngine = new GameEngine(newPlayers);
          
          // Initialize game state in Firebase
          await set(ref(db, `games/${lobbyCode}`), newEngine.exportState());
          await update(ref(db, `lobbies/${lobbyCode}`), { status: 'started' });
        }}
          onLeave={async () => {
            const code = lobbyCode;
            const uid = currentUser?.uid;

            if (code && uid) {
              const playersRef = ref(db, `lobbies/${code}/players`);
              const snap = await get(playersRef);
              const playersData = snap.val() || {};
              const remainingUids = Object.keys(playersData);

              if (remainingUids.length <= 1) {
                await remove(ref(db, `games/${code}`));
                await remove(ref(db, `lobbies/${code}`));
              } else {
                // If we are host, migrate leadership
                if (uid === hostId) {
                  const nextHostId = remainingUids.find(id => id !== uid);
                  if (nextHostId) {
                    await update(ref(db, `lobbies/${code}`), { hostId: nextHostId });
                  }
                }
                await remove(ref(db, `lobbies/${code}/players/${uid}`));
              }
            }

            setLobbyCode(null);
            setGameStarted(false);
            setTurnPhase('ROLL');
            localStorage.removeItem('monopoly_lobby_code');
          }}
          onPassLeadership={async (newHostId) => {
            if (lobbyCode) {
              await update(ref(db, `lobbies/${lobbyCode}`), { hostId: newHostId });
            }
          }}
          onKickPlayer={async (playerId) => {
            if (lobbyCode) {
              await remove(ref(db, `lobbies/${lobbyCode}/players/${playerId}`));
            }
          }}
        />
      </>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-black text-zinc-300 flex flex-col items-center justify-center p-4 font-sans focus:outline-none">
        <BackgroundMusic />
        <h1 className="text-4xl font-serif text-red-600 mb-4">Game Over</h1>
        <p className="text-zinc-400">All players have been eliminated.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 flex flex-col items-center p-4 font-sans relative overflow-hidden">
      <BackgroundMusic />
      {/* Background styling for the Ritual Ground */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/game-bg.jpg" 
          alt="Game Background" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Crimson Ritual Effects */}
        <BloodEffects />
      </div>

      <div className="z-10 w-full flex flex-col items-center">


      {/* Spectator/Ghost Overlay */}
      {!engine.players.some(p => p.id === currentUser?.uid) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
          <div className="bg-zinc-950/80 border border-zinc-800 px-4 py-2 rounded-full backdrop-blur-sm">
            <span className="text-[10px] uppercase tracking-[0.3em] font-serif text-zinc-500 italic">You are a Ghost. Witnessing the end.</span>
          </div>
          <button 
            onClick={() => {
              setLobbyCode(null);
              setGameStarted(false);
              localStorage.removeItem('monopoly_lobby_code');
            }}
            className="pointer-events-auto px-4 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] uppercase tracking-widest text-zinc-600 hover:text-red-500 hover:border-red-900 transition-all hover:bg-black"
          >
            Flee the Void
          </button>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-8 w-full max-w-7xl items-start justify-center">
        <div className="flex-1 w-full flex justify-center">
          <Board 
            players={players} 
            diceValues={diceValues} 
            isRolling={isRolling} 
            logs={logs}
            turnPhase={turnPhase}
            currentPlayer={currentPlayer}
            isMyTurn={currentUser?.uid === currentPlayer.id}
            pendingProperty={pendingProperty}
            properties={engine.properties}
            bankruptAnimations={bankruptAnimations}
            onRoll={handleRoll}
            onPayJailFine={handlePayJailFine}
            onUseGetOutOfJailFreeCard={handleUseGetOutOfJailFreeCard}
            onBuyProperty={handleBuyProperty}
            onSkipBuyProperty={handleSkipBuyProperty}
            onEndTurn={handleEndTurn}
            onSpaceClick={setSelectedPropertyId}
            onPayDebt={handlePayDebt}
            onDeclareBankruptcy={handleDeclareBankruptcy}
            debtAmount={engine.debt?.amount}
            timeLeftFormatted={formatTime(timeLeft)}
            isTimerCritical={timeLeft < 60}
          />
        </div>

        <div className="w-full xl:w-80 flex flex-col gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg relative pb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif text-red-600">Players</h2>
            </div>
            {players.map(p => (
              <div key={p.id} className="flex justify-between items-center mb-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${p.color}`} />
                  <span className={engine.currentPlayerIndex === players.indexOf(p) ? 'text-white font-bold' : ''}>
                    {p.name} {p.inJail && <span className="text-red-500 text-xs ml-1">(Jail)</span>}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {p.getOutOfJailFreeCards && p.getOutOfJailFreeCards.length > 0 ? (
                    <span className="text-xs text-yellow-500" title="Get Out of Jail Free Cards">🎟️ {p.getOutOfJailFreeCards.length}</span>
                  ) : null}
                  <div className="font-mono text-red-400 flex items-center gap-1"><SoulIcon className="w-4 h-4" />{p.balance}</div>
                </div>
              </div>
            ))}
            {engine.players.some(p => p.id === currentUser?.uid) && (
              <button
                onClick={handleDeclareBankruptcy}
                className="absolute bottom-3 right-3 text-[10px] uppercase tracking-wider px-2 py-1 bg-red-950 hover:bg-red-900 text-red-400 border border-red-900 rounded transition-colors"
                title="Quit game and declare bankruptcy"
              >
                Bankrupt
              </button>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex flex-col min-h-[150px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif text-red-600">Trades</h2>
              {engine.players.some(p => p.id === currentUser?.uid) && (
                <button 
                  onClick={() => setIsTradeModalOpen(true)}
                  disabled={turnPhase === 'DESPERATION'}
                  className={`text-xs px-3 py-1 rounded border transition-colors uppercase tracking-wider font-serif ${
                    turnPhase === 'DESPERATION' 
                      ? 'bg-zinc-800 text-zinc-600 border-zinc-800 cursor-not-allowed'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                  }`}
                >
                  Create
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-xs text-zinc-400 space-y-2">
              {engine.activeTrades.length === 0 ? (
                <p className="text-zinc-600 italic">No active trade offers.</p>
              ) : (
                engine.activeTrades.map(trade => {
                  const initiator = players.find(p => p.id === trade.initiatorId);
                  const target = players.find(p => p.id === trade.targetId);
                  return (
                    <div 
                      key={trade.id} 
                      className="bg-zinc-950 p-3 rounded border border-zinc-800 cursor-pointer hover:border-zinc-600 transition-colors"
                      onClick={() => setViewingTrade(trade)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300 font-bold truncate">{initiator?.name}</span>
                        <span className="text-zinc-600 mx-2">→</span>
                        <span className="text-zinc-300 font-bold truncate">{target?.name}</span>
                      </div>
                      <div className="text-center mt-2 text-zinc-500 text-[10px] uppercase tracking-wider">
                        Click to view details
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex-1 min-h-[200px] flex flex-col">
            <h2 className="text-xl font-serif text-red-600 mb-4">My Properties</h2>
            <div className="flex-1 overflow-y-auto font-mono text-xs text-zinc-400 space-y-2">
              {ownedProperties.length === 0 ? (
                <p className="text-zinc-600 italic">No properties owned yet.</p>
              ) : (
                ownedProperties.map(prop => (
                  <div 
                    key={prop.id} 
                    className="flex justify-between items-center border-b border-zinc-800 pb-1 cursor-pointer hover:text-white transition-colors"
                    onClick={() => setSelectedPropertyId(prop.id)}
                  >
                    <span>{prop.name}</span>
                    <span className="text-zinc-500">
                      {engine.properties[prop.id].houses === 5 ? '1 Mausoleum' : engine.properties[prop.id].houses > 0 ? `${engine.properties[prop.id].houses} Gravestone${engine.properties[prop.id].houses > 1 ? 's' : ''}` : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedPropertyId !== null && (
        <PropertyCard 
          space={boardData[selectedPropertyId]} 
          propertyState={engine.properties[selectedPropertyId]} 
          ownsMonopoly={boardData[selectedPropertyId].colorGroup ? engine.ownsMonopoly(boardData[selectedPropertyId].colorGroup!, currentUser!.uid) : false}
          canBuyHouse={engine.canBuyHouse(selectedPropertyId, currentUser!.uid)}
          canSellHouse={engine.canSellHouse(selectedPropertyId, currentUser!.uid)}
          canMortgage={engine.canMortgage(selectedPropertyId, currentUser!.uid)}
          canUnmortgage={engine.canUnmortgage(selectedPropertyId, currentUser!.uid)}
          ownedRailroadsCount={
            engine.properties[selectedPropertyId]?.ownerId 
              ? boardData.filter(s => s.type === 'railroad' && engine.properties[s.id]?.ownerId === engine.properties[selectedPropertyId].ownerId).length 
              : 0
          }
          ownedUtilitiesCount={
            engine.properties[selectedPropertyId]?.ownerId 
              ? boardData.filter(s => s.type === 'utility' && engine.properties[s.id]?.ownerId === engine.properties[selectedPropertyId].ownerId).length 
              : 0
          }
          ownerColor={
            engine.properties[selectedPropertyId]?.ownerId
              ? engine.players.find(p => p.id === engine.properties[selectedPropertyId].ownerId)?.color
              : undefined
          }
          ownerName={
            engine.properties[selectedPropertyId]?.ownerId
              ? players.find(p => p.id === engine.properties[selectedPropertyId].ownerId)?.name
              : undefined
          }
          currentPlayerId={currentUser!.uid}
          onBuyHouse={() => handleBuyHouse(selectedPropertyId)}
          onSellHouse={() => handleSellHouse(selectedPropertyId)}
          onMortgage={() => {
            const property = engine.properties[selectedPropertyId!];
            if (currentUser?.uid !== property?.ownerId) return;
            engine.mortgageProperty(selectedPropertyId!);
            updateGameState();
          }}
          onUnmortgage={() => {
            const property = engine.properties[selectedPropertyId!];
            if (currentUser?.uid !== property?.ownerId) return;
            engine.unmortgageProperty(selectedPropertyId!);
            updateGameState();
          }}
          onClose={() => setSelectedPropertyId(null)} 
        />
      )}
      {isTradeModalOpen && (
        <TradeModal
          currentPlayer={accountPlayer}
          players={players}
          properties={engine.properties}
          initialTrade={negotiatingTrade || undefined}
          onClose={() => {
            setIsTradeModalOpen(false);
            setNegotiatingTrade(null);
          }}
          onSubmitTrade={(tradeOffer) => {
            if (currentUser?.uid !== currentPlayer.id && currentUser?.uid !== players.find(p => p.id === tradeOffer.targetPlayerId)?.id) {
              // Note: Usually only the active player can initiate, but we can allow any player to initiate a trade
            }
            if (negotiatingTrade) {
              engine.rejectTrade(negotiatingTrade.id);
            }
            engine.createTrade({
              initiatorId: currentUser!.uid,
              targetId: tradeOffer.targetPlayerId,
              offerMoney: tradeOffer.offerMoney,
              requestMoney: tradeOffer.requestMoney,
              offerProperties: tradeOffer.offerProperties,
              requestProperties: tradeOffer.requestProperties,
              offerCards: tradeOffer.offerCards,
              requestCards: tradeOffer.requestCards
            });
            updateGameState();
            setIsTradeModalOpen(false);
            setNegotiatingTrade(null);
          }}
        />
      )}
      {viewingTrade && (
        <TradeDetailsModal
          trade={viewingTrade}
          players={players}
          properties={engine.properties}
          currentPlayerId={currentUser!.uid}
          turnPhase={turnPhase}
          onClose={() => setViewingTrade(null)}
          onAccept={() => {
            if (currentUser?.uid !== viewingTrade.targetId) return;
            const tradedIds = [...viewingTrade.offerProperties, ...viewingTrade.requestProperties];
            setTradedPropertyIds(tradedIds);
            engine.acceptTrade(viewingTrade.id);
            updateGameState();
            setViewingTrade(null);
            setTimeout(() => setTradedPropertyIds([]), 3000);
          }}
          onReject={() => {
            if (currentUser?.uid !== viewingTrade.targetId && currentUser?.uid !== viewingTrade.initiatorId) return;
            engine.rejectTrade(viewingTrade.id);
            updateGameState();
            setViewingTrade(null);
          }}
          onNegotiate={() => {
            setNegotiatingTrade(viewingTrade);
            setViewingTrade(null);
            setIsTradeModalOpen(true);
          }}
        />
      )}
      {engine.currentTormentCard && (
        <TormentCardModal 
          card={engine.currentTormentCard} 
          onAcknowledge={handleAcknowledgeCard}
          isMyTurn={currentUser?.uid === currentPlayer.id}
        />
      )}
      {engine.currentOmenCard && (
        <OmenCardModal 
          card={engine.currentOmenCard} 
          onAcknowledge={handleAcknowledgeCard}
          isMyTurn={currentUser?.uid === currentPlayer.id}
        />
      )}
      {turnPhase === 'GAME_OVER' && (
        <VictoryModal
          winner={engine.players[0] || players[0]}
          onRestart={async () => {
            const code = lobbyCode;
            const uid = currentUser?.uid;

            if (code && uid) {
              const lobbyRef = ref(db, `lobbies/${code}`);
              const playersRef = ref(db, `lobbies/${code}/players`);
              
              const snap = await get(playersRef);
              const playersData = snap.val() || {};
              const remainingUids = Object.keys(playersData);

              // If we are the only one left OR the list is empty somehow
              if (remainingUids.length <= 1) {
                await remove(ref(db, `games/${code}`));
                await remove(lobbyRef);
              } else {
                await remove(ref(db, `lobbies/${code}/players/${uid}`));
              }
            }

            // ONLY clear local state after Firebase operations
            setLobbyCode(null);
            setGameStarted(false);
            setTurnPhase('ROLL');
            localStorage.removeItem('monopoly_lobby_code');
            
            // Definitively clean up for a fresh start
            window.location.reload();
          }}
        />
      )}
      <Footer />
      </div>
    </div>
  );
}
