#!/usr/bin/env node
/**
 * WhisperChat/TenChat - Comprehensive Database Schema Generator
 * Designed to scale to Telegram/WhatsApp levels with Web3/crypto integration and Gen Z features
 * 
 * Features:
 * - Real-time messaging (like WhatsApp/Telegram)
 * - E2E encryption support
 * - Web3/Crypto integrations (wallets, NFTs, tokens, gifting)
 * - Gen Z features (stories, reactions, stickers, viral content, AR filters)
 * - Scalability (proper indexing, sharding-ready structure)
 * - Smart contract hooks
 */

const fs = require('fs');

// Helper functions
const attr = (key, type, required = false, options = {}) => {
  const base = { key, type, required, array: options.array || false };
  
  if (type === 'string') {
    base.size = options.size || 255;
    base.default = options.default || null;
    base.encrypt = options.encrypt || false;
    if (options.elements) {
      base.format = 'enum';
      base.elements = options.elements;
    }
  } else if (type === 'integer') {
    base.min = options.min || -9223372036854775808;
    base.max = options.max || 9223372036854775807;
    base.default = options.default !== undefined ? options.default : null;
  } else if (type === 'double') {
    base.min = options.min || -1.7976931348623157e+308;
    base.max = options.max || 1.7976931348623157e+308;
    base.default = options.default !== undefined ? options.default : null;
  } else if (type === 'boolean') {
    base.default = options.default !== undefined ? options.default : false;
  } else if (type === 'datetime') {
    base.format = '';
    base.default = options.default || null;
  } else if (type === 'url') {
    base.format = 'url';
    base.default = options.default || null;
  } else if (type === 'email') {
    base.format = 'email';
    base.default = options.default || null;
  } else if (type === 'ip') {
    base.format = 'ip';
    base.default = options.default || null;
  }
  
  return base;
};

const index = (key, type, attributes, orders = null) => ({
  key,
  type,
  status: 'available',
  attributes,
  orders: orders || attributes.map(() => 'ASC')
});

const collection = (id, name, databaseId, attributes, indexes = [], docSecurity = false) => ({
  $id: id,
  $permissions: [
    'create("users")',
    'read("users")',
    'update("users")',
    'delete("users")',
    'read("any")'
  ],
  databaseId,
  name,
  enabled: true,
  documentSecurity: docSecurity,
  attributes,
  indexes
});

const bucket = (id, name, maxSize = 50000000, permissions = []) => ({
  $id: id,
  $permissions: permissions.length > 0 ? permissions : [
    'create("users")',
    'read("users")',
    'update("users")',
    'delete("users")'
  ],
  fileSecurity: false,
  name,
  enabled: true,
  maximumFileSize: maxSize,
  allowedFileExtensions: [],
  compression: 'gzip',
  encryption: true,
  antivirus: true
});

// Build the comprehensive schema
const config = {
  projectId: 'tenchat',
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectName: 'WhisperChat - Next-Gen Social & Crypto Messaging',
  settings: {
    services: {
      account: true,
      avatars: true,
      databases: true,
      locale: true,
      health: true,
      storage: true,
      teams: true,
      users: true,
      sites: true,
      functions: true,
      graphql: true,
      messaging: true
    },
    auth: {
      methods: {
        jwt: true,
        phone: true,
        invites: true,
        anonymous: true,
        'email-otp': true,
        'magic-url': true,
        'email-password': true
      },
      security: {
        duration: 31536000,
        limit: 0,
        sessionsLimit: 10,
        passwordHistory: 0,
        passwordDictionary: false,
        personalDataCheck: false,
        sessionAlerts: false,
        mockNumbers: []
      }
    }
  },
  
  databases: [
    { $id: 'mainDB', name: 'MainDatabase', enabled: true },
    { $id: 'socialDB', name: 'SocialDatabase', enabled: true },
    { $id: 'web3DB', name: 'Web3Database', enabled: true },
    { $id: 'contentDB', name: 'ContentDatabase', enabled: true },
    { $id: 'analyticsDB', name: 'AnalyticsDatabase', enabled: true }
  ],
  
  collections: [],
  buckets: []
};

// ========== MAIN DATABASE COLLECTIONS =========

