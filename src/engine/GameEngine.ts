import { boardData, BoardSpace } from '../data/boardData';
import { tormentCards, TormentCard } from '../data/tormentCards';
import { omenCards, OmenCard } from '../data/omenCards';

export interface Player {
  id: string;
  name: string;
  position: number;
  balance: number;
  inJail: boolean;
  jailTurns: number;
  color: string;
  characterId: number; // 1-10
  getOutOfJailFreeCards?: string[];
}

export interface PropertyState {
  ownerId: string | null;
  houses: number;
  isMortgaged: boolean;
}

export type TurnPhase = 'ROLL' | 'MOVING' | 'JAIL_DECISION' | 'BUY_DECISION' | 'END_TURN' | 'DESPERATION' | 'GAME_OVER';

export interface Debt {
  amount: number;
  creditorId?: string;
  debtorId: string;
}

export interface TradeOffer {
  id: string;
  initiatorId: string;
  targetId: string;
  offerMoney: number;
  requestMoney: number;
  offerProperties: number[];
  requestProperties: number[];
  offerCards?: string[];
  requestCards?: string[];
}

export class GameEngine {
  players: Player[];
  currentPlayerIndex: number;
  doublesCount: number;
  properties: Record<number, PropertyState>;
  turnPhase: TurnPhase;
  pendingPropertyId: number | null;
  pendingMoveSteps: number;
  lastRoll: { die1: number; die2: number; total: number; isDouble: boolean } | null;
  activeTrades: TradeOffer[];
  tormentDeck: TormentCard[];
  currentTormentCard: TormentCard | null;
  omenDeck: OmenCard[];
  currentOmenCard: OmenCard | null;
  debt: Debt | null;
  gameLogs: string[];
  isDiceRolling: boolean;
  turnStartedAt: number;

  constructor(players: Player[]) {
    this.players = players.map((p, index) => ({ 
      ...p, 
      characterId: p.characterId || (index + 1),
      getOutOfJailFreeCards: p.getOutOfJailFreeCards || [] 
    }));
    this.currentPlayerIndex = 0;
    this.doublesCount = 0;
    this.properties = {};
    this.turnPhase = 'ROLL';
    this.pendingPropertyId = null;
    this.pendingMoveSteps = 0;
    this.lastRoll = null;
    this.activeTrades = [];
    this.currentTormentCard = null;
    this.currentOmenCard = null;
    this.debt = null;
    this.gameLogs = [];
    this.isDiceRolling = false;
    this.turnStartedAt = Date.now();
    this.tormentDeck = this.shuffleDeck([...tormentCards]);
    this.omenDeck = this.shuffleDeck([...omenCards]);

    // Initialize properties
    boardData.forEach(space => {
      if (space.type === 'property' || space.type === 'railroad' || space.type === 'utility') {
        this.properties[space.id] = { ownerId: null, houses: 0, isMortgaged: false };
      }
    });
  }

  private log(message: string) {
    this.gameLogs.push(message);
    if (this.gameLogs.length > 50) this.gameLogs.shift();
    console.log(message);
  }

  private shuffleDeck<T>(deck: T[]): T[] {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  }

  drawTormentCard() {
    if (this.tormentDeck.length === 0) {
      this.tormentDeck = this.shuffleDeck([...tormentCards]);
    }
    const card = this.tormentDeck.shift()!;
    this.currentTormentCard = card;
    this.log(`Drew Torment Card: ${card.title}`);
    
    // Execute card action
    card.action(this, this.getCurrentPlayer().id);
    
    // If it's a get out of jail free card, don't put it back in the deck yet
    if (card.id !== 't2') {
      this.tormentDeck.push(card);
    }
  }

  drawOmenCard() {
    if (this.omenDeck.length === 0) {
      this.omenDeck = this.shuffleDeck([...omenCards]);
    }
    const card = this.omenDeck.shift()!;
    this.currentOmenCard = card;
    this.log(`Drew Omen Card: ${card.title}`);
    
    // Execute card action
    card.action(this, this.getCurrentPlayer().id);
    
    // If it's a get out of jail free card, don't put it back in the deck yet
    if (card.id !== 'o14') {
      this.omenDeck.push(card);
    }
  }

