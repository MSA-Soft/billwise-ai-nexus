import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Upload,
  Copy,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { nlpService, type ExtractedData } from '@/services/nlpService';

interface ClinicalNotesExtractorProps {
  onDataExtracted?: (data: ExtractedData) => void;
  formType?: 'authorization' | 'claim' | 'patient';
}

export function ClinicalNotesExtractor({
  onDataExtracted,
  formType = 'authorization',
}: ClinicalNotesExtractorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [fieldsExtracted, setFieldsExtracted] = useState<string[]>([]);
  const [fieldsMissing, setFieldsMissing] = useState<string[]>([]);

  const handleExtract = async () => {
    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter clinical notes text',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const result = await nlpService.extractFromClinicalNotes(text);

      setExtractedData(result.extractedData);
      setConfidence(result.confidence);
      setFieldsExtracted(result.fieldsExtracted);
      setFieldsMissing(result.fieldsMissing);

      if (result.confidence >= 70) {
        toast({
          title: 'Extraction Complete',
          description: `Extracted ${result.fieldsExtracted.length} fields with ${result.confidence}% confidence`,
        });
      } else {
        toast({
          title: 'Extraction Complete',
          description: `Low confidence extraction. Please review extracted data.`,
          variant: 'destructive',
        });
      }

      if (onDataExtracted) {
        onDataExtracted(result.extractedData);
      }
    } catch (error: any) {
      toast({
        title: 'Extraction Failed',
        description: error.message || 'Failed to extract data from clinical notes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoPopulate = async () => {
    if (!extractedData) return;

    try {
      const formData = await nlpService.autoPopulateForm(extractedData, formType);
      
      toast({
        title: 'Form Auto-Populated',
        description: 'Form fields have been populated with extracted data',
      });

      // In production, would pass this to parent component
      console.log('Auto-populated form data:', formData);
    } catch (error: any) {
      toast({
        title: 'Auto-Population Failed',
        description: error.message || 'Failed to auto-populate form',
        variant: 'destructive',
      });
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Text copied to clipboard',
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Clinical Notes Extractor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Paste Clinical Notes</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste clinical notes, progress notes, or medical documentation here..."
              className="min-h-32 mt-2"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {text.length} characters
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyText}
                disabled={!text}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>

          <Button
            onClick={handleExtract}
            disabled={loading || !text.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Extracting...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Extract Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {extractedData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Extracted Data</CardTitle>
              <Badge className={confidence >= 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {confidence}% confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Confidence Indicator */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Extraction Confidence</span>
                <span className="text-sm">{confidence}%</span>
              </div>
              <Progress value={confidence} className="h-2" />
            </div>

            {/* Extracted Fields */}
            {fieldsExtracted.length > 0 && (
              <div>
                <Label className="mb-2 block">Extracted Fields ({fieldsExtracted.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {fieldsExtracted.map((field, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Fields */}
            {fieldsMissing.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Missing Fields ({fieldsMissing.length})</div>
                  <div className="flex flex-wrap gap-2">
                    {fieldsMissing.map((field, index) => (
                      <Badge key={index} variant="outline" className="bg-yellow-50">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Extracted Data Display */}
            <div className="space-y-3 border rounded-lg p-4">
              {extractedData.patientInfo && (
                <div>
                  <Label className="text-sm font-semibold">Patient Information</Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    {extractedData.patientInfo.name && <div>Name: {extractedData.patientInfo.name}</div>}
                    {extractedData.patientInfo.dob && <div>DOB: {extractedData.patientInfo.dob}</div>}
                    {extractedData.patientInfo.age && <div>Age: {extractedData.patientInfo.age}</div>}
                    {extractedData.patientInfo.gender && <div>Gender: {extractedData.patientInfo.gender}</div>}
                  </div>
                </div>
              )}

              {extractedData.diagnosis && (
                <div>
                  <Label className="text-sm font-semibold">Diagnosis</Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    {extractedData.diagnosis.primary && (
                      <div>Primary: {extractedData.diagnosis.primary}</div>
                    )}
                    {extractedData.diagnosis.icdCodes && extractedData.diagnosis.icdCodes.length > 0 && (
                      <div>ICD Codes: {extractedData.diagnosis.icdCodes.join(', ')}</div>
                    )}
                  </div>
                </div>
              )}

              {extractedData.procedures && extractedData.procedures.codes && extractedData.procedures.codes.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold">Procedures</Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    CPT Codes: {extractedData.procedures.codes.join(', ')}
                  </div>
                </div>
              )}

              {extractedData.clinicalIndication && (
                <div>
                  <Label className="text-sm font-semibold">Clinical Indication</Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    {extractedData.clinicalIndication}
                  </div>
                </div>
              )}

              {extractedData.medicalNecessity && (
                <div>
                  <Label className="text-sm font-semibold">Medical Necessity</Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    {extractedData.medicalNecessity}
                  </div>
                </div>
              )}
            </div>

            {/* Auto-Populate Button */}
            {confidence >= 70 && (
              <Button
                onClick={handleAutoPopulate}
                className="w-full"
                variant="default"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Auto-Populate {formType} Form
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

