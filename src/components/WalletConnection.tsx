
import React, { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WalletConnection = () => {
  const { toast } = useToast();
  const { address, isConnected, status } = useAccount();
  const { connectors, connect, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  // Log connector details for debugging
  useEffect(() => {
    console.log('Available Connectors:', connectors);
    console.log('Connection Status:', status);
    
    if (connectError) {
      toast({
        title: "Wallet Connection Error",
        description: connectError.message,
        variant: "destructive"
      });
    }
  }, [connectors, status, connectError]);

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => disconnect()}
          className="flex items-center gap-1"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          onClick={() => {
            console.log(`Attempting to connect with ${connector.name}`);
            connect({ connector });
          }}
          disabled={!connector.ready}
          variant="outline"
          className="flex items-center gap-2 w-full"
        >
          <Wallet className="h-4 w-4" />
          Connect {connector.name}
          {!connector.ready && ' (not installed)'}
        </Button>
      ))}
    </div>
  );
};

export default WalletConnection;
