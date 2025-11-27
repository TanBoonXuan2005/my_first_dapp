import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount, useSignAndExecuteTransaction, ConnectButton } from '@onelabs/dapp-kit';
import BlockchainService from '../services/BlockchainService';
import './Home.css';

function Home() {
    const navigate = useNavigate();
    const account = useCurrentAccount();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const [hasLicense, setHasLicense] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkLicense = async () => {
            if (account?.address) {
                setLoading(true);
                const has = await BlockchainService.checkDefenderLicense(account.address);
                setHasLicense(has);
                setLoading(false);
            } else {
                setHasLicense(false);
            }
        };
        checkLicense();
    }, [account]);

    const handlePlayClick = () => {
        if (account && hasLicense) {
            navigate('/game');
        }
    };

    const handleMintLicense = async () => {
        if (!account) return;
        setLoading(true);
        const success = await BlockchainService.mintDefenderLicense(account.address, signAndExecute);
        if (success) {
            setHasLicense(true);
        }
        setLoading(false);
    };

    return (
        <div className="home-page gradient-bg">
            <div className="home-container">
                <div className="hero-section">
                    <div className="hero-content slide-in-left">
                        <h1 className="hero-title">
                            Protect the Host<br />
                            <span className="text-gradient">On-Chain</span>
                        </h1>
                        <p className="hero-subtitle">
                            Deploy immune cells, fight viral invasions, and mint your<br />
                            achievements as Soulbound Tokens.
                        </p>

                        {account ? (
                            <>
                                {loading ? (
                                    <button className="btn btn-secondary btn-large" disabled>
                                        ⏳ Checking License...
                                    </button>
                                ) : hasLicense ? (
                                    <button className="btn btn-primary btn-large" onClick={handlePlayClick}>
                                        🎮 Start Playing
                                    </button>
                                ) : (
                                    <div className="license-section">
                                        <p className="license-warning">⚠️ Defender License Required</p>
                                        <button className="btn btn-accent btn-large" onClick={handleMintLicense}>
                                            📝 Mint License & Enter
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="connect-section">
                                <div className="connect-prompt-box glass">
                                    <div className="lock-icon">🔒</div>
                                    <h3>Connect Wallet First</h3>
                                    <p className="verify-text">Verify your Defender License to enter.</p>
                                    <ConnectButton />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hero-image slide-in-right">
                        <img
                            src="/assets/animation_frames/B-Cells/B-Cell_Attack(Charging Form).png"
                            alt="B-Cell Defender"
                            className="hero-character-img"
                        />
                    </div>
                </div>

                <div className="features-section fade-in">
                    <h2 className="section-title">Game Features</h2>
                    <div className="features-grid">
                        <div className="feature-card glass">
                            <div className="feature-icon">⚔️</div>
                            <h3>Strategic Defense</h3>
                            <p>Deploy unique immune cell towers to defend against viral invasions</p>
                        </div>
                        <div className="feature-card glass">
                            <div className="feature-icon">🔗</div>
                            <h3>Blockchain Powered</h3>
                            <p>Unlock towers and track progress with Soulbound Tokens</p>
                        </div>
                        <div className="feature-card glass">
                            <div className="feature-icon">🏆</div>
                            <h3>Competitive Play</h3>
                            <p>Compete for the highest wave and earn exclusive rewards</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
