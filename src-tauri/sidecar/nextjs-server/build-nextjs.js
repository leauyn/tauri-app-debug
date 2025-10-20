#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const NEXTJS_DIR = path.join(__dirname);
const isWindows = process.platform === 'win32';

console.log('🚀 Starting Next.js sidecar build...');
console.log(`📍 Platform: ${process.platform}`);
console.log(`📂 Working directory: ${NEXTJS_DIR}`);

// 确保脚本有执行权限 (Unix-like 系统)
if (!isWindows) {
  const buildScript = path.join(NEXTJS_DIR, 'build.sh');
  try {
    fs.chmodSync(buildScript, '755');
    console.log('✅ Set execute permission for build.sh');
  } catch (error) {
    console.warn('⚠️  Could not set execute permission:', error.message);
  }
}

try {
  // 根据平台选择不同的构建脚本
  const buildCommand = isWindows
    ? path.join(NEXTJS_DIR, 'build.bat')
    : path.join(NEXTJS_DIR, 'build.sh');

  console.log(`🔨 Executing: ${buildCommand}`);

  // 执行构建脚本
  execSync(buildCommand, {
    cwd: NEXTJS_DIR,
    stdio: 'inherit',
    shell: true
  });

  console.log('✅ Next.js sidecar build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

