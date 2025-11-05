# LostNFound Frontend

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and adjust the API base URL if your backend runs on a different host/port (in development, the Vite proxy forwards `/api` to `http://localhost:4000` by default):
   ```bash
   cp .env.example .env
   ```

## Development
```bash
npm run dev
```

## Production Build
```bash
npm run build
```
