import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { authorizationTaskService } from '@/services/authorizationTaskService';
import { visitUsageService } from '@/services/visitUsageService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Plus, 
  Clock, 
  User, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { SimpleAppointmentForm } from '@/components/scheduling/SimpleAppointmentForm';
import { AppointmentDetails } from '@/components/scheduling/AppointmentDetails';
import { CalendarView } from '@/components/scheduling/CalendarView';
import { WeekView } from '@/components/scheduling/WeekView';

interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  appointment_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  location: string;
  notes: string;
  created_at: string;
  updated_at: string;
  // Related data
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  provider?: {
    id: string;
    name: string;
    specialty: string;
  };
}

export function Schedule() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const isFetchingRef = useRef(false);
  const { toast } = useToast();

  // Fetch appointments from database
  useEffect(() => {
    fetchAppointmentsFromDatabase();
  }, []);

  const fetchAppointmentsFromDatabase = async () => {
    // Prevent duplicate concurrent fetches
    if (isFetchingRef.current) {
      console.log('⏸️ Appointment fetch already in progress, skipping...');
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      console.log('🔍 Fetching appointments from database...');

      // Check authentication first
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch appointments.');
        setAppointments([]);
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      // Fetch appointments first
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments' as any)
        .select('*')
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (appointmentsError) {
        console.error('❌ Error fetching appointments:', appointmentsError);
        
        if (appointmentsError.code === '42P01' || appointmentsError.message.includes('does not exist')) {
          console.warn('⚠️ Appointments table not found. Showing empty list.');
          setAppointments([]);
          setIsLoading(false);
          isFetchingRef.current = false;
          return;
        }

        toast({
          title: 'Error loading appointments',
          description: appointmentsError.message,
          variant: 'destructive',
        });
        setAppointments([]);
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      // Fetch patient and provider data separately for each appointment
      let finalAppointmentsData: any[] = [];
      
      if (appointmentsData && appointmentsData.length > 0) {
        // Get unique patient IDs
        const patientIds = [...new Set((appointmentsData as any[]).map(apt => apt.patient_id).filter(Boolean))];
        const providerIds = [...new Set((appointmentsData as any[]).map(apt => apt.provider_id).filter(Boolean))];

        // Fetch patients
        let patientsMap: Record<string, any> = {};
        if (patientIds.length > 0) {
          const { data: patientsData } = await supabase
            .from('patients' as any)
            .select('id, first_name, last_name, phone, email')
            .in('id', patientIds);
          
          if (patientsData) {
            (patientsData as any[]).forEach(patient => {
              patientsMap[patient.id] = patient;
            });
          }
        }

        // Fetch providers
        let providersMap: Record<string, any> = {};
        if (providerIds.length > 0) {
          const { data: providersData } = await supabase
            .from('providers' as any)
            .select('id, first_name, last_name, title, specialty')
            .in('id', providerIds);
          
          if (providersData) {
            (providersData as any[]).forEach(provider => {
              providersMap[provider.id] = provider;
            });
          }
        }

        // Combine appointments with patient and provider data
        finalAppointmentsData = (appointmentsData as any[]).map((apt: any) => ({
          ...apt,
          patients: apt.patient_id ? patientsMap[apt.patient_id] : null,
          providers: apt.provider_id ? providersMap[apt.provider_id] : null,
        }));
      }

        console.log('📦 Raw appointments data:', finalAppointmentsData);

        // Transform database records to match component's appointment format
        if (finalAppointmentsData && Array.isArray(finalAppointmentsData) && finalAppointmentsData.length > 0) {
          const transformedAppointments: Appointment[] = finalAppointmentsData.map((dbAppointment: any) => {
          // Handle patient data (could be object from join or null)
          let patientData = null;
          if (dbAppointment.patients) {
            // If it's an array from join, take first element
            const patient = Array.isArray(dbAppointment.patients) ? dbAppointment.patients[0] : dbAppointment.patients;
            if (patient) {
              patientData = {
                id: patient.id,
                first_name: patient.first_name || '',
                last_name: patient.last_name || '',
                phone: patient.phone || '',
                email: patient.email || '',
              };
            }
          }

          // Handle provider data (could be object from join or null)
          let providerData = null;
          if (dbAppointment.providers) {
            // If it's an array from join, take first element
            const provider = Array.isArray(dbAppointment.providers) ? dbAppointment.providers[0] : dbAppointment.providers;
            if (provider) {
              providerData = {
                id: provider.id,
                name: `${provider.title ? `${provider.title} ` : ''}${provider.first_name || ''} ${provider.last_name || ''}`.trim() || 'Unknown Provider',
              };
            }
          }

          return {
            id: dbAppointment.id,
            patient_id: dbAppointment.patient_id || '',
            provider_id: dbAppointment.provider_id || '',
            appointment_type: dbAppointment.appointment_type || '',
            scheduled_date: dbAppointment.scheduled_date || '',
            scheduled_time: dbAppointment.scheduled_time || '00:00',
            duration_minutes: dbAppointment.duration_minutes || 30,
            status: dbAppointment.status || 'scheduled',
            location: dbAppointment.location || '',
            notes: dbAppointment.notes || '',
            created_at: dbAppointment.created_at || new Date().toISOString(),
            updated_at: dbAppointment.updated_at || new Date().toISOString(),
            patient: patientData,
            provider: providerData,
          };
        });

          setAppointments(transformedAppointments);
          console.log(`✅ Successfully loaded ${transformedAppointments.length} appointments from database`);
        } else {
          console.log('📋 No appointments found in database');
          setAppointments([]);
        }
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchAppointmentsFromDatabase:', error);
      setAppointments([]);
      toast({
        title: 'Error loading appointments',
        description: error.message || 'Failed to load appointments from database',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
      console.log('🏁 Appointment fetch completed.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAppointmentSelect = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handleAppointmentEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleAppointmentDelete = async (appointmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting appointment:', appointmentId);

      const { error } = await supabase
        .from('appointments' as any)
        .delete()
        .eq('id', appointmentId);

      if (error) {
        console.error('❌ Error deleting appointment:', error);
        throw new Error(error.message || 'Failed to delete appointment');
      }

      // Update local state
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      
      // Close details modal if open
      if (selectedAppointment?.id === appointmentId) {
        setShowAppointmentDetails(false);
        setSelectedAppointment(null);
      }

      toast({
        title: 'Success',
        description: 'Appointment deleted successfully.',
      });

      // Refresh appointments list
      await fetchAppointmentsFromDatabase();
    } catch (error: any) {
      console.error('💥 Failed to delete appointment:', error);
      toast({
        title: 'Error deleting appointment',
        description: error.message || 'Failed to delete appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAppointmentSave = async (appointmentData: any) => {
    try {
      console.log('💾 Saving appointment:', appointmentData);

      // Check if this is an update (either selectedAppointment exists or appointmentData has an id)
      const appointmentId = selectedAppointment?.id || appointmentData.id;
      if (appointmentId) {
        // Update existing appointment
        const updateData: any = {
          patient_id: appointmentData.patient_id || appointmentData.patientId || null,
          provider_id: appointmentData.provider_id || appointmentData.providerId || null,
          appointment_type: appointmentData.appointment_type || appointmentData.appointmentType || null,
          scheduled_date: appointmentData.scheduled_date || appointmentData.appointmentDate || appointmentData.scheduledDate,
          scheduled_time: appointmentData.scheduled_time || appointmentData.appointmentTime || appointmentData.scheduledTime,
          duration_minutes: appointmentData.duration_minutes || appointmentData.duration || 30,
          status: appointmentData.status || 'scheduled',
          location: appointmentData.location || null,
          notes: appointmentData.notes || null,
          updated_at: new Date().toISOString(),
        };

        // Remove null/undefined values
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === null || updateData[key] === undefined) {
            delete updateData[key];
          }
        });

        const { data: updated, error } = await supabase
          .from('appointments' as any)
          .update(updateData)
          .eq('id', appointmentId)
          .select('*')
          .single();

        if (error) {
          console.error('❌ Error updating appointment:', error);
          throw new Error(error.message || 'Failed to update appointment');
        }

        // Fetch patient and provider data separately
        let patient = null;
        let provider = null;

        if ((updated as any).patient_id) {
          const { data: patientData } = await supabase
            .from('patients' as any)
            .select('id, first_name, last_name, phone, email')
            .eq('id', (updated as any).patient_id)
            .maybeSingle();
          patient = patientData;
        }

        if ((updated as any).provider_id) {
          const { data: providerData } = await supabase
            .from('providers' as any)
            .select('id, first_name, last_name, title, specialty')
            .eq('id', (updated as any).provider_id)
            .maybeSingle();
          provider = providerData;
        }

        const updatedAny = updated as any;
        // Transform updated appointment
        const transformedAppointment: Appointment = {
          id: updatedAny.id,
          patient_id: updatedAny.patient_id || '',
          provider_id: updatedAny.provider_id || '',
          appointment_type: updatedAny.appointment_type || '',
          scheduled_date: updatedAny.scheduled_date || '',
          scheduled_time: updatedAny.scheduled_time || '00:00',
          duration_minutes: updatedAny.duration_minutes || 30,
          status: updatedAny.status || 'scheduled',
          location: updatedAny.location || '',
          notes: updatedAny.notes || '',
          created_at: updatedAny.created_at || new Date().toISOString(),
          updated_at: updatedAny.updated_at || new Date().toISOString(),
          patient: patient ? {
            id: patient.id,
            first_name: patient.first_name || '',
            last_name: patient.last_name || '',
            phone: patient.phone || '',
            email: patient.email || '',
          } : undefined,
          provider: provider ? {
            id: provider.id,
            name: `${provider.title ? `${provider.title} ` : ''}${provider.first_name || ''} ${provider.last_name || ''}`.trim() || 'Unknown Provider',
            specialty: provider.specialty || ''
          } : undefined,
        };

        // Check if appointment was just marked as completed
        const wasJustCompleted = (updated as any).status === 'completed' && 
          selectedAppointment?.status !== 'completed';
        
        // Handle authorization visit recording and next visit task when appointment is completed
        if (wasJustCompleted && patient && user?.id) {
          try {
            const patientName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
            const appointmentDate = `${(updated as any).scheduled_date} ${(updated as any).scheduled_time || '00:00:00'}`;
            const serviceDate = new Date((updated as any).scheduled_date);
            
            // Find active authorization for this patient
            const { data: auths } = await supabase
              .from('authorization_requests')
              .select('id, patient_name, status, visits_authorized, visits_used')
              .eq('patient_name', patientName)
              .eq('status', 'approved')
              .order('created_at', { ascending: false })
              .limit(1);
            
            // Auto-record visit if authorization found
            if (auths && auths.length > 0) {
              const auth = auths[0] as any;
              try {
                await visitUsageService.recordVisitUsage(
                  auth.id,
                  {
                    appointment_id: (updated as any).id,
                    visit_date: serviceDate,
                    service_type: (updated as any).appointment_type,
                    status: 'completed',
                    notes: `Auto-recorded from appointment completion: ${(updated as any).notes || ''}`,
                  },
                  user.id
                );
                console.log('✅ Visit auto-recorded for authorization:', auth.id);
              } catch (visitError: any) {
                // Don't fail if visit recording fails - might be exhausted or expired
                console.warn('⚠️ Could not auto-record visit:', visitError.message);
              }
            }
            
            // Create next visit task
            await authorizationTaskService.createNextVisitTask(
              patient.id,
              patientName,
              appointmentDate,
              undefined, // nextVisitDate - will be calculated
              {
                userId: user.id,
                priority: 'medium',
                notes: `Visit completed: ${(updated as any).appointment_type || 'Appointment'} on ${new Date((updated as any).scheduled_date).toLocaleDateString()}. ${(updated as any).notes || ''}`,
              }
            );
          } catch (error: any) {
            // Don't fail the appointment update if task creation fails
            console.warn('Failed to create next visit task or record visit:', error);
          }
        }

        // Update local state
        setAppointments(prev => prev.map(apt => 
          apt.id === transformedAppointment.id ? transformedAppointment : apt
        ));

        toast({
          title: 'Success',
          description: wasJustCompleted 
            ? 'Appointment completed. Next visit task created in Task Management.'
            : 'Appointment updated successfully.',
        });
      } else {
        // Create new appointment
        const insertData: any = {
          patient_id: appointmentData.patient_id || appointmentData.patientId || null,
          provider_id: appointmentData.provider_id || appointmentData.providerId || null,
          appointment_type: appointmentData.appointment_type || appointmentData.appointmentType || null,
          scheduled_date: appointmentData.scheduled_date || appointmentData.appointmentDate || appointmentData.scheduledDate,
          scheduled_time: appointmentData.scheduled_time || appointmentData.appointmentTime || appointmentData.scheduledTime,
          duration_minutes: appointmentData.duration_minutes || appointmentData.duration || 30,
          status: appointmentData.status || 'scheduled',
          location: appointmentData.location || null,
          notes: appointmentData.notes || null,
        };

        // Remove null values for optional fields
        Object.keys(insertData).forEach(key => {
          if (insertData[key] === null || insertData[key] === undefined) {
            delete insertData[key];
          }
        });

        const { data: created, error } = await supabase
          .from('appointments' as any)
          .insert(insertData)
          .select('*')
          .single();

        if (error) {
          console.error('❌ Error creating appointment:', error);
          throw new Error(error.message || 'Failed to create appointment');
        }

        // Fetch patient and provider data separately
        let patient = null;
        let provider = null;

        if (created.patient_id) {
          const { data: patientData } = await supabase
            .from('patients' as any)
            .select('id, first_name, last_name, phone, email')
            .eq('id', created.patient_id)
            .single();
          patient = patientData;
        }

        if (created.provider_id) {
          const { data: providerData } = await supabase
            .from('providers' as any)
            .select('id, first_name, last_name, title')
            .eq('id', created.provider_id)
            .single();
          provider = providerData;
        }

        // Transform created appointment

        const transformedAppointment: Appointment = {
          id: created.id,
          patient_id: created.patient_id || '',
          provider_id: created.provider_id || '',
          appointment_type: created.appointment_type || '',
          scheduled_date: created.scheduled_date || '',
          scheduled_time: created.scheduled_time || '00:00',
          duration_minutes: created.duration_minutes || 30,
          status: created.status || 'scheduled',
          location: created.location || '',
          notes: created.notes || '',
          created_at: created.created_at || new Date().toISOString(),
          updated_at: created.updated_at || new Date().toISOString(),
          patient: patient ? {
            id: patient.id,
            first_name: patient.first_name || '',
            last_name: patient.last_name || '',
            phone: patient.phone || '',
            email: patient.email || '',
          } : undefined,
          provider: provider ? {
            id: provider.id,
            name: `${provider.title ? `${provider.title} ` : ''}${provider.first_name || ''} ${provider.last_name || ''}`.trim() || 'Unknown Provider',
          } : undefined,
        };

        // Update local state
        setAppointments(prev => [...prev, transformedAppointment]);

        toast({
          title: 'Success',
          description: 'Appointment created successfully.',
        });
      }
      
      setShowAppointmentForm(false);
      setSelectedAppointment(null);

      // Refresh appointments list to ensure consistency
      await fetchAppointmentsFromDatabase();
    } catch (error: any) {
      console.error('💥 Failed to save appointment:', error);
      toast({
        title: 'Error saving appointment',
        description: error.message || 'Failed to save appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setShowAppointmentForm(true);
  };

  // Filter appointments based on search and status
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !searchTerm || 
      appointment.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.appointment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get appointments based on view mode
  const getAppointmentsForView = (date: Date, view: 'day' | 'week' | 'month') => {
    const appointments = filteredAppointments;
    
    switch (view) {
      case 'day':
        const dateStr = date.toISOString().split('T')[0];
        return appointments.filter(apt => apt.scheduled_date === dateStr);
      
      case 'week':
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - day);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        return appointments.filter(apt => {
          const aptDate = new Date(apt.scheduled_date);
          return aptDate >= startOfWeek && aptDate <= endOfWeek;
        });
      
      case 'month':
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        return appointments.filter(apt => {
          const aptDate = new Date(apt.scheduled_date);
          return aptDate >= startOfMonth && aptDate <= endOfMonth;
        });
      
      default:
        return appointments.filter(apt => apt.scheduled_date === date.toISOString().split('T')[0]);
    }
  };

  const currentAppointments = getAppointmentsForView(selectedDate, viewMode);

  // Generate appropriate title based on view mode
  const getScheduleTitle = (date: Date, view: 'day' | 'week' | 'month') => {
    switch (view) {
      case 'day':
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      
      case 'week':
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - day);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      
      case 'month':
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
      
      default:
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600 mt-1">Manage appointments and provider schedules</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button variant="outline" onClick={fetchAppointmentsFromDatabase} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleNewAppointment}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search patients, providers, or appointment types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="no_show">No Show</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Calendar Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarView
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              appointments={appointments}
            />
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule - {getScheduleTitle(selectedDate, viewMode)}
              </CardTitle>
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <TabsList>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading appointments...</span>
              </div>
            ) : currentAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments scheduled</h3>
                <p className="text-gray-600 mb-4">
                  {viewMode === 'day' && "There are no appointments scheduled for this date."}
                  {viewMode === 'week' && "There are no appointments scheduled for this week."}
                  {viewMode === 'month' && "There are no appointments scheduled for this month."}
                </p>
                <Button onClick={handleNewAppointment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {viewMode === 'day' ? (
                  // Day view - show appointments in chronological order
                  currentAppointments
                    .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => handleAppointmentSelect(appointment)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="font-bold text-blue-600">
                              {new Date(`2000-01-01T${appointment.scheduled_time}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                            <div className="text-xs text-gray-500">{appointment.duration_minutes} min</div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">
                                {appointment.patient ? 
                                  `${appointment.patient.first_name} ${appointment.patient.last_name}` : 
                                  'Unknown Patient'
                                }
                              </span>
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {appointment.appointment_type} • {appointment.provider?.name || 'Unknown Provider'}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {appointment.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAppointmentEdit(appointment);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAppointmentDelete(appointment.id);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                ) : viewMode === 'week' ? (
                  // Week view - group appointments by day
                  <WeekView 
                    appointments={currentAppointments} 
                    onAppointmentSelect={handleAppointmentSelect} 
                    onAppointmentEdit={handleAppointmentEdit} 
                    onAppointmentDelete={handleAppointmentDelete} 
                    getStatusColor={getStatusColor} 
                  />
                ) : (
                  // Month view - compact list with dates
                  currentAppointments
                    .sort((a, b) => {
                      const dateCompare = a.scheduled_date.localeCompare(b.scheduled_date);
                      return dateCompare !== 0 ? dateCompare : a.scheduled_time.localeCompare(b.scheduled_time);
                    })
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => handleAppointmentSelect(appointment)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-center min-w-[80px]">
                            <div className="text-xs text-gray-500">
                              {new Date(appointment.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="font-bold text-blue-600 text-sm">
                              {new Date(`2000-01-01T${appointment.scheduled_time}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">
                                {appointment.patient ? 
                                  `${appointment.patient.first_name} ${appointment.patient.last_name}` : 
                                  'Unknown Patient'
                                }
                              </span>
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-600">
                              {appointment.appointment_type} • {appointment.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAppointmentEdit(appointment);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAppointmentDelete(appointment.id);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <SimpleAppointmentForm
          isOpen={showAppointmentForm}
          onClose={() => {
            setShowAppointmentForm(false);
            setSelectedAppointment(null);
          }}
          onSave={handleAppointmentSave}
          existingAppointment={selectedAppointment}
        />
      )}

      {/* Appointment Details Modal */}
      {showAppointmentDetails && selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          isOpen={showAppointmentDetails}
          onClose={() => {
            setShowAppointmentDetails(false);
            setSelectedAppointment(null);
          }}
          onEdit={() => {
            setShowAppointmentDetails(false);
            setShowAppointmentForm(true);
          }}
          onDelete={() => handleAppointmentDelete(selectedAppointment.id)}
        />
      )}
    </div>
  );
}
