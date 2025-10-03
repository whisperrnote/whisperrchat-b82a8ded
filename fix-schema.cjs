#!/usr/bin/env node
/**
 * Fix Appwrite Schema for v1.x Compatibility
 * 
 * Issues to fix:
 * 1. "email", "url", "ip" types -> "string" with format
 * 2. "tables" -> "collections" (if present)
 * 3. "columns" -> "attributes" (if present)
 * 4. "rowSecurity" -> "documentSecurity" (if present)
 */

const fs = require('fs');

console.log('🔧 Fixing schema for Appwrite v1.x compatibility...\n');

try {
  const config = JSON.parse(fs.readFileSync('appwrite.config.json', 'utf8'));
  
  // Check what needs fixing
  const issues = {
    hasV2Terminology: !!config.tables,
    hasSpecialTypes: false,
  };
  
  // Fix v2.0 terminology if present
  if (config.tables) {
    console.log('⚠️  Found v2.0 terminology (tables/columns/rowSecurity)');
    console.log('   Converting to v1.x (collections/attributes/documentSecurity)...');
    
    config.collections = config.tables.map(table => {
      const collection = { ...table };
      
      // Rename rowSecurity to documentSecurity
      if ('rowSecurity' in collection) {
        collection.documentSecurity = collection.rowSecurity;
        delete collection.rowSecurity;
      }
      
      // Rename columns to attributes
      if (collection.columns) {
        collection.attributes = collection.columns;
        delete collection.columns;
      }
      
      return collection;
    });
    
    delete config.tables;
    issues.hasV2Terminology = false;
  }
  
  // Fix special attribute types
  if (config.collections) {
    config.collections.forEach(collection => {
      if (collection.attributes) {
        collection.attributes.forEach(attr => {
          // Convert email, url, ip to string with format
          if (attr.type === 'email') {
            console.log(`   Fixing: ${collection.name}.${attr.key} (email -> string)`);
            attr.type = 'string';
            if (!attr.size) attr.size = 320; // Max email length
            attr.format = 'email';
            issues.hasSpecialTypes = true;
          }
          
          if (attr.type === 'url') {
            console.log(`   Fixing: ${collection.name}.${attr.key} (url -> string)`);
            attr.type = 'string';
            if (!attr.size) attr.size = 2048; // Max URL length
            attr.format = 'url';
            issues.hasSpecialTypes = true;
          }
          
          if (attr.type === 'ip') {
            console.log(`   Fixing: ${collection.name}.${attr.key} (ip -> string)`);
            attr.type = 'string';
            if (!attr.size) attr.size = 45; // IPv6 length
            attr.format = 'ip';
            issues.hasSpecialTypes = true;
          }
        });
      }
    });
  }
  
  // Write fixed config
  fs.writeFileSync('appwrite.config.json', JSON.stringify(config, null, 2), 'utf8');
  
  console.log('\n✅ Schema fixed successfully!');
  
  if (issues.hasSpecialTypes || issues.hasV2Terminology) {
    console.log('\n📝 Changes made:');
    if (issues.hasV2Terminology) {
      console.log('   ✓ Converted v2.0 terminology to v1.x');
    }
    if (issues.hasSpecialTypes) {
      console.log('   ✓ Converted special types (email/url/ip) to string with format');
    }
  }
  
  console.log('\n🚀 Ready to deploy!');
  console.log('   Run: appwrite deploy\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
