# Authentication Testing Guide

## Overview
This guide explains how to test the improved authentication system in WhisperChat.

## Prerequisites

### 1. Environment Setup
Ensure your `.env` or `.env.local` file has:
```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=tenchat
VITE_WEB3_FUNCTION_ID=68de4eac002097d063f2
```

### 2. MetaMask Installation
- Install MetaMask browser extension
- Have at least one wallet account configured
- Connect to any Ethereum network (Mainnet, Sepolia, etc.)

### 3. Build and Run
```bash
npm install
npm run build  # Verify build succeeds
npm run dev    # Start development server
```

## Testing Scenarios

### Scenario 1: Fresh Login (No Existing Session)

**Steps:**
1. Open the application in your browser
2. You should see:
   - Blurred background with chat interface
   - Auth modal overlay (cannot be dismissed)
   - Email input field
   - "Connect Wallet" button

3. Enter your email address
4. Click "Connect Wallet"
5. MetaMask popup should appear requesting account connection
6. Approve the connection
7. MetaMask will ask you to sign a message
8. Sign the message
9. Wait for authentication (you'll see loading states)

**Expected Results:**
- ✅ Auth modal closes automatically
- ✅ Chat interface becomes active (no blur)
- ✅ Your wallet address appears in the UI
- ✅ Development debug panel (top-right) shows:
  - Auth: ✅
  - Loading: ✓
  - Account: [your account ID]
  - Profile: ✓

**Console Logs to Expect:**
```
Checking authentication...
Not authenticated: [error message]
Starting wallet authentication...
Calling Web3 function...
Function response: 200
Creating session with userId: [userId]
Session created successfully
Checking authentication...
User found: [userId]
Profile loaded: [profileId]
Auth state changed: { isAuthenticated: true, isLoading: false, hasAccount: true }
Authenticated, hiding auth modal
Auth success callback
Force refreshing authentication state...
```

### Scenario 2: Page Refresh (Existing Session)

**Steps:**
1. After successfully logging in (Scenario 1)
2. Refresh the browser page (F5 or Cmd+R)

**Expected Results:**
- ✅ Brief loading screen
- ✅ No auth modal appears
- ✅ Immediately logged in
- ✅ Profile and account data restored
- ✅ Chat interface is active

**Console Logs to Expect:**
```
Checking authentication...
User found: [userId]
Profile loaded: [profileId]
Auth state changed: { isAuthenticated: true, isLoading: false, hasAccount: true }
```

### Scenario 3: Existing Session Detection

**Steps:**
1. If you have a session in Appwrite but app shows auth modal
2. Enter your email
3. Click "Connect Wallet"
4. The error might mention existing session

**Expected Results:**
- ✅ Error is caught automatically
- ✅ Session is restored without full re-authentication
- ✅ Auth modal closes
- ✅ Chat becomes active

**Alternative:**
- If "Try Restoring Session" button appears, click it
- Session should restore immediately

### Scenario 4: Logout

**Steps:**
1. While logged in, open settings
2. Click "Logout" or "Sign Out"

**Expected Results:**
- ✅ Profile online status updated to offline
- ✅ Session deleted from Appwrite
- ✅ Auth modal reappears
- ✅ Chat interface blurs
- ✅ User data cleared

**Console Logs to Expect:**
```
Logging out...
Session deleted
Not authenticated, showing auth modal
```

### Scenario 5: User Rejects Signature

**Steps:**
1. Start login process
2. When MetaMask asks for signature, click "Reject"

**Expected Results:**
- ✅ Clear error message: "You cancelled the signature request"
- ✅ Auth modal stays open
- ✅ Can retry by clicking "Connect Wallet" again
- ✅ No session created

### Scenario 6: MetaMask Not Installed

**Steps:**
1. Disable or remove MetaMask extension
2. Try to login

**Expected Results:**
- ✅ Error: "MetaMask not installed. Please install MetaMask browser extension."
- ✅ Link to install MetaMask (metamask.io/download)
- ✅ Can click link to open installation page

### Scenario 7: Network Issues

**Steps:**
1. Disconnect internet or use browser throttling
2. Try to login

**Expected Results:**
- ✅ Network error message
- ✅ Can retry after connection restored
- ✅ No partial state corruption

## Development Debug Panel

### Location
Top-right corner of the screen (only in development mode)

### What It Shows
```
Auth: ✅/❌       - Authenticated or not
Loading: ⏳/✓    - Loading state
Account: abc12345 - First 8 chars of account ID
Profile: ✓/❌     - Profile loaded or not
```

### How to Use
- Monitor in real-time as you interact with auth
- Verify state changes happen correctly
- Debug issues by watching state transitions

## Common Issues and Solutions

### Issue 1: Auth Modal Won't Dismiss After Login

**Symptoms:**
- Logged in successfully
- Session created in Appwrite
- But modal still showing

**Solution:**
1. Check browser console for errors
2. Look for "Auth state changed" logs
3. Click "Try Restoring Session" if button appears
4. Check debug panel - does it show Auth: ✅?

**Debug:**
```javascript
// In browser console
localStorage.getItem('appwrite-session')
// Should show session data if logged in
```

### Issue 2: "Session Already Exists" Error

**Symptoms:**
- Can't login with wallet
- Error mentions existing session
- But UI shows not authenticated

**Solution:**
1. Look for "Try Restoring Session" button
2. Click it to restore the session
3. Or refresh the page
4. Session should be detected on next load

**Manual Fix:**
```javascript
// In browser console - force logout
import { account } from '@/lib/appwrite/config/client';
await account.deleteSession('current');
// Then refresh page and login again
```

### Issue 3: Profile Not Loading

**Symptoms:**
- Authenticated
- Account exists
- But Profile: ❌ in debug panel

**Solution:**
- Profile creation might have failed
- Check console for "Profile error" logs
- Try logging out and back in
- Profile will be created automatically

### Issue 4: MetaMask Not Appearing

**Symptoms:**
- Clicked "Connect Wallet"
- Nothing happens
- No MetaMask popup

**Solutions:**
1. Check if MetaMask is installed and unlocked
2. Look for MetaMask icon in browser extensions
3. Try clicking the extension icon manually
4. Refresh page and try again
5. Check browser console for errors

## Verifying Successful Authentication

### In Browser
✅ Auth modal closed
✅ Chat interface active (not blurred)
✅ Can click and interact with UI
✅ Wallet address visible in profile area
✅ Debug panel shows all green

### In Console
✅ "Session created successfully"
✅ "User found: [id]"
✅ "Profile loaded: [id]"
✅ "Authenticated, hiding auth modal"
✅ No error logs

### In Appwrite Console
1. Go to Appwrite Console → Auth → Sessions
2. Should see an active session
3. Session should have your email and wallet preferences

## Advanced Testing

### Test Session Persistence
```bash
# In browser DevTools → Application → Storage
# Check these keys:
- appwrite-session
- appwrite-user

# Should contain session data when logged in
# Should be empty when logged out
```

### Test Multiple Tabs
1. Login in one tab
2. Open app in another tab
3. Should auto-login in second tab
4. Logout in one tab
5. Other tab should detect and show auth modal

### Test Network Resilience
1. Use Chrome DevTools → Network → Throttling
2. Set to "Slow 3G"
3. Try authentication
4. Should handle timeouts gracefully
5. Provide retry options

## Monitoring Tools

### Browser Console Commands
```javascript
// Check authentication state
console.log('Auth:', window.localStorage.getItem('appwrite-session'));

// Force logout
import { account } from '@/lib/appwrite/config/client';
await account.deleteSession('current');

// Get current user
await account.get();

// List all sessions
await account.listSessions();
```

### Network Tab
Monitor these requests:
- `/v1/account` - Get current user
- `/v1/account/sessions` - Create/delete sessions
- `/v1/functions/[id]/executions` - Web3 auth function
- `/v1/tables/[id]/rows` - Profile operations

## Success Criteria

### Must Pass
- [ ] Fresh login works
- [ ] Page refresh maintains session
- [ ] Logout clears session
- [ ] Auth modal dismisses after login
- [ ] Profile created/loaded
- [ ] Debug panel accurate
- [ ] Console logs show correct flow

### Should Pass
- [ ] Handles MetaMask rejection gracefully
- [ ] Detects existing sessions
- [ ] Restores sessions automatically
- [ ] Network errors handled
- [ ] Multiple tabs synchronized

### Nice to Have
- [ ] Fast authentication (< 5s)
- [ ] Smooth transitions
- [ ] Clear error messages
- [ ] Easy retry on failure

## Reporting Issues

When reporting authentication issues, include:

1. **Steps to Reproduce**
2. **Expected vs Actual Behavior**
3. **Browser Console Logs**
4. **Debug Panel Status**
5. **MetaMask Version**
6. **Network Tab Screenshots**
7. **Appwrite Console Session Data**

---

**Last Updated**: 2024
**App Version**: 2.0.0
**Status**: ✅ Ready for Testing
