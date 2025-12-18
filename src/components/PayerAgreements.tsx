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
import { Plus, Search, Edit, Trash2, Download, Upload, ChevronDown, ChevronRight, Users, Copy, X, FileDown } from 'lucide-react';

interface PayerAgreement {
  id: string;
  // Provider Type
  providerType: 'individual' | 'other';
  providerName: string;
  
  // NPI Selection
  npiType: 'practice' | 'other';
  practiceNpi: string;
  otherNpi: string;
  
  // Responsible Party Contact Information
  firstName: string;
  lastName: string;
  phoneNumber: string;
  contactEmail: string;
  
  // Agreement Details
  agreementType: string;
  status: 'active' | 'inactive' | 'pending';
  startDate: string;
  endDate: string;
  notes: string;
  
  createdAt: string;
  updatedAt: string;
}

const samplePayerAgreements: PayerAgreement[] = [
  {
    id: '1',
    // Provider Type
    providerType: 'individual',
    providerName: 'UNITED DIAGNOSTIC SERVICES LLC [10042142]',
    
    // NPI Selection
    npiType: 'practice',
    practiceNpi: '1699406553 - Practice NPI',
    otherNpi: '',
    
    // Responsible Party Contact Information
    firstName: 'John',
    lastName: 'Smith',
    phoneNumber: '(555) 123-4567',
    contactEmail: 'john.smith@uniteddiagnostic.com',
    
    // Agreement Details
    agreementType: 'Standard Agreement',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    notes: 'Standard agreement for diagnostic services',
    
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  }
];

const agreementTypes = [
  'Standard Agreement',
  'Preferred Provider Agreement',
  'Network Agreement',
  'Service Agreement',
  'Other'
];

