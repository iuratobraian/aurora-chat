#!/bin/bash
# Instagram Setup Script for TradeHub
# Usage: ./setup-instagram.sh

set -e

echo "🚀 TradeHub Instagram Setup Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js detected${NC}"

# Step 1: Environment Variables
echo ""
echo "📝 Step 1: Configuring Environment Variables"
echo "--------------------------------------------"

read -p "Instagram App ID: " IG_APP_ID
read -p "Instagram App Secret: " IG_APP_SECRET
read -p "Redirect URI (default: http://localhost:3000/instagram/callback): " REDIRECT_URI
REDIRECT_URI=${REDIRECT_URI:-http://localhost:3000/instagram/callback}

echo ""
echo "📝 Step 2: AI Providers (Optional)"
echo "-----------------------------------"
read -p "OpenAI API Key (optional): " OPENAI_KEY
read -p "Anthropic API Key (optional): " ANTHROPIC_KEY
read -p "Google AI API Key (optional): " GOOGLE_KEY

# Create .env.local if not exists
if [ ! -f .env.local ]; then
    touch .env.local
    echo -e "${GREEN}✅ Created .env.local${NC}"
fi

# Append to .env.local
cat >> .env.local << EOF

# Instagram Configuration
INSTAGRAM_APP_ID=$IG_APP_ID
INSTAGRAM_APP_SECRET=$IG_APP_SECRET
INSTAGRAM_REDIRECT_URI=$REDIRECT_URI
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=$(openssl rand -base64 32)

# AI Providers
VITE_OPENAI_API_KEY=$OPENAI_KEY
VITE_ANTHROPIC_API_KEY=$ANTHROPIC_KEY
VITE_GOOGLE_AI_API_KEY=$GOOGLE_KEY
EOF

echo -e "${GREEN}✅ Environment variables saved to .env.local${NC}"

# Step 3: Generate Convex types
echo ""
echo "📝 Step 3: Generating Convex Types"
echo "----------------------------------"
npx convex codegen
echo -e "${GREEN}✅ Convex types generated${NC}"

# Step 4: Install additional dependencies
echo ""
echo "📝 Step 4: Installing Dependencies"
echo "---------------------------------"
npm install axios crypto --save

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 5: Verify tables exist
echo ""
echo "📝 Step 5: Verifying Database Schema"
echo "-------------------------------------"
echo "Run the following commands to verify:"
echo "  npx convex db show instagram_accounts"
echo "  npx convex db show instagram_scheduled_posts"
echo "  npx convex db show instagram_auto_reply_rules"
echo "  npx convex db show instagram_analytics"
echo "  npx convex db show instagram_messages"

# Final instructions
echo ""
echo ""
echo "================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Facebook Developer Console:"
echo "   - Go to https://developers.facebook.com"
echo "   - Add Instagram Graph API product"
echo "   - Configure OAuth redirect: $REDIRECT_URI"
echo "   - Set up Webhooks"
echo ""
echo "2. Instagram Account:"
echo "   - Convert to Business or Creator account"
echo "   - Link to Facebook Page"
echo ""
echo "3. Start development:"
echo "   npm run dev"
echo ""
echo "4. Test connection:"
echo "   - Navigate to /instagram"
echo "   - Click 'Connect Instagram Account'"
echo "   - Authorize via Facebook"
echo ""
echo "For detailed instructions, see:"
echo "  .agent/skills/INSTAGRAM_INTEGRATION_PLAN.md"
echo ""
