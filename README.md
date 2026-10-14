# Secure Notes — React Frontend

React + Vite + TypeScript + React Router + Tailwind client for the Secure Notes API.
The backend (unchanged) lives in `../secure-notes-api/` and still serves its
minimal page from `public/`.

## Setup

```bash
cd client
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:5000/api
npm install
```

## Run

```bash
# backend (from ../secure-notes-api, needs MongoDB + .env)
npm test        # 17 passing tests
npm run dev     # http://localhost:5000

# frontend (from client/)
npm run dev     # http://localhost:3000
npm run build   # production build into dist/
```

Test accounts: register via the UI, or promote one with
`npm run seed:admin` in the backend, or `POST /api/users` as an admin.
# secure-notes-client
