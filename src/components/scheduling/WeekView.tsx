import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Edit, Trash2 } from 'lucide-react';

interface WeekViewProps {
  appointments: any[];
  onAppointmentSelect: (appointment: any) => void;
  onAppointmentEdit: (appointment: any) => void;
  onAppointmentDelete: (id: string) => void;
  getStatusColor: (status: string) => string;
}

export function WeekView({ appointments, onAppointmentSelect, onAppointmentEdit, onAppointmentDelete, getStatusColor }: WeekViewProps) {
  // Group appointments by day of the week
  const groupAppointmentsByDay = () => {
    const grouped: { [key: string]: any[] } = {};
    
    appointments.forEach(appointment => {
      const date = new Date(appointment.scheduled_date);
      const dayKey = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(appointment);
    });
    
    // Sort appointments within each day by time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
    });
    
    return grouped;
  };

  const groupedAppointments = groupAppointmentsByDay();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Get the days that have appointments, sorted by day of week
  const daysWithAppointments = Object.keys(groupedAppointments).sort((a, b) => {
    const dayA = new Date(groupedAppointments[a][0].scheduled_date).getDay();
    const dayB = new Date(groupedAppointments[b][0].scheduled_date).getDay();
    return dayA - dayB;
  });

  return (
    <div className="space-y-6">
      {daysWithAppointments.map((day) => (
        <div key={day} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg text-gray-900">{day}</h3>
            <Badge variant="outline" className="text-xs">
              {groupedAppointments[day].length} appointment{groupedAppointments[day].length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {groupedAppointments[day].map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onAppointmentSelect(appointment)}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-center min-w-[60px]">
                    <div className="font-bold text-blue-600 text-sm">
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
                      <User className="h-3 w-3 text-gray-400" />
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
                      {appointment.appointment_type} • {appointment.provider?.name || 'Unknown Provider'}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      {appointment.location}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentEdit(appointment);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentDelete(appointment.id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {daysWithAppointments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No appointments scheduled for this week.</p>
        </div>
      )}
    </div>
  );
}
