import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import BondDetails from "./pages/BondDetails";
import Portfolio from "./pages/Portfolio";
import History from "./pages/History";
import Learn from "./pages/Learn";
import Wallet from "./pages/Wallet";
import Onboarding from "./pages/Onboarding";
import Signin from "./pages/Signin";
import Debug from "./pages/Debug";
import NotFound from "./pages/NotFound";
import { useAppInit } from "./hooks/useAppInit";
import { useDemoInit } from "./hooks/useDemoInit";

const queryClient = new QueryClient();

const App = () => {
  useAppInit(); // Initialize auth from localStorage + demo data and market simulation
  useDemoInit(); // Initialize demo accounts ONLY if no real authentication exists
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
              <Route path="/bonds/:symbol" element={<ProtectedRoute><BondDetails /></ProtectedRoute>} />
              <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/debug" element={<Debug />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
