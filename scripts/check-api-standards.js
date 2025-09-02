#!/usr/bin/env node

/**
 * API Standards Checker Script
 * ตรวจสอบว่า API routes ทั้งหมดใช้ standardized patterns หรือไม่
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const API_DIR = path.join(__dirname, '../src/app/api');

console.log('🔍 Checking API routes for standardized patterns...\n');

// ค้นหา API route files
const apiFiles = glob.sync('**/route.ts', { cwd: API_DIR });

let standardizedRoutes = 0;
let nonStandardizedRoutes = 0;
const issues = [];

apiFiles.forEach(file => {
  const filePath = path.join(API_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasWithApiMiddleware = content.includes('withPublicApi') || 
                               content.includes('withApiMiddleware') ||
                               content.includes('withFileUploadApi') ||
                               content.includes('withAuthApi');
  
  const hasOldPattern = content.includes('export async function');
  const hasStandardizedError = content.includes('ApiError') || 
                               content.includes('DatabaseError') ||
                               content.includes('ValidationError');
  
  if (hasWithApiMiddleware && hasStandardizedError && !hasOldPattern) {
    standardizedRoutes++;
    console.log(`✅ ${file} - Standardized`);
  } else {
    nonStandardizedRoutes++;
    console.log(`❌ ${file} - Needs standardization`);
    
    const fileIssues = [];
    if (!hasWithApiMiddleware) fileIssues.push('Missing withApiMiddleware wrapper');
    if (hasOldPattern) fileIssues.push('Uses old async function export pattern');
    if (!hasStandardizedError) fileIssues.push('Missing standardized error handling');
    
    issues.push({
      file,
      issues: fileIssues
    });
  }
});

console.log('\n📊 Summary:');
console.log(`✅ Standardized routes: ${standardizedRoutes}`);
console.log(`❌ Non-standardized routes: ${nonStandardizedRoutes}`);
console.log(`📈 Compliance rate: ${Math.round((standardizedRoutes / (standardizedRoutes + nonStandardizedRoutes)) * 100)}%`);

if (issues.length > 0) {
  console.log('\n🚨 Issues to fix:');
  issues.forEach(({ file, issues }) => {
    console.log(`\n📁 ${file}:`);
    issues.forEach(issue => console.log(`   • ${issue}`));
  });
}

console.log('\n🛠️  To fix issues, ensure all API routes:');
console.log('   1. Use withPublicApi() or appropriate middleware wrapper');
console.log('   2. Use standardized error classes (ApiError, DatabaseError, etc.)');
console.log('   3. Export handlers with: export const GET = withPublicApi(handler)');
console.log('   4. Include proper logging and request context');

if (nonStandardizedRoutes === 0) {
  console.log('\n🎉 All API routes are standardized!');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${nonStandardizedRoutes} routes need standardization.`);
  process.exit(1);
}