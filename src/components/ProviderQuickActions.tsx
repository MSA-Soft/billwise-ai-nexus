import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
      // Simulate eligibility check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        patientId: patientId,
        status: Math.random() > 0.2 ? 'ACTIVE' : 'INACTIVE',
        copay: Math.floor(Math.random() * 50) + 10,
        deductible: Math.floor(Math.random() * 2000) + 500,
        coverage: ['PPO', 'HMO', 'EPO'][Math.floor(Math.random() * 3)],
        effectiveDate: '2024-01-01',
        terminationDate: '2024-12-31',
        benefits: [
          { service: 'Office Visits', covered: true, copay: 25 },
          { service: 'Lab Work', covered: true, copay: 0 },
          { service: 'X-rays', covered: true, copay: 50 }
        ]
      };

      setEligibilityResult(mockResult);
      
      toast({
        title: mockResult.status === 'ACTIVE' ? "✅ Coverage Active" : "❌ Coverage Inactive",
        description: mockResult.status === 'ACTIVE' 
          ? `Copay: $${mockResult.copay} | Deductible: $${mockResult.deductible} | Type: ${mockResult.coverage}`
          : "Patient coverage is inactive. Please verify insurance information."
      });
    } catch (error) {
      toast({
        title: "Eligibility Check Failed",
        description: "Unable to verify patient coverage",
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockValidation = {
        code: procedureCode,
        valid: Math.random() > 0.3,
        description: "Office visit, established patient",
        modifier: Math.random() > 0.5 ? "25" : null,
        priorAuth: Math.random() > 0.7,
        fee: Math.floor(Math.random() * 200) + 100,
        category: "Evaluation and Management",
        requirements: [
          "Medical decision making of low complexity",
          "15-29 minutes of total time",
          "Documentation of history and examination"
        ]
      };

      setCodeValidationResult(mockValidation);

      toast({
        title: mockValidation.valid ? "✅ Code Valid" : "❌ Code Invalid",
        description: mockValidation.valid 
          ? `${procedureCode}: ${mockValidation.description}${mockValidation.modifier ? ` (Modifier: ${mockValidation.modifier})` : ''}`
          : "This procedure code is invalid or outdated. Please check and try again."
      });
    } catch (error) {
      toast({
        title: "Validation Failed",
        description: "Unable to validate procedure code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorAuth = async () => {
    console.log('Prior auth clicked!');
    
    setIsLoading(true);
    toast({
      title: "Prior Auth Generator",
      description: "AI is creating a comprehensive PA request with all required documentation...",
    });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockPA = {
        id: `PA-${Date.now()}`,
        patientId: patientId || 'PAT-001',
        procedure: procedureCode || '99213',
        clinicalIndication: 'Diabetes management and monitoring',
        supportingDocs: [
          'Medical records',
          'Provider notes',
          'Lab results',
          'Treatment plan'
        ],
        submissionDate: new Date().toISOString().split('T')[0],
        estimatedResponse: '5-7 business days',
        status: 'Ready for submission'
      };

      setPriorAuthResult(mockPA);
      
      toast({
        title: "✅ Prior Auth Generated",
        description: "PA request created with clinical justification, supporting docs, and submission ready format",
      });
    } catch (error) {
      toast({
        title: "PA Generation Failed",
        description: "Unable to generate prior authorization request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppealGeneration = async () => {
    console.log('Appeal generation clicked!');
    
    setIsLoading(true);
    toast({
      title: "Appeal Letter Generator",
      description: "AI is analyzing the denial and creating a compelling appeal letter...",
    });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const mockAppeal = {
        id: `APL-${Date.now()}`,
        claimId: 'CLM-2024-001',
        denialCode: 'CO-11',
        denialReason: 'Diagnosis not covered',
        appealText: `We respectfully request reconsideration of the denial for claim ${'CLM-2024-001'}. The diagnosis is medically necessary and supported by clinical documentation. The patient's condition requires this treatment for optimal health outcomes.`,
        successProbability: 85,
        supportingEvidence: [
          'Clinical notes',
          'Lab results',
          'Provider documentation',
          'Medical necessity letter'
        ],
        submissionDate: new Date().toISOString().split('T')[0],
        status: 'Ready for submission'
      };

      setAppealResult(mockAppeal);
      
      toast({
        title: "✅ Appeal Letter Ready",
        description: "Professional appeal letter generated with 85% success probability. Ready to submit!",
      });
    } catch (error) {
      toast({
        title: "Appeal Generation Failed",
        description: "Unable to generate appeal letter",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentPlan = async () => {
    console.log('Payment plan clicked!');
    
    setIsLoading(true);
    toast({
      title: "Payment Plan Calculator",
      description: "Creating flexible payment options based on patient's financial situation...",
    });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPaymentPlan = {
        patientId: patientId || 'PAT-001',
        totalBalance: 500,
        options: [
          { term: '6 months', monthlyPayment: 83, totalInterest: 0 },
          { term: '12 months', monthlyPayment: 42, totalInterest: 0 },
          { term: '18 months', monthlyPayment: 28, totalInterest: 0 }
        ],
        setupFee: 0,
        lateFee: 15,
        autoPayDiscount: 5,
        status: 'Ready for patient selection'
      };

      setPaymentPlanResult(mockPaymentPlan);
      
      toast({
        title: "✅ Payment Plan Created",
        description: "6-month plan: $83/month | 12-month plan: $42/month. Patient can choose their preferred option.",
      });
    } catch (error) {
      toast({
        title: "Payment Plan Failed",
        description: "Unable to create payment plan",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsuranceCall = () => {
    console.log('Insurance call clicked!');
    
    const payerContacts = [
      { name: "Aetna", phone: "1-800-624-0756", hours: "8AM-8PM EST" },
      { name: "BCBS", phone: "1-800-676-2583", hours: "7AM-7PM EST" },
      { name: "Cigna", phone: "1-800-997-1654", hours: "8AM-8PM EST" },
      { name: "UnitedHealth", phone: "1-800-842-5252", hours: "24/7" }
    ];
    
    const randomPayer = payerContacts[Math.floor(Math.random() * payerContacts.length)];
    
    toast({
      title: "📞 Payer Contact Info",
      description: `${randomPayer.name}: ${randomPayer.phone} (${randomPayer.hours})`,
    });
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
