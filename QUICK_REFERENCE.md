# Tenchat - Quick Reference Guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
whisperrchat-b82a8ded/
├── src/
│   ├── components/          # UI components
│   │   ├── auth/           # Authentication components
│   │   ├── gifting/        # Crypto gifting components
│   │   ├── layout/         # Layout components (topbar, main-layout)
│   │   ├── messaging/      # Chat and messaging components
│   │   ├── settings/       # Settings overlay
│   │   ├── ui/             # Reusable UI components (shadcn)
│   │   └── web3/           # Web3 components
│   ├── contexts/           # React contexts (AppwriteContext)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   │   ├── appwrite/       # Appwrite integration
│   │   └── utils.ts        # Helper utilities
│   ├── pages/              # Page components
│   ├── services/           # Business logic services
│   ├── styles/             # Global styles
│   │   └── globals.css     # Global CSS with design tokens
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── dist/                   # Production build output
└── index.html             # Entry HTML file
```

## 🎨 Key Components

### Authentication
- **AuthModal**: Wallet connection and email authentication
- **AppwriteContext**: Manages authentication state

### Messaging
- **ChatInterface**: Main chat UI with E2EE features
- **ConversationList**: List of conversations with search
- **MessageBubble**: Individual message display
- **NewChatModal**: Start new conversations
- **SearchModal**: Global search functionality

### Layout
- **Topbar**: Top navigation with user menu
- **MainLayout**: Main application layout
- **SettingsOverlay**: User settings and preferences

### Web3
- **GiftDialog**: Send crypto gifts
- **WalletCard**: Display wallet information

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Appwrite
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id

# Databases
VITE_DATABASE_MAIN=mainDB
VITE_DATABASE_SOCIAL=socialDB
VITE_DATABASE_WEB3=web3DB
VITE_DATABASE_CONTENT=contentDB
VITE_DATABASE_ANALYTICS=analyticsDB

# Collections (see .env.example for full list)
```

## 🎯 Features

### Core Features
- ✅ MetaMask wallet authentication
- ✅ End-to-end encrypted messaging
- ✅ Real-time conversations
- ✅ User profiles
- ✅ Settings management

### Web3 Features
- ✅ Wallet connection (MetaMask)
- ✅ Crypto gifting
- ✅ Transaction display
- ✅ Blockchain security indicators

### UI Features
- ✅ Dark theme with crypto aesthetics
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states
- ✅ Smooth animations
- ✅ Keyboard navigation

## 🔒 Security

### End-to-End Encryption
- Messages encrypted before sending
- Decrypted only on recipient device
- Session fingerprints for verification

### Blockchain Security
- Message hashes anchored on blockchain
- Immutable audit trail
- Cryptographic signatures

## 🎨 Design System

### Colors
```css
--violet-primary: #8b5cf6
--purple-primary: #a855f7
--background: #000000
--foreground: #ffffff
```

### Typography
- Font: Inter (system font fallback)
- Sizes: 12px - 32px (responsive)

### Spacing
- Base unit: 4px (0.25rem)
- Scale: 4, 8, 12, 16, 24, 32, 48, 64px

## 🧪 Testing

```bash
# Run linting
npm run lint

# TypeScript type checking
npx tsc --noEmit
```

## 📦 Build Output

### Production Build
```
dist/
├── index.html           # Entry HTML (2.14 kB)
└── assets/
    ├── index-*.css      # Styles (108 kB)
    └── index-*.js       # JavaScript (444 kB)
```

### Bundle Sizes (Gzipped)
- HTML: 0.88 kB
- CSS: 18.76 kB
- JS: 128.89 kB
- **Total: ~148 kB**

## 🚀 Deployment

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Manual Deployment
1. Build: `npm run build`
2. Upload `dist/` folder to hosting
3. Configure environment variables
4. Set up redirects for SPA

## 🐛 Troubleshooting

### Build Errors
- **Missing utils.ts**: Created at `src/lib/utils.ts`
- **TypeScript errors**: Run `npx tsc --noEmit` to check

### Runtime Errors
- **MetaMask not found**: User needs to install MetaMask
- **Authentication fails**: Check Appwrite configuration
- **Messages not loading**: Verify database collections exist

## 📚 Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

See LICENSE file for details.

---

**Last Updated**: $(date)
**Version**: 1.0.0 MVP
**Status**: Production Ready ✅