// Profiles - Core user identity
config.collections.push(collection('profiles', 'Profiles', 'mainDB', [
  attr('userId', 'string', true, { size: 256 }),
  attr('username', 'string', false, { size: 50 }),
  attr('displayName', 'string', false, { size: 100 }),
  attr('bio', 'string', false, { size: 500 }),
  attr('email', 'email', false),
  attr('phone', 'string', false, { size: 20 }),
  attr('avatarUrl', 'url', false),
  attr('avatarFileId', 'string', false, { size: 256 }),
  attr('coverImageUrl', 'url', false),
  attr('coverImageFileId', 'string', false, { size: 256 }),
  attr('tagline', 'string', false, { size: 150 }),
  attr('location', 'string', false, { size: 100 }),
  attr('timezone', 'string', false, { size: 50 }),
  attr('website', 'url', false),
  attr('socialLinks', 'string', false, { size: 2000 }), // JSON
  attr('preferences', 'string', false, { size: 5000 }), // JSON
  attr('privacySettings', 'string', false, { size: 5000 }), // JSON
  attr('status', 'string', false, { elements: ['active', 'away', 'busy', 'offline', 'invisible'], default: 'active' }),
  attr('statusMessage', 'string', false, { size: 150 }),
  attr('lastSeen', 'datetime', false),
  attr('isOnline', 'boolean', false, { default: false }),
  attr('isVerified', 'boolean', false, { default: false }),
  attr('isPremium', 'boolean', false, { default: false }),
  attr('premiumExpiry', 'datetime', false),
  attr('reputationScore', 'integer', false, { default: 0 }),
  attr('level', 'integer', false, { default: 1 }),
  attr('xp', 'integer', false, { default: 0 }),
  attr('streakDays', 'integer', false, { default: 0 }),
  attr('badges', 'string', true, { size: 50, array: true }), // Badge IDs
  attr('interests', 'string', true, { size: 50, array: true }),
  attr('languages', 'string', true, { size: 20, array: true }),
  attr('theme', 'string', false, { elements: ['light', 'dark', 'auto', 'amoled'], default: 'auto' }),
  attr('createdAt', 'datetime', false),
  attr('updatedAt', 'datetime', false),
], [
  index('idx_username', 'unique', ['username']),
  index('idx_userId', 'unique', ['userId']),
  index('idx_isOnline', 'key', ['isOnline']),
  index('idx_lastSeen', 'key', ['lastSeen']),
], true));

// Conversations - Chat rooms
config.collections.push(collection('conversations', 'Conversations', 'mainDB', [
  attr('type', 'string', true, { elements: ['direct', 'group', 'channel', 'broadcast', 'community'] }),
  attr('name', 'string', false, { size: 100 }),
  attr('description', 'string', false, { size: 500 }),
  attr('avatarUrl', 'url', false),
  attr('avatarFileId', 'string', false, { size: 256 }),
  attr('creatorId', 'string', true, { size: 256 }),
  attr('participantIds', 'string', true, { size: 10000, array: true }),
  attr('adminIds', 'string', true, { size: 256, array: true }),
  attr('moderatorIds', 'string', true, { size: 256, array: true }),
  attr('participantCount', 'integer', false, { default: 0 }),
  attr('maxParticipants', 'integer', false, { default: 200000 }),
  attr('isEncrypted', 'boolean', false, { default: true }),
  attr('encryptionVersion', 'string', false, { size: 20 }),
  attr('isPinned', 'string', true, { size: 256, array: true }), // userIds
  attr('isMuted', 'string', true, { size: 256, array: true }),
  attr('isArchived', 'string', true, { size: 256, array: true }),
  attr('lastMessageId', 'string', false, { size: 256 }),
  attr('lastMessageText', 'string', false, { size: 300 }),
  attr('lastMessageAt', 'datetime', false),
  attr('lastMessageSenderId', 'string', false, { size: 256 }),
  attr('unreadCount', 'string', false, { size: 10000 }), // JSON: {userId: count}
  attr('settings', 'string', false, { size: 5000 }), // JSON
  attr('isPublic', 'boolean', false, { default: false }),
  attr('inviteLink', 'string', false, { size: 256 }),
  attr('inviteLinkExpiry', 'datetime', false),
  attr('category', 'string', false, { size: 50 }),
  attr('tags', 'string', true, { size: 50, array: true }),
  attr('createdAt', 'datetime', false),
  attr('updatedAt', 'datetime', false),
], [
  index('idx_lastMessageAt', 'key', ['lastMessageAt'], ['DESC']),
  index('idx_type', 'key', ['type']),
  index('idx_creatorId', 'key', ['creatorId']),
]));

