# Deployment Guide — CrestPay (Bank Transaction System)

This guide documents the complete procedure to deploy this project on **Render** after development is complete.

---

## Project Architecture

A single **Node.js Web Service** on Render that:
- Serves the Express API at `/api/*`
- Builds the React (Vite) client and serves it as static files
- Uses MongoDB Atlas as the database

```
Browser → https://crestpay.onrender.com
              ↓
         Express Server
         ├── /api/*        → REST API
         └── /*            → React SPA (client/dist)
```

---

## Pre-Deployment Checklist

### 1. Fix Express 5 Wildcard Route

Express 5 uses `path-to-regexp` v8 which no longer accepts bare `*`. Use a named wildcard:

```js
// ❌ Wrong (Express 4 syntax)
app.get("*", (req, res) => { ... })

// ✅ Correct (Express 5 syntax)
app.get("*path", (_req, res) => { ... })
```

### 2. Set Production API URL in Client

Create `client/.env.production`:

```env
VITE_API_URL=https://your-app-name.onrender.com/api
```

Update `client/src/api/axios.js` to read from the env var:

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
```

### 3. Configure CORS on Server

In `server/index.js`, add your Render domain to the allowed origins:

```js
const allowed = [
  process.env.CLIENT_URL,
  'https://your-app-name.onrender.com',
  'http://localhost:5173',
].filter(Boolean);
```

### 4. Set the Build & Start Scripts in Root `package.json`

```json
{
  "scripts": {
    "build": "npm install --prefix client && npm run build --prefix client",
    "start": "node server/index.js",
    "dev": "nodemon server/index.js"
  }
}
```

- `build` — installs client deps and runs `vite build`
- `start` — runs the server with `node` (not `nodemon`) for production
- `dev` — uses `nodemon` for local development only

### 5. Serve the Client from Express

In `server/index.js`, serve the built React app:

```js
import path from "path";

const __dirname = path.resolve();

// Serve static files from client/dist
app.use(express.static(path.join(__dirname, "/client/dist")));

// Catch-all: send index.html for any non-API route (SPA routing)
app.get("*path", (_req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
});
```

### 6. Create a `.gitignore` at the Root

```gitignore
node_modules/
client/node_modules/
server/node_modules/
client/dist/
.env
server/.env
.DS_Store
*.log
```

> ⚠️ Never commit `.env` files. Add all secrets manually in Render's dashboard.

---

## Setting Up Git & GitHub

```bash
# Initialize repo
git init
git branch -m main

# Stage all files (node_modules and .env are excluded by .gitignore)
git add .
git commit -m "Initial commit"

# Add your GitHub remote and push
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

---

## Deploying on Render

### Step 1 — Create a Web Service

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure the service:

| Setting | Value |
|---|---|
| **Environment** | Node |
| **Root Directory** | *(leave blank)* |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

### Step 2 — Add Environment Variables

In Render dashboard → **Environment** → **Environment Variables**, add:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URL` | Your MongoDB Atlas connection string |
| `SECRET_KEY` | Your JWT secret key |
| `CLIENT_URL` | `https://your-app-name.onrender.com` |
| `PORT` | *(leave blank — Render sets this automatically)* |

> ⚠️ Do NOT add `PORT` manually. Render injects it automatically.

### Step 3 — Deploy

Click **Create Web Service**. Render will:
1. Clone your repo
2. Run `npm install` (installs server deps)
3. Run `npm run build` (installs client deps + runs `vite build`)
4. Run `npm start` (starts the Express server)

---

## Pushing Updates After Deployment

Every time you push to `main`, Render auto-deploys (if auto-deploy is enabled).

```bash
git add .
git commit -m "your message"
git push origin main
```

To enable auto-deploy: Render Dashboard → Settings → Build & Deploy → Auto-Deploy → **Yes**

To manually redeploy: Render Dashboard → **Manual Deploy** → **Deploy latest commit**

---

## Common Errors & Fixes

### `PathError: Missing parameter name at index 1: *`
**Cause:** Express 5 doesn't accept bare `*` as a wildcard.  
**Fix:** Change `app.get("*", ...)` to `app.get("*path", ...)`

### `nodemon: command not found`
**Cause:** Root `node_modules` was deleted or never installed.  
**Fix:** Run `npm install` from the project root.

### `MONGO_URL is undefined`
**Cause:** `dotenv.config()` looks for `.env` in the current working directory, but the file is in `server/`.  
**Fix:** Use an explicit path:
```js
dotenv.config({ path: new URL('.env', import.meta.url).pathname });
```
Or move `.env` to the project root.

### `Permission denied` on macOS (imported from Windows)
**Cause:** Windows NTFS doesn't preserve Unix execute bits. `node_modules/.bin` executables lose their `+x` permission.  
**Fix:** Delete all `node_modules` folders and reinstall:
```bash
rm -rf node_modules client/node_modules server/node_modules
npm install
npm install --prefix client
npm install --prefix server
```

---

## Local Development

```bash
# Terminal 1 — Start the backend
npm run dev

# Terminal 2 — Start the frontend
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
