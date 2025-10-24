import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  onSpace?: () => void;
  onDelete?: () => void;
  onBackspace?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onPageUp?: () => void;
  onPageDown?: () => void;
  enabled?: boolean;
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions) => {
  const {
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    onSpace,
    onDelete,
    onBackspace,
    onHome,
    onEnd,
    onPageUp,
    onPageDown,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const { key, shiftKey, ctrlKey, altKey } = event;

    // Prevent default for handled keys
    const preventDefault = () => {
      event.preventDefault();
      event.stopPropagation();
    };

    switch (key) {
      case 'Enter':
        onEnter?.();
        preventDefault();
        break;
      case 'Escape':
        onEscape?.();
        preventDefault();
        break;
      case 'ArrowUp':
        onArrowUp?.();
        preventDefault();
        break;
      case 'ArrowDown':
        onArrowDown?.();
        preventDefault();
        break;
      case 'ArrowLeft':
        onArrowLeft?.();
        preventDefault();
        break;
      case 'ArrowRight':
        onArrowRight?.();
        preventDefault();
        break;
      case 'Tab':
        if (shiftKey) {
          onShiftTab?.();
        } else {
          onTab?.();
        }
        preventDefault();
        break;
      case ' ':
        onSpace?.();
        preventDefault();
        break;
      case 'Delete':
        onDelete?.();
        preventDefault();
        break;
      case 'Backspace':
        onBackspace?.();
        preventDefault();
        break;
      case 'Home':
        onHome?.();
        preventDefault();
        break;
      case 'End':
        onEnd?.();
        preventDefault();
        break;
      case 'PageUp':
        onPageUp?.();
        preventDefault();
        break;
      case 'PageDown':
        onPageDown?.();
        preventDefault();
        break;
    }
  }, [
    enabled,
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    onSpace,
    onDelete,
    onBackspace,
    onHome,
    onEnd,
    onPageUp,
    onPageDown,
  ]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
};

// Focus management hook
export const useFocusManagement = () => {
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  }, []);

  const focusNext = useCallback((currentSelector: string, nextSelector: string) => {
    const current = document.querySelector(currentSelector) as HTMLElement;
    const next = document.querySelector(nextSelector) as HTMLElement;
    
    if (current && next) {
      current.blur();
      next.focus();
    }
  }, []);

  const trapFocus = useCallback((containerSelector: string) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, []);

  return {
    focusElement,
    focusNext,
    trapFocus,
  };
};
