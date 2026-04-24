# MONSTROPOLY: THE OFFICIAL RITUAL MANUAL
**Version 1.0 | Technical & Operational Guidelines**

---

## 1. Introduction

### About this Manual
This document serves as the definitive guide for both the ritualists (players) and the architects (developers) of **Monstropoly**. It provides the technical framework, operational protocols, and the ancient laws governing the digital manifestation of this gothic horror board game. Whether you are seeking to survive the night or to understand the pulse of the engine, this manual is your primary source of truth.

### Scope of this Manual
The contents herein detail the hardware prerequisites for a stable manifestation, the software architecture sustaining the void, the core gameplay mechanics (the Ritual Laws), and a comprehensive breakdown of the user interface. It is designed to ensure a seamless transition between the mundane world and the dark corridors of the Monstropoly board.

---

## 2. About the Game

**Monstropoly** is a visceral reimagining of the classic property-trading formula, transposed into a realm of gothic terror and ritualistic desperation. Unlike a standard board game where wealth is merely currency, in Monstropoly, every transaction is a pact made in blood, and every property is a focal point for spectral energy. Players take on the roles of Ritualists competing to manifest their dominance over a haunted landscape, seeking to bankrupt their rivals’ souls and become the sole master of the void.

The game differs from traditional board games through its atmosphere of constant threat and strategic limitation. Properties are not merely "lands" but sites of desecration and manifestation. Ritualists must manage their "Souls" (currency) with precision, as the cost of failure is not just financial ruin, but eternal imprisonment within the **Pit of Despair**. With mechanic synchronization via Firebase and a visual aesthetic defined by blood, smoke, and shadow, Monstropoly is a living ritual that demands both cunning and a high tolerance for dread.

---

## 3. Development

### Hardware Specifications
To sustain a stable connection to the ritual void, the following hardware setup is recommended:
*   **Processor**: 2.4 GHz Quad-Core or higher (capable of handling concurrent Firebase sync operations).
*   **Memory**: 8GB RAM minimum to ensure smooth animation of blood effects and smoke layers.
*   **Graphics**: Integrated or Dedicated GPU capable of rendering high-resolution parchment textures and pulsing spectral auras.
*   **Connectivity**: Stable high-speed internet (low latency is critical for turn-based state synchronization).

### Software Setup
The architecture of Monstropoly is built upon a modern, reactive stack designed for real-time ritualistic interaction:

*   **Antigravity**: The core engine orchestrator. Antigravity manages the "physics of the void"—handling the deterministic dice logic, player movement collision with board boundaries, and the enforcement of the Ritual Laws (game logic).
*   **Google AI Studio & Gemini**: Gemini serves as the "Master of Ceremonies," dynamically generating the flavor text for **Torment** and **Omen** cards to ensure no two descents into the void are identical. It governs the procedural descriptions of player actions in the Game Logs.
*   **Figma**: The primary forge for the visual manifestation. Every pixel-art sprite, parchment modal, and blood-splatter overlay was prototyped within Figma to ensure a cohesive, premium gothic aesthetic.
*   **Firebase Realtime Database**: The ley lines of the game, providing sub-second state synchronization across all ritualists in a lobby.

---

## 4. Key Features

*   **Initiative Manifestation**: A unique turn-based law ensuring that the construction of **Gravestones** and **Mausoleums** can only occur during the active Ritualist's turn, adding a critical layer of strategic timing.
*   **Desecration & Purity (Mortgage)**: A strict property management system where any property in a color group that is mortgaged (desecrated) immediately locks all building manifestations. Unmortgaging requires a 10% soul interest ritual.
*   **The Skeleton Key Artifact**: A deterministic resource that allows for an immediate escape from the **Pit of Despair**. This artifact exists as a tradable asset that can be bartered or saved for moments of true desperation.
*   **Even Build Enforcement**: The void demands balance; ritualists must build manifestations across their entire color monopoly evenly, ensuring no single haunt becomes too powerful without its neighbors.
*   **Diplomatic Soul Pacts (Trading)**: A real-time negotiation system allowing ritualists to exchange properties, Souls, and artifacts. This mechanic is essential for completing color monopolies and ensuring survival through dark alliances.
*   **Real-Time State Synchronization**: Every soul transaction, movement, and ritual action is mirrored to all players in sub-second intervals via the Firebase ley lines, regardless of their location in the mortal world.
*   **Automated Ethereal Cleanup**: To keep the void organized, any stagnant "Waiting" lobbies older than one hour are automatically purged, ensuring only active pacts remain in the database.

