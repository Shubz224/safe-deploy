import { useEffect } from 'react';
import { useHashpack } from '../hooks/useHashpack';

export default function HashpackConnect({ onConnect, address }) {
    const { accountId, isConnected, loading, error, connect, disconnect, inputValue, setInputValue } = useHashpack();

    // Notify parent when connected
    useEffect(() => {
        if (isConnected && accountId && accountId !== address) {
            onConnect(accountId);
        }
    }, [isConnected, accountId, address, onConnect]);

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                    Step 1: Enter Hedera Account ID
                </h2>
                <span className="text-purple-400 text-sm font-semibold">Hedera Network</span>
            </div>

            {!isConnected ? (
                <div>
                    <div className="mb-4">
                        <label className="block text-white/70 text-sm mb-2">
                            Hedera Account ID (from your Hashpack wallet)
                        </label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="0.0.123456"
                            className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                            onKeyPress={(e) => e.key === 'Enter' && connect()}
                        />
                    </div>

                    <button
                        onClick={connect}
                        disabled={loading || !inputValue}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Connecting..." : "Connect"}
                    </button>

                    {error && (
                        <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                            ❌ {error}
                        </div>
                    )}

                    <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-blue-200 text-sm">
                        <div className="font-semibold mb-1">ℹ️ How to find your Account ID:</div>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                            <li>Open Hashpack wallet extension</li>
                            <li>Your Account ID is shown at the top (format: 0.0.xxxxx)</li>
                            <li>Copy and paste it above</li>
                        </ol>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-400 font-semibold">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Connected
                    </div>

                    <div className="bg-black/30 rounded-lg p-4">
                        <div className="text-white/70 text-xs mb-1">Hedera Account ID</div>
                        <code className="text-white font-mono text-sm break-all">{accountId}</code>
                    </div>

                    <button
                        onClick={disconnect}
                        className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors"
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
}
