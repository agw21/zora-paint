import { ethers } from 'ethers';

interface MintParams {
  imageDataUrl: string;
  name: string;
  description: string;
}

// Zora Factory Contract ABI (minimal for token creation)
const ZORA_FACTORY_ABI = [
  "function createToken(string memory name, string memory symbol, uint256 initialSupply) external returns (address)"
];

// Updated Zora Factory Contract address on Base
const ZORA_FACTORY_ADDRESS = "0xbECAe78D441FBa11017bB7A8798D018b0977F76d";

export const mintArtworkOnZora = async ({ imageDataUrl, name, description }: MintParams) => {
  try {
    console.log('Starting to create ERC20 token using Zora Factory on Base blockchain');
    console.log('Token Name:', name);
    console.log('Token Description:', description);

    // Check if window.ethereum (MetaMask or similar) is available
    if (!window.ethereum) {
      throw new Error("No Ethereum provider found. Please install MetaMask or another wallet.");
    }

    // Request account access if needed
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const userAddress = accounts[0];
    
    console.log('Connected to wallet address:', userAddress);
    
    // Create a provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Check if user is on Base network
    const network = await provider.getNetwork();
    // Base Mainnet chain ID is 8453
    const baseChainId = 8453;
    
    console.log('Current network:', network.chainId);
    
    if (network.chainId !== BigInt(baseChainId)) {
      // Try to switch to Base network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${baseChainId.toString(16)}` }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${baseChainId.toString(16)}`,
                chainName: 'Base',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
      
      // Refresh provider after chain switch
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await newProvider.getSigner();
      return await deployZoraToken(signer, userAddress, { imageDataUrl, name, description });
    }
    
    const signer = await provider.getSigner();
    return await deployZoraToken(signer, userAddress, { imageDataUrl, name, description });
    
  } catch (error) {
    console.error('Error creating ERC20 token on Base blockchain:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create ERC20 token on Base blockchain'
    };
  }
};

// Helper function to deploy a token using Zora's Factory
async function deployZoraToken(
  signer: ethers.Signer, 
  userAddress: string,
  { imageDataUrl, name, description }: MintParams
) {
  try {
    console.log('Deploying token using Zora Factory...');
    
    // Create token symbol from name (first letters of each word)
    const symbol = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
    
    // Initial supply of 1,000 tokens with 18 decimals (1000 * 10^18)
    const initialSupply = ethers.parseEther('1000');
    
    console.log(`Token Symbol: ${symbol}`);
    console.log(`Initial Supply: 1,000 ${symbol}`);
    
    // Create contract instance
    const zoraFactory = new ethers.Contract(
      ZORA_FACTORY_ADDRESS,
      ZORA_FACTORY_ABI,
      signer
    );
    
    // Deploy new token through Zora's factory
    const tx = await zoraFactory.createToken(
      name,
      symbol,
      initialSupply
    );
    
    console.log('Transaction sent:', tx.hash);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    
    // Get the created token address from the event logs
    const tokenAddress = receipt.logs[0].address; // This might need adjustment based on actual event structure
    
    // Generate Base explorer URL for the created token
    const baseExplorerUrl = `https://basescan.org/token/${tokenAddress}`;
    
    return {
      success: true,
      txHash: tx.hash,
      contractAddress: tokenAddress,
      symbol,
      name,
      initialSupply: '1000',
      viewUrl: baseExplorerUrl,
      message: 'ERC20 token successfully created on Base blockchain using Zora Factory!'
    };
  } catch (error) {
    console.error('Error deploying Zora token:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to deploy token through Zora Factory'
    };
  }
}
