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
import { Plus, Search, Edit, Trash2, Download, Upload, ChevronDown, ChevronRight, Tag, Minus, ChevronUp, ChevronDown as ChevronDownIcon, X } from 'lucide-react';

interface LabelColumn {
  id: string;
  name: string;
  fields: string[];
}

interface LabelTemplate {
  id: string;
  name: string;
  labelType: string;
  printerType: string;
  labelSize: string;
  font: string;
  fontSize: string;
  bold: boolean;
  italics: boolean;
  columnSpacing: number;
  columns: LabelColumn[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const sampleLabels: LabelTemplate[] = [
  {
    id: '1',
    name: 'Patient Address Label',
    labelType: 'Address',
    printerType: 'Dymo Single Label Printer',
    labelSize: 'Single Label - 1 1/8 x 3 1/2',
    font: 'Courier New',
    fontSize: '8',
    bold: false,
    italics: false,
    columnSpacing: 15,
    columns: [
      {
        id: 'col1',
        name: 'Column 1',
        fields: ['Patient Name', 'Address Line 1', 'Address Line 2', 'City', 'State', 'ZIP']
      }
    ],
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Insurance Card Label',
    labelType: 'Insurance',
    printerType: 'Dymo Single Label Printer',
    labelSize: 'Single Label - 1 1/8 x 3 1/2',
    font: 'Arial',
    fontSize: '10',
    bold: true,
    italics: false,
    columnSpacing: 20,
    columns: [
      {
        id: 'col1',
        name: 'Column 1',
        fields: ['Insurance Name', 'Policy Number', 'Group Number']
      },
      {
        id: 'col2',
        name: 'Column 2',
        fields: ['Provider Name', 'Effective Date']
      }
    ],
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '3',
    name: 'Appointment Reminder Label',
    labelType: 'Appointment',
    printerType: 'Zebra Label Printer',
    labelSize: 'Single Label - 2 x 4',
    font: 'Times New Roman',
    fontSize: '12',
    bold: false,
    italics: true,
    columnSpacing: 25,
    columns: [
      {
        id: 'col1',
        name: 'Column 1',
        fields: ['Patient Name', 'Appointment Date', 'Appointment Time', 'Provider Name']
      }
    ],
    status: 'inactive',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  }
];

const labelTypes = [
  'Address',
  'Insurance',
  'Appointment',
  'Billing',
  'Medical',
  'Custom'
];

const printerTypes = [
  'Dymo Single Label Printer',
  'Zebra Label Printer',
  'Brother Label Printer',
  'Canon Label Printer',
  'HP Label Printer'
];

const labelSizes = [
  'Single Label - 1 1/8 x 3 1/2',
  'Single Label - 2 x 4',
  'Single Label - 4 x 6',
  'Roll Label - 1 x 2',
  'Roll Label - 2 x 3'
];

const fonts = [
  'Courier New',
  'Arial',
  'Times New Roman',
  'Calibri',
  'Helvetica',
  'Verdana'
];

const fontSizes = ['6', '8', '10', '12', '14', '16', '18', '20'];

const availableFields = [
  'Patient Name',
  'Patient ID',
  'Address Line 1',
  'Address Line 2',
  'City',
  'State',
  'ZIP',
  'Phone',
  'Email',
  'Date of Birth',
  'Insurance Name',
  'Policy Number',
  'Group Number',
  'Appointment Date',
  'Appointment Time',
  'Provider Name',
  'Practice Name',
  'Custom Field 1',
  'Custom Field 2'
];

export const Labels: React.FC = () => {
  const [labels, setLabels] = useState<LabelTemplate[]>(sampleLabels);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<LabelTemplate | null>(null);
  const [expandedLabel, setExpandedLabel] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState<Partial<LabelTemplate>>({
    name: '',
    labelType: 'Address',
    printerType: 'Dymo Single Label Printer',
    labelSize: 'Single Label - 1 1/8 x 3 1/2',
    font: 'Courier New',
    fontSize: '8',
    bold: false,
    italics: false,
    columnSpacing: 15,
    columns: [
      {
        id: 'col1',
        name: 'Column 1',
        fields: []
      }
    ],
    status: 'active'
  });

  const filteredLabels = labels.filter(label => {
    const matchesSearch = 
      label.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      label.labelType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || label.labelType === filterType;
    const matchesStatus = filterStatus === 'all' || label.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddLabel = () => {
    if (!newLabel.name) {
      alert('Please fill in required fields');
      return;
    }

    const label: LabelTemplate = {
      id: Date.now().toString(),
      name: newLabel.name!,
      labelType: newLabel.labelType || 'Address',
      printerType: newLabel.printerType || 'Dymo Single Label Printer',
      labelSize: newLabel.labelSize || 'Single Label - 1 1/8 x 3 1/2',
      font: newLabel.font || 'Courier New',
      fontSize: newLabel.fontSize || '8',
      bold: newLabel.bold || false,
      italics: newLabel.italics || false,
      columnSpacing: newLabel.columnSpacing || 15,
      columns: newLabel.columns || [
        {
          id: 'col1',
          name: 'Column 1',
          fields: []
        }
      ],
      status: newLabel.status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setLabels([...labels, label]);
    setNewLabel({
      name: '',
      labelType: 'Address',
      printerType: 'Dymo Single Label Printer',
      labelSize: 'Single Label - 1 1/8 x 3 1/2',
      font: 'Courier New',
      fontSize: '8',
      bold: false,
      italics: false,
      columnSpacing: 15,
      columns: [
        {
          id: 'col1',
          name: 'Column 1',
          fields: []
        }
      ],
      status: 'active'
    });
    setIsAddDialogOpen(false);
  };

  const handleEditLabel = (label: LabelTemplate) => {
    setEditingLabel(label);
    setIsEditDialogOpen(true);
  };

  const handleUpdateLabel = () => {
    if (!editingLabel) return;

    setLabels(labels.map(l => 
      l.id === editingLabel.id 
        ? { ...editingLabel, updatedAt: new Date().toISOString().split('T')[0] }
        : l
    ));
    setIsEditDialogOpen(false);
    setEditingLabel(null);
  };

  const handleDeleteLabel = (id: string) => {
    if (confirm('Are you sure you want to delete this label?')) {
      setLabels(labels.filter(l => l.id !== id));
    }
  };

  const handleAddField = (field: string, columnId: string, isEdit: boolean = false) => {
    if (isEdit && editingLabel) {
      const updatedColumns = editingLabel.columns.map(col => {
        if (col.id === columnId && !col.fields.includes(field)) {
          return { ...col, fields: [...col.fields, field] };
        }
        return col;
      });
      setEditingLabel({
        ...editingLabel,
        columns: updatedColumns
      });
    } else {
      const updatedColumns = (newLabel.columns || []).map(col => {
        if (col.id === columnId && !col.fields.includes(field)) {
          return { ...col, fields: [...col.fields, field] };
        }
        return col;
      });
      setNewLabel({
        ...newLabel,
        columns: updatedColumns
      });
    }
  };

  const handleRemoveField = (field: string, columnId: string, isEdit: boolean = false) => {
    if (isEdit && editingLabel) {
      const updatedColumns = editingLabel.columns.map(col => {
        if (col.id === columnId) {
          return { ...col, fields: col.fields.filter(f => f !== field) };
        }
        return col;
      });
      setEditingLabel({
        ...editingLabel,
        columns: updatedColumns
      });
    } else {
      const updatedColumns = (newLabel.columns || []).map(col => {
        if (col.id === columnId) {
          return { ...col, fields: col.fields.filter(f => f !== field) };
        }
        return col;
      });
      setNewLabel({
        ...newLabel,
        columns: updatedColumns
      });
    }
  };

  const handleAddColumn = (isEdit: boolean = false) => {
    const columnNumber = isEdit 
      ? (editingLabel?.columns?.length || 0) + 1
      : (newLabel.columns?.length || 0) + 1;
    
    const newColumn: LabelColumn = {
      id: `col${columnNumber}`,
      name: `Column ${columnNumber}`,
      fields: []
    };

    if (isEdit && editingLabel) {
      setEditingLabel({
        ...editingLabel,
        columns: [...(editingLabel.columns || []), newColumn]
      });
    } else {
      setNewLabel({
        ...newLabel,
        columns: [...(newLabel.columns || []), newColumn]
      });
    }
  };

  const handleRemoveColumn = (columnId: string, isEdit: boolean = false) => {
    if (isEdit && editingLabel) {
      setEditingLabel({
        ...editingLabel,
        columns: editingLabel.columns.filter(col => col.id !== columnId)
      });
    } else {
      setNewLabel({
        ...newLabel,
        columns: (newLabel.columns || []).filter(col => col.id !== columnId)
      });
    }
  };

  const handleExportLabels = () => {
    const csvContent = [
      ['Name', 'Label Type', 'Printer Type', 'Status'].join(','),
      ...labels.map(label => [
        label.name,
        label.labelType,
        label.printerType,
        label.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'labels.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportLabels = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      console.log('Importing labels from CSV:', text);
      alert('CSV import functionality would be implemented here');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Labels</h1>
          <p className="text-muted-foreground">Manage label templates and printer configurations</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Label
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search-labels"
                name="search-labels"
                placeholder="Search labels..."
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
                {labelTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
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
              <Button variant="outline" onClick={handleExportLabels}>
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
                    onChange={handleImportLabels}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Labels List */}
      <div className="space-y-4">
        {filteredLabels.map((label) => (
          <Card key={label.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="text-lg">
                      {label.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {label.labelType} • {label.printerType}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{label.labelType}</Badge>
                    <Badge variant={label.status === 'active' ? 'default' : 'secondary'}>
                      {label.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedLabel(
                      expandedLabel === label.id ? null : label.id
                    )}
                  >
                    {expandedLabel === label.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditLabel(label)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLabel(label.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedLabel === label.id && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Label Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Type:</strong> {label.labelType}</p>
                      <p><strong>Printer:</strong> {label.printerType}</p>
                      <p><strong>Size:</strong> {label.labelSize}</p>
                      <p><strong>Font:</strong> {label.font} {label.fontSize}pt</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Fields</h4>
                    <div className="space-y-2">
                      {label.columns.map((column, index) => (
                        <div key={index}>
                          <p className="text-sm font-medium text-gray-600">{column.name}:</p>
                          <div className="flex flex-wrap gap-2 ml-4">
                            {column.fields.map((field, fieldIndex) => (
                              <Badge key={fieldIndex} variant="outline">{field}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Add Label Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Label</DialogTitle>
            <DialogDescription>
              Configure the label settings and field configuration below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* General Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newLabel.name || ''}
                    onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter label name"
                    className="border-red-500"
                  />
                </div>
                <div>
                  <Label htmlFor="labelType">Label Type</Label>
                  <Select value={newLabel.labelType || 'Address'} onValueChange={(value) => setNewLabel({ ...newLabel, labelType: value })}>
                    <SelectTrigger className="border-red-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {labelTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Field Configuration */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Field Configuration</h3>
              <div className="space-y-4">
                {newLabel.columns?.map((column, columnIndex) => (
                  <div key={column.id}>
                    <div className="flex items-center justify-between mb-2">
                      <Label>{column.name}</Label>
                      {newLabel.columns && newLabel.columns.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveColumn(column.id)}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <div className="border rounded-md p-4 min-h-[200px] bg-gray-50">
                      <div className="space-y-2">
                        {column.fields.map((field, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <span className="text-sm">{field}</span>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveField(field, column.id)}
                              >
                                <Minus className="w-4 h-4 text-pink-500" />
                              </Button>
                              <div className="flex flex-col">
                                <Button variant="ghost" size="sm">
                                  <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <ChevronDownIcon className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <Button variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Add Field(s)
                  </Button>
                  <Button variant="outline" onClick={() => handleAddColumn()}>
                    <Plus className="w-4 h-4 mr-2" />
                    + Add Column
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Printer Configuration */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Printer Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="printerType">Printer Type</Label>
                  <Select value={newLabel.printerType || 'Dymo Single Label Printer'} onValueChange={(value) => setNewLabel({ ...newLabel, printerType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {printerTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="labelSize">Label Size</Label>
                  <Select value={newLabel.labelSize || 'Single Label - 1 1/8 x 3 1/2'} onValueChange={(value) => setNewLabel({ ...newLabel, labelSize: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {labelSizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="font">Font</Label>
                  <Select value={newLabel.font || 'Courier New'} onValueChange={(value) => setNewLabel({ ...newLabel, font: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map(font => (
                        <SelectItem key={font} value={font}>{font}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select value={newLabel.fontSize || '8'} onValueChange={(value) => setNewLabel({ ...newLabel, fontSize: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontSizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bold"
                      checked={newLabel.bold || false}
                      onCheckedChange={(checked) => setNewLabel({ ...newLabel, bold: !!checked })}
                    />
                    <Label htmlFor="bold">Bold</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="italics"
                      checked={newLabel.italics || false}
                      onCheckedChange={(checked) => setNewLabel({ ...newLabel, italics: !!checked })}
                    />
                    <Label htmlFor="italics">Italics</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="columnSpacing">Column Spacing</Label>
                  <Input
                    id="columnSpacing"
                    name="columnSpacing"
                    type="number"
                    value={newLabel.columnSpacing || 15}
                    onChange={(e) => setNewLabel({ ...newLabel, columnSpacing: parseInt(e.target.value) || 15 })}
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
            <Button onClick={handleAddLabel}>
              Add Label
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Label Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Label</DialogTitle>
            <DialogDescription>
              Update the label settings and field configuration below.
            </DialogDescription>
          </DialogHeader>
          {editingLabel && (
            <div className="space-y-6">
              {/* Similar form structure as Add Label but with editingLabel data */}
              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editName">Name *</Label>
                    <Input
                      id="editName"
                      name="editName"
                      value={editingLabel.name}
                      onChange={(e) => setEditingLabel({ ...editingLabel, name: e.target.value })}
                      autoComplete="off"
                      className="border-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLabelType">Label Type</Label>
                    <Select value={editingLabel.labelType} onValueChange={(value) => setEditingLabel({ ...editingLabel, labelType: value })}>
                      <SelectTrigger className="border-red-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {labelTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Field Configuration</h3>
                <div className="space-y-4">
                  {editingLabel.columns.map((column, columnIndex) => (
                    <div key={column.id}>
                      <div className="flex items-center justify-between mb-2">
                        <Label>{column.name}</Label>
                        {editingLabel.columns.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveColumn(column.id, true)}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      <div className="border rounded-md p-4 min-h-[200px] bg-gray-50">
                        <div className="space-y-2">
                          {column.fields.map((field, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                              <span className="text-sm">{field}</span>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveField(field, column.id, true)}
                                >
                                  <Minus className="w-4 h-4 text-pink-500" />
                                </Button>
                                <div className="flex flex-col">
                                  <Button variant="ghost" size="sm">
                                    <ChevronUp className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <ChevronDownIcon className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center">
                    <Button variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Add Field(s)
                    </Button>
                    <Button variant="outline" onClick={() => handleAddColumn(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      + Add Column
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Printer Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editPrinterType">Printer Type</Label>
                    <Select value={editingLabel.printerType} onValueChange={(value) => setEditingLabel({ ...editingLabel, printerType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {printerTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editLabelSize">Label Size</Label>
                    <Select value={editingLabel.labelSize} onValueChange={(value) => setEditingLabel({ ...editingLabel, labelSize: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {labelSizes.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editFont">Font</Label>
                    <Select value={editingLabel.font} onValueChange={(value) => setEditingLabel({ ...editingLabel, font: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map(font => (
                          <SelectItem key={font} value={font}>{font}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editFontSize">Font Size</Label>
                    <Select value={editingLabel.fontSize} onValueChange={(value) => setEditingLabel({ ...editingLabel, fontSize: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontSizes.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="editBold"
                        checked={editingLabel.bold}
                        onCheckedChange={(checked) => setEditingLabel({ ...editingLabel, bold: !!checked })}
                      />
                      <Label htmlFor="editBold">Bold</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="editItalics"
                        checked={editingLabel.italics}
                        onCheckedChange={(checked) => setEditingLabel({ ...editingLabel, italics: !!checked })}
                      />
                      <Label htmlFor="editItalics">Italics</Label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="editColumnSpacing">Column Spacing</Label>
                    <Input
                      id="editColumnSpacing"
                      name="editColumnSpacing"
                      type="number"
                      value={editingLabel.columnSpacing}
                      onChange={(e) => setEditingLabel({ ...editingLabel, columnSpacing: parseInt(e.target.value) || 15 })}
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
            <Button onClick={handleUpdateLabel}>
              Update Label
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
