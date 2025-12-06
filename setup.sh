#!/bin/bash
# setup.sh - Quick setup script for CourseTracker

echo "🚀 CourseTracker Setup Script"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is not detected. You can use MongoDB Atlas instead.${NC}"
else
    echo -e "${GREEN}✅ MongoDB detected${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Backend setup
echo "🔧 Setting up backend..."
cd server

if [ ! -f package.json ]; then
    echo -e "${RED}❌ Backend package.json not found${NC}"
    exit 1
fi

npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend dependencies installation failed${NC}"
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating backend .env file..."
    cat > .env << EOF
MONGO_URI=mongodb://localhost:27017/course-tracker
JWT_SECRET=$(openssl rand -base64 32)
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
EOF
    echo -e "${GREEN}✅ Backend .env created${NC}"
else
    echo -e "${YELLOW}⚠️  Backend .env already exists${NC}"
fi

# Create uploads directory
mkdir -p uploads
touch uploads/.gitkeep

echo -e "${GREEN}✅ Backend setup complete${NC}"
echo ""

# Frontend setup
echo "🔧 Setting up frontend..."
cd ../client

if [ ! -f package.json ]; then
    echo -e "${RED}❌ Frontend package.json not found${NC}"
    exit 1
fi

npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend dependencies installation failed${NC}"
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating frontend .env file..."
    cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF
    echo -e "${GREEN}✅ Frontend .env created${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend .env already exists${NC}"
fi

echo -e "${GREEN}✅ Frontend setup complete${NC}"
echo ""

cd ..

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Start MongoDB (if using local):"
echo -e "   ${YELLOW}mongod${NC}"
echo ""
echo "2. Start the backend (in server directory):"
echo -e "   ${YELLOW}cd server && npm run dev${NC}"
echo ""
echo "3. Start the frontend (in client directory, new terminal):"
echo -e "   ${YELLOW}cd client && npm run dev${NC}"
echo ""
echo "4. Open your browser:"
echo -e "   ${YELLOW}http://localhost:5173${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"

# start.sh - Start both backend and frontend
#!/bin/bash

echo "🚀 Starting CourseTracker..."
echo ""

# Check if tmux is installed
if command -v tmux &> /dev/null; then
    echo "Starting with tmux..."
    
    # Create new tmux session
    tmux new-session -d -s coursetracker
    
    # Split window
    tmux split-window -h
    
    # Start backend in left pane
    tmux send-keys -t coursetracker:0.0 'cd server && npm run dev' C-m
    
    # Start frontend in right pane
    tmux send-keys -t coursetracker:0.1 'cd client && npm run dev' C-m
    
    # Attach to session
    tmux attach-session -t coursetracker
else
    echo "Starting backend and frontend in background..."
    echo "Note: Install tmux for better experience (brew install tmux / apt-get install tmux)"
    echo ""
    
    # Start backend
    cd server
    npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo "✅ Backend started (PID: $BACKEND_PID)"
    
    # Start frontend
    cd ../client
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "✅ Frontend started (PID: $FRONTEND_PID)"
    
    echo ""
    echo "📝 Logs:"
    echo "   Backend: tail -f backend.log"
    echo "   Frontend: tail -f frontend.log"
    echo ""
    echo "🛑 To stop:"
    echo "   kill $BACKEND_PID $FRONTEND_PID"
    
    # Save PIDs
    echo "$BACKEND_PID" > .backend.pid
    echo "$FRONTEND_PID" > .frontend.pid
fi

# stop.sh - Stop all services
#!/bin/bash

echo "🛑 Stopping CourseTracker..."

# Stop tmux session if exists
if tmux has-session -t coursetracker 2>/dev/null; then
    tmux kill-session -t coursetracker
    echo "✅ Tmux session stopped"
fi

# Stop processes by PID
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    kill $BACKEND_PID 2>/dev/null
    rm .backend.pid
    echo "✅ Backend stopped"
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    kill $FRONTEND_PID 2>/dev/null
    rm .frontend.pid
    echo "✅ Frontend stopped"
fi

# Kill any remaining node processes on those ports
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo "✅ All services stopped"

# install-all.sh - Install dependencies for both
#!/bin/bash

echo "📦 Installing all dependencies..."
echo ""

echo "Installing backend dependencies..."
cd server && npm install
echo "✅ Backend dependencies installed"
echo ""

echo "Installing frontend dependencies..."
cd ../client && npm install
echo "✅ Frontend dependencies installed"
echo ""

echo "🎉 All dependencies installed!"

# clean.sh - Clean all node_modules and builds
#!/bin/bash

echo "🧹 Cleaning project..."
echo ""

# Remove backend node_modules
if [ -d "server/node_modules" ]; then
    echo "Removing server/node_modules..."
    rm -rf server/node_modules
    echo "✅ Backend node_modules removed"
fi

# Remove frontend node_modules
if [ -d "client/node_modules" ]; then
    echo "Removing client/node_modules..."
    rm -rf client/node_modules
    echo "✅ Frontend node_modules removed"
fi

# Remove build directories
if [ -d "client/dist" ]; then
    echo "Removing client/dist..."
    rm -rf client/dist
    echo "✅ Frontend build removed"
fi

# Remove logs
rm -f backend.log frontend.log

echo ""
echo "🎉 Cleanup complete!"
echo "Run ./install-all.sh to reinstall dependencies"

# Make scripts executable:
# chmod +x setup.sh start.sh stop.sh install-all.sh clean.sh
