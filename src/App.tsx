import LandingPage from "./components/LandingPage";
import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import CustomerSetup from "./pages/CustomerSetup";
import PatientPortal from "./pages/PatientPortal";
import BoldParallaxDemo from "./pages/BoldParallaxDemo";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { ComponentCacheProvider } from "./contexts/ComponentCacheContext";
import { PersistentMainLayout } from "./components/PersistentMainLayout";
import MainAppLayout from "./components/MainAppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
// Page imports
import Scheduling from "./pages/Scheduling";
import PatientsPage from "./pages/PatientsPage";
import ClaimsPage from "./pages/ClaimsPage";
import BillingsPage from "./pages/BillingsPage";
import PaymentsPage from "./pages/PaymentsPage";
import ReportsPage from "./pages/ReportsPage";
import EligibilityVerificationPage from "./pages/EligibilityVerificationPage";
import CodeValidationPage from "./pages/CodeValidationPage";
import AuthorizationPage from "./pages/AuthorizationPage";
import EnhancedClaimsPage from "./pages/EnhancedClaimsPage";
import BillingWorkflowPage from "./pages/BillingWorkflowPage";
import QuickActionsPage from "./pages/QuickActionsPage";
import RecentActivityPage from "./pages/RecentActivityPage";
import FinancialReportsPage from "./pages/FinancialReportsPage";
import PerformanceMetricsPage from "./pages/PerformanceMetricsPage";
import AuditTrailPage from "./pages/AuditTrailPage";
import PriorAuthorizationPage from "./pages/PriorAuthorizationPage";
import CompaniesPage from "./pages/CompaniesPage";
import CompanySelectionPage from "./pages/CompanySelectionPage";
import SuperAdminPage from "./pages/SuperAdminPage";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <ComponentCacheProvider>
            <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              {/* Company Selection (public route but requires auth) */}
              <Route 
                path="/select-company" 
                element={
                  <ProtectedRoute>
                    <CompanySelectionPage />
                  </ProtectedRoute>
                } 
              />
              {/* Main Dashboard */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <MainAppLayout />
                  </ProtectedRoute>
                } 
              />
              {/* Main Navigation Routes */}
              <Route 
                path="/scheduling" 
                element={
                  <ProtectedRoute>
                    <MainAppLayout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patients" 
                element={
                  <ProtectedRoute>
                    <MainAppLayout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/claims" 
                element={
                  <ProtectedRoute>
                    <MainAppLayout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/billings" 
                element={
                  <ProtectedRoute>
                    <BillingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payments" 
                element={
                  <ProtectedRoute>
                    <PaymentsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute>
                    <ReportsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/eligibility-verification" 
                element={
                  <ProtectedRoute>
                    <MainAppLayout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/code-validation" 
                element={
                  <ProtectedRoute>
                    <MainAppLayout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/authorization" 
                element={
                  <ProtectedRoute>
                    <MainAppLayout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/enhanced-claims" 
                element={
                  <ProtectedRoute>
                    <MainAppLayout />
                  </ProtectedRoute>
                } 
              />
              {/* Workflow Routes */}
              <Route 
                path="/billing-workflow" 
                element={
                  <ProtectedRoute>
                    <MainAppLayout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quick-actions" 
                element={
                  <ProtectedRoute>
                    <MainAppLayout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/recent-activity" 
                element={
                  <ProtectedRoute>
                    <RecentActivityPage />
                  </ProtectedRoute>
                } 
              />
              {/* Analytics Routes */}
              <Route 
                path="/financial-reports" 
                element={
                  <ProtectedRoute>
                    <FinancialReportsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/performance-metrics" 
                element={
                  <ProtectedRoute>
                    <PerformanceMetricsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/audit-trail" 
                element={
                  <ProtectedRoute>
                    <AuditTrailPage />
                  </ProtectedRoute>
                } 
              />
              {/* Patient Submenu Routes */}
              <Route 
                path="/prior-authorization" 
                element={
                  <ProtectedRoute>
                    <PriorAuthorizationPage />
                  </ProtectedRoute>
                } 
              />
              {/* Company Management (Admin Only) */}
              <Route 
                path="/companies" 
                element={
                  <ProtectedRoute>
                    <CompaniesPage />
                  </ProtectedRoute>
                } 
              />
              {/* Super Admin Dashboard */}
              <Route 
                path="/super-admin" 
                element={
                  <ProtectedRoute>
                    <SuperAdminPage />
                  </ProtectedRoute>
                } 
              />
              {/* Customer Setup (kept for backward compatibility) */}
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </ComponentCacheProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
