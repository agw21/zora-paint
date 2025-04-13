
import React, { useState } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import WalletConnection from '@/components/WalletConnection';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { mintCoinArtwork } from '@/services/zoraMintService';
import { Coins, Loader2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAccount } from 'wagmi';

const Index = () => {
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const [canvasDataUrl, setCanvasDataUrl] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [artworkName, setArtworkName] = useState('My Digital Coin');
  const [artworkDescription, setArtworkDescription] = useState('A unique coin artwork minted on Zora');
  const [mintedCoin, setMintedCoin] = useState<{
    txHash: string;
    contractAddress: string;
    symbol: string;
    name: string;
    initialSupply: string;
    viewUrl: string;
  } | null>(null);

  const handleCoinArtwork = async () => {
    if (!canvasDataUrl) {
      toast({
        title: "No artwork found",
        description: "Please draw something on the canvas first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isConnected) {
      setShowWalletDialog(true);
      return;
    }
    
    setShowMintDialog(true);
  };

  const handleMintSubmit = async () => {
    if (!canvasDataUrl) return;
    
    setIsMinting(true);
    try {
      const result = await mintCoinArtwork({
        imageDataUrl: canvasDataUrl,
        name: artworkName,
        description: artworkDescription
      });
      
      if (result.success) {
        toast({
          title: "Success!",
          description: `Your coin artwork has been created successfully!`,
        });
        
        setMintedCoin({
          txHash: result.txHash,
          contractAddress: result.contractAddress,
          symbol: result.symbol,
          name: result.name,
          initialSupply: result.initialSupply,
          viewUrl: result.viewUrl
        });
        
        setShowMintDialog(false);
        setShowSuccessDialog(true);
      } else {
        toast({
          title: "Coin Artwork Creation Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while creating your coin artwork.",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  const handleViewCoin = () => {
    if (mintedCoin?.viewUrl) {
      window.open(mintedCoin.viewUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Zora Coin Art</h1>
        <WalletConnection />
      </div>
      
      <DrawingCanvas onCanvasDataUrl={setCanvasDataUrl} />
      
      <Button 
        onClick={handleCoinArtwork} 
        className="mt-6 bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
      >
        <Coins className="h-5 w-5" />
        Create Coin Artwork
      </Button>

      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect Wallet Required</DialogTitle>
            <DialogDescription>
              You need to connect a wallet to create your coin artwork.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-6">
            <WalletConnection />
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowWalletDialog(false)} 
              className="mr-2"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Coin Artwork</DialogTitle>
            <DialogDescription>
              Your artwork will be used as the visual for your unique digital coin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Coin Name</Label>
              <Input 
                id="name" 
                value={artworkName} 
                onChange={(e) => setArtworkName(e.target.value)} 
                placeholder="My Digital Coin"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={artworkDescription} 
                onChange={(e) => setArtworkDescription(e.target.value)} 
                placeholder="A unique coin artwork on Zora"
              />
            </div>
            
            {canvasDataUrl && (
              <div className="flex justify-center">
                <img 
                  src={canvasDataUrl} 
                  alt="Coin artwork preview" 
                  className="max-w-full max-h-40 border rounded"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowMintDialog(false)} 
              className="mr-2"
              disabled={isMinting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleMintSubmit} 
              disabled={isMinting} 
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isMinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Coin'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Coin Artwork Created Successfully!</DialogTitle>
            <DialogDescription>
              Your unique digital coin has been created on Zora.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {canvasDataUrl && (
              <div className="flex justify-center">
                <img 
                  src={canvasDataUrl} 
                  alt="Coin artwork" 
                  className="max-w-full max-h-40 border rounded"
                />
              </div>
            )}
            
            <div className="grid gap-1">
              <p className="text-sm font-medium">Coin Name:</p>
              <p className="text-xs text-gray-500">{mintedCoin?.name}</p>
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium">Coin Symbol:</p>
              <p className="text-xs text-gray-500">{mintedCoin?.symbol}</p>
            </div>
            
            <div className="grid gap-1">
              <p className="text-sm font-medium">Initial Supply:</p>
              <p className="text-xs text-gray-500">{mintedCoin?.initialSupply} {mintedCoin?.symbol}</p>
            </div>
            
            <div className="grid gap-1">
              <p className="text-sm font-medium">Contract Address:</p>
              <p className="text-xs text-gray-500 break-all">{mintedCoin?.contractAddress}</p>
            </div>
            
            <div className="grid gap-1">
              <p className="text-sm font-medium">Transaction Hash:</p>
              <p className="text-xs text-gray-500 break-all">{mintedCoin?.txHash}</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowSuccessDialog(false)}
            >
              Close
            </Button>
            <Button 
              onClick={handleViewCoin}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View on Zora
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;

