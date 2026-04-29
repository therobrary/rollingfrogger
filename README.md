# Rolling-Frogger

A browser-based Phaser 3.85.0 game set at Rolling Rd x Grigsby Dr near West Springfield High School.

Navigate a student across six traffic lanes to reach the school — use safe zones (median, grass, sidewalk) to plan your route.

## Controls

- **Arrow Keys** or **WASD** — Move the player one tile per press
- Grid-based hop movement with input debouncing
- Reach the school (top lane) to complete a level
- 3 lives — collisions with vehicles cost a life and reset your position

## Tech Stack

- **Phaser 3.85.0** — loaded from CDN (jsdelivr)
- **Zero build step** — pure static HTML/JS/CSS
- **13 pixel-art PNG assets** — generated via PsPixel MCP tooling

## Project Structure

```
docs/
├── index.html          # Entry point — loads Phaser + all scenes
├── js/
│   ├── game.js         # Phaser game config (640×720, arcade physics)
│   └── scenes/
│       ├── boot.js     # Asset loading + procedural fallbacks
│       ├── menu.js     # Title screen with instructions
│       ├── game.js     # Main gameplay: 6 lanes, traffic, HUD
│       └── gameover.js # Win/lose screen with score & replay
└── assets/
    ├── player_student.png
    ├── vehicle_car_red.png
    ├── vehicle_car_green.png
    ├── vehicle_bus_yellow.png
    ├── vehicle_truck_blue.png
    ├── tile_road.png
    ├── tile_median.png
    ├── tile_grass.png
    ├── tile_sidewalk.png
    ├── tile_school_goal.png
    ├── lane_marker.png
    ├── obstacle_cone.png
    └── tile_bg_dark.png
```

## Local Development

Serve from the `docs/` directory with any static server:

```bash
cd docs
python3 -m http.server 8765
# or
npx serve docs
```

Then open `http://localhost:8765`.

## GitHub Pages Deployment

This project uses the **docs folder** pattern for GitHub Pages:

1. Push this repo to GitHub under the `therobrary` organization.
2. Go to **Settings → Pages** in the repository.
3. Set **Source** to `Deploy from a branch`.
4. Set **Branch** to `main` and folder to `/docs`.
5. The game will be live at `https://therobrary.github.io/rollingfrogger/`.

No build step or Actions workflow is required.
