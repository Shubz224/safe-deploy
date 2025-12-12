import { useState, useEffect } from 'react';
import { deploySafe } from '../utils/api';

export default function SafeDeployment({ privyAddress, onSafeDeployed, safeAddress }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Auto-deploy Safe when Privy wallet is created
    useEffect(() => {
        if (privyAddress && !safeAddress && !loading) {
            handleDeploySafe();
        }
    }, [privyAddress]);

    const handleDeploySafe = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("🔄 Auto-deploying Safe with Privy wallet as owner:", privyAddress);

            const data = await deploySafe(privyAddress);

            console.log("✅ Safe Deployed Successfully (Automatic):");
            console.log("   Safe Address:", data.safeAddress);
            console.log("   Owner:", data.owner);
            console.log("   Transaction Hash:", data.txnHash);
            console.log("   View on PolygonScan:", `https://polygonscan.com/address/${data.safeAddress}`);

            onSafeDeployed(data.safeAddress);
        } catch (err) {
            console.error("❌ Safe Deployment Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                    Step 3: Safe Smart Contract (Auto-deployed)
                </h2>
                <span className="text-green-400 text-sm font-semibold">Polygon Network</span>
            </div>

            {loading ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-white/80">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Deploying Safe automatically... (30-60 seconds)
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-200 text-xs">
                        ⏳ Polymarket Relayer is deploying your Safe contract (gasless)
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                    ❌ Error: {error}
                    <button
                        onClick={handleDeploySafe}
                        className="ml-3 text-red-300 hover:text-red-100 underline"
                    >
                        Retry
                    </button>
                </div>
            ) : safeAddress ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-400 font-semibold">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Safe Deployed Successfully
                    </div>

                    <div className="bg-black/30 rounded-lg p-4 space-y-2">
                        <div>
                            <div className="text-white/70 text-xs mb-1">Safe Address</div>
                            <code className="text-white font-mono text-sm break-all">{safeAddress}</code>
                        </div>
                        <div>
                            <div className="text-white/70 text-xs mb-1">Owner (Privy Wallet)</div>
                            <code className="text-white/80 font-mono text-xs break-all">{privyAddress}</code>
                        </div>
                    </div>

                    <a
                        href={`https://polygonscan.com/address/${safeAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-green-400 hover:text-green-300 text-sm font-semibold transition-colors"
                    >
                        View on PolygonScan →
                    </a>

                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-200 text-xs">
                        ✅ Safe deployed automatically via Polymarket Relayer (gasless). Your Privy wallet owns this Safe!
                    </div>
                </div>
            ) : null}
        </div>
    );
}
