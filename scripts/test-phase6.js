import http from 'http';
import { spawn } from 'child_process';

const BASE_URL = 'http://localhost:5000';

async function testApiFlow() {
  console.log('🧪 Starting Phase 6 Verification Test...\n');

  // 1. Check Demo Farmer
  console.log('1. Checking seeded demo farmer (+91 9876543210)...');
  const checkRes = await fetch(`${BASE_URL}/api/farmers/check-phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: '9876543210' }),
  });
  const checkData = await checkRes.json();
  if (!checkData.isRegistered) {
    throw new Error('Demo farmer 9876543210 is not registered!');
  }
  console.log(`   ✓ Farmer found: ${checkData.farmer.name}, ${checkData.farmer.village}, Lang: ${checkData.farmer.selectedLanguage?.name}`);

  // 2. Check Records & Budget
  console.log('2. Checking records & budget...');
  const recRes = await fetch(`${BASE_URL}/api/records?phone=9876543210`);
  const recData = await recRes.json();
  console.log(`   ✓ Total spent: ₹${recData.totalSpent}, Budget: ₹${recData.budget?.total || 0}, Expenses: ${recData.expenses?.length}, History: ${recData.history?.length}`);

  // 3. Test Offline Sync Endpoint (/api/sync)
  console.log('3. Testing /api/sync endpoint with offline queued entries...');
  const testClientId = `offline_${Date.now()}_test1`;
  const syncPayload = {
    phoneNumber: '9876543210',
    entries: [
      {
        clientId: testClientId,
        type: 'expense',
        category: 'fertilizer',
        amount: 350,
        description: 'Offline sync test urea bag',
        date: new Date().toISOString(),
      },
    ],
  };

  const syncRes = await fetch(`${BASE_URL}/api/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(syncPayload),
  });
  const syncData = await syncRes.json();
  if (!syncData.success || syncData.syncedCount !== 1) {
    throw new Error(`/api/sync failed: ${JSON.stringify(syncData)}`);
  }
  console.log(`   ✓ Synced 1 offline entry successfully. SyncedCount: ${syncData.syncedCount}`);

  // 4. Test Idempotency (resending same clientId must not duplicate)
  console.log('4. Testing idempotency (resending same clientId)...');
  const retryRes = await fetch(`${BASE_URL}/api/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(syncPayload),
  });
  const retryData = await retryRes.json();
  if (retryData.syncedCount !== 0) {
    throw new Error(`Idempotency failed! Resending same clientId synced ${retryData.syncedCount} entries.`);
  }
  console.log('   ✓ Idempotency verified: re-submitting the same batch safely skipped duplicate.');

  // 5. Test Market API
  console.log('5. Testing Market endpoint (/api/market)...');
  const mktRes = await fetch(`${BASE_URL}/api/market?crop=Paddy`);
  const mktData = await mktRes.json();
  if (!mktData.crop || !mktData.mandis) {
    throw new Error('Market API failed');
  }
  console.log(`   ✓ Market data for ${mktData.crop}: ${mktData.mandis.length} mandis, best mandi: ${mktData.bestMandi?.name} (₹${mktData.bestMandi?.price})`);

  console.log('\n🎉 ALL PHASE 6 BACKEND & SYNC TESTS PASSED SUCCESSFULLY!\n');
}

testApiFlow().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
