import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  Send, 
  Printer,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Building,
  Brain,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { EnhancedClaimList } from '@/components/EnhancedClaims/EnhancedClaimList';
import { EnhancedClaimForm } from '@/components/EnhancedClaims/EnhancedClaimForm';
import { CMS1500Form } from '@/components/EnhancedClaims/CMS1500Form';
import { DenialManagement } from '@/components/EnhancedClaims/DenialManagement';
import { AIAnalysisPanel } from '@/components/EnhancedClaims/AIAnalysisPanel';
import { LetterGenerator } from '@/components/EnhancedClaims/LetterGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function EnhancedClaims() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('claims-list');
  const [showNewClaimForm, setShowNewClaimForm] = useState(false);
  const [showCMS1500Form, setShowCMS1500Form] = useState(false);
  const [editingClaim, setEditingClaim] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [showLetterGenerator, setShowLetterGenerator] = useState(false);
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);

  // Fetch claims from database
  useEffect(() => {
    const fetchClaims = async () => {
      setIsLoadingClaims(true);
      try {
        // First, fetch claims with nested relations that should work
        const { data: claimsData, error: claimsError } = await supabase
          .from('claims' as any)
          .select(`
            *,
            claim_procedures (*),
            claim_diagnoses (*)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (claimsError) {
          console.error('Error fetching claims:', claimsError);
          toast({
            title: 'Error loading claims',
            description: claimsError.message,
            variant: 'destructive',
          });
          setClaims([]);
          return;
        }

        if (!claimsData || claimsData.length === 0) {
          setClaims([]);
          setIsLoadingClaims(false);
          return;
        }

        // Get unique IDs for related data
        const patientIds = [...new Set(claimsData.map((c: any) => c.patient_id).filter(Boolean))];
        const providerIds = [...new Set(claimsData.map((c: any) => c.provider_id).filter(Boolean))];
        const payerIds = [...new Set(claimsData.map((c: any) => c.primary_insurance_id).filter(Boolean))];

        // Fetch related data separately
        const [patientsResult, providersResult, payersResult] = await Promise.all([
          patientIds.length > 0 
            ? supabase.from('patients').select('id, first_name, last_name').in('id', patientIds)
            : Promise.resolve({ data: [], error: null }),
          providerIds.length > 0
            ? supabase.from('providers').select('id, first_name, last_name, title').in('id', providerIds)
            : Promise.resolve({ data: [], error: null }),
          payerIds.length > 0
            ? supabase.from('insurance_payers').select('id, name').in('id', payerIds)
            : Promise.resolve({ data: [], error: null })
        ]);

        // Create lookup maps
        const patientsMap = new Map((patientsResult.data || []).map((p: any) => [p.id, p]));
        const providersMap = new Map((providersResult.data || []).map((p: any) => [p.id, p]));
        const payersMap = new Map((payersResult.data || []).map((p: any) => [p.id, p]));

        // Combine the data
        const data = claimsData.map((claim: any) => ({
          ...claim,
          patients: claim.patient_id ? patientsMap.get(claim.patient_id) : null,
          providers: claim.provider_id ? providersMap.get(claim.provider_id) : null,
          insurance_payers: claim.primary_insurance_id ? payersMap.get(claim.primary_insurance_id) : null
        }));

        // Transform database claims to match UI format
        const transformedClaims = data.map((claim: any) => {
          // Related data is now single objects, not arrays
          const patient = claim.patients || null;
          const provider = claim.providers || null;
          const payer = claim.insurance_payers || null;
          
          const procedures = Array.isArray(claim.claim_procedures) ? claim.claim_procedures : [];
          const diagnoses = Array.isArray(claim.claim_diagnoses) ? claim.claim_diagnoses : [];
          
          const patientName = patient 
            ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim()
            : 'Unknown Patient';
          
          const providerName = provider
            ? `${provider.title || 'Dr.'} ${provider.first_name || ''} ${provider.last_name || ''}`.trim()
            : 'Unknown Provider';
          
          const cptCodes = procedures.map((p: any) => p.cpt_code).filter(Boolean);
          const icdCodes = diagnoses.map((d: any) => d.icd_code).filter(Boolean);
          
          let status = 'pending';
          if (claim.status === 'paid') status = 'paid';
          else if (claim.status === 'denied') status = 'denied';
          else if (claim.status === 'submitted' || claim.status === 'processing') status = 'submitted';
          
          return {
            id: claim.id,
            claimNumber: claim.claim_number || claim.id,
            patient: patientName,
            provider: providerName,
            dateOfService: claim.service_date_from || '',
            amount: parseFloat(claim.total_charges || 0),
            status: status,
            formType: claim.form_type || 'HCFA',
            insuranceProvider: payer?.name || 'Unknown',
            submissionDate: claim.submission_date || claim.created_at || '',
            cptCodes: cptCodes,
            icdCodes: icdCodes
          };
        });

        setClaims(transformedClaims);
      } catch (error: any) {
        console.error('Error fetching claims:', error);
        toast({
          title: 'Error loading claims',
          description: error.message || 'Failed to load claims',
          variant: 'destructive',
        });
        setClaims([]);
      } finally {
        setIsLoadingClaims(false);
      }
    };

    fetchClaims();
  }, []);

  const handleNewClaim = () => {
    setEditingClaim(null);
    setShowNewClaimForm(true);
  };

  const handleEditClaim = (claimId: string) => {
    setEditingClaim(claimId);
    setShowNewClaimForm(true);
  };

  const handleViewClaim = (claim: any) => {
    setSelectedClaim(claim);
    setShowLetterGenerator(true);
  };

  const handleCloseForms = () => {
    setShowNewClaimForm(false);
    setShowCMS1500Form(false);
    setShowLetterGenerator(false);
    setEditingClaim(null);
    setSelectedClaim(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resubmitted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Send className="h-4 w-4" />;
      case 'denied': return <AlertCircle className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'resubmitted': return <RefreshCw className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Claims</h1>
          <p className="text-gray-600 mt-1">Advanced claim management with AI-powered insights and denial handling</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowCMS1500Form(true)}>
            <FileText className="h-4 w-4 mr-2" />
            CMS-1500 Form
          </Button>
          <Button onClick={handleNewClaim}>
            <Plus className="h-4 w-4 mr-2" />
            New Claim
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Claims</p>
                <p className="text-2xl font-bold text-blue-600">{claims.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Denied Claims</p>
                <p className="text-2xl font-bold text-red-600">
                  {claims.filter(c => c.status === 'denied').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Claims</p>
                <p className="text-2xl font-bold text-green-600">
                  {claims.filter(c => c.status === 'paid').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${claims.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="claims-list">Claims List</TabsTrigger>
          <TabsTrigger value="denial-management">Denial Management</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
        </TabsList>

        <TabsContent value="claims-list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Claims Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search claims by patient, provider, or claim number..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">All Status</option>
                      <option value="submitted">Submitted</option>
                      <option value="denied">Denied</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                    </select>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </div>

                {/* Claims Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Claim #</th>
                        <th className="text-left p-3 font-medium">Patient</th>
                        <th className="text-left p-3 font-medium">Provider</th>
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Amount</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingClaims ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Loading claims...</p>
                          </td>
                        </tr>
                      ) : claims.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No claims found</p>
                          </td>
                        </tr>
                      ) : (
                        claims.map((claim) => (
                          <tr key={claim.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <span className="font-medium text-blue-600">{claim.claimNumber}</span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                {claim.patient}
                              </div>
                            </td>
                            <td className="p-3">{claim.provider}</td>
                            <td className="p-3">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                {new Date(claim.dateOfService).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                                ${claim.amount.toFixed(2)}
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge className={getStatusColor(claim.status)}>
                                <span className="flex items-center">
                                  {getStatusIcon(claim.status)}
                                  <span className="ml-1">{claim.status}</span>
                                </span>
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewClaim(claim)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditClaim(claim.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="denial-management">
          <DenialManagement claims={mockClaims} />
        </TabsContent>

        <TabsContent value="ai-insights">
          <AIAnalysisPanel claims={mockClaims} />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Claims Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">Comprehensive analytics and reporting will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Claim Forms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowCMS1500Form(true)}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">CMS-1500 Form</h3>
                        <p className="text-sm text-gray-600">Standard claim form for professional services</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="font-semibold">HCFA Form</h3>
                        <p className="text-sm text-gray-600">Legacy claim form format</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showNewClaimForm && (
        <EnhancedClaimForm
          claimId={editingClaim}
          isOpen={showNewClaimForm}
          onCancel={handleCloseForms}
        />
      )}

      {showCMS1500Form && (
        <CMS1500Form
          isOpen={showCMS1500Form}
          onClose={handleCloseForms}
        />
      )}

      {showLetterGenerator && selectedClaim && (
        <LetterGenerator
          claim={selectedClaim}
          isOpen={showLetterGenerator}
          onClose={handleCloseForms}
          denialReasons={[]}
        />
      )}
    </div>
  );
}
