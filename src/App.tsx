
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import MobileApp from "./pages/MobileApp";
import MobilePlayer from "./pages/MobilePlayer";
import MobileSettings from "./pages/MobileSettings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import { MobileLayout } from "./components/layout/MobileLayout";
import { useIsMobile } from "./hooks/use-mobile";

const queryClient = new QueryClient();

const App = () => {
  const isMobile = useIsMobile();
  
  const mobileRoutes = ['/mobile-player', '/mobile-settings'];
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AppContent isMobile={isMobile} mobileRoutes={mobileRoutes} />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const AppContent = ({ isMobile, mobileRoutes }: { isMobile: boolean; mobileRoutes: string[] }) => {
  const location = useLocation();
  const shouldUseMobileLayout = isMobile || mobileRoutes.includes(location.pathname);
  
  const LayoutComponent = shouldUseMobileLayout ? MobileLayout : Layout;
  
  return (
    <LayoutComponent>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/mobile-app" element={<MobileApp />} />
        <Route path="/mobile-player" element={<MobilePlayer />} />
        <Route path="/mobile-settings" element={<MobileSettings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LayoutComponent>
  );
};

export default App;
