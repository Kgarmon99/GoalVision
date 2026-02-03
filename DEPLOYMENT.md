# Deployment Guide

This guide will help you deploy GoalVision to the cloud so you can access it from anywhere - on your computer, phone, or any device with a web browser.

## Quick Start - Choose Your Platform

### Option 1: Railway (Recommended - Easiest) ⭐
**Best for**: Quick deployment, free tier available, automatic HTTPS

### Option 2: Render
**Best for**: Simple setup, free tier, good documentation

### Option 3: Fly.io
**Best for**: Global deployment, edge computing

---

## 🚂 Railway Deployment (Recommended)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (easiest option)

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account if needed
4. Select your GoalVision repository

### Step 3: Set Environment Variables
1. In your Railway project, go to "Variables"
2. Add these environment variables:

```
NODE_ENV=production
DATABASE_URL=your_neon_database_url_here
USE_DATABASE=true
```

**To get a database URL:**
- Go to [neon.tech](https://neon.tech) (free PostgreSQL)
- Create a new project
- Copy the connection string
- Paste it as `DATABASE_URL`

### Step 4: Deploy
1. Railway will automatically detect your project
2. It will run `npm run build` then `npm start`
3. Wait for deployment to complete (2-5 minutes)

### Step 5: Get Your URL
1. Click on your service
2. Go to "Settings" → "Generate Domain"
3. Railway will give you a URL like: `goalvision-production.up.railway.app`
4. **That's your app URL!** Access it from anywhere 🎉

### Step 6: Set Up Database (First Time Only)
1. In Railway, open the "Deploy Logs"
2. You'll see if the database connection worked
3. If you need to run migrations, use Railway's CLI or add a one-time command

---

## 🎨 Render Deployment

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your GoalVision repo

### Step 3: Configure Service
- **Name**: `goalvision` (or any name you like)
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free (or paid if you prefer)

### Step 4: Add Environment Variables
Click "Environment" and add:

```
NODE_ENV=production
DATABASE_URL=your_neon_database_url_here
USE_DATABASE=true
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Render will build and deploy automatically
3. Wait 3-5 minutes for first deployment

### Step 6: Get Your URL
- Render automatically gives you a URL like: `goalvision.onrender.com`
- **That's your app URL!** 🎉

---

## ✈️ Fly.io Deployment

### Step 1: Install Fly CLI
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

### Step 2: Sign Up
```bash
fly auth signup
```

### Step 3: Deploy
```bash
# From your project directory
fly launch

# Follow the prompts:
# - App name: goalvision (or your choice)
# - Region: Choose closest to you
# - Database: No (we'll use Neon separately)
```

### Step 4: Set Environment Variables
```bash
fly secrets set NODE_ENV=production
fly secrets set DATABASE_URL=your_neon_database_url_here
fly secrets set USE_DATABASE=true
```

### Step 5: Deploy
```bash
fly deploy
```

### Step 6: Get Your URL
```bash
fly open
```
This opens your app in the browser! Your URL will be like: `goalvision.fly.dev`

---

## 📱 Mobile Access

Once deployed, your app will work on:
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iPhone Safari, Android Chrome)
- ✅ Tablets
- ✅ Any device with a web browser

Just open the URL in any browser - no app installation needed!

---

## 🔧 Database Setup

### Using Neon (Free PostgreSQL)

1. **Create Account**: Go to [neon.tech](https://neon.tech)
2. **Create Project**: Click "New Project"
3. **Get Connection String**: 
   - Go to your project dashboard
   - Click "Connection Details"
   - Copy the connection string
   - It looks like: `postgresql://user:password@host/dbname?sslmode=require`

4. **Add to Environment Variables**: Paste as `DATABASE_URL` in your deployment platform

### First-Time Database Setup

The app will automatically create tables on first run. If you need to manually run migrations:

```bash
# In Railway: Use Railway CLI or add a one-time command
# In Render: Add a "Background Worker" with command: npm run db:push
# In Fly.io: fly ssh console, then npm run db:push
```

---

## 🔒 Security & Best Practices

1. **HTTPS**: All platforms provide free SSL certificates automatically
2. **Environment Variables**: Never commit `.env` files to GitHub
3. **Database**: Use connection pooling for production
4. **Monitoring**: Check your platform's logs regularly

---

## 🐛 Troubleshooting

### App Won't Start
- Check environment variables are set correctly
- Verify `DATABASE_URL` is valid
- Check deployment logs for errors

### Database Connection Issues
- Verify `DATABASE_URL` includes `?sslmode=require`
- Check database is accessible from internet (Neon is by default)
- Ensure `USE_DATABASE=true` is set

### Build Fails
- Check `package.json` has correct build script
- Verify all dependencies are in `dependencies` (not just `devDependencies`)
- Check platform logs for specific errors

### Can't Access from Phone
- Make sure you're using the HTTPS URL (not HTTP)
- Clear browser cache
- Try incognito/private mode

---

## 📊 Platform Comparison

| Feature | Railway | Render | Fly.io |
|---------|---------|--------|--------|
| Free Tier | ✅ Yes | ✅ Yes | ✅ Yes |
| Auto HTTPS | ✅ Yes | ✅ Yes | ✅ Yes |
| Easy Setup | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Global CDN | ❌ | ❌ | ✅ Yes |
| Custom Domain | ✅ Free | ✅ Free | ✅ Free |

---

## 🎯 Recommended: Railway

For most users, **Railway is the easiest**:
- ✅ Simplest setup
- ✅ Automatic deployments from GitHub
- ✅ Free tier with generous limits
- ✅ Great documentation
- ✅ Mobile-friendly URLs

---

## 🚀 Next Steps After Deployment

1. **Test on Your Phone**: Open the URL in your mobile browser
2. **Bookmark It**: Add to home screen for quick access
3. **Share with Team**: Send the URL to anyone who needs access
4. **Set Up Custom Domain** (optional): Add your own domain name
5. **Monitor Usage**: Check your platform dashboard regularly

---

## 💡 Pro Tips

- **Auto-Deploy**: Connect GitHub for automatic deployments on every push
- **Custom Domain**: Add your own domain for a professional URL
- **Backup Database**: Set up regular backups in Neon dashboard
- **Monitor Logs**: Check deployment logs if something breaks
- **Test Locally First**: Always test `npm run build && npm start` locally before deploying

---

## 📞 Need Help?

If you run into issues:
1. Check the deployment logs in your platform dashboard
2. Verify all environment variables are set
3. Test the database connection separately
4. Check the [Troubleshooting](#-troubleshooting) section above

---

**You're all set!** Once deployed, you can access your GoalVision app from anywhere in the world. 🌍
