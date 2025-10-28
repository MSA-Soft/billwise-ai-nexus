import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  Circle, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  FileText, 
  Code, 
  CreditCard, 
  Eye,
  Save,
  Send,
  X,
  AlertCircle
} from 'lucide-react';
import { PatientSelectionStep } from './ClaimWizard/PatientSelectionStep';
import { ServiceDetailsStep } from './ClaimWizard/ServiceDetailsStep';
import { DiagnosisStep } from './ClaimWizard/DiagnosisStep';
import { InsuranceStep } from './ClaimWizard/InsuranceStep';
import { ReviewStep } from './ClaimWizard/ReviewStep';

interface ClaimFormData {
  patient: any;
  serviceDate: string;
  procedures: Array<{
    cptCode: string;
    description: string;
    units: number;
    amount: number;
  }>;
  diagnoses: Array<{
    icdCode: string;
    description: string;
    primary: boolean;
  }>;
  insurance: {
    primary: any;
    secondary?: any;
    authNumber?: string;
  };
  provider: any;
  notes: string;
}

interface ClaimFormWizardProps {
  claim?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClaimFormData) => void;
}

const steps = [
  { id: 1, title: 'Patient', icon: User, description: 'Select patient and basic info' },
  { id: 2, title: 'Services', icon: FileText, description: 'Add procedures and services' },
  { id: 3, title: 'Diagnosis', icon: Code, description: 'Add diagnosis codes' },
  { id: 4, title: 'Insurance', icon: CreditCard, description: 'Insurance and billing info' },
  { id: 5, title: 'Review', icon: Eye, description: 'Review and submit' }
];

export function ClaimFormWizard({ claim, isOpen, onClose, onSubmit }: ClaimFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showValidationError, setShowValidationError] = useState(false);
  const [formData, setFormData] = useState<ClaimFormData>({
    patient: claim?.patient || null,
    serviceDate: claim?.serviceDate || '',
    procedures: claim?.procedures || [],
    diagnoses: claim?.diagnoses || [],
    insurance: claim?.insurance || { primary: null },
    provider: claim?.provider || null,
    notes: claim?.notes || ''
  });

  useEffect(() => {
    // Form data monitoring for debugging
    // console.log('Form data changed:', formData);
  }, [formData]);

  const updateFormData = (stepData: Partial<ClaimFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...stepData };
      // console.log('Form data updated:', updated);
      return updated;
    });
  };

  const nextStep = () => {
    // console.log('Current step:', currentStep);
    // console.log('Form data:', formData);
    // console.log('Is step complete:', isStepComplete(currentStep));
    
    if (currentStep < steps.length && isStepComplete(currentStep)) {
      setCurrentStep(currentStep + 1);
      setShowValidationError(false);
    } else if (!isStepComplete(currentStep)) {
      // console.log('Step validation failed for step:', currentStep);
      setShowValidationError(true);
      setTimeout(() => setShowValidationError(false), 3000);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const isStepComplete = (stepId: number) => {
    switch (stepId) {
      case 1: return !!formData.patient;
      case 2: return formData.procedures.length > 0;
      case 3: return formData.diagnoses.length > 0 && formData.diagnoses.some((d: any) => d.primary);
      case 4: return !!formData.insurance.primary;
      case 5: return true;
      default: return false;
    }
  };

  const currentStepData = steps[currentStep - 1];
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PatientSelectionStep data={formData} onUpdate={updateFormData} />;
      case 2:
        return <ServiceDetailsStep data={formData} onUpdate={updateFormData} />;
      case 3:
        return <DiagnosisStep data={formData} onUpdate={updateFormData} />;
      case 4:
        return <InsuranceStep data={formData} onUpdate={updateFormData} />;
      case 5:
        return <ReviewStep data={formData} onUpdate={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            {claim ? 'Edit Claim' : 'New Claim'} - Step {currentStep} of {steps.length}
          </DialogTitle>
          <DialogDescription>
            Complete the multi-step process to create or edit a claim
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Progress: {Math.round(progress)}%
                  </span>
                  <span className="text-sm text-gray-500">
                    Step {currentStep} of {steps.length}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                
                {/* Step Indicators */}
                <div className="flex items-center justify-between">
                  {steps.map((step) => (
                    <div key={step.id} className="flex flex-col items-center space-y-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep === step.id 
                          ? 'bg-blue-600 text-white' 
                          : isStepComplete(step.id)
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                      }`}>
                        {isStepComplete(step.id) && currentStep !== step.id ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className={`text-xs font-medium ${
                          currentStep === step.id ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-400 hidden md:block">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <currentStepData.icon className="h-5 w-5 mr-2 text-blue-600" />
                {currentStepData.title}
                {isStepComplete(currentStep) && (
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showValidationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      {currentStep === 1 && "Please select a patient"}
                      {currentStep === 2 && "Please add at least one procedure"}
                      {currentStep === 3 && "Please add at least one diagnosis and mark one as primary"}
                      {currentStep === 4 && "Please select a primary insurance provider"}
                      {currentStep === 5 && "Please complete all required fields"}
                    </span>
                  </div>
                </div>
              )}
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="text-gray-600"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              
              {currentStep === steps.length ? (
                <Button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Claim
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!isStepComplete(currentStep)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
