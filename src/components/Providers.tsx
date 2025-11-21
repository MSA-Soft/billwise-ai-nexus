import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, Edit, Trash2, Download, Upload, ChevronDown, ChevronRight, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Provider {
  id: string;
  // Provider Identification
  lastName: string;
  firstName: string;
  middleInitial: string;
  credentials: string;
  providerType: 'individual' | 'organization';
  npi: string;
  taxonomySpecialty: string;
  sequenceNumber: string;
  referenceNumber: string;
  code: string;
  
  // Billing Information
  practiceForProvider: string;
  billClaimsUnder: string;
  checkEligibilityUnder: string;
  useIdNumber: string;
  employerIdentificationNumber: string;
  billAs: string;
  billProfessionalClaims: boolean;
  billInstitutionalClaims: boolean;
  
  // Internal Use
  submitterNumber: string;
  tcnPrefix: string;
  
  // Contact Information
  homePhone: string;
  cellPhone: string;
  faxNumber: string;
  pagerNumber: string;
  email: string;
  
  // ID Numbers
  specialtyLicenseNumber: string;
  stateLicenseNumber: string;
  anesthesiaLicenseNumber: string;
  upinNumber: string;
  blueCrossNumber: string;
  tricareChampusNumber: string;
  
  // Claim Defaults
  revCode: string;
  defaultFacility: string;
  
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// All provider data is now fetched from the database

const idNumberOptions = [
  'Employer Identification# (EIN)',
  'Social Security Number',
  'Tax ID Number',
  'Other'
];

const billAsOptions = [
  'Individual',
  'Organization',
  'Group'
];

export const Providers: React.FC = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  // Fetch providers from database
  useEffect(() => {
    fetchProvidersFromDatabase();
  }, []);

  const fetchProvidersFromDatabase = async () => {
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      console.log('🔍 Fetching providers from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch providers.');
        setProviders([]);
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('providers' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching providers:', error);
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('⚠️ Providers table not found. Please run CREATE_PROVIDERS_TABLE.sql');
          toast({
            title: 'Table Not Found',
            description: 'Providers table does not exist. Please run the SQL setup script.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading providers',
            description: error.message,
            variant: 'destructive',
          });
        }
        setProviders([]);
        return;
      }

      // Transform database records to match Provider interface
      const transformedProviders: Provider[] = (data || []).map((dbProvider: any) => ({
        id: dbProvider.id,
        lastName: dbProvider.last_name || '',
        firstName: dbProvider.first_name || '',
        middleInitial: dbProvider.middle_initial || '',
        credentials: dbProvider.credentials || '',
        providerType: (dbProvider.provider_type || 'individual') as 'individual' | 'organization',
        npi: dbProvider.npi || '',
        taxonomySpecialty: dbProvider.taxonomy_specialty || '',
        sequenceNumber: dbProvider.sequence_number || '',
        referenceNumber: dbProvider.reference_number || '',
        code: dbProvider.code || '',
        practiceForProvider: dbProvider.practice_for_provider || '',
        billClaimsUnder: dbProvider.bill_claims_under || 'SELF',
        checkEligibilityUnder: dbProvider.check_eligibility_under || 'SELF',
        useIdNumber: dbProvider.use_id_number || 'Employer Identification# (EIN)',
        employerIdentificationNumber: dbProvider.employer_identification_number || '',
        billAs: dbProvider.bill_as || 'Individual',
        billProfessionalClaims: dbProvider.bill_professional_claims || false,
        billInstitutionalClaims: dbProvider.bill_institutional_claims || false,
        submitterNumber: dbProvider.submitter_number || '',
        tcnPrefix: dbProvider.tcn_prefix || '',
        homePhone: dbProvider.home_phone || '',
        cellPhone: dbProvider.cell_phone || '',
        faxNumber: dbProvider.fax_number || '',
        pagerNumber: dbProvider.pager_number || '',
        email: dbProvider.email || '',
        specialtyLicenseNumber: dbProvider.specialty_license_number || '',
        stateLicenseNumber: dbProvider.state_license_number || '',
        anesthesiaLicenseNumber: dbProvider.anesthesia_license_number || '',
        upinNumber: dbProvider.upin_number || '',
        blueCrossNumber: dbProvider.blue_cross_number || '',
        tricareChampusNumber: dbProvider.tricare_champus_number || '',
        revCode: dbProvider.rev_code || '',
        defaultFacility: dbProvider.default_facility || '',
        status: (dbProvider.is_active ? 'active' : 'inactive') as 'active' | 'inactive',
        createdAt: dbProvider.created_at || '',
        updatedAt: dbProvider.updated_at || dbProvider.created_at || ''
      }));

      console.log(`✅ Successfully loaded ${transformedProviders.length} providers from database`);
      setProviders(transformedProviders);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchProvidersFromDatabase:', error);
      toast({
        title: 'Error loading providers',
        description: error.message || 'Failed to load providers from database',
        variant: 'destructive',
      });
      setProviders([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };
  const [newProvider, setNewProvider] = useState<Partial<Provider>>({
    lastName: '',
    firstName: '',
    middleInitial: '',
    credentials: '',
    providerType: 'individual',
    npi: '',
    taxonomySpecialty: '',
    sequenceNumber: 'NEW',
    referenceNumber: '',
    code: '',
    practiceForProvider: '',
    billClaimsUnder: 'SELF',
    checkEligibilityUnder: 'SELF',
    useIdNumber: 'Employer Identification# (EIN)',
    employerIdentificationNumber: '',
    billAs: 'Individual',
    billProfessionalClaims: false,
    billInstitutionalClaims: false,
    submitterNumber: '',
    tcnPrefix: '',
    homePhone: '',
    cellPhone: '',
    faxNumber: '',
    pagerNumber: '',
    email: '',
    specialtyLicenseNumber: '',
    stateLicenseNumber: '',
    anesthesiaLicenseNumber: '',
    upinNumber: '',
    blueCrossNumber: '',
    tricareChampusNumber: '',
    revCode: '',
    defaultFacility: '',
    status: 'active'
  });

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      provider.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.npi.includes(searchTerm) ||
      provider.taxonomySpecialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || provider.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddProvider = async () => {
    if (!newProvider.firstName || !newProvider.lastName || !newProvider.npi) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (First Name, Last Name, NPI).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating provider:', newProvider);

      // Get current user session for user_id (optional - providers don't need to be tied to users)
      const { data: { session } } = await supabase.auth.getSession();

      // Prepare data for database (snake_case)
      const insertData: any = {
        user_id: session?.user?.id || null, // Set to current user or null
        npi: newProvider.npi!.trim(),
        first_name: newProvider.firstName!.trim(),
        last_name: newProvider.lastName!.trim(),
        middle_initial: newProvider.middleInitial || null,
        credentials: newProvider.credentials || null,
        provider_type: (newProvider.providerType || 'individual') as 'individual' | 'organization',
        taxonomy_specialty: newProvider.taxonomySpecialty || null,
        sequence_number: newProvider.sequenceNumber || null,
        reference_number: newProvider.referenceNumber || null,
        code: newProvider.code || null,
        practice_for_provider: newProvider.practiceForProvider || null,
        bill_claims_under: newProvider.billClaimsUnder || 'SELF',
        check_eligibility_under: newProvider.checkEligibilityUnder || 'SELF',
        use_id_number: newProvider.useIdNumber || null,
        employer_identification_number: newProvider.employerIdentificationNumber || null,
        bill_as: newProvider.billAs || 'Individual',
        bill_professional_claims: newProvider.billProfessionalClaims || false,
        bill_institutional_claims: newProvider.billInstitutionalClaims || false,
        submitter_number: newProvider.submitterNumber || null,
        tcn_prefix: newProvider.tcnPrefix || null,
        home_phone: newProvider.homePhone || null,
        cell_phone: newProvider.cellPhone || null,
        phone: newProvider.cellPhone || newProvider.homePhone || null,
        fax_number: newProvider.faxNumber || null,
        pager_number: newProvider.pagerNumber || null,
        email: newProvider.email || null,
        specialty_license_number: newProvider.specialtyLicenseNumber || null,
        state_license_number: newProvider.stateLicenseNumber || null,
        anesthesia_license_number: newProvider.anesthesiaLicenseNumber || null,
        upin_number: newProvider.upinNumber || null,
        blue_cross_number: newProvider.blueCrossNumber || null,
        tricare_champus_number: newProvider.tricareChampusNumber || null,
        rev_code: newProvider.revCode || null,
        default_facility: newProvider.defaultFacility || null,
        is_active: (newProvider.status || 'active') === 'active'
      };

      // Remove null values for optional fields
      Object.keys(insertData).forEach(key => {
        if (insertData[key] === null || insertData[key] === '') {
          delete insertData[key];
        }
      });

      const { data, error } = await supabase
        .from('providers' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating provider:', error);
        throw new Error(error.message || 'Failed to create provider');
      }

      // Refresh the providers list
      await fetchProvidersFromDatabase();

      // Reset form
    setNewProvider({
      lastName: '',
      firstName: '',
      middleInitial: '',
      credentials: '',
      providerType: 'individual',
      npi: '',
      taxonomySpecialty: '',
      sequenceNumber: 'NEW',
      referenceNumber: '',
      code: '',
      practiceForProvider: '',
      billClaimsUnder: 'SELF',
      checkEligibilityUnder: 'SELF',
      useIdNumber: 'Employer Identification# (EIN)',
      employerIdentificationNumber: '',
      billAs: 'Individual',
      billProfessionalClaims: false,
      billInstitutionalClaims: false,
      submitterNumber: '',
      tcnPrefix: '',
      homePhone: '',
      cellPhone: '',
      faxNumber: '',
      pagerNumber: '',
      email: '',
      specialtyLicenseNumber: '',
      stateLicenseNumber: '',
      anesthesiaLicenseNumber: '',
      upinNumber: '',
      blueCrossNumber: '',
      tricareChampusNumber: '',
      revCode: '',
      defaultFacility: '',
      status: 'active'
    });
    setIsAddDialogOpen(false);

      toast({
        title: "Provider Added",
        description: `${newProvider.firstName} ${newProvider.lastName} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create provider:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create provider. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleEditProvider = (provider: Provider) => {
    setEditingProvider(provider);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProvider = async () => {
    if (!editingProvider || !editingProvider.id) {
      toast({
        title: "Error",
        description: "Provider ID is missing. Cannot update.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Updating provider:', editingProvider);

      // Prepare data for database (snake_case)
      const updateData: any = {
        npi: editingProvider.npi.trim(),
        first_name: editingProvider.firstName.trim(),
        last_name: editingProvider.lastName.trim(),
        middle_initial: editingProvider.middleInitial || null,
        credentials: editingProvider.credentials || null,
        provider_type: editingProvider.providerType as 'individual' | 'organization',
        taxonomy_specialty: editingProvider.taxonomySpecialty || null,
        sequence_number: editingProvider.sequenceNumber || null,
        reference_number: editingProvider.referenceNumber || null,
        code: editingProvider.code || null,
        practice_for_provider: editingProvider.practiceForProvider || null,
        bill_claims_under: editingProvider.billClaimsUnder || 'SELF',
        check_eligibility_under: editingProvider.checkEligibilityUnder || 'SELF',
        use_id_number: editingProvider.useIdNumber || null,
        employer_identification_number: editingProvider.employerIdentificationNumber || null,
        bill_as: editingProvider.billAs || 'Individual',
        bill_professional_claims: editingProvider.billProfessionalClaims || false,
        bill_institutional_claims: editingProvider.billInstitutionalClaims || false,
        submitter_number: editingProvider.submitterNumber || null,
        tcn_prefix: editingProvider.tcnPrefix || null,
        home_phone: editingProvider.homePhone || null,
        cell_phone: editingProvider.cellPhone || null,
        phone: editingProvider.cellPhone || editingProvider.homePhone || null,
        fax_number: editingProvider.faxNumber || null,
        pager_number: editingProvider.pagerNumber || null,
        email: editingProvider.email || null,
        specialty_license_number: editingProvider.specialtyLicenseNumber || null,
        state_license_number: editingProvider.stateLicenseNumber || null,
        anesthesia_license_number: editingProvider.anesthesiaLicenseNumber || null,
        upin_number: editingProvider.upinNumber || null,
        blue_cross_number: editingProvider.blueCrossNumber || null,
        tricare_champus_number: editingProvider.tricareChampusNumber || null,
        rev_code: editingProvider.revCode || null,
        default_facility: editingProvider.defaultFacility || null,
        is_active: editingProvider.status === 'active'
      };

      // Remove null values for optional fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const { error } = await supabase
        .from('providers' as any)
        .update(updateData)
        .eq('id', editingProvider.id);

      if (error) {
        console.error('❌ Error updating provider:', error);
        throw new Error(error.message || 'Failed to update provider');
      }

      // Refresh the providers list
      await fetchProvidersFromDatabase();

    setIsEditDialogOpen(false);
    setEditingProvider(null);

      toast({
        title: "Provider Updated",
        description: `${editingProvider.firstName} ${editingProvider.lastName} has been successfully updated.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to update provider:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update provider. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting provider:', id);

      const { error } = await supabase
        .from('providers' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting provider:', error);
        throw new Error(error.message || 'Failed to delete provider');
      }

      // Refresh the providers list
      await fetchProvidersFromDatabase();

      toast({
        title: "Provider Deleted",
        description: "Provider has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('💥 Failed to delete provider:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete provider. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleExportProviders = () => {
    const csvContent = [
      ['First Name', 'Last Name', 'NPI', 'Specialty', 'Status', 'Phone', 'Email'].join(','),
      ...providers.map(provider => [
        provider.firstName,
        provider.lastName,
        provider.npi,
        provider.taxonomySpecialty,
        provider.status,
        provider.homePhone,
        provider.email
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'providers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProviders = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      console.log('Importing providers from CSV:', text);
      alert('CSV import functionality would be implemented here');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Providers</h1>
          <p className="text-muted-foreground">Manage healthcare providers and their information</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Provider
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search-providers"
                name="search-providers"
                placeholder="Search providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                autoComplete="off"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportProviders}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" asChild>
                <label>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportProviders}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Providers List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading providers...</p>
            </div>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No providers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search criteria"
                : "Get started by adding your first provider"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            )}
          </div>
        ) : (
          filteredProviders.map((provider) => (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="text-lg">
                      {provider.firstName} {provider.lastName}
                      {provider.credentials && `, ${provider.credentials}`}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {provider.taxonomySpecialty} • NPI: {provider.npi}
                    </p>
                  </div>
                  <Badge variant={provider.status === 'active' ? 'default' : 'secondary'}>
                    {provider.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedProvider(
                      expandedProvider === provider.id ? null : provider.id
                    )}
                  >
                    {expandedProvider === provider.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditProvider(provider)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProvider(provider.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedProvider === provider.id && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Provider Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>NPI:</strong> {provider.npi}</p>
                      <p><strong>Type:</strong> {provider.providerType}</p>
                      <p><strong>Sequence #:</strong> {provider.sequenceNumber}</p>
                      <p><strong>Reference #:</strong> {provider.referenceNumber}</p>
                      <p><strong>Code:</strong> {provider.code}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Home Phone:</strong> {provider.homePhone}</p>
                      <p><strong>Cell Phone:</strong> {provider.cellPhone}</p>
                      <p><strong>Email:</strong> {provider.email}</p>
                      <p><strong>Fax:</strong> {provider.faxNumber}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
          ))
        )}
      </div>

      {/* Add Provider Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Provider</DialogTitle>
            <DialogDescription>
              Enter the provider's information below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Provider Identification */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-teal-600 text-white p-2 rounded">Provider Identification</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="lastName">Last *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={newProvider.lastName || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, lastName: e.target.value })}
                    autoComplete="family-name"
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">First *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={newProvider.firstName || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, firstName: e.target.value })}
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <Label htmlFor="middleInitial">MI</Label>
                  <Input
                    id="middleInitial"
                    name="middleInitial"
                    value={newProvider.middleInitial || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, middleInitial: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="credentials">Credentials</Label>
                  <Input
                    id="credentials"
                    name="credentials"
                    value={newProvider.credentials || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, credentials: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="providerType">This provider is an:</Label>
                  <RadioGroup value={newProvider.providerType || 'individual'} onValueChange={(value) => setNewProvider({ ...newProvider, providerType: value as 'individual' | 'organization' })}>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="individual" id="individual" />
                        <Label htmlFor="individual">Individual</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="organization" id="organization" />
                        <Label htmlFor="organization">Organization</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="npi">NPI *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="npi"
                      name="npi"
                      value={newProvider.npi || ''}
                      onChange={(e) => setNewProvider({ ...newProvider, npi: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="taxonomySpecialty">Taxonomy Specialty</Label>
                  <div className="flex gap-2">
                    <Input
                      id="taxonomySpecialty"
                      name="taxonomySpecialty"
                      value={newProvider.taxonomySpecialty || ''}
                      onChange={(e) => setNewProvider({ ...newProvider, taxonomySpecialty: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="sequenceNumber">Sequence #</Label>
                  <Input
                    id="sequenceNumber"
                    name="sequenceNumber"
                    value={newProvider.sequenceNumber || 'NEW'}
                    onChange={(e) => setNewProvider({ ...newProvider, sequenceNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="referenceNumber">Reference #</Label>
                  <Input
                    id="referenceNumber"
                    name="referenceNumber"
                    value={newProvider.referenceNumber || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, referenceNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    name="code"
                    value={newProvider.code || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, code: e.target.value })}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Billing Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-teal-600 text-white p-2 rounded">Billing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="practiceForProvider">Practice for this provider</Label>
                  <div className="flex gap-2">
                    <Input
                      id="practiceForProvider"
                      name="practiceForProvider"
                      value={newProvider.practiceForProvider || ''}
                      onChange={(e) => setNewProvider({ ...newProvider, practiceForProvider: e.target.value })}
                      autoComplete="organization"
                    />
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Building className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="billClaimsUnder">Bill claims under</Label>
                  <div className="flex gap-2">
                    <Input
                      id="billClaimsUnder"
                      name="billClaimsUnder"
                      value={newProvider.billClaimsUnder || 'SELF'}
                      onChange={(e) => setNewProvider({ ...newProvider, billClaimsUnder: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="checkEligibilityUnder">Check eligibility under</Label>
                  <div className="flex gap-2">
                    <Input
                      id="checkEligibilityUnder"
                      name="checkEligibilityUnder"
                      value={newProvider.checkEligibilityUnder || 'SELF'}
                      onChange={(e) => setNewProvider({ ...newProvider, checkEligibilityUnder: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="useIdNumber">Use which ID number?</Label>
                  <Select value={newProvider.useIdNumber || 'Employer Identification# (EIN)'} onValueChange={(value) => setNewProvider({ ...newProvider, useIdNumber: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {idNumberOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="employerIdentificationNumber">Employer Identification # (EIN)</Label>
                  <Input
                    id="employerIdentificationNumber"
                    name="employerIdentificationNumber"
                    value={newProvider.employerIdentificationNumber || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, employerIdentificationNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="billAs">Bill as</Label>
                  <Select value={newProvider.billAs || 'Individual'} onValueChange={(value) => setNewProvider({ ...newProvider, billAs: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {billAsOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="billProfessionalClaims"
                        checked={newProvider.billProfessionalClaims || false}
                        onCheckedChange={(checked) => setNewProvider({ ...newProvider, billProfessionalClaims: !!checked })}
                      />
                      <Label htmlFor="billProfessionalClaims">Bill professional claims (CMS-1500)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="billInstitutionalClaims"
                        checked={newProvider.billInstitutionalClaims || false}
                        onCheckedChange={(checked) => setNewProvider({ ...newProvider, billInstitutionalClaims: !!checked })}
                      />
                      <Label htmlFor="billInstitutionalClaims">Bill institutional claims (CMS-1450)</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Internal Use */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-teal-600 text-white p-2 rounded">Internal Use</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="submitterNumber">Submitter #</Label>
                  <Input
                    id="submitterNumber"
                    name="submitterNumber"
                    value={newProvider.submitterNumber || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, submitterNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="tcnPrefix">TCN Prefix</Label>
                  <Input
                    id="tcnPrefix"
                    name="tcnPrefix"
                    value={newProvider.tcnPrefix || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, tcnPrefix: e.target.value })}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-teal-600 text-white p-2 rounded">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="homePhone">Home Phone</Label>
                  <Input
                    id="homePhone"
                    name="homePhone"
                    value={newProvider.homePhone || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, homePhone: e.target.value })}
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="cellPhone">Cell Phone</Label>
                  <Input
                    id="cellPhone"
                    name="cellPhone"
                    value={newProvider.cellPhone || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, cellPhone: e.target.value })}
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="faxNumber">Fax #</Label>
                  <Input
                    id="faxNumber"
                    name="faxNumber"
                    value={newProvider.faxNumber || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, faxNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="pagerNumber">Pager #</Label>
                  <Input
                    id="pagerNumber"
                    name="pagerNumber"
                    value={newProvider.pagerNumber || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, pagerNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newProvider.email || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
                    autoComplete="email"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* ID Numbers */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-teal-600 text-white p-2 rounded">ID Numbers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialtyLicenseNumber">Specialty License #</Label>
                  <Input
                    id="specialtyLicenseNumber"
                    name="specialtyLicenseNumber"
                    value={newProvider.specialtyLicenseNumber || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, specialtyLicenseNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="stateLicenseNumber">State License #</Label>
                  <Input
                    id="stateLicenseNumber"
                    name="stateLicenseNumber"
                    value={newProvider.stateLicenseNumber || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, stateLicenseNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="anesthesiaLicenseNumber">Anesthesia License #</Label>
                  <Input
                    id="anesthesiaLicenseNumber"
                    name="anesthesiaLicenseNumber"
                    value={newProvider.anesthesiaLicenseNumber || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, anesthesiaLicenseNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="upinNumber">UPIN #</Label>
                  <Input
                    id="upinNumber"
                    name="upinNumber"
                    value={newProvider.upinNumber || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, upinNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="blueCrossNumber">Blue Cross #</Label>
                  <Input
                    id="blueCrossNumber"
                    name="blueCrossNumber"
                    value={newProvider.blueCrossNumber || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, blueCrossNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="tricareChampusNumber">Tricare/Champus #</Label>
                  <Input
                    id="tricareChampusNumber"
                    name="tricareChampusNumber"
                    value={newProvider.tricareChampusNumber || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, tricareChampusNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Claim Defaults */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-teal-600 text-white p-2 rounded">Claim Defaults</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="revCode">Rev Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="revCode"
                      name="revCode"
                      value={newProvider.revCode || ''}
                      onChange={(e) => setNewProvider({ ...newProvider, revCode: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="defaultFacility">Default Facility</Label>
                  <div className="flex gap-2">
                    <Input
                      id="defaultFacility"
                      name="defaultFacility"
                      value={newProvider.defaultFacility || ''}
                      onChange={(e) => setNewProvider({ ...newProvider, defaultFacility: e.target.value })}
                      autoComplete="organization"
                    />
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProvider}>
              Add Provider
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Provider Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Provider</DialogTitle>
            <DialogDescription>
              Update the provider's information below.
            </DialogDescription>
          </DialogHeader>
          {editingProvider && (
            <div className="space-y-6">
              {/* Similar form structure as Add Provider but with editingProvider data */}
              <div>
                <h3 className="text-lg font-semibold mb-4 bg-teal-600 text-white p-2 rounded">Provider Identification</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="editLastName">Last *</Label>
                    <Input
                      id="editLastName"
                      name="editLastName"
                      value={editingProvider.lastName}
                      onChange={(e) => setEditingProvider({ ...editingProvider, lastName: e.target.value })}
                      autoComplete="family-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editFirstName">First *</Label>
                    <Input
                      id="editFirstName"
                      name="editFirstName"
                      value={editingProvider.firstName}
                      onChange={(e) => setEditingProvider({ ...editingProvider, firstName: e.target.value })}
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMiddleInitial">MI</Label>
                    <Input
                      id="editMiddleInitial"
                      name="editMiddleInitial"
                      value={editingProvider.middleInitial}
                      onChange={(e) => setEditingProvider({ ...editingProvider, middleInitial: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCredentials">Credentials</Label>
                    <Input
                      id="editCredentials"
                      name="editCredentials"
                      value={editingProvider.credentials}
                      onChange={(e) => setEditingProvider({ ...editingProvider, credentials: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editProviderType">This provider is an:</Label>
                    <RadioGroup value={editingProvider.providerType} onValueChange={(value) => setEditingProvider({ ...editingProvider, providerType: value as 'individual' | 'organization' })}>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="individual" id="editIndividual" />
                          <Label htmlFor="editIndividual">Individual</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="organization" id="editOrganization" />
                          <Label htmlFor="editOrganization">Organization</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="editNpi">NPI *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="editNpi"
                        name="editNpi"
                        value={editingProvider.npi}
                        onChange={(e) => setEditingProvider({ ...editingProvider, npi: e.target.value })}
                        autoComplete="off"
                      />
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProvider}>
              Update Provider
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};