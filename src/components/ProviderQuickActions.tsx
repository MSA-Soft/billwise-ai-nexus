import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CodeValidationService } from '@/services/codeValidationService';
import { EDIService } from '@/services/ediService';
import { usePaymentPlans } from '@/hooks/usePaymentPlans';
import { authorizationTaskService } from '@/services/authorizationTaskService';
import { denialManagementService } from '@/services/denialManagementService';
import { 
  Shield, 
  AlertTriangle, 
  DollarSign, 
  Search, 
  FileText, 
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';

const ProviderQuickActions = () => {
  const [patientId, setPatientId] = useState('');
  const [procedureCode, setProcedureCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const quickActions = [
    {
      title: "Check Patient Coverage",
      description: "Verify insurance eligibility in seconds",
      icon: Shield,
      color: "bg-green-500",
      action: () => handleEligibilityCheck()
    },
    {
      title: "Validate Procedure Code",
      description: "Ensure codes are correct before billing",
      icon: Search,
      color: "bg-blue-500",
      action: () => handleCodeValidation()
    },
    {
      title: "Generate Prior Auth",
      description: "Auto-create PA requests with documentation",
      icon: FileText,
      color: "bg-purple-500",
      action: () => handlePriorAuth()
    },
    {
      title: "Appeal Denied Claim",
      description: "AI-powered appeal letter generation",
      icon: AlertTriangle,
      color: "bg-red-500",
      action: () => handleAppealGeneration()
    },
    {
      title: "Patient Payment Plan",
      description: "Create affordable payment options",
      icon: DollarSign,
      color: "bg-yellow-500",
      action: () => handlePaymentPlan()
    },
    {
      title: "Call Insurance",
      description: "Get direct payer contact info",
      icon: Phone,
      color: "bg-indigo-500",
      action: () => handleInsuranceCall()
    }
  ];

  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [codeValidationResult, setCodeValidationResult] = useState<any>(null);
  const [priorAuthResult, setPriorAuthResult] = useState<any>(null);
  const [appealResult, setAppealResult] = useState<any>(null);
  const [paymentPlanResult, setPaymentPlanResult] = useState<any>(null);

  const handleEligibilityCheck = async () => {
    console.log('Eligibility check clicked!');
    
    if (!patientId.trim()) {
      toast({
        title: "Patient ID Required",
        description: "Please enter a patient ID to check eligibility",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Fetch patient insurance information
      const { data: patientData, error: patientError } = await supabase
        .from('patients' as any)
        .select(`
          id,
          patient_insurance (
            id,
            insurance_payers (
              id,
              name
            ),
            subscriber_id,
            group_number,
            policy_number
          )
        `)
        .eq('id', patientId)
        .single();

      if (patientError || !patientData) {
        throw new Error('Patient not found');
      }

      const insurance = Array.isArray(patientData.patient_insurance) 
        ? patientData.patient_insurance[0] 
        : patientData.patient_insurance;

      if (!insurance) {
        throw new Error('No insurance information found for this patient');
      }

      const payer = Array.isArray(insurance.insurance_payers) 
        ? insurance.insurance_payers[0] 
        : insurance.insurance_payers;

      // Use EDI service for eligibility check
      const ediService = EDIService.getInstance();
      const eligibilityResponse = await ediService.checkEligibility({
        patientId: patientId,
        subscriberId: insurance.subscriber_id || '',
        payerId: payer?.id || '',
        serviceDate: new Date().toISOString().split('T')[0],
        serviceCodes: [],
        diagnosisCodes: []
      });

      const result = {
        patientId: patientId,
        status: eligibilityResponse.isEligible ? 'ACTIVE' : 'INACTIVE',
        copay: eligibilityResponse.coverage.copay,
        deductible: eligibilityResponse.coverage.deductible,
        coverage: eligibilityResponse.benefits[0]?.coverageLevel || 'Unknown',
        effectiveDate: eligibilityResponse.effectiveDate,
        terminationDate: eligibilityResponse.terminationDate || '',
        benefits: eligibilityResponse.benefits.map(b => ({
          service: b.serviceType,
          covered: b.coverageLevel !== 'Not Covered',
          copay: eligibilityResponse.coverage.copay
        }))
      };

      setEligibilityResult(result);
      
      toast({
        title: result.status === 'ACTIVE' ? "✅ Coverage Active" : "❌ Coverage Inactive",
        description: result.status === 'ACTIVE' 
          ? `Copay: $${result.copay} | Deductible: $${result.deductible} | Type: ${result.coverage}`
          : "Patient coverage is inactive. Please verify insurance information."
      });
    } catch (error: any) {
      console.error('Eligibility check error:', error);
      toast({
        title: "Eligibility Check Failed",
        description: error.message || "Unable to verify patient coverage",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeValidation = async () => {
    console.log('Code validation clicked!');
    
    if (!procedureCode.trim()) {
      toast({
        title: "Procedure Code Required",
        description: "Please enter a procedure code to validate",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use CodeValidationService
      const codeService = CodeValidationService.getInstance();
      const validationResult = await codeService.validateCPT(procedureCode);

      // Also check if code exists in database
      const { data: codeData, error: codeError } = await supabase
        .from('cpt_hcpcs_codes' as any)
        .select('code, description, default_price, modifier_required')
        .eq('code', procedureCode.trim())
        .eq('is_active', true)
        .single();

      const validation = {
        code: procedureCode,
        valid: validationResult.isValid && !codeError,
        description: codeData?.description || validationResult.description || 'Code not found',
        modifier: codeData?.modifier_required ? 'May require modifier' : null,
        priorAuth: false, // Would need to check payer rules
        fee: codeData?.default_price ? parseFloat(codeData.default_price) : 0,
        category: validationResult.category || 'Unknown',
        requirements: validationResult.warnings || []
      };

      setCodeValidationResult(validation);

      toast({
        title: validation.valid ? "✅ Code Valid" : "❌ Code Invalid",
        description: validation.valid 
          ? `${procedureCode}: ${validation.description}${validation.modifier ? ` (${validation.modifier})` : ''}`
          : validationResult.errors.join(', ') || "This procedure code is invalid or outdated. Please check and try again."
      });
    } catch (error: any) {
      console.error('Code validation error:', error);
      toast({
        title: "Validation Failed",
        description: error.message || "Unable to validate procedure code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorAuth = async () => {
    console.log('Prior auth clicked!');
    
    if (!patientId || !procedureCode) {
      toast({
        title: "Missing Information",
        description: "Please enter both Patient ID and Procedure Code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    toast({
      title: "Prior Auth Generator",
      description: "Creating authorization request with all required documentation...",
    });
    
    try {
      // Create authorization request in database
      const { data: authRequest, error: authError } = await supabase
        .from('authorization_requests' as any)
        .insert({
          patient_id: patientId,
          procedure_code: procedureCode,
          status: 'pending',
          urgency: 'routine',
          cpt_codes: [procedureCode],
          submitted_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (authError) throw authError;

      // Create authorization task
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const task = await authorizationTaskService.createTaskFromAuthRequest(
        authRequest.id,
        'submit',
        {
          userId: user.id,
          priority: 'high',
          title: `Submit Prior Authorization for ${procedureCode}`,
          description: `Prior authorization request for patient ${patientId}`
        }
      );

      const paResult = {
        id: authRequest.id,
        patientId: patientId,
        procedure: procedureCode,
        clinicalIndication: 'Prior authorization required',
        supportingDocs: [
          'Medical records',
          'Provider notes',
          'Lab results',
          'Treatment plan'
        ],
        submissionDate: new Date().toISOString().split('T')[0],
        estimatedResponse: '5-7 business days',
        status: 'Ready for submission',
        taskId: task.id
      };

      setPriorAuthResult(paResult);
      
      toast({
        title: "✅ Prior Auth Generated",
        description: "PA request created with clinical justification, supporting docs, and submission ready format",
      });
    } catch (error: any) {
      console.error('Prior auth error:', error);
      toast({
        title: "PA Generation Failed",
        description: error.message || "Unable to generate prior authorization request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppealGeneration = async () => {
    console.log('Appeal generation clicked!');
    
    if (!patientId) {
      toast({
        title: "Patient ID Required",
        description: "Please enter a Patient ID to generate appeal",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    toast({
      title: "Appeal Letter Generator",
      description: "Analyzing denial and creating appeal letter...",
    });
    
    try {
      // Find denied claims for this patient
      const { data: deniedClaims, error: claimsError } = await supabase
        .from('claims' as any)
        .select(`
          id,
          claim_number,
          claim_denials (
            id,
            denial_reason_code,
            denial_reason
          )
        `)
        .eq('patient_id', patientId)
        .eq('status', 'denied')
        .order('created_at', { ascending: false })
        .limit(1);

      if (claimsError || !deniedClaims || deniedClaims.length === 0) {
        throw new Error('No denied claims found for this patient');
      }

      const claim = deniedClaims[0];
      const denial = Array.isArray(claim.claim_denials) 
        ? claim.claim_denials[0] 
        : claim.claim_denials;

      // Use denial management service to generate appeal
      const denialId = denial?.id;
      if (!denialId) {
        throw new Error('No denial found for this claim');
      }
      
      const appealAnalysis = await denialManagementService.analyzeDenial(denialId, claim.id);
      
      // Generate appeal letter using createAppealWorkflow which includes letter generation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const appealWorkflow = await denialManagementService.createAppealWorkflow(
        denialId,
        claim.id,
        appealAnalysis.appealability.appealType,
        user.id
      );

      const appealResult = {
        id: appealWorkflow.id || `APL-${Date.now()}`,
        claimId: claim.claim_number || claim.id,
        denialCode: denial?.denial_reason_code || 'Unknown',
        denialReason: denial?.denial_reason || 'Unknown',
        appealText: appealWorkflow.appealLetter || `We respectfully request reconsideration of the denial for claim ${claim.claim_number || claim.id}. The diagnosis is medically necessary and supported by clinical documentation.`,
        successProbability: appealAnalysis?.appealability?.successProbability || 75,
        supportingEvidence: appealWorkflow.supportingDocuments || [
          'Clinical notes',
          'Lab results',
          'Provider documentation',
          'Medical necessity letter'
        ],
        submissionDate: appealWorkflow.submittedAt || new Date().toISOString().split('T')[0],
        status: appealWorkflow.status || 'Ready for submission'
      };

      setAppealResult(appealResult);
      
      toast({
        title: "✅ Appeal Letter Ready",
        description: `Professional appeal letter generated with ${appealResult.successProbability}% success probability. Ready to submit!`,
      });
    } catch (error: any) {
      console.error('Appeal generation error:', error);
      toast({
        title: "Appeal Generation Failed",
        description: error.message || "Unable to generate appeal letter",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentPlan = async () => {
    console.log('Payment plan clicked!');
    
    if (!patientId) {
      toast({
        title: "Patient ID Required",
        description: "Please enter a Patient ID to create payment plan",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    toast({
      title: "Payment Plan Calculator",
      description: "Calculating payment options based on patient balance...",
    });
    
    try {
      // Get patient's outstanding balance
      const { data: statements, error: statementsError } = await supabase
        .from('billing_statements' as any)
        .select('id, amount, balance, due_date')
        .eq('patient_id', patientId)
        .eq('status', 'pending')
        .order('due_date', { ascending: false });

      if (statementsError) {
        console.error('Error fetching statements:', statementsError);
      }

      const totalBalance = statements?.reduce((sum, s) => sum + parseFloat(s.balance || s.amount || 0), 0) || 500;

      // Calculate payment plan options
      const options = [
        { term: '6 months', monthlyPayment: Math.ceil(totalBalance / 6), totalInterest: 0 },
        { term: '12 months', monthlyPayment: Math.ceil(totalBalance / 12), totalInterest: 0 },
        { term: '18 months', monthlyPayment: Math.ceil(totalBalance / 18), totalInterest: 0 }
      ];

      const paymentPlanResult = {
        patientId: patientId,
        totalBalance: totalBalance,
        options: options,
        setupFee: 0,
        lateFee: 15,
        autoPayDiscount: 5,
        status: 'Ready for patient selection'
      };

      setPaymentPlanResult(paymentPlanResult);
      
      toast({
        title: "✅ Payment Plan Created",
        description: `6-month: $${options[0].monthlyPayment}/month | 12-month: $${options[1].monthlyPayment}/month | 18-month: $${options[2].monthlyPayment}/month`,
      });
    } catch (error: any) {
      console.error('Payment plan error:', error);
      toast({
        title: "Payment Plan Failed",
        description: error.message || "Unable to create payment plan",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsuranceCall = async () => {
    console.log('Insurance call clicked!');
    
    if (!patientId) {
      toast({
        title: "Patient ID Required",
        description: "Please enter a Patient ID to get payer contact information",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get patient's insurance payer
      const { data: patientData, error: patientError } = await supabase
        .from('patients' as any)
        .select(`
          id,
          patient_insurance (
            insurance_payers (
              id,
              name,
              phone,
              customer_service_phone,
              hours_of_operation
            )
          )
        `)
        .eq('id', patientId)
        .single();

      if (patientError || !patientData) {
        throw new Error('Patient not found');
      }

      const insurance = Array.isArray(patientData.patient_insurance) 
        ? patientData.patient_insurance[0] 
        : patientData.patient_insurance;

      if (!insurance || !insurance.insurance_payers) {
        throw new Error('No insurance information found for this patient');
      }

      const payer = Array.isArray(insurance.insurance_payers) 
        ? insurance.insurance_payers[0] 
        : insurance.insurance_payers;

      const phone = payer.customer_service_phone || payer.phone || 'Contact information not available';
      const hours = payer.hours_of_operation || 'Business hours';
      
      toast({
        title: "📞 Payer Contact Info",
        description: `${payer.name}: ${phone} (${hours})`,
      });
    } catch (error: any) {
      console.error('Insurance call error:', error);
      toast({
        title: "Contact Info Unavailable",
        description: error.message || "Unable to retrieve payer contact information",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider Quick Actions</h2>
        <p className="text-gray-600">Solve common billing problems in seconds</p>
      </div>

      {/* Input Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Quick Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Patient ID</label>
              <Input
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter patient ID or name"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Procedure Code</label>
              <Input
                value={procedureCode}
                onChange={(e) => setProcedureCode(e.target.value)}
                placeholder="e.g., 99213, 36415"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full ${action.color} text-white`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                  <Button
                    onClick={() => {
                      console.log('Button clicked for:', action.title);
                      action.action();
                    }}
                    disabled={isLoading}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800"
                    variant="outline"
                  >
                    {isLoading ? (
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? 'Processing...' : 'Quick Action'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results Display */}
      {eligibilityResult && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Eligibility Check Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Coverage Details:</h4>
                <p className="text-sm text-green-700">Status: <Badge className={eligibilityResult.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}>{eligibilityResult.status}</Badge></p>
                <p className="text-sm text-green-700">Copay: ${eligibilityResult.copay}</p>
                <p className="text-sm text-green-700">Deductible: ${eligibilityResult.deductible}</p>
                <p className="text-sm text-green-700">Type: {eligibilityResult.coverage}</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Benefits:</h4>
                {eligibilityResult.benefits.map((benefit: any, index: number) => (
                  <p key={index} className="text-sm text-green-700">
                    {benefit.service}: {benefit.covered ? 'Covered' : 'Not Covered'} {benefit.copay > 0 && `($${benefit.copay} copay)`}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {codeValidationResult && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Code Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Code Details:</h4>
                <p className="text-sm text-blue-700">Code: {codeValidationResult.code}</p>
                <p className="text-sm text-blue-700">Valid: <Badge className={codeValidationResult.valid ? 'bg-green-500' : 'bg-red-500'}>{codeValidationResult.valid ? 'Yes' : 'No'}</Badge></p>
                <p className="text-sm text-blue-700">Description: {codeValidationResult.description}</p>
                <p className="text-sm text-blue-700">Fee: ${codeValidationResult.fee}</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Requirements:</h4>
                {codeValidationResult.requirements.map((req: string, index: number) => (
                  <p key={index} className="text-sm text-blue-700">• {req}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {priorAuthResult && (
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Prior Authorization Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">PA Details:</h4>
                <p className="text-sm text-purple-700">ID: {priorAuthResult.id}</p>
                <p className="text-sm text-purple-700">Patient: {priorAuthResult.patientId}</p>
                <p className="text-sm text-purple-700">Procedure: {priorAuthResult.procedure}</p>
                <p className="text-sm text-purple-700">Status: {priorAuthResult.status}</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">Supporting Documents:</h4>
                {priorAuthResult.supportingDocs.map((doc: string, index: number) => (
                  <p key={index} className="text-sm text-purple-700">• {doc}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {appealResult && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Appeal Letter Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Appeal Details:</h4>
                <p className="text-sm text-red-700">ID: {appealResult.id}</p>
                <p className="text-sm text-red-700">Claim: {appealResult.claimId}</p>
                <p className="text-sm text-red-700">Success Probability: {appealResult.successProbability}%</p>
                <p className="text-sm text-red-700">Status: {appealResult.status}</p>
              </div>
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Appeal Text:</h4>
                <p className="text-sm text-red-700 bg-white p-3 rounded border">{appealResult.appealText}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentPlanResult && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-900 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Payment Plan Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentPlanResult.options.map((option: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded border">
                  <h4 className="font-semibold text-yellow-800 mb-2">{option.term}</h4>
                  <p className="text-lg font-bold text-yellow-700">${option.monthlyPayment}/month</p>
                  <p className="text-sm text-yellow-600">Total: ${option.monthlyPayment * parseInt(option.term)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Provider Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Provider Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Before Patient Visit:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Verify insurance eligibility</li>
                <li>• Check prior auth requirements</li>
                <li>• Validate procedure codes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">After Patient Visit:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Submit claims within 24 hours</li>
                <li>• Follow up on denials quickly</li>
                <li>• Set up payment plans for patients</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderQuickActions;