export const PayerAgreements: React.FC = () => {
  const [payerAgreements, setPayerAgreements] = useState<PayerAgreement[]>(samplePayerAgreements);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<PayerAgreement | null>(null);
  const [expandedAgreement, setExpandedAgreement] = useState<string | null>(null);
  const [newAgreement, setNewAgreement] = useState<Partial<PayerAgreement>>({
    providerType: 'individual',
    providerName: '',
    npiType: 'practice',
    practiceNpi: '',
    otherNpi: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    contactEmail: '',
    agreementType: 'Standard Agreement',
    status: 'active',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const filteredAgreements = payerAgreements.filter(agreement => {
    const matchesSearch = 
      agreement.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.agreementType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || agreement.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddAgreement = () => {
    if (!newAgreement.providerName || !newAgreement.firstName || !newAgreement.lastName) {
      alert('Please fill in required fields');
      return;
    }

    const agreement: PayerAgreement = {
      id: Date.now().toString(),
      providerType: newAgreement.providerType || 'individual',
      providerName: newAgreement.providerName!,
      npiType: newAgreement.npiType || 'practice',
      practiceNpi: newAgreement.practiceNpi || '',
      otherNpi: newAgreement.otherNpi || '',
      firstName: newAgreement.firstName!,
      lastName: newAgreement.lastName!,
      phoneNumber: newAgreement.phoneNumber || '',
      contactEmail: newAgreement.contactEmail || '',
      agreementType: newAgreement.agreementType || 'Standard Agreement',
      status: newAgreement.status || 'active',
      startDate: newAgreement.startDate || '',
      endDate: newAgreement.endDate || '',
      notes: newAgreement.notes || '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setPayerAgreements([...payerAgreements, agreement]);
    setNewAgreement({
      providerType: 'individual',
      providerName: '',
      npiType: 'practice',
      practiceNpi: '',
      otherNpi: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      contactEmail: '',
      agreementType: 'Standard Agreement',
      status: 'active',
      startDate: '',
      endDate: '',
      notes: ''
    });
    setIsAddDialogOpen(false);
  };

  const handleEditAgreement = (agreement: PayerAgreement) => {
    setEditingAgreement(agreement);
    setIsEditDialogOpen(true);
  };

  const handleUpdateAgreement = () => {
    if (!editingAgreement) return;

    setPayerAgreements(payerAgreements.map(a => 
      a.id === editingAgreement.id 
        ? { ...editingAgreement, updatedAt: new Date().toISOString().split('T')[0] }
        : a
    ));
    setIsEditDialogOpen(false);
    setEditingAgreement(null);
  };

  const handleDeleteAgreement = (id: string) => {
    if (confirm('Are you sure you want to delete this agreement?')) {
      setPayerAgreements(payerAgreements.filter(a => a.id !== id));
    }
  };

  const handleExportAgreements = () => {
    const csvContent = [
      ['Provider Name', 'Agreement Type', 'Status', 'Contact Name', 'Phone', 'Email'].join(','),
      ...payerAgreements.map(agreement => [
        agreement.providerName,
        agreement.agreementType,
        agreement.status,
        `${agreement.firstName} ${agreement.lastName}`,
        agreement.phoneNumber,
        agreement.contactEmail
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payer-agreements.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = [
      'Provider Name,First Name,Last Name,Phone Number,Contact Email,Agreement Type,Status,Start Date,End Date',
      'UNITED DIAGNOSTIC SERVICES LLC [10042142],John,Smith,(555) 123-4567,john.smith@uniteddiagnostic.com,Standard Agreement,active,2024-01-01,2024-12-31',
      'ABC MEDICAL GROUP [20053153],Jane,Doe,(555) 987-6543,jane.doe@abcmedical.com,Premium Agreement,active,2024-01-01,2024-12-31'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payer-agreements-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportAgreements = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        const importedAgreements: Partial<PayerAgreement>[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const agreementData: Partial<PayerAgreement> = {
              providerName: values[headers.indexOf('provider name')] || values[headers.indexOf('providername')] || '',
              firstName: values[headers.indexOf('first name')] || values[headers.indexOf('firstname')] || '',
              lastName: values[headers.indexOf('last name')] || values[headers.indexOf('lastname')] || '',
              phoneNumber: values[headers.indexOf('phone number')] || values[headers.indexOf('phonenumber')] || '',
              contactEmail: values[headers.indexOf('contact email')] || values[headers.indexOf('contactemail')] || '',
              agreementType: values[headers.indexOf('agreement type')] || values[headers.indexOf('agreementtype')] || 'Standard Agreement',
              status: (values[headers.indexOf('status')] as 'active' | 'inactive' | 'pending') || 'active',
              startDate: values[headers.indexOf('start date')] || values[headers.indexOf('startdate')] || '',
              endDate: values[headers.indexOf('end date')] || values[headers.indexOf('enddate')] || '',
            };

            if (agreementData.providerName) {
              importedAgreements.push(agreementData);
            }
          }
        }

        // Insert agreements into database (or state if no database)
        let successCount = 0;
        let errorCount = 0;

        for (const agreementData of importedAgreements) {
          try {
            // If using database, insert here
            // For now, add to state
            const newAgreement: PayerAgreement = {
              id: Date.now().toString() + Math.random(),
              providerType: agreementData.providerType || 'individual',
              providerName: agreementData.providerName!,
              npiType: agreementData.npiType || 'practice',
              practiceNpi: agreementData.practiceNpi || '',
              otherNpi: agreementData.otherNpi || '',
              firstName: agreementData.firstName || '',
              lastName: agreementData.lastName || '',
              phoneNumber: agreementData.phoneNumber || '',
              contactEmail: agreementData.contactEmail || '',
              agreementType: agreementData.agreementType || 'Standard Agreement',
              status: (agreementData.status || 'active') as 'active' | 'inactive' | 'pending',
              startDate: agreementData.startDate || '',
              endDate: agreementData.endDate || '',
              notes: agreementData.notes || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            setPayerAgreements(prev => [...prev, newAgreement]);
            successCount++;
          } catch (error) {
            console.error('Error importing payer agreement:', error);
            errorCount++;
          }
        }

        toast({
          title: "Import Complete",
          description: `${successCount} payer agreements imported successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}.`,
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

  const handleCopyFromUserProfile = () => {
    // This would copy from user profile in a real application
    setNewAgreement(prev => ({
      ...prev,
      firstName: 'John',
      lastName: 'Smith',
      phoneNumber: '(555) 123-4567',
      contactEmail: 'john.smith@example.com'
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payer Agreements</h1>
          <p className="text-muted-foreground">Manage payer agreements and contracts</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Agreement
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search-payer-agreements"
                name="search-payer-agreements"
                placeholder="Search agreements..."
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
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportAgreements}>
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
                    onChange={handleImportAgreements}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payer Agreements List */}
      <div className="space-y-4">
        {filteredAgreements.map((agreement) => (
          <Card key={agreement.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="text-lg">
                      {agreement.providerName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {agreement.agreementType} • {agreement.firstName} {agreement.lastName}
                    </p>
                  </div>
                  <Badge variant={agreement.status === 'active' ? 'default' : agreement.status === 'pending' ? 'secondary' : 'destructive'}>
                    {agreement.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedAgreement(
                      expandedAgreement === agreement.id ? null : agreement.id
                    )}
                  >
                    {expandedAgreement === agreement.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAgreement(agreement)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAgreement(agreement.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedAgreement === agreement.id && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Agreement Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Provider Type:</strong> {agreement.providerType}</p>
                      <p><strong>NPI Type:</strong> {agreement.npiType}</p>
                      <p><strong>Start Date:</strong> {agreement.startDate}</p>
                      <p><strong>End Date:</strong> {agreement.endDate}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {agreement.firstName} {agreement.lastName}</p>
                      <p><strong>Phone:</strong> {agreement.phoneNumber}</p>
                      <p><strong>Email:</strong> {agreement.contactEmail}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Add Payer Agreement Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Payer Agreement</DialogTitle>
            <DialogDescription>
              Create a new payer agreement. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Provider Type Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">What type of provider should be used for this agreement?</h3>
              <RadioGroup value={newAgreement.providerType || 'individual'} onValueChange={(value) => setNewAgreement({ ...newAgreement, providerType: value as 'individual' | 'other' })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual">Individual / Sole Proprietor (Provider)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="providerName">Provider Name *</Label>
              <div className="flex gap-2">
                <Input
                  id="providerName"
                  name="providerName"
                  value={newAgreement.providerName || ''}
                  onChange={(e) => setNewAgreement({ ...newAgreement, providerName: e.target.value })}
                  autoComplete="organization"
                  placeholder="Enter provider name"
                />
                <Button variant="outline" size="sm">
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* NPI Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Which NPI should be used for this agreement?</h3>
              <RadioGroup value={newAgreement.npiType || 'practice'} onValueChange={(value) => setNewAgreement({ ...newAgreement, npiType: value as 'practice' | 'other' })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="practice" id="practice" />
                  <Label htmlFor="practice">1699406553 - Practice NPI</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other-npi" />
                  <Label htmlFor="other-npi">Other NPI</Label>
                </div>
              </RadioGroup>
              {newAgreement.npiType === 'other' && (
                <div className="mt-2">
                  <Input
                    id="otherNpi"
                    name="otherNpi"
                    value={newAgreement.otherNpi || ''}
                    onChange={(e) => setNewAgreement({ ...newAgreement, otherNpi: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter other NPI"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Agreement Lookup
              </Button>
            </div>

            <Separator />

            {/* Responsible Party Contact Information */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Responsible Party Contact Information</h3>
                <Button 
                  variant="link" 
                  className="text-green-600 hover:text-green-700"
                  onClick={handleCopyFromUserProfile}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy From User Profile
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Please specify who we can contact about the agreements</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={newAgreement.firstName || ''}
                    onChange={(e) => setNewAgreement({ ...newAgreement, firstName: e.target.value })}
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={newAgreement.lastName || ''}
                    onChange={(e) => setNewAgreement({ ...newAgreement, lastName: e.target.value })}
                    autoComplete="family-name"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={newAgreement.phoneNumber || ''}
                    onChange={(e) => setNewAgreement({ ...newAgreement, phoneNumber: e.target.value })}
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={newAgreement.contactEmail || ''}
                    onChange={(e) => setNewAgreement({ ...newAgreement, contactEmail: e.target.value })}
                    autoComplete="email"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Agreement Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Agreement Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agreementType">Agreement Type</Label>
                  <Select value={newAgreement.agreementType || 'Standard Agreement'} onValueChange={(value) => setNewAgreement({ ...newAgreement, agreementType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {agreementTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newAgreement.status || 'active'} onValueChange={(value) => setNewAgreement({ ...newAgreement, status: value as 'active' | 'inactive' | 'pending' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={newAgreement.startDate || ''}
                    onChange={(e) => setNewAgreement({ ...newAgreement, startDate: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={newAgreement.endDate || ''}
                    onChange={(e) => setNewAgreement({ ...newAgreement, endDate: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={newAgreement.notes || ''}
                    onChange={(e) => setNewAgreement({ ...newAgreement, notes: e.target.value })}
                    autoComplete="off"
                    placeholder="Additional notes about the agreement"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAgreement}>
              <Plus className="w-4 h-4 mr-2" />
              New Agreement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Payer Agreement Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Payer Agreement</DialogTitle>
            <DialogDescription>
              Update the payer agreement information below.
            </DialogDescription>
          </DialogHeader>
          {editingAgreement && (
            <div className="space-y-6">
              {/* Similar form structure as Add Agreement but with editingAgreement data */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Provider Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editProviderName">Provider Name *</Label>
                    <Input
                      id="editProviderName"
                      name="editProviderName"
                      value={editingAgreement.providerName}
                      onChange={(e) => setEditingAgreement({ ...editingAgreement, providerName: e.target.value })}
                      autoComplete="organization"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editAgreementType">Agreement Type</Label>
                    <Select value={editingAgreement.agreementType} onValueChange={(value) => setEditingAgreement({ ...editingAgreement, agreementType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {agreementTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
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
            <Button onClick={handleUpdateAgreement}>
              Update Agreement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
