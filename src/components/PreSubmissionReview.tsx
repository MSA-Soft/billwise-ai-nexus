import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  FileText,
  User,
  CreditCard,
  Calendar,
  DollarSign,
  Shield,
  Send,
  Save
} from 'lucide-react';
import { claimSubmissionService, type ClaimSubmissionData, type ClaimValidationResult, type TimelyFilingInfo } from '@/services/claimSubmissionService';

interface PreSubmissionReviewProps {
  claimData: ClaimSubmissionData;
  onBack: () => void;
  onSubmit: (data: ClaimSubmissionData) => void;
  onSaveDraft: (data: ClaimSubmissionData) => void;
}

export function PreSubmissionReview({ claimData, onBack, onSubmit, onSaveDraft }: PreSubmissionReviewProps) {
  const { toast } = useToast();
  const [validation, setValidation] = useState<ClaimValidationResult | null>(null);
  const [timelyFiling, setTimelyFiling] = useState<TimelyFilingInfo | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    validateClaim();
  }, [claimData]);

  const validateClaim = async () => {
    setIsValidating(true);
    try {
      const result = await claimSubmissionService.validateClaimSubmission(claimData);
      setValidation(result);

      const filingInfo = await claimSubmissionService.checkTimelyFiling(
        claimData.service_date_from,
        claimData.primary_insurance_id
      );
      setTimelyFiling(filingInfo);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async () => {
    if (!validation?.canSubmit) {
      toast({
        title: 'Cannot Submit',
        description: 'Please fix all errors before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(claimData);
      toast({
        title: 'Claim Submitted',
        description: 'Your claim has been submitted successfully.',
      });
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit claim. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      await onSaveDraft(claimData);
      toast({
        title: 'Draft Saved',
        description: 'Your claim has been saved as a draft.',
      });
    } catch (error: any) {
      console.error('Save draft error:', error);
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save draft. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getTimelyFilingBadge = () => {
    if (!timelyFiling) return null;

    const colors = {
      none: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-orange-100 text-orange-800',
      expired: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[timelyFiling.warningLevel]}>
        {timelyFiling.isPastDeadline
          ? 'Past Deadline'
          : `${timelyFiling.daysRemaining} days remaining`}
      </Badge>
    );
  };

  if (isValidating) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Validating claim...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Validation Summary */}
      <Card className={validation?.canSubmit ? 'border-green-200' : 'border-red-200'}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Pre-Submission Review
            </span>
            {validation?.canSubmit ? (
              <Badge className="bg-green-100 text-green-800">Ready to Submit</Badge>
            ) : (
              <Badge variant="destructive">Cannot Submit</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Errors */}
          {validation?.errors && validation.errors.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Errors Found</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside mt-2">
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings */}
          {validation?.warnings && validation.warnings.length > 0 && (
            <Alert className="mb-4 border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Warnings</AlertTitle>
              <AlertDescription className="text-yellow-700">
                <ul className="list-disc list-inside mt-2">
                  {validation.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Requirements */}
          {validation?.requirements && validation.requirements.length > 0 && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Requirements</AlertTitle>
              <AlertDescription className="text-blue-700">
                <ul className="list-disc list-inside mt-2">
                  {validation.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {validation?.canSubmit && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Validation Passed</AlertTitle>
              <AlertDescription className="text-green-700">
                All required fields are complete and validated. Ready to submit.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Validation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Patient */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(!!claimData.patient_id)}
                <div>
                  <p className="font-medium">Patient Selected</p>
                  <p className="text-sm text-muted-foreground">Patient information required</p>
                </div>
              </div>
            </div>

            {/* Provider */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(!!claimData.provider_id)}
                <div>
                  <p className="font-medium">Provider Selected</p>
                  <p className="text-sm text-muted-foreground">Billing provider required</p>
                </div>
              </div>
            </div>

            {/* Service Date */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(!!claimData.service_date_from)}
                <div>
                  <p className="font-medium">Service Date</p>
                  <p className="text-sm text-muted-foreground">
                    {claimData.service_date_from || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Procedures */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon((claimData.procedures?.length || 0) > 0)}
                <div>
                  <p className="font-medium">Procedures</p>
                  <p className="text-sm text-muted-foreground">
                    {claimData.procedures?.length || 0} procedure(s) added
                  </p>
                </div>
              </div>
            </div>

            {/* Diagnoses */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(
                  (claimData.diagnoses?.length || 0) > 0 &&
                  claimData.diagnoses?.some(d => d.is_primary)
                )}
                <div>
                  <p className="font-medium">Diagnoses</p>
                  <p className="text-sm text-muted-foreground">
                    {claimData.diagnoses?.length || 0} diagnosis(es),{' '}
                    {claimData.diagnoses?.filter(d => d.is_primary).length || 0} primary
                  </p>
                </div>
              </div>
            </div>

            {/* Insurance */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(!!claimData.primary_insurance_id)}
                <div>
                  <p className="font-medium">Primary Insurance</p>
                  <p className="text-sm text-muted-foreground">Required for submission</p>
                </div>
              </div>
            </div>

            {/* Timely Filing */}
            {timelyFiling && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(!timelyFiling.isPastDeadline)}
                  <div>
                    <p className="font-medium">Timely Filing</p>
                    <p className="text-sm text-muted-foreground">
                      Deadline: {timelyFiling.deadline.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {getTimelyFilingBadge()}
              </div>
            )}

            {/* Prior Authorization */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(true)} {/* Always show as optional */}
                <div>
                  <p className="font-medium">Prior Authorization</p>
                  <p className="text-sm text-muted-foreground">
                    {claimData.prior_auth_number ? 'Provided' : 'Not required or not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claim Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Claim Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Charges</p>
              <p className="text-2xl font-bold">${claimData.total_charges.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Procedures</p>
              <p className="text-2xl font-bold">{claimData.procedures?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Diagnoses</p>
              <p className="text-2xl font-bold">{claimData.diagnoses?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Form Type</p>
              <p className="text-2xl font-bold">{claimData.form_type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!validation?.canSubmit || isSubmitting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Claim
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

