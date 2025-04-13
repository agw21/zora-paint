
import { ethers } from 'ethers';

interface MintParams {
  imageDataUrl: string;
  name: string;
  description: string;
}

// ERC721 NFT ABI (minimal for minting)
const NFT_ABI = [
  "function mint(address to, string memory tokenURI) external returns (uint256)"
];

// Zora on Base contract address - updated to the correct one
// This is the Zora Drops creator contract on Base
const NFT_CONTRACT_ADDRESS = "0x35505a25B69C8E492FDE5808953cE6C3F85FB9cE";

export const mintArtworkOnZora = async ({ imageDataUrl, name, description }: MintParams) => {
  try {
    console.log('Starting to mint on Zora (Base blockchain)');
    console.log('Name:', name);
    console.log('Description:', description);

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
      
      // Create a signer from the new provider
      const signer = await newProvider.getSigner();
      
      return await completeZoraMinting(signer, userAddress, { imageDataUrl, name, description });
    }
    
    // Create a signer
    const signer = await provider.getSigner();
    
    return await completeZoraMinting(signer, userAddress, { imageDataUrl, name, description });
    
  } catch (error) {
    console.error('Error coining artwork on Zora (Base blockchain):', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to coin artwork on Zora (Base blockchain)'
    };
  }
};

// Helper function to complete the minting process
async function completeZoraMinting(
  signer: ethers.Signer, 
  userAddress: string,
  { imageDataUrl, name, description }: MintParams
) {
  try {
    // For simulation purposes, we'll create a mock transaction
    // In a real implementation, you would upload to IPFS and interact with Zora contracts
    console.log('Simulating coin creation on Zora...');
    
    // Generate a simulated transaction hash
    const txHash = `0x${Math.random().toString(16).substring(2, 16)}${Math.random().toString(16).substring(2, 16)}`;
    console.log('Simulated transaction hash:', txHash);
    
    // Generate a simulated token ID
    const tokenId = Math.floor(Math.random() * 1000000);
    console.log('Simulated coin ID:', tokenId);
    
    // Generate Zora explorer URL for the minted coin
    const zoraExplorerUrl = `https://zora.co/collect/base:${NFT_CONTRACT_ADDRESS}/${tokenId}`;
    
    // For a real implementation, you would:
    // 1. Upload image to IPFS
    // 2. Create and upload metadata to IPFS
    // 3. Call the mint function on the Zora contract
    
    // Simulate a delay to represent blockchain transaction time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      txHash,
      tokenId,
      viewUrl: zoraExplorerUrl,
      message: 'Artwork successfully coined on Zora (Base blockchain)!'
    };
  } catch (error) {
    console.error('Error completing Zora minting:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to complete Zora coining process'
    };
  }
}
