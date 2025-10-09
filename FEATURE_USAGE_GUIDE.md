# Quick Reference: New Features Usage

## For Developers

### 1. Search for Users
```typescript
import { userService } from '@/lib/appwrite/services';

// Search by username
const users = await userService.searchUsers('alice');

// Get by exact username
const user = await userService.getUserByUsername('alice');

// Get by wallet
const user = await userService.getUserByWallet('0x123...');

// Check username availability
const available = await userService.isUsernameAvailable('newname');
```

### 2. Create Conversations
```typescript
import { messagingService } from '@/lib/appwrite/services';

// Get or create direct conversation
const conversation = await messagingService.getOrCreateDirectConversation(
  currentUserId,
  targetUserId
);

// Get user's conversations
const conversations = await messagingService.getUserConversations(userId);
```

### 3. Send Gifts
```typescript
import { giftingService } from '@/lib/appwrite/services';

// Get available gifts
const gifts = giftingService.getAvailableGifts();

// Get gifts by category
const emojiGifts = giftingService.getGiftsByCategory('emoji');
const cryptoGifts = giftingService.getGiftsByCategory('crypto');

// Get gifts by rarity
const legendaryGifts = giftingService.getGiftsByRarity('legendary');

// Send a gift
await giftingService.sendGift(
  conversationId,
  senderId,
  'unicorn', // giftId
  'Happy birthday!' // optional message
);
```

### 4. Generate QR Codes
```typescript
import { userService, giftingService } from '@/lib/appwrite/services';

// Profile QR code
const profileQR = userService.generateQRCodeData('alice', '0x123...');

// Payment QR code
const paymentQR = giftingService.generatePaymentQRCode({
  recipientAddress: '0x123...',
  amount: '10',
  token: 'USDC',
  chain: 'polygon',
  recipientUsername: 'alice'
});

// Generate shareable link
const link = userService.generateProfileLink('alice');
// Returns: https://yourapp.com/chat?username=alice
```

### 5. Handle Deep Links
```typescript
import { useUrlHandler } from '@/hooks/useUrlHandler';

// In your component
useUrlHandler({
  currentUserId: user.id,
  onChatCreated: (conversationId) => {
    // Navigate to chat
    setSelectedConversation(conversationId);
  },
  onPaymentRequest: (paymentData) => {
    // Open payment dialog
    setPaymentRequest(paymentData);
  }
});
```

### 6. Use Enhanced Components

#### New Chat Modal
```typescript
<NewChatModal
  open={showNewChat}
  onOpenChange={setShowNewChat}
  currentUserId={currentUser.id}
  currentUsername={currentUser.displayName}
  onChatCreated={(conversationId) => {
    // Handle new chat
  }}
/>
```

#### QR Code Dialog
```typescript
<QRCodeDialog
  open={showQR}
  onOpenChange={setShowQR}
  data={qrData}
  title="Scan to Chat"
  description="Share this QR code with others"
/>
```

#### Enhanced Gift Dialog
```typescript
<EnhancedGiftDialog
  open={showGifts}
  onOpenChange={setShowGifts}
  recipientUsername="alice"
  recipientWallet="0x123..."
  onSendGift={async (giftId, message) => {
    await messagingService.sendGift(conversationId, senderId, giftId, 10, 'GIFT', message);
  }}
  onSendCrypto={async (amount, token, chain) => {
    // Handle crypto transaction
  }}
/>
```

## For Users

### Starting a Chat

1. **By Username**
   - Click "New Chat" button
   - Type username in search (e.g., @alice)
   - Click on user from results
   - Chat opens instantly!

2. **By QR Code**
   - Click "New Chat"
   - Click "Show QR"
   - Share QR with friend
   - They scan and chat starts!

3. **By Wallet**
   - Click "New Chat"
   - Switch to "Wallet" tab
   - Paste wallet address
   - Click to start chat

