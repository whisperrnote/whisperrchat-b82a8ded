# TenChat MVP - Setup & Deployment Guide

## 🚀 MVP Status: Ready for Testing

This is the **Minimum Viable Product (MVP)** version of TenChat - an end-to-end encrypted messaging platform with optional blockchain features.

## ⚠️ MVP Security Notice

**Authentication:**

- ✅ **Wallet Authentication**: Uses Appwrite Function for verification and session creation

**For Production:**
- Passkey and Wallet auth require backend API routes for proper verification
- See `ignore1/passkey` and `ignore1/web3` for Next.js API route examples
- Move to a proper backend service (Node.js/Express, Next.js API, etc.)

## 🎯 Features

### Implemented
- ✅ End-to-end encryption (E2EE) for messages
- ✅ OTP-based authentication
- ✅ Real-time messaging interface
- ✅ Conversation management
- ✅ Key management with rotation support
- ✅ Client-side encryption/decryption
- ✅ Message persistence (localStorage)
- ✅ Responsive UI with dark mode

### Planned (Post-MVP)
- 🔄 Backend API for Passkey/Wallet verification
- 🔄 WebSocket for real-time updates
- 🔄 Media attachments with encryption
- 🔄 Blockchain anchoring
- 🔄 Micropayments
- 🔄 Plugin system

## 📋 Prerequisites

- Node.js 18+ and npm
- Appwrite account and project
- Modern browser with WebAuthn support (optional, for passkeys)
- Web3 wallet like MetaMask (optional, for wallet auth)

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd whisperrchat-b82a8ded
npm install
```

### 2. Configure Environment

Create `.env.local` from the example:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Appwrite credentials:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_WEB3_FUNCTION_ID=your-web3-auth-function-id
```

### 3. Setup Appwrite Project

1. Create a new project at [cloud.appwrite.io](https://cloud.appwrite.io)
2. Enable Email/Password authentication
3. Add your domain to the allowed origins
4. Copy the Project ID to your `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
npm run preview
```

## 🏗️ Architecture Overview

TenChat follows the architecture defined in `ARCHITECTURE.md`:

```
src/
├── components/        # UI components
│   ├── auth/         # Authentication components
│   ├── messaging/    # Chat interface
│   ├── layout/       # App layout
│   └── ui/           # shadcn/ui components
├── services/         # Business logic
│   ├── auth.service.ts
│   ├── crypto.service.ts
│   ├── messaging.service.ts
│   ├── key-management.service.ts
│   └── blockchain.service.ts
├── lib/              # Utilities & configs
├── types/            # TypeScript definitions
└── pages/            # Page components
```

## 🔐 Security Features

### End-to-End Encryption
- **Algorithm**: AES-GCM with 256-bit keys
- **Key Management**: Per-conversation ratcheting keys
- **Session State**: Double Ratchet-inspired protocol (simplified for MVP)
- **Storage**: Keys stored in browser IndexedDB/localStorage (encrypted at rest planned)

### Authentication Method

#### Wallet via Appwrite Function
```typescript
// Flow:
// 1) Connect wallet (MetaMask)
// 2) Sign message
// 3) Call Appwrite Function with { email, address, signature, message }
// 4) Receive { userId, secret } and create session via account.createSession
```

## 📊 TODO Progress

See `TODO.md` for detailed roadmap. Current phase:

- ✅ Phase 1: Bootstrap & Cleanup (90% complete)
- 🔄 Phase 2: Identity & Key Management (60% complete)
- 🔄 Phase 3: Encrypted Messaging Pipeline (70% complete)
- 🔄 Phase 4: UI Shell & Interaction (80% complete)

## 🧪 Testing

```bash
# Run unit tests (when implemented)
npm test

# Lint code
npm run lint

# Build check
npm run build
```

## 🚀 Deployment

### Option 1: Vercel/Netlify (Recommended)

1. Connect your GitHub repository
2. Set environment variables in the platform dashboard
3. Deploy automatically on push

### Option 2: Static Hosting

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

### Option 3: Docker

```bash
# Create Dockerfile (example provided below)
docker build -t tenchat .
docker run -p 80:80 tenchat
```

## 📝 Development Workflow

1. **Feature Development**: Create branch from `main`
2. **Code Style**: Follow existing patterns, use TypeScript
3. **Commits**: Use conventional commits (feat, fix, docs, etc.)
4. **Testing**: Test authentication and messaging flows
5. **PR**: Submit for review with description

## 🐛 Known Limitations (MVP)

1. **No Backend**: Passkey/Wallet auth simplified
2. **LocalStorage**: Messages stored in browser (not synced across devices)
3. **No WebSocket**: Polling for messages instead
4. **Single Device**: Keys not synced across devices
5. **No Media**: Text messages only
6. **No Search**: Basic conversation list only

## 🔜 Next Steps (Post-MVP)

1. **Backend API**: Implement proper auth verification
   - See `ignore1/passkey` for passkey example
   - See `ignore1/web3` for wallet example
   
2. **Database**: Move from localStorage to Appwrite Database
   ```typescript
   // Setup collections:
   - conversations
   - messages (encrypted)
   - user_keys
   ```

3. **Real-time**: WebSocket/SSE for live updates

4. **Mobile**: React Native version

5. **Desktop**: Electron wrapper

## 📚 Resources

- [Architecture Document](./ARCHITECTURE.md) - Full system design
- [TODO Roadmap](./TODO.md) - Development phases
- [Appwrite Docs](https://appwrite.io/docs)
- [WebAuthn Guide](https://webauthn.guide/)

## 🤝 Contributing

1. Read `ARCHITECTURE.md` for design principles
2. Check `TODO.md` for current priorities
3. Follow the code generation guidelines in service files
4. Submit PRs with clear descriptions

## 📄 License

[Add your license here]

## 🆘 Support

- Issues: GitHub Issues
- Docs: See `/docs` folder
- Architecture Questions: See `ARCHITECTURE.md`

---

**Version**: 0.1.0-mvp  
**Last Updated**: 2025-01-XX  
**Status**: ✅ MVP Ready for Testing
