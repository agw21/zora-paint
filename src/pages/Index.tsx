
import { useState } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import WalletConnection from '@/components/WalletConnection';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { mintArtworkOnZora } from '@/services/zoraMintService';
import { Coins, Loader2 } from 'lucide-react';
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
  const [artworkName, setArtworkName] = useState('My Zora Coin');
  const [artworkDescription, setArtworkDescription] = useState('A unique coin created on Zora Paint');

  const handleCoinArtwork = async () => {
    if (!canvasDataUrl) {
      toast({
        title: "No artwork found",
        description: "Please draw something on the canvas first.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if wallet is connected
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
      const result = await mintArtworkOnZora({
        imageDataUrl: canvasDataUrl,
        name: artworkName,
        description: artworkDescription
      });
      
      if (result.success) {
        toast({
          title: "Success!",
          description: `Your coin has been minted successfully. Transaction hash: ${result.txHash}`,
        });
        setShowMintDialog(false);
      } else {
        toast({
          title: "Minting failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while minting your coin.",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Zora Paint</h1>
        <WalletConnection />
      </div>
      
      <DrawingCanvas onCanvasDataUrl={setCanvasDataUrl} />
      
      <Button 
        onClick={handleCoinArtwork} 
        className="mt-6 bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
      >
        <Coins className="h-5 w-5" />
        Coin Artwork
      </Button>

      {/* Wallet Connection Dialog */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect Wallet Required</DialogTitle>
            <DialogDescription>
              You need to connect a wallet to mint your artwork as a coin on Zora.
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

      {/* Mint Dialog */}
      <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mint your coin on Zora</DialogTitle>
            <DialogDescription>
              Your artwork will be minted as a coin on the Zora network.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Coin Name</Label>
              <Input 
                id="name" 
                value={artworkName} 
                onChange={(e) => setArtworkName(e.target.value)} 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={artworkDescription} 
                onChange={(e) => setArtworkDescription(e.target.value)} 
              />
            </div>
            
            {canvasDataUrl && (
              <div className="flex justify-center">
                <img 
                  src={canvasDataUrl} 
                  alt="Your coin preview" 
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
                  Minting...
                </>
              ) : (
                'Mint Coin'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
