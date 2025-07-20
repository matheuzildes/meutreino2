// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// ALTERADO: Importe o HashRouter em vez do BrowserRouter
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MobileOptimizations from "./components/MobileOptimizations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MobileOptimizations>
        <Toaster />
        <Sonner />
        {/* ALTERADO: Use o HashRouter aqui */}
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </MobileOptimizations>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;