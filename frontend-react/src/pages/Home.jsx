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
                textAlign: 'center',
                minHeight: '100vh',
                padding: '2rem'
            }}>
                <div className="hero-content" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%'
                }}>
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
