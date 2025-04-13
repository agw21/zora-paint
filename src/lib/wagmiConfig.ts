
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ 
      projectId: 'YOUR_WALLETCONNECT_PROJECT_ID' // Replace with actual project ID
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
