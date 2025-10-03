#!/bin/bash

# Authentication System Verification Script
# Tests that all required files and configurations are in place

echo "🔐 WhisperChat Authentication System Verification"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
checks_passed=0
checks_failed=0

# Function to check file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $2"
    ((checks_passed++))
    return 0
  else
    echo -e "${RED}✗${NC} $2 - Missing: $1"
    ((checks_failed++))
    return 1
  fi
}

# Function to check env variable
check_env() {
  if grep -q "^$1=" .env 2>/dev/null || grep -q "^$1=" .env.local 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $2"
    ((checks_passed++))
    return 0
  else
    echo -e "${YELLOW}⚠${NC} $2 - Not found in .env or .env.local"
    ((checks_failed++))
    return 1
  fi
}

# Check directory structure
echo "📁 Checking Directory Structure..."
check_file "src/contexts/AppwriteContext.tsx" "AppwriteContext exists"
check_file "src/components/auth/auth-modal.tsx" "Auth Modal exists"
check_file "src/App.tsx" "App.tsx exists"
check_file "src/lib/appwrite/config/client.ts" "Appwrite client config exists"
echo ""

# Check documentation
echo "📚 Checking Documentation..."
check_file "AUTH_FIX_SUMMARY.md" "Fix Summary documentation"
check_file "AUTH_TESTING_GUIDE.md" "Testing Guide documentation"
check_file "AUTH_IMPROVEMENTS_COMPLETE.md" "Complete improvements doc"
check_file "AUTH_QUICK_REFERENCE.md" "Quick Reference card"
echo ""

# Check environment variables
echo "🔑 Checking Environment Variables..."
check_env "VITE_APPWRITE_ENDPOINT" "Appwrite Endpoint"
check_env "VITE_APPWRITE_PROJECT_ID" "Appwrite Project ID"
check_env "VITE_WEB3_FUNCTION_ID" "Web3 Function ID"
echo ""

# Check node modules
echo "📦 Checking Dependencies..."
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} node_modules installed"
  ((checks_passed++))
  
  if [ -d "node_modules/appwrite" ]; then
    version=$(node -p "require('./node_modules/appwrite/package.json').version" 2>/dev/null)
    if [ ! -z "$version" ]; then
      echo -e "${GREEN}✓${NC} Appwrite SDK installed (v$version)"
      ((checks_passed++))
    fi
  else
    echo -e "${RED}✗${NC} Appwrite SDK not found"
    ((checks_failed++))
  fi
else
  echo -e "${RED}✗${NC} node_modules not found - Run 'npm install'"
  ((checks_failed++))
fi
echo ""

# Check build
echo "🔨 Checking Build..."
if [ -d "dist" ]; then
  echo -e "${GREEN}✓${NC} Build directory exists"
  ((checks_passed++))
  
  if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✓${NC} Build artifacts present"
    ((checks_passed++))
  else
    echo -e "${YELLOW}⚠${NC} Build may be outdated - Run 'npm run build'"
  fi
else
  echo -e "${YELLOW}⚠${NC} No build found - Run 'npm run build'"
fi
echo ""

# Try to verify build works
echo "⚙️  Testing Build Command..."
if npm run build > /tmp/auth-verify-build.log 2>&1; then
  echo -e "${GREEN}✓${NC} Build command succeeded"
  ((checks_passed++))
else
  echo -e "${RED}✗${NC} Build command failed - Check /tmp/auth-verify-build.log"
  ((checks_failed++))
fi
echo ""

# Check key code patterns
echo "🔍 Checking Critical Code Patterns..."

# Check createSession call
if grep -q "createSession({" src/contexts/AppwriteContext.tsx; then
  echo -e "${GREEN}✓${NC} Correct createSession API call"
  ((checks_passed++))
else
  echo -e "${RED}✗${NC} createSession may be using wrong API"
  ((checks_failed++))
fi

# Check forceRefreshAuth exists
if grep -q "forceRefreshAuth" src/contexts/AppwriteContext.tsx; then
  echo -e "${GREEN}✓${NC} forceRefreshAuth method present"
  ((checks_passed++))
else
  echo -e "${RED}✗${NC} forceRefreshAuth method missing"
  ((checks_failed++))
fi

# Check debug panel in App.tsx
if grep -q "import.meta.env.DEV" src/App.tsx; then
  echo -e "${GREEN}✓${NC} Development debug panel code present"
  ((checks_passed++))
else
  echo -e "${YELLOW}⚠${NC} Debug panel may be missing"
  ((checks_failed++))
fi

# Check console.log statements
if grep -q "console.log('Checking authentication" src/contexts/AppwriteContext.tsx; then
  echo -e "${GREEN}✓${NC} Authentication logging present"
  ((checks_passed++))
else
  echo -e "${YELLOW}⚠${NC} Logging may be incomplete"
fi

echo ""
echo "=================================================="
echo "📊 Verification Results"
echo "=================================================="
echo -e "${GREEN}✓ Passed:${NC} $checks_passed checks"
echo -e "${RED}✗ Failed:${NC} $checks_failed checks"
echo ""

if [ $checks_failed -eq 0 ]; then
  echo -e "${GREEN}🎉 All checks passed! Authentication system is ready.${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. npm run dev         # Start development server"
  echo "  2. Open browser and test authentication"
  echo "  3. Check console logs for auth flow"
  echo "  4. Verify debug panel appears (dev mode only)"
  echo ""
  exit 0
else
  echo -e "${YELLOW}⚠️  Some checks failed. Please review the issues above.${NC}"
  echo ""
  echo "Common fixes:"
  echo "  - Run 'npm install' if dependencies are missing"
  echo "  - Create .env file with required variables"
  echo "  - Run 'npm run build' to create build artifacts"
  echo "  - Check file paths if files are missing"
  echo ""
  exit 1
fi
