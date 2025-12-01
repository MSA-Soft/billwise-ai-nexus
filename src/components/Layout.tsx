import React, { useState, useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { Button } from './ui/button';
import { Bell, Settings, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useMobile } from '@/hooks/use-mobile';
import { CompanySelector } from './CompanySelector';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isMobile = useMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-detect current page from route if not provided
  const detectedPage = useMemo(() => {
    if (currentPage) return currentPage;
    
    const path = location.pathname;
    const tab = searchParams.get('tab');
    
    // Map routes to page IDs
    const routeToPageMap: Record<string, string> = {
      '/': 'dashboard',
      '/scheduling': 'scheduling',
      '/patients': 'patients',
      '/claims': 'claims',
      '/billings': 'billings',
      '/payments': 'payments',
      '/reports': 'reports',
      '/eligibility-verification': 'eligibility-verification',
      '/code-validation': 'code-validation',
      '/authorization': 'authorization',
      '/enhanced-claims': 'enhanced-claims',
      '/billing-workflow': 'billing-workflow',
      '/quick-actions': 'quick-actions',
      '/recent-activity': 'recent-activity',
      '/financial-reports': 'financial-reports',
      '/performance-metrics': 'performance-metrics',
      '/audit-trail': 'audit-trail',
      '/prior-authorization': 'prior-authorization',
    };

    // Check if it's a customer-setup route with tab
    if (path === '/customer-setup' && tab) {
      return tab;
    }

    // Return mapped page or default to dashboard
    return routeToPageMap[path] || 'dashboard';
  }, [location.pathname, searchParams, currentPage]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={detectedPage} />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                BillWise AI Nexus
              </h1>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Company Selector */}
              {user && (
                <div className="hidden sm:block">
                  <CompanySelector />
                </div>
              )}
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-700 hidden sm:block">
                  {user?.email}
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
