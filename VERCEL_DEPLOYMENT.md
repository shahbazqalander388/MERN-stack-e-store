# 🚀 Vercel Deployment Guide

## MERN Stack E-Store Deployment

This guide will help you deploy your MERN stack application to Vercel.

---

## **Step 1: Prerequisites**

- ✅ GitHub account (already done!)
- ✅ Vercel account (free at [vercel.com](https://vercel.com))
- ✅ MongoDB Atlas account (free at [mongodb.com/cloud](https://www.mongodb.com/cloud))
- ✅ GitHub repository (already uploaded!)

---

## **Step 2: Set Up MongoDB Atlas (Database)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with username & password
4. Get your **Connection String** (looks like: `mongodb+srv://username:password@cluster.mongodb.net/estore`)
5. Copy this - you'll need it in Vercel

---

## **Step 3: Deploy to Vercel**

### **Option A: Using Vercel Dashboard (Easiest)**

1. **Sign in to Vercel**: https://vercel.com/dashboard
2. **Click "Add New" → "Project"**
3. **Select your GitHub repository**: `MERN-stack-e-store`
4. **Configure Project Settings:**
   - Framework: **Vite**
   - Root Directory: **./** (default)
   - Build Command: **npm run build**
   - Output Directory: **dist**

5. **Add Environment Variables** (Important!):
   - Click "Environment Variables"
   - Add these variables:

   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/estore
   JWT_SECRET = your_super_secret_key_12345
   PORT = 5000
   ```

6. **Click "Deploy"** ✅

---

### **Option B: Using Vercel CLI (Advanced)**

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. When prompted, add your environment variables
```

---

## **Step 4: Configure Environment Variables on Vercel**

After deployment:

1. Go to Vercel Dashboard → Your Project
2. **Settings → Environment Variables**
3. Add these variables:

```
MONGODB_URI = your_mongodb_connection_string
JWT_SECRET = your_jwt_secret_here
```

---

## **Step 5: Update Your Frontend API URL**

Your frontend will automatically use the correct API endpoint. But if needed:

1. Go to **Settings → Environment Variables**
2. Add:
   ```
   VITE_API_URL = https://your-vercel-url.vercel.app/api
   ```

---

## **Step 6: Redeploy After Env Changes**

1. Make a small change to any file (e.g., update README)
2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Update for Vercel deployment"
   git push origin main
   ```
3. Vercel will **automatically redeploy** 🎉

---

## **Deployment Checklist**

- [ ] MongoDB Atlas cluster created
- [ ] Connection string copied
- [ ] Vercel account created
- [ ] GitHub repository linked to Vercel
- [ ] Environment variables added in Vercel
- [ ] Project deployed successfully
- [ ] Frontend accessible at your Vercel URL
- [ ] API endpoints responding

---

## **Useful Links**

- 🔗 Vercel Dashboard: https://vercel.com/dashboard
- 🔗 MongoDB Atlas: https://cloud.mongodb.com
- 🔗 Your GitHub Repo: https://github.com/shahbazqalander388/MERN-stack-e-store

---

## **Troubleshooting**

### **Deployment fails**

- Check build logs in Vercel Dashboard
- Ensure all environment variables are set
- Verify MongoDB URI is correct

### **API not connecting**

- Check that `MONGODB_URI` is set in Vercel
- Verify MongoDB allows connections from Vercel (IP: 0.0.0.0/0)
- Check CORS settings in server

### **Uploads not working**

- Implement cloud storage (AWS S3 or Cloudinary)
- Or use MongoDB GridFS

---

**Happy Deploying! 🚀**
