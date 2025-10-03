const fs = require('fs');
const config = JSON.parse(fs.readFileSync('appwrite.config.json', 'utf8'));

const items = config.tables || config.collections;
let fixed = 0;

items.forEach(item => {
  const attrsKey = item.columns ? 'columns' : 'attributes';
  
  item[attrsKey]?.forEach(attr => {
    // If attribute is required AND has a default, remove the default
    if (attr.required && attr.default !== undefined && attr.default !== null) {
      delete attr.default;
      fixed++;
      console.log(`Fixed: ${item.name}.${attr.key} (required, removed default)`);
    }
  });
});

fs.writeFileSync('appwrite.config.json', JSON.stringify(config, null, 2), 'utf8');

console.log(`\n✅ Fixed ${fixed} required attributes with defaults`);
