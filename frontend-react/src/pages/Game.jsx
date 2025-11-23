import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameCanvas from '../components/GameCanvas';

function Game() {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if wallet is connected
        const walletState = JSON.parse(sessionStorage.getItem('walletState'));
        if (!walletState || !walletState.isConnected) {
            navigate('/');
        }
    }, [navigate]);

    return <GameCanvas />;
}

export default Game;
