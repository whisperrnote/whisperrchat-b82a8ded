const fs = require('fs');
const config = JSON.parse(fs.readFileSync('appwrite.config.json', 'utf8'));

const items = config.tables || config.collections;
let fixed = 0;

items.forEach(item => {
  const attrsKey = item.columns ? 'columns' : 'attributes';
  
  item[attrsKey]?.forEach(attr => {
    const oldSize = attr.size;
    
    // Drastically reduce all large fields
    if (attr.size && attr.size > 1000) {
      attr.size = 1000;
      fixed++;
    }
    
    // Very large fields to 500
    if (attr.key && (
      attr.key.includes('content') || 
      attr.key.includes('metadata') ||
      attr.key.includes('reactions') ||
      attr.key.includes('readBy') ||
      attr.key.includes('deliveredTo') ||
      attr.key.includes('participantIds') ||
      attr.key.includes('unreadCount')
    )) {
      if (attr.size > 500) {
        attr.size = 500;
      }
    }
    
    // URLs to 255
    if (attr.format === 'url' && attr.size > 255) {
      attr.size = 255;
      fixed++;
    }
  });
});

fs.writeFileSync('appwrite.config.json', JSON.stringify(config, null, 2), 'utf8');

console.log(`✅ Drastically reduced ${fixed} attribute sizes`);
console.log('   All fields > 1000 → 1000');
console.log('   Large arrays → 500');
console.log('   URLs → 255');
