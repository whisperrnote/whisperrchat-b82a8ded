# Deployment Guide

## Backend Functions Deployment

### Prerequisites
- Appwrite CLI installed: `npm install -g appwrite`
- Appwrite account and project created
- Project ID: `tenchat` (or update in `appwrite.config.json`)

### Step 1: Deploy All 5 Functions

Deploy each function to your Appwrite project:

```bash
cd functions/custom-token
npm install
appwrite deploy function

cd ../webauthn-register-options
npm install
appwrite deploy function

cd ../webauthn-register-verify
npm install
appwrite deploy function

cd ../webauthn-auth-options
npm install
appwrite deploy function

cd ../webauthn-auth-verify
npm install
appwrite deploy function
```

### Step 2: Configure Environment Variables

For each function, set the following environment variables in the Appwrite Console:

#### Required for ALL functions:
- `APPWRITE_API_KEY` - Server API key with full permissions (create in Appwrite Console → Settings → API Keys)
- `PASSKEY_CHALLENGE_SECRET` - Random secret for HMAC signing (generate with `openssl rand -hex 32`)

#### Required for WebAuthn functions (register-options, register-verify, auth-options, auth-verify):
- `RP_ID` - Relying Party ID (e.g., `localhost` for dev, `yourdomain.com` for prod)
- `ORIGIN` - Full origin URL (e.g., `http://localhost:5173` for dev, `https://yourdomain.com` for prod)
- `WEBAUTHN_CHALLENGE_TTL_MS` - Challenge TTL in milliseconds (default: `120000` = 2 minutes)
- `WEBAUTHN_DEBUG` - Set to `"1"` for debug logging (optional)

### Step 3: Create Database Collections

Create the following collections in Appwrite Console → Databases:

#### Collection: `passkeys`
Attributes:
- `userId` (string, required, size: 255)
- `credentialId` (string, required, size: 512) - Make unique index
- `publicKey` (string, required, size: 2048)
- `counter` (integer, required, default: 0)
- `transports` (string, array, size: 1024)
- `createdAt` (datetime, required)
- `lastUsedAt` (datetime, required)

Indexes:
- `userId` (key, ASC)
- `credentialId` (unique, ASC)

Permissions:
- Read: Users (for user's own passkeys)
- Create: Users
- Update: Users (for counter updates)
- Delete: Users

#### Collection: `wallets`
Attributes:
- `userId` (string, required, size: 255)
- `address` (string, required, size: 255) - Make unique index
- `createdAt` (datetime, required)
- `lastUsedAt` (datetime, required)

Indexes:
- `userId` (key, ASC)
- `address` (unique, ASC)

Permissions:
- Read: Users
- Create: Users
- Update: Users

### Step 4: Enable Custom Tokens

In Appwrite Console → Settings → Auth:
1. Enable **JWT** authentication method
2. Set session duration as needed

### Step 5: Configure Function IDs

Update your frontend environment variables (`.env` or `.env.local`):

```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=tenchat
```

The function IDs should match the function names in the code:
- `custom-token`
- `webauthn-register-options`
- `webauthn-register-verify`
- `webauthn-auth-options`
- `webauthn-auth-verify`

## Frontend Deployment

### Build & Deploy

```bash
npm run build
```

Deploy the `dist/` folder to your hosting provider (Vercel, Netlify, etc.)

### Environment Variables for Frontend

Set these in your hosting provider's environment configuration:

```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=tenchat
```

## Testing

### 1. Test Web3 Wallet Authentication
1. Visit your deployed app
2. Click "Sign in with Wallet"
3. Connect MetaMask and sign the message
4. Verify you're logged in

### 2. Test Passkey Registration
1. Visit your deployed app with a new email
2. Click "Sign in with Passkey"
3. Follow the browser's passkey creation flow
4. Verify you're logged in

### 3. Test Passkey Authentication
1. Log out
2. Click "Sign in with Passkey" with the same email
3. Use your saved passkey
4. Verify you're logged in

### 4. Test Security Gates
1. Create account with wallet
2. Try to register passkey with same email → Should fail (security gate)
3. Create account with passkey
4. Try to sign in with wallet using same email → Should fail (security gate)

## Troubleshooting

### Function fails with "Invalid signature"
- Check that `PASSKEY_CHALLENGE_SECRET` is the same across all functions
- Verify the challenge hasn't expired (check `WEBAUTHN_CHALLENGE_TTL_MS`)

### Function fails with "RP_ID mismatch"
- Ensure `RP_ID` matches your domain (no protocol, no port)
- For localhost, use `localhost` not `127.0.0.1`

### Function fails with "Origin mismatch"
- Ensure `ORIGIN` includes protocol and port
- Example: `http://localhost:5173` not `localhost:5173`

### Database errors
- Verify all collections and attributes are created
- Check collection permissions allow the operations
- Verify API key has database permissions

## Production Checklist

- [ ] All 5 functions deployed
- [ ] All environment variables configured
- [ ] Database collections created with correct schema
- [ ] Custom tokens enabled in Auth settings
- [ ] Frontend built and deployed
- [ ] All 3 authentication methods tested
- [ ] Security gates tested
- [ ] Error logging configured
- [ ] Rate limiting considered (if needed)
- [ ] HTTPS enabled for production domain
