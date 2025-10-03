const fs = require('fs');
const config = JSON.parse(fs.readFileSync('appwrite.config.json', 'utf8'));

const items = config.tables || config.collections;
const msgs = items.find(c => c.$id === 'messages');
const attrsKey = msgs.columns ? 'columns' : 'attributes';

console.log('Reducing Messages collection (55KB → target <20KB):\n');

msgs[attrsKey].forEach(attr => {
  const oldSize = attr.size;
  
  // Reduce large fields
  if (attr.key === 'content' && attr.size > 5000) {
    attr.size = 5000;
    console.log(`content: ${oldSize} → ${attr.size}`);
  }
  if (attr.key === 'metadata' && attr.size > 2000) {
    attr.size = 2000;
    console.log(`metadata: ${oldSize} → ${attr.size}`);
  }
  if (attr.key === 'reactions' && attr.size > 5000) {
    attr.size = 5000;
    console.log(`reactions: ${oldSize} → ${attr.size}`);
  }
  if (attr.key === 'readBy' && attr.size > 5000) {
    attr.size = 5000;
    console.log(`readBy: ${oldSize} → ${attr.size}`);
  }
  if (attr.key === 'deliveredTo' && attr.size > 5000) {
    attr.size = 5000;
    console.log(`deliveredTo: ${oldSize} → ${attr.size}`);
  }
});

fs.writeFileSync('appwrite.config.json', JSON.stringify(config, null, 2), 'utf8');

let total = 0;
msgs[attrsKey].forEach(attr => total += (attr.size || 0));

console.log(`\nNew total: ${total} bytes (was 55626)`);
