// BlockchainService.js
// Simulates interaction with OneChain Wallet and Testnet

const BlockchainService = {
    state: {
        isConnected: false,
        address: null,
        balance: null,
        symbol: null,
        alias: null
    },

    // Real OneChain CLI Data (for testing/dev)
    // Replace these with actual SDK calls in production
    mockAddress: "0x3e76b03c4180f41e61731e935ec5f96e48a7f0c5",
    mockBalance: "0.98",

    connect: async () => {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Connected: ${BlockchainService.mockAddress}`);

        BlockchainService.state = {
            isConnected: true,
            address: BlockchainService.mockAddress,
            balance: BlockchainService.mockBalance,
            symbol: "OCT",
            alias: "youthful-alexandrite"
        };

        return BlockchainService.state;
    },

    disconnect: () => {
        BlockchainService.state = {
            isConnected: false,
            address: null,
            balance: null,
            symbol: null,
            alias: null
        };
    },

    getWalletState: () => {
        return { ...BlockchainService.state };
    },

    formatAddress: (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    // SBT System - Mock implementation (upgrade to real blockchain later)
    // Macrophage Tower Unlock SBT
    checkMacrophageUnlock: async (walletAddress) => {
        // Check localStorage for Macrophage SBT
        const key = `sbt_macrophage_${walletAddress}`;
        const hasUnlock = localStorage.getItem(key) === 'true';
        console.log(`[SBT] Checking Macrophage unlock for ${walletAddress}: ${hasUnlock}`);
        return hasUnlock;
    },

    mintMacrophageSBT: async (walletAddress) => {
        // Mint Macrophage SBT (mock - stores in localStorage)
        const key = `sbt_macrophage_${walletAddress}`;
        localStorage.setItem(key, 'true');
        console.log(`[SBT] ✅ Minted Macrophage SBT for ${walletAddress}`);
        return true;
    },

    // Placeholder for future randomness
    getRandomness: async () => {
        return Math.random(); // Not yet implemented with one::random
    }
};

export default BlockchainService;
