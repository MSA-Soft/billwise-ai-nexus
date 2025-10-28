import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface CalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  appointments: any[];
}

export function CalendarView({ selectedDate, onDateChange, appointments }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, firstDay, lastDay };
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.scheduled_date === dateStr);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateChange(newDate);
  };

  const isToday = (day: number) => {
    const today = new Date();
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === selectedDate.toDateString();
  };

  const getDayClassName = (day: number) => {
    const baseClass = "p-2 hover:bg-gray-100 cursor-pointer rounded text-center text-sm transition-colors";
    const todayClass = isToday(day) ? "bg-blue-100 text-blue-800 font-semibold" : "";
    const selectedClass = isSelectedDate(day) ? "bg-blue-500 text-white font-semibold" : "";
    const hasAppointments = getAppointmentsForDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)).length > 0;
    const appointmentClass = hasAppointments ? "border-b-2 border-blue-400" : "";

    return `${baseClass} ${todayClass} ${selectedClass} ${appointmentClass}`.trim();
  };

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
          ←
        </Button>
        <span className="font-medium text-sm">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <Button variant="ghost" size="sm" onClick={handleNextMonth}>
          →
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {dayNames.map((day) => (
          <div key={day} className="font-medium text-gray-600 p-2 text-center text-xs">
            {day}
          </div>
        ))}

        {/* Empty cells for days before the first day of the month */}
        {Array.from({ length: startingDayOfWeek }, (_, i) => (
          <div key={`empty-${i}`} className="p-2"></div>
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateAppointments = getAppointmentsForDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
          
          return (
            <div key={day} className="relative">
              <div
                className={getDayClassName(day)}
                onClick={() => handleDateClick(day)}
              >
                {day}
              </div>
              {/* Appointment indicator */}
              {dateAppointments.length > 0 && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2 pt-4 border-t">
        <div className="text-xs text-gray-600 font-medium">Legend:</div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-100 border border-blue-400 rounded"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            <span>Has appointments</span>
          </div>
        </div>
      </div>

      {/* Quick Date Selection */}
      <div className="space-y-2 pt-4 border-t">
        <div className="text-xs text-gray-600 font-medium">Quick Select:</div>
        <div className="flex flex-wrap gap-1">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-6 px-2"
            onClick={() => onDateChange(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-6 px-2"
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              onDateChange(tomorrow);
            }}
          >
            Tomorrow
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-6 px-2"
            onClick={() => {
              const nextWeek = new Date();
              nextWeek.setDate(nextWeek.getDate() + 7);
              onDateChange(nextWeek);
            }}
          >
            Next Week
          </Button>
        </div>
      </div>
    </div>
  );
}
