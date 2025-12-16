import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface InactivityWarningProps {
  isOpen: boolean;
  secondsRemaining: number;
  onStayActive: () => void;
  onLogout: () => void;
}

export function InactivityWarning({
  isOpen,
  secondsRemaining,
  onStayActive,
  onLogout,
}: InactivityWarningProps) {
  const [countdown, setCountdown] = useState(60);

  // Initialize countdown when dialog opens - always start at 60
  useEffect(() => {
    if (isOpen) {
      setCountdown(60); // Always start at 60 seconds
    } else {
      setCountdown(60);
    }
  }, [isOpen]);

  // Countdown timer - decrement every second from 60 to 0
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Start countdown from 60
    setCountdown(60);
    let logoutCalled = false;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        const newValue = prev - 1;
        
        if (newValue <= 0 && !logoutCalled) {
          clearInterval(interval);
          logoutCalled = true;
          // CRITICAL: Auto-logout immediately when countdown reaches 0
          console.log('⏰ Countdown reached 0 - executing logout immediately');
          // Call onLogout immediately (no delay)
          try {
            onLogout();
          } catch (error) {
            console.error('Error calling onLogout:', error);
          }
          return 0;
        }
        
        return newValue;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isOpen, onLogout]);

  // Display format: Always show 0:XX (only seconds, 0-60)
  const minutes = 0; // Always 0 since we only show last 60 seconds
  const seconds = Math.max(0, Math.min(60, countdown));
  
  // Show "00:00" when countdown reaches 0
  const displayTime = countdown <= 0 ? '00:00' : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <DialogTitle>Session Timeout Warning</DialogTitle>
          </div>
          <DialogDescription className="pt-4">
            You've been inactive for a while. Your session will automatically log out in:
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${countdown <= 0 ? 'text-red-600' : 'text-yellow-600'}`}>
              {displayTime}
            </div>
            {countdown <= 0 ? (
              <p className="text-sm text-red-600 font-medium">
                Logging out...
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Click "Stay Active" to continue your session
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onLogout}>
            Logout Now
          </Button>
          <Button onClick={onStayActive} className="bg-blue-600 hover:bg-blue-700">
            Stay Active
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

