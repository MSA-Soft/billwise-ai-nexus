import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { Button } from './ui/button';
import AIChatBot from './AIChatBot';
import { Bell, Settings, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useMobile } from '@/hooks/use-mobile';
import { CompanySelector } from './CompanySelector';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import { InactivityWarning } from './InactivityWarning';

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
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const isLoggingOutRef = useRef(false);

  // Stable logout handler
  const handleAutoLogout = useCallback(async () => {
    if (isLoggingOutRef.current) {
      console.log('⚠️ Logout already in progress, skipping...');
      return;
    }

    isLoggingOutRef.current = true;
    console.log('⏰ Auto-logout due to inactivity - timer expired');
    setShowWarning(false);
    
    try {
      await signOut();
      console.log('✅ SignOut successful, navigating to auth page');
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('❌ Error during auto-logout:', error);
      // Force navigation even if signOut fails
      navigate('/auth', { replace: true });
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [signOut, navigate]);

  // Auto-logout after 5 minutes of inactivity
  const { resetTimer } = useInactivityTimer({
    timeoutMinutes: 5, // 5 minutes of inactivity
    warningMinutes: 1, // Show warning 1 minute before logout (at 4 minutes)
    enabled: !!user, // Only enable when user is logged in
    onWarning: () => {
      console.log('⏰ Inactivity warning triggered');
      setShowWarning(true);
      setTimeRemaining(60); // Initialize to 60 seconds
    },
    onLogout: handleAutoLogout,
  });

  // Listen for user activity to close warning and reset timer
  useEffect(() => {
    if (!showWarning) return;

    const handleActivity = () => {
      console.log('⏰ User activity detected - closing warning and resetting timer');
      setShowWarning(false);
      resetTimer();
    };

    // Listen for user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true, once: false });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [showWarning, resetTimer]);

  const handleStayActive = () => {
    setShowWarning(false);
    // Reset the inactivity timer
    resetTimer();
  };

  const handleLogoutNow = useCallback(async () => {
    if (isLoggingOutRef.current) {
      console.log('⚠️ Logout already in progress, skipping...');
      return;
    }

    isLoggingOutRef.current = true;
    console.log('🚪 Logging out user - session expired');
    setShowWarning(false);
    
    try {
      console.log('🔄 Calling signOut...');
      await signOut();
      console.log('✅ SignOut successful, navigating to auth page');
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Force navigation even if signOut fails
      navigate('/auth', { replace: true });
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [signOut, navigate]);

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
      <main className="flex-1 overflow-y-auto px-3 lg:px-4 py-3 custom-scrollbar" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 #f1f5f9'
      }}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-3 lg:px-4 py-2">
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
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
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
              {user && <AIChatBot />}
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
        <div className="px-3 lg:px-4 py-3">
          {children}
        </div>
      </main>

      {/* Inactivity Warning Dialog */}
      <InactivityWarning
        isOpen={showWarning}
        secondsRemaining={timeRemaining}
        onStayActive={handleStayActive}
        onLogout={handleLogoutNow}
      />
    </div>
  );
};

export default Layout;
