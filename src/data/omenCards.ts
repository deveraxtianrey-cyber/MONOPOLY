import { GameEngine } from "../engine/GameEngine";
import { boardData } from "./boardData";

export interface OmenCard {
  id: string;
  title: string;
  description: string;
  action: (engine: GameEngine, playerId: string) => void;
}

export const omenCards: OmenCard[] = [
  {
    id: 'o1',
    title: 'Lured by the Light',
    description: 'A flickering lantern guides you through the trees. Advance to Deepwood Shanty. (If you pass Enter the Nightmare, collect 300 souls).',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        if (player.position > 24) {
          player.balance += 300;
          console.log(`${player.name} passed Enter the Nightmare and collected 300 souls.`);
        }
        player.position = 24;
        engine.handleLanding(player);
      }
    }
  },
  {
    id: 'o2',
    title: 'The Loop of Madness',
    description: 'The fog clears only to reveal the beginning of your descent. Return to Enter the Nightmare. (Collect 300 souls).',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        player.position = 0;
        player.balance += 300;
        console.log(`${player.name} returned to Enter the Nightmare and collected 300 souls.`);
      }
    }
  },
  {
    id: 'o3',
    title: 'The Screaming Whistle',
    description: 'A spectral horn echoes through the mist. Advance to the nearest Transport System. If unowned, you may claim it from the Void. If owned, pay the owner twice the tribute they are otherwise entitled to.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        let target = 5;
        if (player.position > 5 && player.position <= 15) target = 15;
        else if (player.position > 15 && player.position <= 25) target = 25;
        else if (player.position > 25 && player.position <= 35) target = 35;
        
        if (player.position > 35) {
          player.balance += 300;
          console.log(`${player.name} passed Enter the Nightmare and collected 300 souls.`);
        }
        
        player.position = target;
        engine.handleRailroadLandingTwiceTribute(player, boardData[target]);
      }
    }
  },
  {
    id: 'o4',
    title: 'The Screaming Whistle',
    description: 'A spectral horn echoes through the mist. Advance to the nearest Transport System. If unowned, you may claim it from the Void. If owned, pay the owner twice the tribute they are otherwise entitled to.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        let target = 5;
        if (player.position > 5 && player.position <= 15) target = 15;
        else if (player.position > 15 && player.position <= 25) target = 25;
        else if (player.position > 25 && player.position <= 35) target = 35;
        
        if (player.position > 35) {
          player.balance += 300;
          console.log(`${player.name} passed Enter the Nightmare and collected 300 souls.`);
        }
        
        player.position = target;
        engine.handleRailroadLandingTwiceTribute(player, boardData[target]);
      }
    }
  },
  {
    id: 'o5',
    title: 'The Darkest Invitation',
    description: 'You are summoned by the ultimate evil. Advance to Satan’s Throneroom.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        player.position = 39;
        engine.handleLanding(player);
      }
    }
  },
  {
    id: 'o6',
    title: 'Temporal Distortion',
    description: 'The ground swallows your footsteps and spits you out in the past. Wander back three spaces.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        player.position -= 3;
        if (player.position < 0) player.position += 40;
        engine.handleLanding(player);
      }
    }
  },
  {
    id: 'o7',
    title: 'Blind Panic',
    description: 'You ran blindly from a shadow and dropped your coin purse. Pay a 15 souls fine.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        engine.checkSolvency(player.id, 15);
        console.log(`${player.name} paid a 15 souls fine for Blind Panic.`);
      }
    }
  },
  {
    id: 'o8',
    title: 'Chosen Sacrifice',
    description: 'You have been elected High Priest of the Coven. Pay each player 50 souls to maintain your influence.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        let paid = 0;
        engine.players.forEach(p => {
          if (p.id !== playerId) {
            p.balance += 50;
            paid += 50;
          }
        });
        engine.checkSolvency(player.id, paid);
        console.log(`${player.name} paid ${paid} souls as the Chosen Sacrifice.`);
      }
    }
  },
  {
    id: 'o9',
    title: 'Dragged Below',
    description: 'A cold hand grabs your ankle and pulls you into the abyss. Go directly to The Iron Cage. Do not pass Enter the Nightmare, do not collect 300 souls.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        player.position = 10;
        player.inJail = true;
        player.jailTurns = 0;
        engine.turnPhase = 'END_TURN';
        console.log(`${player.name} was dragged below to The Iron Cage!`);
      }
    }
  },
  {
    id: 'o10',
    title: 'The Midnight Express',
    description: 'Mist surrounds you as you board The Ghost Train. If you pass Enter the Nightmare, collect 300 souls.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        if (player.position > 5) {
          player.balance += 300;
          console.log(`${player.name} passed Enter the Nightmare and collected 300 souls.`);
        }
        player.position = 5;
        engine.handleLanding(player);
      }
    }
  },
  {
    id: 'o11',
    title: 'Exorcism Costs',
    description: 'The walls are bleeding and the floors are rotting. You must perform a cleansing ritual on all your structures. For each Gravestone, pay 25 souls. For each Mausoleum, pay 100 souls.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        let houses = 0;
        let hotels = 0;
        Object.values(engine.properties).forEach(prop => {
          if (prop.ownerId === playerId) {
            if (prop.houses === 5) hotels++;
            else houses += prop.houses;
          }
        });
        const cost = (houses * 25) + (hotels * 100);
        engine.checkSolvency(player.id, cost);
        console.log(`${player.name} paid ${cost} souls for Exorcism Costs (${houses} gravestones, ${hotels} mausoleums).`);
      }
    }
  },
  {
    id: 'o12',
    title: 'Ritual Offerings',
    description: 'You found a pouch of silver hidden in a hollowed-out tree. Collect 50 souls.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        player.balance += 50;
        console.log(`${player.name} collected 50 souls from Ritual Offerings.`);
      }
    }
  },
  {
    id: 'o13',
    title: 'Blood Pact Fulfilled',
    description: 'Your dark bargain has finally paid off. Collect 150 souls.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        player.balance += 150;
        console.log(`${player.name} collected 150 souls from Blood Pact Fulfilled.`);
      }
    }
  },
  {
    id: 'o14',
    title: 'The Skeleton Key',
    description: 'A ghostly whisper reveals a secret passage out of the depths. This card may be kept in your property log until needed or traded to escape The Iron Cage.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        if (!player.getOutOfJailFreeCards) player.getOutOfJailFreeCards = [];
        player.getOutOfJailFreeCards.push('o14');
        console.log(`${player.name} received The Skeleton Key (Get Out of Jail Free).`);
      }
    }
  }
];
