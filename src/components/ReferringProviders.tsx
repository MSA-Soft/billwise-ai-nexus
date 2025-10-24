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
import { Plus, Search, Edit, Trash2, Download, Upload, ChevronDown, ChevronRight, User } from 'lucide-react';

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

const sampleReferringProviders: ReferringProvider[] = [
  {
    id: '1',
    // Basic Information
    lastName: 'Smith',
    firstName: 'John',
    middleInitial: 'M',
    credentials: 'MD',
    providerType: 'individual',
    referringType: 'Referring Provider',
    doNotSendOnClaims: false,
    npi: '1234567890',
    taxonomySpecialty: 'Family Medicine',
    sequenceNumber: 'NEW',
    referenceNumber: 'REF001',
    
    // Contact Information
    address: '123 Main Street',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    homePhone: '(555) 123-4567',
    cellPhone: '(555) 123-4568',
    phone: '(555) 123-4569',
    fax: '(555) 123-4570',
    pager: '(555) 123-4571',
    email: 'john.smith@example.com',
    
    // ID Numbers
    taxId: '12-3456789',
    taxIdType: 'NONE',
    upin: 'UPIN123456',
    bcbsId: 'BCBS123456',
    medicareId: 'MC123456',
    medicaidId: 'MD123456',
    champusId: 'CH123456',
    specialtyLicenseNumber: 'SL12345',
    stateLicenseNumber: 'SL67890',
    anesthesiaLicenseNumber: 'AL12345',
    marketer: 'MARKET001',
    
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  }
];

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
  const [referringProviders, setReferringProviders] = useState<ReferringProvider[]>(sampleReferringProviders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ReferringProvider | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
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

  const handleAddProvider = () => {
    if (!newProvider.firstName || !newProvider.lastName || !newProvider.npi) {
      alert('Please fill in required fields');
      return;
    }

    const provider: ReferringProvider = {
      id: Date.now().toString(),
      lastName: newProvider.lastName!,
      firstName: newProvider.firstName!,
      middleInitial: newProvider.middleInitial || '',
      credentials: newProvider.credentials || '',
      providerType: newProvider.providerType || 'individual',
      referringType: newProvider.referringType || 'Referring Provider',
      doNotSendOnClaims: newProvider.doNotSendOnClaims || false,
      npi: newProvider.npi!,
      taxonomySpecialty: newProvider.taxonomySpecialty || '',
      sequenceNumber: newProvider.sequenceNumber || 'NEW',
      referenceNumber: newProvider.referenceNumber || '',
      address: newProvider.address || '',
      city: newProvider.city || '',
      state: newProvider.state || '',
      zipCode: newProvider.zipCode || '',
      homePhone: newProvider.homePhone || '',
      cellPhone: newProvider.cellPhone || '',
      phone: newProvider.phone || '',
      fax: newProvider.fax || '',
      pager: newProvider.pager || '',
      email: newProvider.email || '',
      taxId: newProvider.taxId || '',
      taxIdType: newProvider.taxIdType || 'NONE',
      upin: newProvider.upin || '',
      bcbsId: newProvider.bcbsId || '',
      medicareId: newProvider.medicareId || '',
      medicaidId: newProvider.medicaidId || '',
      champusId: newProvider.champusId || '',
      specialtyLicenseNumber: newProvider.specialtyLicenseNumber || '',
      stateLicenseNumber: newProvider.stateLicenseNumber || '',
      anesthesiaLicenseNumber: newProvider.anesthesiaLicenseNumber || '',
      marketer: newProvider.marketer || '',
      status: newProvider.status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setReferringProviders([...referringProviders, provider]);
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
  };

  const handleEditProvider = (provider: ReferringProvider) => {
    setEditingProvider(provider);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProvider = () => {
    if (!editingProvider) return;

    setReferringProviders(referringProviders.map(p => 
      p.id === editingProvider.id 
        ? { ...editingProvider, updatedAt: new Date().toISOString().split('T')[0] }
        : p
    ));
    setIsEditDialogOpen(false);
    setEditingProvider(null);
  };

  const handleDeleteProvider = (id: string) => {
    if (confirm('Are you sure you want to delete this referring provider?')) {
      setReferringProviders(referringProviders.filter(p => p.id !== id));
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

  const handleImportProviders = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      console.log('Importing referring providers from CSV:', text);
      alert('CSV import functionality would be implemented here');
    };
    reader.readAsText(file);
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
        ))}
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
              {/* Similar form structure as Add Provider but with editingProvider data */}
              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="editLastName">Last Name *</Label>
                    <Input
                      id="editLastName"
                      name="editLastName"
                      value={editingProvider.lastName}
                      onChange={(e) => setEditingProvider({ ...editingProvider, lastName: e.target.value })}
                      autoComplete="family-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editFirstName">First Name *</Label>
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
                    <Button variant="outline" className="w-full justify-start">
                      {editingProvider.credentials || 'Credentials'}
                    </Button>
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
