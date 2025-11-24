import WalletFlow from '../components/WalletFlow';

function Home() {
    // WalletFlow handles navigation and state now

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

                    <WalletFlow />
                </div>
            </section>

            <footer>
                <p>&copy; 2025 One Chain Wallet</p>
            </footer>
        </main>
    );
}

export default Home;