// Messages - All chat messages
config.collections.push(collection('messages', 'Messages', 'mainDB', [
  attr('conversationId', 'string', true, { size: 256 }),
  attr('senderId', 'string', true, { size: 256 }),
  attr('content', 'string', true, { size: 10000 }), // Encrypted
  attr('contentType', 'string', true, { elements: [
    'text', 'image', 'video', 'audio', 'file', 'gif', 'sticker',
    'location', 'contact', 'poll', 'voice', 'crypto_tx', 'nft',
    'token_gift', 'link', 'reply', 'forward', 'story_reply', 'game'
  ]}),
  attr('plainText', 'string', false, { size: 300 }), // For search/preview
  attr('mediaUrls', 'string', true, { size: 1000, array: true }),
  attr('mediaFileIds', 'string', true, { size: 256, array: true }),
  attr('thumbnailUrl', 'url', false),
  attr('thumbnailFileId', 'string', false, { size: 256 }),
  attr('metadata', 'string', false, { size: 10000 }), // JSON
  attr('replyToMessageId', 'string', false, { size: 256 }),
  attr('forwardedFromMessageId', 'string', false, { size: 256 }),
  attr('forwardedFromConversationId', 'string', false, { size: 256 }),
  attr('editedAt', 'datetime', false),
  attr('deletedAt', 'datetime', false),
  attr('deletedFor', 'string', true, { size: 256, array: true }),
  attr('isSystemMessage', 'boolean', false, { default: false }),
  attr('isPinned', 'boolean', false, { default: false }),
  attr('pinnedAt', 'datetime', false),
  attr('reactions', 'string', false, { size: 10000 }), // JSON
  attr('mentions', 'string', true, { size: 256, array: true }),
  attr('links', 'string', true, { size: 1000, array: true }),
  attr('readBy', 'string', true, { size: 10000, array: true }),
  attr('deliveredTo', 'string', true, { size: 10000, array: true }),
  attr('status', 'string', false, { elements: ['sending', 'sent', 'delivered', 'read', 'failed'], default: 'sending' }),
  attr('expiresAt', 'datetime', false), // Self-destruct
  attr('createdAt', 'datetime', false),
  attr('updatedAt', 'datetime', false),
], [
  index('idx_conversation_time', 'key', ['conversationId', 'createdAt'], ['ASC', 'DESC']),
  index('idx_sender', 'key', ['senderId']),
  index('idx_contentType', 'key', ['contentType']),
]));

// Message Queue - Reliable delivery
config.collections.push(collection('messageQueue', 'MessageQueue', 'mainDB', [
  attr('messageId', 'string', true, { size: 256 }),
  attr('conversationId', 'string', true, { size: 256 }),
  attr('recipientIds', 'string', true, { size: 10000, array: true }),
  attr('pendingFor', 'string', true, { size: 10000, array: true }),
  attr('priority', 'integer', false, { default: 0 }),
  attr('retryCount', 'integer', false, { default: 0 }),
  attr('maxRetries', 'integer', false, { default: 3 }),
  attr('status', 'string', false, { elements: ['pending', 'processing', 'delivered', 'failed'], default: 'pending' }),
  attr('error', 'string', false, { size: 1000 }),
  attr('scheduledFor', 'datetime', false),
  attr('createdAt', 'datetime', false),
  attr('processedAt', 'datetime', false),
], [
  index('idx_status_priority', 'key', ['status', 'priority'], ['ASC', 'DESC']),
  index('idx_scheduled', 'key', ['scheduledFor']),
]));

// Contacts
config.collections.push(collection('contacts', 'Contacts', 'mainDB', [
  attr('userId', 'string', true, { size: 256 }),
  attr('contactUserId', 'string', true, { size: 256 }),
  attr('nickname', 'string', false, { size: 100 }),
  attr('relationship', 'string', false, { elements: ['friend', 'family', 'colleague', 'acquaintance', 'blocked', 'favorite'], default: 'friend' }),
  attr('isBlocked', 'boolean', false, { default: false }),
  attr('isFavorite', 'boolean', false, { default: false }),
  attr('notes', 'string', false, { size: 500 }),
  attr('tags', 'string', true, { size: 50, array: true }),
  attr('lastInteraction', 'datetime', false),
  attr('addedAt', 'datetime', false),
  attr('updatedAt', 'datetime', false),
], [
  index('idx_user_contact', 'unique', ['userId', 'contactUserId']),
  index('idx_relationship', 'key', ['userId', 'relationship']),
]));

// Typing Indicators
config.collections.push(collection('typingIndicators', 'TypingIndicators', 'mainDB', [
  attr('conversationId', 'string', true, { size: 256 }),
  attr('userId', 'string', true, { size: 256 }),
  attr('isTyping', 'boolean', true, { default: true }),
  attr('expiresAt', 'datetime', true),
], [
  index('idx_conversation_typing', 'key', ['conversationId', 'isTyping']),
  index('idx_expires', 'key', ['expiresAt']),
]));

// Presence - Online status
config.collections.push(collection('presence', 'Presence', 'mainDB', [
  attr('userId', 'string', true, { size: 256 }),
  attr('status', 'string', true, { elements: ['online', 'away', 'busy', 'offline'] }),
  attr('device', 'string', false, { size: 50 }),
  attr('lastSeen', 'datetime', true),
  attr('expiresAt', 'datetime', true),
], [
  index('idx_userId_unique', 'unique', ['userId']),
  index('idx_status', 'key', ['status']),
]));

// ========== SOCIAL DATABASE COLLECTIONS ==========

