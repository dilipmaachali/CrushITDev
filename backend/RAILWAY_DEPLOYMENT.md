# Railway Deployment Guide for CrushIT Backend

## ✅ Pre-Deployment Checklist

Your backend is ready! All requirements are met:
- ✅ MongoDB Atlas connection configured
- ✅ Environment variables in `.env`
- ✅ Build script configured
- ✅ Start script configured
- ✅ .gitignore file created
- ✅ Railway configuration added
- ✅ Node.js version specified

## 🚀 Deployment Steps

### Step 1: Push to GitHub

1. Initialize git (if not already done):
```bash
cd backend
git init
git add .
git commit -m "Initial backend setup for Railway deployment"
```

2. Create a GitHub repository and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/crushit-backend.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `crushit-backend` repository
6. Railway will auto-detect the Node.js project

### Step 3: Configure Environment Variables

In Railway dashboard, go to your project → Variables, and add:

```
MONGODB_URI=mongodb+srv://crushit_user:jH46zvbeI5JIT3ob@crushit-test-cluster.yfdbfar.mongodb.net/?appName=crushit-test-cluster
DATABASE_NAME=crushit
NODE_ENV=production
JWT_SECRET=crushit-secret-key-change-in-production-2025
PORT=4000
```

**⚠️ IMPORTANT:** Change the JWT_SECRET to a new secure value for production!

### Step 4: Deploy

1. Railway will automatically:
   - Install dependencies
   - Run `npm run build`
   - Start with `npm start`

2. Once deployed, Railway will give you a URL like:
   ```
   https://your-app.railway.app
   ```

### Step 5: Update Mobile App

Update `app/src/config/api.ts`:

```typescript
const MACHINE_IP = 'your-app.railway.app'; // Your Railway URL (without https://)
const API_BASE_URL = `https://${MACHINE_IP}`;
```

## 🧪 Testing Deployment

1. Visit your Railway URL: `https://your-app.railway.app`
   - Should see: `{"status":"ok","service":"CrushIT Backend","version":"1.0.0"}`

2. Test auth endpoint:
   ```
   https://your-app.railway.app/auth/login
   ```

3. Check logs in Railway dashboard for any errors

## 💰 Pricing

- **Free Tier**: $5 free credits per month
- **Hobby Plan**: $5/month for unlimited usage
- Your backend should fit comfortably in free tier for testing

## 🔧 Troubleshooting

### Build Fails
- Check Railway logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version (18+)

### Can't Connect to MongoDB
- Check MONGODB_URI is correct
- Verify MongoDB Atlas allows connections from all IPs (0.0.0.0/0)
- Check MongoDB Atlas user credentials

### App Can't Connect to Backend
- Ensure Railway URL is correct in app config
- Check Railway deployment is running (green status)
- Test backend URL in browser

## 🎉 Success!

Once deployed:
- ✅ Backend runs 24/7
- ✅ Auto-scales with traffic
- ✅ HTTPS enabled by default
- ✅ MongoDB Atlas connected
- ✅ Ready for APK testing

## Alternative: Render Deployment

If you prefer Render.com:

1. Go to [Render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Add environment variables
5. Deploy

Both Railway and Render offer similar free tiers!
