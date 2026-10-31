# 🍌 BananaAPI-Quest

## Description

BananaAPI-Quest is a web-based maths puzzle game where users solve visual puzzles using the Banana API. Users can create an account, log in, solve puzzles, earn points, use hints, and track their progress. The project uses HTML, CSS, JavaScript, Node.js, Express, and MongoDB.

## Features

- User Authentication: Users can register and log in securely.
- Puzzle Game: Solve visual maths puzzles from the Banana API.
- Hint System: Get hints to help solve puzzles.
- Scoring System: Earn 10 points for each correctly solved puzzle.
- Progress Tracking: View total attempts, solved puzzles, and points.
- Puzzle History: Check previous answers and results.
- Leaderboard: Compare scores and rankings with other players.
- Database:Store user accounts, game progress, and puzzle history in MongoDB.

## Folder Structure

```text
BananaAPI-Quest/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── bananaController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── GameProgress.js
│   │   └── PuzzleHistory.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── bananaRoutes.js
│   ├── services/
│   │   └── bananaApi.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── assets/
│   │   └── images/
│   ├── css/
│   │   ├── game.css
│   │   ├── login.css
│   │   └── register.css
│   ├── js/
│   │   ├── auth-check.js
│   │   ├── game.js
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── puzzle-history.js
│   │   └── leaderboard.js
│   ├── login.html
│   ├── register.html
│   ├── game.html
│   └── puzzle-history.html
│
├── .gitignore
├── package.json
└── README.md
```