// Stories - Ephemeral content (24h)
config.collections.push(collection('stories', 'Stories', 'socialDB', [
  attr('userId', 'string', true, { size: 256 }),
  attr('contentType', 'string', true, { elements: ['image', 'video', 'text', 'audio'] }),
  attr('mediaUrl', 'url', false),
  attr('mediaFileId', 'string', false, { size: 256 }),
  attr('thumbnailUrl', 'url', false),
  attr('text', 'string', false, { size: 500 }),
  attr('backgroundColor', 'string', false, { size: 7 }), // Hex color
  attr('duration', 'integer', false, { default: 5 }), // seconds
  attr('filters', 'string', false, { size: 2000 }), // JSON: AR filters applied
  attr('stickers', 'string', false, { size: 2000 }), // JSON
  attr('music', 'string', false, { size: 500 }), // JSON: track info
  attr('location', 'string', false, { size: 200 }),
  attr('mentions', 'string', true, { size: 256, array: true }),
  attr('viewerIds', 'string', true, { size: 10000, array: true }),
  attr('viewCount', 'integer', false, { default: 0 }),
  attr('reactionCount', 'integer', false, { default: 0 }),
  attr('replyCount', 'integer', false, { default: 0 }),
  attr('shareCount', 'integer', false, { default: 0 }),
  attr('privacy', 'string', false, { elements: ['public', 'friends', 'close_friends', 'private'], default: 'friends' }),
  attr('allowReplies', 'boolean', false, { default: true }),
  attr('expiresAt', 'datetime', true),
  attr('createdAt', 'datetime', false),
], [
  index('idx_userId_time', 'key', ['userId', 'createdAt'], ['ASC', 'DESC']),
  index('idx_expires', 'key', ['expiresAt']),
]));

// Story Views
config.collections.push(collection('storyViews', 'StoryViews', 'socialDB', [
  attr('storyId', 'string', true, { size: 256 }),
  attr('viewerId', 'string', true, { size: 256 }),
  attr('watchDuration', 'integer', false, { default: 0 }), // ms
  attr('completedView', 'boolean', false, { default: false }),
  attr('viewedAt', 'datetime', false),
], [
  index('idx_story_viewer', 'unique', ['storyId', 'viewerId']),
  index('idx_storyId', 'key', ['storyId']),
]));

// Posts - Permanent social content
config.collections.push(collection('posts', 'Posts', 'socialDB', [
  attr('userId', 'string', true, { size: 256 }),
  attr('content', 'string', false, { size: 5000 }),
  attr('contentType', 'string', false, { elements: ['text', 'image', 'video', 'audio', 'poll', 'article'], default: 'text' }),
  attr('mediaUrls', 'string', true, { size: 1000, array: true }),
  attr('mediaFileIds', 'string', true, { size: 256, array: true }),
  attr('thumbnails', 'string', false, { size: 2000 }), // JSON
  attr('mentions', 'string', true, { size: 256, array: true }),
  attr('hashtags', 'string', true, { size: 50, array: true }),
  attr('location', 'string', false, { size: 200 }),
  attr('privacy', 'string', false, { elements: ['public', 'friends', 'private', 'custom'], default: 'public' }),
  attr('allowComments', 'boolean', false, { default: true }),
  attr('allowShares', 'boolean', false, { default: true }),
  attr('likeCount', 'integer', false, { default: 0 }),
  attr('commentCount', 'integer', false, { default: 0 }),
  attr('shareCount', 'integer', false, { default: 0 }),
  attr('viewCount', 'integer', false, { default: 0 }),
  attr('isPinned', 'boolean', false, { default: false }),
  attr('isSponsored', 'boolean', false, { default: false }),
  attr('createdAt', 'datetime', false),
  attr('updatedAt', 'datetime', false),
], [
  index('idx_userId_time', 'key', ['userId', 'createdAt'], ['ASC', 'DESC']),
  index('idx_hashtags', 'key', ['hashtags']),
]));

// Post Reactions
config.collections.push(collection('postReactions', 'PostReactions', 'socialDB', [
  attr('postId', 'string', true, { size: 256 }),
  attr('userId', 'string', true, { size: 256 }),
  attr('reaction', 'string', true, { size: 50 }), // Emoji or reaction type
  attr('createdAt', 'datetime', false),
], [
  index('idx_post_user_unique', 'unique', ['postId', 'userId']),
  index('idx_postId', 'key', ['postId']),
]));

// Comments
config.collections.push(collection('comments', 'Comments', 'socialDB', [
  attr('postId', 'string', true, { size: 256 }),
  attr('userId', 'string', true, { size: 256 }),
  attr('content', 'string', true, { size: 2000 }),
  attr('parentCommentId', 'string', false, { size: 256 }),
  attr('mentions', 'string', true, { size: 256, array: true }),
  attr('likeCount', 'integer', false, { default: 0 }),
  attr('replyCount', 'integer', false, { default: 0 }),
  attr('createdAt', 'datetime', false),
  attr('updatedAt', 'datetime', false),
], [
  index('idx_post_time', 'key', ['postId', 'createdAt'], ['ASC', 'DESC']),
  index('idx_userId', 'key', ['userId']),
]));

// Follows/Connections
config.collections.push(collection('follows', 'Follows', 'socialDB', [
  attr('followerId', 'string', true, { size: 256 }),
  attr('followingId', 'string', true, { size: 256 }),
  attr('status', 'string', false, { elements: ['pending', 'accepted', 'blocked'], default: 'accepted' }),
  attr('isCloseFriend', 'boolean', false, { default: false }),
  attr('notificationsEnabled', 'boolean', false, { default: true }),
  attr('createdAt', 'datetime', false),
], [
  index('idx_follower_following', 'unique', ['followerId', 'followingId']),
  index('idx_followingId', 'key', ['followingId']),
]));

