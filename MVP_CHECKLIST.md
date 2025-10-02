# TenChat MVP Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] `.env.local` created with proper values
- [ ] Appwrite project created and configured
- [ ] Project ID matches environment variable
- [ ] Allowed origins/domains configured in Appwrite
- [ ] Email provider configured in Appwrite for OTP

### 2. Code Quality
- [ ] `npm run lint` passes (ignore contract/function errors)
- [ ] `npm run build` completes successfully
- [ ] No console errors in development mode
- [ ] Authentication flow tested (OTP)
- [ ] Message sending/receiving tested
- [ ] Encryption/decryption verified

### 3. Security Review
- [ ] Environment variables not committed to git
- [ ] `.env.local` in `.gitignore`
- [ ] Security warnings displayed in dev mode
- [ ] No API keys in client-side code
- [ ] HTTPS enabled for production domain

### 4. Feature Testing
- [ ] User can sign up with email
- [ ] OTP code received and verified
- [ ] User can create conversation
- [ ] User can send encrypted message
- [ ] User can receive and decrypt message
- [ ] Message persistence works (localStorage)
- [ ] Key rotation accessible in settings

## 🚀 Quick Deploy (Vercel)

```bash
# 1. Push to GitHub
git add .
git commit -m "MVP ready for deployment"
git push origin main

# 2. Deploy to Vercel
# - Go to vercel.com
# - Import GitHub repo
# - Add environment variables:
#   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
#   VITE_APPWRITE_PROJECT_ID=your-project-id
# - Deploy

# 3. Update Appwrite
# - Add Vercel URL to allowed origins
# - Test authentication
```

## 🔍 Post-Deployment Tests

- [ ] Visit deployed URL
- [ ] Sign up with new email
- [ ] Receive and verify OTP
- [ ] Send encrypted message
- [ ] Verify encryption in network tab
- [ ] Test on mobile device
- [ ] Test dark mode

## 📝 Known MVP Limitations

⚠️ **For Production Use:**
1. Passkey/Wallet auth are simplified (client-side only)
2. Messages stored in localStorage (not synced)
3. No real-time updates (polling)
4. Single device only
5. Text messages only

See `MVP_GUIDE.md` for details and next steps.

---

**Status**: Ready for Testing ✅
