# Labyrinth III

Labyrinth III is a cosmic, CRT‑haunted maze experience built with Three.js.  
It blends procedural generation, analogue distortion, Radiophonic‑style audio,  
and post‑processing effects to create a world that feels like a lost broadcast  
from a parallel universe.

The project focuses on atmosphere, movement, and the uncanny.  
Footsteps echo strangely.  
The starfield shimmers.  
The maze breathes.

## ✨ Features

- Procedurally generated 3D labyrinth  
- Dynamic lighting and fog  
- CRT scanlines, film grain, bloom, and chromatic aberration  
- Ambient audio and distorted footstep effects  
- Smooth first‑person movement  
- Starfield skybox  
- Modular architecture for easy expansion  
- Win and loss conditions (golden sphere escape / Phantom claim)
- Restart system on death

## 🎛 Post‑Processing Stack

Labyrinth III uses a custom post‑processing pipeline to achieve its “broadcast from the void” aesthetic:

- **Vignette** (analogue depth)  
- **Chromatic Aberration** (broadcast drift)  
- **Film Grain** (noise texture)  
- **CRT Scanlines** (retro monitor effect)
- **Bloom (optional / configurable)** — cosmic glow

These effects combine to create a surreal, haunted‑signal atmosphere.

## 🎮 Controls

- **Arrow Keys** — Move  
- **Space** — Jump  
- **E** — Use tablet (heals 25–40%)

## 🔧 Project Structure

```Code
/src
main.js
labyrinth.js
playerController.js
cameraRig.js
worldBuilder.js
materials.js
lights.js
audio.js
postprocessing.js
config.js
styles.css
```

Everything is modular and easy to extend.

## 🧩 Gameplay Loop

- Navigate the labyrinth
- Avoid the Broadcast Phantom
- Manage health using limited tablets
- Reach the golden sphere to escape
- If the Phantom drains your health to zero, the fog consumes you
- A restart option appears on death

## 🛠 Installation

Clone the repo:

```Code
git clone https://github.com/Nimira43/Labyrinth-III
```

Install dependencies:

```Code
npm install
```

Run the dev server:

```Code
npm run dev
```

## 📜 License

This project is licensed under the MIT License.  
See the `LICENSE` file for details.
