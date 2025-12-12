import { useState } from 'react';
import HashpackConnect from './components/HashpackConnect';
import PrivyWallet from './components/PrivyWallet';
import SafeDeployment from './components/SafeDeployment';
import WalletDashboard from './components/WalletDashboard';
import './index.css';

export default function App() {
  const [hashpackAddress, setHashpackAddress] = useState(null);
  const [privyWallet, setPrivyWallet] = useState(null);
  const [safeAddress, setSafeAddress] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-300">Live Testing Environment</span>
            </div>
          </div>

          <h1 className="text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Privy × Safe
            </span>
          </h1>

          <p className="text-xl text-white/60 font-light">
            Automated wallet deployment pipeline
          </p>

          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-white/40">
            <span>Hedera</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Privy</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Safe</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Polymarket</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { label: 'Hedera', active: hashpackAddress, icon: '1' },
              { label: 'Privy', active: privyWallet, icon: '2' },
              { label: 'Safe', active: safeAddress, icon: '3' }
            ].map((step, idx) => (
              <div key={idx} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${step.active
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-white/10 text-white/40 border-2 border-white/20'
                    }`}>
                    {step.active ? '✓' : step.icon}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${step.active ? 'text-purple-300' : 'text-white/40'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${step.active ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-white/10'
                    }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          <HashpackConnect
            onConnect={setHashpackAddress}
            address={hashpackAddress}
          />

          {hashpackAddress && (
            <PrivyWallet
              hashpackAddress={hashpackAddress}
              onWalletCreated={setPrivyWallet}
              wallet={privyWallet}
            />
          )}

          {privyWallet && (
            <SafeDeployment
              privyAddress={privyWallet.privyAddress}
              onSafeDeployed={setSafeAddress}
              safeAddress={safeAddress}
            />
          )}

          {safeAddress && (
            <WalletDashboard
              hashpackAddress={hashpackAddress}
              privyWallet={privyWallet}
              safeAddress={safeAddress}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-white/30 text-sm">
          <p>Powered by Privy, Gnosis Safe & Polymarket Relayer</p>
        </div>
      </div>
    </div>
  );
}
