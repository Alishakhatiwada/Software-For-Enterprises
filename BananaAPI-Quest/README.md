# 🍌 BananaAPI-Quest | Enterprise Software Architecture

> **Unit**: CIS046-3 Software For Enterprise  
> **Assignment**: 1 - Artifact Submission (Code & Video Defense)  
> **Student Author**: Alisha  
> **Course**: BSc (Hons) Computer Science  
> **Target Mark Band**: 70%+ (1st Class Honours / High Distinction standard)

---

## 📌 1. Project Overview

**BananaAPI-Quest** is a distributed, full-stack enterprise web application designed to challenge users with visual mathematical puzzles powered by an external web service. The application incorporates a **30-second countdown timer**, an **arcade-style 3-lives mechanic**, and a **progressive, algorithmic smart hint engine** that replaces static quotes with genuine mathematical deductions.

The project is structured according to professional enterprise software engineering principles to showcase mastery across the **four core themes** stipulated in the assessment brief:

1. **Version Control & Software Architecture**: Component modularity, separation of concerns (MVC), semantic commit granularity, branching models, and version tagging.
2. **Event-Driven Programming**: Non-blocking asynchronous event loops, real-time `setInterval` timer tick events, DOM event listeners, and lifecycle state management.
3. **Interoperability**: Multi-tier distributed communication across distinct platforms and architectures—Node.js/Express, external third-party PHP REST service (Marc Conrad's Banana API), and MongoDB NoSQL database.
4. **Virtual Identity**: Secure authentication, 12-round salted `bcrypt` password hashing, stateless JSON Web Tokens (JWT) with bearer authorization headers, and route protection middleware.

---

## 🏗️ 2. Architectural Structure & Component Organization (Theme 1)

The application follows the **Model-View-Controller (MVC)** and **Service-Repository** architectural patterns to guarantee high cohesion, low coupling, maintainability, and scalability.

```text
BananaAPI-Quest/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB Mongoose connection configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic (register, login, token generation)
│   │   └── bananaController.js  # Game mechanics (puzzle delivery, answer validation, hint consumption)
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification, signature validation & route protection
│   ├── models/
│   │   ├── User.js              # User virtual identity schema with encrypted passwords
│   │   ├── GameProgress.js      # Player stats, cumulative points, milestones, and solve records
│   │   └── PuzzleHistory.js     # Audit trail logging each puzzle attempt, result, and timestamp
│   ├── routes/
│   │   ├── authRoutes.js        # REST endpoints for authentication (/api/auth)
│   │   └── bananaRoutes.js      # Protected REST endpoints for gameplay (/api/banana)
│   ├── services/
│   │   └── bananaApi.js         # External API client, timeout management & smart hint engine
│   ├── .env                     # Environment variables (PORT, JWT_SECRET, MONGODB_URI)
│   ├── package.json             # Backend dependencies and configuration
│   └── server.js                # Express application bootstrapping and middleware configuration
├── frontend/
│   ├── assets/                  # Static assets and icons
│   ├── css/
│   │   ├── game.css             # Main gameplay styling (timer badges, heart indicators, game over card)
│   │   ├── home.css             # Landing page aesthetics
│   │   ├── leaderboard.css      # Top player ranking tables and podiums
│   │   ├── login.css            # Authentication form styling
│   │   ├── puzzle-history.css   # Historical logs and attempt audit view
│   │   └── register.css         # Registration form styling
│   ├── js/
│   │   ├── auth-check.js        # Client-side route guard ensuring authenticated access
│   │   ├── game.js              # Client game engine: timer loop, life management, DOM events
│   │   ├── leaderboard.js       # Dynamic leaderboard loader and ranking renderer
│   │   ├── login.js             # Form submission and JWT token storage
│   │   ├── puzzle-history.js    # Historical attempt data retrieval from MongoDB
│   │   └── register.js          # Account creation handler
│   ├── game.html                # Interactive puzzle challenge arena
│   ├── index.html               # Welcome landing page
│   ├── leaderboard.html         # Global rankings view
│   ├── login.html               # User sign-in interface
│   ├── puzzle-history.html      # Past games audit interface
│   └── register.html            # User onboarding interface
├── package.json                 # Project root execution scripts
├── README.md                    # Technical documentation and evaluation report
└── VIDEO_PRESENTATION_SCRIPT.md # Minute-by-minute 10-minute presentation defense script
```

### Critical Evaluation of Architecture & Alternatives (Rubric 70%+)
- **Adopted Approach (Modular Tiered Architecture)**: Separating controllers, routes, models, and external services ensures that changes to the external Banana API or the database layer do not break the presentation or authentication layer.
- **Alternative Evaluated (Monolithic Single-File Script)**: A single script (e.g., standard PHP or monolithic `app.js`) is faster to build initially for small prototypes, but it violates the Single Responsibility Principle (SRP), creates race conditions, impairs version control merging, and makes collaborative git branching virtually impossible.
- **Alternative Evaluated (Microservices Architecture)**: Splitting Auth and Gameplay into independent Dockerized microservices offers ultimate scalability, but introduces unnecessary network latency, inter-service service discovery complexity, and distributed transaction overhead for an application of this scale.

---

## ⚡ 3. Event-Driven Programming (Theme 2)

The system relies heavily on asynchronous and event-driven patterns across both client and server:

### 1. Real-Time Countdown Timer (`setInterval` / `clearInterval`)
- Each puzzle initiates an event-driven timer ticking once every 1,000 milliseconds.
- Visual state updates are dispatched dynamically:
  - Remaining time $> 10$s: Normal state (Theme Honey/Orange).
  - Remaining time $\le 10$s: Dispatches `warning` class (pulsing amber glow).
  - Remaining time $\le 5$s: Dispatches `danger` class (rapid red pulsing).
  - Remaining time $= 0$s: Dispatches `handleTimeout()` event, clearing the interval, deducting a life (`❤️❤️❤️` $\rightarrow$ `❤️❤️🤍`), and disabling inputs.

### 2. DOM Event Listeners & Asynchronous Promises
- **Input and Click Events**: `submitAnswer.addEventListener("click", ...)`, `nextPuzzle.addEventListener("click", ...)`, and keyboard events `answerInput.addEventListener("keydown", (e) => { if (e.key === "Enter") ... })`.
- **Asynchronous I/O Loop**: The Node.js event loop handles non-blocking HTTP requests via `async`/`await`. When calling the external Banana API, an `AbortController` signal is bound to a `setTimeout` event (10 seconds) to prevent hanging sockets.

### 3. Game Lifecycle State Events
- The game engine operates as a finite state machine with transitions:
  `[READY] -> [PLAYING / TIMER TICKING] -> [SUBMITTED / EVALUATING] -> [CORRECT / TIMEOUT / WRONG] -> [GAME OVER or NEXT ROUND]`.

---

## 🌐 4. Interoperability & Distributed Systems (Theme 3)

BananaAPI-Quest operates as a multi-tier distributed system interoperating across three disparate architectural boundaries:

```text
[ Client Web Browser ]
      ↕  HTTP / JSON (REST Protocol via Fetch API)
[ Node.js & Express API Gateway ]
      ↕  TCP / BSON (Mongoose Wire Protocol)       ↕  HTTPS / REST / JSON (Marc Conrad's PHP Service)
[ MongoDB NoSQL Database ]                     [ External Banana Web Service ]
```

### 1. Interoperation with External Third-Party Web Service
- **Service**: Marc Conrad's Banana API (`https://marcconrad.com/uob/banana/api.php?out=json&base64=no`).
- **Data Exchange**: RESTful GET request returning a JSON payload with `question` (URL to puzzle image) and `solution` (integer 0–9).
- **Gateway Abstraction**: The browser client **never** talks to Marc Conrad's API directly. The Node.js backend acts as a secure API Gateway, concealing the solution from client inspection, maintaining puzzle session tokens (`p_timestamp_random`), and transforming raw data into useful game objects.

### 2. Smart Algorithmic Hint Generator (Data Enrichment)
Instead of returning static, unhelpful quotes, our backend intercepts the third-party `solution` and dynamically computes progressive mathematical properties:
- **Level 1 (Parity & Range Clue)**: Analyzes parity ($S \pmod 2 = 0$) and magnitude ($S \le 4$ vs $S \ge 5$). Cuts search space by 70%.
- **Level 2 (Property & 3-Candidate Shortlist)**: Identifies mathematical qualities (Prime number $\in \{2, 3, 5, 7\}$, Multiple of 3 or 4, Identity/Zero properties) and provides a 3-number candidate shortlist.
- **Level 3 (50/50 Elimination)**: Narrows the solution down to exactly 2 choices (the correct answer and one close distractor).

### Critical Justification of Approach (Rubric 70%+)
By encapsulating the external API inside `bananaApi.js`, our system insulates the frontend from external service changes. If Marc Conrad's API changes its data format or moves to an OAuth-protected v2, only the service adapter needs modification, leaving the frontend, database, and game controller intact.

---

## 🛡️ 5. Virtual Identity & Authentication (Theme 4)

User identity and persistence are established through cryptographically secured virtual credentials:

### 1. Salted Password Hashing (`bcryptjs`)
- Passwords are never stored in plaintext. They are salted and hashed using `bcrypt` with a cost factor of **12 salt rounds**.
- Defends against rainbow table attacks and dictionary attacks.
- Passwords are set with `select: false` in the Mongoose `User` schema to prevent accidental leaks in database queries.

### 2. Stateless JSON Web Tokens (JWT)
- On successful login, the server issues a signed JWT (`jwt.sign`) with a 2-hour lifespan (`expiresIn: "2h"`).
- The token payload carries the subject's virtual identity (`userId`, `email`).
- Requests to protected endpoints (`/api/banana/*`) require the `Authorization: Bearer <token>` header.
- The `authMiddleware.js` verifies the signature against the server's `JWT_SECRET`, decodes the claims, validates the MongoDB `ObjectId`, and attaches `req.user`.

### Critical Evaluation of Authentication Mechanisms (Rubric 70%+)
- **Adopted (Stateless JWT)**: Horizontally scalable across multiple server instances because no session state resides in server RAM. Ideal for RESTful mobile and web clients.
- **Alternative Evaluated (Stateful Session Cookies)**: Traditional sessions require server memory or a centralized Redis session store. While cookies can be set with `HttpOnly` and `SameSite` flags to mitigate XSS, they are vulnerable to Cross-Site Request Forgery (CSRF) and impair cross-domain scalability.
- **Alternative Evaluated (OAuth 2.0 / OpenID Connect)**: Delegating authentication to Google or GitHub simplifies user onboarding, but introduces external provider lock-in and network dependencies for internal enterprise services.

---

## 🌿 6. Version Control Workflow & Strategies (Theme 1)

The project leverages Git best practices to ensure code quality, auditability, and team collaboration:
- **Branching Model**: Features were developed on isolated branches (e.g., `feature/timer-life-and-smart-hints`) before merging into `main`.
- **Commit Granularity**: Each commit represents an atomic, descriptive unit of work (e.g., "Implement 30s countdown timer and life penalty system", "Refactor hint engine to provide dynamic mathematical deductions").
- **Semantic Tagging**: Releases are versioned using tags:
  - `v1.0.0`: Base authentication, MVC architecture, and initial Banana API integration.
  - `v1.1.0`: Introduction of 30-second timer, 3-life system, Game Over state, and smart hint generator.

---

## 🚀 7. Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on port `27017`

### Step 1: Install Dependencies
```bash
# Navigate to the backend directory
cd backend
npm install
```

### Step 2: Configure Environment Variables
Verify or create `backend/.env`:
```env
PORT=5000
JWT_SECRET=banana_quest_secure_enterprise_key_2026
MONGODB_URI=mongodb://127.0.0.1:27017/bananaapi_quest
```

### Step 3: Launch the Server
```bash
# From the project root
npm start

# Or directly from backend:
node backend/server.js
```
The server will start on `http://localhost:5000`.

### Step 4: Launch the Frontend
Open `frontend/index.html` in your web browser (or use VS Code Live Server).
1. Register a new player account (you receive an initial starter bonus of 20 points).
2. Log in and launch the **BananaAPI-Quest** challenge!

---

## 📚 8. References & Academic Integrity Declaration

In compliance with the University of Bedfordshire academic integrity policy:
1. **Marc Conrad's Banana API**: Used as the external third-party REST puzzle provider (`https://marcconrad.com/uob/banana/doc.php`).
2. **Express.js & Node.js Core**: Used for HTTP server routing, JSON parsing, and middleware pipeline (`https://expressjs.com/`).
3. **Mongoose ODM**: Used for MongoDB schema enforcement and persistence (`https://mongoosejs.com/`).
4. **bcryptjs & jsonwebtoken**: Used for password hashing algorithms and JWT token verification standards (`RFC 7519`).
5. **Generative AI & LLM Assistance**: AI pair programming (Google Antigravity) was utilized to assist with code structure enhancement, timer integration, hint mathematics, and documentation in accordance with university assessment guidelines. All generated logic has been verified, refined, and documented by the student.
