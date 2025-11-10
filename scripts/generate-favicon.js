const fs = require('fs');
const path = require('path');

// Copy logo.png as icon.png for Next.js 14 App Router
const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
const iconPath = path.join(__dirname, '..', 'app', 'icon.png');

try {
  fs.copyFileSync(logoPath, iconPath);
  console.log('✅ Created app/icon.png from logo.png');
  console.log('Next.js will automatically generate favicon.ico from this file');
} catch (error) {
  console.error('❌ Error creating icon:', error.message);
  process.exit(1);
}