  acknowledgeCard() {
    if (this.currentTormentCard) {
      // The action was already executed when drawn, so just clear the card
      this.currentTormentCard = null;
    } else if (this.currentOmenCard) {
      // The action was already executed when drawn, so just clear the card
      this.currentOmenCard = null;
    }
  }

  returnGetOutOfJailFreeCard(cardId: string) {
    if (cardId === 't2') {
      const card = tormentCards.find(c => c.id === 't2');
      if (card) this.tormentDeck.push(card);
    } else if (cardId === 'o14') {
      const card = omenCards.find(c => c.id === 'o14');
      if (card) this.omenDeck.push(card);
    }
  }

  getCurrentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  checkSolvency(playerId: string, amount: number, creditorId?: string): boolean {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return false;

    if (player.balance >= amount) {
      player.balance -= amount;
      if (creditorId) {
        const creditor = this.players.find(p => p.id === creditorId);
        if (creditor) creditor.balance += amount;
      }
      return true;
    } else {
      // Not enough money
      const shortfall = amount - player.balance;
      
      // Pay what they can
      if (creditorId) {
        const creditor = this.players.find(p => p.id === creditorId);
        if (creditor) creditor.balance += player.balance;
      }
      player.balance = 0; // Balance goes to 0, remaining is debt
      
      this.turnPhase = 'DESPERATION';
      this.debt = { amount: shortfall, creditorId, debtorId: playerId };
      this.log(`${player.name} is in debt for ${this.debt.amount} souls and must raise funds!`);
      return false;
    }
  }

  payDebt(playerId: string) {
    if (this.turnPhase !== 'DESPERATION' || !this.debt || this.debt.debtorId !== playerId) return;
    
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;

    if (player.balance >= this.debt.amount) {
      player.balance -= this.debt.amount;
      
      if (this.debt.creditorId) {
        const creditor = this.players.find(p => p.id === this.debt!.creditorId);
        if (creditor) creditor.balance += this.debt.amount;
      }
      
      this.log(`${player.name} raised enough funds to clear their debt.`);
      this.debt = null;
      this.turnPhase = 'END_TURN';
    } else {
      this.log(`${player.name} still does not have enough funds. Current balance: ${player.balance} souls, Debt: ${this.debt.amount} souls`);
    }
  }

  handleElimination(playerId: string) {
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    const player = this.players[playerIndex];
    if (!player) return;

    const isCurrentPlayer = playerIndex === this.currentPlayerIndex;

    if (this.debt && this.debt.debtorId === playerId) {
      const creditorId = this.debt.creditorId;
      const creditor = this.players.find(p => p.id === creditorId);

      // Transfer all properties and keys
      Object.entries(this.properties).forEach(([spaceIdStr, state]) => {
        if (state.ownerId === playerId) {
          if (creditor) {
            state.ownerId = creditor.id;
          } else {
            // Owed to the Void (Bank)
            state.ownerId = null;
            state.houses = 0;
            state.isMortgaged = false;
          }
        }
      });

      if (creditor) {
        creditor.balance += player.balance; // Transfer remaining cash
        if (player.getOutOfJailFreeCards) {
          creditor.getOutOfJailFreeCards = (creditor.getOutOfJailFreeCards || []).concat(player.getOutOfJailFreeCards);
        }
      }
    }

    // Remove player from active players
    this.players = this.players.filter(p => p.id !== playerId);
    this.debt = null;
    
    // Remove any active trades involving this player
    this.activeTrades = this.activeTrades.filter(t => t.initiatorId !== playerId && t.targetId !== playerId);

    this.log(`${player.name}'s Soul Extinguished.`);

    this.checkVictory();

    if (this.turnPhase === 'GAME_OVER') {
      this.currentPlayerIndex = 0;
    } else {
      if (isCurrentPlayer) {
        // It was their turn, so we need to move to the next player
        this.currentPlayerIndex = this.currentPlayerIndex % this.players.length;
        this.turnPhase = 'ROLL';
        this.doublesCount = 0;
        this.lastRoll = null;
      } else if (playerIndex < this.currentPlayerIndex) {
        // A player before the current player was eliminated, so shift index back
        this.currentPlayerIndex--;
      }
    }
  }

