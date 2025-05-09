# 3D Maze - Lab 5, Task 1

A WebGL application that renders a 3D maze with textured walls. The maze supports 6 different wall textures and allows the user to navigate through the environment using keyboard controls and mouse look.

## Features

- 3D maze environment with walls
- 6 different wall textures based on wall position and neighbors
- First-person navigation with collision detection
- Mouse look controls (click to capture mouse)
- Keyboard WASD or arrow keys for movement

## How to Run

1. Make sure you have Node.js installed
2. Install dependencies (if using npm): `npm install`
3. Run the development server: `npm run dev`
4. Open the URL shown in your browser (typically http://localhost:5173/)

## Controls

- **W / Arrow Up**: Move forward
- **S / Arrow Down**: Move backward
- **A / Arrow Left**: Strafe left
- **D / Arrow Right**: Strafe right
- **Mouse**: Look around (click on the canvas first to enable mouse capture)

## Project Structure

- `main.ts`: Main entry point that initializes the app
- `Labirint/`: Contains the maze implementation
  - `Labirint.ts`: Main maze class that handles rendering and interaction
  - `loadTexture.ts`: Utility for loading textures
  - `textures/`: Directory containing texture files
- `WebGLUtils.ts`: WebGL utility functions and shaders

## Implementation Details

The maze is represented as a 2D grid where 1 indicates a wall and 0 indicates an empty space. Wall textures are determined based on the wall's position and the number of adjacent walls.

The visual appearance of the walls uses a texture atlas that contains 6 different wall textures arranged in a 3x2 grid. 