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

## 🎛 Post‑Processing Stack

Labyrinth III uses a custom post‑processing pipeline:

- **Bloom** (soft cosmic glow)  
- **Vignette** (analogue depth)  
- **Chromatic Aberration** (broadcast drift)  
- **Film Grain** (noise texture)  
- **CRT Scanlines** (retro monitor effect)

These combine to create the signature “broadcast from the void” aesthetic.

## 🎮 Controls

- **Arrow Keys** — Move  
- **Space** — Jump  
- **Mouse** — Look around  

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

## 🔮 Planned Features

- **Broadcast Phantom** — a humanoid made of scanlines and noise  
- **Living Labyrinth** — walls shift behind the player  
- Additional audio layers  
- Environmental storytelling  

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
