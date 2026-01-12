#!/bin/bash
# Script to update frontend API URL for production

echo "🔗 Update Frontend API URL"
echo "=========================="
echo ""

if [ -z "$1" ]; then
    echo "Usage: ./update-api-url.sh <backend-url>"
    echo "Example: ./update-api-url.sh https://thenailhubs-api.vercel.app"
    echo ""
    echo "Please provide your backend Vercel URL"
    exit 1
fi

BACKEND_URL=$1

echo "Setting REACT_APP_API_URL to: $BACKEND_URL"
echo ""

# Create .env.production file
cat > frontend/.env.production << EOF
REACT_APP_API_URL=$BACKEND_URL
EOF

echo "✅ Created frontend/.env.production"
echo ""
echo "Now committing and pushing to GitHub..."

git add frontend/.env.production
git commit -m "Update production API URL to $BACKEND_URL

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin main

echo ""
echo "✅ Done! Vercel will automatically redeploy with the new API URL."
echo ""
echo "Your site will be live at: https://thenailhubs.vercel.app"
