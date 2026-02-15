# Architecture Documentation

## System Overview

The Real-Time Task Collaboration Platform is built using a modern client-server architecture with WebSocket support for real-time updates.

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Client   │◄───────►│  Express API    │◄───────►│    MongoDB      │
│   (Frontend)    │         │   (Backend)     │         │   (Database)    │
│                 │         │                 │         │                 │
└────────┬────────┘         └────────┬────────┘         └─────────────────┘
         │                           │
         │    WebSocket (Socket.io)  │
         └───────────────────────────┘
```

## Frontend Architecture

### Technology Stack
- **React 18** - Component-based UI framework
- **TypeScript** - Static typing for reliability
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first styling
- **@dnd-kit** - Drag and drop library
- **Zustand** - Lightweight state management
- **Socket.io-client** - WebSocket client
- **Axios** - HTTP client with interceptors

### Component Hierarchy

```
App
├── ProtectedRoute
│   ├── Dashboard
│   │   ├── CreateBoardModal
│   │   └── Board Cards
│   └── BoardView
│       ├── BoardList (multiple)
│       │   └── TaskCard (multiple)
│       ├── CreateListModal
│       └── CreateTaskModal
├── Login
└── Register
```

### State Management

**Zustand Stores:**

1. **authStore**
   - User authentication state
   - Login/logout actions
   - Token management
   - Auto-authentication on load

2. **boardStore**
   - Boards list
   - Current board with lists and tasks
   - CRUD operations
   - Real-time update handlers

**Why Zustand?**
- Minimal boilerplate compared to Redux
- Built-in TypeScript support
- No context providers needed
- Small bundle size (~1KB)

### Data Flow

1. **Initial Load**
   ```
   User navigates → Check auth → Fetch boards → Display dashboard
   ```

2. **Board View**
   ```
   Select board → Fetch board data → Join WebSocket room → Display board
   ```

3. **Task Update**
   ```
   User updates task → Optimistic UI update → API call → 
   WebSocket broadcast → Other clients receive update
   ```

### Routing Strategy

- **React Router v6** for client-side routing
- Protected routes with authentication check
- Dynamic routes for boards (`:id`)
- Redirect to login for unauthenticated users

### UI/UX Patterns

1. **Loading States**
   - Skeleton screens during data fetch
   - Shimmer effects for better UX
   - Loading spinners for actions

2. **Error Handling**
   - Toast notifications for errors
   - Inline error messages
   - Retry mechanisms

3. **Optimistic Updates**
   - Immediate UI feedback
   - Rollback on failure
   - Server confirmation

## Backend Architecture

### Technology Stack
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - WebSocket server
- **JWT** - Stateless authentication
- **bcryptjs** - Password hashing

### Layered Architecture

```
┌─────────────────────────────────────────┐
│          Routes Layer                    │
│  (HTTP endpoints, Socket events)        │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│       Controllers Layer                  │
│  (Business logic, request handling)     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Models Layer                     │
│  (Database schemas, validation)         │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Database Layer                   │
│  (MongoDB persistence)                  │
└─────────────────────────────────────────┘
```

### Request Flow

1. **HTTP Request**
   ```
   Client request → Middleware (auth) → Router → 
   Controller → Model → Database → Response
   ```

2. **WebSocket Event**
   ```
   Client emit → Socket auth → Event handler → 
   Broadcast to room → Other clients receive
   ```

### Middleware Chain

```javascript
Request
  ↓
CORS middleware
  ↓
JSON body parser
  ↓
Auth middleware (for protected routes)
  ↓
Route handler
  ↓
Error handler
  ↓
Response
```

### Authentication Flow

1. **Registration**
   ```
   User data → Validate → Hash password → 
   Create user → Generate JWT → Return token
   ```

2. **Login**
   ```
   Credentials → Find user → Compare password → 
   Generate JWT → Return token
   ```

3. **Protected Request**
   ```
   Token in header → Verify JWT → Decode user → 
   Attach to request → Continue
   ```

### Database Design

**Schema Relationships:**

```
User ──┬─── owns ───► Board ──┬─── contains ───► List ──┬─── contains ───► Task
       │                       │                         │
       └─ member of ───┘       └──────── tracks ────────► Activity
```

**Indexing Strategy:**

- **User**: email (unique)
- **Board**: owner, members, createdAt
- **List**: board + position (compound)
- **Task**: list + position, board, assignedTo
- **Activity**: board + createdAt (compound)

**Why MongoDB?**
- Flexible schema for rapid development
- Excellent for document-based data (boards, tasks)
- Built-in horizontal scaling (sharding)
- Good performance for read-heavy workloads

### Real-time Architecture

**Socket.io Room Strategy:**

```
Board A Room
├── User 1 socket
├── User 2 socket
└── User 3 socket

