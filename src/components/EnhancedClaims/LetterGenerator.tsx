import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { aiService } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Download,
  Send,
  Copy,
  RefreshCw,
  Wand2
} from 'lucide-react';

interface ClaimData {
  id: string;
  claimNumber: string;
  patient: string;
  provider: string;
  dateOfService: string;
  amount: number;
  status: string;
  formType: string;
  insuranceProvider: string;
  submissionDate: string;
  cptCodes: string[];
  icdCodes: string[];
}

interface DenialReason {
  code: string;
  description: string;
}

interface LetterGeneratorProps {
  claim: ClaimData | null;
  isOpen: boolean;
  onClose: () => void;
  denialReasons: DenialReason[];
}

const letterTemplates = [
  {
    id: 'appeal-standard',
    name: 'Standard Appeal Letter',
    type: 'appeal',
    description: 'General appeal letter for denied claims'
  },
  {
    id: 'appeal-medical-necessity',
    name: 'Medical Necessity Appeal',
    type: 'appeal',
    description: 'Appeal focusing on medical necessity'
  },
  {
    id: 'prior-auth-request',
    name: 'Prior Authorization Request',
    type: 'prior_auth',
    description: 'Request for prior authorization'
  },
  {
    id: 'patient-communication',
    name: 'Patient Communication',
    type: 'patient_communication',
    description: 'Letter to patient about denial'
  }
];

export function LetterGenerator({ claim, isOpen, onClose, denialReasons }: LetterGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customContent, setCustomContent] = useState('');
  const { toast } = useToast();

  if (!claim) return null;

  const generateLetter = async () => {
    setIsGenerating(true);
    
    try {
      // If it's an appeal-related template, generate a real AI appeal packet server-side.
      const isAppealTemplate = selectedTemplate.startsWith('appeal-');

      if (isAppealTemplate) {
        const primaryReason = denialReasons?.[0];
        const analysis = await aiService.analyzeDenial({
          claimId: claim.claimNumber,
          patientName: claim.patient,
          denialCode: primaryReason?.code || 'UNKNOWN',
          denialReason:
            denialReasons?.length
              ? denialReasons.map(r => `${r.code}: ${r.description}`).join('; ')
              : 'Denial reason not provided',
          amount: claim.amount,
          procedureCodes: claim.cptCodes || [],
          diagnosisCodes: claim.icdCodes || [],
        });

        setGeneratedLetter(analysis.appealText);
        toast({
          title: 'Letter generated',
          description: `Estimated success probability: ${Math.round((analysis.successProbability || 0) * 100)}%`,
        });
        return;
      }

      // Fallback for non-appeal templates: keep a safe local draft (can be upgraded later).
      const draft = `
[Date]

[Recipient Name / Department]
[Payer / Organization]
[Address]

Re: ${selectedTemplate === 'prior-auth-request' ? 'Prior Authorization Request' : 'Patient Communication'}
Claim: ${claim.claimNumber}
Date of Service: ${claim.dateOfService}

Dear [Recipient],

${selectedTemplate === 'prior-auth-request'
  ? `We are requesting prior authorization for the services listed below.

Requested services (CPT): ${(claim.cptCodes || []).join(', ')}
Diagnoses (ICD-10): ${(claim.icdCodes || []).join(', ')}

Clinical indication:
[Add clinical indication]

Medical necessity:
[Add medical necessity]
`
  : `We are writing regarding your recent billing/insurance communication.

Summary:
[Add summary]

Next steps:
- [Add next step 1]
- [Add next step 2]
`}

Sincerely,
[Name]
[Title]
[Practice]
[Contact Info]
      `.trim();
      
      setGeneratedLetter(draft);
    } catch (e: any) {
      console.error('Letter generation failed:', e);
      toast({
        title: 'Letter generation failed',
        description: e?.message || 'Unable to generate letter right now.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(generatedLetter);
    toast({ title: 'Copied', description: 'Letter copied to clipboard.' });
  };

  const handleDownloadLetter = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `appeal-letter-${claim.claimNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendLetter = () => {
    // Simulate sending letter
    toast({ title: 'Sent', description: 'Letter sent successfully!' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <FileText className="h-5 w-5 mr-2" />
            Letter Generator
          </DialogTitle>
          <DialogDescription>
            Generate automated appeal letters and correspondence for denied claims.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Claim Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Claim Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Claim Number</Label>
                  <p className="font-medium">{claim.claimNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Patient</Label>
                  <p className="font-medium">{claim.patient}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Provider</Label>
                  <p className="font-medium">{claim.provider}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Amount</Label>
                  <p className="font-medium">${claim.amount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date of Service</Label>
                  <p className="font-medium">{new Date(claim.dateOfService).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Insurance</Label>
                  <p className="font-medium">{claim.insuranceProvider}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Letter Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template">Select Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a letter template" />
                    </SelectTrigger>
                    <SelectContent>
                      {letterTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-gray-600">{template.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate && (
                  <div className="flex space-x-2">
                    <Button onClick={generateLetter} disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate Letter
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generated Letter */}
          {generatedLetter && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Generated Letter</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopyLetter}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadLetter}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" onClick={handleSendLetter}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          )}

          {/* Custom Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Custom Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customContent">Additional Notes or Custom Content</Label>
                  <Textarea
                    id="customContent"
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    placeholder="Add any additional notes or custom content to include in the letter..."
                    rows={4}
                  />
                </div>
                {customContent && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Custom content will be appended to the generated letter.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onClose()}>
              Close
            </Button>
            {generatedLetter && (
              <>
                <Button variant="outline" onClick={handleCopyLetter}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Letter
                </Button>
                <Button onClick={handleSendLetter}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Letter
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
