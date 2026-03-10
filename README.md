# ⚡ CYBER GENESIS — Tech Fest Quiz Platform

A real-time, cyberpunk-themed quiz competition platform for tech fests.

---

## 🚀 QUICK START

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
node server.js
# OR for dev with auto-reload:
npm run dev
```

### 3. Open in browser
```
http://localhost:3000
```

---

## 🎮 HOW IT WORKS

### Player Side
1. Click **⚡ JOIN GAME** on the landing page
2. Enter your callsign (name)
3. Wait for the admin to start the game
4. Answer questions before the timer runs out
5. **First correct answer gets bonus points!**

### Admin Panel
1. Click **⚙ ADMIN PANEL**
2. Password: **`cyber2025`**
3. Use **▶ NEXT QUESTION** to begin/advance
4. Watch real-time responses in the dashboard
5. Export results anytime

---

## 🏆 SCORING SYSTEM

| Event | Points |
|-------|--------|
| Correct Answer | 100 pts (base) |
| Speed Bonus | +5 pts per second remaining |
| First to Answer | +50 pts bonus |
| Wrong Answer | 0 pts |

---

## 🛠️ ADMIN CONTROLS

| Button | Action |
|--------|--------|
| ▶ NEXT QUESTION | Start/advance to next question |
| ⏸ PAUSE / ▶ RESUME | Pause/resume the timer |
| ⏹ END QUESTION | Force-end current question |
| ↺ RESET GAME | Reset all scores and progress |
| 📥 EXPORT | Download results as JSON |

---

## 📡 REAL-TIME FEATURES

- Questions appear **simultaneously** on all player screens
- Response timestamps captured with **millisecond precision**
- **First responder** highlighted in green on admin dashboard
- Live leaderboard updates after every question
- Auto-reveal correct answer when timer expires

---

## 🎨 TECH STACK

- **Backend**: Node.js + Express + Socket.IO
- **Frontend**: Vanilla HTML/CSS/JS (no framework needed)
- **Real-time**: WebSocket via Socket.IO
- **Design**: Cyberpunk/Neon glassmorphism

---

## 🔧 CONFIGURATION

Edit `server.js` to change:
- **Admin password**: Change `'cyber2025'` in the `adminJoin` handler
- **Default questions**: Edit the `questions` array in `gameState`
- **Port**: Set `PORT` environment variable (default: 3000)

---

## 🌐 DEPLOYMENT

### Local Network (for in-person events)
1. Run on a laptop connected to the venue WiFi
2. Share your local IP: `http://192.168.x.x:3000`
3. Players connect from phones/laptops

### Cloud Deploy
Works with any Node.js host: Railway, Render, Fly.io, etc.

```bash
# Set environment variable
PORT=8080 node server.js
```

---

## 📁 PROJECT STRUCTURE

```
cyber-genesis/
├── server.js          # Backend: Express + Socket.IO
├── package.json       # Dependencies
├── README.md          # This file
└── public/
    └── index.html     # Full frontend (player + admin UI)
```
