const fs = require('fs');
const config = JSON.parse(fs.readFileSync('appwrite.config.json', 'utf8'));

const items = config.tables || config.collections;
const profiles = items.find(c => c.$id === 'profiles');
const attrsKey = profiles.columns ? 'columns' : 'attributes';

console.log(`Profiles: ${profiles[attrsKey].length} attributes\n`);

let totalSize = 0;
profiles[attrsKey].forEach(attr => {
  const size = attr.size || 0;
  totalSize += size;
  if (size > 0) {
    console.log(`${attr.key.padEnd(25)} ${String(size).padStart(6)}`);
  }
});

console.log(`\nTotal: ${totalSize} bytes`);
console.log(`Limit: ~1MB (1,048,576 bytes)`);
console.log(`Usage: ${((totalSize / 1048576) * 100).toFixed(1)}%`);

if (totalSize > 1048576) {
  console.log('\n❌ EXCEEDS LIMIT!');
}
