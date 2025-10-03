const fs = require('fs');
const config = JSON.parse(fs.readFileSync('appwrite.config.json', 'utf8'));

const items = config.tables || config.collections;
let fixed = 0;

items.forEach(item => {
  const attrsKey = item.columns ? 'columns' : 'attributes';
  
  item[attrsKey]?.forEach(attr => {
    // Remove min/max from non-numeric types
    if (attr.type === 'string' || attr.type === 'datetime' || attr.type === 'boolean') {
      if ('min' in attr) {
        delete attr.min;
        fixed++;
      }
      if ('max' in attr) {
        delete attr.max;
        fixed++;
      }
    }
  });
});

fs.writeFileSync('appwrite.config.json', JSON.stringify(config, null, 2), 'utf8');

console.log(`✅ Removed ${fixed} invalid min/max from string/datetime/boolean attributes`);