---

## 5. Game Mechanics (How to Play)

Even if you have never stepped into the void before, the rules of the ritual are easy to follow if you listen closely. Think of it like a spooky adventure where you want to collect as many "Souls" as possible!

### How a Turn Works (The Core Loop)
When it is your turn, you are the master of the ritual. Follow these three simple steps:
1.  **Roll the Bone Dice**: Click the "Roll" button. Two dice will spin and land on numbers. Your character will then hop forward that many spaces on the board.
2.  **Look Where You Landed**: 
    *   **Empty Haunt**: If no one owns the space, you can buy it with your "Souls"! This makes it your property.
    *   **A Rival’s Haunt**: If another player already owns the space, you must pay them a "Soul Toll." It’s like a spooky tax for walking on their land!
    *   **Torment or Omen**: These are mystery spaces. You will draw a card that might give you extra Souls, move you to a new place, or even send you to the Pit!
3.  **End Your Ritual**: Once you have finished your action, click "End Turn" to let the next person play.

### Winning and Losing
*   **How to Win**: You win by being the last Ritualist with Souls left. If everyone else runs out of Souls, you are the Grand Master of Monstropoly!
*   **Going Bankrupt (The End)**: If you owe someone Souls but have none left to give, you have "gone bankrupt." Your soul is extinguished, and you are out of the game.
*   **Staying Alive**: To stay in the game, try to buy many properties. The more properties you own, the more Souls you can collect from other players!

### Special Ritual Tricks
*   **Building Manifestations (Houses)**: If you own all the properties of the same color, you can build **Gravestones** (Small Houses) and **Mausoleums** (Large Hotels) on them. This makes the "Soul Toll" much higher for anyone who lands there!
*   **The Pit of Despair (Jail)**: If you land on "Go to the Pit," you are trapped for a little while. You can get out by rolling doubles on the dice, paying a fine of 50 Souls, or using a rare **Skeleton Key**.
*   **Desecrating (Mortgaging)**: If you are low on Souls, you can "desecrate" a property to get some Souls back quickly from the bank. However, you won't collect any Tolls from that property until you pay the bank back and make it pure again!


---

## 6. Interface & Page Descriptions

### The Manifestation Gateway (Home/Main Menu)
The gateway for all ritualists. It features a grand branding of **"Monstropoly"** above the login/signup container, shrouded in spectral smoke and blood. Here, users sacrifice their credentials to enter the ritual.

### The AnteChamber (Lobby)
The gathering place for fellow souls. Players can join existing domains via a "Pact Code" or summon their own. The High Priest (host) manages the starting Soul balance and player limits here.

### The Ritual Grounds (Game Board)
The heart of the manifestation. A meticulously crafted 40-space board oriented toward the center, creating a sense of inward descent. The four corners house the anchors of the ritual: **The Origin (Go)**, **The Pit of Despair**, **Ethereal Passage**, and **The Sentinel (Go to Pit)**. In the center lies the **Circle of Fate**, where the bone dice are cast and the engine’s dynamic logs chronicle every ritual action. The grounds are perpetually shrouded in drifting spectral fog and stained by the running blood of the Crimson Ritual.

### Player Dashboard
Integrated into the board's periphery, the dashboard tracks Soul balance, current inventory (Skeleton Keys), and property deeds. Clicking a deed opens the **Manifestation Modal**, where ritualists can upgrade or desecrate their lands.

### The Victory Manifestation
The culmination of the ritual. When a single master remains, the board fades into the **Victory Screen**, manifesting the winner’s character sprite in a pulsing red aura. The cinematic scale and haunting celebration mark the final dominance over the void.

---
*Developed by Christian Rey M. De Vera*
[https://github.com/deveraxtianrey-cyber](https://github.com/deveraxtianrey-cyber)
[🎥 Archival Record: Step-by-Step Development Video](https://drive.google.com/drive/folders/1qPxXhokTSfnFeR7Bz22j-hOjP_9udCIg?usp=sharing)
