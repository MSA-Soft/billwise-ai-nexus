import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeSubscription {
  channel: RealtimeChannel;
  table: string;
  event: string;
  callback: (payload: any) => void;
}

export const useRealtime = () => {
  const subscriptions = useRef<Map<string, RealtimeSubscription>>(new Map());

  // Subscribe to table changes
  const subscribe = useCallback((
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: (payload: any) => void,
    filter?: string
  ) => {
    const subscriptionKey = `${table}-${event}`;
    
    // Unsubscribe if already exists
    if (subscriptions.current.has(subscriptionKey)) {
      unsubscribe(subscriptionKey);
    }

    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter: filter ? `resource_id=eq.${filter}` : undefined,
        },
        callback
      )
      .subscribe();

    subscriptions.current.set(subscriptionKey, {
      channel,
      table,
      event,
      callback,
    });

    return subscriptionKey;
  }, []);

  // Unsubscribe from specific subscription
  const unsubscribe = useCallback((subscriptionKey: string) => {
    const subscription = subscriptions.current.get(subscriptionKey);
    if (subscription) {
      supabase.removeChannel(subscription.channel);
      subscriptions.current.delete(subscriptionKey);
    }
  }, []);

  // Unsubscribe from all subscriptions
  const unsubscribeAll = useCallback(() => {
    subscriptions.current.forEach((subscription) => {
      supabase.removeChannel(subscription.channel);
    });
    subscriptions.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeAll();
    };
  }, [unsubscribeAll]);

  return {
    subscribe,
    unsubscribe,
    unsubscribeAll,
  };
};

// Hook for specific table subscriptions
export const useTableSubscription = (
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: any) => void,
  filter?: string
) => {
  const { subscribe, unsubscribe } = useRealtime();

  useEffect(() => {
    const subscriptionKey = subscribe(table, event, callback, filter);
    return () => unsubscribe(subscriptionKey);
  }, [table, event, callback, filter, subscribe, unsubscribe]);
};

// Hook for real-time notifications
export const useNotifications = () => {
  const { subscribe } = useRealtime();

  const subscribeToNotifications = useCallback((userId: string, callback: (notification: any) => void) => {
    return subscribe(
      'notifications',
      'INSERT',
      (payload) => {
        if (payload.new.user_id === userId) {
          callback(payload.new);
        }
      },
      userId
    );
  }, [subscribe]);

  return {
    subscribeToNotifications,
  };
};

// Hook for real-time collaboration
export const useCollaboration = (resourceId: string) => {
  const { subscribe } = useRealtime();

  const subscribeToCollaboration = useCallback((
    callback: (payload: any) => void
  ) => {
    return subscribe(
      'collaboration_events',
      '*',
      (payload) => {
        if (payload.new.resource_id === resourceId) {
          callback(payload.new);
        }
      },
      resourceId
    );
  }, [resourceId, subscribe]);

  const broadcastCollaborationEvent = useCallback(async (
    event: string,
    data: any
  ) => {
    const { error } = await supabase
      .from('collaboration_events')
      .insert({
        resource_id: resourceId,
        event,
        data,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to broadcast collaboration event:', error);
    }
  }, [resourceId]);

  return {
    subscribeToCollaboration,
    broadcastCollaborationEvent,
  };
};
