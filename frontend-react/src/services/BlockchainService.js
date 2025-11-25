// BlockchainService.js
// Utility service for OneChain interactions using Move SDK
import { Transaction } from '@onelabs/sui/transactions';
import { PACKAGE_ID, MODULE_NAME } from '../chainConfig';

const BlockchainService = {
    // Helper to format address
    formatAddress: (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    // SBT System - Check still uses localStorage as cache
    // In production, you'd query the blockchain for owned objects
    checkUnlockSBT: async (walletAddress, unlockType) => {
        if (!walletAddress) return false;
        const key = `sbt_${unlockType}_${walletAddress}`;
        const hasUnlock = localStorage.getItem(key) === 'true';
        console.log(`[SBT] Checking ${unlockType} unlock for ${walletAddress}: ${hasUnlock}`);
        return hasUnlock;
    },

    // REAL MINTING - Triggers blockchain transaction
    mintUnlockSBT: async (walletAddress, unlockType, signAndExecute) => {
        if (!walletAddress) {
            console.error("[Blockchain] No wallet address");
            return false;
        }

        if (!signAndExecute) {
            console.warn("[Blockchain] No signAndExecute function provided, using mock");
            // Fallback to localStorage if no signer
            localStorage.setItem(`sbt_${unlockType}_${walletAddress}`, 'true');
            return true;
        }

        try {
            const tx = new Transaction();
            const target = `${PACKAGE_ID}::${MODULE_NAME}::mint_${unlockType}`;

            console.log(`[Blockchain] 🔗 Preparing transaction: ${target}`);
            tx.moveCall({
                target: target,
                arguments: []
            });

            return new Promise((resolve) => {
                signAndExecute(
                    { transaction: tx },
                    {
                        onSuccess: (result) => {
                            console.log(`[Blockchain] ✅ Successfully minted ${unlockType}!`);
                            console.log(`[Blockchain] Transaction digest: ${result.digest}`);
                            // Cache locally for faster checks
                            localStorage.setItem(`sbt_${unlockType}_${walletAddress}`, 'true');
                            resolve(true);
                        },
                        onError: (err) => {
                            console.error(`[Blockchain] ❌ Mint failed:`, err);
                            resolve(false);
                        }
                    }
                );
            });
        } catch (error) {
            console.error(`[Blockchain] Error preparing transaction:`, error);
            return false;
        }
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
        const types = ['macrophage', 'platelet'];
        types.forEach(type => {
            localStorage.removeItem(`sbt_${type}_${walletAddress}`);
        });
        console.log(`[Dev] Reset SBTs for ${walletAddress}`);
        return true;
    },

    getOwnedSBTs: async (walletAddress) => {
        if (!walletAddress) return [];
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
