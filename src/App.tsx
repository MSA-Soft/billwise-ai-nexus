import LandingPage from "./components/LandingPage";
import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CustomerSetup from "./pages/CustomerSetup";
import PatientPortal from "./pages/PatientPortal";
import BoldParallaxDemo from "./pages/BoldParallaxDemo";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
// import TestCSS from "./test-css";
// import TestFunctionality from "./components/TestFunctionality";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer-setup" 
                element={
                  <ProtectedRoute>
                    <CustomerSetup />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient-portal" 
                element={
                  <ProtectedRoute>
                    <PatientPortal />
                  </ProtectedRoute>
                } 
              />
              <Route path="/bold-parallax" element={<BoldParallaxDemo />} />
              {/* <Route path="/test-css" element={<TestCSS />} />
              <Route path="/test-functionality" element={<TestFunctionality />} /> */}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
