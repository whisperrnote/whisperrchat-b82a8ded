# 🚀 Quick Start - Web3 Authentication

## Get Started in 5 Minutes

### 1. Install MetaMask
If you don't have MetaMask installed:
- Visit https://metamask.io/download/
- Install the browser extension
- Create or import a wallet

### 2. Set Environment Variables
```bash
cp env.sample .env.local

# Edit .env.local and set:
VITE_WEB3_FUNCTION_ID=your-web3-function-id
VITE_APPWRITE_PROJECT_ID=your-project-id
```

### 3. Install & Run
```bash
npm install
npm run dev
```

### 4. Open in Browser
Navigate to `http://localhost:5173`

---

## 🎯 What You'll See

### First Visit
```
┌──────────────────────────────────────┐
│  [BLURRED BACKGROUND]                │
│                                       │
│  ╔════════════════════════════════╗  │
│  ║  🔐 Welcome to Tenchat    ║  │
│  ║                                ║  │
│  ║  📧 Enter your email           ║  │
│  ║  ┌────────────────────────┐   ║  │
│  ║  │ you@example.com        │   ║  │
│  ║  └────────────────────────┘   ║  │
│  ║                                ║  │
│  ║  [🔗 Connect Wallet]          ║  │
│  ╚════════════════════════════════╝  │
└──────────────────────────────────────┘

↓ Click "Connect Wallet"

┌──────────────────────────────────────┐
│  🦊 MetaMask Popup                    │
│  Connect with MetaMask?               │
│  [Cancel] [Connect]                   │
└──────────────────────────────────────┘

↓ Click "Connect"

┌──────────────────────────────────────┐
│  🦊 MetaMask Popup                    │
│  Signature Request                    │
│  Sign to authenticate                 │
│  [Cancel] [Sign]                      │
└──────────────────────────────────────┘

↓ Click "Sign"

┌──────────────────────────────────────┐
│  ✅ Success!                          │
│  Welcome to Tenchat               │
└──────────────────────────────────────┘
```

---

## 🎛️ Main Interface

Once authenticated, you'll see:

### Left Sidebar
```
┌─────────────────────┐
│ 👤 0x742d...16B2    │ ← Your wallet address
│ ✅ Connected         │
│                      │
│ 💰 Portfolio         │
│ $1,247.89           │
│ 📈 +12.5%           │
│                      │
│ [Send] [Gift]       │
│                      │
│ ─────────────────   │
│                      │
│ Conversations        │
│ • Alice              │
│ • Bob                │
│ • Charlie            │
└─────────────────────┘
```

### Top Bar
```
┌────────────────────────────────────────┐
│ Tenchat    🔍    [Settings] [⚙️]   │
└────────────────────────────────────────┘
```

### Settings (Click ⚙️)
```
╔═══════════════════════════════════════╗
║ 👤 Settings & Profile                 ║
║                                       ║
║ [Account] [Wallet] [Notifications]    ║
║                                       ║
║ WALLET TAB:                           ║
║ 0x742d35Cc6634C0532925a3b8D4C2468... ║
║ [📋 Copy] [🔗 View on Etherscan]      ║
║                                       ║
║ ACCOUNT TAB:                          ║
║ Display Name: User 742d35             ║
║ Email: user@example.com ⚠️ Unverified║
║ [Logout]                              ║
╚═══════════════════════════════════════╝
```

---

## 🔑 Key Concepts

### Your Identity = Your Wallet
```
Primary:    0x742d35Cc6634C0532925a3b8D4C2468bB3Ff16B2
Secondary:  user@example.com (recovery only)
Password:   ❌ None! (wallet signature instead)
```

### How Authentication Works
1. You enter your email
2. Connect your MetaMask wallet
3. Sign a message to prove ownership
4. Backend verifies your signature
5. Session created - you're in!

### No Passwords!
- ✅ Your wallet is your identity
- ✅ Sign messages to authenticate
- ✅ Email only for recovery
- ✅ True Web3 authentication

---

## 🎯 Common Actions

### Connect Wallet
```
1. Enter email
2. Click "Connect Wallet"
3. Approve in MetaMask (2 popups)
4. Done!
```

### View Wallet Address
```
1. Click Settings (⚙️)
2. Go to "Wallet" tab
3. See your full address
4. Click 📋 to copy
```

### Logout
```
1. Click Settings (⚙️)
2. Go to "Account" tab
3. Click "Logout"
4. Auth modal appears again
```

### Send Message
```
1. Click on a conversation
2. Type your message
3. Press Enter or click Send
```

### Send Gift (Web3 Feature)
```
1. Open a conversation
2. Click Gift button
3. Select token & amount
4. Confirm in MetaMask
5. Gift sent!
```

---

## ⚠️ Troubleshooting

### MetaMask Not Detected
```
Problem: "MetaMask not installed" error
Solution: 
1. Install MetaMask browser extension
2. Reload the page
3. Try again
```

### User Rejected Signature
```
Problem: "You cancelled the signature request"
Solution: 
1. Click "Connect Wallet" again
2. Approve both MetaMask popups
3. Don't click "Cancel"
```

### Authentication Failed
```
Problem: "Authentication failed" error
Solution:
1. Check console for errors
2. Verify Web3 function is deployed
3. Check VITE_WEB3_FUNCTION_ID is set
4. Try again
```

### Session Expired
```
Problem: Logged out unexpectedly
Solution:
1. Normal behavior after some time
2. Just reconnect your wallet
3. Sign the message again
```

---

## 🔒 Security Tips

### ✅ Do's
- Always verify the message you're signing
- Keep your MetaMask locked when not in use
- Use a hardware wallet for extra security
- Never share your private keys

### ❌ Don'ts
- Don't sign messages you don't understand
- Don't connect to suspicious websites
- Don't use the same wallet for everything
- Don't approve unlimited token allowances

---

## 📱 Mobile Usage

### Android
```
1. Install MetaMask mobile app
2. Open Tenchat in MetaMask browser
3. Follow normal auth flow
```

### iOS
```
1. Install MetaMask mobile app
2. Open Tenchat in MetaMask browser
3. Follow normal auth flow
```

---

## 🎓 Learn More

### Documentation
- `WEB3_AUTH_COMPLETION.md` - Technical details
- `UX_FLOW_DOCUMENTATION.md` - Visual flows
- `WEB3_INTEGRATION_SUMMARY.md` - Complete overview
- `USAGE_REACT.md` - Original specification

### Resources
- MetaMask Docs: https://docs.metamask.io/
- Appwrite Docs: https://appwrite.io/docs
- Ethereum Docs: https://ethereum.org/developers

---

## 🚀 Next Steps

Once you're authenticated:
1. ✅ Explore the interface
2. ✅ Check your Settings
3. ✅ Copy your wallet address
4. ✅ Start chatting!
5. ✅ Send your first crypto gift

---

**Ready?** Start with `npm run dev` and open `http://localhost:5173` 🎉
