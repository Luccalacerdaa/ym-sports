#!/usr/bin/env node

/**
 * Script para gerar chaves VAPID para Web Push
 * Rodar: node scripts/generate-vapid.js
 */

import webpush from 'web-push';

console.log('\n🔑 Gerando chaves VAPID para Web Push...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Chaves geradas com sucesso!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 ADICIONE NO .env:\n');
console.log(`VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('🚀 DEPOIS, ADICIONE NO VERCEL:');
console.log('   vercel env add VITE_VAPID_PUBLIC_KEY');
console.log('   vercel env add VAPID_PRIVATE_KEY\n');
console.log('⚠️  NUNCA COMMITE A PRIVATE KEY NO GIT!\n');