  checkVictory() {
    if (this.players.length <= 1) {
      this.turnPhase = 'GAME_OVER';
      if (this.players.length === 1) {
        this.log(`The Void has chosen its Master: ${this.players[0].name}`);
      } else {
        this.log(`All souls have been extinguished.`);
      }
    }
  }

  createTrade(offer: Omit<TradeOffer, 'id'>) {
    if (this.turnPhase === 'DESPERATION') {
      this.log(`Cannot create trades while a player is in debt.`);
      return;
    }
    
    // Check for improvements
    const allProps = [...offer.offerProperties, ...offer.requestProperties];
    if (allProps.some(pid => this.properties[pid].houses > 0)) {
      this.log(`Cannot trade properties with improvements (gravestones/mausoleums).`);
      return;
    }
    const newTrade: TradeOffer = {
      ...offer,
      id: Math.random().toString(36).substring(2, 9)
    };
    this.activeTrades.push(newTrade);
    this.log(`${this.players.find(p => p.id === offer.initiatorId)?.name} proposed a trade to ${this.players.find(p => p.id === offer.targetId)?.name}`);
  }

  acceptTrade(tradeId: string) {
    if (this.turnPhase === 'DESPERATION') {
      this.log(`Cannot accept trades while a player is in debt.`);
      return;
    }
    const tradeIndex = this.activeTrades.findIndex(t => t.id === tradeId);
    if (tradeIndex === -1) return;
    const trade = this.activeTrades[tradeIndex];

    // Check for improvements (in case they were built after proposal)
    const allProps = [...trade.offerProperties, ...trade.requestProperties];
    if (allProps.some(pid => this.properties[pid].houses > 0)) {
      this.log(`Cannot accept trade: some properties now have improvements.`);
      this.activeTrades.splice(tradeIndex, 1);
      return;
    }

    const initiator = this.players.find(p => p.id === trade.initiatorId);
    const target = this.players.find(p => p.id === trade.targetId);

    if (!initiator || !target) return;

    if (initiator.balance < trade.offerMoney) {
      this.log(`Trade failed: ${initiator.name} does not have enough money.`);
      return;
    }
    if (target.balance < trade.requestMoney) {
      this.log(`Trade failed: ${target.name} does not have enough money.`);
      return;
    }

    // Process money
    initiator.balance = initiator.balance - trade.offerMoney + trade.requestMoney;
    target.balance = target.balance - trade.requestMoney + trade.offerMoney;

    // Process properties
    trade.offerProperties.forEach(propId => {
      if (this.properties[propId]) this.properties[propId].ownerId = target.id;
    });
    trade.requestProperties.forEach(propId => {
      if (this.properties[propId]) this.properties[propId].ownerId = initiator.id;
    });

    // Process Cards - FIX: Transfer Skeleton Keys (Get Out of Jail Free)
    if (trade.offerCards && trade.offerCards.length > 0) {
      trade.offerCards.forEach(cardId => {
        const cardIndex = initiator.getOutOfJailFreeCards?.indexOf(cardId);
        if (cardIndex !== undefined && cardIndex > -1) {
          initiator.getOutOfJailFreeCards?.splice(cardIndex, 1);
          if (!target.getOutOfJailFreeCards) target.getOutOfJailFreeCards = [];
          target.getOutOfJailFreeCards.push(cardId);
        }
      });
    }
    if (trade.requestCards && trade.requestCards.length > 0) {
      trade.requestCards.forEach(cardId => {
        const cardIndex = target.getOutOfJailFreeCards?.indexOf(cardId);
        if (cardIndex !== undefined && cardIndex > -1) {
          target.getOutOfJailFreeCards?.splice(cardIndex, 1);
          if (!initiator.getOutOfJailFreeCards) initiator.getOutOfJailFreeCards = [];
          initiator.getOutOfJailFreeCards.push(cardId);
        }
      });
    }


    this.log(`${target.name} accepted the trade from ${initiator.name}!`);
    this.activeTrades.splice(tradeIndex, 1);
  }

