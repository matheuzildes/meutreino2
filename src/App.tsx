import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MobileOptimizations from "./components/MobileOptimizations";
import { AuthProvider } from "./contexts/AuthContext"; // Importa o nosso provedor

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* O AuthProvider agora envolve todo o aplicativo */}
      <AuthProvider>
        <MobileOptimizations>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </MobileOptimizations>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;