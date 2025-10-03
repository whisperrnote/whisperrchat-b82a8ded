# WhisperChat - Quick Start Guide

## ✅ Environment Setup Complete

Your application has been cleaned up and configured with environment variables.

## 🚀 Getting Started

### 1. Configure Environment

The `.env` file has been created with default values. Update it with your Appwrite project details:

```bash
# Edit .env file
nano .env

# Or copy from example
cp .env.example .env
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── appwrite/              # Appwrite integration
│   │   ├── config/            # Client & constants
│   │   ├── services/          # Service modules
│   │   └── index.ts           # Main exports
│   └── appwrite.ts            # Legacy compatibility layer
├── services/                  # Business logic services
├── components/                # React components
├── pages/                     # Page components
└── types/                     # TypeScript definitions

```

## 🔧 Appwrite Services Available

### Core Services
- `profileService` - User profile management
- `messagingService` - Chat & messaging
- `socialService` - Social features (stories, posts, follows)
- `web3Service` - Web3 & crypto integration
- `storageService` - File storage
- `realtimeService` - Real-time subscriptions

### Usage Example

```typescript
import { profileService, messagingService } from '@/lib/appwrite';

// Get user profile
const profile = await profileService.getProfile(userId);

// Send message
const message = await messagingService.sendMessage({
  conversationId: 'conv123',
  content: 'Hello!',
  senderId: userId
});

// Subscribe to messages
const unsubscribe = realtimeService.subscribeToMessages(
  'conv123',
  (event) => console.log('New message:', event.payload)
);
```

## 🗄️ Database Schema

The application uses 5 databases:

1. **mainDB** - Core messaging functionality
   - profiles, conversations, messages, contacts, presence

2. **socialDB** - Social features
   - stories, posts, comments, reactions, follows

3. **web3DB** - Blockchain integration
   - wallets, nfts, transactions, token gifts

4. **contentDB** - Rich content
   - stickers, gifs, polls, AR filters

5. **analyticsDB** - Analytics & notifications
   - user activity, notifications, error logs

## 🔐 Environment Variables

All Appwrite configuration is managed through environment variables:

- Database IDs: `VITE_DATABASE_*`
- Collection IDs: `VITE_COLLECTION_*`
- Storage Buckets: `VITE_BUCKET_*`
- Functions: `VITE_WEB3_FUNCTION_ID`

See `.env.example` for the complete list.

## 🛠️ Build Status

✅ **Current Status**: Build successful, no errors

```
Bundle Size: ~140 KB (gzipped)
Modules: 2,718 transformed
Build Time: ~10-12s
```

## 📝 Important Notes

1. **TablesDB**: The app uses Appwrite's new TablesDB API (not legacy Collections)
2. **Real-time**: Real-time subscriptions use `client.subscribe()`
3. **Type Safety**: All database types are auto-generated in `src/types/appwrite.d.ts`

## 🐛 Troubleshooting

### Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Environment Issues

```bash
# Verify environment variables are loaded
npm run dev
# Check console for "VITE_APPWRITE_PROJECT_ID is not set" warnings
```

### Appwrite Connection

```bash
# Test Appwrite connection
curl https://fra.cloud.appwrite.io/v1/health
```

## 📚 Documentation

- [Appwrite TablesDB Docs](https://appwrite.io/docs/products/databases/tables)
- [Environment Setup](./ENV_MIGRATION_SUMMARY.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Architecture Overview](./ARCHITECTURE.md)

## 🚢 Deployment

The app is ready for deployment. Ensure environment variables are set in your deployment platform:

- Vercel: Add variables in dashboard
- Netlify: Use `netlify.toml` or dashboard
- Docker: Use `.env` file or environment injection

---

**Need Help?** Check the documentation files or review the service implementations in `src/lib/appwrite/services/`
