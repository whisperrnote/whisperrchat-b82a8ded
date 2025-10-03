# 🔐 Authentication Quick Reference

## 🚀 Quick Start

```bash
npm install
npm run build  # Verify build works
npm run dev    # Start development server
```

## 🔑 Environment Variables

```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=tenchat
VITE_WEB3_FUNCTION_ID=68de4eac002097d063f2
```

## 📱 User Flow

1. **Open App** → See blurred UI + Auth Modal
2. **Enter Email** → Valid email required
3. **Connect Wallet** → MetaMask pops up
4. **Approve Connection** → Select account
5. **Sign Message** → Verify ownership
6. **Authenticated!** → Modal closes, app unlocked

## 🐛 Debug Panel (Dev Mode Only)

**Location**: Top-right corner

```
Auth: ✅/❌       Authentication status
Loading: ⏳/✓    Loading state  
Account: abc123   Account ID (8 chars)
Profile: ✓/❌     Profile loaded
```

## 🔧 Common Issues & Fixes

### Issue: Auth Modal Won't Close
**Fix**: Check console logs, click "Try Restoring Session" if available

### Issue: "Session Already Exists"  
**Fix**: Refresh page or click restore button

### Issue: MetaMask Not Appearing
**Fix**: Check if installed, unlocked, and try refreshing page

### Issue: Profile Not Loading
**Fix**: Logout and login again (profile auto-creates)

## 📊 Console Log Pattern (Success)

```
Checking authentication...
Not authenticated: [error]
Starting wallet authentication...
Calling Web3 function...
Function response: 200
Creating session with userId: [id]
Session created successfully
Checking authentication...
User found: [id]
Profile loaded: [id]
Auth state changed: { isAuthenticated: true... }
Authenticated, hiding auth modal
```

## 🎯 Testing Checklist

- [ ] Fresh login works
- [ ] Page refresh maintains session
- [ ] Logout clears session properly
- [ ] Auth modal dismisses automatically
- [ ] Profile loads/creates correctly
- [ ] Debug panel shows correct state
- [ ] Can interact with chat after login
- [ ] Handles MetaMask rejection
- [ ] Detects existing sessions
- [ ] Network errors handled gracefully

## 🔄 Key Methods

### In AppwriteContext

```typescript
loginWithWallet(email, address, signature, message)
// Authenticates user with Web3 wallet

logout()
// Clears session and resets state

forceRefreshAuth()
// Manually refresh authentication state

refreshProfile()
// Reload user profile data
```

## 📁 Modified Files

- `src/contexts/AppwriteContext.tsx` - Auth logic
- `src/components/auth/auth-modal.tsx` - Auth UI
- `src/App.tsx` - App wrapper with debug panel

## 📚 Documentation

- `AUTH_FIX_SUMMARY.md` - Technical details
- `AUTH_TESTING_GUIDE.md` - Complete testing guide
- `AUTH_IMPROVEMENTS_COMPLETE.md` - Full overview
- This file - Quick reference

## 🎓 Best Practices

✅ Always check console for errors
✅ Use debug panel in development
✅ Test in incognito for fresh state
✅ Clear browser data if issues persist
✅ Report issues with console logs

## 🆘 Emergency Reset

```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
// Then refresh page
```

## ✅ Success Indicators

### Visual
- ✅ Auth modal closed
- ✅ Chat interface active (not blurred)
- ✅ Wallet address visible
- ✅ Can send messages

### Technical
- ✅ Debug panel all green
- ✅ Console shows success logs
- ✅ No error messages
- ✅ Session in Appwrite Console

## 🔐 Security Notes

- Signatures verified server-side
- Sessions managed by Appwrite
- No private keys stored
- Secure wallet integration
- Proper session cleanup on logout

## 📞 Get Help

**Console not showing logs?**
→ Check if console is filtered (show all messages)

**Still stuck?**
→ Provide console logs, debug panel status, and steps

**Need to test fresh?**
→ Use incognito/private browsing mode

---

**Version**: 2.0.0
**Status**: ✅ Ready
**Build**: ✅ Passing
**Last Updated**: 2024
