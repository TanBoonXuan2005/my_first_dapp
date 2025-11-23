import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect';

function Home() {
    const [isConnected, setIsConnected] = useState(false);
    const navigate = useNavigate();

    const handleWalletConnect = (walletData) => {
        setIsConnected(true);
        // Store wallet data in sessionStorage for the game page
        sessionStorage.setItem('walletState', JSON.stringify(walletData));
    };

    const handlePlayGame = () => {
        if (isConnected) {
            navigate('/game');
        }
    };

    return (
        <main>
            <section id="home-screen" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}>
                <div className="hero-content">
                    <h2>Defend the Body!</h2>
                    <p>Deploy your immune cells to fight off the viral invasion.</p>
                    <button
                        id="play-btn"
                        className="primary-btn"
                        onClick={handlePlayGame}
                        disabled={!isConnected}
                    >
                        PLAY GAME
                    </button>
                </div>
            </section>

            <WalletConnect onConnect={handleWalletConnect} />

            <footer>
                <p>&copy; 2025 One Chain Wallet</p>
            </footer>
        </main>
    );
}

export default Home;
