import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const AIConfiguration: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Test the server-side AI gateway (Supabase Edge Function)
      const { data, error } = await supabase.functions.invoke('ai-automation', {
        body: { action: 'self_test', payload: {} },
      });

      if (!error && data?.success && data?.output?.ok === true) {
        setTestResult('success');
        toast({
          title: 'Connection Successful',
          description: 'AI server is reachable and OpenAI is configured.',
        });
      } else {
        setTestResult('error');
        toast({
          variant: 'destructive',
          title: 'Connection Failed',
          description: data?.error || error?.message || 'AI server not reachable or OpenAI not configured',
        });
      }
    } catch (error) {
      setTestResult('error');
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: 'Unable to reach AI server.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isConfigured = testResult === 'success';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          AI Configuration
          <Badge variant={isConfigured ? 'default' : 'secondary'}>
            {isConfigured ? 'Configured' : 'Not Configured'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            AI runs server-side via Supabase Edge Functions. No API keys are stored in the browser.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={testConnection} 
            disabled={isTesting}
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
            {testResult === 'success' && <Check className="h-4 w-4 ml-2 text-green-500" />}
            {testResult === 'error' && <X className="h-4 w-4 ml-2 text-red-500" />}
          </Button>
        </div>

        {isConfigured && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              AI features are enabled (server-side). You can now use denial analysis, prior-auth copilot, and clinical note extraction.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
