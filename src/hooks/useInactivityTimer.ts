import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseInactivityTimerOptions {
  timeoutMinutes?: number;
  warningMinutes?: number; // Show warning before logout
  onWarning?: () => void;
  onLogout?: () => void;
  enabled?: boolean;
}

/**
 * Custom hook to handle user inactivity and auto-logout
 * 
 * @param options Configuration options
 * @param options.timeoutMinutes Minutes of inactivity before logout (default: 5)
 * @param options.warningMinutes Minutes before logout to show warning (default: 1)
 * @param options.onWarning Callback when warning should be shown
 * @param options.onLogout Callback when logout occurs
 * @param options.enabled Whether the timer is enabled (default: true)
 */
export function useInactivityTimer({
  timeoutMinutes = 5,
  warningMinutes = 1,
  onWarning,
  onLogout,
  enabled = true,
}: UseInactivityTimerOptions = {}) {
  const { signOut } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);
  const lastActivityRef = useRef<number>(Date.now());

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningTimeoutMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    warningShownRef.current = false;
  }, []);

  // Reset the inactivity timer
  const resetTimer = useCallback(() => {
    if (!enabled) return;

    // Only log occasionally to reduce console noise
    // Log only every 10th reset or when significant time has passed
    const shouldLog = Math.random() < 0.1; // 10% chance to log
    if (shouldLog) {
      console.log('🔄 Resetting inactivity timer');
    }
    clearTimers();
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;

    // Set warning timeout
    if (warningMinutes > 0 && warningMinutes < timeoutMinutes) {
      warningTimeoutRef.current = setTimeout(() => {
        warningShownRef.current = true;
        if (onWarning) {
          onWarning();
        }
      }, warningTimeoutMs);
    }

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      console.log('⏰ Auto-logout timeout reached - executing logout');
      // Call onLogout callback first (handles UI cleanup and navigation)
      if (onLogout) {
        onLogout();
      } else {
        // Fallback: call signOut directly if no callback
        signOut();
      }
    }, timeoutMs);
  }, [enabled, timeoutMinutes, warningMinutes, timeoutMs, warningTimeoutMs, onWarning, onLogout, signOut, clearTimers]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Reset timer on any activity (throttled to prevent excessive resets)
    // Throttle to 2 seconds to avoid resetting too frequently
    // This prevents constant resets from mouse movements
    if (timeSinceLastActivity > 2000) {
      resetTimer();
    }
  }, [resetTimer]);

  // Set up event listeners for user activity
  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    // Events that indicate user activity
    // Note: 'mousemove' is excluded as it fires too frequently
    // We rely on 'mousedown', 'click', and 'keydown' for more meaningful activity
    const events = [
      'mousedown',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
      'wheel', // Mouse wheel scrolling
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      clearTimers();
    };
  }, [enabled, handleActivity, resetTimer, clearTimers]);

  // Reset timer when component mounts or enabled changes
  useEffect(() => {
    if (enabled) {
      resetTimer();
    } else {
      clearTimers();
    }
  }, [enabled, resetTimer, clearTimers]);

  return {
    resetTimer,
    clearTimers,
    getTimeRemaining: () => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = timeoutMs - elapsed;
      const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
      
      // When warning is shown, return only the last 60 seconds (0-60)
      // This ensures the countdown shows 0:00 to 0:59 format
      if (warningShownRef.current && totalSeconds <= 60) {
        return totalSeconds; // Return 0-60 seconds
      }
      
      // Before warning is shown, return total seconds
      return totalSeconds;
    },
    getWarningTimeRemaining: () => {
      // Get only the last 60 seconds when warning is active
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = timeoutMs - elapsed;
      const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
      
      // Return only the seconds portion (0-60)
      return Math.min(60, Math.max(0, totalSeconds));
    },
    isWarningShown: () => warningShownRef.current,
  };
}

