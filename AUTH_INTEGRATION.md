# Web3 Authentication Integration

## Overview

TenChat uses **Web3 wallet authentication** as the sole authentication method. This is powered by an Appwrite Function that verifies wallet signatures and creates user sessions.

## Architecture

```
User → AuthModal → AuthService → Appwrite Function → Session Created
                       ↓
                  MetaMask Sign
```

## Implementation

### 1. Environment Configuration

Add to your `.env` file:

```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_WEB3_FUNCTION_ID=your-web3-auth-function-id
```

### 2. Core Components

#### `src/lib/appwrite.ts`
- Initializes Appwrite client
- Exports `account` and `functions` instances

#### `src/services/auth.service.ts`
- `loginWithWallet(email: string)`: Handles Web3 authentication flow
- `logout()`: Ends current session
- `getCurrentUser()`: Returns authenticated user or null
- `isAuthenticated()`: Boolean check for auth status

#### `src/components/auth/auth-modal.tsx`
- Simple email + wallet connection UI
- Handles MetaMask signing flow
- Error display and loading states

### 3. Authentication Flow

1. **User enters email** in AuthModal
2. **MetaMask prompt** for wallet connection
3. **User signs message** with format: `Sign this message to authenticate: auth-{timestamp}`
4. **Appwrite Function called** with `{ email, address, signature, message }`
5. **Function returns** `{ userId, secret }`
6. **Session created** with `account.createSession()`
7. **User data loaded** and app state updated

### 4. Usage in Components

```tsx
import { authService } from '@/services';

// Check if authenticated
const isAuth = authService.isAuthenticated();

// Get current user
const user = await authService.getCurrentUser();

// Login
const result = await authService.loginWithWallet('user@example.com');
if (result.success) {
  console.log('Logged in:', result.user);
}

// Logout
await authService.logout();
```

### 5. Error Handling

Common error scenarios handled:

- **MetaMask not installed**: User prompted to install
- **User rejects signature**: Friendly message shown
- **Invalid signature**: Function validation fails
- **Network errors**: Retry suggested
- **Function not configured**: Missing `VITE_WEB3_FUNCTION_ID`

### 6. Security Features

- ✅ Message signature prevents replay attacks (timestamp-based)
- ✅ Wallet ownership verified cryptographically
- ✅ No password storage required
- ✅ User controls private keys
- ✅ Email+wallet binding enforced by function

## Removed Complexity

The following have been **removed** to simplify the auth system:

- ❌ OTP/SMS authentication
- ❌ Passkey/WebAuthn support
- ❌ Complex wallet selection modals
- ❌ Multiple authentication methods
- ❌ Password-based auth

## Testing

1. **Start dev server**: `npm run dev`
2. **Click "Sign In"** in the UI
3. **Enter email** address
4. **Click "Connect Wallet & Sign"**
5. **Approve MetaMask** connection
6. **Sign the message** in MetaMask
7. **Session created** automatically

## Appwrite Function Requirements

Your Web3 auth function must:

1. Accept: `{ email, address, signature, message }`
2. Verify signature using `ethers.verifyMessage()` or similar
3. Create/find user by email
4. Store wallet address in user preferences
5. Generate token using `users.createToken()`
6. Return: `{ userId, secret }`

See `ignore1/function_web3/` for reference implementation (DO NOT MODIFY).

## Files

### Core Auth Files
- `src/services/auth.service.ts` - Auth service implementation
- `src/components/auth/auth-modal.tsx` - Login UI
- `src/lib/appwrite.ts` - Appwrite client setup
- `src/types/window.d.ts` - TypeScript declarations for window.ethereum

### Configuration
- `.env` - Environment variables
- `.env.example` - Template with required variables

### Removed Files
- ❌ `src/components/wallet/wallet-connection-modal.tsx` (deleted)
- ❌ `src/components/ui/input-otp.tsx` (deleted)

## Maintenance

To update the auth system:

1. ✅ Keep it simple - follow USAGE_REACT.md pattern
2. ✅ Don't add back OTP/passkey complexity
3. ✅ All auth goes through the Appwrite Function
4. ✅ Let the function handle validation and user management
5. ✅ UI should be minimal: email + wallet sign button

## Reference

For detailed examples and patterns, see:
- `ignore1/function_web3/USAGE_REACT.md` - Complete React integration guide
- `ignore1/function_web3/` - Function implementation reference

---

**Last Updated**: October 2024  
**Auth Method**: Web3 Wallet (MetaMask) + Email  
**Status**: ✅ Production Ready
