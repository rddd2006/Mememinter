// frontend/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useWriteContract } from "wagmi";
import Link from "next/link";
import factoryAbi from "../../backend/abi/MemeCoinFactory.json"; // Adjust path if needed

// Define the type for a coin object
interface Coin {
  name: string;
  symbol: string;
  token_address: string;
  bonding_curve_address: string;
  token_uri: string;
}

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;

export default function Home() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const { writeContract, isPending } = useWriteContract();

  // This hook fetches the list of coins from your API when the page loads
  useEffect(() => {
    async function fetchCoins() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coins`);
        const data = await response.json();
        setCoins(data);
      } catch (error) {
        console.error("Failed to fetch coins:", error);
      }
    }
    fetchCoins();
  }, []);

  // This function handles the form submission to create a new coin
  const createCoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const symbol = formData.get("symbol") as string;
    const uri = formData.get("uri") as string;

    if (!name || !symbol || !uri) return;

    // Call the 'createCoin' function on your smart contract
    writeContract({
      abi: factoryAbi.abi,
      address: FACTORY_ADDRESS,
      functionName: "createCoin",
      args: [name, symbol, uri],
    });
  };

  return (
    <div className="p-8">
      {/* Coin Creation Section */}
      <div className="mb-12 p-6 border rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">🚀 Launch a New Coin</h2>
        <form onSubmit={createCoin} className="flex flex-col gap-4">
          <input
            name="name"
            placeholder="Token Name (e.g., Doge)"
            className="input input-bordered w-full"
            required
          />
          <input
            name="symbol"
            placeholder="Token Symbol (e.g., DOGE)"
            className="input input-bordered w-full"
            required
          />
          <input
            name="uri"
            placeholder="Image URI (e.g., https://.../image.png)"
            className="input input-bordered w-full"
            required
          />
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Creating..." : "Create Coin"}
          </button>
        </form>
      </div>

      {/* Coin List Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">🪙 Available Coins</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coins.map((coin) => (
            <Link href={`/${coin.bonding_curve_address}`} key={coin.token_address}>
              <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                <figure className="px-10 pt-10">
                  <img
                    src={coin.token_uri}
                    alt={coin.name}
                    className="rounded-xl w-24 h-24 object-cover"
                  />
                </figure>
                <div className="card-body items-center text-center">
                  <h3 className="card-title">{coin.name}</h3>
                  <p>${coin.symbol}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}