#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Fix Windows permission issues with Next.js build
 */
function fixWindowsPermissions() {
  console.log('🛠️  Fixing Windows permission issues...');

  const projectRoot = path.resolve(__dirname, '..');
  const nextDir = path.join(projectRoot, '.next');

  try {
    // Remove .next directory if it exists and has permission issues
    if (fs.existsSync(nextDir)) {
      console.log('📁 Removing existing .next directory...');
      try {
        // Try to remove gracefully first
        fs.rmSync(nextDir, { recursive: true, force: true });
        console.log('✅ Successfully removed .next directory');
      } catch (error) {
        console.log('⚠️  Standard removal failed, trying alternative method...');
        try {
          // Alternative removal for Windows
          if (process.platform === 'win32') {
            execSync(`rmdir /s /q "${nextDir}"`, { stdio: 'pipe' });
            console.log('✅ Successfully removed .next directory (Windows method)');
          }
        } catch (winError) {
          console.log('❌ Could not remove .next directory:', winError.message);
          console.log('💡 Please manually delete the .next folder and try again');
        }
      }
    }

    // Clear npm cache
    console.log('🧹 Clearing npm cache...');
    try {
      execSync('npm cache clean --force', { stdio: 'pipe' });
      console.log('✅ npm cache cleared');
    } catch (error) {
      console.log('⚠️  npm cache clean failed:', error.message);
    }

    // Set environment variables for Windows builds
    if (process.platform === 'win32') {
      console.log('🔧 Setting Windows environment variables...');
      process.env.NEXT_TELEMETRY_DISABLED = '1';
      process.env.NODE_OPTIONS = '--max-old-space-size=4096';
      console.log('✅ Environment variables set');
    }

    console.log('🎉 Windows permission fixes applied successfully!');
    console.log('');
    console.log('💡 Tips for avoiding future issues:');
    console.log('   - Run terminal as Administrator if problems persist');
    console.log('   - Close all file explorers/editors pointing to project directory');
    console.log('   - Use WSL2 for better development experience on Windows');
    console.log('');

  } catch (error) {
    console.error('❌ Error fixing permissions:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  fixWindowsPermissions();
}

module.exports = { fixWindowsPermissions };