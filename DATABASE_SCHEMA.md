# WhisperChat/TenChat - Comprehensive Database Schema

## 🎯 Overview

This document describes the complete database architecture for WhisperChat, designed to scale to Telegram/WhatsApp levels while incorporating cutting-edge Web3/crypto features and Gen Z-focused functionality.

### Architecture Philosophy

- **Separation of Concerns**: 5 specialized databases for optimal performance and scalability
- **Real-time First**: Built for instant messaging with proper indexing
- **E2E Encryption**: Native support for encrypted communications
- **Web3 Native**: First-class blockchain and crypto integration
- **Future-Proof**: Smart contract hooks for decentralized features
- **Gen Z Features**: Stories, AR filters, viral content, gamification

---

## 📊 Database Structure

### 1. **MainDatabase** (mainDB)
Core messaging and user management functionality.

#### Collections:
- **profiles** - User identity and profile information
- **conversations** - Chat rooms (1-on-1, groups, channels, broadcasts)
- **messages** - All chat messages with E2E encryption
- **messageQueue** - Reliable message delivery system
- **contacts** - User connections and relationships
- **typingIndicators** - Real-time typing status
- **presence** - Online/offline status tracking

### 2. **SocialDatabase** (socialDB)
Social networking features beyond messaging.

#### Collections:
- **stories** - 24-hour ephemeral content (like Instagram Stories)
- **storyViews** - Track story engagement
- **posts** - Permanent social posts
- **postReactions** - Likes, loves, and emoji reactions
- **comments** - Post comments and replies
- **follows** - Social connections and friend relationships

### 3. **Web3Database** (web3DB)
Blockchain and cryptocurrency integration.

#### Collections:
- **wallets** - Connected crypto wallets (multi-chain)
- **nfts** - User's NFT collection
- **cryptoTransactions** - On-chain transaction tracking
- **tokenGifts** - Crypto gifting feature
- **contractHooks** - Smart contract integration points
- **tokenHoldings** - Token balance tracking

### 4. **ContentDatabase** (contentDB)
Rich media and interactive content.

#### Collections:
- **stickers** - Custom and platform stickers
- **stickerPacks** - Sticker collections
- **userStickers** - User's sticker library
- **gifs** - Integrated GIF library
- **polls** - Interactive polls
- **arFilters** - Augmented reality filters
- **mediaLibrary** - User's uploaded media

### 5. **AnalyticsDatabase** (analyticsDB)
System metrics and user insights.

#### Collections:
- **userActivity** - User engagement tracking
- **notifications** - Push notification system
- **appAnalytics** - System-wide metrics
- **errorLogs** - Error tracking and debugging

---

## 🗂️ Key Collections Detailed

### Profiles Collection (MainDB)

The core user identity collection with gamification and personalization.

**Key Features:**
- Username and display name
- Rich profile (bio, location, timezone)
- Online presence tracking
- Premium membership support
- Reputation and leveling system (XP, badges, streaks)
- Multi-language support
- Theme preferences (including AMOLED for Gen Z)

**Indexes:**
- Unique: `username`, `userId`
- Performance: `isOnline`, `lastSeen`

**Security:** Document-level security enabled

---

### Conversations Collection (MainDB)

Supports all conversation types with Telegram-level scalability.

**Conversation Types:**
- `direct` - 1-on-1 chats
- `group` - Group chats (up to 200K members)
- `channel` - Broadcast channels
- `broadcast` - One-to-many messaging
- `community` - Large community discussions

**Key Features:**
- E2E encryption support
- Role-based permissions (admin, moderator)
- Per-user settings (pinned, muted, archived)
- Invite link generation
- Public/private visibility
- Unread count tracking per user

**Scalability:**
- Max 200,000 participants (Telegram-style)
- Efficient indexing for fast queries
- Support for sharding via participantIds array

---

### Messages Collection (MainDB)

Comprehensive message types with rich metadata.

**Content Types:**
- Standard: text, image, video, audio, file
- Social: gif, sticker, location, contact, poll
- Crypto: `crypto_tx`, `nft`, `token_gift`
- Interactions: reply, forward, `story_reply`
- Gaming: game (for mini-games)

**Key Features:**
- E2E encrypted content storage
- Message reactions (emoji-based)
- Edit/delete tracking
- Read receipts and delivery status
- Self-destructing messages (expires)
- Media attachments with thumbnails
- Mention support
- Forward tracking

**Indexes:**
- Composite: `conversationId + createdAt` (chat history)
- Performance: `senderId`, `contentType`

---

### Stories Collection (SocialDB)

24-hour ephemeral content (Instagram/Snapchat style).

