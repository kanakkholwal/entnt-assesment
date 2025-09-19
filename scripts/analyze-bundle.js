#!/usr/bin/env node

/**
 * Bundle analysis script for production builds
 * Provides insights into chunk sizes and optimization opportunities
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const DIST_DIR = 'dist';
const SIZE_LIMIT_KB = {
  js: 500,
  css: 100,
  total: 2000
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeDirectory(dir, results = { js: [], css: [], other: [], total: 0 }) {
  try {
    const files = readdirSync(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        analyzeDirectory(filePath, results);
      } else {
        const size = stat.size;
        results.total += size;
        
        const relativePath = filePath.replace(DIST_DIR + '/', '');
        const fileInfo = { name: relativePath, size, sizeFormatted: formatBytes(size) };
        
        if (file.endsWith('.js')) {
          results.js.push(fileInfo);
        } else if (file.endsWith('.css')) {
          results.css.push(fileInfo);
        } else {
          results.other.push(fileInfo);
        }
      }
    }
  } catch (error) {
    console.error(`Error analyzing directory ${dir}:`, error.message);
  }
  
  return results;
}

function printAnalysis() {
  console.log('\n🔍 Bundle Analysis Report\n');
  console.log('=' .repeat(50));
  
  try {
    const results = analyzeDirectory(DIST_DIR);
    
    // Sort by size (largest first)
    results.js.sort((a, b) => b.size - a.size);
    results.css.sort((a, b) => b.size - a.size);
    
    // JavaScript files
    console.log('\n📦 JavaScript Files:');
    console.log('-'.repeat(30));
    let jsTotal = 0;
    results.js.forEach(file => {
      jsTotal += file.size;
      const warning = file.size > SIZE_LIMIT_KB.js * 1024 ? ' ⚠️  Large file!' : '';
      console.log(`  ${file.name}: ${file.sizeFormatted}${warning}`);
    });
    console.log(`  Total JS: ${formatBytes(jsTotal)}`);
    
    // CSS files
    console.log('\n🎨 CSS Files:');
    console.log('-'.repeat(30));
    let cssTotal = 0;
    results.css.forEach(file => {
      cssTotal += file.size;
      const warning = file.size > SIZE_LIMIT_KB.css * 1024 ? ' ⚠️  Large file!' : '';
      console.log(`  ${file.name}: ${file.sizeFormatted}${warning}`);
    });
    console.log(`  Total CSS: ${formatBytes(cssTotal)}`);
    
    // Other assets
    if (results.other.length > 0) {
      console.log('\n📁 Other Assets:');
      console.log('-'.repeat(30));
      results.other.forEach(file => {
        console.log(`  ${file.name}: ${file.sizeFormatted}`);
      });
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log('-'.repeat(30));
    console.log(`  Total bundle size: ${formatBytes(results.total)}`);
    console.log(`  JavaScript: ${formatBytes(jsTotal)} (${((jsTotal / results.total) * 100).toFixed(1)}%)`);
    console.log(`  CSS: ${formatBytes(cssTotal)} (${((cssTotal / results.total) * 100).toFixed(1)}%)`);
    console.log(`  Other: ${formatBytes(results.total - jsTotal - cssTotal)} (${(((results.total - jsTotal - cssTotal) / results.total) * 100).toFixed(1)}%)`);
    
    // Warnings
    const totalKB = results.total / 1024;
    if (totalKB > SIZE_LIMIT_KB.total) {
      console.log(`\n⚠️  Warning: Total bundle size (${formatBytes(results.total)}) exceeds recommended limit (${SIZE_LIMIT_KB.total}KB)`);
    }
    
    const largeJSFiles = results.js.filter(f => f.size > SIZE_LIMIT_KB.js * 1024);
    if (largeJSFiles.length > 0) {
      console.log(`\n⚠️  Warning: ${largeJSFiles.length} JavaScript file(s) exceed ${SIZE_LIMIT_KB.js}KB`);
    }
    
    console.log('\n✅ Analysis complete!');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    console.log('\nMake sure you have run "npm run build" first.');
    process.exit(1);
  }
}

// Run analysis
printAnalysis();