  rejectTrade(tradeId: string) {
    const tradeIndex = this.activeTrades.findIndex(t => t.id === tradeId);
    if (tradeIndex === -1) return;
    const trade = this.activeTrades[tradeIndex];
    const target = this.players.find(p => p.id === trade.targetId);

    this.log(`${target?.name} rejected the trade.`);
    this.activeTrades.splice(tradeIndex, 1);
  }

  startTurn() {
    this.turnStartedAt = Date.now();
    const player = this.getCurrentPlayer();
    if (player.inJail) {
      this.turnPhase = 'JAIL_DECISION';
    } else {
      this.turnPhase = 'ROLL';
    }
  }

  payJailFine() {
    const player = this.getCurrentPlayer();
    if (this.turnPhase !== 'JAIL_DECISION' || !player.inJail) return;

    if (player.balance >= 50) {
      this.checkSolvency(player.id, 50);
      player.inJail = false;
      player.jailTurns = 0;
      this.log(`${player.name} paid 50 souls to escape The Iron Cage.`);
      this.turnPhase = 'ROLL';
    } else {
      this.log(`${player.name} cannot afford the 50 souls fine.`);
    }
  }

  useGetOutOfJailFreeCard() {
    const player = this.getCurrentPlayer();
    if (this.turnPhase !== 'JAIL_DECISION' || !player.inJail) return;

    if (player.getOutOfJailFreeCards && player.getOutOfJailFreeCards.length > 0) {
      const remainingCards = [...player.getOutOfJailFreeCards];
      const cardId = remainingCards.shift()!;
      player.getOutOfJailFreeCards = remainingCards;
      player.inJail = false;
      player.jailTurns = 0;
      this.returnGetOutOfJailFreeCard(cardId);
      this.log(`${player.name} used a Get Out of Jail Free card to escape The Iron Cage.`);
      this.turnPhase = 'ROLL';
    }
  }

  rollDice(forcedRoll?: { die1: number; die2: number; total: number; isDouble: boolean }) {
    const player = this.getCurrentPlayer();
    
    let die1 = Math.floor(Math.random() * 6) + 1;
    let die2 = Math.floor(Math.random() * 6) + 1;
    
    let roll = forcedRoll || {
      die1,
      die2,
      total: die1 + die2,
      isDouble: die1 === die2
    };

    this.lastRoll = roll;
    this.log(`${player.name} rolled ${roll.die1} and ${roll.die2} (${roll.total}).`);

    if (this.turnPhase === 'JAIL_DECISION') {
      if (roll.isDouble) {
        this.log(`${player.name} rolled doubles and escaped The Iron Cage!`);
        player.inJail = false;
        player.jailTurns = 0;
        this.initiateMove(player, roll.total);
      } else {
        player.jailTurns++;
        this.log(`${player.name} did not roll doubles. (Turn ${player.jailTurns} in jail)`);
        if (player.jailTurns >= 3) {
          this.log(`${player.name} must pay 50 souls to escape next turn, or is forced to pay now.`);
          this.checkSolvency(player.id, 50);
          player.inJail = false;
          player.jailTurns = 0;
          this.initiateMove(player, roll.total);
        } else {
          this.turnPhase = 'END_TURN';
        }
      }
      return roll;
    }

    if (this.turnPhase !== 'ROLL') return roll;

    if (roll.isDouble) {
      this.doublesCount++;
      if (this.doublesCount === 3) {
        this.log(`${player.name} rolled 3 doubles! Dragged Below!`);
        this.goToJail(player);
        this.doublesCount = 0;
        this.turnPhase = 'END_TURN';
        return roll;
      }
    } else {
      this.doublesCount = 0;
    }

    this.initiateMove(player, roll.total);
    return roll;
  }

