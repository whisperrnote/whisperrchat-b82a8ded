#!/usr/bin/env node
/**
 * Appwrite 2.0 Migration Script
 * Converts legacy Collections to new Tables format
 * 
 * NOTE: This creates a new config for Appwrite 2.0
 * Keep the old config as backup for compatibility
 */

const fs = require('fs');

console.log('🔄 Migrating to Appwrite 2.0 Tables format...\n');

try {
  // Read the current config
  const config = JSON.parse(fs.readFileSync('appwrite.config.json', 'utf8'));
  
  // Create new config with Tables
  const newConfig = {
    projectId: config.projectId,
    endpoint: config.endpoint,
    projectName: config.projectName,
    settings: config.settings,
    databases: config.databases,
    
    // Rename collections to tables
    tables: config.collections.map(collection => ({
      ...collection,
      // Keep same structure, just different terminology
      // In Appwrite 2.0, "collections" are now "tables"
      // "attributes" remain "attributes"
      // "indexes" remain "indexes"
    })),
    
    buckets: config.buckets
  };
  
  // Remove old collections key
  delete newConfig.collections;
  
  // Write new config
  fs.writeFileSync('appwrite.config.v2.json', JSON.stringify(newConfig, null, 2), 'utf8');
  
  console.log('✅ Migration complete!');
  console.log('\nFiles created:');
  console.log('  - appwrite.config.v2.json (for Appwrite 2.0+)');
  console.log('  - appwrite.config.json (kept for Appwrite 1.x compatibility)');
  console.log('\n📝 Summary:');
  console.log(`  - Databases: ${newConfig.databases.length}`);
  console.log(`  - Tables: ${newConfig.tables.length} (formerly Collections)`);
  console.log(`  - Buckets: ${newConfig.buckets.length}`);
  console.log('\n🎯 Next Steps:');
  console.log('  1. Check your Appwrite version:');
  console.log('     - Appwrite 1.x: Use appwrite.config.json');
  console.log('     - Appwrite 2.0+: Use appwrite.config.v2.json');
  console.log('  2. Rename config file: mv appwrite.config.v2.json appwrite.config.json');
  console.log('  3. Deploy: appwrite deploy');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
