#!/usr/bin/env node
/**
 * Schema Validation Script
 * Validates the generated appwrite.config.json for correctness
 */

const fs = require('fs');

console.log('🔍 Validating WhisperChat Schema...\n');

try {
  // Load the schema
  const config = JSON.parse(fs.readFileSync('appwrite.config.json', 'utf8'));
  
  // Validation checks
  const checks = {
    projectId: config.projectId === 'tenchat',
    endpoint: config.endpoint === 'https://fra.cloud.appwrite.io/v1',
    databases: Array.isArray(config.databases) && config.databases.length === 5,
    collections: Array.isArray(config.collections) && config.collections.length === 30,
    buckets: Array.isArray(config.buckets) && config.buckets.length === 12,
  };
  
  // Database checks
  const dbIds = config.databases.map(db => db.$id);
  const expectedDbs = ['mainDB', 'socialDB', 'web3DB', 'contentDB', 'analyticsDB'];
  const hasCoreDb = expectedDbs.every(id => dbIds.includes(id));
  
  // Collection checks
  const collectionsByDb = {};
  config.collections.forEach(col => {
    if (!collectionsByDb[col.databaseId]) {
      collectionsByDb[col.databaseId] = [];
    }
    collectionsByDb[col.databaseId].push(col.$id);
  });
  
  // Count attributes and indexes
  let totalAttributes = 0;
  let totalIndexes = 0;
  config.collections.forEach(col => {
    totalAttributes += col.attributes.length;
    totalIndexes += col.indexes.length;
  });
  
  // Bucket checks
  const bucketIds = config.buckets.map(b => b.$id);
  const expectedBuckets = ['avatars', 'messages', 'stories', 'posts', 'nfts', 'stickers', 'filters', 'gifs', 'voice', 'video'];
  const hasCriticalBuckets = expectedBuckets.every(id => bucketIds.includes(id));
  
  // Print results
  console.log('📊 Configuration Validation:');
  console.log('==========================');
  console.log(`✓ Project ID:        ${checks.projectId ? '✅' : '❌'} ${config.projectId}`);
  console.log(`✓ Endpoint:          ${checks.endpoint ? '✅' : '❌'} ${config.endpoint}`);
  console.log();
  
  console.log('📦 Databases:');
  console.log(`✓ Count:             ${checks.databases ? '✅' : '❌'} ${config.databases.length}/5`);
  console.log(`✓ Core DBs:          ${hasCoreDb ? '✅' : '❌'}`);
  config.databases.forEach(db => {
    const count = collectionsByDb[db.$id]?.length || 0;
    console.log(`  - ${db.$id.padEnd(15)} ${db.name.padEnd(20)} (${count} collections)`);
  });
  console.log();
  
  console.log('📑 Collections:');
  console.log(`✓ Total Count:       ${checks.collections ? '✅' : '❌'} ${config.collections.length}/30`);
  console.log(`✓ Total Attributes:  ✅ ${totalAttributes}`);
  console.log(`✓ Total Indexes:     ✅ ${totalIndexes}`);
  console.log();
  
  Object.entries(collectionsByDb).forEach(([dbId, collections]) => {
    console.log(`  ${dbId}:`);
    collections.forEach(colId => {
      const col = config.collections.find(c => c.$id === colId);
      const attrCount = col.attributes.length;
      const indexCount = col.indexes.length;
      console.log(`    - ${colId.padEnd(20)} (${attrCount} attrs, ${indexCount} indexes)`);
    });
    console.log();
  });
  
  console.log('🗄️  Storage Buckets:');
  console.log(`✓ Total Count:       ${checks.buckets ? '✅' : '❌'} ${config.buckets.length}/12`);
  console.log(`✓ Critical Buckets:  ${hasCriticalBuckets ? '✅' : '❌'}`);
  config.buckets.forEach(bucket => {
    const sizeMB = (bucket.maximumFileSize / 1000000).toFixed(0);
    console.log(`  - ${bucket.$id.padEnd(15)} ${sizeMB.padStart(4)}MB  ${bucket.name}`);
  });
  console.log();
  
  // Feature checks
  console.log('🎯 Feature Coverage:');
  const features = {
    'Messaging': collectionsByDb.mainDB?.includes('messages'),
    'Real-time': collectionsByDb.mainDB?.includes('typingIndicators'),
    'Stories': collectionsByDb.socialDB?.includes('stories'),
    'Social Posts': collectionsByDb.socialDB?.includes('posts'),
    'Web3 Wallets': collectionsByDb.web3DB?.includes('wallets'),
    'NFTs': collectionsByDb.web3DB?.includes('nfts'),
    'Crypto Gifts': collectionsByDb.web3DB?.includes('tokenGifts'),
    'Smart Contracts': collectionsByDb.web3DB?.includes('contractHooks'),
    'Stickers': collectionsByDb.contentDB?.includes('stickers'),
    'AR Filters': collectionsByDb.contentDB?.includes('arFilters'),
    'Polls': collectionsByDb.contentDB?.includes('polls'),
    'Analytics': collectionsByDb.analyticsDB?.includes('userActivity'),
    'Notifications': collectionsByDb.analyticsDB?.includes('notifications'),
  };
  
  Object.entries(features).forEach(([name, status]) => {
    console.log(`  ${status ? '✅' : '❌'} ${name}`);
  });
  console.log();
  
  // Security checks
  console.log('🔐 Security Features:');
  const securityFeatures = {
    'Document Security': config.collections.some(c => c.documentSecurity),
    'Encrypted Storage': config.buckets.every(b => b.encryption),
    'Antivirus': config.buckets.every(b => b.antivirus),
    'Compression': config.buckets.some(b => b.compression === 'gzip'),
  };
  
  Object.entries(securityFeatures).forEach(([name, status]) => {
    console.log(`  ${status ? '✅' : '❌'} ${name}`);
  });
  console.log();
  
  // Final summary
  const allPassed = Object.values(checks).every(c => c) && hasCoreDb && hasCriticalBuckets;
  
  console.log('═══════════════════════════════════════════');
  if (allPassed) {
    console.log('✅ VALIDATION PASSED!');
    console.log('   Schema is ready for deployment.');
  } else {
    console.log('⚠️  VALIDATION WARNINGS');
    console.log('   Review the issues above.');
  }
  console.log('═══════════════════════════════════════════');
  console.log();
  
  // Stats
  console.log('📈 Statistics:');
  console.log(`   - Databases:         ${config.databases.length}`);
  console.log(`   - Collections:       ${config.collections.length}`);
  console.log(`   - Total Attributes:  ${totalAttributes}`);
  console.log(`   - Total Indexes:     ${totalIndexes}`);
  console.log(`   - Storage Buckets:   ${config.buckets.length}`);
  console.log(`   - Config File Size:  ${(fs.statSync('appwrite.config.json').size / 1024).toFixed(0)} KB`);
  console.log();
  
  console.log('🚀 Next Steps:');
  console.log('   1. Review the configuration above');
  console.log('   2. Read DEPLOYMENT_GUIDE.md');
  console.log('   3. Run: appwrite deploy');
  console.log();
  
  process.exit(allPassed ? 0 : 1);
  
} catch (error) {
  console.error('❌ ERROR:', error.message);
  process.exit(1);
}
