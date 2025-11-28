import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@onelabs/dapp-kit';
import { useNavigate } from 'react-router-dom';
import BlockchainService from '../services/BlockchainService';
import './Dashboard.css';


function Dashboard() {
    const account = useCurrentAccount();
    const client = useSuiClient();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const navigate = useNavigate();
    const [usdtBalance, setUsdtBalance] = useState(0);





    const handleMintUSDT = async () => {
        if (!account?.address) return;
        const success = await BlockchainService.mintUSDT(client, account.address, 10000, signAndExecute);
        if (success) {
            alert("Successfully minted 10,000 USDT!");
            // Refresh data logic is now centralized in useEffect, but for manual refresh:
            const balance = await BlockchainService.getUSDTBalance(client, account.address);
            setUsdtBalance(balance);
        }
    };

    const [inventory, setInventory] = useState([
        { id: 'bcell', name: 'B-Cell', image: '/assets/animation_frames/B-Cells/B-Cell_Idle(Neutral Form).png', unlocked: true, type: 'Ranged', damage: 15 },
        { id: 'macrophage', name: 'Macrophage', image: '/assets/animation_frames/Macrophage/Macrophage_Idle(Neutral).png', unlocked: false, type: 'Melee', damage: 25 },
        { id: 'platelet', name: 'Platelet', image: '/assets/animation_frames/Platelet/Platelet_Idle.png', unlocked: false, type: 'Support', damage: 5 },
        { id: 'basophil', name: 'Basophil', image: '/assets/animation_frames/Basophil/Basophil_Idle.png', unlocked: false, type: 'AoE', damage: 10 },
        { id: 'nkCell', name: 'NK Cell', image: '/assets/animation_frames/NK-Cell/NK-Cell_Aim_Side.png', unlocked: false, type: 'Single', damage: 100 }
    ]);

    const [magicCards, setMagicCards] = useState({ heal: 0, nuke: 0, freeze: 0, poison: 0 });

    useEffect(() => {
        if (account?.address) {
            const fetchInventory = async () => {
                // Fetch USDT Balance
                const balance = await BlockchainService.getUSDTBalance(client, account.address);
                setUsdtBalance(balance);

                // Fetch real SBT stats from blockchain
                const sbtStats = await BlockchainService.getSBTStats(client, account.address);

                // Fetch Magic Card Inventory
                const cardInventory = await BlockchainService.getMagicCardInventory(client, account.address);
                if (cardInventory) {
                    setMagicCards({
                        heal: parseInt(cardInventory.counts.heal),
                        nuke: parseInt(cardInventory.counts.nuke),
                        freeze: parseInt(cardInventory.counts.freeze),
                        poison: parseInt(cardInventory.counts.poison)
                    });
                }

                // Also check local storage simulation for smoother dev experience
                const macrophageUnlocked = await BlockchainService.checkUnlockSBT(account.address, 'macrophage');
                const plateletUnlocked = await BlockchainService.checkUnlockSBT(account.address, 'platelet');
                const basophilUnlocked = await BlockchainService.checkUnlockSBT(account.address, 'basophil');
                const nkCellUnlocked = await BlockchainService.checkUnlockSBT(account.address, 'nkCell');

                setInventory(prev => prev.map(item => {
                    if (item.id === 'macrophage') return { ...item, unlocked: !!sbtStats.macrophage || macrophageUnlocked };
                    if (item.id === 'platelet') return { ...item, unlocked: !!sbtStats.platelet || plateletUnlocked };
                    if (item.id === 'basophil') return { ...item, unlocked: !!sbtStats.basophil || basophilUnlocked };
                    if (item.id === 'nkCell') return { ...item, unlocked: !!sbtStats.nkCell || nkCellUnlocked };
                    return item;
                }));
            };
            fetchInventory();
        }
    }, [account, client]);

    // Mock data - TODO: Fetch from blockchain
    const stats = {
        highestWave: 5,
        totalGames: 12,
        totalEnemiesDefeated: 247
    };


    const recentGames = [
        { id: 1, wave: 5, date: '2025-11-24', result: 'Victory', score: 1250 },
        { id: 2, wave: 3, date: '2025-11-23', result: 'Defeat', score: 450 },
        { id: 3, wave: 4, date: '2025-11-23', result: 'Victory', score: 890 }
    ];

    if (!account) {
        return (
            <div className="dashboard-page gradient-bg">
                <div className="container">
                    <div className="connect-prompt glass">
                        <div className="lock-icon-large">🔒</div>
                        <h2>Connect Wallet</h2>
                        <p>Please connect your wallet to view your dashboard</p>
                        <button className="btn btn-primary" onClick={() => navigate('/')}>
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page gradient-bg">
            <div className="container">
                <div className="dashboard-header fade-in">
                    <div className="header-content">
                        <h1>Player Dashboard</h1>
                        <p>Track your progress and manage your defenses</p>
                    </div>
                    <div className="player-rank glass">
                        <span className="rank-label">Rank</span>
                        <span className="rank-value">Defender</span>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card glass slide-in-left">
                        <div className="stat-icon-wrapper">
                            <div className="stat-icon">🏆</div>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Highest Wave</div>
                            <div className="stat-value">{stats.highestWave}</div>
                        </div>
                    </div>

                    <div className="stat-card glass slide-in-left" style={{ animationDelay: '0.1s' }}>
                        <div className="stat-icon-wrapper">
                            <div className="stat-icon">🎮</div>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Total Games</div>
                            <div className="stat-value">{stats.totalGames}</div>
                        </div>
                    </div>

                    <div className="stat-card glass slide-in-left" style={{ animationDelay: '0.2s' }}>
                        <div className="stat-icon-wrapper">
                            <div className="stat-icon">⚔️</div>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Enemies Defeated</div>
                            <div className="stat-value">{stats.totalEnemiesDefeated}</div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-content">
                    <div className="left-column">
                        <div className="wallet-section glass fade-in">
                            <div className="section-header">
                                <h2>💼 Wallet Info</h2>
                            </div>
                            <div className="wallet-details">
                                <div className="wallet-item">
                                    <span className="wallet-label">Address</span>
                                    <span className="wallet-value">{account.address}</span>
                                </div>
                                <div className="wallet-item">
                                    <span className="wallet-label">USDT Balance</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className="wallet-value text-accent">{usdtBalance.toLocaleString()} USDT</span>
                                        <button
                                            onClick={handleMintUSDT}
                                            className="btn-small"
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '12px',
                                                backgroundColor: '#22c55e',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            +10,000
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="history-section glass fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="section-header">
                                <h2>📜 Recent Games</h2>
                            </div>
                            <div className="history-list">
                                {recentGames.map((game) => (
                                    <div key={game.id} className="history-item">
                                        <div className="history-info">
                                            <div className="history-wave">Wave {game.wave}</div>
                                            <div className="history-date">{game.date}</div>
                                        </div>
                                        <div className="history-stats">
                                            <span className="history-score">{game.score} pts</span>
                                            <div className={`history-result ${game.result.toLowerCase()}`}>
                                                {game.result}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="right-column">
                        <div className="inventory-section glass fade-in" style={{ animationDelay: '0.1s' }}>
                            <div className="section-header">
                                <h2>🎒 Tower Inventory</h2>
                                <span className="inventory-count">{inventory.filter(t => t.unlocked).length}/{inventory.length}</span>
                            </div>
                            <div className="inventory-grid">
                                {inventory.map((tower) => (
                                    <div
                                        key={tower.id}
                                        className={`inventory-item ${tower.unlocked ? 'unlocked' : 'locked'}`}
                                    >
                                        <div className="inventory-icon">
                                            <img src={tower.image} alt={tower.name} />
                                        </div>
                                        <div className="inventory-info">
                                            <div className="inventory-name">{tower.name}</div>
                                            <div className="inventory-type">{tower.type}</div>
                                        </div>
                                        {tower.unlocked ? (
                                            <div className="inventory-stats">
                                                <span>DMG: {tower.damage}</span>
                                            </div>
                                        ) : (
                                            <div className="lock-overlay">
                                                <span className="lock-icon">🔒</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="inventory-section glass fade-in" style={{ animationDelay: '0.2s', marginTop: '20px' }}>
                            <div className="section-header">
                                <h2>✨ Magic Cards</h2>
                                <span className="inventory-count">{Object.values(magicCards).reduce((acc, val) => acc + val, 0)} Owned</span>
                            </div>
                            <div className="inventory-grid">
                                {[
                                    { id: 'heal', name: 'Healing Pulse', image: '/assets/animation_frames/Heal/Heal.png', type: 'Support' },
                                    { id: 'nuke', name: 'Cytokine Storm', image: '/assets/animation_frames/Nuke/Nuke.png', type: 'Damage' },
                                    { id: 'freeze', name: 'Cryo Stasis', image: '/assets/animation_frames/Freeze/Freeze.png', type: 'Control' },
                                    { id: 'poison', name: 'Viral Toxin', image: '/assets/animation_frames/Poison/Poison.png', type: 'DoT' }
                                ].map((card) => (
                                    <div
                                        key={card.id}
                                        className={`inventory-item ${magicCards[card.id] > 0 ? 'unlocked' : 'locked'}`}
                                    >
                                        <div className="inventory-icon">
                                            <img src={card.image} alt={card.name} />
                                        </div>
                                        <div className="inventory-info">
                                            <div className="inventory-name">{card.name}</div>
                                            <div className="inventory-type">{card.type}</div>
                                        </div>
                                        {magicCards[card.id] > 0 ? (
                                            <div className="inventory-stats">
                                                <span>Count: {magicCards[card.id]}</span>
                                            </div>
                                        ) : (
                                            <div className="lock-overlay">
                                                <span className="lock-icon">🔒</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