  initiateMove(player: Player, steps: number) {
    if (steps === 0) {
      this.handleLanding(player);
      return;
    }
    this.pendingMoveSteps = steps;
    this.turnPhase = 'MOVING';
  }

  stepMove() {
    if (this.turnPhase !== 'MOVING' || this.pendingMoveSteps <= 0) return;
    
    const player = this.getCurrentPlayer();
    player.position = (player.position + 1) % 40;
    this.pendingMoveSteps--;

    if (player.position === 0) {
      player.balance += 300;
      this.log(`${player.name} passed or landed on Enter the Nightmare and collected 300 souls.`);
    }

    if (this.pendingMoveSteps === 0) {
      this.handleLanding(player);
    }
  }

  goToJail(player: Player) {
    player.position = 10;
    player.inJail = true;
    player.jailTurns = 0;
    this.log(`${player.name} was Dragged Below!`);
  }

  calculateTotalWorth(playerId: string): number {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return 0;

    let worth = player.balance;

    Object.entries(this.properties).forEach(([spaceIdStr, state]) => {
      if (state.ownerId === playerId) {
        const space = boardData[parseInt(spaceIdStr)];
        if (space) {
          // Add property value (mortgaged properties are worth half)
          const propertyValue = state.isMortgaged ? (space.price || 0) / 2 : (space.price || 0);
          worth += propertyValue;

          // Add houses value
          if (state.houses > 0 && space.houseCost) {
            worth += state.houses * space.houseCost;
          }
        }
      }
    });

    return worth;
  }

  handleLanding(player: Player) {
    const space = boardData[player.position];
    this.log(`${player.name} landed on ${space.name}.`);

    switch (space.type) {
      case 'property':
      case 'railroad':
      case 'utility':
        this.handlePropertyLanding(player, space);
        break;
      case 'tax':
        if (space.id === 4) { // Income Tax / Soul Tithe
          const totalWorth = this.calculateTotalWorth(player.id);
          const taxAmount = Math.floor(totalWorth * 0.1);
          this.checkSolvency(player.id, taxAmount);
          this.log(`${player.name} paid 10% of their total worth (${taxAmount} souls) for ${space.name}.`);
        } else {
          this.checkSolvency(player.id, space.price || 0);
          this.log(`${player.name} paid ${space.price} souls for ${space.name}.`);
        }
        if (this.turnPhase !== 'DESPERATION') this.turnPhase = 'END_TURN';
        break;
      case 'card':
        this.turnPhase = 'END_TURN';
        if (space.name === 'Torment') {
          this.drawTormentCard();
        } else if (space.name === 'Omen') {
          this.drawOmenCard();
        } else {
          this.log(`${player.name} drew a ${space.name} card.`);
        }
        break;
      case 'corner':
        this.turnPhase = 'END_TURN';
        if (space.id === 30) { // Go To Jail
          this.goToJail(player);
        }
        break;
      default:
        this.turnPhase = 'END_TURN';
        break;
    }
  }

  handlePropertyLanding(player: Player, space: BoardSpace) {
    const property = this.properties[space.id];
    
    if (!property.ownerId) {
      this.turnPhase = 'BUY_DECISION';
      this.pendingPropertyId = space.id;
    } else if (property.ownerId !== player.id && !property.isMortgaged) {
      // Pay rent
      const owner = this.players.find(p => p.id === property.ownerId);
      if (owner) {
        const rentAmount = this.calculateRent(space, property, this.lastRoll?.total || 0);
        this.checkSolvency(player.id, rentAmount, owner.id);
        this.log(`${player.name} paid ${rentAmount} souls rent to ${owner.name}.`);
      }
      if (this.turnPhase !== 'DESPERATION') this.turnPhase = 'END_TURN';
    } else {
      this.turnPhase = 'END_TURN';
    }
  }

