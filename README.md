# WhisperChat - Next-Gen Messaging Platform

A feature-rich messaging application with Web3 integration, social features, and real-time communication.

## 🚀 Features

- 💬 Real-time messaging with end-to-end encryption
- 🌐 Web3 & cryptocurrency integration
- 📸 Stories, posts, and social feeds
- 🎨 Stickers, GIFs, and AR filters
- 🎁 Token gifting and NFT support
- 📊 Analytics and user insights
- 🔐 Secure authentication with Appwrite

## 📋 Project Info

**URL**: https://lovable.dev/projects/c16deedd-a7ca-4f15-b0fe-e14dd8ed0faf

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c16deedd-a7ca-4f15-b0fe-e14dd8ed0faf) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd whisperrchat-b82a8ded

# Step 3: Install the necessary dependencies.
npm install

# Step 4: Configure environment variables
cp .env.example .env
# Edit .env with your Appwrite credentials

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## 🛠️ Tech Stack

This project is built with:

- **Frontend**: Vite + React + TypeScript
- **UI Components**: shadcn-ui + Tailwind CSS
- **Backend**: Appwrite (TablesDB)
- **Blockchain**: Web3.js + Ethers.js
- **Real-time**: Appwrite Real-time API

## 📚 Documentation

- [Quick Start Guide](./QUICK_START.md) - Comprehensive setup guide
- [Environment Setup](./ENV_MIGRATION_SUMMARY.md) - Environment configuration details
- [Database Schema](./DATABASE_SCHEMA.md) - Database structure and relationships
- [Architecture](./ARCHITECTURE.md) - System architecture overview

## 🗄️ Database Structure

The application uses 5 Appwrite databases:

1. **mainDB** - Core messaging (profiles, conversations, messages)
2. **socialDB** - Social features (stories, posts, follows)
3. **web3DB** - Blockchain integration (wallets, NFTs, transactions)
4. **contentDB** - Rich content (stickers, GIFs, filters)
5. **analyticsDB** - Analytics and notifications

## 🎯 Service Architecture

```
src/lib/appwrite/
├── config/          # Appwrite client & configuration
├── services/        # Service modules
│   ├── profile.service.ts
│   ├── messaging.service.ts
│   ├── social.service.ts
│   ├── web3.service.ts
│   ├── storage.service.ts
│   └── realtime.service.ts
└── index.ts        # Central exports
```

## 🚀 Deployment

## 🚀 Deployment

**Via Lovable**

Simply open [Lovable](https://lovable.dev/projects/c16deedd-a7ca-4f15-b0fe-e14dd8ed0faf) and click on Share → Publish.

**Manual Deployment**

```sh
# Build the project
npm run build

# Deploy the dist/ folder to your hosting platform
# (Vercel, Netlify, etc.)
```

**Environment Variables**

Ensure all required environment variables are set in your deployment platform:
- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`
- All database and collection IDs (see `.env.example`)

## 🌐 Custom Domain

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 📈 Performance

- Bundle size: ~140 KB (gzipped)
- 2,700+ optimized modules
- Code splitting for optimal loading
- Real-time subscriptions with efficient filtering

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is part of the Lovable platform.

## 🔗 Links

- [Lovable Project](https://lovable.dev/projects/c16deedd-a7ca-4f15-b0fe-e14dd8ed0faf)
- [Documentation](./QUICK_START.md)
- [Report Issues](https://github.com/yourusername/whisperrchat/issues)
