# Real-Time Task Collaboration Platform

A feature-rich, real-time task collaboration platform similar to Trello/Notion, built with modern web technologies. This platform enables teams to manage tasks, collaborate in real-time, and track project progress seamlessly.

![Platform Preview](https://via.placeholder.com/800x400?text=Task+Collaboration+Platform)

## 🚀 Features

### Core Functionality
- ✅ **User Authentication** - Secure signup/login with JWT
- ✅ **Board Management** - Create, update, and delete boards with custom colors
- ✅ **List Management** - Organize tasks into customizable lists
- ✅ **Task Management** - Full CRUD operations on tasks
- ✅ **Drag & Drop** - Intuitive task movement across lists
- ✅ **User Assignment** - Assign team members to tasks
- ✅ **Real-time Updates** - WebSocket-powered live synchronization
- ✅ **Activity Tracking** - Complete history of board activities
- ✅ **Search** - Quick task search functionality
- ✅ **Pagination** - Efficient data loading

### Technical Highlights
- **Real-time Collaboration** - Multiple users can work simultaneously
- **Responsive Design** - Works on desktop and mobile devices
- **Type Safety** - Full TypeScript implementation
- **Modern UI** - Beautiful, immersive interface with Tailwind CSS
- **Scalable Architecture** - Designed for growth

## 📋 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS
- **@dnd-kit** - Drag and drop functionality
- **Zustand** - State management
- **Socket.io-client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Navigation
- **date-fns** - Date formatting

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 🏗️ Architecture

### Frontend Architecture

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── BoardList.tsx
│   │   ├── TaskCard.tsx
│   │   ├── CreateBoardModal.tsx
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   └── BoardView.tsx
│   ├── services/         # API and WebSocket services
│   │   ├── api.ts
│   │   └── socket.ts
│   ├── store/           # State management
│   │   ├── authStore.ts
│   │   └── boardStore.ts
│   └── types/           # TypeScript types
│       └── index.ts
```

**State Management Strategy:**
- Zustand stores for global state (auth, boards)
- React local state for component-specific data
- WebSocket events for real-time synchronization

**Component Design:**
- Functional components with hooks
- Custom hooks for reusable logic
- Compound component pattern for complex UI

### Backend Architecture

```
backend/
├── src/
│   ├── config/          # Configuration
│   │   ├── database.ts
│   │   └── socket.ts
│   ├── controllers/     # Request handlers
│   │   ├── authController.ts
│   │   ├── boardController.ts
│   │   ├── listController.ts
│   │   └── taskController.ts
│   ├── models/          # Database models
│   │   ├── User.ts
│   │   ├── Board.ts
│   │   ├── List.ts
│   │   ├── Task.ts
│   │   └── Activity.ts
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── utils/           # Helper functions
```

**API Design Pattern:**
- RESTful API architecture
- Controller-based request handling
- Middleware for authentication and error handling
- Consistent response format

## 🗄️ Database Schema

### User Model
```typescript
{
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  avatar: String,
  timestamps: true
}
```

### Board Model
```typescript
{
  title: String,
  description: String,
  owner: ObjectId -> User,
  members: [ObjectId -> User],
  backgroundColor: String,
  timestamps: true,
  indexes: [owner, members, createdAt]
}
```

### List Model
```typescript
{
  title: String,
  board: ObjectId -> Board,
  position: Number,
  timestamps: true,
  indexes: [board, position]
}
```

### Task Model
```typescript
{
  title: String,
  description: String,
  list: ObjectId -> List,
  board: ObjectId -> Board,
  position: Number,
  assignedTo: [ObjectId -> User],
  dueDate: Date,
  priority: Enum ['low', 'medium', 'high'],
  labels: [String],
  timestamps: true,
  indexes: [list, board, assignedTo, createdAt]
}
```

### Activity Model
```typescript
{
  board: ObjectId -> Board,
  user: ObjectId -> User,
  action: Enum ['created', 'updated', 'deleted', 'moved', 'assigned'],
  entityType: Enum ['board', 'list', 'task'],
  entityId: ObjectId,
  details: Mixed,
  timestamps: true,
  indexes: [board, createdAt]
}
```

**Indexing Strategy:**
- Compound indexes on frequently queried fields
- Indexed foreign keys for efficient joins
- Timestamp indexes for activity queries

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: { success: true, data: { user, token } }
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { success: true, data: { user, token } }
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: { success: true, data: user }
```

### Board Endpoints

#### Get All Boards
```http
GET /api/boards?page=1&limit=10
Authorization: Bearer <token>

Response: { success: true, data: [...boards], pagination: {...} }
```

#### Get Single Board
```http
GET /api/boards/:id
Authorization: Bearer <token>

Response: { success: true, data: { board with lists and tasks } }
```

#### Create Board
```http
POST /api/boards
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Marketing Campaign",
  "description": "Q1 2024 Marketing",
  "backgroundColor": "#0079bf"
}

Response: { success: true, data: board }
```

#### Update Board
```http
PUT /api/boards/:id
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "Updated Title" }

Response: { success: true, data: board }
```

#### Delete Board
```http
DELETE /api/boards/:id
Authorization: Bearer <token>

Response: { success: true, data: {} }
```

#### Add Member
```http
POST /api/boards/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{ "userId": "user_id" }

Response: { success: true, data: board }
```

### List Endpoints

#### Create List
```http
POST /api/boards/:boardId/lists
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "To Do" }

Response: { success: true, data: list }
```

#### Update List
```http
PUT /api/lists/:id
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "In Progress" }

Response: { success: true, data: list }
```

#### Delete List
```http
DELETE /api/lists/:id
Authorization: Bearer <token>

Response: { success: true, data: {} }
```

### Task Endpoints

#### Create Task
```http
POST /api/boards/:listId/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Design homepage",
  "description": "Create mockups",
  "priority": "high",
  "dueDate": "2024-12-31",
  "labels": ["design", "urgent"]
}

Response: { success: true, data: task }
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "Updated Task" }

Response: { success: true, data: task }
```

#### Move Task
```http
PUT /api/tasks/:id/move
Authorization: Bearer <token>
Content-Type: application/json

{ "listId": "new_list_id", "position": 0 }

Response: { success: true, data: task }
```

#### Assign Task
```http
POST /api/tasks/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{ "userId": "user_id" }

Response: { success: true, data: task }
```

#### Search Tasks
```http
GET /api/boards/:boardId/tasks/search?q=design
Authorization: Bearer <token>

Response: { success: true, data: [...tasks] }
```

### Activity Endpoints

#### Get Activities
```http
GET /api/boards/:boardId/activities?page=1&limit=20
Authorization: Bearer <token>

Response: { success: true, data: [...activities], pagination: {...} }
```

## 🔄 Real-time Synchronization

### WebSocket Events

**Client -> Server:**
- `join-board` - Join a board room
- `leave-board` - Leave a board room
- `board-updated` - Broadcast board update
- `list-created/updated/deleted/moved` - List operations
- `task-created/updated/deleted/moved/assigned` - Task operations

**Server -> Client:**
- Same event names for receiving updates

### Sync Strategy

1. **Optimistic Updates** - UI updates immediately
2. **Server Confirmation** - API call to persist changes
3. **WebSocket Broadcast** - Notify other connected users
4. **State Reconciliation** - Update local state on events

### Conflict Resolution
- Last-write-wins for simple updates
- Position recalculation for drag-and-drop
- Server-authoritative approach

## 📈 Scalability Considerations

### Current Implementation
- MongoDB with indexed queries
- WebSocket rooms per board
- JWT stateless authentication
- Pagination for large datasets

### Future Enhancements
1. **Database Scaling**
   - MongoDB sharding by board ID
   - Read replicas for queries
   - Redis caching layer

2. **Real-time Scaling**
   - Redis adapter for Socket.io
   - Horizontal scaling of Node servers
   - Load balancer with sticky sessions

3. **Performance**
   - CDN for static assets
   - Image optimization
   - Lazy loading for boards
   - Virtual scrolling for large lists

4. **Features**
   - File attachments
   - Comments on tasks
   - Email notifications
   - Advanced search with filters
   - Board templates
   - Analytics dashboard

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ 
- MongoDB 5+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/task-collaboration
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

5. Start MongoDB:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

6. Run development server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

5. Run development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist folder with any static server
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔐 Demo Credentials

For testing purposes:
- **Email:** demo@example.com
- **Password:** password123

Or register a new account!

## 📝 Assumptions and Trade-offs

### Assumptions
1. Users have stable internet for real-time features
2. Boards are private by default (only members can access)
3. Board owners have full control
4. Tasks positions are managed server-side

### Trade-offs
1. **Real-time vs. Consistency**
   - Chose optimistic updates for better UX
   - Server is source of truth

2. **Simplicity vs. Features**
   - Focused on core features first
   - Extendable architecture for future additions

3. **Performance vs. Features**
   - Pagination over infinite scroll initially
   - Can enhance with virtual scrolling

4. **Security vs. Convenience**
   - JWT tokens in localStorage (consider httpOnly cookies in production)
   - CORS configured for development

## 📂 Project Structure

```
Real-Time-Task-Collaboration-Platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
├── .gitignore
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning or production!

## 👨‍💻 Author

Built with ❤️ by Arpit Kushwaha

## 🙏 Acknowledgments

- Inspired by Trello and Notion
- Built with modern web technologies
- Community-driven development

---

**Happy Collaborating! 🎉**
