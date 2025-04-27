# Snake Battle Arena

Witness autonomous pathfinding algorithms compete in this web-based Snake simulation! Choose between Dijkstra's and A* for two AI snakes and watch them battle for fruit on a customizable grid.

**Live Demo:** [https://snakebattle.vercel.app](https://snakebattle.vercel.app)

## What it Does

Snake Battle Arena provides a visual demonstration of fundamental pathfinding algorithms. Two AI-controlled snakes (Red and Blue) navigate a grid, searching for fruit using either Dijkstra's or A* algorithm. They must find the shortest path while avoiding walls and each other. As snakes eat fruit, they grow longer, increasing the challenge.

## Key Features

*   **Autonomous Snakes:** Watch two AI snakes make decisions independently.
*   **Pathfinding Algorithms:** Select Dijkstra's or A* for each snake and compare their strategies.
*   **Dynamic Visualization:** The game plays out on an HTML canvas, showing snake movement, fruit collection, and growth.
*   **Configurable Simulation:** Adjust the number of fruits, grid size (columns up to 53 & rows), game speed, and the algorithm used by each snake.
*   **Live Scoreboard:** Keep track of each snake's length (score).

## How it Works

*   **Frontend:** The user interface, controls, and visualization are built with HTML, CSS, and JavaScript, utilizing the HTML Canvas API for drawing the game state.
*   **Pathfinding Logic:** Custom JavaScript implementations of Dijkstra's and A* algorithms determine the snakes' movements towards the nearest fruit while considering obstacles.
*   **Backend:** A simple Node.js Express server is used to serve the static web files.