import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, Phone, Calendar, CreditCard } from 'lucide-react';

const mockPatients = [
  {
    id: 'P001',
    name: 'John Doe',
    dob: '1985-06-15',
    phone: '(555) 123-4567',
    insurance: 'Blue Cross Blue Shield',
    memberNumber: 'BC123456789',
    eligibility: 'Active'
  },
  {
    id: 'P002',
    name: 'Sarah Wilson',
    dob: '1992-03-22',
    phone: '(555) 234-5678',
    insurance: 'Aetna',
    memberNumber: 'AE987654321',
    eligibility: 'Active'
  },
  {
    id: 'P003',
    name: 'Mike Brown',
    dob: '1978-11-08',
    phone: '(555) 345-6789',
    insurance: 'Medicare',
    memberNumber: 'MC456789123',
    eligibility: 'Active'
  },
  {
    id: 'P004',
    name: 'Emily Davis',
    dob: '1990-07-14',
    phone: '(555) 456-7890',
    insurance: 'Cigna',
    memberNumber: 'CG789123456',
    eligibility: 'Active'
  },
  {
    id: 'P005',
    name: 'Robert Taylor',
    dob: '1982-12-03',
    phone: '(555) 567-8901',
    insurance: 'UnitedHealth',
    memberNumber: 'UH123789456',
    eligibility: 'Active'
  }
];

interface PatientSelectionStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function PatientSelectionStep({ data, onUpdate }: PatientSelectionStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState(data.patient);

  useEffect(() => {
    const filtered = mockPatients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
    );
    setFilteredPatients(filtered);
  }, [searchTerm]);

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    onUpdate({ patient });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="space-y-2">
        <Label htmlFor="patientSearch">Search Patient</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="patientSearch"
            placeholder="Search by name, ID, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Selected Patient */}
      {selectedPatient && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Selected Patient</h3>
                  <p className="text-green-700">{selectedPatient.name}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Selected</Badge>
            </div>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span>DOB: {selectedPatient.dob}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-600" />
                <span>{selectedPatient.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span>{selectedPatient.insurance}</span>
              </div>
              <div>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {selectedPatient.eligibility}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient List */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">
          Available Patients ({filteredPatients.length})
        </h3>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {filteredPatients.map((patient) => (
            <Card 
              key={patient.id} 
              className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                selectedPatient?.id === patient.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => handlePatientSelect(patient)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      selectedPatient?.id === patient.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <User className={`h-4 w-4 ${
                        selectedPatient?.id === patient.id ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{patient.name}</h4>
                      <p className="text-sm text-gray-600">ID: {patient.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{patient.insurance}</p>
                    <Badge variant="outline" className="text-xs">
                      {patient.eligibility}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3" />
                    <span>{patient.dob}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3" />
                    <span>{patient.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-8">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
}
