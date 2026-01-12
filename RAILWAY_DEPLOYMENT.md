# Deploy Backend to Railway (FREE)

## Quick Steps:

1. **Go to Railway**: https://railway.app/
2. **Sign up with GitHub** (free account)
3. **Create New Project** → Deploy from GitHub repo
4. **Select**: `abhieq3/the-nail-hubs-receptionist`
5. **Root Directory**: Select `backend` folder
6. **Add Environment Variable**:
   - Key: `OPENAI_API_KEY`
   - Value: `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`
7. **Deploy!**

Railway will give you a URL like: `https://your-project.railway.app`

Then update the frontend Vercel environment variable:
- `REACT_APP_API_URL` = Your Railway URL

## Railway Free Tier:
- ✅ 500 hours/month
- ✅ Persistent database
- ✅ Auto-deploys from GitHub
- ✅ Perfect for this project!
