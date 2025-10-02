#!/bin/bash

set -e

echo "🚀 Deploying Appwrite Functions..."
echo ""

FUNCTIONS=(
  "function_web3"
)

for func in "${FUNCTIONS[@]}"; do
  echo "📦 Installing dependencies for $func..."
  cd "ignore1/$func"
  npm install
  
  echo "🚀 Deploying $func..."
  appwrite deploy function
  
  cd ../..
  echo "✅ $func deployed"
  echo ""
done

echo "✨ All functions deployed successfully!"
echo ""
echo "⚠️  Next steps:"
echo "1. Configure environment variables in Appwrite Console"
echo "2. Enable JWT authentication in Auth settings"
echo "3. Set VITE_WEB3_FUNCTION_ID in your frontend env"
echo "4. Test wallet authentication"
echo ""
echo "See DEPLOYMENT.md for detailed instructions."
