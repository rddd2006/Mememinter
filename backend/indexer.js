// backend/indexer.js
require('dotenv').config();
const ethers = require('ethers');
const db = require('./db');
// Import ABIs from our new abi folder
const factoryAbi = require('./abi/MemeCoinFactory.json').abi;
const bondingCurveAbi = require('./abi/BondingCurve.json').abi;

// These will be set in the deployment environment (Render)
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
const RPC_URL = process.env.RPC_URL; // A WebSocket (wss://) RPC URL is required for real-time events

async function main() {
    console.log("Starting indexer to listen for blockchain events...");
    // A WebSocket provider is needed for real-time event listening
    const provider = new ethers.WebSocketProvider(RPC_URL);

    // --- Event Handler for New Coin Creation ---
    const handleCoinCreated = async (name, symbol, tokenAddress, bondingCurveAddress, creator) => {
        console.log(`✅ New Coin Detected: ${name} (${symbol}) at ${tokenAddress}`);
        
        // We also need the tokenURI from the bonding curve contract
        const curveContract = new ethers.Contract(bondingCurveAddress, bondingCurveAbi, provider);
        const tokenURI = await curveContract.tokenURI();

        const queryText = `
            INSERT INTO coins (name, symbol, token_address, bonding_curve_address, creator, token_uri)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (token_address) DO NOTHING;
        `;
        const values = [name, symbol, tokenAddress, bondingCurveAddress, creator, tokenURI];
        
        try {
            await db.query(queryText, values);
            console.log(`   -> Saved coin ${name} to database.`);
            // Start listening for trades on this new coin's bonding curve
            listenToTrades(bondingCurveAddress, provider);
        } catch (err) {
            console.error("   -> Error saving coin:", err);
        }
    };

    // --- Event Handler for Token Purchases ---
    const handleTokensBought = async (buyer, ethSpent, tokensReceived, event) => {
        const bondingCurveAddress = event.address; // The address of the contract that emitted the event
        console.log(`📈 Trade on ${bondingCurveAddress}: ${ethers.formatEther(ethSpent)} ETH`);
        
        // Calculate the price for this trade for charting purposes
        const price = Number(ethSpent) / Number(tokensReceived);

        const queryText = `
            INSERT INTO trades (bonding_curve_address, buyer, eth_spent, tokens_received, price)
            VALUES ($1, $2, $3, $4, $5);
        `;
        // We store the large numbers as strings to avoid precision loss
        const values = [bondingCurveAddress, buyer, ethSpent.toString(), tokensReceived.toString(), price];

        try {
            await db.query(queryText, values);
            console.log(`   -> Saved trade on ${bondingCurveAddress} to database.`);
        } catch (err) {
            console.error("   -> Error saving trade:", err);
        }
    };

    // --- Main Logic ---
    
    // Function to attach a "TokensBought" listener to a bonding curve contract
    const listenToTrades = (curveAddress, provider) => {
        const curveContract = new ethers.Contract(curveAddress, bondingCurveAbi, provider);
        curveContract.on("TokensBought", handleTokensBought);
        console.log(`   🎧 Started listening for trades on ${curveAddress}`);
    };

    // 1. Start listening for any new coins created by our factory contract
    const factoryContract = new ethers.Contract(FACTORY_ADDRESS, factoryAbi, provider);
    factoryContract.on("CoinCreated", handleCoinCreated);
    console.log(`Listening for "CoinCreated" events from factory at ${FACTORY_ADDRESS}`);

    // 2. For any coins already in our database, make sure we are listening for their trades
    const { rows: existingCoins } = await db.query('SELECT bonding_curve_address FROM coins');
    console.log(`Found ${existingCoins.length} existing coins in the database. Attaching trade listeners...`);
    existingCoins.forEach(coin => {
        listenToTrades(coin.bonding_curve_address, provider);
    });
    
    console.log("\nIndexer is fully running and listening for all events.");
}

main().catch(console.error);