**Key Features:**
- Multi-format: image, video, text, audio
- AR filter integration
- Custom stickers and music
- Location tagging
- Mentions support
- Privacy levels (public, friends, close_friends, private)
- View/reaction/reply tracking
- Auto-expiry (24 hours)

**Use Cases:**
- Daily life sharing
- Flash sales/announcements
- Viral content distribution
- Community engagement

---

### Wallets Collection (Web3DB)

Multi-chain wallet management.

**Supported Chains:**
- ethereum
- polygon
- bsc (Binance Smart Chain)
- solana
- avalanche
- arbitrum
- optimism
- base

**Key Features:**
- Multiple wallets per user
- Primary wallet designation
- Real-time balance tracking
- NFT count tracking
- Wallet verification
- Nickname support for easy identification

---

### Token Gifts Collection (Web3DB)

Crypto gifting - a unique differentiator!

**Gift Types:**
- Token transfers (ERC20, SPL)
- NFT gifts
- Wrapped gifts (surprise reveals)

**Key Features:**
- In-chat crypto transfers
- Animated gift reveals (confetti, fireworks, hearts, money_rain)
- Personal messages
- Expiry and refund support
- USD value tracking
- Transaction hash tracking

**Use Cases:**
- Birthday gifts
- Tips for creators
- Contest prizes
- Viral marketing campaigns

---

### Smart Contract Hooks Collection (Web3DB)

Integration layer for smart contracts - future-proof architecture!

**Hook Types:**
- `escrow` - Payment escrow services
- `dispute_resolution` - Decentralized dispute handling
- `reputation` - On-chain reputation system
- `governance` - DAO-style governance
- `payment` - Payment processing
- `nft_mint` - NFT minting integration

**Key Features:**
- Multi-chain support
- ABI storage for contract interaction
- Fallback to centralized system
- Error tracking and retry logic
- Execution metrics

**Benefits:**
- Gradual migration to Web3
- Decentralization without sacrificing UX
- Smart contract upgradability
- Community governance capability

---

### AR Filters Collection (ContentDB)

Augmented reality filters for stories and video calls.

**Filter Types:**
- `face` - Face filters (makeup, masks, effects)
- `world` - Environmental AR
- `sky` - Sky replacement
- `hand` - Hand tracking effects
- `body` - Full body effects

**Key Features:**
- Creator attribution
- Premium filter marketplace
- Usage analytics
- 3D model/data storage

---

## 📦 Storage Buckets

Organized by content type for optimal performance:

1. **avatars** (10MB) - User profile pictures
2. **covers** (20MB) - Cover images
3. **messages** (100MB) - Message attachments
4. **stories** (50MB) - Story media
5. **posts** (100MB) - Post media
6. **nfts** (50MB) - NFT images
7. **stickers** (5MB) - Sticker images
8. **filters** (20MB) - AR filter data
9. **gifs** (10MB) - GIF files
10. **voice** (50MB) - Voice messages
11. **video** (500MB) - Video files
12. **documents** (100MB) - Document attachments

**Features:**
- Gzip compression enabled
- Encryption at rest
- Antivirus scanning
- Per-file access control

---

## 🔐 Security Features

### Authentication
- Multi-method auth (email, phone, Web3 wallet, social)
- JWT tokens with 1-year duration
- Up to 10 concurrent sessions
- Anonymous guest support

### Data Protection
- E2E encryption for messages
- Encrypted storage for sensitive data
- Document-level security for profiles
- IP tracking for audit logs

### Privacy
- Granular privacy settings per user
- Read receipt control
- Online status hiding
- Blocked user management

---

## 🚀 Scalability Considerations

### Horizontal Scaling
- Database separation allows independent scaling
- Array fields support sharding (participantIds, etc.)
- Proper indexing for query performance

### Performance Optimization
- Composite indexes on frequently queried fields
- Denormalized data where appropriate (lastMessage, counts)
- Message queue for reliable delivery
- Presence system with auto-expiry

### Real-time Support
- Typing indicators with TTL
- Online presence tracking
- Message delivery status
- Live notifications

---

## 🎮 Gamification Features

### User Progression
- **XP System**: Earn experience points for activity
- **Levels**: Unlock features as you level up
- **Badges**: Achievement system
- **Streaks**: Daily activity tracking
- **Reputation**: Community-driven scoring

### Social Engagement
- Post reactions beyond likes
- Story views and reactions
- Poll interactions
- Comment threading

---

## 🌐 Web3 Integration

### Current Features
- Multi-chain wallet connections
- NFT display and sharing
- Token balance tracking
- In-chat crypto transfers
- NFT gifting

### Future Capabilities (Smart Contracts)
- Decentralized escrow
- Token-gated channels
- DAO governance
- NFT minting
- Reputation tokens
- DeFi integrations

