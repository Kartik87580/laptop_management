const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'assets', 'js', 'config.js');

// Fetch values from environment variables or use fallback defaults
const neonConnectionString = process.env.NEON_CONNECTION_STRING || '';
const shopName = process.env.SHOP_NAME || 'My Laptop Repair Shop';
const shopPhone = process.env.SHOP_PHONE || '+91 98765 43210';
const shopAddress = process.env.SHOP_ADDRESS || '123, Main Street, Your City – 600001';

const fileContent = `/**
 * config.js – Generated automatically during Vercel deployment
 */
export const NEON_CONNECTION_STRING = "${neonConnectionString}";
export const SHOP_NAME = "${shopName}";
export const SHOP_PHONE = "${shopPhone}";
export const SHOP_ADDRESS = "${shopAddress}";
`;

// Ensure target directory exists
const dir = path.dirname(configPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(configPath, fileContent, 'utf8');
console.log('Successfully generated assets/js/config.js');
