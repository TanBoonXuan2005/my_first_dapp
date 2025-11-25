import { useState } from 'react';
import { useCurrentAccount } from '@onelabs/dapp-kit';
import './Store.css';

function Store() {
    const account = useCurrentAccount();
    const [ownedTowers, setOwnedTowers] = useState({
        bcell: true, // Always owned
        macrophage: false,
        platelet: false,
        basophil: false
    });

    const towers = [
        {
            id: 'bcell',
            name: 'B-Cell',
            description: 'Produces antibodies to target enemies from a distance',
            image: '/assets/animation_frames/B-Cells/B-Cell_Idle(Neutral Form).png',
            damage: 10,
            range: 150,
            speed: 'Medium',
            price: 0,
            unlocked: true
        },
        {
            id: 'macrophage',
            name: 'Macrophage',
            description: 'Engulfs nearby enemies with powerful area attacks',
            image: '/assets/animation_frames/Macrophage/Macrophage_Idle(Neutral).png',
            damage: 15,
            range: 120,
            speed: 'Slow',
            price: 100,
            unlocked: ownedTowers.macrophage
        },
        {
            id: 'platelet',
            name: 'Platelet',
            description: 'Deploys fibrin nets to slow down enemies',
            image: '/assets/animation_frames/Platelet/Platelet_Idle.png',
            damage: 8,
            range: 180,
            speed: 'Fast',
            price: 150,
            unlocked: ownedTowers.platelet
        },
        {
            id: 'basophil',
            name: 'Basophil',
            description: 'Releases explosive histamine bombs for area damage',
            image: '/assets/animation_frames/Basophil/Basophil_Idle.png',
            damage: 25,
            range: 200,
            speed: 'Very Slow',
            price: 200,
            unlocked: ownedTowers.basophil
        }
    ];

    const handlePurchase = (tower) => {
        if (!account) {
            alert('Please connect your wallet first!');
            return;
        }

        if (tower.unlocked) {
            alert('You already own this tower!');
            return;
        }

        // TODO: Implement blockchain purchase
        alert(`Purchase ${tower.name} for ${tower.price} ATP - Coming soon!`);
    };

    return (
        <div className="store-page gradient-bg">
            <div className="container">
                <div className="store-header fade-in">
                    <h1>Defense Systems Store</h1>
                    <p>Acquire advanced immune cells and upgrades to strengthen your defenses.</p>
                    {account ? (
                        <div className="atp-balance glass-strong">
                            <span className="atp-icon">⚡</span>
                            <div className="balance-info">
                                <span className="balance-label">Current Balance</span>
                                <span className="atp-amount">500 ATP</span>
                            </div>
                        </div>
                    ) : (
                        <div className="connect-prompt glass">
                            <p>Connect wallet to view your balance</p>
                        </div>
                    )}
                </div>

                <div className="towers-grid">
                    {towers.map((tower, index) => (
                        <div
                            key={tower.id}
                            className={`tower-card glass ${tower.unlocked ? 'owned' : ''}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="card-content">
                                {tower.unlocked && (
                                    <div className="owned-badge">
                                        <span className="check-icon">✓</span> Owned
                                    </div>
                                )}

                                <div className="tower-visual">
                                    <div className="visual-glow" style={{ background: `radial-gradient(circle, ${tower.unlocked ? 'rgba(56, 189, 248, 0.2)' : 'rgba(148, 163, 184, 0.1)'} 0%, transparent 70%)` }}></div>
                                    <img
                                        src={tower.image}
                                        alt={tower.name}
                                        className="tower-image"
                                    />
                                </div>

                                <div className="tower-info">
                                    <h3 className="tower-name">{tower.name}</h3>
                                    <p className="tower-description">{tower.description}</p>

                                    <div className="tower-stats">
                                        <div className="stat-item">
                                            <span className="stat-label">Damage</span>
                                            <div className="stat-bar-container">
                                                <div className="stat-bar" style={{ width: `${(tower.damage / 30) * 100}%` }}></div>
                                            </div>
                                            <span className="stat-value">{tower.damage}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Range</span>
                                            <div className="stat-bar-container">
                                                <div className="stat-bar" style={{ width: `${(tower.range / 250) * 100}%` }}></div>
                                            </div>
                                            <span className="stat-value">{tower.range}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Speed</span>
                                            <span className="stat-text">{tower.speed}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    {tower.price === 0 ? (
                                        <button className="btn btn-disabled full-width">
                                            Default Unit
                                        </button>
                                    ) : tower.unlocked ? (
                                        <button className="btn btn-secondary full-width" disabled>
                                            In Inventory
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-primary full-width"
                                            onClick={() => handlePurchase(tower)}
                                        >
                                            <span className="price-tag">{tower.price} ATP</span>
                                            <span className="action-text">Purchase</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Store;
