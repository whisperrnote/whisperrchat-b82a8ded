# Deployment Guide

## Backend Functions Deployment

### Prerequisites
- Appwrite CLI installed: `npm install -g appwrite`
- Appwrite account and project created
- Project ID: `tenchat` (or update in `appwrite.config.json`)

### Step 1: Deploy Web3 Auth Function

Deploy the wallet authentication function to your Appwrite project:

```bash
cd ignore1/function_web3
npm install
appwrite deploy function
```

### Step 2: Configure Environment Variables

In Appwrite Console, set required environment variables for the function (see its README if applicable). At minimum ensure it can create custom tokens and bind wallet addresses.

### Step 3: Appwrite Auth Settings

Enable JWT authentication in Appwrite Console → Settings → Auth.

### Step 4: Frontend Environment Variables

### Step 5: Configure Function IDs

Update your frontend environment variables (`.env` or `.env.local`):

```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=tenchat
VITE_WEB3_FUNCTION_ID=function_web3
```

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
2. Click "Continue with Web3 Wallet"
3. Connect MetaMask and sign the message
4. Verify you're logged in

### 2. Notes
- Passkey and OTP flows have been removed from the frontend

## Troubleshooting

### Function fails
- Verify function is deployed and ID matches `VITE_WEB3_FUNCTION_ID`
- Check Appwrite function logs for errors

### Database errors
- Verify all collections and attributes are created
- Check collection permissions allow the operations
- Verify API key has database permissions

## Production Checklist

- [ ] Web3 function deployed
- [ ] Environment variables configured (frontend and Appwrite)
- [ ] JWT enabled in Auth settings
- [ ] Frontend built and deployed
- [ ] Wallet authentication tested
- [ ] Error logging configured
- [ ] HTTPS enabled for production domain
