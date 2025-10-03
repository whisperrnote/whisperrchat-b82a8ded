const fs = require('fs');
const config = JSON.parse(fs.readFileSync('appwrite.config.json', 'utf8'));

const items = config.tables || config.collections;

console.log('Collection sizes and attribute counts:\n');

items.forEach(item => {
  const attrsKey = item.columns ? 'columns' : 'attributes';
  const attrs = item[attrsKey] || [];
  
  let totalSize = 0;
  attrs.forEach(attr => {
    totalSize += (attr.size || 0);
  });
  
  const pct = ((totalSize / 1048576) * 100).toFixed(1);
  const status = totalSize > 1048576 ? '❌' : (attrs.length > 50 ? '⚠️' : '✅');
  
  console.log(`${status} ${item.name.padEnd(25)} ${String(attrs.length).padStart(2)} attrs   ${String(totalSize).padStart(7)} bytes  ${pct}%`);
});
