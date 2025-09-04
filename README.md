#  MemeMinter - Meme Coin Launchpad 🚀

> A full-stack decentralized application that allows users to create, launch, and trade their own ERC-20 meme coins on the Sepolia testnet. The platform features a bonding curve for initial trading that automatically transitions to a Uniswap V2 liquidity pool once a market cap target is reached.

## ✨ Core Features

-   🔗 **Wallet Connection**: Integrates with MetaMask and other wallets via ConnectKit.
-   🎨 **Meme Coin Creation**: Instantly create a new ERC-20 token with a name, symbol, and image.
-   📈 **Bonding Curve Trading**: An initial trading phase where prices are determined by a bonding curve.
-   🦄 **Automatic DEX Launch**: Automatically creates a liquidity pool on Uniswap V2 once a market cap target is hit.
-   📊 **Live Price Charts**: A dynamic trading page for each coin, showing its price history.
-   🔍 **Coin Discovery**: A home page that lists all coins created on the platform.

## 🛠️ Tech Stack

| Category     | Technologies                                                                                             |
| :----------- | :------------------------------------------------------------------------------------------------------- |
| **Blockchain** | `Solidity`, `Foundry`, `OpenZeppelin`, `Sepolia Testnet`                                                   |
| **Backend** | `Node.js`, `Express.js`, `ethers.js`, `PostgreSQL`                                                       |
| **Frontend** | `Next.js`, `React`, `TypeScript`, `wagmi`, `viem`, `ConnectKit`, `Tailwind CSS`, `shadcn/ui`, `recharts` |
| **Database** | `Vercel Postgres` (Production), `Docker + PostgreSQL` (Local)                                            |
| **Deployment** | `Vercel` (Frontend/API), `Render/Koyeb` (Indexer Worker)                                                 |

---

## 💻 Getting Started Locally

Follow these steps to set up and run the entire application on your local machine.

### 1. Prerequisites
Make sure you have the following installed:
-   [Node.js](https://nodejs.org/en) (v18 or later)
-   [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
-   [Foundry](https://book.getfoundry.sh/getting-started/installation) (for smart contracts)
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the local database)

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd <your-project-name>
```

### 3. Deploy Smart Contracts
1.  Set your environment variables for the Sepolia testnet.
    ```bash
    export SEPOLIA_RPC_URL="YOUR_ALCHEMY_HTTPS_URL"
    export PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY"
    ```
2.  Run the Foundry deployment script:
    ```bash
    forge script script/Deploy.s.sol:Deploy --rpc-url $SEPOLIA_RPC_URL --fork-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast
    ```
3.  **Important**: Copy the deployed `MemeCoinFactory` contract address.

### 4. Set Up Local Database
1.  Start the PostgreSQL container:
    ```bash
    docker compose up -d
    ```
2.  Connect to the database using `psql`:
    ```bash
    psql "postgresql://myuser:mypassword@localhost:5432/pump_clone_dev"
    ```
3.  Inside `psql`, run the SQL to create your tables:
    ```sql
    CREATE TABLE coins (
        token_address VARCHAR(42) PRIMARY KEY,
        bonding_curve_address VARCHAR(42) UNIQUE NOT NULL,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL,
        creator VARCHAR(42) NOT NULL,
        token_uri TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE trades (
        id SERIAL PRIMARY KEY,
        bonding_curve_address VARCHAR(42) NOT NULL REFERENCES coins(bonding_curve_address),
        buyer VARCHAR(42) NOT NULL,
        eth_spent NUMERIC(20, 0) NOT NULL,
        tokens_received NUMERIC(20, 0) NOT NULL,
        price NUMERIC NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ```
4.  Exit `psql` by typing `\q`.

### 5. Configure Environment Variables
1.  **Backend**: Create a `.env` file in `backend/`
    ```
    # backend/.env
    POSTGRES_URL="postgresql://myuser:mypassword@localhost:5432/pump_clone_dev"
    FACTORY_ADDRESS="YOUR_DEPLOYED_MEMECOINFACTORY_ADDRESS"
    RPC_URL="YOUR_ALCHEMY_WEBSOCKET_URL (wss://)"
    ```
2.  **Frontend**: Create a `.env.local` file in `frontend/`
    ```
    # frontend/.env.local
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="YOUR_WALLETCONNECT_PROJECT_ID"
    NEXT_PUBLIC_SEPOLIA_RPC_URL="YOUR_SEPOLIA_HTTP_RPC_URL"
    NEXT_PUBLIC_FACTORY_ADDRESS="YOUR_DEPLOYED_MEMECOINFACTORY_ADDRESS"
    NEXT_PUBLIC_API_URL="http://localhost:3001"
    ```

### 6. Install Dependencies and Seed Database
1.  **Backend**:
    ```bash
    cd backend
    npm install
    npm run seed
    ```
2.  **Frontend**:
    ```bash
    cd ../frontend
    npm install
    ```

### 7. Run the Application
You will need three separate terminals.

-   **Terminal 1: Start the Indexer**
    ```bash
    cd backend
    node indexer.js
    ```
-   **Terminal 2: Start the API Server**
    ```bash
    cd backend
    node server.js
    ```
-   **Terminal 3: Start the Frontend**
    ```bash
    cd frontend
    npm run dev
    ```
    Your application is now running at `http://localhost:3000`.

---



## ⚠️ Disclaimer

> This is an educational project and is **not audited for security**. The smart contracts are simplified for learning purposes. Do not use this code with real funds on the Ethereum mainnet.
