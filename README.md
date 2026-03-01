# Lost Pet Reunion Board - *Bringing furry friends home*

> A fast, compassionate platform for reuniting lost pets with their families. People post _Lost_ alerts with photos & last-seen loction; others post _Sightings_ or _Found notices_. Smart location + time matching surfaces likely reunions so panicked owners and helpful finders connect quickly.

## About

**Lost Pet Reunion Board** helps reunite lost pets with their families by making posting and finding pets quick and intuitive. Key user flows:

- Owner posts a _Lost Alert_ (photos, last seen location, time, contact method).
- Finder posts a _Sightings_ or _Found notice_ (photo, location, notes).
- System surfaces matches (nearby sightings, similar photos, matching tags) and notifies both parties.
- Optional: community verification, reward tracking, integration with local shelters, and real-time chat.

## Tech stack (decided for this cohort)

- Frontend: React + Vite
- Backend: Nodejs (Express)
- Database: PostgreSQL
- Auth: JWT (Json Web Token); social logins later
- Testing: Vites(frontend) + Jest(backend)
- CI/CD: Github Actions (tests, init, build, deploy)

## Repository structure

```
rose-camellia/
├── frontend/          # React + Vite application
├── backend/           # Express API server
└── API_DOCUMENTATION.md   # Complete API reference

```

## Quick start

These are the _minimal_ steps to start testing and contributing fast.

1. Clone

```
git clone https://github.com/nhcarrigan-spring-2026-cohort/rose-camellia/
cd rose-camellia
```

2. Copy env

```
cp .env.example backend/.env
```

3. Backend

```
cd ../backend
npm install
npx prisma migrate dev    # Run database migrations
npx prisma generate       # Generate Prisma Client
npm run dev               # Start backend server (port 3000)
```

4. Frontend

```
cd ../frontend
npm install
npm run dev
```

Open the front-end and try posting a dummy Lost Alert. Congrats -- you're running the app locally.

---

## Testing the Backend API

### Prerequisites

- Backend server running: `npm run dev` in `backend/` directory
- **Windows users:** Use Git Bash or WSL to run test scripts

### Available Test Scripts

All test scripts are located in the `backend/` directory.

#### Reset Test Data

Clears all test data from the database:

```bash
cd backend
./reset-test-data.sh
```

#### Run Full API Test Suite

Tests all endpoints (auth, posts, comments, images, users):

```bash
./test-complete-api.sh
```

Expected: 19/24 tests passing (5 failures are cosmetic jq errors from rate limiting)

#### Test Verification System

Tests the pet ownership verification flow:

```bash
./test-verification.sh
```

### For Windows Users

**Option 1: Git Bash (Recommended)**

1. Install [Git for Windows](https://gitforwindows.org/) (includes Git Bash)
2. Open Git Bash in the `backend/` directory
3. Run the scripts as shown above

**Option 2: WSL (Windows Subsystem for Linux)**

1. Install [WSL](https://docs.microsoft.com/en-us/windows/wsl/install)
2. Open WSL terminal
3. Navigate to backend directory
4. Run the scripts

### Manual API Testing

You can also test endpoints manually using curl:

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","name":"Test User","email":"test@example.com","password":"TestPass123"}'

# See API_DOCUMENTATION.md for all endpoints
```

---
