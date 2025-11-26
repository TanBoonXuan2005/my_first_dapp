import { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@onelabs/dapp-kit';
import BlockchainService from '../services/BlockchainService';
import GAME_CONFIG from '../gameConfig';

function MagicShop() {
    const account = useCurrentAccount();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const [ownedCards, setOwnedCards] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (account?.address) {
            checkOwnership();
        }
    }, [account]);

    const checkOwnership = async () => {
        const status = {};
        for (const type of Object.keys(GAME_CONFIG.magicCards)) {
            status[type] = await BlockchainService.checkMagicCard(account.address, type);
        }
        setOwnedCards(status);
    };

    const handleBuy = async (type) => {
        if (!account) return;
        setLoading(true);
        const success = await BlockchainService.mintMagicCard(account.address, type, signAndExecute);
        if (success) {
            await checkOwnership();
        }
        setLoading(false);
    };

    if (!account) return null;

    return (
        <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
            border: '1px solid #444',
            maxWidth: '600px',
            width: '100%'
        }}>
            <h3 style={{ color: '#ffd700', marginBottom: '1rem' }}>✨ Magic Shop (Permanent Unlocks)</h3>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {Object.entries(GAME_CONFIG.magicCards).map(([type, card]) => (
                    <div key={type} style={{
                        background: '#222',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: `1px solid ${card.color}`,
                        width: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <h4 style={{ color: card.color, margin: 0 }}>{card.name}</h4>
                        <p style={{ fontSize: '0.8rem', color: '#ccc', textAlign: 'center', height: '40px' }}>
                            {card.description}
                        </p>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                            Cooldown: {card.cooldown}s
                        </div>
                        
                        {ownedCards[type] ? (
                            <button disabled style={{
                                background: '#444',
                                color: '#888',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'not-allowed',
                                width: '100%'
                            }}>
                                ✅ Owned
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleBuy(type)}
                                disabled={loading}
                                style={{
                                    background: card.color,
                                    color: '#000',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    cursor: loading ? 'wait' : 'pointer',
                                    fontWeight: 'bold',
                                    width: '100%',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Minting...' : 'Unlock (Free)'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MagicShop;
