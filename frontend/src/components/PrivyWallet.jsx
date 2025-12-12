import { useState, useEffect } from 'react';
import { createPrivyWallet } from '../utils/api';

export default function PrivyWallet({ hashpackAddress, onWalletCreated, wallet }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Auto-create Privy wallet when Hashpack connects
    useEffect(() => {
        if (hashpackAddress && !wallet && !loading) {
            handleCreateWallet();
        }
    }, [hashpackAddress]);

    const handleCreateWallet = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("🔄 Auto-creating Privy wallet for Hashpack:", hashpackAddress);

            const data = await createPrivyWallet(hashpackAddress);

            console.log("✅ Privy Wallet Created (Server-side):");
            console.log("   Wallet ID:", data.privyWalletId);
            console.log("   Address:", data.privyAddress);
            console.log("   Owner ID:", data.ownerId);
            console.log("   Chain Type:", data.chainType);
            console.log("   Created At:", new Date(data.createdAt).toLocaleString());

            onWalletCreated(data);
        } catch (err) {
            console.error("❌ Privy Wallet Creation Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                    Step 2: Privy Embedded Wallet (Auto-created)
                </h2>
                <span className="text-blue-400 text-sm font-semibold">Polygon Network</span>
            </div>

            {loading ? (
                <div className="flex items-center gap-3 text-white/80">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Privy wallet automatically...
                </div>
            ) : error ? (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                    ❌ Error: {error}
                    <button
                        onClick={handleCreateWallet}
                        className="ml-3 text-red-300 hover:text-red-100 underline"
                    >
                        Retry
                    </button>
                </div>
            ) : wallet ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-400 font-semibold">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Privy Wallet Created Automatically
                    </div>

                    <div className="bg-black/30 rounded-lg p-4 space-y-2">
                        <div>
                            <div className="text-white/70 text-xs mb-1">Polygon Address (EOA)</div>
                            <code className="text-white font-mono text-sm break-all">{wallet.privyAddress}</code>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <div className="text-white/50">Wallet ID</div>
                                <div className="text-white/80 font-mono text-xs">{wallet.privyWalletId}</div>
                            </div>
                            <div>
                                <div className="text-white/50">Chain Type</div>
                                <div className="text-white/80">{wallet.chainType}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-blue-200 text-xs">
                        ℹ️ This wallet was created server-side via Privy API. You control it indirectly through your Hashpack wallet.
                    </div>
                </div>
            ) : null}
        </div>
    );
}
