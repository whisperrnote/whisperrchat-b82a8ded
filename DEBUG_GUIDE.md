# 🔍 DEBUG GUIDE - FINDING THE ISSUE

## What I Fixed

### 1. **Critical Bug: currentProfile doesn't exist!**
The layout was trying to use `currentProfile` from the Appwrite context, but it only exports:
- `currentAccount` (Appwrite account)
- `currentUser` (database user)
- NOT `currentProfile`

**Fix:** Changed to use `currentAccount` and `currentUser` instead.

### 2. **Added Console Logs**
Now you can see in the browser console:
- `[MainLayout] User object:` - Check if user exists
- `[MainLayout] isAuthenticated:` - Check auth status  
- `[ConversationList] Loading conversations` - Check if list loads
- `[ConversationList] All conversations:` - See conversation count
- `[ConversationList] Self conversation:` - Check if self-chat created

## How to Debug

1. **Open browser console** (F12)
2. **Login to the app**
3. **Look for these logs:**

```
[Auth] Checking authentication...
[Auth] User found: <userId>
[MainLayout] User object: { id: "...", displayName: "..." }
[MainLayout] isAuthenticated: true
[ConversationList] Loading conversations for user: <userId>
[ConversationList] Self conversation created, auto-selecting
[ConversationList] All conversations: 3
[ConversationList] Self conversation: exists
[ConversationList] Demo conversations: 2
```

## Expected Result

After login:
1. User object should exist
2. ConversationList should load
3. 3 conversations should appear (self + 2 demos)
4. Self-chat should auto-select
5. Chat UI should show

## If Still Empty

Check console for:
- **Error messages** - Any red errors?
- **User object null?** - Authentication issue
- **Conversations count 0?** - Creation failed
- **isAuthenticated false?** - Not logged in

## Quick Test

Run this in browser console after login:
```javascript
// Check if user exists
console.log('User:', window.location.pathname);

// Force reload
window.location.reload();
```

## Files Changed

1. `src/components/layout/main-layout-mvp.tsx`
   - Fixed currentProfile → currentAccount/currentUser
   - Added console logs
   - Fixed user object creation

2. `src/components/messaging/conversation-list.tsx`
   - Added console logs
   - Demo conversations always created
   - Self-chat always created

Run `npm run dev` and check the console logs!
