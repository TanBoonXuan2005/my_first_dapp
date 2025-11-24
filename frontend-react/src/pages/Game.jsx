import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@onelabs/dapp-kit';
import GameCanvas from '../components/GameCanvas';

function Game() {
    const navigate = useNavigate();
    const account = useCurrentAccount();

    useEffect(() => {
        // Check if wallet is connected
        if (!account) {
            navigate('/');
        }
    }, [account, navigate]);

    return <GameCanvas />;
}

export default Game;
