# Frontend Environment Configuration Guide

## Overview
The frontend now supports environment variables for backend URL configuration, making it easy to deploy across different environments (development, staging, production).

## Files Changed

### 1. **`.env` (New)**
Located at: `client/.env`
- Contains development environment variables
- **DO NOT commit** this file (it's in `.gitignore`)
- Current content: `VITE_BACKEND_URL=http://localhost:5000`

### 2. **`.env.example` (New)**
Located at: `client/.env.example`
- Template file showing available environment variables
- **Safe to commit** for documentation
- Copy this file to `.env` and update with your specific values

### 3. **`vite.config.js` (Updated)**
- Now reads `VITE_BACKEND_URL` from `.env`
- Fallback to `http://localhost:5000` if not set
- Used for Vite dev server proxy configuration

### 4. **`src/api/axios.js` (Updated)**
- Supports both development and production modes:
  - **Development**: Uses `/api` (proxied by Vite dev server)
  - **Production**: Uses full backend URL from `VITE_BACKEND_URL`
- Automatically switches based on build environment

### 5. **`.gitignore` (Updated)**
- Added `.env` and `.env.local` to prevent committing sensitive configs

## How It Works

### Development Mode
```
User Request → Vite Dev Server (/api) → Proxy → Backend (http://localhost:5000)
```
- The Vite dev server proxy intercepts `/api` requests
- Routes them to the backend URL specified in `.env`
- Frontend axios module uses `/api` endpoint

### Production Mode (Build)
```
User Request → Frontend (build) → Direct Backend URL (from .env)
```
- Built frontend makes direct requests to backend
- Uses full URL: `http://your-backend-domain.com/api`
- Must be set during build time

## Setup Instructions

### For Development

1. **Ensure `.env` file exists** in `client/` directory:
   ```
   VITE_BACKEND_URL=http://localhost:5000
   ```

2. **Start the dev server**:
   ```bash
   cd client
   npm run dev
   ```

3. **The Vite proxy** will automatically route `/api` requests to the backend

### For Production Deployment

1. **Create `.env` file** before building:
   ```bash
   cd client
   cp .env.example .env
   ```

2. **Update backend URL**:
   ```
   VITE_BACKEND_URL=https://your-backend-domain.com
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Deploy the `dist` folder** to your hosting platform

### Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_BACKEND_URL` | Backend server URL | `http://localhost:5000` or `https://api.example.com` |

## Important Notes

- ✅ **Prefix Variables with `VITE_`**: Only variables starting with `VITE_` are exposed to the frontend code
- ✅ **Set Before Build**: Environment variables are baked into the build, so set them before running `npm run build`
- ✅ **Security**: Keep sensitive data in `.env` (never in `.env.example`)
- ✅ **Different Domains**: Make sure your backend has CORS enabled to accept requests from your frontend domain

## Deploying to Different Environments

### Example: Vercel
1. Go to Project Settings → Environment Variables
2. Add: `VITE_BACKEND_URL` = your backend URL
3. Deploy - the value will be used during build

### Example: Netlify
1. Site Settings → Build & deploy → Environment
2. Add: `VITE_BACKEND_URL` = your backend URL
3. Redeploy - the value will be used during build

### Example: Docker
In your Dockerfile:
```dockerfile
ARG VITE_BACKEND_URL=http://localhost:5000
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN npm run build
```

## Testing

### Development
```bash
npm run dev
# Test at http://localhost:5173
```

### Production Build
```bash
npm run build
npm run preview  # Preview the built app locally
```

## Troubleshooting

### "Cannot POST /api/auth/login" in Production
- ✅ Check `VITE_BACKEND_URL` is set correctly
- ✅ Verify backend is running at that URL
- ✅ Check CORS settings on backend

### Requests work in dev but not production
- ✅ Ensure you rebuilt after changing `VITE_BACKEND_URL`
- ✅ Check network tab - verify full backend URL is being used
- ✅ Clear browser cache

### .env file is not being detected
- ✅ Ensure file is in `client/` directory (not `client/src/`)
- ✅ Restart Vite dev server after creating `.env`
- ✅ Check filename is exactly `.env` (no typos)