  handleRailroadLandingTwiceTribute(player: Player, space: BoardSpace) {
    const property = this.properties[space.id];
    
    if (!property.ownerId) {
      this.turnPhase = 'BUY_DECISION';
      this.pendingPropertyId = space.id;
    } else if (property.ownerId !== player.id && !property.isMortgaged) {
      // Pay twice the rent
      const owner = this.players.find(p => p.id === property.ownerId);
      if (owner) {
        const rentAmount = this.calculateRent(space, property, this.lastRoll?.total || 0) * 2;
        this.checkSolvency(player.id, rentAmount, owner.id);
        this.log(`${player.name} paid ${rentAmount} souls (twice the tribute) to ${owner.name}.`);
      }
      if (this.turnPhase !== 'DESPERATION') this.turnPhase = 'END_TURN';
    } else {
      this.turnPhase = 'END_TURN';
    }
  }

  calculateRent(space: BoardSpace, property: PropertyState, diceTotal: number): number {
    if (!space.rent) return 0;
    
    if (space.type === 'property') {
      if (property.houses === 0) {
        // Check for monopoly (all properties of same color owned by same player)
        const sameColorSpaces = boardData.filter(s => s.colorGroup === space.colorGroup);
        const ownsAll = sameColorSpaces.every(s => this.properties[s.id]?.ownerId === property.ownerId);
        return ownsAll ? space.rent[0] * 2 : space.rent[0];
      }
      return space.rent[property.houses];
    } 
    
    if (space.type === 'railroad') {
      const ownedRailroads = boardData.filter(s => s.type === 'railroad' && this.properties[s.id]?.ownerId === property.ownerId).length;
      return space.rent[ownedRailroads - 1] || space.rent[0];
    }
    
    if (space.type === 'utility') {
      const ownedUtilities = boardData.filter(s => s.type === 'utility' && this.properties[s.id]?.ownerId === property.ownerId).length;
      const multiplier = ownedUtilities === 2 ? 10 : 4;
      return diceTotal * multiplier;
    }

    return 0;
  }

  buyProperty() {
    if (this.turnPhase !== 'BUY_DECISION' || this.pendingPropertyId === null) return;
    
    const player = this.getCurrentPlayer();
    const space = boardData[this.pendingPropertyId];
    
    if (space.price && player.balance >= space.price) {
      player.balance -= space.price;
      this.properties[this.pendingPropertyId].ownerId = player.id;
      this.log(`${player.name} bought ${space.name} for ${space.price} souls.`);
    } else {
      this.log(`${player.name} cannot afford ${space.name}.`);
    }
    
    this.pendingPropertyId = null;
    this.turnPhase = 'END_TURN';
  }

  skipBuyProperty() {
    if (this.turnPhase !== 'BUY_DECISION') return;
    this.log(`${this.getCurrentPlayer().name} chose not to buy ${boardData[this.pendingPropertyId!].name}.`);
    this.pendingPropertyId = null;
    this.turnPhase = 'END_TURN';
  }

  ownsMonopoly(colorGroup: string, ownerId: string): boolean {
    const sameColorSpaces = boardData.filter(s => s.colorGroup === colorGroup);
    return sameColorSpaces.every(s => this.properties[s.id]?.ownerId === ownerId);
  }

  canBuyHouse(propertyId: number, playerId: string): boolean {
    const space = boardData[propertyId];
    const property = this.properties[propertyId];
    const player = this.players.find(p => p.id === playerId);
    
    if (!space || !property || !player || space.type !== 'property' || !space.colorGroup) return false;
    if (property.ownerId !== playerId) return false;
    // Cannot build if mortgaged
    if (property.isMortgaged) return false;
    // House rule: Only build during your turn
    if (playerId !== this.getCurrentPlayer().id) return false;
    if (!this.ownsMonopoly(space.colorGroup, playerId)) return false;
    if (property.houses >= 5) return false;
    if (player.balance < (space.houseCost || 0)) return false;

    // Even build rule
    const sameColorSpaces = boardData.filter(s => s.colorGroup === space.colorGroup);
    const minHouses = Math.min(...sameColorSpaces.map(s => this.properties[s.id]?.houses || 0));
    
    return property.houses === minHouses;
  }

