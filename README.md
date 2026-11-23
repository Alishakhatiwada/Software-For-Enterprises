# 🍌 BananaAPI-Quest

### Full-Stack Mathematical Puzzle Game

**Module:** CIS046-3 – Software For Enterprise  
**Assignment:** Assignment 1 – Artifact Submission  
**Student:** Alisha Khatiwada  
**Course:** BSc (Hons) Computer Science

## 1. Project Overview

BananaAPI-Quest is a full-stack web application that allows users to register, log in and solve mathematical puzzles provided by an external Banana API.

The application uses Node.js, Express.js, MongoDB, HTML, CSS and JavaScript.

It demonstrates four core enterprise software concepts: software architecture, event-driven programming, interoperability and virtual identity.

## 2. Main Features

- User registration and login.
- Secure password hashing using bcryptjs.
- JWT-based authentication and protected routes.
- Mathematical puzzle retrieval through the Banana API.
- Answer submission and validation.
- Puzzle hints and game progress management.
- MongoDB database integration.

## 3. Technologies Used

| Technology | Purpose |
|---|---|
| HTML, CSS, JavaScript | Frontend |
| Node.js and Express.js | Backend |
| MongoDB and Mongoose | Database |
| bcryptjs | Password hashing |
| JSON Web Token | Authentication |
| Fetch API | Frontend-backend communication |
| Banana API | External puzzle service |
| Git and GitHub | Version control |

## 4. Folder Structure

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

## 5. Four Core Assessment Themes

**1. Version Control and Software Architecture**
- Modular project organisation.
- Separation of concerns using controllers, routes, models and services.
- Git commits and GitHub version control.

**2. Event-Driven Programming**
- JavaScript event listeners for user interactions.
- Asynchronous operations using `async` and `await`.
- Fetch API for communicating with backend services.

**3. Interoperability**
- Communication between frontend, Node.js backend and MongoDB.
- Integration with the external Banana API using HTTP and JSON.
- Backend management of external puzzle data.

**4. Virtual Identity**
- User registration and login.
- Password hashing using bcryptjs.
- JWT authentication and protected API routes.

## 6. External API Integration

**Provider:** Marc Conrad's Banana API

[Banana API Documentation](https://marcconrad.com/uob/banana/doc.php)

The external API provides mathematical puzzle images and their solutions. The backend retrieves the puzzle data and manages answer validation without exposing the solution directly to the frontend.

## 7. Installation and Setup

**Prerequisites:** Node.js, MongoDB and Visual Studio Code.

**Step 1: Clone the repository**

```bash
git clone https://github.com/Alishakhatiwada/Software-For-Enterprises.git
```

**Step 2: Install dependencies**

```bash
cd BananaAPI-Quest/backend
npm install
```

**Step 3: Configure environment variables**

Create `backend/.env`:

```env
PORT=5000
JWT_SECRET=your_private_secret_key
MONGODB_URI=mongodb://127.0.0.1:27017/bananaapi_quest
```

**Step 4: Start MongoDB**

Ensure MongoDB is running.

**Step 5: Start the backend**

From the backend directory:

```bash
node server.js
```

**Step 6: Run the frontend**

Open `frontend/login.html` using Visual Studio Code Live Server. Register an account, log in and start playing.

## 8. Future Improvements

- Improved mathematical hint generation.
- Additional difficulty levels.
- Automated testing and GitHub Actions.
- Improved leaderboard and game history.

