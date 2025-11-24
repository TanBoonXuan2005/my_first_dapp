import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BlockchainService from '../services/BlockchainService';

const WalletFlow = () => {
    const [step, setStep] = useState('connect'); // connect, ready
    const [walletState, setWalletState] = useState(null);
    const [loading, setLoading] = useState(false);
    const [ownedSBTs, setOwnedSBTs] = useState([]);
    const [notification, setNotification] = useState(null); // For showing messages
    const navigate = useNavigate();

    // Check for existing wallet state on mount
    useEffect(() => {
        const savedWalletState = sessionStorage.getItem('walletState');
        if (savedWalletState) {
            try {
                const parsed = JSON.parse(savedWalletState);
                setWalletState(parsed);
                loadSBTs(parsed.address);
                setStep('ready');
            } catch (e) {
                console.error("Failed to parse saved wallet state", e);
            }
        }
    }, []);

    // Developer hotkey: Cmd+Z (Mac) or Ctrl+Z (Windows) to reset
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Cmd+Z on Mac or Ctrl+Z on Windows
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                if (walletState?.address) {
                    handleReset();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [walletState]); // Re-attach when walletState changes

    const handleConnect = async () => {
        setLoading(true);
        try {
            const state = await BlockchainService.connect();
            setWalletState(state);
            await loadSBTs(state.address);
            setStep('ready');
        } catch (error) {
            console.error("Connection failed", error);
        } finally {
            setLoading(false);
        }
    };

    const loadSBTs = async (address) => {
        const sbts = await BlockchainService.getOwnedSBTs(address);
        setOwnedSBTs(sbts);
        console.log('[WalletFlow] Loaded SBTs:', sbts);
    };

    const handleReset = async () => {
        if (!walletState?.address) return;

        console.log('🔄 [DEV RESET] Starting...');
        console.log('📍 [DEV RESET] Wallet:', walletState.address);

        await BlockchainService.resetSBTs(walletState.address);
        console.log('✅ [DEV RESET] LocalStorage cleared');

        // Reload SBTs to update the UI
        await loadSBTs(walletState.address);
        console.log('✅ [DEV RESET] Complete - Check UI above, should show "None yet"');
    };

    const handleDisconnect = () => {
        sessionStorage.removeItem('walletState');
        setWalletState(null);
        setOwnedSBTs([]);
        setStep('connect');
    };

    const enterGame = () => {
        // Store wallet state and navigate
        sessionStorage.setItem('walletState', JSON.stringify(walletState));
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
            {/* Notification Banner */}
            {notification && (
                <div style={{
                    position: 'absolute',
                    top: '-60px',
                    left: '0',
                    right: '0',
                    background: notification.type === 'success' ? '#4CAF50' : '#f44336',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    {notification.message}
                </div>
            )}

            <h3>OneChain Defense</h3>

            {step === 'connect' && (
                <div>
                    <p>Connect your OneChain Wallet to start.</p>
                    <button
                        className="primary-btn"
                        onClick={handleConnect}
                        disabled={loading}
                    >
                        {loading ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                </div>
            )}

            {step === 'ready' && (
                <div>
                    <p>✅ Connected</p>
                    <p style={{ fontSize: '0.9rem', color: '#aaa' }}>{BlockchainService.formatAddress(walletState?.address)}</p>

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