  canSellHouse(propertyId: number, playerId: string): boolean {
    const space = boardData[propertyId];
    const property = this.properties[propertyId];
    
    if (!space || !property || space.type !== 'property' || !space.colorGroup) return false;
    if (property.ownerId !== playerId) return false;
    // Cannot sell if mortgaged
    if (property.isMortgaged) return false;
    // House rule: Only sell during your turn
    if (playerId !== this.getCurrentPlayer().id) return false;
    if (property.houses <= 0) return false;

    // Even sell rule
    const sameColorSpaces = boardData.filter(s => s.colorGroup === space.colorGroup);
    const maxHouses = Math.max(...sameColorSpaces.map(s => this.properties[s.id]?.houses || 0));
    
    return property.houses === maxHouses;
  }

  buyHouse(propertyId: number) {
    const space = boardData[propertyId];
    const property = this.properties[propertyId];
    const player = this.players.find(p => p.id === property.ownerId);

    if (!space || !property || !player || space.type !== 'property' || !space.houseCost) return;
    
    if (!this.canBuyHouse(propertyId, player.id)) {
      this.log(`${player.name} cannot buy a gravestone on ${space.name} due to even build rules, missing monopoly, or insufficient funds.`);
      return;
    }

    player.balance -= space.houseCost;
    property.houses += 1;
    this.log(`${player.name} bought a ${property.houses === 5 ? 'mausoleum' : 'gravestone'} on ${space.name} for ${space.houseCost} souls.`);
  }

  sellHouse(propertyId: number) {
    const space = boardData[propertyId];
    const property = this.properties[propertyId];
    const player = this.players.find(p => p.id === property.ownerId);

    if (!space || !property || !player || space.type !== 'property' || !space.houseCost) return;

    if (!this.canSellHouse(propertyId, player.id)) {
      this.log(`${player.name} cannot sell a gravestone on ${space.name} due to even build rules.`);
      return;
    }

    property.houses -= 1;
    const refund = space.houseCost / 2;
    player.balance += refund;
    this.log(`${player.name} sold a gravestone on ${space.name} for ${refund} souls.`);
  }

  canMortgage(propertyId: number, playerId: string): boolean {
    const property = this.properties[propertyId];
    const space = boardData[propertyId];
    
    if (!property || !space) return false;
    if (property.ownerId !== playerId) return false;
    if (property.isMortgaged) return false;
    
    // Cannot mortgage if there are gravestones on any property in the color group
    if (space.type === 'property' && space.colorGroup) {
      const sameColorSpaces = boardData.filter(s => s.colorGroup === space.colorGroup);
      const hasHouses = sameColorSpaces.some(s => (this.properties[s.id]?.houses || 0) > 0);
      if (hasHouses) return false;
    }
    
    return true;
  }

  mortgageProperty(propertyId: number) {
    const property = this.properties[propertyId];
    const space = boardData[propertyId];
    const player = this.players.find(p => p.id === property.ownerId);

    if (!property || !space || !player) return;

    if (!this.canMortgage(propertyId, player.id)) {
      this.log(`${player.name} cannot mortgage ${space.name}. Gravestones must be sold first.`);
      return;
    }

    property.isMortgaged = true;
    const mortgageValue = Math.floor((space.price || 0) / 2);
    player.balance += mortgageValue;
    this.log(`${player.name} mortgaged ${space.name} for ${mortgageValue} souls.`);
  }

  canUnmortgage(propertyId: number, playerId: string): boolean {
    const property = this.properties[propertyId];
    const space = boardData[propertyId];
    const player = this.players.find(p => p.id === playerId);
    
    if (!property || !space || !player) return false;
    if (property.ownerId !== playerId) return false;
    if (!property.isMortgaged) return false;
    
    const unmortgageCost = Math.ceil((space.price || 0) / 2 * 1.1); // 10% interest
    if (player.balance < unmortgageCost) return false;
    
    return true;
  }

