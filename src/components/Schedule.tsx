import { useState, useEffect } from 'react';
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
import { SimpleAppointmentForm } from '@/components/Scheduling/SimpleAppointmentForm';
import { AppointmentDetails } from '@/components/Scheduling/AppointmentDetails';
import { CalendarView } from '@/components/Scheduling/CalendarView';
import { WeekView } from '@/components/Scheduling/WeekView';

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        patient_id: 'P001',
        provider_id: 'PR001',
        appointment_type: 'consultation',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '09:00',
        duration_minutes: 30,
        status: 'scheduled',
        location: 'Room 101',
        notes: 'Regular checkup',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        patient: {
          id: 'P001',
          first_name: 'John',
          last_name: 'Doe',
          phone: '(555) 123-4567',
          email: 'john.doe@email.com'
        },
        provider: {
          id: 'PR001',
          name: 'Dr. Smith',
          specialty: 'General Practice'
        }
      },
      {
        id: '2',
        patient_id: 'P002',
        provider_id: 'PR002',
        appointment_type: 'follow_up',
        scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        scheduled_time: '14:30',
        duration_minutes: 45,
        status: 'confirmed',
        location: 'Room 102',
        notes: 'Follow-up appointment',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        patient: {
          id: 'P002',
          first_name: 'Jane',
          last_name: 'Smith',
          phone: '(555) 987-6543',
          email: 'jane.smith@email.com'
        },
        provider: {
          id: 'PR002',
          name: 'Dr. Johnson',
          specialty: 'Cardiology'
        }
      }
    ];
    setAppointments(mockAppointments);
  }, []);

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
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
        alert('Appointment deleted successfully!');
      } catch (error) {
        console.error('Failed to delete appointment:', error);
        alert('Failed to delete appointment. Please try again.');
      }
    }
  };

  const handleAppointmentSave = async (appointmentData: any) => {
    try {
      if (selectedAppointment) {
        // Update existing appointment
        setAppointments(prev => prev.map(apt => 
          apt.id === selectedAppointment.id 
            ? { ...apt, ...appointmentData, updated_at: new Date().toISOString() }
            : apt
        ));
        alert('Appointment updated successfully!');
      } else {
        // Create new appointment
        const newAppointment: Appointment = {
          id: Date.now().toString(),
          ...appointmentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          patient: {
            id: appointmentData.patient_id,
            first_name: 'Unknown',
            last_name: 'Patient',
            phone: '',
            email: ''
          },
          provider: {
            id: 'PR001',
            name: 'Dr. Smith',
            specialty: 'General Practice'
          }
        };
        setAppointments(prev => [...prev, newAppointment]);
        alert('Appointment created successfully!');
      }
      
      setShowAppointmentForm(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to save appointment:', error);
      alert('Failed to save appointment. Please try again.');
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
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
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
