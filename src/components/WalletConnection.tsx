
import React, { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WalletConnection = () => {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { connectors, connect, error: connectError, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle connection errors
  useEffect(() => {
    if (connectError && isConnecting) {
      console.error('Connection error:', connectError);
      toast({
        title: "Wallet Connection Error",
        description: connectError.message || "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  }, [connectError, toast, isConnecting]);

  // Reset connecting state when connection completes
  useEffect(() => {
    if (isConnected && isConnecting) {
      setIsConnecting(false);
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected!",
      });
    }
  }, [isConnected, toast, isConnecting]);

  const handleConnect = () => {
    try {
      setIsConnecting(true);
      console.log('Available connectors:', connectors);
      
      // Try to find Injected connector (MetaMask) first
      const injectedConnector = connectors.find(c => c.id === 'injected');
      
      // Fall back to WalletConnect if no injected connector
      const connector = injectedConnector || connectors[0];
      
      if (connector) {
        console.log(`Initiating connection with ${connector.id}...`);
        connect({ connector });
      } else {
        toast({
          title: "Connection Error",
          description: "No compatible wallet connectors found",
          variant: "destructive"
        });
        setIsConnecting(false);
      }
    } catch (err) {
      console.error('Error initiating wallet connection:', err);
      toast({
        title: "Connection Error",
        description: "Failed to initiate wallet connection",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

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
    <Button
      onClick={handleConnect}
      disabled={isPending || isConnecting}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isPending || isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
};

export default WalletConnection;

