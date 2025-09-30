#!/bin/bash

set -e

echo "🚀 Deploying Appwrite Functions..."
echo ""

FUNCTIONS=(
  "custom-token"
  "webauthn-register-options"
  "webauthn-register-verify"
  "webauthn-auth-options"
  "webauthn-auth-verify"
)

for func in "${FUNCTIONS[@]}"; do
  echo "📦 Installing dependencies for $func..."
  cd "functions/$func"
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
echo "2. Create database collections (passkeys, wallets)"
echo "3. Enable JWT authentication in Auth settings"
echo "4. Test all authentication methods"
echo ""
echo "See DEPLOYMENT.md for detailed instructions."
