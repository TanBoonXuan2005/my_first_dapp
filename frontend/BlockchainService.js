// BlockchainService.js
// Simulates interaction with OneChain Wallet and Testnet

const BlockchainService = {
    state: {
        isConnected: false,
        address: null,
        usdtBalance: 0,
        chainId: 'one-testnet'
    },

    /**
     * Simulates connecting to OneWallet
     * @returns {Promise<{address: string, balance: number}>}
     */
    async connect() {
        console.log("Connecting to OneWallet (Simulated)...");

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Real Testnet Address (from CLI)
        const mockAddress = "0x3e76203f34e6224140a93f80a8482d0d46f23802a94434b4d0d6fe667f80f0c5";

        // Real Testnet Balance (from CLI: 0.98 OCT)
        const mockBalance = 0.98;

        this.state.isConnected = true;
        this.state.address = mockAddress;
        this.state.usdtBalance = mockBalance;

        console.log(`Connected: ${mockAddress}`);
        return {
            address: mockAddress,
            balance: mockBalance,
            symbol: "OCT", // Updated to native token
            alias: "youthful-alexandrite" // Real CLI Alias
        };
    },

    /**
     * Returns the current wallet state
     */
    getWalletState() {
        return { ...this.state };
    },

    /**
     * Formats an address for display (e.g., 0x71...976F)
     * @param {string} address 
     */
    formatAddress(address) {
        if (!address) return "";
        return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
    }
};

// Export for use in game.js
window.BlockchainService = BlockchainService;
