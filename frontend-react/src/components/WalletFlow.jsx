import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton, useCurrentAccount, useDisconnectWallet } from '@onelabs/dapp-kit';
import BlockchainService from '../services/BlockchainService';

const WalletFlow = () => {
    const [step, setStep] = useState('connect'); // connect, ready
    const [ownedSBTs, setOwnedSBTs] = useState([]);
    const navigate = useNavigate();

    const account = useCurrentAccount();
    const { mutate: disconnect } = useDisconnectWallet();

    // Effect to handle connection state changes
    useEffect(() => {
        if (account) {
            setStep('ready');
            loadSBTs(account.address);
        } else {
            setStep('connect');
            setOwnedSBTs([]);
        }
    }, [account]);

    // Developer hotkey: Cmd+Z (Mac) or Ctrl+Z (Windows) to reset
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Cmd+Z on Mac or Ctrl+Z on Windows
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                if (account?.address) {
                    handleReset();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [account]);

    const loadSBTs = async (address) => {
        const sbts = await BlockchainService.getOwnedSBTs(address);
        setOwnedSBTs(sbts);
        console.log('[WalletFlow] Loaded SBTs:', sbts);
    };

    const handleReset = async () => {
        if (!account?.address) return;

        console.log('🔄 [DEV RESET] Starting...');
        console.log('📍 [DEV RESET] Wallet:', account.address);

        await BlockchainService.resetSBTs(account.address);
        console.log('✅ [DEV RESET] LocalStorage cleared');

        // Reload SBTs to update the UI
        await loadSBTs(account.address);
        console.log('✅ [DEV RESET] Complete - Check UI above, should show "None yet"');
    };

    const handleDisconnect = () => {
        disconnect();
    };

    const enterGame = () => {
        // Store wallet state and navigate
        // We don't need to store full state in session anymore as provider handles it, 
        // but game might expect it. Let's keep a minimal version or rely on provider in game.
        // For now, just navigate.
        navigate('/game');
    };

    return (
        <div className="wallet-flow-container" style={{
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid #333',
            maxWidth: '400px',
            margin: '2rem auto',
            color: 'white',
            textAlign: 'center',
            position: 'relative'
        }}>
            <h3>OneChain Defense</h3>

            {step === 'connect' && (
                <div>
                    <p>Connect your OneChain Wallet to start.</p>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                        <ConnectButton />
                    </div>
                </div>
            )}

            {step === 'ready' && (
                <div>
                    <p>✅ Connected</p>
                    <p style={{ fontSize: '0.9rem', color: '#aaa' }}>{BlockchainService.formatAddress(account?.address)}</p>

                    <div style={{ margin: '1rem 0', padding: '1rem', background: '#222', borderRadius: '8px', textAlign: 'left' }}>
                        <strong>Your Soulbound Tokens:</strong>
                        {ownedSBTs.length === 0 ? (
                            <p style={{ color: '#666', fontStyle: 'italic' }}>None yet. Play to unlock!</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
                                {ownedSBTs.map(sbt => (
                                    <li key={sbt} style={{ color: '#4CAF50' }}>🔰 {sbt.charAt(0).toUpperCase() + sbt.slice(1)} Unlocked</li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                            className="primary-btn"
                            onClick={enterGame}
                            style={{ background: '#4CAF50' }}
                        >
                            ENTER GAME
                        </button>
                        {/* ConnectButton handles disconnect too, but we can keep a custom button if we want specific styling, 
                            or just let the ConnectButton handle it. The SDK's ConnectButton usually turns into a profile dropdown.
                            Let's keep our custom disconnect for clarity if needed, but calling disconnect() works. 
                        */}
                        <button
                            className="primary-btn"
                            onClick={handleDisconnect}
                            style={{ background: '#757575', fontSize: '0.85rem' }}
                            title="Disconnect wallet and return to connect screen"
                        >
                            DISCONNECT
                        </button>
                        <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                            💡 Dev: Cmd+Z (Mac) / Ctrl+Z (Win) resets progress (check console)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletFlow;
