import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tgsojwhkknwynnokzini.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnc29qd2hra253eW5ub2t6aW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4ODgwMDksImV4cCI6MjA4NDQ2NDAwOX0.qw1504Eeiic71bt0DsWH7jSEhzgrGzmXQI_hWHHKoyg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DEMO_USERS = [
  { name: 'Admin Trader', email: 'admin@bitacora.io', role: 'ADMIN' },
  { name: 'Pro Trader', email: 'pro@trader.com', role: 'USER' },
  { name: 'iuratobraian', email: 'iuratobraian@gmail.com', role: 'USER' }
];

const DEMO_TRADES = [
  { symbol: 'EURUSDc', type: 'BUY', price: 1.0850, profit: 150.50 },
  { symbol: 'GBPUSDc', type: 'SELL', price: 1.2650, profit: -80.00 },
  { symbol: 'XAUUSD', type: 'BUY', price: 2025.50, profit: 320.00 },
  { symbol: 'USDJPYc', type: 'SELL', price: 149.80, profit: 95.25 },
  { symbol: 'BTCUSD', type: 'BUY', price: 67500, profit: -120.00 },
  { symbol: 'EURUSDc', type: 'BUY', price: 1.0865, profit: 200.00 },
  { symbol: 'ETHUSD', type: 'BUY', price: 3450, profit: 450.00 },
  { symbol: 'GBPUSDc', type: 'BUY', price: 1.2680, profit: -50.00 },
  { symbol: 'XAUUSD', type: 'SELL', price: 2035.00, profit: 180.00 },
  { symbol: 'USDCADc', type: 'BUY', price: 1.3620, profit: 75.00 },
  { symbol: 'EURUSDc', type: 'SELL', price: 1.0890, profit: -60.00 },
  { symbol: 'BTCUSD', type: 'BUY', price: 68200, profit: 680.00 },
  { symbol: 'GBPJPYc', type: 'SELL', price: 189.50, profit: 220.00 },
  { symbol: 'XAUUSD', type: 'BUY', price: 2040.00, profit: -40.00 },
  { symbol: 'AUDUSDc', type: 'BUY', price: 0.6520, profit: 110.00 }
];

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function createDemoUsers() {
  console.log('🚀 Creating demo users in Bitácora...\n');

  for (const userData of DEMO_USERS) {
    console.log(`📝 Creating user: ${userData.name} (${userData.email})`);
    
    const userId = uuidv4();
    
    const { error: userError } = await supabase
      .from('app_users')
      .insert({
        id: userId,
        data: {
          id: userId,
          pin: '123456',
          name: userData.name,
          email: userData.email,
          role: userData.role,
          avatar: '📈',
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString()
        }
      });

    if (userError) {
      console.log(`   ❌ Error creating user: ${userError.message}`);
      continue;
    }

    console.log(`   ✅ User created: ${userId}`);

    const accountId = uuidv4();
    
    const { error: accountError } = await supabase
      .from('app_accounts')
      .insert({
        id: accountId,
        user_id: userId,
        data: {
          id: accountId,
          user_id: userId,
          name: 'Main Account',
          starting_balance: 10000,
          currency: 'USD',
          createdAt: new Date().toISOString()
        }
      });

    if (accountError) {
      console.log(`   ⚠️  Error creating account: ${accountError.message}`);
      continue;
    }

    console.log(`   ✅ Account created: ${accountId}`);

    let tradesCreated = 0;
    for (let i = 0; i < DEMO_TRADES.length; i++) {
      const trade = DEMO_TRADES[i];
      const date = new Date();
      date.setDate(date.getDate() - (DEMO_TRADES.length - i) * 2);
      
      const tradeId = uuidv4();
      
      const outcome = trade.profit > 0 ? 'WIN' : (trade.profit < 0 ? 'LOSS' : 'BREAKEVEN');
      
      const { error: tradeError } = await supabase
        .from('app_trades')
        .insert({
          id: tradeId,
          user_id: userId,
          account_id: accountId,
          ticket: 8800000 + i,
          symbol: trade.symbol,
          type: trade.type,
          price: trade.price,
          profit: trade.profit,
          commission: -3.90,
          swap: 0,
          timestamp: date.toISOString()
        });

      if (!tradeError) tradesCreated++;
    }

    console.log(`   ✅ ${tradesCreated} trades created`);
  }

  console.log('\n✨ Demo users created successfully!\n');
  console.log('Demo users available:');
  for (const user of DEMO_USERS) {
    console.log(`   📧 ${user.email} (PIN: 123456)`);
  }
}

createDemoUsers().catch(console.error);
