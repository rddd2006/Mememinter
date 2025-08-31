// backend/seed.js
require('dotenv').config();
const db = require('./db');

// Define the 3 default coins you want to add
const defaultCoins = [
  {
    name: 'Wojak Coin',
    symbol: 'WOJAK',
    // These are placeholder addresses. They must be unique and 42 characters long.
    token_address: '0x1111111111111111111111111111111111111111',
    bonding_curve_address: '0x2222222222222222222222222222222222222222',
    creator: '0x0000000000000000000000000000000000000000',
    // You can find image URLs online for your placeholders
    token_uri: 'https://i.kym-cdn.com/entries/icons/original/000/012/834/manface.jpg',
  },
  {
    name: 'GigaChad Token',
    symbol: 'CHAD',
    token_address: '0x3333333333333333333333333333333333333333',
    bonding_curve_address: '0x4444444444444444444444444444444444444444',
    creator: '0x0000000000000000000000000000000000000000',
    token_uri: 'https://i.kym-cdn.com/entries/icons/facebook/000/026/152/gigachad.jpg',
  },
  {
    name: 'Pepe Classic',
    symbol: 'PEPEC',
    token_address: '0x5555555555555555555555555555555555555555',
    bonding_curve_address: '0x6666666666666666666666666666666666666666',
    creator: '0x0000000000000000000000000000000000000000',
    token_uri: 'https://i.kym-cdn.com/entries/icons/original/000/000/015/pepe.png',
  },
];

async function seedDatabase() {
  console.log('Starting to seed database...');
  try {
    for (const coin of defaultCoins) {
      const queryText = `
        INSERT INTO coins (name, symbol, token_address, bonding_curve_address, creator, token_uri)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (token_address) DO NOTHING;
      `;
      const values = [coin.name, coin.symbol, coin.token_address, coin.bonding_curve_address, coin.creator, coin.token_uri];
      
      await db.query(queryText, values);
      console.log(` -> Seeded ${coin.name}`);
    }
    console.log('✅ Seeding complete.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // End the process
    process.exit();
  }
}

seedDatabase();