import { useState, useEffect } from 'react';
import { getSafeBalance } from '../utils/api';

export default function WalletDashboard({ hashpackAddress, privyWallet, safeAddress }) {
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                console.log("🔄 Fetching Safe balance for:", safeAddress);
                const data = await getSafeBalance(safeAddress);
                console.log("✅ Safe Balance:", data.balanceUSDC, "USDC");
                setBalance(data.balanceUSDC);
                setError(null);
            } catch (err) {
                console.error("❌ Balance Fetch Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();

        // Refresh balance every 10 seconds
        const interval = setInterval(fetchBalance, 10000);
        return () => clearInterval(interval);
    }, [safeAddress]);

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">
                🎉 Wallet Dashboard
            </h2>

            {/* Wallet Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Hashpack Wallet */}
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-lg p-4 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <h3 className="text-white font-semibold">Hashpack Wallet</h3>
                    </div>
                    <p className="text-white/70 text-sm break-all font-mono mb-2">{hashpackAddress}</p>
                    <span className="text-xs text-purple-300 font-semibold">Hedera Network</span>
                </div>

                {/* Privy Wallet */}
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-lg p-4 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <h3 className="text-white font-semibold">Privy Wallet</h3>
                    </div>
                    <p className="text-white/70 text-sm break-all font-mono mb-2">{privyWallet.privyAddress}</p>
                    <span className="text-xs text-blue-300 font-semibold">Polygon Network (EOA)</span>
                </div>

                {/* Safe Wallet */}
                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-lg p-4 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <h3 className="text-white font-semibold">Safe Wallet</h3>
                    </div>
                    <p className="text-white/70 text-sm break-all font-mono mb-2">{safeAddress}</p>
                    <span className="text-xs text-green-300 font-semibold">Polygon Network (Smart Contract)</span>
                </div>
            </div>

            {/* Balance Display */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-6 text-center mb-6 border border-white/10">
                <h3 className="text-white/70 text-sm mb-3 uppercase tracking-wide">Safe USDC Balance</h3>
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-8 w-8 text-white/50" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-white/50">Loading...</span>
                    </div>
                ) : error ? (
                    <div className="text-red-400 text-sm">Error: {error}</div>
                ) : (
                    <div>
                        <p className="text-5xl font-bold text-white mb-2">
                            ${balance !== null ? balance.toFixed(2) : '0.00'}
                        </p>
                        <p className="text-white/50 text-xs">Auto-refreshes every 10 seconds</p>
                    </div>
                )}
            </div>

            {/* Ownership Chain */}
            <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Ownership Chain
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-3">
                        <span className="text-white/50 font-mono">1.</span>
                        <div>
                            <span className="text-white">You control </span>
                            <span className="text-purple-300 font-semibold">Hashpack</span>
                            <span className="text-white/70"> via HashConnect</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-white/50 font-mono">2.</span>
                        <div>
                            <span className="text-blue-300 font-semibold">Privy Wallet</span>
                            <span className="text-white/70"> owned by you (via Privy key management)</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-white/50 font-mono">3.</span>
                        <div>
                            <span className="text-green-300 font-semibold">Safe Contract</span>
                            <span className="text-white/70"> owned by Privy Wallet</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-white/50 font-mono">4.</span>
                        <div>
                            <span className="text-white/70">USDC held in Safe, tradable via </span>
                            <span className="text-yellow-300 font-semibold">Polymarket</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 flex flex-wrap gap-3">
                <a
                    href={`https://polygonscan.com/address/${safeAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                    View Safe on PolygonScan
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
                <a
                    href={`https://polygonscan.com/address/${privyWallet.privyAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                    View Privy Wallet on PolygonScan
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>
        </div>
    );
}
