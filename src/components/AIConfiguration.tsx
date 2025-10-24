import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AIConfiguration: React.FC = () => {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || '');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const { toast } = useToast();

  const handleSaveKey = () => {
    // In a real app, this would save to secure storage
    localStorage.setItem('openai_api_key', apiKey);
    toast({
      title: 'API Key Saved',
      description: 'OpenAI API key has been saved successfully.',
    });
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        setTestResult('success');
        toast({
          title: 'Connection Successful',
          description: 'OpenAI API is working correctly.',
        });
      } else {
        setTestResult('error');
        toast({
          variant: 'destructive',
          title: 'Connection Failed',
          description: 'Please check your API key.',
        });
      }
    } catch (error) {
      setTestResult('error');
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: 'Unable to connect to OpenAI API.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isConfigured = apiKey && apiKey !== 'demo-key' && apiKey.length > 10;

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
            Configure your OpenAI API key to enable advanced AI features like intelligent denial analysis and automated appeal generation.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="api-key">OpenAI API Key</Label>
          <div className="flex gap-2">
            <Input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Get your API key from{' '}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              OpenAI Platform
            </a>
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSaveKey} disabled={!apiKey}>
            Save Key
          </Button>
          <Button 
            variant="outline" 
            onClick={testConnection} 
            disabled={!apiKey || isTesting}
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
              AI features are enabled. You can now use intelligent denial analysis and automated appeal generation.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
