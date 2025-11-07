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
import { Plus, Search, Edit, Trash2, Download, Upload, ChevronDown, ChevronRight, FileText, Upload as UploadIcon, Info, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Superbill {
  id: string;
  name: string;
  type: 'form-based' | 'template-based' | 'custom';
  filePath: string;
  fileName: string;
  status: 'active' | 'inactive';
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Sample superbills removed - now using database
const _sampleSuperbills: Superbill[] = [];

const superbillTypes = [
  'Form Based',
  'Template Based',
  'Custom'
];

export const Superbills: React.FC = () => {
  const { toast } = useToast();
  const [superbills, setSuperbills] = useState<Superbill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSuperbill, setEditingSuperbill] = useState<Superbill | null>(null);
  const [expandedSuperbill, setExpandedSuperbill] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  // Fetch superbills from database
  useEffect(() => {
    fetchSuperbillsFromDatabase();
  }, []);

  const fetchSuperbillsFromDatabase = async () => {
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      console.log('🔍 Fetching superbills from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch superbills.');
        setSuperbills([]);
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('superbills' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching superbills:', error);
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('⚠️ Superbills table not found. Please run CREATE_SUPERBILLS_TABLE.sql');
          toast({
            title: 'Table Not Found',
            description: 'Superbills table does not exist. Please run the SQL setup script.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading superbills',
            description: error.message,
            variant: 'destructive',
          });
        }
        setSuperbills([]);
        return;
      }

      // Transform database records to match Superbill interface
      const transformedSuperbills: Superbill[] = (data || []).map((dbSuperbill: any) => ({
        id: dbSuperbill.id,
        name: dbSuperbill.name || '',
        type: (dbSuperbill.type || 'form-based') as 'form-based' | 'template-based' | 'custom',
        filePath: dbSuperbill.file_path || '',
        fileName: dbSuperbill.file_name || 'No File Selected',
        status: (dbSuperbill.status || (dbSuperbill.is_active ? 'active' : 'inactive')) as 'active' | 'inactive',
        description: dbSuperbill.description || '',
        createdAt: dbSuperbill.created_at || '',
        updatedAt: dbSuperbill.updated_at || dbSuperbill.created_at || ''
      }));

      console.log(`✅ Successfully loaded ${transformedSuperbills.length} superbills from database`);
      setSuperbills(transformedSuperbills);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchSuperbillsFromDatabase:', error);
      toast({
        title: 'Error loading superbills',
        description: error.message || 'Failed to load superbills from database',
        variant: 'destructive',
      });
      setSuperbills([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };
  const [newSuperbill, setNewSuperbill] = useState<Partial<Superbill>>({
    name: '',
    type: 'form-based',
    filePath: '',
    fileName: 'No File Selected',
    status: 'active',
    description: ''
  });

  const filteredSuperbills = superbills.filter(superbill => {
    const matchesSearch = 
      superbill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      superbill.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || superbill.type === filterType;
    const matchesStatus = filterStatus === 'all' || superbill.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddSuperbill = async () => {
    if (!newSuperbill.name) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required field (Name).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating superbill:', newSuperbill);

      // Prepare data for database (snake_case) - consistent naming
      const insertData: any = {
        name: newSuperbill.name!.trim(),
        type: newSuperbill.type || 'form-based',
        file_path: newSuperbill.filePath || null,
        file_name: newSuperbill.fileName || 'No File Selected',
        description: newSuperbill.description || null,
        status: (newSuperbill.status || 'active') as 'active' | 'inactive',
        is_active: (newSuperbill.status || 'active') === 'active'
      };

      // Remove null values for optional fields
      Object.keys(insertData).forEach(key => {
        if (insertData[key] === null || insertData[key] === '') {
          delete insertData[key];
        }
      });

      const { data, error } = await supabase
        .from('superbills' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating superbill:', error);
        throw new Error(error.message || 'Failed to create superbill');
      }

      // Refresh the superbills list
      await fetchSuperbillsFromDatabase();

      // Reset form
      setNewSuperbill({
        name: '',
        type: 'form-based',
        filePath: '',
        fileName: 'No File Selected',
        status: 'active',
        description: ''
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Superbill Added",
        description: `${newSuperbill.name} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create superbill:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create superbill. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleEditSuperbill = (superbill: Superbill) => {
    setEditingSuperbill(superbill);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSuperbill = async () => {
    if (!editingSuperbill || !editingSuperbill.id) {
      toast({
        title: "Error",
        description: "Superbill ID is missing. Cannot update.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Updating superbill:', editingSuperbill);

      // Prepare data for database (snake_case) - consistent naming
      const updateData: any = {
        name: editingSuperbill.name.trim(),
        type: editingSuperbill.type || 'form-based',
        file_path: editingSuperbill.filePath || null,
        file_name: editingSuperbill.fileName || 'No File Selected',
        description: editingSuperbill.description || null,
        status: editingSuperbill.status as 'active' | 'inactive',
        is_active: editingSuperbill.status === 'active'
      };

      // Remove null values for optional fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const { error } = await supabase
        .from('superbills' as any)
        .update(updateData)
        .eq('id', editingSuperbill.id);

      if (error) {
        console.error('❌ Error updating superbill:', error);
        throw new Error(error.message || 'Failed to update superbill');
      }

      // Refresh the superbills list
      await fetchSuperbillsFromDatabase();

      setIsEditDialogOpen(false);
      setEditingSuperbill(null);

      toast({
        title: "Superbill Updated",
        description: `${editingSuperbill.name} has been successfully updated.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to update superbill:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update superbill. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleDeleteSuperbill = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this superbill? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting superbill:', id);

      const { error } = await supabase
        .from('superbills' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting superbill:', error);
        throw new Error(error.message || 'Failed to delete superbill');
      }

      // Refresh the superbills list
      await fetchSuperbillsFromDatabase();

      toast({
        title: "Superbill Deleted",
        description: "Superbill has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('💥 Failed to delete superbill:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete superbill. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.xml') && !file.name.endsWith('.docx')) {
      alert('Please upload a Word 2003 XML Document or Word document. Excel files and PDFs are not supported.');
      return;
    }

    if (isEdit && editingSuperbill) {
      setEditingSuperbill({
        ...editingSuperbill,
        fileName: file.name,
        filePath: URL.createObjectURL(file)
      });
    } else {
      setNewSuperbill({
        ...newSuperbill,
        fileName: file.name,
        filePath: URL.createObjectURL(file)
      });
    }
  };

  const handleExportSuperbills = () => {
    const csvContent = [
      ['Name', 'Type', 'Status', 'Description'].join(','),
      ...superbills.map(superbill => [
        superbill.name,
        superbill.type,
        superbill.status,
        superbill.description
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'superbills.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSuperbills = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      console.log('Importing superbills from CSV:', text);
      alert('CSV import functionality would be implemented here');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Superbills</h1>
          <p className="text-muted-foreground">Manage superbill templates and configurations</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Superbill
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search-superbills"
                name="search-superbills"
                placeholder="Search superbills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                autoComplete="off"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="form-based">Form Based</SelectItem>
                <SelectItem value="template-based">Template Based</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
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
              <Button variant="outline" onClick={handleExportSuperbills}>
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
                    onChange={handleImportSuperbills}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Superbills List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading superbills...</p>
            </div>
          </div>
        ) : filteredSuperbills.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No superbills found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "Try adjusting your search criteria"
                : "Get started by creating your first superbill"}
            </p>
            {!searchTerm && filterType === "all" && filterStatus === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Superbill
              </Button>
            )}
          </div>
        ) : (
          filteredSuperbills.map((superbill) => (
          <Card key={superbill.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="text-lg">
                      {superbill.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {superbill.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{superbill.type}</Badge>
                    <Badge variant={superbill.status === 'active' ? 'default' : 'secondary'}>
                      {superbill.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedSuperbill(
                      expandedSuperbill === superbill.id ? null : superbill.id
                    )}
                  >
                    {expandedSuperbill === superbill.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSuperbill(superbill)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSuperbill(superbill.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedSuperbill === superbill.id && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Superbill Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {superbill.name}</p>
                      <p><strong>Type:</strong> {superbill.type}</p>
                      <p><strong>Status:</strong> {superbill.status}</p>
                      <p><strong>File:</strong> {superbill.fileName}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Description</h4>
                    <p className="text-sm text-muted-foreground">{superbill.description}</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
          ))
        )}
      </div>

      {/* Add Superbill Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Superbill</DialogTitle>
            <DialogDescription>
              Configure the superbill settings and upload a file below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Superbill Configuration</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newSuperbill.name || ''}
                    onChange={(e) => setNewSuperbill({ ...newSuperbill, name: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter superbill name"
                    className="border-red-500"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newSuperbill.type || 'form-based'} onValueChange={(value) => setNewSuperbill({ ...newSuperbill, type: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {superbillTypes.map(type => (
                        <SelectItem key={type} value={type.toLowerCase().replace(' ', '-')}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fileUpload">File Selection</Label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 p-3 border rounded-md bg-gray-50">
                      <span className="text-gray-500">{newSuperbill.fileName || 'No File Selected'}</span>
                    </div>
                    <Button variant="outline" asChild>
                      <label>
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Select a File
                        <input
                          type="file"
                          accept=".xml,.docx"
                          onChange={(e) => handleFileUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                    </Button>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p>Please note this feature only works with files that are saved as a Word 2003 XML Document.</p>
                    <p>CollaborateMD does not support uploading Excel files or PDFs.</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={newSuperbill.description || ''}
                    onChange={(e) => setNewSuperbill({ ...newSuperbill, description: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter description"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSuperbill}>
              Add Superbill
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Superbill Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Superbill</DialogTitle>
            <DialogDescription>
              Update the superbill settings and upload a new file if needed.
            </DialogDescription>
          </DialogHeader>
          {editingSuperbill && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Superbill Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editName">Name *</Label>
                    <Input
                      id="editName"
                      name="editName"
                      value={editingSuperbill.name}
                      onChange={(e) => setEditingSuperbill({ ...editingSuperbill, name: e.target.value })}
                      autoComplete="off"
                      className="border-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editType">Type</Label>
                    <Select value={editingSuperbill.type} onValueChange={(value) => setEditingSuperbill({ ...editingSuperbill, type: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {superbillTypes.map(type => (
                          <SelectItem key={type} value={type.toLowerCase().replace(' ', '-')}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editFileUpload">File Selection</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 p-3 border rounded-md bg-gray-50">
                        <span className="text-gray-500">{editingSuperbill.fileName}</span>
                      </div>
                      <Button variant="outline" asChild>
                        <label>
                          <UploadIcon className="w-4 h-4 mr-2" />
                          Select a File
                          <input
                            type="file"
                            accept=".xml,.docx"
                            onChange={(e) => handleFileUpload(e, true)}
                            className="hidden"
                          />
                        </label>
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <p>Please note this feature only works with files that are saved as a Word 2003 XML Document.</p>
                      <p>CollaborateMD does not support uploading Excel files or PDFs.</p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="editDescription">Description</Label>
                    <Input
                      id="editDescription"
                      name="editDescription"
                      value={editingSuperbill.description}
                      onChange={(e) => setEditingSuperbill({ ...editingSuperbill, description: e.target.value })}
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
            <Button onClick={handleUpdateSuperbill}>
              Update Superbill
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
