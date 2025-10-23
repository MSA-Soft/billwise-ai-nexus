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
import { Plus, Search, Edit, Trash2, Download, Upload, ChevronDown, ChevronRight, CreditCard } from 'lucide-react';

interface Payer {
  id: string;
  // Basic Information
  name: string;
  planName: string;
  networkStatus: string;
  payerType: string;
  defaultChargeStatus: string;
  clearinghouseProcessingMode: string;
  sequenceNumber: string;
  referenceNumber: string;
  
  // Contact Information
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
  
  // ID Numbers
  groupNumber: string;
  claimOfficeNumber: string;
  payerIdMedigap: string;
  ocna: string;
  
  // Settings
  useAlternatePracticeInfo: boolean;
  
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const samplePayers: Payer[] = [
  {
    id: '1',
    // Basic Information
    name: 'Blue Cross Blue Shield',
    planName: 'BCBS Standard Plan',
    networkStatus: 'In Network',
    payerType: 'Commercial',
    defaultChargeStatus: 'Send to Payer via Clearinghouse',
    clearinghouseProcessingMode: 'The clearinghouse will print and mail the claims',
    sequenceNumber: 'NEW',
    referenceNumber: 'REF001',
    
    // Contact Information
    address: '123 Insurance Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    phone: '(555) 123-4567',
    fax: '(555) 123-4568',
    email: 'info@bcbs.com',
    website: 'www.bcbs.com',
    
    // ID Numbers
    groupNumber: 'GRP001',
    claimOfficeNumber: 'CO001',
    payerIdMedigap: 'PID001',
    ocna: 'OCNA001',
    
    // Settings
    useAlternatePracticeInfo: false,
    
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

const networkStatusOptions = [
  'In Network',
  'Out of Network',
  'Both',
  'Unknown'
];

const payerTypeOptions = [
  'Commercial',
  'Medicare',
  'Medicaid',
  'Tricare',
  'Workers Compensation',
  'Other'
];

const defaultChargeStatusOptions = [
  'Send to Payer via Clearinghouse',
  'Send to Payer Direct',
  'Hold for Review',
  'Do Not Send'
];

const clearinghouseProcessingModeOptions = [
  'The clearinghouse will print and mail the claims',
  'The clearinghouse will send claims electronically',
  'Manual processing required',
  'Other'
];

export const Payers: React.FC = () => {
  const [payers, setPayers] = useState<Payer[]>(samplePayers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPayer, setEditingPayer] = useState<Payer | null>(null);
  const [expandedPayer, setExpandedPayer] = useState<string | null>(null);
  const [newPayer, setNewPayer] = useState<Partial<Payer>>({
    name: '',
    planName: '',
    networkStatus: 'In Network',
    payerType: 'Commercial',
    defaultChargeStatus: 'Send to Payer via Clearinghouse',
    clearinghouseProcessingMode: 'The clearinghouse will print and mail the claims',
    sequenceNumber: 'NEW',
    referenceNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    fax: '',
    email: '',
    website: '',
    groupNumber: '',
    claimOfficeNumber: '',
    payerIdMedigap: '',
    ocna: '',
    useAlternatePracticeInfo: false,
    status: 'active'
  });

  const filteredPayers = payers.filter(payer => {
    const matchesSearch = 
      payer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payer.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payer.payerType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payer.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddPayer = () => {
    if (!newPayer.name || !newPayer.planName) {
      alert('Please fill in required fields');
      return;
    }

    const payer: Payer = {
      id: Date.now().toString(),
      name: newPayer.name!,
      planName: newPayer.planName!,
      networkStatus: newPayer.networkStatus || 'In Network',
      payerType: newPayer.payerType || 'Commercial',
      defaultChargeStatus: newPayer.defaultChargeStatus || 'Send to Payer via Clearinghouse',
      clearinghouseProcessingMode: newPayer.clearinghouseProcessingMode || 'The clearinghouse will print and mail the claims',
      sequenceNumber: newPayer.sequenceNumber || 'NEW',
      referenceNumber: newPayer.referenceNumber || '',
      address: newPayer.address || '',
      city: newPayer.city || '',
      state: newPayer.state || '',
      zipCode: newPayer.zipCode || '',
      phone: newPayer.phone || '',
      fax: newPayer.fax || '',
      email: newPayer.email || '',
      website: newPayer.website || '',
      groupNumber: newPayer.groupNumber || '',
      claimOfficeNumber: newPayer.claimOfficeNumber || '',
      payerIdMedigap: newPayer.payerIdMedigap || '',
      ocna: newPayer.ocna || '',
      useAlternatePracticeInfo: newPayer.useAlternatePracticeInfo || false,
      status: newPayer.status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setPayers([...payers, payer]);
    setNewPayer({
      name: '',
      planName: '',
      networkStatus: 'In Network',
      payerType: 'Commercial',
      defaultChargeStatus: 'Send to Payer via Clearinghouse',
      clearinghouseProcessingMode: 'The clearinghouse will print and mail the claims',
      sequenceNumber: 'NEW',
      referenceNumber: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      fax: '',
      email: '',
      website: '',
      groupNumber: '',
      claimOfficeNumber: '',
      payerIdMedigap: '',
      ocna: '',
      useAlternatePracticeInfo: false,
      status: 'active'
    });
    setIsAddDialogOpen(false);
  };

  const handleEditPayer = (payer: Payer) => {
    setEditingPayer(payer);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePayer = () => {
    if (!editingPayer) return;

    setPayers(payers.map(p => 
      p.id === editingPayer.id 
        ? { ...editingPayer, updatedAt: new Date().toISOString().split('T')[0] }
        : p
    ));
    setIsEditDialogOpen(false);
    setEditingPayer(null);
  };

  const handleDeletePayer = (id: string) => {
    if (confirm('Are you sure you want to delete this payer?')) {
      setPayers(payers.filter(p => p.id !== id));
    }
  };

  const handleExportPayers = () => {
    const csvContent = [
      ['Name', 'Plan Name', 'Payer Type', 'Status', 'Phone', 'Email'].join(','),
      ...payers.map(payer => [
        payer.name,
        payer.planName,
        payer.payerType,
        payer.status,
        payer.phone,
        payer.email
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPayers = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      console.log('Importing payers from CSV:', text);
      alert('CSV import functionality would be implemented here');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payers</h1>
          <p className="text-muted-foreground">Manage insurance payers and their information</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Payer
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search-payers"
                name="search-payers"
                placeholder="Search payers..."
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
              <Button variant="outline" onClick={handleExportPayers}>
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
                    onChange={handleImportPayers}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payers List */}
      <div className="space-y-4">
        {filteredPayers.map((payer) => (
          <Card key={payer.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="text-lg">
                      {payer.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {payer.planName} • {payer.payerType}
                    </p>
                  </div>
                  <Badge variant={payer.status === 'active' ? 'default' : 'secondary'}>
                    {payer.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedPayer(
                      expandedPayer === payer.id ? null : payer.id
                    )}
                  >
                    {expandedPayer === payer.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPayer(payer)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePayer(payer.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedPayer === payer.id && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Payer Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Network Status:</strong> {payer.networkStatus}</p>
                      <p><strong>Default Charge Status:</strong> {payer.defaultChargeStatus}</p>
                      <p><strong>Sequence #:</strong> {payer.sequenceNumber}</p>
                      <p><strong>Reference #:</strong> {payer.referenceNumber}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Phone:</strong> {payer.phone}</p>
                      <p><strong>Fax:</strong> {payer.fax}</p>
                      <p><strong>Email:</strong> {payer.email}</p>
                      <p><strong>Website:</strong> {payer.website}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Add Payer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Payer</DialogTitle>
            <DialogDescription>
              Enter the payer's information below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newPayer.name || ''}
                    onChange={(e) => setNewPayer({ ...newPayer, name: e.target.value })}
                    autoComplete="organization"
                  />
                </div>
                <div>
                  <Label htmlFor="planName">Plan Name *</Label>
                  <Input
                    id="planName"
                    name="planName"
                    value={newPayer.planName || ''}
                    onChange={(e) => setNewPayer({ ...newPayer, planName: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="networkStatus">Network Status</Label>
                  <Select value={newPayer.networkStatus || 'In Network'} onValueChange={(value) => setNewPayer({ ...newPayer, networkStatus: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {networkStatusOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payerType">Payer Type</Label>
                  <Select value={newPayer.payerType || 'Commercial'} onValueChange={(value) => setNewPayer({ ...newPayer, payerType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {payerTypeOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="defaultChargeStatus">Default Charge Status</Label>
                  <Select value={newPayer.defaultChargeStatus || 'Send to Payer via Clearinghouse'} onValueChange={(value) => setNewPayer({ ...newPayer, defaultChargeStatus: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultChargeStatusOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="clearinghouseProcessingMode">Clearinghouse Processing Mode</Label>
                  <Select value={newPayer.clearinghouseProcessingMode || 'The clearinghouse will print and mail the claims'} onValueChange={(value) => setNewPayer({ ...newPayer, clearinghouseProcessingMode: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {clearinghouseProcessingModeOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sequenceNumber">Sequence #</Label>
                  <Input
                    id="sequenceNumber"
                    name="sequenceNumber"
                    value={newPayer.sequenceNumber || 'NEW'}
                    onChange={(e) => setNewPayer({ ...newPayer, sequenceNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="referenceNumber">Reference #</Label>
                  <Input
                    id="referenceNumber"
                    name="referenceNumber"
                    value={newPayer.referenceNumber || ''}
                    onChange={(e) => setNewPayer({ ...newPayer, referenceNumber: e.target.value })}
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
                    value={newPayer.address || ''}
                    onChange={(e) => setNewPayer({ ...newPayer, address: e.target.value })}
                    autoComplete="street-address"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={newPayer.city || ''}
                    onChange={(e) => setNewPayer({ ...newPayer, city: e.target.value })}
                    autoComplete="address-level2"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select value={newPayer.state || ''} onValueChange={(value) => setNewPayer({ ...newPayer, state: value })}>
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
                    value={newPayer.zipCode || ''}
                    onChange={(e) => setNewPayer({ ...newPayer, zipCode: e.target.value })}
                    autoComplete="postal-code"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newPayer.phone || ''}
                    onChange={(e) => setNewPayer({ ...newPayer, phone: e.target.value })}
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="fax">Fax</Label>
                  <Input
                    id="fax"
                    name="fax"
                    value={newPayer.fax || ''}
                    onChange={(e) => setNewPayer({ ...newPayer, fax: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newPayer.email || ''}
                    onChange={(e) => setNewPayer({ ...newPayer, email: e.target.value })}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={newPayer.website || ''}
                    onChange={(e) => setNewPayer({ ...newPayer, website: e.target.value })}
                    autoComplete="url"
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
                  <Label htmlFor="groupNumber">Group Number</Label>
                  <Input
                    id="groupNumber"
                    name="groupNumber"
                    value={newPayer.groupNumber || ''}
                    onChange={(e) => setNewPayer({ ...newPayer, groupNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="claimOfficeNumber">Claim Office #</Label>
                  <Input
                    id="claimOfficeNumber"
                    name="claimOfficeNumber"
                    value={newPayer.claimOfficeNumber || ''}
                    onChange={(e) => setNewPayer({ ...newPayer, claimOfficeNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="payerIdMedigap">Payer ID/Medigap #</Label>
                  <Input
                    id="payerIdMedigap"
                    name="payerIdMedigap"
                    value={newPayer.payerIdMedigap || ''}
                    onChange={(e) => setNewPayer({ ...newPayer, payerIdMedigap: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="ocna">OCNA</Label>
                  <Input
                    id="ocna"
                    name="ocna"
                    value={newPayer.ocna || ''}
                    onChange={(e) => setNewPayer({ ...newPayer, ocna: e.target.value })}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Settings */}
            <div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useAlternatePracticeInfo"
                  checked={newPayer.useAlternatePracticeInfo || false}
                  onCheckedChange={(checked) => setNewPayer({ ...newPayer, useAlternatePracticeInfo: !!checked })}
                />
                <Label htmlFor="useAlternatePracticeInfo">Use alternate practice information (override the practice info on claim)</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPayer}>
              Add Payer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Payer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Payer</DialogTitle>
            <DialogDescription>
              Update the payer's information below.
            </DialogDescription>
          </DialogHeader>
          {editingPayer && (
            <div className="space-y-6">
              {/* Similar form structure as Add Payer but with editingPayer data */}
              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editName">Name *</Label>
                    <Input
                      id="editName"
                      name="editName"
                      value={editingPayer.name}
                      onChange={(e) => setEditingPayer({ ...editingPayer, name: e.target.value })}
                      autoComplete="organization"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPlanName">Plan Name *</Label>
                    <Input
                      id="editPlanName"
                      name="editPlanName"
                      value={editingPayer.planName}
                      onChange={(e) => setEditingPayer({ ...editingPayer, planName: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePayer}>
              Update Payer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
