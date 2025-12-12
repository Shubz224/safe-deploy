import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { polygon } from "viem/chains";
import { RelayClient } from "@polymarket/builder-relayer-client";
import { BuilderConfig } from "@polymarket/builder-signing-sdk";


const publicClient = createPublicClient({
    chain: polygon,
    transport: http(process.env.RPC_URL)
});


dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

//builder wallet 
const builderAccount = privateKeyToAccount(process.env.PRIVATE_KEY);
const builderWallet = createWalletClient({
    account: builderAccount,
    chain: polygon,
    transport: http(process.env.RPC_URL)
});

console.log("🔑 Builder Wallet:", builderAccount.address);

//builder config remote signing

const builderConfig = new BuilderConfig({
    remoteBuilderConfig: {
        url: process.env.REMOTE_SIGN_URL
    }
});

// In-memory storage for testing (use database in production)
const userWallets = new Map();

//create Privy wallet for Hedera user
app.post("/create-privy-wallet", async (req, res) => {
    try {
        const { hashpackAddress } = req.body;

        console.log("\n🔄 Creating Privy wallet for Hedera:", hashpackAddress);

        // Check if wallet already exists for this Hedera account
        if (userWallets.has(hashpackAddress)) {
            const existing = userWallets.get(hashpackAddress);
            console.log("✅ Privy wallet already exists for this Hedera account");
            return res.json(existing);
        }

        // Call Privy API to create embedded wallet
        const authHeader = Buffer.from(`${process.env.PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`).toString("base64");

        const response = await fetch("https://api.privy.io/v1/wallets", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${authHeader}`,
                "privy-app-id": process.env.PRIVY_APP_ID,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chain_type: "ethereum" // Polygon is EVM-compatible
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("❌ Privy API Error:", error);
            return res.status(response.status).json({ error: "Privy API error", details: error });
        }

        const wallet = await response.json();

        console.log("✅ Privy Wallet Created:");
        console.log("   Wallet ID:", wallet.id);
        console.log("   Address:", wallet.address);
        console.log("   Linked to Hedera:", hashpackAddress);
        console.log("   → Hedera wallet controls this Privy wallet (stored in backend)");

        // Store mapping with Hedera as owner
        const walletData = {
            hederaWallet: hashpackAddress, // The OWNER
            privyWalletId: wallet.id,
            privyAddress: wallet.address,
            ownerId: wallet.id,
            chainType: wallet.chain_type,
            createdAt: wallet.created_at
        };

        userWallets.set(hashpackAddress, walletData);

        res.json(walletData);

    } catch (e) {
        console.error("❌ Privy Wallet Creation Error:", e);
        res.status(500).json({ error: e.message });
    }
});

//create user EOA (secure EVM key) - LEGACY, keeping for reference
app.post("/create-user", (req, res) => {

    // Generate a cryptographically secure private key
    const privateKey = generatePrivateKey();

    // Convert into an EOA wallet account
    const account = privateKeyToAccount(privateKey);

    console.log("\n👤 New Embedded Wallet Created:");
    console.log("   Address:", account.address);

    res.json({
        polygonEOA: account.address,   // polygon address
        privateKey                     // store encrypted!
    });
});

//deploy safe for user (using Privy wallet as owner)

app.post("/deploy-safe", async (req, res) => {
    try {
        const { privyAddress } = req.body;

        console.log("\n🚀 Deploying Safe with Privy wallet as owner:", privyAddress);

        // Find the user data for this Privy wallet
        let userData = null;
        for (const [hederaAddr, data] of userWallets.entries()) {
            if (data.privyAddress === privyAddress) {
                userData = data;
                break;
            }
        }

        if (!userData) {
            throw new Error("Privy wallet not found in our records");
        }

        console.log("   Found Privy user:", userData.privyUserId);
        console.log("   Exporting private key from Privy...");

        // Export the Privy wallet's private key using Privy API
        const authHeader = Buffer.from(`${process.env.PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`).toString("base64");

        const exportResponse = await fetch(`https://api.privy.io/v1/wallets/${userData.privyWalletId}/export`, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${authHeader}`,
                "privy-app-id": process.env.PRIVY_APP_ID,
                "Content-Type": "application/json"
            }
        });

        if (!exportResponse.ok) {
            const error = await exportResponse.text();
            console.error("❌ Privy Export Error:", error);
            throw new Error("Failed to export Privy wallet private key");
        }

        const exportData = await exportResponse.json();
        const privyPrivateKey = exportData.private_key;

        console.log("✅ Private key exported from Privy");
        console.log("   Creating wallet client with Privy wallet...");

        // Create wallet account from Privy's private key
        const privyAccount = privateKeyToAccount(privyPrivateKey);
        const privyWalletClient = createWalletClient({
            account: privyAccount,
            chain: polygon,
            transport: http(process.env.RPC_URL)
        });

        console.log("✅ Privy wallet client created");
        console.log("   Address:", privyAccount.address);
        console.log("   Deploying Safe with Privy wallet signing...");

        // Create RelayClient with Privy wallet (so Privy wallet becomes Safe owner)
        const relayClient = new RelayClient(
            process.env.POLYMARKET_RELAYER_URL,
            137,
            privyWalletClient,  // Privy wallet signs the deployment!
            builderConfig
        );

        console.log("🟡 Sending Safe deployment transaction (signed by Privy wallet)...");
        const resp = await relayClient.deploy();
        console.log("🟡 SAFE DEPLOY TX SENT");

        console.log("🟡 Waiting for deployment confirmation...");
        const result = await resp.wait();

        if (!result) {
            console.log("❌ Safe deploy failed or timed out");
            return res.status(500).json({ error: "Deployment timeout" });
        }

        console.log("✅ SAFE DEPLOYED SUCCESSFULLY:");
        console.log("   Safe Address:", result.proxyAddress);
        console.log("   Owner (Privy Wallet):", privyAddress);
        console.log("   Transaction Hash:", result.transactionHash);
        console.log("   View on PolygonScan:", `https://polygonscan.com/address/${result.proxyAddress}`);
        console.log("   🎉 Ownership chain: Hedera → Privy → Safe");

        res.json({
            safeAddress: result.proxyAddress,
            owner: privyAddress,
            txnHash: result.transactionHash
        });

    } catch (e) {
        console.error("❌ Deploy Error:", e);
        res.status(500).json({ error: e.message });
    }
});

//get safe balance

app.get("/safe/:safeAddress/balance", async (req, res) => {
    try {
        const { safeAddress } = req.params;

        const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

        const USDC_ABI = [
            {
                constant: true,
                inputs: [{ name: "_owner", type: "address" }],
                name: "balanceOf",
                outputs: [{ name: "balance", type: "uint256" }],
                type: "function"
            }
        ];

        const balanceWei = await publicClient.readContract({
            address: USDC,
            abi: USDC_ABI,
            functionName: "balanceOf",
            args: [safeAddress]
        });

        const balanceUSDC = Number(balanceWei) / 1e6;

        res.json({
            safe: safeAddress,
            balanceUSDC,
            balanceWei: balanceWei.toString()
        });
    } catch (err) {
        console.error("❌ Safe Balance Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});




//safe status

app.get("/safe/:safeAddress/status", async (req, res) => {
    try {
        const { safeAddress } = req.params;

        const code = await publicClient.getBytecode({ address: safeAddress });

        res.json({
            safe: safeAddress,
            deployed: code && code !== "0x",
            bytecode: code || "0x"
        });
    } catch (e) {
        console.error("❌ Safe Status Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});






// ------------------------------
app.listen(9000, () => {
    console.log("\n🔥 Backend running on :9000\n");
});
