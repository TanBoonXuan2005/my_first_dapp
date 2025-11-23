import { useState } from 'react';
import BlockchainService from '../services/BlockchainService';

function WalletConnect({ onConnect }) {
    const [wallet, setWallet] = useState({
        isConnected: false,
        address: null,
        balance: null,
        alias: null,
        symbol: null
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            const result = await BlockchainService.connect();
            setWallet(result);
            if (onConnect) {
                onConnect(result);
            }
        } catch (error) {
            console.error('Connection failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="wallet-connect">
            <header>
                <h1>One Chain Wallet</h1>
                <button
                    id="connect"
                    onClick={handleConnect}
                    disabled={isLoading || wallet.isConnected}
                    style={{
                        background: wallet.isConnected ? '#4CAF50' : undefined,
                        color: wallet.isConnected ? 'white' : undefined,
                        cursor: wallet.isConnected ? 'default' : 'pointer'
                    }}
                >
                    {isLoading ? (
                        <>
                            <span className="loader"></span>
                            Connecting...
                        </>
                    ) : wallet.isConnected ? (
                        wallet.alias || BlockchainService.formatAddress(wallet.address)
                    ) : (
                        'Connect Wallet'
                    )}
                </button>
            </header>

            <section id="wallet-info">
                <h2>Wallet Information</h2>
                <div id="wallet-content">
                    {wallet.isConnected ? (
                        <>
                            <div className="wallet-stat">
                                <strong>Alias:</strong> {wallet.alias || 'Unknown'}
                            </div>
                            <div className="wallet-stat">
                                <strong>Address:</strong> {wallet.address}
                            </div>
                            <div className="wallet-stat">
                                <strong>Balance:</strong> {wallet.balance} {wallet.symbol || 'OCT'}
                            </div>
                            <div className="wallet-stat">
                                <strong>Status:</strong> <span style={{ color: '#4CAF50' }}>Connected (Testnet)</span>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">Connect your wallet to view information</div>
                    )}
                </div>
            </section>

            <section id="transactions">
                <h2>Recent Transactions</h2>
                <ul id="transaction-list">
                    <li className="empty-state">No transactions yet</li>
                </ul>
            </section>
        </div>
    );
}

export default WalletConnect;
