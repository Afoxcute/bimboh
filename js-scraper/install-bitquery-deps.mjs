#!/usr/bin/env node

/**
 * Install Bitquery Dependencies Script
 * 
 * This script installs the required dependencies for the bitquery module
 * to ensure the ADK workflow can properly import and run bitquery scripts.
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function installBitqueryDependencies() {
  try {
    console.log('🔧 Installing bitquery dependencies...');
    
    const bitqueryPath = path.join(__dirname, '..', 'bitquery');
    
    // Change to bitquery directory and install dependencies
    process.chdir(bitqueryPath);
    
    console.log(`📁 Changed to directory: ${bitqueryPath}`);
    console.log('📦 Installing dependencies with yarn...');
    
    // Install dependencies
    execSync('yarn install', { 
      stdio: 'inherit',
      cwd: bitqueryPath
    });
    
    console.log('✅ Bitquery dependencies installed successfully!');
    
    // Change back to original directory
    process.chdir(__dirname);
    
    console.log('🎉 Setup complete! The ADK workflow should now work properly.');
    
  } catch (error) {
    console.error('❌ Error installing bitquery dependencies:', error.message);
    console.log('💡 You can manually install them by running:');
    console.log('   cd bitquery && yarn install');
    process.exit(1);
  }
}

// Run the installation
installBitqueryDependencies();
