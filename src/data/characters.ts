export interface Character {
  id: number;
  name: string;
  color: string; // Default tailwind color class
  description: string;
}

export const characters: Character[] = [
  { id: 1, name: "Mummy", color: "bg-amber-600", description: "Bound by ancient bandages and eternal hunger." },
  { id: 2, name: "Vampire", color: "bg-rose-600", description: "A noble of the night, seeking the essence of life." },
  { id: 3, name: "Skeleton", color: "bg-neutral-100", description: "Rattling bones and a hollow laughter from the grave." },
  { id: 4, name: "Cursed Doll", color: "bg-pink-500", description: "A toy possessed by a soul that never learned to play fair." },
  { id: 5, name: "Witch", color: "bg-purple-600", description: "Brewing schemes and weaving dark threads of fate." },
  { id: 6, name: "Walker Remus", color: "bg-emerald-400", description: "A restless spirit wandering the misty outskirts." },
  { id: 7, name: "Silent Slasher", color: "bg-cyan-400", description: "The shadow in the hallway, unseen until it's too late." },
  { id: 8, name: "Dorian’s Regret", color: "bg-indigo-600", description: "A reflection of beauty turned into a masterpiece of horror." },
  { id: 9, name: "Haywire Jack", color: "bg-orange-600", description: "The pumpkin-headed harbinger of the final harvest." },
  { id: 10, name: "Jeeves the Jinxed", color: "bg-blue-400", description: "An eternal servant, cursed to wait on the void." }
];
