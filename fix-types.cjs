#!/usr/bin/env node
/**
 * Fix ONLY the attribute type issue
 * email/url/ip are not valid attribute types - must be string with format
 */

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('appwrite.config.json', 'utf8'));

let fixed = 0;

// Fix in tables (if present) or collections (if present)
const items = config.tables || config.collections;
const itemsKey = config.tables ? 'tables' : 'collections';
const attrsKey = items[0]?.columns ? 'columns' : 'attributes';

items.forEach(item => {
  item[attrsKey]?.forEach(attr => {
    if (attr.type === 'email') {
      attr.type = 'string';
      attr.size = attr.size || 320;
      attr.format = 'email';
      fixed++;
    }
    if (attr.type === 'url') {
      attr.type = 'string';
      attr.size = attr.size || 2048;
      attr.format = 'url';
      fixed++;
    }
    if (attr.type === 'ip') {
      attr.type = 'string';
      attr.size = attr.size || 45;
      attr.format = 'ip';
      fixed++;
    }
  });
});

fs.writeFileSync('appwrite.config.json', JSON.stringify(config, null, 2), 'utf8');

console.log(`✅ Fixed ${fixed} attribute types (email/url/ip -> string with format)`);
console.log(`\nReady to deploy: appwrite deploy`);
