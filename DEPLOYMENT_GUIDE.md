# WhisperChat Schema Deployment Guide

## 🚨 IMPORTANT: Read Before Deploying

This will **create/update** your Appwrite database structure. Make sure you:
1. Have a backup of your current database
2. Are deploying to the correct project
3. Have reviewed the schema thoroughly
4. Understand the changes being made

---

## 📋 Pre-Deployment Checklist

- [ ] Backup current database (if any)
- [ ] Review `appwrite.config.json`
- [ ] Read `DATABASE_SCHEMA.md`
- [ ] Verify Appwrite CLI is installed
- [ ] Confirm project ID is correct
- [ ] Check API endpoint is correct
- [ ] Have necessary permissions

---

## 🛠️ Installation & Setup

### 1. Install Appwrite CLI

```bash
npm install -g appwrite-cli
```

### 2. Login to Appwrite

```bash
appwrite login
```

Follow the prompts to authenticate.

### 3. Verify Project Settings

Check that your `appwrite.config.json` has the correct:
- `projectId`: "tenchat"
- `endpoint`: "https://fra.cloud.appwrite.io/v1"

---

## 🚀 Deployment Steps

### Option 1: Full Deployment (Recommended for new projects)

Deploy everything at once:

```bash
# Deploy all resources
appwrite deploy

# Or deploy specific resources
appwrite deploy database
appwrite deploy collection
appwrite deploy bucket
```

### Option 2: Incremental Deployment (Safer for existing projects)

Deploy step by step:

#### Step 1: Deploy Databases
```bash
appwrite deploy database
```

This creates the 5 databases:
- MainDatabase
- SocialDatabase
- Web3Database
- ContentDatabase
- AnalyticsDatabase

#### Step 2: Deploy Collections
```bash
appwrite deploy collection
```

This creates all 30 collections with their attributes and indexes.

**Expected time:** 5-10 minutes

#### Step 3: Deploy Storage Buckets
```bash
appwrite deploy bucket
```

This creates 12 storage buckets for different media types.

### Option 3: Manual Deployment via Appwrite Console

If CLI fails, you can manually create via the Appwrite Console:

1. Go to your Appwrite Console
2. Create each database manually
3. Create collections with attributes
4. Add indexes
5. Create storage buckets

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Database already exists"

**Solution:** The CLI will update existing databases. If you want fresh:
```bash
# Delete old databases via console first, then redeploy
appwrite deploy database --force
```

### Issue 2: "Attribute already exists"

**Solution:** The CLI should handle this, but if it fails:
- Delete the collection via console
- Redeploy that specific collection

### Issue 3: "Permission denied"

**Solution:** Ensure you have admin/owner access to the project:
```bash
appwrite login
# Re-authenticate with correct credentials
```

### Issue 4: "Timeout during deployment"

**Solution:** Deploy in smaller batches:
```bash
# Deploy one database at a time
appwrite deploy collection --collection profiles
appwrite deploy collection --collection conversations
# etc...
```

---

## 🧪 Post-Deployment Testing

### 1. Verify Databases

```bash
appwrite databases list
```

Expected output:
```
✓ mainDB - MainDatabase
✓ socialDB - SocialDatabase
✓ web3DB - Web3Database
✓ contentDB - ContentDatabase
✓ analyticsDB - AnalyticsDatabase
```

### 2. Verify Collections

```bash
appwrite collections list --databaseId mainDB
```

Should show: profiles, conversations, messages, etc.

### 3. Verify Storage

```bash
appwrite buckets list
```

Should show 12 buckets.

### 4. Test Database Access

Try creating a test document:

```bash
# Create test profile
appwrite documents create \
  --databaseId mainDB \
  --collectionId profiles \
  --documentId unique() \
  --data '{"userId":"test123","username":"testuser"}'
```

---

## 📊 What Gets Created

### Databases (5)
1. **MainDatabase** - Core messaging
2. **SocialDatabase** - Social features
3. **Web3Database** - Blockchain integration
4. **ContentDatabase** - Rich media
5. **AnalyticsDatabase** - Metrics & logs

### Collections (30)

#### MainDatabase (7)
- profiles
- conversations
- messages
- messageQueue
- contacts
- typingIndicators
- presence

#### SocialDatabase (6)
- stories
- storyViews
- posts
- postReactions
- comments
- follows

#### Web3Database (7)
- wallets
- nfts
- cryptoTransactions
- tokenGifts
- contractHooks
- tokenHoldings

#### ContentDatabase (7)
- stickers
- stickerPacks
- userStickers
- gifs
- polls
- arFilters
- mediaLibrary

#### AnalyticsDatabase (4)
- userActivity
- notifications
- appAnalytics
- errorLogs

