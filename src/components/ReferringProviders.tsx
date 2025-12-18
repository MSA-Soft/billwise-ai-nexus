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
import { Plus, Search, Edit, Trash2, Download, Upload, ChevronDown, ChevronRight, User, FileDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReferringProvider {
  id: string;
  // Basic Information
  lastName: string;
  firstName: string;
  middleInitial: string;
  credentials: string;
  providerType: 'individual' | 'organization';
  referringType: string;
  doNotSendOnClaims: boolean;
  npi: string;
  taxonomySpecialty: string;
  sequenceNumber: string;
  referenceNumber: string;
  
  // Contact Information
  address: string;
  city: string;
  state: string;
  zipCode: string;
  homePhone: string;
  cellPhone: string;
  phone: string;
  fax: string;
  pager: string;
  email: string;
  
  // ID Numbers
  taxId: string;
  taxIdType: string;
  upin: string;
  bcbsId: string;
  medicareId: string;
  medicaidId: string;
  champusId: string;
  specialtyLicenseNumber: string;
  stateLicenseNumber: string;
  anesthesiaLicenseNumber: string;
  marketer: string;
  
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Sample referring providers removed - now using database
const _sampleReferringProviders: ReferringProvider[] = [];

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const referringTypes = [
  'Referring Provider',
  'Ordering Provider',
  'Attending Provider',
  'Supervising Provider',
  'Other'
];

const taxIdTypes = [
  'NONE',
  'SSN',
  'EIN',
  'Tax ID',
  'Other'
];

export const ReferringProviders: React.FC = () => {
  const { toast } = useToast();
  const [referringProviders, setReferringProviders] = useState<ReferringProvider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ReferringProvider | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  // Fetch referring providers from database
  useEffect(() => {
    fetchReferringProvidersFromDatabase();
  }, []);

  const fetchReferringProvidersFromDatabase = async () => {
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      console.log('🔍 Fetching referring providers from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch referring providers.');
        setReferringProviders([]);
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('referring_providers' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching referring providers:', error);
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('⚠️ Referring providers table not found. Please run CREATE_REFERRING_PROVIDERS_TABLE.sql');
          toast({
            title: 'Table Not Found',
            description: 'Referring providers table does not exist. Please run the SQL setup script.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading referring providers',
            description: error.message,
            variant: 'destructive',
          });
        }
        setReferringProviders([]);
        return;
      }

      // Transform database records to match ReferringProvider interface
      const transformedProviders: ReferringProvider[] = (data || []).map((dbProvider: any) => ({
        id: dbProvider.id,
        lastName: dbProvider.last_name || '',
        firstName: dbProvider.first_name || '',
        middleInitial: dbProvider.middle_initial || '',
        credentials: dbProvider.credentials || '',
        providerType: (dbProvider.provider_type || 'individual') as 'individual' | 'organization',
        referringType: dbProvider.referring_type || '',
        doNotSendOnClaims: dbProvider.do_not_send_on_claims || false,
        npi: dbProvider.npi || '',
        taxonomySpecialty: dbProvider.taxonomy_specialty || '',
        sequenceNumber: dbProvider.sequence_number || '',
        referenceNumber: dbProvider.reference_number || '',
        address: dbProvider.address || '',
        city: dbProvider.city || '',
        state: dbProvider.state || '',
        zipCode: dbProvider.zip_code || '',
        homePhone: dbProvider.home_phone || '',
        cellPhone: dbProvider.cell_phone || '',
        phone: dbProvider.phone || '',
        fax: dbProvider.fax || '',
        pager: dbProvider.pager || '',
        email: dbProvider.email || '',
        taxId: dbProvider.tax_id || '',
        taxIdType: dbProvider.tax_id_type || '',
        upin: dbProvider.upin || '',
        bcbsId: dbProvider.bcbs_id || '',
        medicareId: dbProvider.medicare_id || '',
        medicaidId: dbProvider.medicaid_id || '',
        champusId: dbProvider.champus_id || '',
        specialtyLicenseNumber: dbProvider.specialty_license_number || '',
        stateLicenseNumber: dbProvider.state_license_number || '',
        anesthesiaLicenseNumber: dbProvider.anesthesia_license_number || '',
        marketer: dbProvider.marketer || '',
        status: (dbProvider.status || (dbProvider.is_active ? 'active' : 'inactive')) as 'active' | 'inactive',
        createdAt: dbProvider.created_at || '',
        updatedAt: dbProvider.updated_at || dbProvider.created_at || ''
      }));

      console.log(`✅ Successfully loaded ${transformedProviders.length} referring providers from database`);
      setReferringProviders(transformedProviders);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchReferringProvidersFromDatabase:', error);
      toast({
        title: 'Error loading referring providers',
        description: error.message || 'Failed to load referring providers from database',
        variant: 'destructive',
      });
      setReferringProviders([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };
  const [newProvider, setNewProvider] = useState<Partial<ReferringProvider>>({
    lastName: '',
    firstName: '',
    middleInitial: '',
    credentials: '',
    providerType: 'individual',
    referringType: 'Referring Provider',
    doNotSendOnClaims: false,
    npi: '',
    taxonomySpecialty: '',
    sequenceNumber: 'NEW',
    referenceNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    homePhone: '',
    cellPhone: '',
    phone: '',
    fax: '',
    pager: '',
    email: '',
    taxId: '',
    taxIdType: 'NONE',
    upin: '',
    bcbsId: '',
    medicareId: '',
    medicaidId: '',
    champusId: '',
    specialtyLicenseNumber: '',
    stateLicenseNumber: '',
    anesthesiaLicenseNumber: '',
    marketer: '',
    status: 'active'
  });

  const filteredProviders = referringProviders.filter(provider => {
    const matchesSearch = 
      provider.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.npi.includes(searchTerm) ||
      provider.taxonomySpecialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || provider.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddProvider = async () => {
    if (!newProvider.firstName || !newProvider.lastName) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields (First Name and Last Name).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating referring provider:', newProvider);

      // Prepare data for database (snake_case)
      const insertData: any = {
        last_name: newProvider.lastName!.trim(),
        first_name: newProvider.firstName!.trim(),
        middle_initial: newProvider.middleInitial || null,
        credentials: newProvider.credentials || null,
        provider_type: (newProvider.providerType || 'individual') as 'individual' | 'organization',
        referring_type: newProvider.referringType || null,
        do_not_send_on_claims: newProvider.doNotSendOnClaims || false,
        npi: newProvider.npi || null,
        taxonomy_specialty: newProvider.taxonomySpecialty || null,
        sequence_number: newProvider.sequenceNumber || null,
        reference_number: newProvider.referenceNumber || null,
        address: newProvider.address || null,
        city: newProvider.city || null,
        state: newProvider.state || null,
        zip_code: newProvider.zipCode || null,
        home_phone: newProvider.homePhone || null,
        cell_phone: newProvider.cellPhone || null,
        phone: newProvider.phone || null,
        fax: newProvider.fax || null,
        pager: newProvider.pager || null,
        email: newProvider.email || null,
        tax_id: newProvider.taxId || null,
        tax_id_type: newProvider.taxIdType || null,
        upin: newProvider.upin || null,
        bcbs_id: newProvider.bcbsId || null,
        medicare_id: newProvider.medicareId || null,
        medicaid_id: newProvider.medicaidId || null,
        champus_id: newProvider.champusId || null,
        specialty_license_number: newProvider.specialtyLicenseNumber || null,
        state_license_number: newProvider.stateLicenseNumber || null,
        anesthesia_license_number: newProvider.anesthesiaLicenseNumber || null,
        marketer: newProvider.marketer || null,
        status: (newProvider.status || 'active') as 'active' | 'inactive',
        is_active: (newProvider.status || 'active') === 'active'
      };

      // Remove null values for optional fields
      Object.keys(insertData).forEach(key => {
        if (insertData[key] === null || insertData[key] === '') {
          delete insertData[key];
        }
      });

      const { data, error } = await supabase
        .from('referring_providers' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating referring provider:', error);
        throw new Error(error.message || 'Failed to create referring provider');
      }

      // Refresh the referring providers list
      await fetchReferringProvidersFromDatabase();

      // Reset form
      setNewProvider({
        lastName: '',
        firstName: '',
        middleInitial: '',
        credentials: '',
        providerType: 'individual',
        referringType: 'Referring Provider',
        doNotSendOnClaims: false,
        npi: '',
        taxonomySpecialty: '',
        sequenceNumber: 'NEW',
        referenceNumber: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        homePhone: '',
        cellPhone: '',
        phone: '',
        fax: '',
        pager: '',
        email: '',
        taxId: '',
        taxIdType: 'NONE',
        upin: '',
        bcbsId: '',
        medicareId: '',
        medicaidId: '',
        champusId: '',
        specialtyLicenseNumber: '',
        stateLicenseNumber: '',
        anesthesiaLicenseNumber: '',
        marketer: '',
        status: 'active'
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Referring Provider Added",
        description: `${newProvider.firstName} ${newProvider.lastName} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create referring provider:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create referring provider. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleEditProvider = (provider: ReferringProvider) => {
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
      console.log('💾 Updating referring provider:', editingProvider);

      // Prepare data for database (snake_case)
      const updateData: any = {
        last_name: editingProvider.lastName.trim(),
        first_name: editingProvider.firstName.trim(),
        middle_initial: editingProvider.middleInitial || null,
        credentials: editingProvider.credentials || null,
        provider_type: editingProvider.providerType as 'individual' | 'organization',
        referring_type: editingProvider.referringType || null,
        do_not_send_on_claims: editingProvider.doNotSendOnClaims || false,
        npi: editingProvider.npi || null,
        taxonomy_specialty: editingProvider.taxonomySpecialty || null,
        sequence_number: editingProvider.sequenceNumber || null,
        reference_number: editingProvider.referenceNumber || null,
        address: editingProvider.address || null,
        city: editingProvider.city || null,
        state: editingProvider.state || null,
        zip_code: editingProvider.zipCode || null,
        home_phone: editingProvider.homePhone || null,
        cell_phone: editingProvider.cellPhone || null,
        phone: editingProvider.phone || null,
        fax: editingProvider.fax || null,
        pager: editingProvider.pager || null,
        email: editingProvider.email || null,
        tax_id: editingProvider.taxId || null,
        tax_id_type: editingProvider.taxIdType || null,
        upin: editingProvider.upin || null,
        bcbs_id: editingProvider.bcbsId || null,
        medicare_id: editingProvider.medicareId || null,
        medicaid_id: editingProvider.medicaidId || null,
        champus_id: editingProvider.champusId || null,
        specialty_license_number: editingProvider.specialtyLicenseNumber || null,
        state_license_number: editingProvider.stateLicenseNumber || null,
        anesthesia_license_number: editingProvider.anesthesiaLicenseNumber || null,
        marketer: editingProvider.marketer || null,
        status: editingProvider.status as 'active' | 'inactive',
        is_active: editingProvider.status === 'active'
      };

      // Remove null values for optional fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const { error } = await supabase
        .from('referring_providers' as any)
        .update(updateData)
        .eq('id', editingProvider.id);

      if (error) {
        console.error('❌ Error updating referring provider:', error);
        throw new Error(error.message || 'Failed to update referring provider');
      }

      // Refresh the referring providers list
      await fetchReferringProvidersFromDatabase();

      setIsEditDialogOpen(false);
      setEditingProvider(null);

      toast({
        title: "Referring Provider Updated",
        description: `${editingProvider.firstName} ${editingProvider.lastName} has been successfully updated.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to update referring provider:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update referring provider. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this referring provider? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting referring provider:', id);

      const { error } = await supabase
        .from('referring_providers' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting referring provider:', error);
        throw new Error(error.message || 'Failed to delete referring provider');
      }

      // Refresh the referring providers list
      await fetchReferringProvidersFromDatabase();

      toast({
        title: "Referring Provider Deleted",
        description: "Referring provider has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('💥 Failed to delete referring provider:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete referring provider. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleExportProviders = () => {
    const csvContent = [
      ['First Name', 'Last Name', 'NPI', 'Specialty', 'Status', 'Phone', 'Email'].join(','),
      ...referringProviders.map(provider => [
        provider.firstName,
        provider.lastName,
        provider.npi,
        provider.taxonomySpecialty,
        provider.status,
        provider.phone,
        provider.email
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'referring-providers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = [
      'First Name,Last Name,NPI,Specialty,Status,Phone,Email',
      'Robert,Johnson,1234567890,Cardiology,active,(555) 111-2222,robert.johnson@example.com',
      'Sarah,Williams,0987654321,Orthopedics,active,(555) 333-4444,sarah.williams@example.com'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'referring-providers-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProviders = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          toast({
            title: "Import Failed",
            description: "CSV file must contain at least a header row and one data row.",
            variant: "destructive",
          });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const importedProviders: Partial<ReferringProvider>[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const providerData: Partial<ReferringProvider> = {
              firstName: values[headers.indexOf('first name')] || values[headers.indexOf('firstname')] || '',
              lastName: values[headers.indexOf('last name')] || values[headers.indexOf('lastname')] || '',
              npi: values[headers.indexOf('npi')] || '',
              taxonomySpecialty: values[headers.indexOf('specialty')] || values[headers.indexOf('taxonomy specialty')] || '',
              status: (values[headers.indexOf('status')] as 'active' | 'inactive') || 'active',
              phone: values[headers.indexOf('phone')] || '',
              email: values[headers.indexOf('email')] || '',
              providerType: (values[headers.indexOf('provider type')] || 'individual') as 'individual' | 'organization',
            };

            if (providerData.firstName && providerData.lastName) {
              importedProviders.push(providerData);
            }
          }
        }

        // Insert providers into database
        let successCount = 0;
        let errorCount = 0;

        for (const providerData of importedProviders) {
          try {
            const insertData: any = {
              first_name: providerData.firstName!.trim(),
              last_name: providerData.lastName!.trim(),
              middle_initial: providerData.middleInitial || null,
              credentials: providerData.credentials || null,
              provider_type: (providerData.providerType || 'individual') as 'individual' | 'organization',
              npi: providerData.npi || null,
              taxonomy_specialty: providerData.taxonomySpecialty || null,
              phone: providerData.phone || null,
              email: providerData.email || null,
              status: (providerData.status || 'active') as 'active' | 'inactive',
              is_active: (providerData.status || 'active') === 'active',
            };

            const { error } = await supabase
              .from('referring_providers' as any)
              .insert(insertData);

            if (error) throw error;
            successCount++;
          } catch (error) {
            console.error('Error importing referring provider:', error);
            errorCount++;
          }
        }

        // Refresh the referring providers list
        await fetchReferringProvidersFromDatabase();

        toast({
          title: "Import Complete",
          description: `${successCount} referring providers imported successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}.`,
        });
      } catch (error: any) {
        toast({
          title: "Import Failed",
          description: error.message || "Error reading CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Referring Providers</h1>
          <p className="text-muted-foreground">Manage referring providers and their information</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Referring Provider
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search-referring-providers"
                name="search-referring-providers"
                placeholder="Search referring providers..."
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
              <Button variant="outline" onClick={handleDownloadSampleCSV}>
                <FileDown className="w-4 h-4 mr-2" />
                Sample CSV
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

      {/* Referring Providers List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading referring providers...</p>
            </div>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No referring providers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search criteria"
                : "Get started by adding your first referring provider"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Referring Provider
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
                      <p><strong>Referring Type:</strong> {provider.referringType}</p>
                      <p><strong>Sequence #:</strong> {provider.sequenceNumber}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Phone:</strong> {provider.phone}</p>
                      <p><strong>Cell:</strong> {provider.cellPhone}</p>
                      <p><strong>Email:</strong> {provider.email}</p>
                      <p><strong>Fax:</strong> {provider.fax}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
          ))
        )}
      </div>

      {/* Add Referring Provider Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Referring Provider</DialogTitle>
            <DialogDescription>
              Enter the referring provider's information below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={newProvider.lastName || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, lastName: e.target.value })}
                    autoComplete="family-name"
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
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
                  <Button variant="outline" className="w-full justify-start">
                    {newProvider.credentials || 'Credentials'}
                  </Button>
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="providerType">This referrer is an:</Label>
                <RadioGroup value={newProvider.providerType || 'individual'} onValueChange={(value) => setNewProvider({ ...newProvider, providerType: value as 'individual' | 'organization' })}>
                  <div className="flex space-x-4 mt-2">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="referringType">Referring Type</Label>
                  <Select value={newProvider.referringType || 'Referring Provider'} onValueChange={(value) => setNewProvider({ ...newProvider, referringType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {referringTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="doNotSendOnClaims"
                    checked={newProvider.doNotSendOnClaims || false}
                    onCheckedChange={(checked) => setNewProvider({ ...newProvider, doNotSendOnClaims: !!checked })}
                  />
                  <Label htmlFor="doNotSendOnClaims">Do not send referrer on claims</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={newProvider.address || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, address: e.target.value })}
                    autoComplete="street-address"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={newProvider.city || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, city: e.target.value })}
                    autoComplete="address-level2"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select value={newProvider.state || ''} onValueChange={(value) => setNewProvider({ ...newProvider, state: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={newProvider.zipCode || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, zipCode: e.target.value })}
                    autoComplete="postal-code"
                  />
                </div>
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
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newProvider.phone || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, phone: e.target.value })}
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="fax">Fax</Label>
                  <Input
                    id="fax"
                    name="fax"
                    value={newProvider.fax || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, fax: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="pager">Pager</Label>
                  <Input
                    id="pager"
                    name="pager"
                    value={newProvider.pager || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, pager: e.target.value })}
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
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">ID Numbers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    value={newProvider.taxId || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, taxId: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="taxIdType">Tax ID Type</Label>
                  <Select value={newProvider.taxIdType || 'NONE'} onValueChange={(value) => setNewProvider({ ...newProvider, taxIdType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taxIdTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="upin">UPIN</Label>
                  <Input
                    id="upin"
                    name="upin"
                    value={newProvider.upin || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, upin: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="bcbsId">BCBS ID</Label>
                  <Input
                    id="bcbsId"
                    name="bcbsId"
                    value={newProvider.bcbsId || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, bcbsId: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="medicareId">Medicare ID</Label>
                  <Input
                    id="medicareId"
                    name="medicareId"
                    value={newProvider.medicareId || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, medicareId: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="medicaidId">Medicaid ID</Label>
                  <Input
                    id="medicaidId"
                    name="medicaidId"
                    value={newProvider.medicaidId || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, medicaidId: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="champusId">Champus ID</Label>
                  <Input
                    id="champusId"
                    name="champusId"
                    value={newProvider.champusId || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, champusId: e.target.value })}
                    autoComplete="off"
                  />
                </div>
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
                  <Label htmlFor="marketer">Marketer</Label>
                  <Input
                    id="marketer"
                    name="marketer"
                    value={newProvider.marketer || ''}
                    onChange={(e) => setNewProvider({ ...newProvider, marketer: e.target.value })}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProvider}>
              Add Referring Provider
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Referring Provider Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Referring Provider</DialogTitle>
            <DialogDescription>
              Update the referring provider's information below.
            </DialogDescription>
          </DialogHeader>
          {editingProvider && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="editLastName">Last Name *</Label>
                    <Input
                      id="editLastName"
                      name="editLastName"
                      value={editingProvider.lastName || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, lastName: e.target.value })}
                      autoComplete="family-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editFirstName">First Name *</Label>
                    <Input
                      id="editFirstName"
                      name="editFirstName"
                      value={editingProvider.firstName || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, firstName: e.target.value })}
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMiddleInitial">MI</Label>
                    <Input
                      id="editMiddleInitial"
                      name="editMiddleInitial"
                      value={editingProvider.middleInitial || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, middleInitial: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCredentials">Credentials</Label>
                    <Input
                      id="editCredentials"
                      name="editCredentials"
                      value={editingProvider.credentials || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, credentials: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="editProviderType">This referrer is an:</Label>
                  <RadioGroup value={editingProvider.providerType || 'individual'} onValueChange={(value) => setEditingProvider({ ...editingProvider, providerType: value as 'individual' | 'organization' })}>
                    <div className="flex space-x-4 mt-2">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="editReferringType">Referring Type</Label>
                    <Select value={editingProvider.referringType || 'Referring Provider'} onValueChange={(value) => setEditingProvider({ ...editingProvider, referringType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {referringTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="editDoNotSendOnClaims"
                      checked={editingProvider.doNotSendOnClaims || false}
                      onCheckedChange={(checked) => setEditingProvider({ ...editingProvider, doNotSendOnClaims: !!checked })}
                    />
                    <Label htmlFor="editDoNotSendOnClaims">Do not send referrer on claims</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="editNpi">NPI</Label>
                    <div className="flex gap-2">
                      <Input
                        id="editNpi"
                        name="editNpi"
                        value={editingProvider.npi || ''}
                        onChange={(e) => setEditingProvider({ ...editingProvider, npi: e.target.value })}
                        autoComplete="off"
                      />
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="editTaxonomySpecialty">Taxonomy Specialty</Label>
                    <div className="flex gap-2">
                      <Input
                        id="editTaxonomySpecialty"
                        name="editTaxonomySpecialty"
                        value={editingProvider.taxonomySpecialty || ''}
                        onChange={(e) => setEditingProvider({ ...editingProvider, taxonomySpecialty: e.target.value })}
                        autoComplete="off"
                      />
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="editSequenceNumber">Sequence #</Label>
                    <Input
                      id="editSequenceNumber"
                      name="editSequenceNumber"
                      value={editingProvider.sequenceNumber || 'NEW'}
                      onChange={(e) => setEditingProvider({ ...editingProvider, sequenceNumber: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editReferenceNumber">Reference #</Label>
                    <Input
                      id="editReferenceNumber"
                      name="editReferenceNumber"
                      value={editingProvider.referenceNumber || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, referenceNumber: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="editAddress">Address</Label>
                    <Input
                      id="editAddress"
                      name="editAddress"
                      value={editingProvider.address || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, address: e.target.value })}
                      autoComplete="street-address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCity">City</Label>
                    <Input
                      id="editCity"
                      name="editCity"
                      value={editingProvider.city || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, city: e.target.value })}
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editState">State</Label>
                    <Select value={editingProvider.state || ''} onValueChange={(value) => setEditingProvider({ ...editingProvider, state: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editZipCode">ZIP Code</Label>
                    <Input
                      id="editZipCode"
                      name="editZipCode"
                      value={editingProvider.zipCode || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, zipCode: e.target.value })}
                      autoComplete="postal-code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editHomePhone">Home Phone</Label>
                    <Input
                      id="editHomePhone"
                      name="editHomePhone"
                      value={editingProvider.homePhone || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, homePhone: e.target.value })}
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCellPhone">Cell Phone</Label>
                    <Input
                      id="editCellPhone"
                      name="editCellPhone"
                      value={editingProvider.cellPhone || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, cellPhone: e.target.value })}
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPhone">Phone</Label>
                    <Input
                      id="editPhone"
                      name="editPhone"
                      value={editingProvider.phone || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, phone: e.target.value })}
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editFax">Fax</Label>
                    <Input
                      id="editFax"
                      name="editFax"
                      value={editingProvider.fax || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, fax: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPager">Pager</Label>
                    <Input
                      id="editPager"
                      name="editPager"
                      value={editingProvider.pager || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, pager: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="editEmail">Email</Label>
                    <Input
                      id="editEmail"
                      name="editEmail"
                      type="email"
                      value={editingProvider.email || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, email: e.target.value })}
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ID Numbers */}
              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">ID Numbers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editTaxId">Tax ID</Label>
                    <Input
                      id="editTaxId"
                      name="editTaxId"
                      value={editingProvider.taxId || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, taxId: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editTaxIdType">Tax ID Type</Label>
                    <Select value={editingProvider.taxIdType || 'NONE'} onValueChange={(value) => setEditingProvider({ ...editingProvider, taxIdType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taxIdTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editUpin">UPIN</Label>
                    <Input
                      id="editUpin"
                      name="editUpin"
                      value={editingProvider.upin || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, upin: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editBcbsId">BCBS ID</Label>
                    <Input
                      id="editBcbsId"
                      name="editBcbsId"
                      value={editingProvider.bcbsId || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, bcbsId: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMedicareId">Medicare ID</Label>
                    <Input
                      id="editMedicareId"
                      name="editMedicareId"
                      value={editingProvider.medicareId || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, medicareId: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMedicaidId">Medicaid ID</Label>
                    <Input
                      id="editMedicaidId"
                      name="editMedicaidId"
                      value={editingProvider.medicaidId || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, medicaidId: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editChampusId">Champus ID</Label>
                    <Input
                      id="editChampusId"
                      name="editChampusId"
                      value={editingProvider.champusId || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, champusId: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editSpecialtyLicenseNumber">Specialty License #</Label>
                    <Input
                      id="editSpecialtyLicenseNumber"
                      name="editSpecialtyLicenseNumber"
                      value={editingProvider.specialtyLicenseNumber || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, specialtyLicenseNumber: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editStateLicenseNumber">State License #</Label>
                    <Input
                      id="editStateLicenseNumber"
                      name="editStateLicenseNumber"
                      value={editingProvider.stateLicenseNumber || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, stateLicenseNumber: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editAnesthesiaLicenseNumber">Anesthesia License #</Label>
                    <Input
                      id="editAnesthesiaLicenseNumber"
                      name="editAnesthesiaLicenseNumber"
                      value={editingProvider.anesthesiaLicenseNumber || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, anesthesiaLicenseNumber: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMarketer">Marketer</Label>
                    <Input
                      id="editMarketer"
                      name="editMarketer"
                      value={editingProvider.marketer || ''}
                      onChange={(e) => setEditingProvider({ ...editingProvider, marketer: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Status */}
              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editStatus">Status</Label>
                    <Select value={editingProvider.status || 'active'} onValueChange={(value) => setEditingProvider({ ...editingProvider, status: value as 'active' | 'inactive' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
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
              Update Referring Provider
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
