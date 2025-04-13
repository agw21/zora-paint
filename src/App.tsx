
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider, createConfig } from 'wagmi';
import { wagmiConfig } from './lib/wagmiConfig';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Initialize Web3Modal right after importing wagmiConfig
createWeb3Modal({
  wagmiConfig,
  projectId: 'c9896b40ed2fb29d14db8901b4fe0e65',
  themeMode: 'light',
  defaultChain: wagmiConfig.chains[0], // Use the first chain as default
  featuredWalletIds: [], // Empty array to show all wallets
  includeWalletIds: [], // Empty array to include all wallets
});

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