Board B Room
├── User 2 socket
└── User 4 socket
```

**Event Broadcasting:**

1. User performs action
2. Action saved to database
3. Emit event to board room
4. All users in room receive update
5. Users update their local state

**Why Socket.io?**
- Automatic fallback to long polling
- Room support out of the box
- Built-in reconnection logic
- Cross-browser compatibility

## API Design

### RESTful Principles

- **Resources**: boards, lists, tasks, users
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Status Codes**: 200, 201, 400, 401, 403, 404, 500
- **Consistent Response Format**

```typescript
{
  success: boolean,
  data: T | T[],
  message?: string,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

### Nested Resources

```
/api/boards/:boardId/lists          - Lists in a board
/api/boards/:listId/tasks           - Tasks in a list
/api/boards/:boardId/activities     - Activities in a board
```

### Query Parameters

- **Pagination**: `?page=1&limit=10`
- **Search**: `?q=searchterm`
- **Filters**: `?priority=high&status=todo`

## Security Considerations

### Implemented
1. **JWT Authentication**
   - Stateless tokens
   - Expiry time (7 days)
   - Bearer token in headers

2. **Password Security**
   - bcrypt hashing (10 rounds)
   - Never stored in plain text
   - Not returned in API responses

3. **Authorization**
   - Board access control
   - Owner vs member permissions
   - User can only modify their resources

4. **Input Validation**
   - Express-validator for inputs
   - Mongoose schema validation
   - Type checking with TypeScript

5. **CORS**
   - Configured for specific origin
   - Credentials support

### Production Recommendations
1. Use HTTPS only
2. Rate limiting on API endpoints
3. Helmet.js for security headers
4. MongoDB connection encryption
5. Environment variable management
6. CSRF protection for cookies
7. SQL injection prevention (NoSQL injection)
8. XSS protection

## Performance Optimization

### Current Optimizations

1. **Database**
   - Indexed fields for fast queries
   - Lean queries (plain objects)
   - Pagination for large datasets
   - Compound indexes for common queries

2. **Frontend**
   - Code splitting with React.lazy
   - Memoization for expensive computations
   - Debounced search input
   - Virtual scrolling ready

3. **API**
   - Gzip compression
   - Efficient query selection
   - Population only when needed
   - Connection pooling

### Future Optimizations

1. **Caching**
   - Redis for session data
   - CDN for static assets
   - Service worker for offline

2. **Database**
   - Read replicas for queries
   - Sharding by board ID
   - Archive old activities

3. **Real-time**
   - Redis adapter for Socket.io
   - Message queue for events
   - Clustered WebSocket servers

## Deployment Architecture

### Development
```
Frontend: localhost:3000 (Vite dev server)
Backend: localhost:5000 (ts-node)
Database: localhost:27017 (MongoDB)
```

### Production (Recommended)

```
┌─────────────┐
│   Nginx     │ (Reverse proxy, SSL termination)
└──────┬──────┘
       │
       ├─────► Frontend (Static files on CDN)
       │
       └─────► Backend (PM2 cluster)
                  │
                  └─────► MongoDB (Atlas/Self-hosted)
```

**Components:**
- **Frontend**: Build with `npm run build`, serve from CDN
- **Backend**: Run with PM2 in cluster mode
- **Database**: MongoDB Atlas or self-hosted with replica set
- **WebSocket**: Sticky sessions with load balancer

### Environment Variables

**Backend:**
- `PORT` - Server port
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - Secret for tokens
- `CORS_ORIGIN` - Allowed origins
- `NODE_ENV` - Environment flag

**Frontend:**
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - WebSocket server URL

## Testing Strategy

### Backend Testing

1. **Unit Tests**
   - Model validation
   - Utility functions
   - Middleware logic

2. **Integration Tests**
   - API endpoints
   - Database operations
   - Authentication flow

3. **E2E Tests**
   - Complete user flows
   - Real-time synchronization

### Frontend Testing

1. **Component Tests**
   - Render testing
   - User interactions
   - Props validation

2. **Integration Tests**
   - API integration
   - State management
   - Routing

3. **E2E Tests**
   - Full user journeys
   - Cross-browser testing

## Scalability Roadmap

### Phase 1 (Current)
- Single server architecture
- Direct MongoDB connection
- In-memory Socket.io

### Phase 2 (10K users)
- Load balancer
- Horizontal scaling of backend
- MongoDB replica set
- Redis for sessions

### Phase 3 (100K users)
- CDN for frontend
- Multiple backend clusters
- MongoDB sharding
- Redis adapter for Socket.io
- Message queue (RabbitMQ/Kafka)

### Phase 4 (1M+ users)
- Microservices architecture
- Dedicated real-time service
- Elasticsearch for search
- Analytics service
- Monitoring and alerting

## Monitoring and Logging

### Recommended Tools

1. **Application Performance**
   - New Relic / Datadog
   - Track API response times
   - Database query performance

2. **Error Tracking**
   - Sentry for error reporting
   - Winston for logging
   - Log aggregation (ELK stack)

3. **Real-time Metrics**
   - WebSocket connection count
   - Active users per board
   - Event throughput

## Conclusion

This architecture provides a solid foundation for a real-time collaboration platform with room for growth and optimization. The separation of concerns, type safety, and modern tooling ensure maintainability and scalability.
