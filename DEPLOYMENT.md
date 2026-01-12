# Deployment Guide - The Nail Hubs

## Quick Deploy to Vercel

### Prerequisites
- GitHub account (already connected to: https://github.com/abhieq3/the-nail-hubs-receptionist)
- Vercel account (sign up at https://vercel.com with GitHub)

---

## Step 1: Deploy Frontend to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy Frontend:**
   ```bash
   cd /Users/abhipatel/the-nail-hubs-receptionist
   vercel --prod
   ```

4. **Follow the prompts:**
   - Link to existing project? **No**
   - Project name: **thenailhubs**
   - Directory: **./frontend**
   - Override settings? **No**

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository: `abhieq3/the-nail-hubs-receptionist`
4. Configure project:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
5. Add Environment Variable:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** (leave empty for now, update after backend deployment)
6. Click "Deploy"

---

## Step 2: Deploy Backend to Vercel (Separate Project)

### Option A: Using Vercel CLI

1. **Deploy Backend:**
   ```bash
   cd /Users/abhipatel/the-nail-hubs-receptionist/backend
   vercel --prod
   ```

2. **Follow the prompts:**
   - Link to existing project? **No**
   - Project name: **thenailhubs-api**
   - Directory: **.** (current directory)
   - Override settings? **No**

3. **Add Environment Variable:**
   ```bash
   vercel env add OPENAI_API_KEY
   ```
   Paste your OpenAI API key when prompted.

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import the same repository again
3. Configure project:
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** Leave empty
   - **Output Directory:** Leave empty
4. Add Environment Variable:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI API key from `.env` file
5. Click "Deploy"

---

## Step 3: Connect Frontend to Backend

1. **Get Backend URL:**
   - After backend deployment, copy the URL (e.g., `https://thenailhubs-api.vercel.app`)

2. **Update Frontend Environment Variable:**
   - Go to your frontend project on Vercel dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add or update:
     - **Name:** `REACT_APP_API_URL`
     - **Value:** `https://thenailhubs-api.vercel.app`
   - Save and trigger a new deployment

---

## Step 4: Configure Custom Domain (Optional)

1. Go to your frontend project settings on Vercel
2. Navigate to **Settings** → **Domains**
3. Add domain: **thenailhubs.vercel.app**
4. Vercel will automatically configure it

---

## Verify Deployment

### Frontend Checks:
✅ Visit https://thenailhubs.vercel.app
✅ Logo and branding appear correctly
✅ Instagram embeds load
✅ Navigation works smoothly
✅ Mobile responsive design works

### Backend Checks:
✅ Visit https://thenailhubs-api.vercel.app (should show API docs)
✅ Try the chatbot on the frontend
✅ Book a test appointment

---

## Troubleshooting

### Frontend issues:
- **Build fails:** Check Node.js version (use Node 18+)
- **Instagram not loading:** Instagram embeds may have CORS restrictions
- **Chatbot not working:** Verify `REACT_APP_API_URL` is set correctly

### Backend issues:
- **500 errors:** Check `OPENAI_API_KEY` environment variable
- **CORS errors:** Add frontend URL to CORS origins in `main.py`
- **Database issues:** Vercel has read-only filesystem, may need to use external DB

---

## Update Deployment

When you make changes:

```bash
# Commit changes
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically deploy on push if you enabled Git integration!

---

## Environment Variables Summary

### Frontend (thenailhubs.vercel.app)
- `REACT_APP_API_URL` = Backend URL

### Backend (thenailhubs-api.vercel.app)
- `OPENAI_API_KEY` = Your OpenAI API key

---

## Next Steps After Deployment

1. ✅ Test booking flow end-to-end
2. ✅ Check all Instagram embeds load
3. ✅ Test on multiple devices (mobile, tablet, desktop)
4. ✅ Share the link with customers!

---

## Support

- Vercel Docs: https://vercel.com/docs
- GitHub Repo: https://github.com/abhieq3/the-nail-hubs-receptionist
- Backend API Docs: https://your-backend-url.vercel.app/docs
