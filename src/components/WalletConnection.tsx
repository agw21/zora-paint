
import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

const WalletConnection = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();

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
    <div>
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={!connector.ready || isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          Connect Wallet
          {isLoading && connector.id === pendingConnector?.id && ' (connecting)'}
        </Button>
      ))}
    </div>
  );
};

export default WalletConnection;
