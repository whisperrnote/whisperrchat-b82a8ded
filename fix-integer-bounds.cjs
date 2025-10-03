const fs = require('fs');
const config = JSON.parse(fs.readFileSync('appwrite.config.json', 'utf8'));

const items = config.tables || config.collections;
let fixed = 0;

// Valid integer range for Appwrite (64-bit signed)
const MIN_INT = -2147483648;  // 32-bit for safety
const MAX_INT = 2147483647;

items.forEach(item => {
  const attrsKey = item.columns ? 'columns' : 'attributes';
  
  item[attrsKey]?.forEach(attr => {
    if (attr.type === 'integer') {
      // Fix invalid min/max values
      if (attr.min && (attr.min < MIN_INT || !Number.isInteger(attr.min))) {
        attr.min = MIN_INT;
        fixed++;
      }
      if (attr.max && (attr.max > MAX_INT || !Number.isInteger(attr.max))) {
        attr.max = MAX_INT;
        fixed++;
      }
    }
    
    if (attr.type === 'double') {
      // Use simpler bounds for doubles
      if (attr.min) {
        attr.min = -1.7976931348623157e+308;
      }
      if (attr.max) {
        attr.max = 1.7976931348623157e+308;
      }
    }
  });
});

fs.writeFileSync('appwrite.config.json', JSON.stringify(config, null, 2), 'utf8');

console.log(`✅ Fixed ${fixed} integer min/max values to valid range`);
console.log(`   Integer range: ${MIN_INT} to ${MAX_INT}`);
