import { GameEngine } from "../engine/GameEngine";

export interface TormentCard {
  id: string;
  title: string;
  description: string;
  action: (engine: GameEngine, playerId: string) => void;
}

export const tormentCards: TormentCard[] = [
  {
    id: 't1',
    title: 'Return to the Void',
    description: 'The nightmare resets. Advance to Enter the Nightmare. (Collect 300 souls)',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        player.position = 0;
        player.balance += 300;
        console.log(`${player.name} advanced to Enter the Nightmare and collected 300 souls.`);
      }
    }
  },
  {
    id: 't2',
    title: 'The Warden’s Favor',
    description: 'A rusted key found in a pile of bones. This card may be kept until needed or traded to escape The Iron Cage.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        if (!player.getOutOfJailFreeCards) player.getOutOfJailFreeCards = [];
        player.getOutOfJailFreeCards.push('t2');
        console.log(`${player.name} received a Get Out of Jail Free card.`);
      }
    }
  },
  {
    id: 't3',
    title: 'Dragged Below',
    description: 'Skeletal hands pull you into the earth. Go directly to The Iron Cage. Do not pass Enter the Nightmare, do not collect 300 souls.',
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
    id: 't4',
    title: 'Asylum Tuition',
    description: 'The doctors require payment for your "education" in madness. Pay 50 souls.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        engine.checkSolvency(player.id, 50);
        console.log(`${player.name} paid 50 souls for Asylum Tuition.`);
      }
    }
  },
  {
    id: 't5',
    title: 'Fortify the Barricades',
    description: 'The monsters are breaking through; your structures need reinforcement. Pay 40 souls per Gravestone and 115 souls per Mausoleum you own.',
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
        const cost = (houses * 40) + (hotels * 115);
        engine.checkSolvency(player.id, cost);
        console.log(`${player.name} paid ${cost} souls to fortify barricades (${houses} gravestones, ${hotels} mausoleums).`);
      }
    }
  },
  {
    id: 't6',
    title: 'Sanatorium Lobotomy',
    description: 'A forced procedure to "calm your nerves." Pay 100 souls.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        engine.checkSolvency(player.id, 100);
        console.log(`${player.name} paid 100 souls for a Sanatorium Lobotomy.`);
      }
    }
  },
  {
    id: 't7',
    title: 'Plague Doctor’s Visit',
    description: 'He didn’t cure you, but he still expects his silver. Pay 50 souls.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        engine.checkSolvency(player.id, 50);
        console.log(`${player.name} paid 50 souls for a Plague Doctor's Visit.`);
      }
    }
  },
  {
    id: 't8',
    title: 'Occult Investigation',
    description: 'You provided secrets of the void to a local cult. Receive a 25 souls consultancy fee.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        player.balance += 25;
        console.log(`${player.name} received 25 souls for an Occult Investigation.`);
      }
    }
  },
  {
    id: 't9',
    title: 'The Most Beautiful Corpse',
    description: 'You won the pageant at the Morticians\' Ball. Collect 10 souls.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        player.balance += 10;
        console.log(`${player.name} collected 10 souls for being The Most Beautiful Corpse.`);
      }
    }
  },
  {
    id: 't10',
    title: 'Desecrated Grave',
    description: 'You found a treasure chest buried with a fallen nobleman. Collect 200 souls.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        player.balance += 200;
        console.log(`${player.name} collected 200 souls from a Desecrated Grave.`);
      }
    }
  },
  {
    id: 't11',
    title: 'Black Market Organ Trade',
    description: 'You sold a "spare" kidney to a traveling surgeon. From sale of stock, you get 50 souls.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        player.balance += 50;
        console.log(`${player.name} collected 50 souls from the Black Market Organ Trade.`);
      }
    }
  },
  {
    id: 't12',
    title: 'Death Anniversary',
    description: 'It’s the day you died. Every player offers a 10 souls tribute to your ghost.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        let collected = 0;
        engine.players.forEach(p => {
          if (p.id !== playerId) {
            p.balance -= 10;
            collected += 10;
          }
        });
        player.balance += collected;
        console.log(`${player.name} collected ${collected} souls for their Death Anniversary.`);
      }
    }
  },
  {
    id: 't13',
    title: 'Dead Man’s Will',
    description: 'A distant relative was finally claimed by the shadows. You inherit 100 souls.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        player.balance += 100;
        console.log(`${player.name} inherited 100 souls from a Dead Man's Will.`);
      }
    }
  },
  {
    id: 't14',
    title: 'Overpaid Soul Tithe',
    description: 'The demons took more than they were owed. Income tax refund, collect 20 souls.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        player.balance += 20;
        console.log(`${player.name} collected a 20 souls Overpaid Soul Tithe refund.`);
      }
    }
  },
  {
    id: 't15',
    title: 'Death Benefit',
    description: 'Your own death was faked successfully to claim the bounty. Life insurance matures, collect 100 souls.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        player.balance += 100;
        console.log(`${player.name} collected 100 souls Death Benefit.`);
      }
    }
  },
  {
    id: 't16',
    title: 'Pilgrimage Savings',
    description: 'Money set aside for your journey to the Sunken Cathedral. Receive 100 souls.',
    action: (engine, playerId) => {
      const player = engine.players.find(p => p.id === playerId);
      if (player) {
        player.balance += 100;
        console.log(`${player.name} received 100 souls Pilgrimage Savings.`);
      }
    }
  }
];
