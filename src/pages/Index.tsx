
import { useState } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import WalletConnection from '@/components/WalletConnection';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { mintArtworkOnZora } from '@/services/zoraMintService';
import { Coin, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const Index = () => {
  const { toast } = useToast();
  const [canvasDataUrl, setCanvasDataUrl] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [artworkName, setArtworkName] = useState('My Zora Artwork');
  const [artworkDescription, setArtworkDescription] = useState('A unique artwork created on Zora Paint');

  const handleCoinArtwork = async () => {
    if (!canvasDataUrl) {
      toast({
        title: "No artwork found",
        description: "Please draw something on the canvas first.",
        variant: "destructive",
      });
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
          description: `Your artwork has been minted successfully. Transaction hash: ${result.txHash}`,
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
        description: "Something went wrong while minting your artwork.",
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
        <Coin className="h-5 w-5" />
        Coin Artwork
      </Button>

      <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mint your artwork on Zora</DialogTitle>
            <DialogDescription>
              Your artwork will be minted as an NFT on the Zora network.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Artwork Name</Label>
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
                  alt="Your artwork preview" 
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
                'Mint NFT'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
