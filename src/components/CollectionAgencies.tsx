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
import { Plus, Search, Edit, Trash2, Download, Upload, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CollectionAgency {
  id: string;
  // Basic Information
  name: string;
  
  // Contact Information
  address: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  fax: string;
  email: string;
  
  // Additional Information
  agencyType: string;
  status: 'active' | 'inactive';
  commissionRate: number;
  notes: string;
  
  createdAt: string;
  updatedAt: string;
}

// Sample collection agencies removed - now using database
const _sampleCollectionAgencies: CollectionAgency[] = [];

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const agencyTypes = [
  'Medical Collections',
  'General Collections',
  'Commercial Collections',
  'Consumer Collections',
  'Healthcare Collections',
  'Other'
];

export const CollectionAgencies: React.FC = () => {
  const { toast } = useToast();
  const [collectionAgencies, setCollectionAgencies] = useState<CollectionAgency[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<CollectionAgency | null>(null);
  const [expandedAgency, setExpandedAgency] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  // Fetch collection agencies from database
  useEffect(() => {
    fetchCollectionAgenciesFromDatabase();
  }, []);

  const fetchCollectionAgenciesFromDatabase = async () => {
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      console.log('🔍 Fetching collection agencies from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch collection agencies.');
        setCollectionAgencies([]);
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('collection_agencies' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching collection agencies:', error);
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('⚠️ Collection agencies table not found. Please run CREATE_COLLECTION_AGENCIES_TABLE.sql');
          toast({
            title: 'Table Not Found',
            description: 'Collection agencies table does not exist. Please run the SQL setup script.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading collection agencies',
            description: error.message,
            variant: 'destructive',
          });
        }
        setCollectionAgencies([]);
        return;
      }

      // Transform database records to match CollectionAgency interface
      const transformedAgencies: CollectionAgency[] = (data || []).map((dbAgency: any) => ({
        id: dbAgency.id,
        name: dbAgency.name || '',
        address: dbAgency.address || '',
        addressLine2: dbAgency.address_line2 || '',
        city: dbAgency.city || '',
        state: dbAgency.state || '',
        zipCode: dbAgency.zip_code || dbAgency.zip || '',
        phone: dbAgency.phone || '',
        fax: dbAgency.fax || '',
        email: dbAgency.email || '',
        agencyType: dbAgency.agency_type || '',
        status: (dbAgency.status || (dbAgency.is_active ? 'active' : 'inactive')) as 'active' | 'inactive',
        commissionRate: dbAgency.commission_rate ? parseFloat(dbAgency.commission_rate) : 0,
        notes: dbAgency.notes || '',
        createdAt: dbAgency.created_at || '',
        updatedAt: dbAgency.updated_at || dbAgency.created_at || ''
      }));

      console.log(`✅ Successfully loaded ${transformedAgencies.length} collection agencies from database`);
      setCollectionAgencies(transformedAgencies);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchCollectionAgenciesFromDatabase:', error);
      toast({
        title: 'Error loading collection agencies',
        description: error.message || 'Failed to load collection agencies from database',
        variant: 'destructive',
      });
      setCollectionAgencies([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };
  const [newAgency, setNewAgency] = useState<Partial<CollectionAgency>>({
    name: '',
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    fax: '',
    email: '',
    agencyType: 'Medical Collections',
    status: 'active',
    commissionRate: 0,
    notes: ''
  });

  const filteredAgencies = collectionAgencies.filter(agency => {
    const matchesSearch = 
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.agencyType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || agency.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddAgency = async () => {
    if (!newAgency.name) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required field (Name).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating collection agency:', newAgency);

      // Prepare data for database (snake_case) - consistent naming
      const insertData: any = {
        name: newAgency.name!.trim(),
        address: newAgency.address || null,
        address_line2: newAgency.addressLine2 || null,
        city: newAgency.city || null,
        state: newAgency.state || null,
        zip_code: newAgency.zipCode || null,
        phone: newAgency.phone || null,
        fax: newAgency.fax || null,
        email: newAgency.email || null,
        agency_type: newAgency.agencyType || null,
        status: (newAgency.status || 'active') as 'active' | 'inactive',
        is_active: (newAgency.status || 'active') === 'active',
        commission_rate: newAgency.commissionRate || 0,
        notes: newAgency.notes || null
      };

      // Remove null values for optional fields
      Object.keys(insertData).forEach(key => {
        if (insertData[key] === null || insertData[key] === '') {
          delete insertData[key];
        }
      });

      const { data, error } = await supabase
        .from('collection_agencies' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating collection agency:', error);
        throw new Error(error.message || 'Failed to create collection agency');
      }

      // Refresh the collection agencies list
      await fetchCollectionAgenciesFromDatabase();

      // Reset form
      setNewAgency({
        name: '',
        address: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        fax: '',
        email: '',
        agencyType: 'Medical Collections',
        status: 'active',
        commissionRate: 0,
        notes: ''
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Collection Agency Added",
        description: `${newAgency.name} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create collection agency:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create collection agency. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleEditAgency = (agency: CollectionAgency) => {
    setEditingAgency(agency);
    setIsEditDialogOpen(true);
  };

  const handleUpdateAgency = async () => {
    if (!editingAgency || !editingAgency.id) {
      toast({
        title: "Error",
        description: "Agency ID is missing. Cannot update.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Updating collection agency:', editingAgency);

      // Prepare data for database (snake_case) - consistent naming
      const updateData: any = {
        name: editingAgency.name.trim(),
        address: editingAgency.address || null,
        address_line2: editingAgency.addressLine2 || null,
        city: editingAgency.city || null,
        state: editingAgency.state || null,
        zip_code: editingAgency.zipCode || null,
        phone: editingAgency.phone || null,
        fax: editingAgency.fax || null,
        email: editingAgency.email || null,
        agency_type: editingAgency.agencyType || null,
        status: editingAgency.status as 'active' | 'inactive',
        is_active: editingAgency.status === 'active',
        commission_rate: editingAgency.commissionRate || 0,
        notes: editingAgency.notes || null
      };

      // Remove null values for optional fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const { error } = await supabase
        .from('collection_agencies' as any)
        .update(updateData)
        .eq('id', editingAgency.id);

      if (error) {
        console.error('❌ Error updating collection agency:', error);
        throw new Error(error.message || 'Failed to update collection agency');
      }

      // Refresh the collection agencies list
      await fetchCollectionAgenciesFromDatabase();

      setIsEditDialogOpen(false);
      setEditingAgency(null);

      toast({
        title: "Collection Agency Updated",
        description: `${editingAgency.name} has been successfully updated.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to update collection agency:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update collection agency. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleDeleteAgency = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this collection agency? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting collection agency:', id);

      const { error } = await supabase
        .from('collection_agencies' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting collection agency:', error);
        throw new Error(error.message || 'Failed to delete collection agency');
      }

      // Refresh the collection agencies list
      await fetchCollectionAgenciesFromDatabase();

      toast({
        title: "Collection Agency Deleted",
        description: "Collection agency has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('💥 Failed to delete collection agency:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete collection agency. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleExportAgencies = () => {
    const csvContent = [
      ['Name', 'Agency Type', 'Status', 'Phone', 'Email', 'Commission Rate'].join(','),
      ...collectionAgencies.map(agency => [
        agency.name,
        agency.agencyType,
        agency.status,
        agency.phone,
        agency.email,
        agency.commissionRate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'collection-agencies.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportAgencies = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      console.log('Importing collection agencies from CSV:', text);
      alert('CSV import functionality would be implemented here');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Collection Agencies</h1>
          <p className="text-muted-foreground">Manage collection agencies and their information</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Collection Agency
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search-collection-agencies"
                name="search-collection-agencies"
                placeholder="Search collection agencies..."
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
              <Button variant="outline" onClick={handleExportAgencies}>
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
                    onChange={handleImportAgencies}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collection Agencies List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading collection agencies...</p>
            </div>
          </div>
        ) : filteredAgencies.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No collection agencies found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search criteria"
                : "Get started by adding your first collection agency"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Collection Agency
              </Button>
            )}
          </div>
        ) : (
          filteredAgencies.map((agency) => (
          <Card key={agency.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="text-lg">
                      {agency.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {agency.agencyType} • {agency.city}, {agency.state}
                    </p>
                  </div>
                  <Badge variant={agency.status === 'active' ? 'default' : 'secondary'}>
                    {agency.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedAgency(
                      expandedAgency === agency.id ? null : agency.id
                    )}
                  >
                    {expandedAgency === agency.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAgency(agency)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAgency(agency.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedAgency === agency.id && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Agency Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Type:</strong> {agency.agencyType}</p>
                      <p><strong>Commission Rate:</strong> {agency.commissionRate}%</p>
                      <p><strong>Status:</strong> {agency.status}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Address:</strong> {agency.address}</p>
                      {agency.addressLine2 && <p><strong>Address Line 2:</strong> {agency.addressLine2}</p>}
                      <p><strong>City:</strong> {agency.city}, {agency.state} {agency.zipCode}</p>
                      <p><strong>Phone:</strong> {agency.phone}</p>
                      <p><strong>Email:</strong> {agency.email}</p>
                    </div>
                  </div>
                </div>
                {agency.notes && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{agency.notes}</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
          ))
        )}
      </div>

      {/* Add Collection Agency Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Collection Agency</DialogTitle>
            <DialogDescription>
              Enter the collection agency's information below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Name</h3>
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={newAgency.name || ''}
                  onChange={(e) => setNewAgency({ ...newAgency, name: e.target.value })}
                  autoComplete="organization"
                  placeholder="Enter collection agency name"
                  className="border-blue-500"
                />
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
                    value={newAgency.address || ''}
                    onChange={(e) => setNewAgency({ ...newAgency, address: e.target.value })}
                    autoComplete="street-address"
                    placeholder="Enter street address"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    name="addressLine2"
                    value={newAgency.addressLine2 || ''}
                    onChange={(e) => setNewAgency({ ...newAgency, addressLine2: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter address line 2 (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={newAgency.city || ''}
                    onChange={(e) => setNewAgency({ ...newAgency, city: e.target.value })}
                    autoComplete="address-level2"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select value={newAgency.state || ''} onValueChange={(value) => setNewAgency({ ...newAgency, state: value })}>
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
                    value={newAgency.zipCode || ''}
                    onChange={(e) => setNewAgency({ ...newAgency, zipCode: e.target.value })}
                    autoComplete="postal-code"
                    placeholder="Enter ZIP code"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newAgency.phone || ''}
                    onChange={(e) => setNewAgency({ ...newAgency, phone: e.target.value })}
                    autoComplete="tel"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="fax">Fax</Label>
                  <Input
                    id="fax"
                    name="fax"
                    value={newAgency.fax || ''}
                    onChange={(e) => setNewAgency({ ...newAgency, fax: e.target.value })}
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
                    value={newAgency.email || ''}
                    onChange={(e) => setNewAgency({ ...newAgency, email: e.target.value })}
                    autoComplete="email"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agencyType">Agency Type</Label>
                  <Select value={newAgency.agencyType || 'Medical Collections'} onValueChange={(value) => setNewAgency({ ...newAgency, agencyType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {agencyTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newAgency.status || 'active'} onValueChange={(value) => setNewAgency({ ...newAgency, status: value as 'active' | 'inactive' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    name="commissionRate"
                    type="number"
                    step="0.1"
                    value={newAgency.commissionRate || ''}
                    onChange={(e) => setNewAgency({ ...newAgency, commissionRate: parseFloat(e.target.value) || 0 })}
                    autoComplete="off"
                    placeholder="Enter commission rate"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={newAgency.notes || ''}
                    onChange={(e) => setNewAgency({ ...newAgency, notes: e.target.value })}
                    autoComplete="off"
                    placeholder="Additional notes about the collection agency"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAgency}>
              Add Collection Agency
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Collection Agency Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Collection Agency</DialogTitle>
            <DialogDescription>
              Update the collection agency's information below.
            </DialogDescription>
          </DialogHeader>
          {editingAgency && (
            <div className="space-y-6">
              {/* Similar form structure as Add Agency but with editingAgency data */}
              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Name</h3>
                <div>
                  <Label htmlFor="editName">Name *</Label>
                  <Input
                    id="editName"
                    name="editName"
                    value={editingAgency.name}
                    onChange={(e) => setEditingAgency({ ...editingAgency, name: e.target.value })}
                    autoComplete="organization"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="editAddress">Address</Label>
                    <Input
                      id="editAddress"
                      name="editAddress"
                      value={editingAgency.address}
                      onChange={(e) => setEditingAgency({ ...editingAgency, address: e.target.value })}
                      autoComplete="street-address"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="editAddressLine2">Address Line 2</Label>
                    <Input
                      id="editAddressLine2"
                      name="editAddressLine2"
                      value={editingAgency.addressLine2}
                      onChange={(e) => setEditingAgency({ ...editingAgency, addressLine2: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCity">City</Label>
                    <Input
                      id="editCity"
                      name="editCity"
                      value={editingAgency.city}
                      onChange={(e) => setEditingAgency({ ...editingAgency, city: e.target.value })}
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editState">State</Label>
                    <Select value={editingAgency.state} onValueChange={(value) => setEditingAgency({ ...editingAgency, state: value })}>
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
                      value={editingAgency.zipCode}
                      onChange={(e) => setEditingAgency({ ...editingAgency, zipCode: e.target.value })}
                      autoComplete="postal-code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPhone">Phone</Label>
                    <Input
                      id="editPhone"
                      name="editPhone"
                      value={editingAgency.phone}
                      onChange={(e) => setEditingAgency({ ...editingAgency, phone: e.target.value })}
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editFax">Fax</Label>
                    <Input
                      id="editFax"
                      name="editFax"
                      value={editingAgency.fax}
                      onChange={(e) => setEditingAgency({ ...editingAgency, fax: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="editEmail">Email</Label>
                    <Input
                      id="editEmail"
                      name="editEmail"
                      type="email"
                      value={editingAgency.email}
                      onChange={(e) => setEditingAgency({ ...editingAgency, email: e.target.value })}
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editAgencyType">Agency Type</Label>
                    <Select value={editingAgency.agencyType} onValueChange={(value) => setEditingAgency({ ...editingAgency, agencyType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {agencyTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editStatus">Status</Label>
                    <Select value={editingAgency.status} onValueChange={(value) => setEditingAgency({ ...editingAgency, status: value as 'active' | 'inactive' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editCommissionRate">Commission Rate (%)</Label>
                    <Input
                      id="editCommissionRate"
                      name="editCommissionRate"
                      type="number"
                      step="0.1"
                      value={editingAgency.commissionRate}
                      onChange={(e) => setEditingAgency({ ...editingAgency, commissionRate: parseFloat(e.target.value) || 0 })}
                      autoComplete="off"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="editNotes">Notes</Label>
                    <Input
                      id="editNotes"
                      name="editNotes"
                      value={editingAgency.notes}
                      onChange={(e) => setEditingAgency({ ...editingAgency, notes: e.target.value })}
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
            <Button onClick={handleUpdateAgency}>
              Update Collection Agency
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
