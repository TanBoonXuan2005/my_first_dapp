import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BlockchainService from '../services/BlockchainService';

const WalletFlow = () => {
    const [step, setStep] = useState('connect'); // connect, ready
    const [walletState, setWalletState] = useState(null);
    const [loading, setLoading] = useState(false);
    const [ownedSBTs, setOwnedSBTs] = useState([]);
    const navigate = useNavigate();

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
    };

    const handleReset = async () => {
        if (!walletState?.address) return;
        if (confirm("Reset all game progress? This will lock all towers.")) {
            await BlockchainService.resetSBTs(walletState.address);
            await loadSBTs(walletState.address);
            alert("Progress reset!");
        }
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
            textAlign: 'center'
        }}>
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

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                            className="primary-btn"
                            onClick={enterGame}
                            style={{ background: '#4CAF50', flex: 2 }}
                        >
                            ENTER GAME
                        </button>
                        <button
                            className="primary-btn"
                            onClick={handleReset}
                            style={{ background: '#d32f2f', flex: 1, fontSize: '0.8rem' }}
                        >
                            RESET
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletFlow;
