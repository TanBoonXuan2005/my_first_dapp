import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@onelabs/dapp-kit';
import BlockchainService from '../services/BlockchainService';
import GAME_CONFIG from '../gameConfig.js';
import './Store.css';

function Store() {
    const account = useCurrentAccount();
    const client = useSuiClient();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const [usdtBalance, setUsdtBalance] = useState(0);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [ownedTowers, setOwnedTowers] = useState({
        bcell: true, // Always owned
        macrophage: false,
        platelet: false,
        basophil: false,
        nkCell: false
    });

    useEffect(() => {
        const fetchData = async () => {
            if (account?.address) {
                // Fetch USDT Balance
                const balance = await BlockchainService.getUSDTBalance(client, account.address);
                setUsdtBalance(balance);

                // Fetch Owned SBTs
                const stats = await BlockchainService.getSBTStats(client, account.address);
                setOwnedTowers(prev => ({
                    ...prev,
                    macrophage: !!stats.macrophage,
                    platelet: !!stats.platelet,
                    basophil: !!stats.basophil,
                    nkCell: !!stats.nkCell
                }));
            }
        };
        fetchData();
    }, [account, client]);

    const towers = [
        {
            id: 'bcell',
            name: 'B-Cell',
            description: 'Produces antibodies to target enemies from a distance',
            image: '/assets/animation_frames/B-Cells/B-Cell_Idle(Neutral Form).png',
            damage: GAME_CONFIG.towers.bCell.damage,
            range: GAME_CONFIG.towers.bCell.range,
            speed: 'Medium', // Could derive this from attackSpeed if we wanted logic
            price: 0,
            unlocked: true,
            stats: { damage: 10, range: 150, speed: 'Medium' }
        },
        {
            id: 'macrophage',
            name: 'Macrophage',
            description: 'A powerful general-purpose defense unit.',
            image: '/assets/animation_frames/Macrophage/Macrophage_Idle(Neutral).png',
            damage: GAME_CONFIG.towers.macrophage.damage,
            range: GAME_CONFIG.towers.macrophage.range,
            speed: 'Slow',
            price: 5000,
            unlocked: ownedTowers.macrophage
        },
        {
            id: 'platelet',
            name: 'Platelet',
            description: 'Support unit that slows down enemies.',
            image: '/assets/animation_frames/Platelet/Platelet_Idle.png',
            damage: GAME_CONFIG.towers.platelet.damage,
            range: GAME_CONFIG.towers.platelet.range,
            speed: 'Fast',
            price: 6000,
            unlocked: ownedTowers.platelet
        },
        {
            id: 'basophil',
            name: 'Basophil',
            description: 'Heavy bomber that deals area damage.',
            image: '/assets/animation_frames/Basophil/Basophil_Idle.png',
            damage: GAME_CONFIG.towers.basophil.damage,
            range: GAME_CONFIG.towers.basophil.range,
            speed: 'Very Slow',
            price: 8000,
            unlocked: ownedTowers.basophil
        },
        {
            id: 'nkCell',
            name: 'NK Cell',
            description: 'High damage sniper unit that targets strong enemies',
            image: '/assets/animation_frames/NK-Cell/NK-Cell_Aim_Down.png',
            damage: GAME_CONFIG.towers.nkCell.damage,
            range: GAME_CONFIG.towers.nkCell.range,
            speed: 'Slow',
            price: 10000,
            unlocked: ownedTowers.nkCell
        }
    ];

    const [ownedMagicCards, setOwnedMagicCards] = useState({
        heal: 0,
        nuke: 0,
        freeze: 0,
        poison: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            if (account?.address) {
                // Fetch USDT Balance
                const balance = await BlockchainService.getUSDTBalance(client, account.address);
                setUsdtBalance(balance);

                // Fetch Owned SBTs
                const stats = await BlockchainService.getSBTStats(client, account.address);
                setOwnedTowers(prev => ({
                    ...prev,
                    macrophage: !!stats.macrophage,
                    platelet: !!stats.platelet,
                    basophil: !!stats.basophil,
                    nkCell: !!stats.nkCell
                }));

                // Fetch Magic Card Inventory
                const inventory = await BlockchainService.getMagicCardInventory(client, account.address);
                if (inventory) {
                    setOwnedMagicCards({
                        heal: parseInt(inventory.counts.heal),
                        nuke: parseInt(inventory.counts.nuke),
                        freeze: parseInt(inventory.counts.freeze),
                        poison: parseInt(inventory.counts.poison)
                    });
                }
            }
        };
        fetchData();
    }, [account, client]);

    const magicCards = [
        {
            id: 'heal',
            name: 'Healing Pulse',
            description: 'Restores 50 HP to your base instantly.',
            image: '/assets/animation_frames/Heal/Heal.png',
            cooldown: 60,
            price: 500,
            count: ownedMagicCards.heal
        },
        {
            id: 'nuke',
            name: 'Cytokine Storm',
            description: 'Deals 500 damage to ALL enemies on screen.',
            image: '/assets/animation_frames/Nuke/Nuke.png',
            cooldown: 120,
            price: 1000,
            count: ownedMagicCards.nuke
        },
        {
            id: 'freeze',
            name: 'Cryo Stasis',
            description: 'Freezes all enemies for 5 seconds.',
            image: '/assets/animation_frames/Freeze/Freeze.png',
            cooldown: 90,
            price: 750,
            count: ownedMagicCards.freeze
        },
        {
            id: 'poison',
            name: 'Viral Toxin',
            description: 'Deals 50 damage per second for 10 seconds.',
            image: '/assets/animation_frames/Poison/Poison.png',
            cooldown: 60,
            price: 600,
            count: ownedMagicCards.poison
        }
    ];

    const handlePurchase = async (item) => {
        if (!account) {
            alert('Please connect your wallet first!');
            return;
        }

        if (isPurchasing) return;

        // Magic Card Logic
        if (item.cooldown !== undefined) {
            if (usdtBalance < item.price) {
                alert(`Insufficient USDT! You need ${item.price} USDT.`);
                return;
            }

            const confirmed = confirm(`Purchase ${item.name} for ${item.price} USDT?`);
            if (!confirmed) return;

            setIsPurchasing(true);
            const success = await BlockchainService.buyMagicCard(client, account.address, item.id, item.price, signAndExecute);
            setIsPurchasing(false);

            if (success) {
                alert(`Successfully purchased ${item.name}!`);
                // Refresh data
                const balance = await BlockchainService.getUSDTBalance(client, account.address);
                setUsdtBalance(balance);
                const inventory = await BlockchainService.getMagicCardInventory(client, account.address);
                if (inventory) {
                    setOwnedMagicCards({
                        heal: parseInt(inventory.counts.heal),
                        nuke: parseInt(inventory.counts.nuke),
                        freeze: parseInt(inventory.counts.freeze),
                        poison: parseInt(inventory.counts.poison)
                    });
                }
            } else {
                alert("Purchase failed. Check console for details.");
            }
        } else {
            // Tower Logic (USDT Purchase)
            if (item.unlocked) {
                alert('You already own this item!');
                return;
            }

            if (usdtBalance < item.price) {
                alert(`Insufficient USDT! You need ${item.price} USDT.`);
                return;
            }

            setIsPurchasing(true);
            const success = await BlockchainService.purchaseCell(client, account.address, item.id, item.price, signAndExecute);
            setIsPurchasing(false);

            if (success) {
                alert(`Successfully purchased ${item.name}!`);
                // Refresh data
                const balance = await BlockchainService.getUSDTBalance(client, account.address);
                setUsdtBalance(balance);

                const stats = await BlockchainService.getSBTStats(client, account.address);
                setOwnedTowers(prev => ({
                    ...prev,
                    macrophage: !!stats.macrophage,
                    platelet: !!stats.platelet,
                    basophil: !!stats.basophil,
                    nkCell: !!stats.nkCell
                }));
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
                            <span className="atp-icon">💲</span>
                            <div className="balance-info">
                                <span className="balance-label">USDT Balance</span>
                                <span className="atp-amount">{usdtBalance.toLocaleString()} USDT</span>
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
                                                <div className="stat-bar" style={{ width: `${Math.min((tower.damage / 100) * 100, 100)}%` }}></div>
                                            </div>
                                            <span className="stat-value">{tower.damage}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Range</span>
                                            <div className="stat-bar-container">
                                                <div className="stat-bar" style={{ width: `${Math.min((tower.range / 500) * 100, 100)}%` }}></div>
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
                                            disabled={isPurchasing}
                                        >
                                            <span className="price-tag">{tower.price.toLocaleString()} USDT</span>
                                            <span className="action-text">{isPurchasing ? 'Buying...' : 'Purchase'}</span>
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
                            className={`tower-card glass`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="card-content">
                                <div className="owned-badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe' }}>
                                    <span className="check-icon">📦</span> Owned: {card.count}
                                </div>

                                <div className="tower-visual">
                                    <div className="visual-glow" style={{ background: `radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)` }}></div>
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
                                    <button
                                        className="btn btn-primary full-width"
                                        onClick={() => handlePurchase(card)}
                                        disabled={isPurchasing}
                                    >
                                        <span className="price-tag">{card.price} USDT</span>
                                        <span className="action-text">{isPurchasing ? 'Buying...' : 'Purchase'}</span>
                                    </button>
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
