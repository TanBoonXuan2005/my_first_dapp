// BlockchainService.js
// Utility service for OneChain interactions using Move SDK
// Note: Connection state is now managed by @onelabs/dapp-kit hooks in React components

const BlockchainService = {
    // Helper to format address
    formatAddress: (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    // SBT System - Mock implementation for now (using LocalStorage)
    // In a real Move implementation, this would query a Move Object or Event

    checkUnlockSBT: async (walletAddress, unlockType) => {
        if (!walletAddress) return false;
        const key = `sbt_${unlockType}_${walletAddress}`;
        const hasUnlock = localStorage.getItem(key) === 'true';
        console.log(`[SBT] Checking ${unlockType} unlock for ${walletAddress}: ${hasUnlock}`);
        return hasUnlock;
    },

    mintUnlockSBT: async (walletAddress, unlockType) => {
        if (!walletAddress) return false;
        const key = `sbt_${unlockType}_${walletAddress}`;
        localStorage.setItem(key, 'true');
        console.log(`[SBT] ✅ Minted ${unlockType} SBT for ${walletAddress}`);
        return true;
    },

    checkMacrophageUnlock: async (walletAddress) => {
        return BlockchainService.checkUnlockSBT(walletAddress, 'macrophage');
    },

    mintMacrophageSBT: async (walletAddress) => {
        return BlockchainService.mintUnlockSBT(walletAddress, 'macrophage');
    },

    // Placeholder for future randomness
    getRandomness: async () => {
        const randomValue = Math.random();
        console.log(`[Randomness] Fetched from chain: ${randomValue}`);
        return randomValue;
    },

    // Dev Tools
    resetSBTs: async (walletAddress) => {
        if (!walletAddress) return;
        const types = ['macrophage', 'platelet', 'nkCell'];
        types.forEach(type => {
            localStorage.removeItem(`sbt_${type}_${walletAddress}`);
        });
        console.log(`[Dev] Reset SBTs for ${walletAddress}`);
        return true;
    },

    getOwnedSBTs: async (walletAddress) => {
        if (!walletAddress) return [];
        const types = ['macrophage', 'platelet', 'nkCell'];
        const owned = [];
        for (const type of types) {
            const has = await BlockchainService.checkUnlockSBT(walletAddress, type);
            if (has) owned.push(type);
        }
        return owned;
    }
};

export default BlockchainService;
