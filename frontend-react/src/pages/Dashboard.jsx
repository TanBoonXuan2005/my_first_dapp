import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@onelabs/dapp-kit';
import { useNavigate } from 'react-router-dom';
import BlockchainService from '../services/BlockchainService';
import './Dashboard.css';

function Dashboard() {
    const account = useCurrentAccount();
    const client = useSuiClient();
    const navigate = useNavigate();

    const [inventory, setInventory] = useState([
        { id: 'bcell', name: 'B-Cell', image: '/assets/animation_frames/B-Cells/B-Cell_Idle(Neutral Form).png', unlocked: true, type: 'Ranged', damage: 15 },
        { id: 'macrophage', name: 'Macrophage', image: '/assets/animation_frames/Macrophage/Macrophage_Idle(Neutral).png', unlocked: false, type: 'Melee', damage: 25 },
        { id: 'platelet', name: 'Platelet', image: '/assets/animation_frames/Platelet/Platelet_Idle.png', unlocked: false, type: 'Support', damage: 5 },
        { id: 'basophil', name: 'Basophil', image: '/assets/animation_frames/Basophil/Basophil_Idle.png', unlocked: false, type: 'AoE', damage: 10 }
    ]);

    useEffect(() => {
        if (account?.address) {
            const fetchInventory = async () => {
                // Fetch real SBT stats from blockchain
                const sbtStats = await BlockchainService.getSBTStats(client, account.address);

                // Also check local storage simulation for smoother dev experience
                const macrophageUnlocked = await BlockchainService.checkUnlockSBT(account.address, 'macrophage');
                const plateletUnlocked = await BlockchainService.checkUnlockSBT(account.address, 'platelet');
                const basophilUnlocked = await BlockchainService.checkUnlockSBT(account.address, 'basophil');

                setInventory(prev => prev.map(item => {
                    if (item.id === 'macrophage') return { ...item, unlocked: !!sbtStats.macrophage || macrophageUnlocked };
                    if (item.id === 'platelet') return { ...item, unlocked: !!sbtStats.platelet || plateletUnlocked };
                    if (item.id === 'basophil') return { ...item, unlocked: !!sbtStats.basophil || basophilUnlocked };
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
                                    <span className="wallet-label">ATP Balance</span>
                                    <span className="wallet-value text-accent">500 ATP</span>
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
