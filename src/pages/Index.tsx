
import DrawingCanvas from '@/components/DrawingCanvas';
import { Button } from '@/components/ui/button';

const Index = () => {
  const handleCoinArtwork = () => {
    // TODO: Implement Zora coin minting logic
    console.log('Coining artwork');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Zora Paint</h1>
      <DrawingCanvas />
      <Button 
        onClick={handleCoinArtwork} 
        className="mt-6 bg-purple-600 hover:bg-purple-700 text-white"
      >
        Coin Artwork
      </Button>
    </div>
  );
};

export default Index;

