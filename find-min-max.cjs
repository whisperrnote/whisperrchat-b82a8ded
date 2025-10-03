const fs = require('fs');
const config = JSON.parse(fs.readFileSync('appwrite.config.json', 'utf8'));

const items = config.tables || config.collections;

items.forEach(item => {
  const attrsKey = item.columns ? 'columns' : 'attributes';
  
  item[attrsKey]?.forEach(attr => {
    if ('min' in attr || 'max' in attr) {
      console.log(`${item.name}.${attr.key}: type=${attr.type}, min=${attr.min}, max=${attr.max}`);
    }
  });
});
