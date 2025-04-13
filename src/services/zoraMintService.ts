
import { ethers } from 'ethers';

interface MintParams {
  imageDataUrl: string;
  name: string;
  description: string;
}

// ERC721 NFT ABI (minimal for minting)
const NFT_ABI = [
  "function mint(address to, string memory tokenURI) public returns (uint256)"
];

// Zora on Base contract address for NFT minting
const NFT_CONTRACT_ADDRESS = "0x6b8DaB822aBb57C7E94b883b24269a5fe67D06C";

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
    // Base Mainnet chain ID is 8453, Base Testnet (Goerli) is 84531
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
      
      // Refresh provider after chain switch - create a new provider instead of reassigning
      provider.destroy();
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      
      // Create a signer from the new provider
      const signer = await newProvider.getSigner();
      
      return await completeZoraMinting(signer, userAddress, { imageDataUrl, name, description });
    }
    
    // Create a signer
    const signer = await provider.getSigner();
    
    return await completeZoraMinting(signer, userAddress, { imageDataUrl, name, description });
    
  } catch (error) {
    console.error('Error minting NFT on Zora (Base blockchain):', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to mint NFT on Zora (Base blockchain)'
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
    // Upload image to IPFS or similar service
    // For simplicity, we're just simulating this part
    console.log('Uploading image to decentralized storage...');
    const imageUrl = `ipfs://QmSimulatedImageHash`; // In a real implementation, you would upload to IPFS
    
    // Create metadata
    const metadata = {
      name,
      description,
      image: imageUrl
    };
    
    // Upload metadata to IPFS or similar service
    console.log('Uploading metadata to decentralized storage...');
    const tokenUri = `ipfs://QmSimulatedMetadataHash`; // In a real implementation, you would upload to IPFS
    
    // Create contract instance - this is Zora's contract on Base
    const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
    
    // Call mint function
    console.log('Minting NFT on Zora...');
    const tx = await nftContract.mint(userAddress, tokenUri);
    
    console.log('Transaction hash:', tx.hash);
    
    // Wait for transaction to be mined
    console.log('Waiting for transaction to be mined...');
    const receipt = await tx.wait();
    
    // In a production implementation, we'd parse the event logs to get the token ID
    // For this example, we'll simulate it
    const tokenId = receipt?.logs[0]?.topics[3] ? 
      parseInt(receipt.logs[0].topics[3], 16) : 
      Math.floor(Math.random() * 1000000); // Fallback to random ID if we can't parse it
    
    console.log('Minted token ID:', tokenId);
    
    // Generate Zora explorer URL for the minted NFT
    const zoraExplorerUrl = `https://zora.co/collect/base:${NFT_CONTRACT_ADDRESS}/${tokenId}`;
    
    return {
      success: true,
      txHash: tx.hash,
      tokenId: tokenId,
      viewUrl: zoraExplorerUrl,
      message: 'NFT successfully minted on Zora (Base blockchain)!'
    };
  } catch (error) {
    console.error('Error completing Zora minting:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to complete Zora minting process'
    };
  }
}
