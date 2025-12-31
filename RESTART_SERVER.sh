#!/bin/bash
cd /Users/slphc/Documents/knnthdmyo/finbro
echo "🛑 Stopping all Next.js servers..."
pkill -f "node.*next" || echo "No servers running"
sleep 2
echo "🗑️  Clearing cache..."
rm -rf .next
echo "✅ Cache cleared!"
echo "🚀 Starting dev server..."
npm run dev

