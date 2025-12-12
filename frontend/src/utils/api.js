const API_BASE = "http://localhost:9000";

export async function createPrivyWallet(hashpackAddress) {
    const response = await fetch(`${API_BASE}/create-privy-wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hashpackAddress })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

export async function deploySafe(privyAddress) {
    const response = await fetch(`${API_BASE}/deploy-safe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privyAddress })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

export async function getSafeBalance(safeAddress) {
    const response = await fetch(`${API_BASE}/safe/${safeAddress}/balance`);

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}
