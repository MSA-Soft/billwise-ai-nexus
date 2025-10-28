import React, { useState, useEffect } from 'react';
import { ClaimsDashboard } from './ClaimsDashboard';
import { ClaimsTable } from './ClaimsTable';
import { ClaimFormWizard } from './ClaimFormWizard';
import { ClaimDetailModal } from './ClaimDetailModal';
import { ClaimsStats } from './ClaimsStats';
import { ClaimsFilter } from './ClaimsFilter';
import { ClaimsActions } from './ClaimsActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Search, 
  Plus, 
  Filter,
  Download,
  Upload,
  RefreshCw,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Send,
  Eye,
  Edit
} from 'lucide-react';

// Mock data for demonstration - in real app this would come from your database
const mockClaims = [
  {
    id: 'CLM-001',
    patient: 'John Doe',
    provider: 'Dr. Smith',
    dateOfService: '2024-01-15',
    submissionDate: '2024-01-16',
    amount: '$450.00',
    status: 'approved',
    payer: 'Blue Cross Blue Shield',
    cptCodes: ['99213', '36415'],
    icdCodes: ['I10', 'Z00.00'],
    totalCharges: 450.00,
    patientResponsibility: 50.00,
    insuranceAmount: 400.00,
    copayAmount: 25.00,
    deductibleAmount: 25.00,
    priorAuthNumber: 'PA123456',
    referralNumber: 'REF789',
    notes: 'Routine checkup with blood work',
    formType: 'HCFA',
    submissionMethod: 'EDI',
    isSecondaryClaim: false,
    procedures: [
      {
        cptCode: '99213',
        description: 'Office visit, established patient',
        units: 1,
        amount: 200.00
      },
      {
        cptCode: '36415',
        description: 'Blood draw',
        units: 1,
        amount: 250.00
      }
    ],
    diagnoses: [
      {
        icdCode: 'I10',
        description: 'Essential hypertension',
        primary: true
      },
      {
        icdCode: 'Z00.00',
        description: 'Encounter for general adult medical examination',
        primary: false
      }
    ]
  },
  {
    id: 'CLM-002',
    patient: 'Sarah Wilson',
    provider: 'Dr. Johnson',
    dateOfService: '2024-01-14',
    submissionDate: '2024-01-15',
    amount: '$320.00',
    status: 'pending',
    payer: 'Aetna',
    cptCodes: ['99214'],
    icdCodes: ['E11.9'],
    totalCharges: 320.00,
    patientResponsibility: 40.00,
    insuranceAmount: 280.00,
    copayAmount: 20.00,
    deductibleAmount: 20.00,
    priorAuthNumber: '',
    referralNumber: '',
    notes: 'Diabetes follow-up visit',
    formType: 'HCFA',
    submissionMethod: 'EDI',
    isSecondaryClaim: false,
    procedures: [
      {
        cptCode: '99214',
        description: 'Office visit, established patient',
        units: 1,
        amount: 320.00
      }
    ],
    diagnoses: [
      {
        icdCode: 'E11.9',
        description: 'Type 2 diabetes mellitus without complications',
        primary: true
      }
    ]
  },
  {
    id: 'CLM-003',
    patient: 'Mike Brown',
    provider: 'Dr. Davis',
    dateOfService: '2024-01-13',
    submissionDate: '2024-01-14',
    amount: '$180.00',
    status: 'denied',
    payer: 'Medicare',
    cptCodes: ['99212'],
    icdCodes: ['M79.3'],
    totalCharges: 180.00,
    patientResponsibility: 36.00,
    insuranceAmount: 144.00,
    copayAmount: 0.00,
    deductibleAmount: 36.00,
    priorAuthNumber: '',
    referralNumber: '',
    notes: 'Denied - insufficient documentation',
    formType: 'HCFA',
    submissionMethod: 'EDI',
    isSecondaryClaim: false,
    procedures: [
      {
        cptCode: '99212',
        description: 'Office visit, established patient',
        units: 1,
        amount: 180.00
      }
    ],
    diagnoses: [
      {
        icdCode: 'M79.3',
        description: 'Panniculitis, unspecified',
        primary: true
      }
    ]
  },
  {
    id: 'CLM-004',
    patient: 'Emily Davis',
    provider: 'Dr. Wilson',
    dateOfService: '2024-01-12',
    submissionDate: '2024-01-13',
    amount: '$750.00',
    status: 'processing',
    payer: 'Cigna',
    cptCodes: ['99215', '93000'],
    icdCodes: ['I25.10'],
    totalCharges: 750.00,
    patientResponsibility: 75.00,
    insuranceAmount: 675.00,
    copayAmount: 50.00,
    deductibleAmount: 25.00,
    priorAuthNumber: 'PA789012',
    referralNumber: '',
    notes: 'Cardiology consultation with EKG',
    formType: 'HCFA',
    submissionMethod: 'EDI',
    isSecondaryClaim: false,
    procedures: [
      {
        cptCode: '99215',
        description: 'Office visit, established patient',
        units: 1,
        amount: 500.00
      },
      {
        cptCode: '93000',
        description: 'Electrocardiogram',
        units: 1,
        amount: 250.00
      }
    ],
    diagnoses: [
      {
        icdCode: 'I25.10',
        description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris',
        primary: true
      }
    ]
  },
  {
    id: 'CLM-005',
    patient: 'Robert Taylor',
    provider: 'Dr. Anderson',
    dateOfService: '2024-01-11',
    submissionDate: '2024-01-12',
    amount: '$280.00',
    status: 'resubmitted',
    payer: 'UnitedHealth',
    cptCodes: ['99213'],
    icdCodes: ['J06.9'],
    totalCharges: 280.00,
    patientResponsibility: 28.00,
    insuranceAmount: 252.00,
    copayAmount: 15.00,
    deductibleAmount: 13.00,
    priorAuthNumber: '',
    referralNumber: '',
    notes: 'Resubmitted with additional documentation',
    formType: 'HCFA',
    submissionMethod: 'EDI',
    isSecondaryClaim: false,
    procedures: [
      {
        cptCode: '99213',
        description: 'Office visit, established patient',
        units: 1,
        amount: 280.00
      }
    ],
    diagnoses: [
      {
        icdCode: 'J06.9',
        description: 'Acute upper respiratory infection, unspecified',
        primary: true
      }
    ]
  }
];

