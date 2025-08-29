// frontend/src/app/[curveAddress]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWriteContract, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import bondingCurveAbi from '@/abi/BondingCurve.json';

interface Trade {
  price: number;
  timestamp: string;
}
interface Coin {
  name: string;
  symbol: string;
  token_uri: string;
}

export default function CoinPage() {
  const params = useParams();
  const curveAddress = params.curveAddress as `0x${string}` | undefined;

  const [trades, setTrades] = useState<Trade[]>([]);
  const [coin, setCoin] = useState<Coin | null>(null);
  const [ethAmount, setEthAmount] = useState('');

  const { writeContract, isPending, error } = useWriteContract();
  const { data: isLaunched } = useReadContract({
    abi: bondingCurveAbi.abi,
    address: curveAddress,
    functionName: 'isLaunchedOnUniswap',
  });

  useEffect(() => {
    if (!curveAddress) return;

    const fetchCoinInfo = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coins/${curveAddress}`);
        const data = await res.json();
        setCoin(data);
      } catch (err) {
        console.error("Failed to fetch coin info:", err);
      }
    };

    const fetchTrades = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trades/${curveAddress}`);
        const data = await res.json();
        const formattedData = data.map((d: any) => ({
          ...d,
          price: parseFloat(d.price).toPrecision(6),
          timestamp: new Date(d.timestamp).toLocaleTimeString(),
        }));
        setTrades(formattedData);
      } catch (err) {
        console.error("Failed to fetch trades:", err);
      }
    };
    
    fetchCoinInfo();
    fetchTrades();
    const interval = setInterval(fetchTrades, 5000);

    return () => clearInterval(interval);
  }, [curveAddress]);

  const handleBuy = async () => {
    if (!ethAmount || !curveAddress) return;
    writeContract({
      abi: bondingCurveAbi.abi,
      address: curveAddress,
      functionName: 'buy',
      value: parseEther(ethAmount),
    });
  };

  // Use the new loader while coin data is being fetched
  if (!coin) {
    return <div className="loader"></div>;
  }

  return (
    <div className="relative overflow-hidden">
       <div className="grid"></div> {/* Background grid effect */}

      <div className="p-8 grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Chart Section */}
        <div className="md:col-span-2 p-6 border border-gray-700 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">Price Chart for ${coin.symbol}</h2>
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={trades}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="timestamp" stroke="#999" />
                <YAxis domain={['auto', 'auto']} stroke="#999" tickFormatter={(tick) => parseFloat(tick).toExponential(2)} />
                <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }} />
                <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info & Trade Section */}
        <div className="md:col-span-1 p-6 border border-gray-700 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg h-fit">
          <div className="flex items-center gap-4 mb-6">
            <img src={coin.token_uri} alt={coin.name} className="w-16 h-16 rounded-full border-2 border-gray-500" />
            <div>
              <h2 className="text-3xl font-bold text-white">{coin.name}</h2>
              <p className="text-xl text-gray-400">${coin.symbol}</p>
            </div>
          </div>
          
          {isLaunched ? (
            <div className="text-green-400 p-4 bg-green-900 bg-opacity-50 rounded-md">
              <span>🚀 Launched on Uniswap! Trading has moved to the DEX.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Styled Input */}
              <div className="input-container">
                <div className="input-glow-container input-glow-white"></div>
                <input
                  type="text"
                  className="input"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  placeholder="0.01 ETH"
                />
              </div>
               {/* Styled Button */}
              <button onClick={handleBuy} className="button" disabled={isPending}>
                <span>{isPending ? 'Confirming...' : 'Buy Tokens'}</span>
                <div className="button-overlay"></div>
              </button>
              {error && <div className="text-red-500 text-sm mt-2">Error: {(error as any).shortMessage || error.message}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}