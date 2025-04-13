
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';

// WalletConnect project ID from https://cloud.walletconnect.com/
const projectId = 'c9896b40ed2fb29d14db8901b4fe0e65';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    walletConnect({ 
      projectId: projectId,
      showQrModal: true,
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
