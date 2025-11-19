// Analytics utility for BillWise AI Nexus

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

interface UserProperties {
  userId: string;
  email: string;
  role: string;
  createdAt: string;
}

interface PageView {
  page: string;
  title: string;
  url: string;
  referrer?: string;
}

class Analytics {
  private isEnabled: boolean;
  private userId?: string;
  private sessionId: string;
  private queue: AnalyticsEvent[] = [];

  constructor() {
    this.isEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private initialize(): void {
    if (!this.isEnabled) return;

    // Initialize Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      this.setupGoogleAnalytics();
    }

    // Initialize custom analytics
    this.setupCustomAnalytics();
  }

  private setupGoogleAnalytics(): void {
    const gtag = (window as any).gtag;
    
    // Configure Google Analytics
    gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }

  private setupCustomAnalytics(): void {
    // Send queued events
    this.flushQueue();
  }

  private generateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private flushQueue(): void {
    if (this.queue.length === 0) return;

    // Send queued events to analytics service
    this.queue.forEach(event => this.sendEvent(event));
    this.queue = [];
  }

  private sendEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled) return;

    // Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.name, {
        ...event.properties,
        user_id: this.userId,
        session_id: this.sessionId,
      });
    }

    // Send to custom analytics endpoint
    this.sendToCustomEndpoint(event);
  }

  private async sendToCustomEndpoint(event: AnalyticsEvent): Promise<void> {
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          userId: this.userId,
          sessionId: this.sessionId,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        console.warn('Failed to send analytics event:', event.name);
      }
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  // Public methods
  identify(userId: string, properties: UserProperties): void {
    this.userId = userId;
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
        user_id: userId,
      });
    }

    // Set user properties
    this.setUserProperties(properties);
  }

  private setUserProperties(properties: UserProperties): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('set', {
        user_properties: {
          email: properties.email,
          role: properties.role,
          created_at: properties.createdAt,
        },
      });
    }
  }

  track(eventName: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    if (this.isEnabled) {
      this.sendEvent(event);
    } else {
      this.queue.push(event);
    }
  }

  page(pageName: string, properties?: Record<string, any>): void {
    const pageView: PageView = {
      page: pageName,
      title: document.title,
      url: window.location.href,
      referrer: document.referrer,
    };

    this.track('page_view', {
      ...pageView,
      ...properties,
    });

    // Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
        page_title: pageView.title,
        page_location: pageView.url,
      });
    }
  }

  // Business-specific tracking methods
  trackPatientCreated(patientId: string, properties?: Record<string, any>): void {
    this.track('patient_created', {
      patient_id: patientId,
      ...properties,
    });
  }

  trackBillingStatementCreated(statementId: string, amount: number, properties?: Record<string, any>): void {
    this.track('billing_statement_created', {
      statement_id: statementId,
      amount,
      ...properties,
    });
  }

  trackCollectionActivity(activityType: string, accountId: string, properties?: Record<string, any>): void {
    this.track('collection_activity', {
      activity_type: activityType,
      account_id: accountId,
      ...properties,
    });
  }

  trackAuthorizationRequest(requestId: string, status: string, properties?: Record<string, any>): void {
    this.track('authorization_request', {
      request_id: requestId,
      status,
      ...properties,
    });
  }

  trackPaymentPlanCreated(planId: string, amount: number, properties?: Record<string, any>): void {
    this.track('payment_plan_created', {
      plan_id: planId,
      amount,
      ...properties,
    });
  }

  trackUserAction(action: string, properties?: Record<string, any>): void {
    this.track('user_action', {
      action,
      ...properties,
    });
  }

  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  trackPerformance(metric: string, value: number, properties?: Record<string, any>): void {
    this.track('performance_metric', {
      metric,
      value,
      ...properties,
    });
  }

  // E-commerce tracking
  trackRevenue(amount: number, currency: string = 'USD', properties?: Record<string, any>): void {
    this.track('purchase', {
      value: amount,
      currency,
      ...properties,
    });
  }

  // Conversion tracking
  trackConversion(conversionType: string, value?: number, properties?: Record<string, any>): void {
    this.track('conversion', {
      conversion_type: conversionType,
      value,
      ...properties,
    });
  }

  // Reset analytics
  reset(): void {
    this.userId = undefined;
    this.sessionId = this.generateSessionId();
    this.queue = [];
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Convenience functions
export const track = {
  event: (name: string, properties?: Record<string, any>) => analytics.track(name, properties),
  page: (name: string, properties?: Record<string, any>) => analytics.page(name, properties),
  user: (userId: string, properties: UserProperties) => analytics.identify(userId, properties),
  error: (error: Error, context?: Record<string, any>) => analytics.trackError(error, context),
  performance: (metric: string, value: number, properties?: Record<string, any>) => 
    analytics.trackPerformance(metric, value, properties),
};