// ========== WEB3 DATABASE COLLECTIONS ==========

// Wallets - Connected crypto wallets
config.collections.push(collection('wallets', 'Wallets', 'web3DB', [
  attr('userId', 'string', true, { size: 256 }),
  attr('address', 'string', true, { size: 256 }),
  attr('chain', 'string', true, { elements: ['ethereum', 'polygon', 'bsc', 'solana', 'avalanche', 'arbitrum', 'optimism', 'base'] }),
  attr('walletType', 'string', false, { elements: ['metamask', 'walletconnect', 'coinbase', 'phantom', 'trust', 'other'], default: 'metamask' }),
  attr('isPrimary', 'boolean', false, { default: false }),
  attr('nickname', 'string', false, { size: 100 }),
  attr('balance', 'string', false, { size: 2000 }), // JSON: {token: balance}
  attr('nftsCount', 'integer', false, { default: 0 }),
  attr('lastSynced', 'datetime', false),
  attr('isVerified', 'boolean', false, { default: false }),
  attr('verifiedAt', 'datetime', false),
  attr('addedAt', 'datetime', false),
], [
  index('idx_userId_chain', 'key', ['userId', 'chain']),
  index('idx_address_unique', 'unique', ['address', 'chain']),
]));

// NFTs - User's NFT collection
config.collections.push(collection('nfts', 'NFTs', 'web3DB', [
  attr('userId', 'string', true, { size: 256 }),
  attr('walletAddress', 'string', true, { size: 256 }),
  attr('chain', 'string', true, { size: 50 }),
  attr('contractAddress', 'string', true, { size: 256 }),
  attr('tokenId', 'string', true, { size: 256 }),
  attr('tokenStandard', 'string', false, { elements: ['ERC721', 'ERC1155', 'SPL'], default: 'ERC721' }),
  attr('name', 'string', false, { size: 200 }),
  attr('description', 'string', false, { size: 1000 }),
  attr('imageUrl', 'url', false),
  attr('animationUrl', 'url', false),
  attr('attributes', 'string', false, { size: 5000 }), // JSON
  attr('metadata', 'string', false, { size: 5000 }), // JSON
  attr('isHidden', 'boolean', false, { default: false }),
  attr('isProfilePicture', 'boolean', false, { default: false }),
  attr('lastSynced', 'datetime', false),
  attr('acquiredAt', 'datetime', false),
], [
  index('idx_userId', 'key', ['userId']),
  index('idx_contract_token', 'unique', ['contractAddress', 'tokenId', 'chain']),
]));

// Crypto Transactions - On-chain transaction tracking
config.collections.push(collection('cryptoTransactions', 'CryptoTransactions', 'web3DB', [
  attr('userId', 'string', true, { size: 256 }),
  attr('txHash', 'string', true, { size: 256 }),
  attr('chain', 'string', true, { size: 50 }),
  attr('type', 'string', true, { elements: ['send', 'receive', 'swap', 'nft_transfer', 'gift', 'tip', 'contract_interaction'] }),
  attr('fromAddress', 'string', true, { size: 256 }),
  attr('toAddress', 'string', true, { size: 256 }),
  attr('amount', 'string', false, { size: 100 }), // BigNumber string
  attr('token', 'string', false, { size: 100 }),
  attr('tokenAddress', 'string', false, { size: 256 }),
  attr('usdValue', 'double', false),
  attr('gasUsed', 'string', false, { size: 100 }),
  attr('gasPriceGwei', 'string', false, { size: 100 }),
  attr('status', 'string', false, { elements: ['pending', 'confirmed', 'failed'], default: 'pending' }),
  attr('blockNumber', 'integer', false),
  attr('timestamp', 'datetime', false),
  attr('relatedMessageId', 'string', false, { size: 256 }),
  attr('metadata', 'string', false, { size: 5000 }), // JSON
  attr('createdAt', 'datetime', false),
], [
  index('idx_userId_time', 'key', ['userId', 'timestamp'], ['ASC', 'DESC']),
  index('idx_txHash_unique', 'unique', ['txHash', 'chain']),
  index('idx_status', 'key', ['status']),
]));

