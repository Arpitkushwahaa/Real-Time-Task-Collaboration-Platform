# Quick Start Guide

This guide will help you set up and run the Real-Time Task Collaboration Platform on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/downloads)
- **npm** or **yarn** - Comes with Node.js

Verify installations:
```bash
node --version  # Should be v18+
npm --version
mongo --version  # or mongod --version
```

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Arpitkushwahaa/Real-Time-Task-Collaboration-Platform.git
cd Real-Time-Task-Collaboration-Platform
```

### 2. Set Up MongoDB

#### Option A: Local MongoDB

**Windows:**
```bash
# Start MongoDB service
net start MongoDB
```

**macOS:**
```bash
# Using Homebrew
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod  # To start on boot
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Use it in the `.env` file

### 3. Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your settings
# Windows: notepad .env
# macOS/Linux: nano .env
```

**Backend `.env` configuration:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/task-collaboration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

> **Important:** Change `JWT_SECRET` to a random string for security!

```bash
# Start the backend server
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

### 4. Set Up Frontend

Open a **new terminal window** and:

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file
# Windows: notepad .env
# macOS/Linux: nano .env
```

**Frontend `.env` configuration:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

```bash
# Start the frontend development server
npm run dev
```

You should see:
```
  VITE v5.0.10  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Creating Your First Account

1. Click on **"Sign up"**
2. Fill in the registration form:
   - Name: Your Name
   - Email: your@email.com
   - Password: minimum 6 characters
3. Click **"Create Account"**
4. You'll be automatically logged in!

## Demo Credentials (Alternative)

You can also use these demo credentials:
- **Email:** demo@example.com
- **Password:** password123

> Note: You'll need to create this account first or register your own.

## Quick Feature Tour

### 1. Create a Board

1. Click **"Create Board"** button
2. Enter board name (e.g., "My First Project")
3. Choose a background color
4. Click **"Create Board"**

### 2. Add Lists

1. Open your board
2. Click **"Add List"**
3. Enter list name (e.g., "To Do", "In Progress", "Done")
4. Create multiple lists

### 3. Create Tasks

1. In any list, click **"Add Task"**
2. Fill in task details:
   - Title (required)
   - Description
   - Priority
   - Due date
   - Labels
3. Click **"Create Task"**

### 4. Drag and Drop

- Click and drag tasks between lists
- Reorder tasks within a list
- Changes sync in real-time!

### 5. Test Real-Time Features

1. Open the same board in two browser windows
2. Make changes in one window
3. Watch them appear instantly in the other!

## Troubleshooting

### MongoDB Connection Error

**Error:** "MongooseServerSelectionError"

**Solution:**
```bash
# Check if MongoDB is running
# Windows
sc query MongoDB

# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod

# Start MongoDB if not running
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Port Already in Use

**Error:** "Port 5000 is already in use"

**Solution:**
```bash
# Find and kill the process using the port

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Or change the port in backend/.env
PORT=5001
```

### Frontend Not Connecting to Backend

**Problem:** API calls failing

**Solution:**
1. Verify backend is running on port 5000
2. Check `frontend/.env` has correct API URL
3. Check browser console for CORS errors
4. Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL

### Dependencies Installation Failed

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### WebSocket Not Connecting

**Problem:** Real-time updates not working

**Solution:**
1. Check browser console for Socket.io errors
2. Verify WebSocket URL in `frontend/.env`
3. Ensure you're logged in (token is required)
4. Check if firewall is blocking WebSocket connections

## Development Tips

### Hot Reload

Both frontend and backend have hot reload enabled:
- **Frontend:** Vite automatically refreshes on file changes
- **Backend:** nodemon restarts server on file changes

### Database Management

**View data with MongoDB Compass:**
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://localhost:27017`
3. Browse the `task-collaboration` database

**Clear database:**
```bash
# Connect to MongoDB shell
mongosh

# Switch to database
use task-collaboration

# Drop all collections
db.dropDatabase()
```

### Testing API Endpoints

Use tools like:
- **Postman** - [Download](https://www.postman.com/downloads/)
- **Insomnia** - [Download](https://insomnia.rest/download)
- **Thunder Client** - VS Code extension

Import the API documentation from `API.md`

## Environment Variables Reference

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 5000 | Server port |
| NODE_ENV | No | development | Environment mode |
| MONGODB_URI | Yes | - | MongoDB connection string |
| JWT_SECRET | Yes | - | Secret for JWT tokens |
| JWT_EXPIRE | No | 7d | Token expiration time |
| CORS_ORIGIN | Yes | - | Allowed CORS origin |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| VITE_API_URL | Yes | - | Backend API URL |
| VITE_SOCKET_URL | Yes | - | WebSocket server URL |

## Next Steps

Now that you're set up:

1. **Explore the codebase** - Check out the architecture in `ARCHITECTURE.md`
2. **Read API docs** - Understand endpoints in `API.md`
3. **Customize** - Modify colors, features, or add new functionality
4. **Deploy** - See deployment instructions in `README.md`

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the logs in your terminal
3. Check browser console for frontend errors
4. Ensure all prerequisites are properly installed

## What's Next?

- [ ] Invite team members to test collaboration
- [ ] Customize board colors and themes
- [ ] Set up production deployment
- [ ] Add custom features
- [ ] Contribute to the project

Happy collaborating! 🎉