### Storage Buckets (12)
- avatars (10MB)
- covers (20MB)
- messages (100MB)
- stories (50MB)
- posts (100MB)
- nfts (50MB)
- stickers (5MB)
- filters (20MB)
- gifs (10MB)
- voice (50MB)
- video (500MB)
- documents (100MB)

---

## 🔄 Updating the Schema

### Making Changes

1. Edit `generate-schema.cjs`
2. Run `node generate-schema.cjs`
3. Review changes in `appwrite.config.json`
4. Deploy updates:

```bash
appwrite deploy collection --force
```

### Safe Update Process

```bash
# 1. Test locally first
node generate-schema.cjs

# 2. Review changes
git diff appwrite.config.json

# 3. Backup production
# Export data via Appwrite Console

# 4. Deploy to staging first
appwrite deploy --project staging-project-id

# 5. Test thoroughly

# 6. Deploy to production
appwrite deploy --project tenchat
```

---

## 🗑️ Rollback Strategy

### If Something Goes Wrong

1. **Stop immediately** - Don't make more changes
2. **Document the issue** - Note what failed
3. **Restore from backup** if available
4. **Contact support** if data is corrupted

### Backup Commands

```bash
# Backup specific collection
appwrite documents list \
  --databaseId mainDB \
  --collectionId profiles \
  --limit 1000 > backup-profiles.json

# Restore (manual process via console)
```

---

## 📈 Performance Optimization Post-Deployment

### 1. Monitor Index Usage

Check Appwrite logs for slow queries and add indexes as needed.

### 2. Adjust Document Sizes

If hitting limits:
- Split large JSON fields into separate collections
- Use storage for large text content
- Implement pagination

### 3. Optimize Storage

Enable compression on buckets:
- Already enabled for all buckets (gzip)
- Monitor storage usage via console

---

## 🔧 Configuration Management

### Environment Variables

Create `.env` file:

```env
VITE_APPWRITE_PROJECT_ID=tenchat
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_DATABASE_MAIN=mainDB
VITE_APPWRITE_DATABASE_SOCIAL=socialDB
VITE_APPWRITE_DATABASE_WEB3=web3DB
VITE_APPWRITE_DATABASE_CONTENT=contentDB
VITE_APPWRITE_DATABASE_ANALYTICS=analyticsDB
```

### Multiple Environments

```bash
# Production
appwrite deploy --project tenchat

# Staging
appwrite deploy --project tenchat-staging

# Development
appwrite deploy --project tenchat-dev
```

---

## 📝 Migration Scripts

### From Old Schema to New

If you have existing data:

```javascript
// migration-script.js
const sdk = require('node-appwrite');

async function migrate() {
  const client = new sdk.Client();
  const databases = new sdk.Databases(client);
  
  client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('tenchat')
    .setKey('your-api-key');
  
  // Migrate old messages to new schema
  const oldMessages = await databases.listDocuments(
    'oldDB',
    'oldMessages'
  );
  
  for (const msg of oldMessages.documents) {
    await databases.createDocument(
      'mainDB',
      'messages',
      sdk.ID.unique(),
      {
        conversationId: msg.chatId,
        senderId: msg.sender,
        content: msg.text,
        contentType: 'text',
        createdAt: msg.timestamp
      }
    );
  }
}

migrate().catch(console.error);
```

---

## 🎯 Success Criteria

After deployment, verify:

✅ All 5 databases created
✅ All 30 collections exist with correct attributes
✅ Indexes are created and active
✅ All 12 storage buckets configured
✅ Permissions are set correctly
✅ Can create/read test documents
✅ Can upload test files to storage
✅ No errors in Appwrite logs

---

## 📞 Support & Troubleshooting

### Resources
- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Discord](https://appwrite.io/discord)
- [Database Schema Docs](./DATABASE_SCHEMA.md)

### Getting Help

1. Check Appwrite logs in console
2. Review this deployment guide
3. Check DATABASE_SCHEMA.md for collection details
4. Post in Appwrite Discord with:
   - Error message
   - Steps to reproduce
   - Schema section causing issues

---

## 🎉 Next Steps After Deployment

1. **Update Frontend Code**
   - Import database IDs
   - Update API calls
   - Test all features

2. **Set Up Real-time Subscriptions**
   - Subscribe to message updates
   - Listen for typing indicators
   - Track online presence

3. **Implement Features**
   - User authentication
   - Message sending/receiving
   - Story creation
   - Crypto wallet connection

4. **Monitor Performance**
   - Set up alerts
   - Track API usage
   - Monitor storage

5. **Launch & Scale**
   - Gradual rollout
   - Monitor metrics
   - Scale databases as needed

---

## 🚀 Ready to Deploy?

```bash
# Final checklist
node generate-schema.cjs  # Ensure schema is up to date
appwrite login            # Authenticate
appwrite deploy           # Deploy everything!
```

**Good luck! You're building the next big thing! 🎊**
