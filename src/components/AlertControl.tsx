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
import { Plus, Search, Edit, Trash2, Download, Upload, ChevronDown, ChevronRight, Bell, Calendar, User, Filter } from 'lucide-react';

interface Alert {
  id: string;
  alertType: string;
  patient: string;
  message: string;
  createUser: string;
  isGlobal: boolean;
  patientSection: boolean;
  claimSection: boolean;
  paymentSection: boolean;
  appointmentSection: boolean;
  createDateRange: string;
  createDateStart: string;
  createDateEnd: string;
  effectiveStartDateRange: string;
  effectiveStartDateStart: string;
  effectiveStartDateEnd: string;
  effectiveEndDateRange: string;
  effectiveEndDateStart: string;
  effectiveEndDateEnd: string;
  includeDeleted: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const sampleAlerts: Alert[] = [
  {
    id: '1',
    alertType: 'Patient',
    patient: 'John Smith',
    message: 'Payment overdue',
    createUser: 'Me',
    isGlobal: false,
    patientSection: true,
    claimSection: false,
    paymentSection: true,
    appointmentSection: false,
    createDateRange: 'All',
    createDateStart: '',
    createDateEnd: '',
    effectiveStartDateRange: 'All',
    effectiveStartDateStart: '',
    effectiveStartDateEnd: '',
    effectiveEndDateRange: 'All',
    effectiveEndDateStart: '',
    effectiveEndDateEnd: '',
    includeDeleted: false,
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  }
];

const alertTypes = [
  'Patient',
  'Claim',
  'Payment',
  'Appointment',
  'System',
  'Billing',
  'Authorization',
  'Other'
];

const dateRangeOptions = [
  'All',
  'Today',
  'Yesterday',
  'This Week',
  'Last Week',
  'This Month',
  'Last Month',
  'Custom Range'
];

const users = [
  'Me',
  'Admin',
  'Billing Manager',
  'Provider',
  'All Users'
];

export const AlertControl: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(sampleAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({
    alertType: 'Patient',
    patient: '',
    message: '',
    createUser: 'Me',
    isGlobal: false,
    patientSection: false,
    claimSection: false,
    paymentSection: false,
    appointmentSection: false,
    createDateRange: 'All',
    createDateStart: '',
    createDateEnd: '',
    effectiveStartDateRange: 'All',
    effectiveStartDateStart: '',
    effectiveStartDateEnd: '',
    effectiveEndDateRange: 'All',
    effectiveEndDateStart: '',
    effectiveEndDateEnd: '',
    includeDeleted: false,
    status: 'active'
  });

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alertType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddAlert = () => {
    if (!newAlert.patient || !newAlert.message) {
      window.alert('Please fill in required fields');
      return;
    }

    const alertItem: Alert = {
      id: Date.now().toString(),
      alertType: newAlert.alertType || 'Patient',
      patient: newAlert.patient!,
      message: newAlert.message!,
      createUser: newAlert.createUser || 'Me',
      isGlobal: newAlert.isGlobal || false,
      patientSection: newAlert.patientSection || false,
      claimSection: newAlert.claimSection || false,
      paymentSection: newAlert.paymentSection || false,
      appointmentSection: newAlert.appointmentSection || false,
      createDateRange: newAlert.createDateRange || 'All',
      createDateStart: newAlert.createDateStart || '',
      createDateEnd: newAlert.createDateEnd || '',
      effectiveStartDateRange: newAlert.effectiveStartDateRange || 'All',
      effectiveStartDateStart: newAlert.effectiveStartDateStart || '',
      effectiveStartDateEnd: newAlert.effectiveStartDateEnd || '',
      effectiveEndDateRange: newAlert.effectiveEndDateRange || 'All',
      effectiveEndDateStart: newAlert.effectiveEndDateStart || '',
      effectiveEndDateEnd: newAlert.effectiveEndDateEnd || '',
      includeDeleted: newAlert.includeDeleted || false,
      status: newAlert.status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setAlerts([...alerts, alertItem]);
    setNewAlert({
      alertType: 'Patient',
      patient: '',
      message: '',
      createUser: 'Me',
      isGlobal: false,
      patientSection: false,
      claimSection: false,
      paymentSection: false,
      appointmentSection: false,
      createDateRange: 'All',
      createDateStart: '',
      createDateEnd: '',
      effectiveStartDateRange: 'All',
      effectiveStartDateStart: '',
      effectiveStartDateEnd: '',
      effectiveEndDateRange: 'All',
      effectiveEndDateStart: '',
      effectiveEndDateEnd: '',
      includeDeleted: false,
      status: 'active'
    });
    setIsAddDialogOpen(false);
  };

  const handleEditAlert = (alert: Alert) => {
    setEditingAlert(alert);
    setIsEditDialogOpen(true);
  };

  const handleUpdateAlert = () => {
    if (!editingAlert) return;

    setAlerts(alerts.map(a => 
      a.id === editingAlert.id 
        ? { ...editingAlert, updatedAt: new Date().toISOString().split('T')[0] }
        : a
    ));
    setIsEditDialogOpen(false);
    setEditingAlert(null);
  };

  const handleDeleteAlert = (id: string) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      setAlerts(alerts.filter(a => a.id !== id));
    }
  };

  const handleExportAlerts = () => {
    const csvContent = [
      ['Alert Type', 'Patient', 'Message', 'Create User', 'Status'].join(','),
      ...alerts.map(alert => [
        alert.alertType,
        alert.patient,
        alert.message,
        alert.createUser,
        alert.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alerts.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportAlerts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      console.log('Importing alerts from CSV:', text);
      alert('CSV import functionality would be implemented here');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Alert Control</h1>
          <p className="text-muted-foreground">Configure and manage system alerts</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Alert
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search-alerts"
                name="search-alerts"
                placeholder="Search alerts..."
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
              <Button variant="outline" onClick={handleExportAlerts}>
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
                    onChange={handleImportAlerts}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="text-lg">
                      {alert.alertType} Alert
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {alert.patient} • {alert.message}
                    </p>
                  </div>
                  <Badge variant={alert.status === 'active' ? 'default' : 'secondary'}>
                    {alert.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedAlert(
                      expandedAlert === alert.id ? null : alert.id
                    )}
                  >
                    {expandedAlert === alert.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAlert(alert)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAlert(alert.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedAlert === alert.id && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Alert Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Type:</strong> {alert.alertType}</p>
                      <p><strong>Patient:</strong> {alert.patient}</p>
                      <p><strong>Message:</strong> {alert.message}</p>
                      <p><strong>Create User:</strong> {alert.createUser}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Display Settings</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Global:</strong> {alert.isGlobal ? 'Yes' : 'No'}</p>
                      <p><strong>Patient Section:</strong> {alert.patientSection ? 'Yes' : 'No'}</p>
                      <p><strong>Claim Section:</strong> {alert.claimSection ? 'Yes' : 'No'}</p>
                      <p><strong>Payment Section:</strong> {alert.paymentSection ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
