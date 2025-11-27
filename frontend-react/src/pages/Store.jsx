import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@onelabs/dapp-kit';
import BlockchainService from '../services/BlockchainService';
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

    const [ownedMagicCards, setOwnedMagicCards] = useState({
        heal: false,
        nuke: false,
        freeze: false,
        poison: false
    });

    const magicCards = [
        {
            id: 'heal',
            name: 'Healing Pulse',
            description: 'Restores 50 HP to your base instantly.',
            image: '/assets/animation_frames/Heal/Heal.png',
            cooldown: 60,
            price: 0,
            unlocked: ownedMagicCards.heal
        },
        {
            id: 'nuke',
            name: 'Cytokine Storm',
            description: 'Deals 500 damage to ALL enemies on screen.',
            image: '/assets/animation_frames/Nuke/Nuke.png',
            cooldown: 120,
            price: 0,
            unlocked: ownedMagicCards.nuke
        },
        {
            id: 'freeze',
            name: 'Cryo Stasis',
            description: 'Freezes all enemies for 5 seconds.',
            image: '/assets/animation_frames/Freeze/Freeze.png',
            cooldown: 90,
            price: 0,
            unlocked: ownedMagicCards.freeze
        },
        {
            id: 'poison',
            name: 'Viral Toxin',
            description: 'Deals 50 damage per second for 10 seconds.',
            image: '/assets/animation_frames/Poison/Poison.png',
            cooldown: 60,
            price: 0,
            unlocked: ownedMagicCards.poison
        }
    ];

    const { mutate: signAndExecute } = useSignAndExecuteTransaction();

    const handlePurchase = async (item) => {
        if (!account) {
            alert('Please connect your wallet first!');
            return;
        }

        if (item.unlocked) {
            alert('You already own this item!');
            return;
        }

        // Check if it's a Magic Card (has cooldown) or Tower
        if (item.cooldown !== undefined) {
            // Magic Card Claim Logic
            const confirmed = confirm(`Claim ${item.name} for FREE?`);
            if (!confirmed) return;

            const success = await BlockchainService.purchaseMagicCard(account.address, item.id, 0, signAndExecute);
            if (success) {
                setOwnedMagicCards(prev => ({ ...prev, [item.id]: true }));
                alert(`Successfully claimed ${item.name}!`);
            } else {
                alert("Claim failed. Check console for details.");
            }
        } else {
            // Tower Purchase Logic (Placeholder for now, or use mintUnlockSBT if ready)
            // For now, let's keep the "Coming soon" for towers if they cost ATP, 
            // but if we want to enable them via SBT minting:
            // alert(`Purchase ${item.name} for ${item.price} ATP - Coming soon!`);
            const confirmed = confirm(`Unlock ${item.name}? (Dev: Free Mint)`);
            if (!confirmed) return;

            const success = await BlockchainService.mintUnlockSBT(account.address, item.id, signAndExecute);
            if (success) {
                setOwnedTowers(prev => ({ ...prev, [item.id]: true }));
                alert(`Successfully unlocked ${item.name}!`);
            }
        }
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

                <div className="store-header fade-in" style={{ marginTop: '60px' }}>
                    <h2>Magic Cards</h2>
                    <p>Powerful one-time use abilities to turn the tide of battle.</p>
                </div>

                <div className="towers-grid">
                    {magicCards.map((card, index) => (
                        <div
                            key={card.id}
                            className={`tower-card glass ${card.unlocked ? 'owned' : ''}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="card-content">
                                {card.unlocked && (
                                    <div className="owned-badge">
                                        <span className="check-icon">✓</span> Owned
                                    </div>
                                )}

                                <div className="tower-visual">
                                    <div className="visual-glow" style={{ background: `radial-gradient(circle, ${card.unlocked ? 'rgba(56, 189, 248, 0.2)' : 'rgba(148, 163, 184, 0.1)'} 0%, transparent 70%)` }}></div>
                                    <img
                                        src={card.image}
                                        alt={card.name}
                                        className="tower-image"
                                        style={{ transform: 'scale(0.8)' }}
                                    />
                                </div>

                                <div className="tower-info">
                                    <h3 className="tower-name">{card.name}</h3>
                                    <p className="tower-description">{card.description}</p>

                                    <div className="tower-stats">
                                        <div className="stat-item">
                                            <span className="stat-label">Cooldown</span>
                                            <div className="stat-bar-container">
                                                <div className="stat-bar" style={{ width: `${(120 - card.cooldown) / 120 * 100}%`, background: '#a855f7' }}></div>
                                            </div>
                                            <span className="stat-value">{card.cooldown}s</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    {card.unlocked ? (
                                        <button className="btn btn-secondary full-width" disabled>
                                            In Inventory
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-primary full-width"
                                            onClick={() => handlePurchase(card)}
                                        >
                                            <span className="price-tag">Free</span>
                                            <span className="action-text">Claim</span>
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
