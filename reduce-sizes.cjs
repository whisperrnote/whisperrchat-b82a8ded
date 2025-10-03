const fs = require('fs');
const config = JSON.parse(fs.readFileSync('appwrite.config.json', 'utf8'));

const items = config.tables || config.collections;
let fixed = 0;

items.forEach(item => {
  const attrsKey = item.columns ? 'columns' : 'attributes';
  
  item[attrsKey]?.forEach(attr => {
    const oldSize = attr.size;
    
    // Reduce excessive URL sizes (2048 -> 512)
    if (attr.format === 'url' && attr.size > 512) {
      attr.size = 512;
      fixed++;
    }
    
    // Reduce JSON fields that are too large
    if (attr.key === 'socialLinks' && attr.size > 1000) {
      attr.size = 1000;
      fixed++;
    }
    if (attr.key === 'preferences' && attr.size > 2000) {
      attr.size = 2000;
      fixed++;
    }
    if (attr.key === 'privacySettings' && attr.size > 2000) {
      attr.size = 2000;
      fixed++;
    }
  });
});

fs.writeFileSync('appwrite.config.json', JSON.stringify(config, null, 2), 'utf8');

console.log(`✅ Reduced ${fixed} attribute sizes`);
console.log(`\nRerun deployment: appwrite deploy`);
