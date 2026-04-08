/**
 * Script para gerar AUTH0_SECRET
 * Uso: node scripts/setup-auth0.js
 */

import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('hex');

console.log('='.repeat(60));
console.log('AUTH0_SECRET gerado:');
console.log('='.repeat(60));
console.log(secret);
console.log('='.repeat(60));
console.log('\nAdicione esta linha ao seu .env.local:');
console.log(`AUTH0_SECRET="${secret}"`);