// Token Gifts - Crypto gifting feature
config.collections.push(collection('tokenGifts', 'TokenGifts', 'web3DB', [
  attr('senderId', 'string', true, { size: 256 }),
  attr('recipientId', 'string', true, { size: 256 }),
  attr('conversationId', 'string', false, { size: 256 }),
  attr('messageId', 'string', false, { size: 256 }),
  attr('giftType', 'string', true, { elements: ['token', 'nft', 'wrapped'] }),
  attr('chain', 'string', true, { size: 50 }),
  attr('tokenAddress', 'string', false, { size: 256 }),
  attr('tokenAmount', 'string', false, { size: 100 }),
  attr('nftContractAddress', 'string', false, { size: 256 }),
  attr('nftTokenId', 'string', false, { size: 256 }),
  attr('usdValue', 'double', false),
  attr('message', 'string', false, { size: 500 }),
  attr('animation', 'string', false, { elements: ['confetti', 'fireworks', 'hearts', 'money_rain', 'custom'], default: 'confetti' }),
  attr('status', 'string', false, { elements: ['pending', 'claimed', 'expired', 'refunded'], default: 'pending' }),
  attr('txHash', 'string', false, { size: 256 }),
  attr('claimTxHash', 'string', false, { size: 256 }),
  attr('expiresAt', 'datetime', false),
  attr('claimedAt', 'datetime', false),
  attr('createdAt', 'datetime', false),
], [
  index('idx_recipient_status', 'key', ['recipientId', 'status']),
  index('idx_sender', 'key', ['senderId']),
  index('idx_expires', 'key', ['expiresAt']),
]));

// Smart Contract Hooks - Integration points for smart contracts
config.collections.push(collection('contractHooks', 'ContractHooks', 'web3DB', [
  attr('name', 'string', true, { size: 100 }),
  attr('chain', 'string', true, { size: 50 }),
  attr('contractAddress', 'string', true, { size: 256 }),
  attr('abi', 'string', true, { size: 10000 }), // JSON
  attr('hookType', 'string', true, { elements: ['escrow', 'dispute_resolution', 'reputation', 'governance', 'payment', 'nft_mint'] }),
  attr('isActive', 'boolean', false, { default: true }),
  attr('fallbackEnabled', 'boolean', false, { default: true }),
  attr('config', 'string', false, { size: 5000 }), // JSON
  attr('lastExecuted', 'datetime', false),
  attr('executionCount', 'integer', false, { default: 0 }),
  attr('errorCount', 'integer', false, { default: 0 }),
  attr('createdAt', 'datetime', false),
  attr('updatedAt', 'datetime', false),
], [
  index('idx_chain_type', 'key', ['chain', 'hookType']),
  index('idx_isActive', 'key', ['isActive']),
]));

// Token Holdings - Track user token balances
config.collections.push(collection('tokenHoldings', 'TokenHoldings', 'web3DB', [
  attr('userId', 'string', true, { size: 256 }),
  attr('walletAddress', 'string', true, { size: 256 }),
  attr('chain', 'string', true, { size: 50 }),
  attr('tokenAddress', 'string', true, { size: 256 }),
  attr('tokenSymbol', 'string', false, { size: 20 }),
  attr('tokenName', 'string', false, { size: 100 }),
  attr('balance', 'string', false, { size: 100 }), // BigNumber
  attr('decimals', 'integer', false, { default: 18 }),
  attr('usdValue', 'double', false),
  attr('pricePerToken', 'double', false),
  attr('lastSynced', 'datetime', false),
], [
  index('idx_user_chain_token', 'unique', ['userId', 'chain', 'tokenAddress']),
  index('idx_userId', 'key', ['userId']),
]));

// ========== CONTENT DATABASE COLLECTIONS ==========

// Stickers - Custom and platform stickers
config.collections.push(collection('stickers', 'Stickers', 'contentDB', [
  attr('name', 'string', true, { size: 100 }),
  attr('description', 'string', false, { size: 500 }),
  attr('creatorId', 'string', false, { size: 256 }),
  attr('packId', 'string', false, { size: 256 }),
  attr('imageUrl', 'url', true),
  attr('imageFileId', 'string', false, { size: 256 }),
  attr('animatedUrl', 'url', false),
  attr('animatedFileId', 'string', false, { size: 256 }),
  attr('tags', 'string', true, { size: 50, array: true }),
  attr('category', 'string', false, { size: 50 }),
  attr('isPremium', 'boolean', false, { default: false }),
  attr('isAnimated', 'boolean', false, { default: false }),
  attr('usageCount', 'integer', false, { default: 0 }),
  attr('isPublic', 'boolean', false, { default: true }),
  attr('createdAt', 'datetime', false),
], [
  index('idx_packId', 'key', ['packId']),
  index('idx_category', 'key', ['category']),
  index('idx_tags', 'key', ['tags']),
]));

// Sticker Packs
config.collections.push(collection('stickerPacks', 'StickerPacks', 'contentDB', [
  attr('name', 'string', true, { size: 100 }),
  attr('description', 'string', false, { size: 500 }),
  attr('creatorId', 'string', false, { size: 256 }),
  attr('coverImageUrl', 'url', false),
  attr('coverImageFileId', 'string', false, { size: 256 }),
  attr('stickerCount', 'integer', false, { default: 0 }),
  attr('isPremium', 'boolean', false, { default: false }),
  attr('price', 'double', false, { default: 0 }),
  attr('currency', 'string', false, { size: 10 }),
  attr('downloadCount', 'integer', false, { default: 0 }),
  attr('isPublic', 'boolean', false, { default: true }),
  attr('tags', 'string', true, { size: 50, array: true }),
  attr('createdAt', 'datetime', false),
  attr('updatedAt', 'datetime', false),
], [
  index('idx_creatorId', 'key', ['creatorId']),
  index('idx_isPremium', 'key', ['isPremium']),
]));

