const connectBtn = document.getElementById('connect');
const playBtn = document.getElementById('play-btn');
const walletContent = document.getElementById('wallet-content');
const homeScreen = document.getElementById('home-screen');

// Initially disable Play button
playBtn.disabled = true;
playBtn.style.opacity = '0.5';
playBtn.style.cursor = 'not-allowed';
playBtn.innerText = "Connect Wallet to Play";

// Handle Wallet Connection
connectBtn.addEventListener('click', async () => {
    if (!window.BlockchainService) {
        console.error("BlockchainService not found!");
        alert("Blockchain Service not loaded. Please refresh.");
        return;
    }

    if (window.BlockchainService.getWalletState().isConnected) return;

    // Loading State
    const originalText = connectBtn.innerText;
    connectBtn.innerHTML = '<span class="loader"></span> Connecting...';
    connectBtn.disabled = true;
    connectBtn.style.cursor = 'wait';

    try {
        console.log("Initiating connection...");
        const result = await window.BlockchainService.connect();
        console.log("Connection successful:", result);

        // Update Connect Button
        connectBtn.innerText = result.alias || window.BlockchainService.formatAddress(result.address);
        connectBtn.style.background = '#4CAF50'; // Green
        connectBtn.style.color = 'white';
        connectBtn.disabled = false;
        connectBtn.style.cursor = 'default';

        // Update Wallet Info Section
        walletContent.innerHTML = `
            <div class="wallet-stat">
                <strong>Alias:</strong> ${result.alias || 'Unknown'}
            </div>
            <div class="wallet-stat">
                <strong>Address:</strong> ${result.address}
            </div>
            <div class="wallet-stat">
                <strong>Balance:</strong> ${result.balance} ${result.symbol || 'OCT'}
            </div>
            <div class="wallet-stat">
                <strong>Status:</strong> <span style="color: #4CAF50">Connected (Testnet)</span>
            </div>
        `;

        // Enable Play Button
        playBtn.disabled = false;
        playBtn.style.opacity = '1';
        playBtn.style.cursor = 'pointer';
        playBtn.innerText = "PLAY GAME";

    } catch (error) {
        console.error("Connection failed:", error);
        connectBtn.innerText = "Try Again";
        connectBtn.style.background = '#f44336'; // Red
        connectBtn.disabled = false;
        connectBtn.style.cursor = 'pointer';
        alert("Connection failed. Check console for details.");
    }
});

// Handle Play Button
playBtn.addEventListener('click', () => {
    const walletState = window.BlockchainService.getWalletState();
    if (!walletState.isConnected) return;

    // Save wallet state to session storage for the game page
    sessionStorage.setItem('walletState', JSON.stringify(walletState));

    // Redirect to game page
    window.location.href = 'game.html';
});