### Fallback Strategy
Every Web3 feature has a centralized fallback:
- Smart contract hooks with `fallbackEnabled` flag
- Centralized payment processing as backup
- Off-chain reputation calculation
- Traditional dispute resolution

---

## 📈 Analytics & Monitoring

### User Analytics
- Activity tracking
- Engagement metrics
- Retention analysis
- Feature usage

### System Analytics
- Performance metrics
- Error rates
- API usage
- Storage utilization

### Business Intelligence
- User growth
- Premium conversions
- Gift/transaction volume
- Viral content tracking

---

## 🔮 Future Enhancements

### Planned Collections
1. **miniGames** - In-chat mini-games
2. **marketplace** - NFT/sticker marketplace
3. **subscriptions** - Creator subscriptions
4. **channels** - Broadcast channels
5. **communities** - Super groups
6. **bots** - Chat bot integrations

### Advanced Features
1. **Voice/Video Calls** - Real-time communication
2. **Screen Sharing** - Collaboration features
3. **Live Streaming** - Creator tools
4. **AI Assistants** - Smart replies, translations
5. **Cross-chain Bridge** - Multi-chain transfers
6. **Metaverse Integration** - Virtual worlds

---

## 🛠️ Development Guidelines

### Adding New Features
1. Choose appropriate database
2. Design with indexing in mind
3. Consider document size limits (10KB recommended)
4. Use arrays for relationships when scalable
5. Add proper timestamps
6. Include soft delete support where needed

### Best Practices
- Use `userId` not `email` for relationships
- Store JSON as strings for complex objects
- Implement pagination for large lists
- Add `createdAt` and `updatedAt` to all collections
- Use enums for fixed value sets
- Include metadata fields for extensibility

### Performance Tips
- Index frequently queried fields
- Denormalize when joins would be expensive
- Use composite indexes for multi-field queries
- Implement caching for hot data
- Consider read vs write patterns

---

## 📚 API Integration Examples

### Send Encrypted Message
```javascript
// 1. Create message in Messages collection
// 2. Add to MessageQueue for delivery
// 3. Update Conversation.lastMessage
// 4. Increment unreadCount for recipients
// 5. Trigger push notifications
```

### Send Crypto Gift
```javascript
// 1. Create tokenGift record
// 2. Initiate blockchain transaction
// 3. Create system message in chat
// 4. Monitor transaction confirmation
// 5. Update gift status
// 6. Notify recipient
```

### Post Story
```javascript
// 1. Upload media to stories bucket
// 2. Create story in Stories collection
// 3. Set 24h expiry
// 4. Notify followers
// 5. Track views in StoryViews
```

---

## 🎨 Gen Z Features Summary

### Visual & Interactive
✅ Stories with AR filters
✅ Custom stickers and GIF library
✅ Animated emoji reactions
✅ Rich media messages
✅ Polls and interactive content

### Social & Viral
✅ Follow/follower system
✅ Public posts and comments
✅ Hashtag support
✅ Trending content (via analytics)
✅ Share to stories

### Gaming & Rewards
✅ XP and leveling system
✅ Achievement badges
✅ Daily streaks
✅ Reputation scores
✅ Premium features

### Crypto & Web3
✅ Multi-chain wallet support
✅ NFT display and trading
✅ Crypto gifting with animations
✅ Token-based features
✅ Smart contract ready

---

## 📊 Statistics

- **Total Databases**: 5
- **Total Collections**: 30
- **Total Storage Buckets**: 12
- **Supported Blockchains**: 8
- **Message Content Types**: 16
- **AR Filter Categories**: 5
- **Supported Auth Methods**: 7

---

## 🚀 Deployment

The schema is ready for deployment via Appwrite CLI:

```bash
# Deploy configuration
appwrite deploy database

# Deploy collections
appwrite deploy collection

# Deploy storage buckets
appwrite deploy bucket
```

---

## 📝 Change Log

### Version 1.0.0 (2024)
- Initial comprehensive schema
- 5 specialized databases
- 30 collections covering all features
- 12 storage buckets
- Full Web3 integration
- Social features (stories, posts, follows)
- Gamification system
- AR filter support
- Analytics and monitoring

---

## 🤝 Contributing

When adding new features:
1. Choose the appropriate database
2. Design collections with scalability in mind
3. Add proper indexes
4. Update this documentation
5. Test thoroughly before deploying

---

## 📞 Support

For questions or issues:
- Review this documentation
- Check collection schemas
- Consult Appwrite documentation
- Review the sample config (appwrite.sample.json)

---

**Built to scale. Designed for Gen Z. Powered by Web3.** 🚀
