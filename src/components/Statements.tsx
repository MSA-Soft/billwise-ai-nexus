import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
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
import { Plus, Search, Edit, Trash2, Download, Upload, ChevronDown, ChevronRight, FileText, Settings, CheckCircle, XCircle, Mail, Printer, FileDown } from 'lucide-react';

interface StatementTemplate {
  id: string;
  name: string;
  type: 'automatic' | 'user-print' | 'estimate';
  format: 'enhanced' | 'plain-text' | 'electronic';
  status: 'enabled' | 'disabled';
  description: string;
  templateContent: string;
  createdAt: string;
  updatedAt: string;
}

const statementTypes = [
  'Automatic Statement Generation',
  'User Print Statements',
  'Estimate Statements'
];

const formatTypes = [
  'Enhanced User Print Format',
  'Plain Text User Print Format',
  'Electronic Statement Format'
];

export const Statements: React.FC = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<StatementTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Fetch templates from database
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const { data, error } = await supabase
          .from('statement_templates' as any)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching statement templates:', error);
          // If table doesn't exist, use empty array
          setTemplates([]);
          return;
        }

        const transformedTemplates = (data || []).map((t: any) => ({
          id: t.id,
          name: t.name || '',
          type: t.type || 'user-print',
          format: t.format || 'plain-text',
          status: t.status || 'enabled',
          description: t.description || '',
          templateContent: t.template_content || t.templateContent || '',
          createdAt: t.created_at || new Date().toISOString().split('T')[0],
          updatedAt: t.updated_at || t.created_at || new Date().toISOString().split('T')[0]
        }));

        setTemplates(transformedTemplates);
      } catch (error: any) {
        console.error('Error fetching statement templates:', error);
        setTemplates([]);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<StatementTemplate | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<StatementTemplate>>({
    name: '',
    type: 'user-print',
    format: 'plain-text',
    status: 'enabled',
    description: '',
    templateContent: ''
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesStatus = filterStatus === 'all' || template.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleEditTemplate = (template: StatementTemplate) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const { error } = await supabase
        .from('statement_templates' as any)
        .update({
          name: editingTemplate.name,
          type: editingTemplate.type,
          format: editingTemplate.format,
          status: editingTemplate.status,
          description: editingTemplate.description,
          template_content: editingTemplate.templateContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTemplate.id);

      if (error) throw error;

      setTemplates(templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...editingTemplate, updatedAt: new Date().toISOString().split('T')[0] }
          : t
      ));
      setIsEditDialogOpen(false);
      setEditingTemplate(null);
      toast({
        title: 'Template updated',
        description: 'Statement template has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating template:', error);
      toast({
        title: 'Error updating template',
        description: error.message || 'Failed to update template',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('statement_templates' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== id));
      toast({
        title: 'Template deleted',
        description: 'Statement template has been deleted successfully.',
      });
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error deleting template',
        description: error.message || 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const handleExportTemplates = () => {
    const csvContent = [
      ['Name', 'Type', 'Format', 'Status', 'Description'].join(','),
      ...templates.map(template => [
        template.name,
        template.type,
        template.format,
        template.status,
        template.description
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'statement-templates.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = [
      'Name,Type,Format,Status,Description',
      'Standard Statement,automatic,enhanced,enabled,Standard automatic statement generation',
      'Manual Print Statement,user-print,enhanced,enabled,User print statement template'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'statement-templates-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTemplates = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        const importedTemplates: Partial<StatementTemplate>[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const templateData: Partial<StatementTemplate> = {
              name: values[headers.indexOf('name')] || '',
              type: (values[headers.indexOf('type')] as 'automatic' | 'user-print' | 'estimate') || 'automatic',
              format: (values[headers.indexOf('format')] as 'enhanced' | 'plain-text' | 'electronic') || 'enhanced',
              status: (values[headers.indexOf('status')] as 'enabled' | 'disabled') || 'enabled',
              description: values[headers.indexOf('description')] || '',
            };

            if (templateData.name) {
              importedTemplates.push(templateData);
            }
          }
        }

        // Insert templates into database or state
        let successCount = 0;
        let errorCount = 0;

        for (const templateData of importedTemplates) {
          try {
            const newTemplate: StatementTemplate = {
              id: Date.now().toString() + Math.random(),
              name: templateData.name!,
              type: templateData.type || 'automatic',
              format: templateData.format || 'enhanced',
              status: templateData.status || 'enabled',
              description: templateData.description || '',
              templateContent: templateData.templateContent || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            setTemplates(prev => [...prev, newTemplate]);
            successCount++;
          } catch (error) {
            console.error('Error importing template:', error);
            errorCount++;
          }
        }

        toast({
          title: "Import Complete",
          description: `${successCount} statement templates imported successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}.`,
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
          <h1 className="text-3xl font-bold">Statements</h1>
          <p className="text-muted-foreground">Manage statement templates and generation settings</p>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search-templates"
                name="search-templates"
                placeholder="Search templates..."
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
                <SelectItem value="user-print">User Print</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="estimate">Estimate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportTemplates}>
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
                    onChange={handleImportTemplates}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statement Sections */}
      <div className="space-y-6">
        {/* Automatic Statement Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 bg-blue-600 text-white p-2 rounded">
              <Settings className="w-5 h-5" />
              Automatic Statement Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Statement Automation is not enabled for your account. Please contact an Authorized Representative on your account about enabling this feature.
            </p>
          </CardContent>
        </Card>

        {/* User Print Statements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 bg-blue-600 text-white p-2 rounded">
              <Printer className="w-5 h-5" />
              User Print Statements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start">
              <Button variant="outline" onClick={() => handleEditTemplate(templates[0])}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Templates
              </Button>
              <div className="space-y-4">
                {/* Enhanced User Print Format */}
                <div className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Enhanced User Print Format</p>
                    <p className="text-sm text-muted-foreground italic">
                      Enhanced User Print Statements are not enabled for your account. Please contact an Admin or Authorized Representative on your account about enabling this feature.
                    </p>
                  </div>
                </div>

                {/* Plain Text User Print Format */}
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Plain Text User Print Format</p>
                    <p className="text-sm text-muted-foreground">
                      Standard plain text format for user print statements
                    </p>
                  </div>
                </div>

                {/* Electronic Statement Format */}
                <div className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Electronic Statement Format</p>
                    <p className="text-sm text-muted-foreground italic">
                      Manual Electronic Statements are not enabled for your account. Please contact an Admin or Authorized Representative on your account about enabling this feature.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estimate Statements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 bg-blue-600 text-white p-2 rounded">
              <FileText className="w-5 h-5" />
              Estimate Statements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start">
              <Button variant="outline" onClick={() => handleEditTemplate(templates[0])}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Templates
              </Button>
              <div className="space-y-4">
                {/* Enhanced User Print Format */}
                <div className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Enhanced User Print Format</p>
                    <p className="text-sm text-muted-foreground italic">
                      Enhanced User Print Statements are not enabled for your account. Please contact an Admin or Authorized Representative on your account about enabling this feature.
                    </p>
                  </div>
                </div>

                {/* Plain Text User Print Format */}
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Plain Text User Print Format</p>
                    <p className="text-sm text-muted-foreground">
                      Standard plain text format for estimate statements
                    </p>
                  </div>
                </div>

                {/* Electronic Statement Format */}
                <div className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Electronic Statement Format</p>
                    <p className="text-sm text-muted-foreground italic">
                      Manual Electronic Statements are not enabled for your account. Please contact an Admin or Authorized Representative on your account about enabling this feature.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Statement Templates</h2>
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="text-lg">
                      {template.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {template.status === 'enabled' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <Badge variant={template.status === 'enabled' ? 'default' : 'secondary'}>
                      {template.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedTemplate(
                      expandedTemplate === template.id ? null : template.id
                    )}
                  >
                    {expandedTemplate === template.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedTemplate === template.id && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Template Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Type:</strong> {template.type}</p>
                      <p><strong>Format:</strong> {template.format}</p>
                      <p><strong>Status:</strong> {template.status}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Template Content</h4>
                    <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                      {template.templateContent || 'No template content available'}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Statement Template</DialogTitle>
            <DialogDescription>
              Configure the statement template settings and content below.
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Template Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      name="templateName"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="templateType">Type</Label>
                    <Select value={editingTemplate.type} onValueChange={(value) => setEditingTemplate({ ...editingTemplate, type: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user-print">User Print</SelectItem>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="estimate">Estimate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="templateFormat">Format</Label>
                    <Select value={editingTemplate.format} onValueChange={(value) => setEditingTemplate({ ...editingTemplate, format: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enhanced">Enhanced</SelectItem>
                        <SelectItem value="plain-text">Plain Text</SelectItem>
                        <SelectItem value="electronic">Electronic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="templateStatus">Status</Label>
                    <Select value={editingTemplate.status} onValueChange={(value) => setEditingTemplate({ ...editingTemplate, status: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="templateDescription">Description</Label>
                    <Input
                      id="templateDescription"
                      name="templateDescription"
                      value={editingTemplate.description}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Template Content */}
              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Template Content</h3>
                <div>
                  <Label htmlFor="templateContent">Statement Template</Label>
                  <textarea
                    id="templateContent"
                    name="templateContent"
                    value={editingTemplate.templateContent}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, templateContent: e.target.value })}
                    className="w-full h-64 p-3 border rounded-md font-mono text-sm"
                    placeholder="Enter your statement template here. Use variables like patient_name, balance_amount, statement_date, etc."
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Available variables: patient_name, balance_amount, statement_date, practice_name, contact_info
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTemplate}>
              Update Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
