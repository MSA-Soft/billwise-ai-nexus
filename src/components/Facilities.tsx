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
import { Plus, Search, Edit, Trash2, Download, Upload, ChevronDown, ChevronRight, Building, FileDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

// All facility data is now fetched from the database

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
  const { toast } = useToast();
  const { currentCompany } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [expandedFacility, setExpandedFacility] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  // Fetch facilities from database
  useEffect(() => {
    fetchFacilitiesFromDatabase();
  }, []);

  const fetchFacilitiesFromDatabase = async () => {
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      console.log('🔍 Fetching facilities from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch facilities.');
        setFacilities([]);
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('facilities' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching facilities:', error);
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('⚠️ Facilities table not found. Please run CREATE_FACILITIES_TABLE_COMPLETE.sql');
          toast({
            title: 'Table Not Found',
            description: 'Facilities table does not exist. Please run the SQL setup script.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading facilities',
            description: error.message,
            variant: 'destructive',
          });
        }
        setFacilities([]);
        return;
      }

      // Transform database records to match Facility interface
      const transformedFacilities: Facility[] = (data || []).map((dbFacility: any) => {
        // Handle name field - use name or facility_name
        const facilityName = dbFacility.name || dbFacility.facility_name || '';
        // Combine address_line1 and address_line2 into single address field for UI
        const address = [dbFacility.address_line1, dbFacility.address_line2]
          .filter(Boolean)
          .join(', ') || '';
        
        return {
          id: dbFacility.id,
          name: facilityName,
          npi: dbFacility.npi || '',
          taxonomySpecialty: dbFacility.taxonomy_specialty || '',
          sequenceNumber: dbFacility.sequence_number || '',
          referenceNumber: dbFacility.reference_number || '',
          address: address,
          city: dbFacility.city || '',
          state: dbFacility.state || '',
          zipCode: dbFacility.zip_code || dbFacility.zip || '',
          phone: dbFacility.phone || '',
          fax: dbFacility.fax || '',
          email: dbFacility.email || '',
          taxId: dbFacility.tax_id || '',
          cliaId: dbFacility.clia_id || '',
          locationProviderId: dbFacility.location_provider_id || '',
          siteId: dbFacility.site_id || '',
          blueCrossId: dbFacility.blue_cross_id || '',
          blueShieldId: dbFacility.blue_shield_id || '',
          medicareId: dbFacility.medicare_id || '',
          medicaidId: dbFacility.medicaid_id || '',
          locatorCode: dbFacility.locator_code || '',
          placeOfService: dbFacility.place_of_service || '',
          status: (dbFacility.status || (dbFacility.is_active ? 'active' : 'inactive')) as 'active' | 'inactive',
          createdAt: dbFacility.created_at || '',
          updatedAt: dbFacility.updated_at || dbFacility.created_at || ''
        };
      });

      console.log(`✅ Successfully loaded ${transformedFacilities.length} facilities from database`);
      setFacilities(transformedFacilities);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchFacilitiesFromDatabase:', error);
      toast({
        title: 'Error loading facilities',
        description: error.message || 'Failed to load facilities from database',
        variant: 'destructive',
      });
      setFacilities([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };
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

  const handleAddFacility = async () => {
    if (!newFacility.name) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required field (Name).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating facility:', newFacility);

      // Get current user session for user_id (optional - facilities don't need to be tied to users)
      const { data: { session } } = await supabase.auth.getSession();

      // Split address into address_line1 and address_line2
      const addressParts = (newFacility.address || '').split(',').map(s => s.trim());
      const addressLine1 = addressParts[0] || null;
      const addressLine2 = addressParts.length > 1 ? addressParts.slice(1).join(', ') : null;

      // Prepare data for database (snake_case)
      const insertData: any = {
        user_id: session?.user?.id || null, // Set to current user or null
        company_id: currentCompany?.id || null, // Set to current company or null
        name: newFacility.name!.trim(),
        facility_name: newFacility.name!.trim(), // Also set facility_name for compatibility
        npi: newFacility.npi || null,
        taxonomy_specialty: newFacility.taxonomySpecialty || null,
        sequence_number: newFacility.sequenceNumber || null,
        reference_number: newFacility.referenceNumber || null,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city: newFacility.city || null,
        state: newFacility.state || null,
        zip_code: newFacility.zipCode || null,
        phone: newFacility.phone || null,
        fax: newFacility.fax || null,
        email: newFacility.email || null,
        tax_id: newFacility.taxId || null,
        clia_id: newFacility.cliaId || null,
        location_provider_id: newFacility.locationProviderId || null,
        site_id: newFacility.siteId || null,
        blue_cross_id: newFacility.blueCrossId || null,
        blue_shield_id: newFacility.blueShieldId || null,
        medicare_id: newFacility.medicareId || null,
        medicaid_id: newFacility.medicaidId || null,
        locator_code: newFacility.locatorCode || null,
        place_of_service: newFacility.placeOfService || null,
        status: (newFacility.status || 'active') as 'active' | 'inactive',
        is_active: (newFacility.status || 'active') === 'active'
      };

      // Remove null values for optional fields
      Object.keys(insertData).forEach(key => {
        if (insertData[key] === null || insertData[key] === '') {
          delete insertData[key];
        }
      });

      const { data, error } = await supabase
        .from('facilities' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating facility:', error);
        throw new Error(error.message || 'Failed to create facility');
      }

      // Refresh the facilities list
      await fetchFacilitiesFromDatabase();

      // Reset form
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

      toast({
        title: "Facility Added",
        description: `${newFacility.name} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create facility:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create facility. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleEditFacility = (facility: Facility) => {
    setEditingFacility(facility);
    setIsEditDialogOpen(true);
  };

  const handleUpdateFacility = async () => {
    if (!editingFacility || !editingFacility.id) {
      toast({
        title: "Error",
        description: "Facility ID is missing. Cannot update.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Updating facility:', editingFacility);

      // Split address into address_line1 and address_line2
      const addressParts = (editingFacility.address || '').split(',').map(s => s.trim());
      const addressLine1 = addressParts[0] || null;
      const addressLine2 = addressParts.length > 1 ? addressParts.slice(1).join(', ') : null;

      // Prepare data for database (snake_case)
      const updateData: any = {
        name: editingFacility.name.trim(),
        facility_name: editingFacility.name.trim(), // Also update facility_name for compatibility
        npi: editingFacility.npi || null,
        taxonomy_specialty: editingFacility.taxonomySpecialty || null,
        sequence_number: editingFacility.sequenceNumber || null,
        reference_number: editingFacility.referenceNumber || null,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city: editingFacility.city || null,
        state: editingFacility.state || null,
        zip_code: editingFacility.zipCode || null,
        phone: editingFacility.phone || null,
        fax: editingFacility.fax || null,
        email: editingFacility.email || null,
        tax_id: editingFacility.taxId || null,
        clia_id: editingFacility.cliaId || null,
        location_provider_id: editingFacility.locationProviderId || null,
        site_id: editingFacility.siteId || null,
        blue_cross_id: editingFacility.blueCrossId || null,
        blue_shield_id: editingFacility.blueShieldId || null,
        medicare_id: editingFacility.medicareId || null,
        medicaid_id: editingFacility.medicaidId || null,
        locator_code: editingFacility.locatorCode || null,
        place_of_service: editingFacility.placeOfService || null,
        status: editingFacility.status as 'active' | 'inactive',
        is_active: editingFacility.status === 'active'
      };

      // Remove null values for optional fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const { error } = await supabase
        .from('facilities' as any)
        .update(updateData)
        .eq('id', editingFacility.id);

      if (error) {
        console.error('❌ Error updating facility:', error);
        throw new Error(error.message || 'Failed to update facility');
      }

      // Refresh the facilities list
      await fetchFacilitiesFromDatabase();

      setIsEditDialogOpen(false);
      setEditingFacility(null);

      toast({
        title: "Facility Updated",
        description: `${editingFacility.name} has been successfully updated.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to update facility:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update facility. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleDeleteFacility = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this facility? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting facility:', id);

      const { error } = await supabase
        .from('facilities' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting facility:', error);
        throw new Error(error.message || 'Failed to delete facility');
      }

      // Refresh the facilities list
      await fetchFacilitiesFromDatabase();

      toast({
        title: "Facility Deleted",
        description: "Facility has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('💥 Failed to delete facility:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete facility. Please try again.',
        variant: "destructive",
      });
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

  const handleDownloadSampleCSV = () => {
    const csvContent = [
      'Name,NPI,Specialty,Status,Phone,Email,Address,City,State,Zip Code',
      'Main Medical Center,1234567890,Hospital,active,(555) 111-0000,info@mainmedical.com,789 Hospital Dr,Chicago,IL,60601',
      'Outpatient Clinic,0987654321,Clinic,active,(555) 222-0000,contact@outpatient.com,456 Clinic Ave,Houston,TX,77001'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'facilities-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFacilities = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        const importedFacilities: Partial<Facility>[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const facilityData: Partial<Facility> = {
              name: values[headers.indexOf('name')] || '',
              npi: values[headers.indexOf('npi')] || '',
              taxonomySpecialty: values[headers.indexOf('specialty')] || values[headers.indexOf('taxonomy specialty')] || '',
              status: (values[headers.indexOf('status')] as 'active' | 'inactive') || 'active',
              phone: values[headers.indexOf('phone')] || '',
              email: values[headers.indexOf('email')] || '',
              address: values[headers.indexOf('address')] || '',
              city: values[headers.indexOf('city')] || '',
              state: values[headers.indexOf('state')] || '',
              zipCode: values[headers.indexOf('zip code')] || values[headers.indexOf('zipcode')] || '',
            };

            if (facilityData.name) {
              importedFacilities.push(facilityData);
            }
          }
        }

        // Insert facilities into database
        let successCount = 0;
        let errorCount = 0;

        for (const facilityData of importedFacilities) {
          try {
            const addressParts = (facilityData.address || '').split(',').map(p => p.trim());
            const insertData: any = {
              name: facilityData.name!.trim(),
              npi: facilityData.npi || null,
              taxonomy_specialty: facilityData.taxonomySpecialty || null,
              address_line1: addressParts[0] || null,
              address_line2: addressParts[1] || null,
              city: facilityData.city || null,
              state: facilityData.state || null,
              zip_code: facilityData.zipCode || null,
              phone: facilityData.phone || null,
              email: facilityData.email || null,
              status: (facilityData.status || 'active') as 'active' | 'inactive',
              is_active: (facilityData.status || 'active') === 'active',
            };

            const { error } = await supabase
              .from('facilities' as any)
              .insert(insertData);

            if (error) throw error;
            successCount++;
          } catch (error) {
            console.error('Error importing facility:', error);
            errorCount++;
          }
        }

        // Refresh the facilities list
        await fetchFacilitiesFromDatabase();

        toast({
          title: "Import Complete",
          description: `${successCount} facilities imported successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}.`,
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading facilities...</p>
            </div>
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No facilities found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search criteria"
                : "Get started by adding your first facility"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Facility
              </Button>
            )}
          </div>
        ) : (
          filteredFacilities.map((facility) => (
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
          ))
        )}
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