  unmortgageProperty(propertyId: number) {
    const property = this.properties[propertyId];
    const space = boardData[propertyId];
    const player = this.players.find(p => p.id === property.ownerId);

    if (!property || !space || !player) return;

    if (!this.canUnmortgage(propertyId, player.id)) {
      this.log(`${player.name} cannot afford to unmortgage ${space.name}.`);
      return;
    }

    const unmortgageCost = Math.ceil((space.price || 0) / 2 * 1.1);
    player.balance -= unmortgageCost;
    property.isMortgaged = false;
    console.log(`${player.name} unmortgaged ${space.name} for ${unmortgageCost} souls.`);
  }

  endTurn() {
    if (this.turnPhase !== 'END_TURN') return;

    if (this.lastRoll?.isDouble && this.doublesCount > 0 && !this.getCurrentPlayer().inJail) {
      console.log(`${this.getCurrentPlayer().name} gets to roll again!`);
      this.turnPhase = 'ROLL';
    } else {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      this.doublesCount = 0;
      this.startTurn();
    }
  }

  exportState() {
    return {
      players: this.players,
      currentPlayerIndex: this.currentPlayerIndex,
      doublesCount: this.doublesCount,
      properties: this.properties,
      turnPhase: this.turnPhase,
      pendingPropertyId: this.pendingPropertyId,
      pendingMoveSteps: this.pendingMoveSteps,
      lastRoll: this.lastRoll,
      activeTrades: this.activeTrades,
      tormentDeck: this.tormentDeck.map(c => c.id),
      omenDeck: this.omenDeck.map(c => c.id),
      currentTormentCardId: this.currentTormentCard?.id || null,
      currentOmenCardId: this.currentOmenCard?.id || null,
      debt: this.debt,
      gameLogs: this.gameLogs,
      isDiceRolling: this.isDiceRolling,
      turnStartedAt: this.turnStartedAt
    };
  }

  importState(state: any) {
    if (!state) return;
    this.players = (state.players || this.players).map((p: Player) => ({
      ...p,
      getOutOfJailFreeCards: p.getOutOfJailFreeCards || []
    }));
    this.currentPlayerIndex = state.currentPlayerIndex ?? this.currentPlayerIndex;
    this.doublesCount = state.doublesCount ?? this.doublesCount;
    this.properties = state.properties || this.properties;
    this.turnPhase = state.turnPhase || this.turnPhase;
    this.pendingPropertyId = state.pendingPropertyId !== undefined ? state.pendingPropertyId : this.pendingPropertyId;
    this.pendingMoveSteps = state.pendingMoveSteps ?? this.pendingMoveSteps;
    this.isDiceRolling = state.isDiceRolling || false;
    this.lastRoll = state.lastRoll || this.lastRoll;
    this.activeTrades = (state.activeTrades || []).map((t: any) => ({
      ...t,
      offerMoney: t.offerMoney || 0,
      requestMoney: t.requestMoney || 0,
      offerProperties: t.offerProperties || [],
      requestProperties: t.requestProperties || [],
    }));
    this.debt = state.debt || null;
    this.gameLogs = state.gameLogs || [];
    this.turnStartedAt = state.turnStartedAt || Date.now();

    // Reconstruct decks from IDs
    if (state.tormentDeck) {
      this.tormentDeck = state.tormentDeck.map((id: string) => tormentCards.find(c => c.id === id)!);
    }
    if (state.omenDeck) {
      this.omenDeck = state.omenDeck.map((id: string) => omenCards.find(c => c.id === id)!);
    }
    
    this.currentTormentCard = state.currentTormentCardId ? tormentCards.find(c => c.id === state.currentTormentCardId)! : null;
    this.currentOmenCard = state.currentOmenCardId ? omenCards.find(c => c.id === state.currentOmenCardId)! : null;
  }
}
