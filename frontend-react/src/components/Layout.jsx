import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCurrentAccount, ConnectButton } from '@onelabs/dapp-kit';
import './Layout.css';
import Background from './Background';

function Layout({ children }) {
    const location = useLocation();
    const account = useCurrentAccount();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="app-layout">
            <Background />
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo">
                        <span className="logo-icon">🧬</span>
                        <span className="logo-text">BioDefense</span>
                    </Link>

                    <div className="navbar-links">
                        <Link
                            to="/"
                            className={`nav-link ${isActive('/') ? 'active' : ''}`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/store"
                            className={`nav-link ${isActive('/store') ? 'active' : ''}`}
                        >
                            Store
                        </Link>
                        <Link
                            to="/dashboard"
                            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                        >
                            Dashboard
                        </Link>
                    </div>

                    <div className="navbar-wallet">
                        {account ? (
                            <div className="wallet-status">
                                <span className="status-indicator"></span>
                                <span className="wallet-address">
                                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                                </span>
                            </div>
                        ) : (
                            <ConnectButton />
                        )}
                    </div>
                </div>
            </nav>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}

export default Layout;
