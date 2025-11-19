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
import { Plus, Search, Edit, Trash2, Download, Upload, ChevronDown, ChevronRight, Bell, Calendar, User, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

// Sample alerts removed - now using database
const _sampleAlerts: Alert[] = [];

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
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  // Fetch alerts from database
  useEffect(() => {
    fetchAlertsFromDatabase();
  }, []);

  const fetchAlertsFromDatabase = async () => {
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      console.log('🔍 Fetching alerts from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch alerts.');
        setAlerts([]);
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('alert_controls' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching alerts:', error);
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('⚠️ Alert controls table not found. Please run CREATE_ALERT_CONTROLS_TABLE.sql');
          toast({
            title: 'Table Not Found',
            description: 'Alert controls table does not exist. Please run the SQL setup script.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading alerts',
            description: error.message,
            variant: 'destructive',
          });
        }
        setAlerts([]);
        return;
      }

      // Transform database records to match Alert interface
      const transformedAlerts: Alert[] = (data || []).map((dbAlert: any) => ({
        id: dbAlert.id,
        alertType: dbAlert.alert_type || '',
        patient: dbAlert.patient || '',
        message: dbAlert.message || '',
        createUser: dbAlert.create_user || '',
        isGlobal: dbAlert.is_global || false,
        patientSection: dbAlert.patient_section || false,
        claimSection: dbAlert.claim_section || false,
        paymentSection: dbAlert.payment_section || false,
        appointmentSection: dbAlert.appointment_section || false,
        createDateRange: dbAlert.create_date_range || 'All',
        createDateStart: dbAlert.create_date_start || '',
        createDateEnd: dbAlert.create_date_end || '',
        effectiveStartDateRange: dbAlert.effective_start_date_range || 'All',
        effectiveStartDateStart: dbAlert.effective_start_date_start || '',
        effectiveStartDateEnd: dbAlert.effective_start_date_end || '',
        effectiveEndDateRange: dbAlert.effective_end_date_range || 'All',
        effectiveEndDateStart: dbAlert.effective_end_date_start || '',
        effectiveEndDateEnd: dbAlert.effective_end_date_end || '',
        includeDeleted: dbAlert.include_deleted || false,
        status: (dbAlert.status || (dbAlert.is_active ? 'active' : 'inactive')) as 'active' | 'inactive',
        createdAt: dbAlert.created_at || '',
        updatedAt: dbAlert.updated_at || dbAlert.created_at || ''
      }));

      console.log(`✅ Successfully loaded ${transformedAlerts.length} alerts from database`);
      setAlerts(transformedAlerts);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchAlertsFromDatabase:', error);
      toast({
        title: 'Error loading alerts',
        description: error.message || 'Failed to load alerts from database',
        variant: 'destructive',
      });
      setAlerts([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };
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

  const handleAddAlert = async () => {
    if (!newAlert.patient || !newAlert.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields (Patient and Message).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating alert:', newAlert);

      // Prepare data for database (snake_case) - consistent naming
      const insertData: any = {
        alert_type: newAlert.alertType || null,
        patient: newAlert.patient!.trim(),
        message: newAlert.message!.trim(),
        create_user: newAlert.createUser || null,
        is_global: newAlert.isGlobal || false,
        patient_section: newAlert.patientSection || false,
        claim_section: newAlert.claimSection || false,
        payment_section: newAlert.paymentSection || false,
        appointment_section: newAlert.appointmentSection || false,
        create_date_range: newAlert.createDateRange || 'All',
        create_date_start: newAlert.createDateStart || null,
        create_date_end: newAlert.createDateEnd || null,
        effective_start_date_range: newAlert.effectiveStartDateRange || 'All',
        effective_start_date_start: newAlert.effectiveStartDateStart || null,
        effective_start_date_end: newAlert.effectiveStartDateEnd || null,
        effective_end_date_range: newAlert.effectiveEndDateRange || 'All',
        effective_end_date_start: newAlert.effectiveEndDateStart || null,
        effective_end_date_end: newAlert.effectiveEndDateEnd || null,
        include_deleted: newAlert.includeDeleted || false,
        status: (newAlert.status || 'active') as 'active' | 'inactive',
        is_active: (newAlert.status || 'active') === 'active'
      };

      // Remove null values for optional fields
      Object.keys(insertData).forEach(key => {
        if (insertData[key] === null || insertData[key] === '') {
          delete insertData[key];
        }
      });

      const { data, error } = await supabase
        .from('alert_controls' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating alert:', error);
        throw new Error(error.message || 'Failed to create alert');
      }

      // Refresh the alerts list
      await fetchAlertsFromDatabase();

      // Reset form
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

      toast({
        title: "Alert Added",
        description: `Alert for ${newAlert.patient} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create alert:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create alert. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleEditAlert = (alert: Alert) => {
    setEditingAlert(alert);
    setIsEditDialogOpen(true);
  };

  const handleUpdateAlert = async () => {
    if (!editingAlert || !editingAlert.id) {
      toast({
        title: "Error",
        description: "Alert ID is missing. Cannot update.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Updating alert:', editingAlert);

      // Prepare data for database (snake_case) - consistent naming
      const updateData: any = {
        alert_type: editingAlert.alertType || null,
        patient: editingAlert.patient.trim(),
        message: editingAlert.message.trim(),
        create_user: editingAlert.createUser || null,
        is_global: editingAlert.isGlobal || false,
        patient_section: editingAlert.patientSection || false,
        claim_section: editingAlert.claimSection || false,
        payment_section: editingAlert.paymentSection || false,
        appointment_section: editingAlert.appointmentSection || false,
        create_date_range: editingAlert.createDateRange || 'All',
        create_date_start: editingAlert.createDateStart || null,
        create_date_end: editingAlert.createDateEnd || null,
        effective_start_date_range: editingAlert.effectiveStartDateRange || 'All',
        effective_start_date_start: editingAlert.effectiveStartDateStart || null,
        effective_start_date_end: editingAlert.effectiveStartDateEnd || null,
        effective_end_date_range: editingAlert.effectiveEndDateRange || 'All',
        effective_end_date_start: editingAlert.effectiveEndDateStart || null,
        effective_end_date_end: editingAlert.effectiveEndDateEnd || null,
        include_deleted: editingAlert.includeDeleted || false,
        status: editingAlert.status as 'active' | 'inactive',
        is_active: editingAlert.status === 'active'
      };

      // Remove null values for optional fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const { error } = await supabase
        .from('alert_controls' as any)
        .update(updateData)
        .eq('id', editingAlert.id);

      if (error) {
        console.error('❌ Error updating alert:', error);
        throw new Error(error.message || 'Failed to update alert');
      }

      // Refresh the alerts list
      await fetchAlertsFromDatabase();

      setIsEditDialogOpen(false);
      setEditingAlert(null);

      toast({
        title: "Alert Updated",
        description: `Alert for ${editingAlert.patient} has been successfully updated.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to update alert:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update alert. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this alert? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting alert:', id);

      const { error } = await supabase
        .from('alert_controls' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting alert:', error);
        throw new Error(error.message || 'Failed to delete alert');
      }

      // Refresh the alerts list
      await fetchAlertsFromDatabase();

      toast({
        title: "Alert Deleted",
        description: "Alert has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('💥 Failed to delete alert:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete alert. Please try again.',
        variant: "destructive",
      });
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading alerts...</p>
            </div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search criteria"
                : "Get started by creating your first alert"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Alert
              </Button>
            )}
          </div>
        ) : (
          filteredAlerts.map((alert) => (
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
          ))
        )}
      </div>
    </div>
  );
};
