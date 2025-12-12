import { useState } from 'react';

// Simple manual input hook - no complicated libraries
export function useHashpack() {
    const [accountId, setAccountId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [inputValue, setInputValue] = useState('');

    const connect = () => {
        setLoading(true);
        setError(null);

        // Validate Hedera account ID format (0.0.xxxxx)
        const accountIdRegex = /^0\.0\.\d+$/;

        if (!inputValue || !accountIdRegex.test(inputValue)) {
            setError('Please enter a valid Hedera Account ID (format: 0.0.123456)');
            setLoading(false);
            return;
        }

        console.log("✅ Hedera Account ID entered:", inputValue);
        setAccountId(inputValue);
        setIsConnected(true);
        setLoading(false);
    };

    const disconnect = () => {
        setAccountId(null);
        setIsConnected(false);
        setInputValue('');
        console.log("❌ Disconnected");
    };

    return {
        accountId,
        isConnected,
        loading,
        error,
        connect,
        disconnect,
        inputValue,
        setInputValue
    };
}
