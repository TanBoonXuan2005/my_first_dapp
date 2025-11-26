import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SuiClientProvider, WalletProvider } from '@onelabs/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@onelabs/dapp-kit/dist/index.css';
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient();
const networks = {
  devnet: { url: 'https://fullnode.devnet.sui.io:443' },
  testnet: { url: 'https://rpc-testnet.onelabs.cc' },
  mainnet: { url: 'https://rpc.onelabs.cc' },
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider>
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </StrictMode>,
)
