# API Documentation

Base URL: `http://localhost:5000/api`

## Table of Contents

1. [Authentication](#authentication)
2. [Boards](#boards)
3. [Lists](#lists)
4. [Tasks](#tasks)
5. [Activities](#activities)
6. [Error Handling](#error-handling)
7. [WebSocket Events](#websocket-events)

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": ""
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `400` - User already exists
- `400` - Validation error

---

### Login

Authenticate and receive a JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": ""
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `400` - Email and password required
- `401` - Invalid credentials

---

### Get Current User

Get the authenticated user's information.

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": ""
  }
}
```

**Errors:**
- `401` - Not authorized

---

## Boards

### Get All Boards

Fetch all boards where the user is owner or member.

**Endpoint:** `GET /boards`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Marketing Campaign",
      "description": "Q1 2024 Marketing",
      "owner": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": ""
      },
      "members": [...],
      "backgroundColor": "#0079bf",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

### Get Single Board

Fetch a specific board with all lists and tasks.

**Endpoint:** `GET /boards/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Marketing Campaign",
    "description": "Q1 2024 Marketing",
    "owner": {...},
    "members": [...],
    "backgroundColor": "#0079bf",
    "lists": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "To Do",
        "board": "507f1f77bcf86cd799439011",
        "position": 0,
        "tasks": [
          {
            "_id": "507f1f77bcf86cd799439013",
            "title": "Design homepage",
            "description": "Create mockups for new homepage",
            "list": "507f1f77bcf86cd799439012",
            "board": "507f1f77bcf86cd799439011",
            "position": 0,
            "assignedTo": [...],
            "dueDate": "2024-12-31T00:00:00.000Z",
            "priority": "high",
            "labels": ["design", "urgent"],
            "createdAt": "2024-01-15T10:30:00.000Z",
            "updatedAt": "2024-01-15T10:30:00.000Z"
          }
        ],
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `404` - Board not found
- `403` - Not authorized to access this board

---

### Create Board

Create a new board.

**Endpoint:** `POST /boards`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Marketing Campaign",
  "description": "Q1 2024 Marketing",
  "backgroundColor": "#0079bf"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Marketing Campaign",
    "description": "Q1 2024 Marketing",
    "owner": {...},
    "members": [...],
    "backgroundColor": "#0079bf",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `400` - Validation error

---

### Update Board

Update an existing board.

**Endpoint:** `PUT /boards/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    ...updated board
  }
}
```

**Errors:**
- `404` - Board not found
- `403` - Not authorized (only owner can update)

---

### Delete Board

Delete a board and all its lists and tasks.

**Endpoint:** `DELETE /boards/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {}
}
```

**Errors:**
- `404` - Board not found
- `403` - Not authorized (only owner can delete)

---

### Add Member to Board

Add a user to a board.

**Endpoint:** `POST /boards/:id/members`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439014"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    ...board with updated members
  }
}
```

**Errors:**
- `404` - Board not found
- `403` - Not authorized (only owner can add members)
- `400` - User is already a member

---

## Lists

### Create List

Create a new list in a board.

**Endpoint:** `POST /boards/:boardId/lists`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "To Do"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "To Do",
    "board": "507f1f77bcf86cd799439011",
    "position": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `404` - Board not found
- `403` - Not authorized

---

### Update List

Update a list's title.

**Endpoint:** `PUT /lists/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "In Progress"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    ...updated list
  }
}
```

---

### Delete List

Delete a list and all its tasks.

**Endpoint:** `DELETE /lists/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {}
}
```

---

### Move List

Change a list's position.

**Endpoint:** `PUT /lists/:id/move`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "position": 2
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    ...updated list
  }
}
```

---

## Tasks

### Create Task

Create a new task in a list.

**Endpoint:** `POST /boards/:listId/tasks`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Design homepage",
  "description": "Create mockups for new homepage",
  "priority": "high",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "labels": ["design", "urgent"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Design homepage",
    "description": "Create mockups for new homepage",
    "list": "507f1f77bcf86cd799439012",
    "board": "507f1f77bcf86cd799439011",
    "position": 0,
    "assignedTo": [],
    "dueDate": "2024-12-31T00:00:00.000Z",
    "priority": "high",
    "labels": ["design", "urgent"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Update Task

Update a task's properties.

**Endpoint:** `PUT /tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated title",
  "priority": "medium"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    ...updated task
  }
}
```

---

### Delete Task

Delete a task.

**Endpoint:** `DELETE /tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {}
}
```

---

### Move Task

Move a task to a different list or position.

**Endpoint:** `PUT /tasks/:id/move`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "listId": "507f1f77bcf86cd799439015",
  "position": 1
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    ...updated task
  }
}
```

---

### Assign Task

Assign a user to a task.

**Endpoint:** `POST /tasks/:id/assign`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439014"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    ...task with updated assignees
  }
}
```

---

### Search Tasks

Search for tasks in a board.

**Endpoint:** `GET /boards/:boardId/tasks/search`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `q` (required) - Search query

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    ...matching tasks
  ]
}
```

---

## Activities

### Get Activities

Get activity history for a board.

**Endpoint:** `GET /boards/:boardId/activities`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "board": "507f1f77bcf86cd799439011",
      "user": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": ""
      },
      "action": "created",
      "entityType": "task",
      "entityId": "507f1f77bcf86cd799439013",
      "details": {
        "title": "Design homepage"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

### Common Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## WebSocket Events

Connect to WebSocket server:
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Client -> Server Events

#### Join Board
```javascript
socket.emit('join-board', boardId);
```

#### Leave Board
```javascript
socket.emit('leave-board', boardId);
```

#### Broadcast Updates
```javascript
socket.emit('task-created', { boardId, task });
socket.emit('task-updated', { boardId, task });
socket.emit('task-deleted', { boardId, taskId });
socket.emit('task-moved', { boardId, task, oldListId });
socket.emit('list-created', { boardId, list });
socket.emit('list-updated', { boardId, list });
socket.emit('list-deleted', { boardId, listId });
```

### Server -> Client Events

Listen for real-time updates:

```javascript
socket.on('task-created', (data) => {
  // Handle new task
});

socket.on('task-updated', (data) => {
  // Handle task update
});

socket.on('task-deleted', (data) => {
  // Handle task deletion
});

socket.on('task-moved', (data) => {
  // Handle task movement
});

socket.on('list-created', (data) => {
  // Handle new list
});

socket.on('list-updated', (data) => {
  // Handle list update
});

socket.on('list-deleted', (data) => {
  // Handle list deletion
});
```

---

## Rate Limiting

Currently not implemented. Recommended for production:
- Authentication endpoints: 5 requests per minute
- API endpoints: 100 requests per minute
- WebSocket connections: 10 per user

---

## Versioning

Current version: `v1`

Future versions will use URL versioning:
- `http://localhost:5000/api/v1/...`
- `http://localhost:5000/api/v2/...`
