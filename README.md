# Real-Time Task Collaboration Platform

A real-time task collaboration platform similar to Trello/Notion with drag-and-drop, WebSocket sync, and activity tracking.

## 🚀 Features

- ✅ User authentication with JWT
- ✅ Board, list, and task management (full CRUD)
- ✅ Drag & drop with @dnd-kit
- ✅ Real-time WebSocket synchronization
- ✅ User assignment and activity tracking
- ✅ Search and pagination
- ✅ Responsive UI with Tailwind CSS

## 📋 Tech Stack

**Frontend:** React 18, TypeScript, Vite, TailwindCSS, @dnd-kit, Zustand, Socket.io-client, Axios  
**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, Socket.io, JWT, bcryptjs

## 🏗️ Architecture

```
frontend/src/
├── components/    # UI components (BoardList, TaskCard, Modals)
├── pages/         # Login, Dashboard, BoardView
├── services/      # API client, Socket.io
├── store/         # Zustand stores (auth, boards)
└── types/         # TypeScript interfaces

backend/src/
├── config/        # Database, Socket.io setup
├── controllers/   # Request handlers
├── models/        # Mongoose schemas (User, Board, List, Task, Activity)
├── routes/        # API routes
└── middleware/    # Auth, error handling
```

## 🚀 Quick Start

**Prerequisites:** Node.js 18+, MongoDB 5+

**Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Configure MongoDB URI, JWT secret
npm run dev           # Runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env  # Set VITE_API_URL and VITE_SOCKET_URL
npm run dev           # Runs on http://localhost:3000
```

## 📄 License

MIT License

---

Built with ❤️ by Arpit Kushwaha