// User Sticker Collections
config.collections.push(collection('userStickers', 'UserStickers', 'contentDB', [
  attr('userId', 'string', true, { size: 256 }),
  attr('stickerPackId', 'string', true, { size: 256 }),
  attr('isPurchased', 'boolean', false, { default: false }),
  attr('isFavorite', 'boolean', false, { default: false }),
  attr('addedAt', 'datetime', false),
], [
  index('idx_user_pack', 'unique', ['userId', 'stickerPackId']),
  index('idx_userId', 'key', ['userId']),
]));

// GIFs - Integrated GIF library
config.collections.push(collection('gifs', 'GIFs', 'contentDB', [
  attr('title', 'string', true, { size: 200 }),
  attr('url', 'url', true),
  attr('fileId', 'string', false, { size: 256 }),
  attr('thumbnailUrl', 'url', false),
  attr('source', 'string', false, { size: 50 }), // giphy, tenor, custom
  attr('externalId', 'string', false, { size: 256 }),
  attr('tags', 'string', true, { size: 50, array: true }),
  attr('category', 'string', false, { size: 50 }),
  attr('width', 'integer', false),
  attr('height', 'integer', false),
  attr('usageCount', 'integer', false, { default: 0 }),
  attr('createdAt', 'datetime', false),
], [
  index('idx_category', 'key', ['category']),
  index('idx_tags', 'key', ['tags']),
]));

// Polls - Interactive polls in chats
config.collections.push(collection('polls', 'Polls', 'contentDB', [
  attr('creatorId', 'string', true, { size: 256 }),
  attr('conversationId', 'string', false, { size: 256 }),
  attr('messageId', 'string', false, { size: 256 }),
  attr('question', 'string', true, { size: 500 }),
  attr('options', 'string', true, { size: 5000 }), // JSON array
  attr('votes', 'string', false, { size: 10000 }), // JSON: {optionIndex: [userIds]}
  attr('totalVotes', 'integer', false, { default: 0 }),
  attr('allowMultiple', 'boolean', false, { default: false }),
  attr('isAnonymous', 'boolean', false, { default: false }),
  attr('expiresAt', 'datetime', false),
  attr('createdAt', 'datetime', false),
], [
  index('idx_conversationId', 'key', ['conversationId']),
  index('idx_creatorId', 'key', ['creatorId']),
]));

// AR Filters - Augmented reality filters
config.collections.push(collection('arFilters', 'ARFilters', 'contentDB', [
  attr('name', 'string', true, { size: 100 }),
  attr('description', 'string', false, { size: 500 }),
  attr('creatorId', 'string', false, { size: 256 }),
  attr('thumbnailUrl', 'url', true),
  attr('thumbnailFileId', 'string', false, { size: 256 }),
  attr('filterDataUrl', 'url', true), // 3D model/filter data
  attr('filterDataFileId', 'string', false, { size: 256 }),
  attr('category', 'string', false, { elements: ['face', 'world', 'sky', 'hand', 'body'], default: 'face' }),
  attr('tags', 'string', true, { size: 50, array: true }),
  attr('isPremium', 'boolean', false, { default: false }),
  attr('usageCount', 'integer', false, { default: 0 }),
  attr('isPublic', 'boolean', false, { default: true }),
  attr('createdAt', 'datetime', false),
], [
  index('idx_category', 'key', ['category']),
  index('idx_creatorId', 'key', ['creatorId']),
]));

// Media Library - User's uploaded media
config.collections.push(collection('mediaLibrary', 'MediaLibrary', 'contentDB', [
  attr('userId', 'string', true, { size: 256 }),
  attr('fileId', 'string', true, { size: 256 }),
  attr('fileName', 'string', true, { size: 256 }),
  attr('fileType', 'string', true, { size: 50 }),
  attr('mimeType', 'string', false, { size: 100 }),
  attr('fileSize', 'integer', false),
  attr('width', 'integer', false),
  attr('height', 'integer', false),
  attr('duration', 'integer', false), // for videos/audio
  attr('thumbnailFileId', 'string', false, { size: 256 }),
  attr('url', 'url', false),
  attr('metadata', 'string', false, { size: 5000 }), // JSON
  attr('tags', 'string', true, { size: 50, array: true }),
  attr('album', 'string', false, { size: 100 }),
  attr('isPublic', 'boolean', false, { default: false }),
  attr('uploadedAt', 'datetime', false),
], [
  index('idx_userId_time', 'key', ['userId', 'uploadedAt'], ['ASC', 'DESC']),
  index('idx_fileType', 'key', ['fileType']),
]));

// ========== ANALYTICS DATABASE COLLECTIONS ==========

