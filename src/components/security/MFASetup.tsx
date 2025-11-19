import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, XCircle, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { securityService } from '@/services/securityService';
import { useAuth } from '@/contexts/AuthContext';

// QR Code component - install qrcode.react: npm install qrcode.react
// For now, using a placeholder
const QRCodeSVG = ({ value, size }: { value: string; size: number }) => (
  <div className="border-2 border-dashed border-gray-300 p-4 text-center" style={{ width: size, height: size }}>
    <p className="text-xs text-gray-500">QR Code</p>
    <p className="text-xs text-gray-400 mt-2">Install qrcode.react</p>
    <p className="text-xs text-gray-400">for QR code display</p>
  </div>
);

export function MFASetup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mfaSetup, setMfaSetup] = useState<{ secret: string; qrCodeUrl: string; backupCodes: string[] } | null>(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify' | 'enabled'>('setup');

  useEffect(() => {
    if (user?.id) {
      checkMFAStatus();
    }
  }, [user]);

  const checkMFAStatus = async () => {
    if (!user?.id) return;
    const enabled = await securityService.isMFAEnabled(user.id);
    setIsEnabled(enabled);
    if (enabled) {
      setStep('enabled');
    }
  };

  const handleSetup = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const setup = await securityService.setupMFA(user.id);
      setMfaSetup(setup);
      setStep('verify');
      toast({
        title: 'MFA Setup Started',
        description: 'Scan the QR code with your authenticator app',
      });
    } catch (error: any) {
      toast({
        title: 'Setup Failed',
        description: error.message || 'Failed to setup MFA',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!user?.id || !verificationToken) return;

    setLoading(true);
    try {
      const success = await securityService.enableMFA(user.id, verificationToken);
      if (success) {
        setIsEnabled(true);
        setStep('enabled');
        toast({
          title: 'MFA Enabled',
          description: 'Multi-factor authentication has been enabled',
        });
      } else {
        toast({
          title: 'Verification Failed',
          description: 'Invalid verification code. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify MFA',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (mfaSetup?.secret) {
      navigator.clipboard.writeText(mfaSetup.secret);
      toast({
        title: 'Copied',
        description: 'Secret key copied to clipboard',
      });
    }
  };

  const handleDownloadBackupCodes = () => {
    if (!mfaSetup?.backupCodes) return;

    const content = mfaSetup.backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mfa-backup-codes.txt';
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Backup Codes Downloaded',
      description: 'Save these codes in a secure location',
    });
  };

  if (step === 'enabled') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Multi-Factor Authentication Enabled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your account is protected with multi-factor authentication.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify' && mfaSetup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verify MFA Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </AlertDescription>
          </Alert>

          <div className="flex justify-center p-4 bg-white rounded-lg">
            <QRCodeSVG value={mfaSetup.qrCodeUrl} size={200} />
          </div>

          <div>
            <Label>Manual Entry Key</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input value={mfaSetup.secret} readOnly className="font-mono" />
              <Button variant="outline" size="sm" onClick={handleCopySecret}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Backup Codes</Label>
            <Alert className="mt-2">
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Save these codes in a secure location:</p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {mfaSetup.backupCodes.map((code, index) => (
                      <Badge key={index} variant="outline">
                        {code}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadBackupCodes}
                    className="mt-2"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Backup Codes
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          <div>
            <Label>Enter Verification Code</Label>
            <Input
              value={verificationToken}
              onChange={(e) => setVerificationToken(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <Button
            onClick={handleVerify}
            disabled={!verificationToken || verificationToken.length !== 6 || loading}
            className="w-full"
          >
            {loading ? 'Verifying...' : 'Verify and Enable MFA'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Multi-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Multi-factor authentication adds an extra layer of security to your account.
            You'll need to enter a code from your authenticator app in addition to your password.
          </AlertDescription>
        </Alert>

        <Button onClick={handleSetup} disabled={loading} className="w-full">
          {loading ? 'Setting up...' : 'Enable MFA'}
        </Button>
      </CardContent>
    </Card>
  );
}

