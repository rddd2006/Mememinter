// frontend/src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useWriteContract } from "wagmi";
import Link from "next/link";
import factoryAbi from "@/abi/MemeCoinFactory.json";

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

  useEffect(() => {
    async function fetchCoins() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coins`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setCoins(data);
      } catch (error) {
        console.error("Failed to fetch coins:", error);
      }
    }
    fetchCoins();
  }, []);

  const createCoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const symbol = formData.get("symbol") as string;
    const uri = formData.get("uri") as string;

    if (!name || !symbol || !uri) return;

    writeContract({
      abi: factoryAbi.abi,
      address: FACTORY_ADDRESS,
      functionName: "createCoin",
      args: [name, symbol, uri],
    });
  };

  return (
    <div className="relative overflow-hidden">
      <div className="grid"></div> {/* Background grid effect */}

      <div className="p-8">
        {/* Coin Creation Section */}
        <div className="mb-12 p-6 max-w-md mx-auto">
          <h2 className="text-3xl font-semibold mb-6 text-center text-white">🚀 Launch a New Coin</h2>
          <form onSubmit={createCoin} className="flex flex-col gap-6 items-center">
            {/* Styled Inputs */}
            <div className="input-container">
              <div className="input-glow-container input-glow-white"></div>
              <input name="name" placeholder="Token Name (e.g., Doge)" className="input" required />
            </div>
            <div className="input-container">
              <div className="input-glow-container input-glow-white"></div>
              <input name="symbol" placeholder="Token Symbol (e.g., DOGE)" className="input" required />
            </div>
            <div className="input-container">
              <div className="input-glow-container input-glow-white"></div>
              <input name="uri" placeholder="Image URI (e.g., https://...)" className="input" required />
            </div>
            {/* Styled Button */}
            <button type="submit" className="button mt-2" disabled={isPending}>
              <span>{isPending ? "Creating..." : "Create Coin"}</span>
              <div className="button-overlay"></div>
            </button>
          </form>
        </div>

        {/* Coin List Section */}
        <div>
          <h2 className="text-3xl font-semibold mb-8 text-center text-white">🪙 Available Coins</h2>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {coins.map((coin) => (
              <Link href={`/${coin.bonding_curve_address}`} key={coin.token_address} className="no-underline">
                {/* Styled Card */}
                <div className="card">
                  <div className="content">
                    <img src={coin.token_uri} alt={coin.name} className="w-24 h-24 rounded-full object-cover border-2 border-gray-500" />
                    <p className="text-xl font-bold">{coin.name}</p>
                    <p className="text-lg text-gray-400">${coin.symbol}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}