// User Activity - Track user engagement
config.collections.push(collection('userActivity', 'UserActivity', 'analyticsDB', [
  attr('userId', 'string', true, { size: 256 }),
  attr('activityType', 'string', true, { elements: [
    'message_sent', 'message_received', 'story_posted', 'story_viewed',
    'post_created', 'post_liked', 'comment_posted', 'gift_sent',
    'nft_shared', 'login', 'logout', 'profile_update'
  ]}),
  attr('metadata', 'string', false, { size: 5000 }), // JSON
  attr('ipAddress', 'ip', false),
  attr('userAgent', 'string', false, { size: 500 }),
  attr('timestamp', 'datetime', true),
], [
  index('idx_userId_time', 'key', ['userId', 'timestamp'], ['ASC', 'DESC']),
  index('idx_activityType', 'key', ['activityType']),
]));

// Notifications
config.collections.push(collection('notifications', 'Notifications', 'analyticsDB', [
  attr('userId', 'string', true, { size: 256 }),
  attr('type', 'string', true, { elements: [
    'message', 'mention', 'follow', 'like', 'comment', 'gift_received',
    'story_reaction', 'nft_received', 'payment_received', 'system'
  ]}),
  attr('title', 'string', true, { size: 200 }),
  attr('body', 'string', false, { size: 500 }),
  attr('actionUrl', 'string', false, { size: 500 }),
  attr('imageUrl', 'url', false),
  attr('metadata', 'string', false, { size: 2000 }), // JSON
  attr('isRead', 'boolean', false, { default: false }),
  attr('readAt', 'datetime', false),
  attr('priority', 'string', false, { elements: ['low', 'normal', 'high', 'urgent'], default: 'normal' }),
  attr('expiresAt', 'datetime', false),
  attr('createdAt', 'datetime', false),
], [
  index('idx_userId_read', 'key', ['userId', 'isRead']),
  index('idx_createdAt', 'key', ['createdAt'], ['DESC']),
]));

// App Analytics - System-wide metrics
config.collections.push(collection('appAnalytics', 'AppAnalytics', 'analyticsDB', [
  attr('metricName', 'string', true, { size: 100 }),
  attr('metricValue', 'double', true),
  attr('dimensions', 'string', false, { size: 2000 }), // JSON: {key: value}
  attr('timestamp', 'datetime', true),
], [
  index('idx_metric_time', 'key', ['metricName', 'timestamp'], ['ASC', 'DESC']),
]));

// Error Logs
config.collections.push(collection('errorLogs', 'ErrorLogs', 'analyticsDB', [
  attr('userId', 'string', false, { size: 256 }),
  attr('errorType', 'string', true, { size: 100 }),
  attr('errorMessage', 'string', true, { size: 2000 }),
  attr('stackTrace', 'string', false, { size: 10000 }),
  attr('context', 'string', false, { size: 5000 }), // JSON
  attr('severity', 'string', false, { elements: ['debug', 'info', 'warning', 'error', 'critical'], default: 'error' }),
  attr('resolved', 'boolean', false, { default: false }),
  attr('timestamp', 'datetime', true),
], [
  index('idx_severity_time', 'key', ['severity', 'timestamp'], ['ASC', 'DESC']),
  index('idx_resolved', 'key', ['resolved']),
]));

// ========== STORAGE BUCKETS ==========

config.buckets = [
  bucket('avatars', 'User Avatars', 10000000), // 10MB
  bucket('covers', 'Cover Images', 20000000), // 20MB
  bucket('messages', 'Message Attachments', 100000000), // 100MB
  bucket('stories', 'Story Media', 50000000), // 50MB
  bucket('posts', 'Post Media', 100000000), // 100MB
  bucket('nfts', 'NFT Images', 50000000), // 50MB
  bucket('stickers', 'Sticker Images', 5000000), // 5MB
  bucket('filters', 'AR Filter Data', 20000000), // 20MB
  bucket('gifs', 'GIF Files', 10000000), // 10MB
  bucket('voice', 'Voice Messages', 50000000), // 50MB
  bucket('video', 'Video Files', 500000000), // 500MB
  bucket('documents', 'Documents', 100000000), // 100MB
];

// Write to file
fs.writeFileSync(
  'appwrite.config.json',
  JSON.stringify(config, null, 2),
  'utf8'
);

console.log('✅ Comprehensive WhisperChat schema generated successfully!');
console.log(`\nStatistics:`);
console.log(`- Databases: ${config.databases.length}`);
console.log(`- Collections: ${config.collections.length}`);
console.log(`- Storage Buckets: ${config.buckets.length}`);
console.log(`\nKey Features:`);
console.log(`- Real-time messaging with E2E encryption`);
console.log(`- Stories (24h ephemeral content)`);
console.log(`- Web3/Crypto integration (NFTs, tokens, gifting)`);
console.log(`- AR filters and stickers`);
console.log(`- Smart contract hooks for blockchain integration`);
console.log(`- Scalable architecture with proper indexing`);
console.log(`- Comprehensive analytics and error tracking`);
console.log(`\n🚀 Ready to deploy to Appwrite!`);
