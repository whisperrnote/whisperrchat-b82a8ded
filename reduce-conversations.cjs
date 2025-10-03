const fs = require('fs');
const config = JSON.parse(fs.readFileSync('appwrite.config.json', 'utf8'));

const items = config.tables || config.collections;
const conv = items.find(c => c.$id === 'conversations');
const attrsKey = conv.columns ? 'columns' : 'attributes';

console.log('Reducing Conversations collection sizes:\n');

conv[attrsKey].forEach(attr => {
  const oldSize = attr.size;
  
  // Reduce array fields that are too large
  if (attr.key === 'participantIds' && attr.size > 5000) {
    attr.size = 5000;
    console.log(`participantIds: ${oldSize} → ${attr.size}`);
  }
  if (attr.key === 'isPinned' && attr.size > 2000) {
    attr.size = 2000;
    console.log(`isPinned: ${oldSize} → ${attr.size}`);
  }
  if (attr.key === 'isMuted' && attr.size > 2000) {
    attr.size = 2000;
    console.log(`isMuted: ${oldSize} → ${attr.size}`);
  }
  if (attr.key === 'isArchived' && attr.size > 2000) {
    attr.size = 2000;
    console.log(`isArchived: ${oldSize} → ${attr.size}`);
  }
  if (attr.key === 'unreadCount' && attr.size > 5000) {
    attr.size = 5000;
    console.log(`unreadCount: ${oldSize} → ${attr.size}`);
  }
  if (attr.key === 'settings' && attr.size > 2000) {
    attr.size = 2000;
    console.log(`settings: ${oldSize} → ${attr.size}`);
  }
});

fs.writeFileSync('appwrite.config.json', JSON.stringify(config, null, 2), 'utf8');

// Calculate new total
let total = 0;
conv[attrsKey].forEach(attr => total += (attr.size || 0));

console.log(`\nNew total: ${total} bytes (was 29347)`);
console.log('✅ Reduced Conversations collection size');
