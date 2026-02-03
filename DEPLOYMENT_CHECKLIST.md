# Deployment Checklist

Use this checklist to ensure your app is ready for deployment.

## Pre-Deployment

- [ ] Test locally: `npm run build && npm start`
- [ ] Verify all features work in production build
- [ ] Check that database connection works
- [ ] Ensure `.env` is in `.gitignore` (never commit secrets!)

## Database Setup

- [ ] Create Neon account at [neon.tech](https://neon.tech)
- [ ] Create new PostgreSQL project
- [ ] Copy connection string (looks like: `postgresql://user:pass@host/db?sslmode=require`)
- [ ] Test connection locally with the connection string

## Choose Your Platform

### Railway (Easiest - Recommended)
- [ ] Sign up at [railway.app](https://railway.app)
- [ ] Connect GitHub repository
- [ ] Add environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL=your_neon_connection_string`
  - [ ] `USE_DATABASE=true`
- [ ] Deploy and get your URL

### Render
- [ ] Sign up at [render.com](https://render.com)
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set build command: `npm install && npm run build`
- [ ] Set start command: `npm start`
- [ ] Add environment variables (same as Railway)
- [ ] Deploy

### Fly.io
- [ ] Install Fly CLI
- [ ] Run `fly auth signup`
- [ ] Run `fly launch`
- [ ] Set secrets: `fly secrets set DATABASE_URL=...`
- [ ] Deploy: `fly deploy`

## Post-Deployment

- [ ] Test app on desktop browser
- [ ] Test app on mobile browser
- [ ] Verify database tables were created
- [ ] Test creating a goal
- [ ] Test creating a task
- [ ] Check deployment logs for errors
- [ ] Bookmark the URL on your phone

## Mobile Access

- [ ] Open URL on iPhone/Android
- [ ] Add to home screen (optional)
- [ ] Test all features on mobile
- [ ] Verify responsive design works

## Optional Enhancements

- [ ] Set up custom domain
- [ ] Enable auto-deploy from GitHub
- [ ] Set up database backups
- [ ] Configure monitoring/alerts

---

**Quick Start Command:**
```bash
# Test production build locally first
npm run build && npm start
```

Then follow the platform-specific steps in `DEPLOYMENT.md`
