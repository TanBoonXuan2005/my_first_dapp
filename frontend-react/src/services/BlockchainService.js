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

    // Generic check for any unlock type
    checkUnlockSBT: async (walletAddress, unlockType) => {
        const key = `sbt_${unlockType}_${walletAddress}`;
        const hasUnlock = localStorage.getItem(key) === 'true';
        console.log(`[SBT] Checking ${unlockType} unlock for ${walletAddress}: ${hasUnlock}`);
        return hasUnlock;
    },

    // Generic mint for any unlock type
    mintUnlockSBT: async (walletAddress, unlockType) => {
        const key = `sbt_${unlockType}_${walletAddress}`;
        localStorage.setItem(key, 'true');
        console.log(`[SBT] ✅ Minted ${unlockType} SBT for ${walletAddress}`);
        return true;
    },

    // Legacy wrapper for Macrophage (to keep existing calls working or refactor them)
    checkMacrophageUnlock: async (walletAddress) => {
        return BlockchainService.checkUnlockSBT(walletAddress, 'macrophage');
    },

    mintMacrophageSBT: async (walletAddress) => {
        return BlockchainService.mintUnlockSBT(walletAddress, 'macrophage');
    },

    // Placeholder for future randomness
    getRandomness: async () => {
        // Simulate fetching randomness from chain (one::random)
        // In reality, this would be an async call to the chain
        const randomValue = Math.random();
        console.log(`[Randomness] Fetched from chain: ${randomValue}`);
        return randomValue;
    },

    // Dev Tools
    resetSBTs: async (walletAddress) => {
        const types = ['macrophage', 'platelet'];
        types.forEach(type => {
            localStorage.removeItem(`sbt_${type}_${walletAddress}`);
        });
        console.log(`[Dev] Reset SBTs for ${walletAddress}`);
        return true;
    },

    getOwnedSBTs: async (walletAddress) => {
        const types = ['macrophage', 'platelet'];
        const owned = [];
        for (const type of types) {
            const has = await BlockchainService.checkUnlockSBT(walletAddress, type);
            if (has) owned.push(type);
        }
        return owned;
    }
};

export default BlockchainService;
