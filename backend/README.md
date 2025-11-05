# LostNFound API

## Prerequisites
- Node.js 18+
- MongoDB Atlas cluster credentials

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and confirm the MongoDB connection string:
   ```bash
   cp .env.example .env
   ```
3. (Optional) Adjust `DB_NAME` or `PORT` in the `.env` file.

## Development
Run the API locally with hot reloading:
```bash
npm run dev
```

## Production
Start the API without hot reloading:
```bash
npm start
```

The API listens on `http://localhost:4000` by default and exposes:
- `POST /api/users` – create a new user document in the `Users` collection (validates unique email).
- `GET /health` – simple readiness probe.
