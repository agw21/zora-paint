
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';

// WalletConnect project ID from https://cloud.walletconnect.com/
// Using a valid project ID that is known to work
const projectId = 'c9896b40ed2fb29d14db8901b4fe0e65';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    walletConnect({ 
      projectId: projectId,
      showQrModal: true,
      metadata: {
        name: 'Zora Paint',
        description: 'Mint your custom artwork on Zora',
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`]
      }
    }),
    injected() // Add support for injected wallets like MetaMask
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

