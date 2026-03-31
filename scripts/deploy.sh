#!/bin/bash
# TradePortal Deploy Script
# Usage: ./deploy.sh ["commit message"]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "\n========================================"
echo -e "  TradePortal Deploy Script"
echo -e "========================================\n"

# Step 1: Git commit
echo -e "${CYAN}[1/5] Checking git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}    Changes detected, staging files...${NC}"
    git add -A
    
    MESSAGE="${1:-chore: update $(date '+%Y-%m-%d %H:%M')}"
    echo -e "${YELLOW}    Committing with: $MESSAGE${NC}"
    git commit -m "$MESSAGE"
    echo -e "${GREEN}    [OK] Committed successfully${NC}"
else
    echo -e "${GREEN}    [OK] No changes to commit${NC}"
fi

# Step 2: Push to remote
echo -e "${CYAN}[2/5] Pushing to remote...${NC}"
git push
echo -e "${GREEN}    [OK] Pushed to origin/main${NC}"

# Step 3: Build frontend
echo -e "${CYAN}[3/5] Building frontend...${NC}"
npm run build
echo -e "${GREEN}    [OK] Build successful${NC}"

# Step 4: Deploy to Vercel
echo -e "${CYAN}[4/5] Deploying to Vercel...${NC}"
npx vercel --prod --yes
echo -e "${GREEN}    [OK] Deployed to Vercel${NC}"

# Step 5: Deploy Convex (optional)
echo -e "${CYAN}[5/5] Deploying Convex...${NC}"
npx convex deploy || echo -e "${YELLOW}    [WARN] Convex deploy failed or not configured${NC}"

# Summary
echo -e "\n========================================"
echo -e "${GREEN}  Deploy Complete!${NC}"
echo -e "========================================\n"
echo -e "${CYAN}Production URL: https://tradeportal-2025-platinum.vercel.app/${NC}"
echo ""
