#!/bin/bash
# Deployment script for The Nail Hubs to Vercel

echo "🚀 Deploying The Nail Hubs to Vercel"
echo "===================================="
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📝 Please follow these steps:"
echo ""
echo "1. Make sure you're logged into Vercel:"
echo "   vercel login"
echo ""
echo "2. Deploy the frontend:"
echo "   cd /Users/abhipatel/the-nail-hubs-receptionist"
echo "   vercel --prod"
echo ""
echo "3. Deploy the backend (in a new terminal):"
echo "   cd /Users/abhipatel/the-nail-hubs-receptionist/backend"
echo "   vercel --prod"
echo ""
echo "4. After deployment, update the frontend env variable:"
echo "   - Go to Vercel dashboard → Your project → Settings → Environment Variables"
echo "   - Add: REACT_APP_API_URL = <your-backend-url>"
echo "   - Redeploy frontend"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""

read -p "Ready to deploy now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting deployment..."
    vercel login
else
    echo "Deployment cancelled. Run this script again when ready!"
fi