export function Claims() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [claims, setClaims] = useState(mockClaims);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    payer: 'all',
    dateRange: 'all',
    provider: 'all',
    amountRange: 'all',
    searchTerm: ''
  });

  // Form states
  const [showClaimWizard, setShowClaimWizard] = useState(false);
  const [showClaimDetail, setShowClaimDetail] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const handleClaimSelect = (claim: any) => {
    setSelectedClaim(claim);
    setActiveTab('dashboard');
  };

  const handleClaimUpdate = (updatedClaim: any) => {
    setClaims(prev => prev.map(c => c.id === updatedClaim.id ? updatedClaim : c));
    setSelectedClaim(updatedClaim);
    setShowClaimDetail(false);
  };

  const handleNewClaim = (newClaim: any) => {
    const claimWithId = {
      ...newClaim,
      id: `CLM-${String(claims.length + 1).padStart(3, '0')}`,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'draft'
    };
    setClaims(prev => [...prev, claimWithId]);
    setShowClaimWizard(false);
    setSelectedClaim(claimWithId);
    setActiveTab('dashboard');
  };

  const handleSelectClaim = (claimId: string) => {
    setSelectedClaims(prev => 
      prev.includes(claimId) 
        ? prev.filter(id => id !== claimId)
        : [...prev, claimId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClaims.length === claims.length) {
      setSelectedClaims([]);
    } else {
      setSelectedClaims(claims.map(c => c.id));
    }
  };

  const handleViewClaim = (claim: any) => {
    setSelectedClaim(claim);
    setShowClaimDetail(true);
  };

  const handleEditClaim = (claim: any) => {
    setSelectedClaim(claim);
    setShowClaimWizard(true);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on claims:`, selectedClaims);
    setShowBulkActions(false);
    setSelectedClaims([]);
  };

  const filteredClaims = claims.filter(claim => {
    const matchesStatus = filters.status === 'all' || claim.status === filters.status;
    const matchesPayer = filters.payer === 'all' || claim.payer === filters.payer;
    const matchesProvider = filters.provider === 'all' || claim.provider === filters.provider;
    const matchesSearch = !filters.searchTerm || 
      claim.patient.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      claim.id.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      claim.provider.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesStatus && matchesPayer && matchesProvider && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="h-8 w-8 mr-3 text-blue-600" />
                Claims Management
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive claims processing and management system
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowBulkActions(true)}
                disabled={selectedClaims.length === 0}
                className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 text-blue-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Bulk Actions ({selectedClaims.length})
              </Button>
              <Button
                onClick={() => setShowClaimWizard(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Claim
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <ClaimsStats claims={filteredClaims} />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-lg border border-gray-200 p-1 rounded-xl">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="claims" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6"
            >
              <FileText className="h-4 w-4 mr-2" />
              Claims List
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6"
            >
              <Download className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {selectedClaim ? (
              <ClaimsDashboard
                claim={selectedClaim}
                onEdit={() => setShowClaimWizard(true)}
                onView={() => setShowClaimDetail(true)}
                onResubmit={(claim) => {
                  const updatedClaim = { ...claim, status: 'resubmitted' };
                  handleClaimUpdate(updatedClaim);
                }}
                onApprove={(claim) => {
                  const updatedClaim = { ...claim, status: 'approved' };
                  handleClaimUpdate(updatedClaim);
                }}
                onDeny={(claim) => {
                  const updatedClaim = { ...claim, status: 'denied' };
                  handleClaimUpdate(updatedClaim);
                }}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Claim Selected</h3>
                  <p className="text-gray-600">Please select a claim from the claims list to view its dashboard.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="claims" className="space-y-6">
            <ClaimsFilter
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={() => setFilters({
                status: 'all',
                payer: 'all',
                dateRange: 'all',
                provider: 'all',
                amountRange: 'all',
                searchTerm: ''
              })}
            />
            
            <ClaimsTable
              claims={filteredClaims}
              selectedClaims={selectedClaims}
              onSelectClaim={handleSelectClaim}
              onSelectAll={handleSelectAll}
              onViewClaim={handleViewClaim}
              onEditClaim={handleEditClaim}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2 text-blue-600" />
                  Claims Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Revenue Report
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Clock className="h-6 w-6 mb-2" />
                    Aging Report
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <AlertCircle className="h-6 w-6 mb-2" />
                    Denial Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Forms */}
        {showClaimWizard && (
          <ClaimFormWizard
            claim={selectedClaim}
            isOpen={showClaimWizard}
            onClose={() => setShowClaimWizard(false)}
            onSubmit={handleNewClaim}
          />
        )}

        {showClaimDetail && selectedClaim && (
          <ClaimDetailModal
            claim={selectedClaim}
            isOpen={showClaimDetail}
            onClose={() => setShowClaimDetail(false)}
            onSave={handleClaimUpdate}
          />
        )}

        {/* Bulk Actions Dialog */}
        {showBulkActions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Bulk Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => handleBulkAction('approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Selected
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleBulkAction('deny')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Deny Selected
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleBulkAction('resubmit')}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Resubmit Selected
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleBulkAction('export')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setShowBulkActions(false)}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
