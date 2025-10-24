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

interface Facility {
  id: string;
  // General Information
  name: string;
  npi: string;
  taxonomySpecialty: string;
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
  
  // ID Numbers
  taxId: string;
  cliaId: string;
  locationProviderId: string;
  siteId: string;
  blueCrossId: string;
  blueShieldId: string;
  medicareId: string;
  medicaidId: string;
  locatorCode: string;
  
  // Claim Defaults
  placeOfService: string;
  
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const sampleFacilities: Facility[] = [
  {
    id: '1',
    // General Information
    name: 'Main Street Medical Center',
    npi: '1234567890',
    taxonomySpecialty: 'General Practice',
    sequenceNumber: 'NEW',
    referenceNumber: 'REF001',
    
    // Contact Information
    address: '123 Main Street',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    phone: '(555) 123-4567',
    fax: '(555) 123-4568',
    email: 'info@mainstreetmedical.com',
    
    // ID Numbers
    taxId: '12-3456789',
    cliaId: 'CLIA12345',
    locationProviderId: 'LOC001',
    siteId: 'SITE001',
    blueCrossId: 'BC123456',
    blueShieldId: 'BS123456',
    medicareId: 'MC123456',
    medicaidId: 'MD123456',
    locatorCode: 'LOC001',
    
    // Claim Defaults
    placeOfService: 'Office',
    
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

const placeOfServiceOptions = [
  'Office',
  'Hospital',
  'Ambulatory Surgical Center',
  'Skilled Nursing Facility',
  'Home',
  'Assisted Living Facility',
  'Urgent Care',
  'Emergency Room',
  'Other'
];

export const Facilities: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>(sampleFacilities);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [expandedFacility, setExpandedFacility] = useState<string | null>(null);
  const [newFacility, setNewFacility] = useState<Partial<Facility>>({
    name: '',
    npi: '',
    taxonomySpecialty: '',
    sequenceNumber: 'NEW',
    referenceNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    fax: '',
    email: '',
    taxId: '',
    cliaId: '',
    locationProviderId: '',
    siteId: '',
    blueCrossId: '',
    blueShieldId: '',
    medicareId: '',
    medicaidId: '',
    locatorCode: '',
    placeOfService: '',
    status: 'active'
  });

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = 
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.npi.includes(searchTerm) ||
      facility.taxonomySpecialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || facility.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddFacility = () => {
    if (!newFacility.name || !newFacility.npi) {
      alert('Please fill in required fields');
      return;
    }

    const facility: Facility = {
      id: Date.now().toString(),
      name: newFacility.name!,
      npi: newFacility.npi!,
      taxonomySpecialty: newFacility.taxonomySpecialty || '',
      sequenceNumber: newFacility.sequenceNumber || 'NEW',
      referenceNumber: newFacility.referenceNumber || '',
      address: newFacility.address || '',
      city: newFacility.city || '',
      state: newFacility.state || '',
      zipCode: newFacility.zipCode || '',
      phone: newFacility.phone || '',
      fax: newFacility.fax || '',
      email: newFacility.email || '',
      taxId: newFacility.taxId || '',
      cliaId: newFacility.cliaId || '',
      locationProviderId: newFacility.locationProviderId || '',
      siteId: newFacility.siteId || '',
      blueCrossId: newFacility.blueCrossId || '',
      blueShieldId: newFacility.blueShieldId || '',
      medicareId: newFacility.medicareId || '',
      medicaidId: newFacility.medicaidId || '',
      locatorCode: newFacility.locatorCode || '',
      placeOfService: newFacility.placeOfService || '',
      status: newFacility.status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setFacilities([...facilities, facility]);
    setNewFacility({
      name: '',
      npi: '',
      taxonomySpecialty: '',
      sequenceNumber: 'NEW',
      referenceNumber: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      fax: '',
      email: '',
      taxId: '',
      cliaId: '',
      locationProviderId: '',
      siteId: '',
      blueCrossId: '',
      blueShieldId: '',
      medicareId: '',
      medicaidId: '',
      locatorCode: '',
      placeOfService: '',
      status: 'active'
    });
    setIsAddDialogOpen(false);
  };

  const handleEditFacility = (facility: Facility) => {
    setEditingFacility(facility);
    setIsEditDialogOpen(true);
  };

  const handleUpdateFacility = () => {
    if (!editingFacility) return;

    setFacilities(facilities.map(f => 
      f.id === editingFacility.id 
        ? { ...editingFacility, updatedAt: new Date().toISOString().split('T')[0] }
        : f
    ));
    setIsEditDialogOpen(false);
    setEditingFacility(null);
  };

  const handleDeleteFacility = (id: string) => {
    if (confirm('Are you sure you want to delete this facility?')) {
      setFacilities(facilities.filter(f => f.id !== id));
    }
  };

  const handleExportFacilities = () => {
    const csvContent = [
      ['Name', 'NPI', 'Specialty', 'Status', 'Phone', 'Email'].join(','),
      ...facilities.map(facility => [
        facility.name,
        facility.npi,
        facility.taxonomySpecialty,
        facility.status,
        facility.phone,
        facility.email
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'facilities.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFacilities = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      console.log('Importing facilities from CSV:', text);
      alert('CSV import functionality would be implemented here');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Facilities</h1>
          <p className="text-muted-foreground">Manage healthcare facilities and their information</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Facility
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search-facilities"
                name="search-facilities"
                placeholder="Search facilities..."
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
              <Button variant="outline" onClick={handleExportFacilities}>
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
                    onChange={handleImportFacilities}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facilities List */}
      <div className="space-y-4">
        {filteredFacilities.map((facility) => (
          <Card key={facility.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="text-lg">
                      {facility.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {facility.taxonomySpecialty} • NPI: {facility.npi}
                    </p>
                  </div>
                  <Badge variant={facility.status === 'active' ? 'default' : 'secondary'}>
                    {facility.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedFacility(
                      expandedFacility === facility.id ? null : facility.id
                    )}
                  >
                    {expandedFacility === facility.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditFacility(facility)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFacility(facility.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedFacility === facility.id && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Facility Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>NPI:</strong> {facility.npi}</p>
                      <p><strong>Sequence #:</strong> {facility.sequenceNumber}</p>
                      <p><strong>Reference #:</strong> {facility.referenceNumber}</p>
                      <p><strong>Tax ID:</strong> {facility.taxId}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Address:</strong> {facility.address}</p>
                      <p><strong>City:</strong> {facility.city}, {facility.state} {facility.zipCode}</p>
                      <p><strong>Phone:</strong> {facility.phone}</p>
                      <p><strong>Email:</strong> {facility.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Add Facility Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Facility</DialogTitle>
            <DialogDescription>
              Enter the facility's information below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* General Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newFacility.name || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                    autoComplete="organization"
                    placeholder="Enter facility name"
                  />
                </div>
                <div>
                  <Label htmlFor="npi">NPI *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="npi"
                      name="npi"
                      value={newFacility.npi || ''}
                      onChange={(e) => setNewFacility({ ...newFacility, npi: e.target.value })}
                      autoComplete="off"
                      placeholder="Enter NPI"
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
                      value={newFacility.taxonomySpecialty || ''}
                      onChange={(e) => setNewFacility({ ...newFacility, taxonomySpecialty: e.target.value })}
                      autoComplete="off"
                      placeholder="Enter taxonomy specialty"
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
                    value={newFacility.sequenceNumber || 'NEW'}
                    onChange={(e) => setNewFacility({ ...newFacility, sequenceNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="referenceNumber">Reference #</Label>
                  <Input
                    id="referenceNumber"
                    name="referenceNumber"
                    value={newFacility.referenceNumber || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, referenceNumber: e.target.value })}
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
                    value={newFacility.address || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, address: e.target.value })}
                    autoComplete="street-address"
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={newFacility.city || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, city: e.target.value })}
                    autoComplete="address-level2"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select value={newFacility.state || ''} onValueChange={(value) => setNewFacility({ ...newFacility, state: value })}>
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
                    value={newFacility.zipCode || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, zipCode: e.target.value })}
                    autoComplete="postal-code"
                    placeholder="Enter ZIP code"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newFacility.phone || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, phone: e.target.value })}
                    autoComplete="tel"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="fax">Fax</Label>
                  <Input
                    id="fax"
                    name="fax"
                    value={newFacility.fax || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, fax: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter fax number"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newFacility.email || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, email: e.target.value })}
                    autoComplete="email"
                    placeholder="Enter email address"
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
                    value={newFacility.taxId || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, taxId: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter Tax ID"
                  />
                </div>
                <div>
                  <Label htmlFor="cliaId">CLIA ID</Label>
                  <Input
                    id="cliaId"
                    name="cliaId"
                    value={newFacility.cliaId || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, cliaId: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter CLIA ID"
                  />
                </div>
                <div>
                  <Label htmlFor="locationProviderId">Location Provider ID</Label>
                  <Input
                    id="locationProviderId"
                    name="locationProviderId"
                    value={newFacility.locationProviderId || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, locationProviderId: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter Location Provider ID"
                  />
                </div>
                <div>
                  <Label htmlFor="siteId">Site ID</Label>
                  <Input
                    id="siteId"
                    name="siteId"
                    value={newFacility.siteId || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, siteId: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter Site ID"
                  />
                </div>
                <div>
                  <Label htmlFor="blueCrossId">BlueCross ID</Label>
                  <Input
                    id="blueCrossId"
                    name="blueCrossId"
                    value={newFacility.blueCrossId || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, blueCrossId: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter BlueCross ID"
                  />
                </div>
                <div>
                  <Label htmlFor="blueShieldId">BlueShield ID</Label>
                  <Input
                    id="blueShieldId"
                    name="blueShieldId"
                    value={newFacility.blueShieldId || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, blueShieldId: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter BlueShield ID"
                  />
                </div>
                <div>
                  <Label htmlFor="medicareId">Medicare ID</Label>
                  <Input
                    id="medicareId"
                    name="medicareId"
                    value={newFacility.medicareId || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, medicareId: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter Medicare ID"
                  />
                </div>
                <div>
                  <Label htmlFor="medicaidId">Medicaid ID</Label>
                  <Input
                    id="medicaidId"
                    name="medicaidId"
                    value={newFacility.medicaidId || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, medicaidId: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter Medicaid ID"
                  />
                </div>
                <div>
                  <Label htmlFor="locatorCode">Locator Code</Label>
                  <Input
                    id="locatorCode"
                    name="locatorCode"
                    value={newFacility.locatorCode || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, locatorCode: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter Locator Code"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Claim Defaults */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Claim Defaults</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="placeOfService">Place of Service</Label>
                  <div className="flex gap-2">
                    <Select value={newFacility.placeOfService || ''} onValueChange={(value) => setNewFacility({ ...newFacility, placeOfService: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select place of service" />
                      </SelectTrigger>
                      <SelectContent>
                        {placeOfServiceOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            <Button onClick={handleAddFacility}>
              Add Facility
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Facility Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Facility</DialogTitle>
            <DialogDescription>
              Update the facility's information below.
            </DialogDescription>
          </DialogHeader>
          {editingFacility && (
            <div className="space-y-6">
              {/* General Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="editName">Name *</Label>
                    <Input
                      id="editName"
                      name="editName"
                      value={editingFacility.name}
                      onChange={(e) => setEditingFacility({ ...editingFacility, name: e.target.value })}
                      autoComplete="organization"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editNpi">NPI *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="editNpi"
                        name="editNpi"
                        value={editingFacility.npi}
                        onChange={(e) => setEditingFacility({ ...editingFacility, npi: e.target.value })}
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
                        value={editingFacility.taxonomySpecialty}
                        onChange={(e) => setEditingFacility({ ...editingFacility, taxonomySpecialty: e.target.value })}
                        autoComplete="off"
                      />
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
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
                      value={editingFacility.address}
                      onChange={(e) => setEditingFacility({ ...editingFacility, address: e.target.value })}
                      autoComplete="street-address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCity">City</Label>
                    <Input
                      id="editCity"
                      name="editCity"
                      value={editingFacility.city}
                      onChange={(e) => setEditingFacility({ ...editingFacility, city: e.target.value })}
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editState">State</Label>
                    <Select value={editingFacility.state} onValueChange={(value) => setEditingFacility({ ...editingFacility, state: value })}>
                      <SelectTrigger>
                        <SelectValue />
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
                      value={editingFacility.zipCode}
                      onChange={(e) => setEditingFacility({ ...editingFacility, zipCode: e.target.value })}
                      autoComplete="postal-code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPhone">Phone</Label>
                    <Input
                      id="editPhone"
                      name="editPhone"
                      value={editingFacility.phone}
                      onChange={(e) => setEditingFacility({ ...editingFacility, phone: e.target.value })}
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editFax">Fax</Label>
                    <Input
                      id="editFax"
                      name="editFax"
                      value={editingFacility.fax}
                      onChange={(e) => setEditingFacility({ ...editingFacility, fax: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="editEmail">Email</Label>
                    <Input
                      id="editEmail"
                      name="editEmail"
                      type="email"
                      value={editingFacility.email}
                      onChange={(e) => setEditingFacility({ ...editingFacility, email: e.target.value })}
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
                      value={editingFacility.taxId}
                      onChange={(e) => setEditingFacility({ ...editingFacility, taxId: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCliaId">CLIA ID</Label>
                    <Input
                      id="editCliaId"
                      name="editCliaId"
                      value={editingFacility.cliaId}
                      onChange={(e) => setEditingFacility({ ...editingFacility, cliaId: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLocationProviderId">Location Provider ID</Label>
                    <Input
                      id="editLocationProviderId"
                      name="editLocationProviderId"
                      value={editingFacility.locationProviderId}
                      onChange={(e) => setEditingFacility({ ...editingFacility, locationProviderId: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editSiteId">Site ID</Label>
                    <Input
                      id="editSiteId"
                      name="editSiteId"
                      value={editingFacility.siteId}
                      onChange={(e) => setEditingFacility({ ...editingFacility, siteId: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editBlueCrossId">BlueCross ID</Label>
                    <Input
                      id="editBlueCrossId"
                      name="editBlueCrossId"
                      value={editingFacility.blueCrossId}
                      onChange={(e) => setEditingFacility({ ...editingFacility, blueCrossId: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editBlueShieldId">BlueShield ID</Label>
                    <Input
                      id="editBlueShieldId"
                      name="editBlueShieldId"
                      value={editingFacility.blueShieldId}
                      onChange={(e) => setEditingFacility({ ...editingFacility, blueShieldId: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMedicareId">Medicare ID</Label>
                    <Input
                      id="editMedicareId"
                      name="editMedicareId"
                      value={editingFacility.medicareId}
                      onChange={(e) => setEditingFacility({ ...editingFacility, medicareId: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMedicaidId">Medicaid ID</Label>
                    <Input
                      id="editMedicaidId"
                      name="editMedicaidId"
                      value={editingFacility.medicaidId}
                      onChange={(e) => setEditingFacility({ ...editingFacility, medicaidId: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLocatorCode">Locator Code</Label>
                    <Input
                      id="editLocatorCode"
                      name="editLocatorCode"
                      value={editingFacility.locatorCode}
                      onChange={(e) => setEditingFacility({ ...editingFacility, locatorCode: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Claim Defaults */}
              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Claim Defaults</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editPlaceOfService">Place of Service</Label>
                    <div className="flex gap-2">
                      <Select value={editingFacility.placeOfService} onValueChange={(value) => setEditingFacility({ ...editingFacility, placeOfService: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {placeOfServiceOptions.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
            <Button onClick={handleUpdateFacility}>
              Update Facility
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
