
import React, { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WalletConnection = () => {
  const { toast } = useToast();
  const { address, isConnected, status } = useAccount();
  const { connectors, connect, error: connectError, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Log connector details for debugging
  useEffect(() => {
    console.log('Available Connectors:', connectors);
    console.log('Connection Status:', status);
    
    if (connectError) {
      console.error('Connection error:', connectError);
      toast({
        title: "Wallet Connection Error",
        description: connectError.message,
        variant: "destructive"
      });
    }
  }, [connectors, status, connectError, toast]);

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

  // Find the WalletConnect connector
  const walletConnector = connectors[0];
  
  return (
    <div className="space-y-2">
      <Button
        onClick={() => {
          console.log('Initiating WalletConnect connection...');
          connect({ connector: walletConnector });
        }}
        disabled={!walletConnector?.ready || isPending}
        variant="outline"
        className="flex items-center gap-2 w-full"
      >
        <Wallet className="h-4 w-4" />
        {isPending ? 'Connecting...' : 'Connect Wallet'}
        {!walletConnector?.ready && ' (not available)'}
      </Button>
    </div>
  );
};

export default WalletConnection;
