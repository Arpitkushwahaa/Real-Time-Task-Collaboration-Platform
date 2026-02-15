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

## � Documentation

- **[Architecture Guide](./ARCHITECTURE.md)** - Frontend/Backend architecture, real-time sync strategy, scalability
- **[API Documentation](./API.md)** - Complete API endpoints with examples
- **[Setup Guide](./SETUP.md)** - Detailed local development setup
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions

## 🔐 Demo Credentials

For testing purposes:
- **Email:** demo@example.com
- **Password:** demo123456

Or register a new account!

## 📝 Key Highlights

### Implemented Features
✅ **Complete CRUD Operations** - Boards, Lists, Tasks with full create/read/update/delete  
✅ **Real-time Synchronization** - WebSocket-powered live updates across all connected clients  
✅ **Drag & Drop** - Intuitive task movement using @dnd-kit library  
✅ **User Management** - JWT authentication, user assignment to tasks  
✅ **Activity Tracking** - Complete audit log of all board activities  
✅ **Search & Pagination** - Efficient data loading and search functionality  
✅ **Responsive Design** - Works seamlessly on desktop and mobile  

### Architecture Decisions
- **State Management:** Zustand for global state (lightweight, TypeScript-friendly)
- **Database:** MongoDB with indexed queries for performance
- **Real-time:** Socket.io rooms per board for isolated broadcasts
- **API Design:** RESTful with consistent response format
- **Type Safety:** Full TypeScript implementation across frontend and backend

### Assumptions & Trade-offs
- Users have stable internet for real-time features
- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- Optimistic UI updates for better UX (server is source of truth)
- Pagination over infinite scroll for simplicity (can enhance later)

## �📄 License

MIT License

---

Built with ❤️ by Arpit Kushwaha
