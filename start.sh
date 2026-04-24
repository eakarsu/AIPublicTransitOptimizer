#!/bin/bash

# AI Public Transit Optimizer - Start Script
# This script cleans ports, sets up the database, seeds data, and starts the application

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════╗"
echo "║   AI Public Transit Optimizer                ║"
echo "║   Starting Application...                    ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
  echo -e "${RED}✗ .env file not found!${NC}"
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# Clean up ports
echo -e "${YELLOW}→ Cleaning up ports ${BACKEND_PORT} and ${FRONTEND_PORT}...${NC}"
lsof -ti:${BACKEND_PORT} | xargs kill -9 2>/dev/null || true
lsof -ti:${FRONTEND_PORT} | xargs kill -9 2>/dev/null || true
echo -e "${GREEN}✓ Ports cleaned${NC}"

# Check PostgreSQL
echo -e "${YELLOW}→ Checking PostgreSQL...${NC}"
if command -v pg_isready &> /dev/null; then
  if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} &>/dev/null; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
  else
    echo -e "${YELLOW}→ Starting PostgreSQL...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
      brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    else
      sudo systemctl start postgresql 2>/dev/null || true
    fi
    sleep 2
  fi
fi

# Create database if not exists
echo -e "${YELLOW}→ Setting up database...${NC}"
createdb ${DB_NAME:-transit_optimizer} 2>/dev/null || echo -e "${BLUE}  Database already exists${NC}"
echo -e "${GREEN}✓ Database ready${NC}"

# Install backend dependencies
echo -e "${YELLOW}→ Installing backend dependencies...${NC}"
cd backend
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Seed database
echo -e "${YELLOW}→ Seeding database with sample data...${NC}"
node src/seeds/index.js
echo -e "${GREEN}✓ Database seeded successfully${NC}"

# Start backend with nodemon (hot reload)
echo -e "${YELLOW}→ Starting backend server on port ${BACKEND_PORT}...${NC}"
npx nodemon src/server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo -e "${YELLOW}→ Waiting for backend to start...${NC}"
for i in {1..30}; do
  if curl -s http://localhost:${BACKEND_PORT}/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running on port ${BACKEND_PORT}${NC}"
    break
  fi
  sleep 1
done

# Install frontend dependencies
echo -e "${YELLOW}→ Installing frontend dependencies...${NC}"
cd frontend
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Start frontend (React dev server with hot reload)
echo -e "${YELLOW}→ Starting frontend on port ${FRONTEND_PORT}...${NC}"
BROWSER=none PORT=${FRONTEND_PORT} npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Application Started Successfully!          ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║   Frontend:  http://localhost:${FRONTEND_PORT}             ║${NC}"
echo -e "${GREEN}║   Backend:   http://localhost:${BACKEND_PORT}             ║${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║   Login:                                     ║${NC}"
echo -e "${GREEN}║   Email:    admin@transit.gov                 ║${NC}"
echo -e "${GREEN}║   Password: admin123                          ║${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║   Hot reload is enabled for both              ║${NC}"
echo -e "${GREEN}║   frontend and backend.                       ║${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║   Press Ctrl+C to stop all services.          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"

# Trap to clean up on exit
cleanup() {
  echo -e "\n${YELLOW}→ Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  lsof -ti:${BACKEND_PORT} | xargs kill -9 2>/dev/null || true
  lsof -ti:${FRONTEND_PORT} | xargs kill -9 2>/dev/null || true
  echo -e "${GREEN}✓ All services stopped${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
