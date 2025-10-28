import React, { useState } from 'react';
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

const sampleProviders: Provider[] = [
  {
    id: '1',
    // Provider Identification
    lastName: 'Smith',
    firstName: 'John',
    middleInitial: 'M',
    credentials: 'MD',
    providerType: 'individual',
    npi: '1234567890',
    taxonomySpecialty: 'Family Medicine',
    sequenceNumber: 'NEW',
    referenceNumber: 'REF001',
    code: 'CODE001',
    
    // Billing Information
    practiceForProvider: 'Main Street Medical',
    billClaimsUnder: 'SELF',
    checkEligibilityUnder: 'SELF',
    useIdNumber: 'Employer Identification# (EIN)',
    employerIdentificationNumber: '12-3456789',
    billAs: 'Individual',
    billProfessionalClaims: true,
    billInstitutionalClaims: false,
    
    // Internal Use
    submitterNumber: 'SUB001',
    tcnPrefix: 'TCN001',
    
    // Contact Information
    homePhone: '(555) 123-4567',
    cellPhone: '(555) 123-4568',
    faxNumber: '(555) 123-4569',
    pagerNumber: '(555) 123-4570',
    email: 'john.smith@example.com',
    
    // ID Numbers
    specialtyLicenseNumber: 'SL12345',
    stateLicenseNumber: 'SL67890',
    anesthesiaLicenseNumber: 'AL12345',
    upinNumber: 'UPIN123456',
    blueCrossNumber: 'BC123456',
    tricareChampusNumber: 'TC123456',
    
    // Claim Defaults
    revCode: 'REV001',
    defaultFacility: 'Main Street Medical',
    
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  }
];

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
  const [providers, setProviders] = useState<Provider[]>(sampleProviders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
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

  const handleAddProvider = () => {
    if (!newProvider.firstName || !newProvider.lastName || !newProvider.npi) {
      alert('Please fill in required fields');
      return;
    }

    const provider: Provider = {
      id: Date.now().toString(),
      lastName: newProvider.lastName!,
      firstName: newProvider.firstName!,
      middleInitial: newProvider.middleInitial || '',
      credentials: newProvider.credentials || '',
      providerType: newProvider.providerType || 'individual',
      npi: newProvider.npi!,
      taxonomySpecialty: newProvider.taxonomySpecialty || '',
      sequenceNumber: newProvider.sequenceNumber || 'NEW',
      referenceNumber: newProvider.referenceNumber || '',
      code: newProvider.code || '',
      practiceForProvider: newProvider.practiceForProvider || '',
      billClaimsUnder: newProvider.billClaimsUnder || 'SELF',
      checkEligibilityUnder: newProvider.checkEligibilityUnder || 'SELF',
      useIdNumber: newProvider.useIdNumber || 'Employer Identification# (EIN)',
      employerIdentificationNumber: newProvider.employerIdentificationNumber || '',
      billAs: newProvider.billAs || 'Individual',
      billProfessionalClaims: newProvider.billProfessionalClaims || false,
      billInstitutionalClaims: newProvider.billInstitutionalClaims || false,
      submitterNumber: newProvider.submitterNumber || '',
      tcnPrefix: newProvider.tcnPrefix || '',
      homePhone: newProvider.homePhone || '',
      cellPhone: newProvider.cellPhone || '',
      faxNumber: newProvider.faxNumber || '',
      pagerNumber: newProvider.pagerNumber || '',
      email: newProvider.email || '',
      specialtyLicenseNumber: newProvider.specialtyLicenseNumber || '',
      stateLicenseNumber: newProvider.stateLicenseNumber || '',
      anesthesiaLicenseNumber: newProvider.anesthesiaLicenseNumber || '',
      upinNumber: newProvider.upinNumber || '',
      blueCrossNumber: newProvider.blueCrossNumber || '',
      tricareChampusNumber: newProvider.tricareChampusNumber || '',
      revCode: newProvider.revCode || '',
      defaultFacility: newProvider.defaultFacility || '',
      status: newProvider.status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setProviders([...providers, provider]);
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
  };

  const handleEditProvider = (provider: Provider) => {
    setEditingProvider(provider);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProvider = () => {
    if (!editingProvider) return;

    setProviders(providers.map(p => 
      p.id === editingProvider.id 
        ? { ...editingProvider, updatedAt: new Date().toISOString().split('T')[0] }
        : p
    ));
    setIsEditDialogOpen(false);
    setEditingProvider(null);
  };

  const handleDeleteProvider = (id: string) => {
    if (confirm('Are you sure you want to delete this provider?')) {
      setProviders(providers.filter(p => p.id !== id));
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
        {filteredProviders.map((provider) => (
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
        ))}
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