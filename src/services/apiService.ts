// API-First Design Service
// RESTful APIs, GraphQL support, webhook subscriptions

import { supabase } from '@/integrations/supabase/client';

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters?: APIParameter[];
  response: APIResponse;
  authentication: 'required' | 'optional' | 'none';
}

export interface APIParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  example?: any;
}

export interface APIResponse {
  status: number;
  schema: any;
  example: any;
}

export interface WebhookSubscription {
  id?: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface GraphQLQuery {
  query: string;
  variables?: Record<string, any>;
}

export class APIService {
  private static instance: APIService;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  }

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  // ============================================================================
  // RESTful API Methods
  // ============================================================================

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  // Get headers
  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  // Handle response
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ============================================================================
  // GraphQL Support
  // ============================================================================

  // Execute GraphQL query
  async graphql<T>(query: GraphQLQuery): Promise<T> {
    const response = await fetch(`${this.baseURL}/graphql`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(query),
    });

    const result = await this.handleResponse<{ data: T; errors?: any[] }>(response);

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    return result.data;
  }

  // ============================================================================
  // Webhook Management
  // ============================================================================

  // Create webhook subscription
  async createWebhookSubscription(subscription: WebhookSubscription): Promise<WebhookSubscription> {
    try {
      const { data, error } = await supabase
        .from('webhook_subscriptions')
        .insert({
          url: subscription.url,
          events: subscription.events,
          secret: subscription.secret || this.generateWebhookSecret(),
          is_active: subscription.isActive,
        })
        .select()
        .single();

      if (error) throw error;
      return data as WebhookSubscription;
    } catch (error: any) {
      console.error('Error creating webhook subscription:', error);
      throw new Error(error.message || 'Failed to create webhook subscription');
    }
  }

  // Get webhook subscriptions
  async getWebhookSubscriptions(): Promise<WebhookSubscription[]> {
    try {
      const { data, error } = await supabase
        .from('webhook_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as WebhookSubscription[];
    } catch (error: any) {
      console.error('Error getting webhook subscriptions:', error);
      return [];
    }
  }

  // Delete webhook subscription
  async deleteWebhookSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('webhook_subscriptions')
        .delete()
        .eq('id', subscriptionId);

      return !error;
    } catch (error: any) {
      console.error('Error deleting webhook subscription:', error);
      return false;
    }
  }

  // Trigger webhook
  async triggerWebhook(event: string, payload: any): Promise<void> {
    try {
      const subscriptions = await this.getWebhookSubscriptions();
      const relevantSubscriptions = subscriptions.filter(
        sub => sub.isActive && sub.events.includes(event)
      );

      for (const subscription of relevantSubscriptions) {
        try {
          await fetch(subscription.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Event': event,
              'X-Webhook-Signature': this.signWebhookPayload(payload, subscription.secret || ''),
            },
            body: JSON.stringify({
              event,
              payload,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.error(`Failed to trigger webhook ${subscription.url}:`, error);
        }
      }
    } catch (error) {
      console.error('Error triggering webhooks:', error);
    }
  }

  // Generate webhook secret
  private generateWebhookSecret(): string {
    return crypto.randomUUID();
  }

  // Sign webhook payload
  private signWebhookPayload(payload: any, secret: string): string {
    // In production, use HMAC-SHA256
    const payloadString = JSON.stringify(payload);
    return btoa(payloadString + secret);
  }

  // ============================================================================
  // API Documentation
  // ============================================================================

  // Get API endpoints documentation
  getAPIDocumentation(): APIEndpoint[] {
    return [
      {
        path: '/claims',
        method: 'GET',
        description: 'Get all claims',
        parameters: [
          { name: 'page', type: 'number', required: false, description: 'Page number' },
          { name: 'limit', type: 'number', required: false, description: 'Items per page' },
        ],
        response: {
          status: 200,
          schema: { type: 'array', items: { type: 'object' } },
          example: [],
        },
        authentication: 'required',
      },
      {
        path: '/claims',
        method: 'POST',
        description: 'Create a new claim',
        parameters: [
          { name: 'body', type: 'object', required: true, description: 'Claim data' },
        ],
        response: {
          status: 201,
          schema: { type: 'object' },
          example: {},
        },
        authentication: 'required',
      },
      {
        path: '/authorizations',
        method: 'GET',
        description: 'Get all authorization requests',
        response: {
          status: 200,
          schema: { type: 'array', items: { type: 'object' } },
          example: [],
        },
        authentication: 'required',
      },
      {
        path: '/webhooks',
        method: 'POST',
        description: 'Create webhook subscription',
        parameters: [
          { name: 'url', type: 'string', required: true, description: 'Webhook URL' },
          { name: 'events', type: 'array', required: true, description: 'Events to subscribe to' },
        ],
        response: {
          status: 201,
          schema: { type: 'object' },
          example: {},
        },
        authentication: 'required',
      },
    ];
  }
}

export const apiService = APIService.getInstance();