4. **By Link**
   - Share link: `https://app.com/chat?username=alice`
   - Others click link
   - Chat opens automatically!

### Sending Gifts

1. Open a chat
2. Click gift icon
3. Choose "Gifts" tab
4. Filter by rarity (optional)
5. Click on a gift
6. Add optional message
7. Click "Send Gift"

### Sending Crypto

1. Open a chat
2. Click gift icon
3. Choose "Crypto" tab
4. Select blockchain
5. Select token
6. Enter amount
7. Click "Send Now" or "Generate QR"

### Self-Chat (Me)

1. Look at conversation list
2. Find "Your Name (Me)" at top
3. Click to open
4. Test all features here!
5. Perfect for demos

### Sharing Your Profile

1. Click "New Chat"
2. Click "Show QR" button
3. Options appear:
   - **Copy Link**: Copy profile URL
   - **Show QR**: Display QR code
   - **Share**: Native share dialog
4. Share with anyone!

## URL Parameters Reference

### Direct Chat
```
?username=alice       → Start chat with @alice
?wallet=0x123...      → Find user by wallet and chat
```

### Payment Request
```
?to=0x123...          → Recipient address
&amount=10            → Amount to send
&token=USDC           → Token symbol
&chain=polygon        → Blockchain
&message=For coffee   → Optional message
```

### QR Code
```
?qr=<base64_data>     → Process QR code data
```

## Gift Catalog Quick Reference

### Common (1-5 points)
❤️ Heart, 🌹 Rose, ⭐ Star, 🔥 Fire, ✨ Sparkles, 🎉 Party, 🎈 Balloon, 🌻 Sunflower, 🍒 Cherry, ☕ Coffee, 🐱 Cat, 🐶 Dog

### Rare (5-15 points)
💎 Gem, 👑 Crown, 🏆 Trophy, 🎂 Cake, 🍾 Champagne, 🌈 Rainbow, 🍫 Chocolate, 🚀 Rocket, 🎁 Gift Box, 🪄 Magic

### Epic (15-30 points)
🦄 Unicorn, 🐉 Dragon, 🔮 Crystal Ball, 💸 Money Wings, 💰 Money Bag, ⚡ Lightning, 🌙 Moon

### Legendary (50-100 points)
🔥🦅 Phoenix, 💍 Diamond Ring

## Supported Chains & Tokens

### Ethereum
ETH, USDC, USDT, DAI

### Polygon
MATIC, USDC, USDT

### BNB Chain
BNB, USDC, USDT

### Arbitrum, Optimism, Base
ETH, USDC, USDT

### Avalanche
AVAX

### Solana
SOL, USDC, USDT

## Tips for Demos

1. **Pre-create a self-chat** to show features instantly
2. **Have QR codes ready** for quick scanning
3. **Show legendary gifts** for wow factor
4. **Demonstrate URL sharing** for viral potential
5. **Highlight multi-chain support** for crypto audience
6. **Use emoji gifts** for fun, relatable demos

## Troubleshooting

### User not found
- Check username spelling
- Ensure user has created an account
- Try searching by wallet address

### QR code not scanning
- Ensure good lighting
- Hold steady
- Check QR code quality setting

### Gift not sending
- Check internet connection
- Verify recipient is valid
- Ensure conversation exists

### Link not working
- Check URL is complete
- Ensure user is logged in
- Try refreshing page

## API Rate Limits

- Username search: Debounced 300ms
- QR generation: Unlimited (client-side)
- Messages: Per Appwrite limits
- Conversations: Per Appwrite limits

## Best Practices

1. **Always validate usernames** before creating conversations
2. **Use QR codes** for in-person sharing
3. **Test with self-chat** before demoing
4. **Cache gift catalog** for performance
5. **Handle errors gracefully** with toast notifications
6. **Deep link for social sharing** to increase virality

---

**Ready to demo!** All features are integrated and working. Start with self-chat to familiarize yourself with the interface, then share your profile QR to get others chatting!
