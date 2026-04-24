export type SpaceType = 'property' | 'railroad' | 'utility' | 'tax' | 'corner' | 'card';

export interface BoardSpace {
  id: number;
  name: string;
  type: SpaceType;
  price?: number;
  rent?: number[]; // Array of rents based on gravestones/mausoleums, or base rent
  colorGroup?: string;
  houseCost?: number;
}

export const boardData: BoardSpace[] = [
  { id: 0, name: "Enter the Nightmare", type: "corner" }, // Go
  { id: 1, name: "The Overgrown Cemetery", type: "property", price: 60, rent: [2, 10, 30, 90, 160, 250], colorGroup: "brown", houseCost: 50 },
  { id: 2, name: "Torment", type: "card" }, // Community Chest
  { id: 3, name: "Rotting Cellar", type: "property", price: 60, rent: [4, 20, 60, 180, 320, 450], colorGroup: "brown", houseCost: 50 },
  { id: 4, name: "Soul Tithe", type: "tax", price: 200 }, // Income Tax
  { id: 5, name: "The Ghost Train", type: "railroad", price: 200, rent: [25, 50, 100, 200] },
  { id: 6, name: "Abandoned Nursery", type: "property", price: 100, rent: [6, 30, 90, 270, 400, 550], colorGroup: "lightblue", houseCost: 50 },
  { id: 7, name: "Omen", type: "card" }, // Chance
  { id: 8, name: "The Attic of Whispers", type: "property", price: 100, rent: [6, 30, 90, 270, 400, 550], colorGroup: "lightblue", houseCost: 50 },
  { id: 9, name: "Shadow-Stained Hallway", type: "property", price: 120, rent: [8, 40, 100, 300, 450, 600], colorGroup: "lightblue", houseCost: 50 },
  { id: 10, name: "The Iron Cage", type: "corner" }, // Jail
  { id: 11, name: "Blackwood Manor", type: "property", price: 140, rent: [10, 50, 150, 450, 625, 750], colorGroup: "pink", houseCost: 100 },
  { id: 12, name: "The Lightning Rod", type: "utility", price: 150 }, // Electric Company
  { id: 13, name: "The Iron Maiden’s Chamber", type: "property", price: 140, rent: [10, 50, 150, 450, 625, 750], colorGroup: "pink", houseCost: 100 },
  { id: 14, name: "Clocktower of Screams", type: "property", price: 160, rent: [12, 60, 180, 500, 700, 900], colorGroup: "pink", houseCost: 100 },
  { id: 15, name: "The Hearse Carriage", type: "railroad", price: 200, rent: [25, 50, 100, 200] },
  { id: 16, name: "Camp Blood Trail", type: "property", price: 180, rent: [14, 70, 200, 550, 750, 950], colorGroup: "orange", houseCost: 100 },
  { id: 17, name: "Torment", type: "card" }, // Community Chest
  { id: 18, name: "The Boiler Room", type: "property", price: 180, rent: [14, 70, 200, 550, 750, 950], colorGroup: "orange", houseCost: 100 },
  { id: 19, name: "Hickory Lane Butcher Shop", type: "property", price: 200, rent: [16, 80, 220, 600, 800, 1000], colorGroup: "orange", houseCost: 100 },
  { id: 20, name: "Limbo", type: "corner" }, // Free Parking
  { id: 21, name: "The Wicker Clearing", type: "property", price: 220, rent: [18, 90, 250, 700, 875, 1050], colorGroup: "red", houseCost: 150 },
  { id: 22, name: "Omen", type: "card" }, // Chance
  { id: 23, name: "Cursed Cornfield", type: "property", price: 220, rent: [18, 90, 250, 700, 875, 1050], colorGroup: "red", houseCost: 150 },
  { id: 24, name: "Deepwood Shanty", type: "property", price: 240, rent: [20, 100, 300, 750, 925, 1100], colorGroup: "red", houseCost: 150 },
  { id: 25, name: "The Ferryman’s Skiff", type: "railroad", price: 200, rent: [25, 50, 100, 200] },
  { id: 26, name: "Ward 13 Sanitarium", type: "property", price: 260, rent: [22, 110, 330, 800, 975, 1150], colorGroup: "yellow", houseCost: 150 },
  { id: 27, name: "The Morgue Overflow", type: "property", price: 260, rent: [22, 110, 330, 800, 975, 1150], colorGroup: "yellow", houseCost: 150 },
  { id: 28, name: "The Blood Well", type: "utility", price: 150 }, // Water Works
  { id: 29, name: "Solitary Confinement Wing", type: "property", price: 280, rent: [24, 120, 360, 850, 1025, 1200], colorGroup: "yellow", houseCost: 150 },
  { id: 30, name: "Dragged Below", type: "corner" }, // Go to Jail
  { id: 31, name: "The Sunken Cathedral", type: "property", price: 300, rent: [26, 130, 390, 900, 1100, 1275], colorGroup: "green", houseCost: 200 },
  { id: 32, name: "Void-Touched Observatory", type: "property", price: 300, rent: [26, 130, 390, 900, 1100, 1275], colorGroup: "green", houseCost: 200 },
  { id: 33, name: "Torment", type: "card" }, // Community Chest
  { id: 34, name: "Monolith of the Deep", type: "property", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], colorGroup: "green", houseCost: 200 },
  { id: 35, name: "The Phantom Dirigible", type: "railroad", price: 200, rent: [25, 50, 100, 200] },
  { id: 36, name: "Omen", type: "card" }, // Chance
  { id: 37, name: "The Pit of Despair", type: "property", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], colorGroup: "darkblue", houseCost: 200 },
  { id: 38, name: "Blood Sacrifice", type: "tax", price: 100 }, // Luxury Tax
  { id: 39, name: "Satan’s Throneroom", type: "property", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], colorGroup: "darkblue", houseCost: 200 },
];
