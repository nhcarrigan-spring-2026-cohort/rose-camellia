# Lost Pet Reunion Board - *Brining furry friends home*

> A fast, compassionate platform for reuniting lost pets with their families. People post *Lost* alerts with photos & last-seen loction; others post *Sightings* or *Found notices*. Smart location + time matching surfaces likely reunions so panicked owners and helpful finders connect quickly.

## About
**Lost Pet Reunion Board** helps reunite lost pets with their families by making posting and finding pets quick and intuitive. Key user flows:
- Owner posts a *Lost Alert* (photos, last seen location, time, contact method).
- Finder posts a *Sightings* or *Found notice* (photo, location, notes).
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

```

## Quick start 
These are the *minimal* steps to start testing and contributing fast.
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
npm run dev
```
4. Frontend
```
cd ../frontend
npm install
npm run dev
```
Open the front-end and try posting a dummy Lost Alert. Congrats -- you're running the app locally.