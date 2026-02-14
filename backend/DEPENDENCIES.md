# New Dependencies Added

This document lists all new dependencies added to the backend in the `feature/auth-and-api-controllers` branch.

## Production Dependencies

### express-rate-limit (^8.2.1)
**Purpose:** Rate limiting middleware to prevent abuse  
**Usage:** Protects endpoints from spam/brute-force attacks  
**Config:**
- Guest creation: 3 per IP per 15 min
- Auth endpoints: 10 per IP per 15 min  
- General API: 100 per IP per minute

### zod (^4.3.6)
**Purpose:** TypeScript-first schema validation  
**Usage:** Validates all API request bodies  
**Benefits:**
- Strong type safety
- Clear error messages
- Prevents invalid data from reaching database

## Development Dependencies

### tsx (^4.21.0)
**Purpose:** TypeScript execution engine  
**Usage:** Replaces ts-node for faster development  
**Why:** Better performance and TypeScript 5+ support

## Updated npm Scripts
```json
{
  "dev": "nodemon --watch src --ext ts --exec tsx src/index.ts"
}
```

Changed from basic nodemon to watch src directory specifically and use tsx for execution.

## Installation

When merging this branch, run:
```bash
npm install
```

All dependencies will be installed automatically from package.json.

## Environment Variables Required

Ensure `.env` includes:
```
JWT_SECRET=your-secret-key-here
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
PORT=3000
```
