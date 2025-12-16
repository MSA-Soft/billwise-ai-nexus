import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  X, 
  Eye, 
  MessageSquare, 
  Stethoscope, 
  CreditCard, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Shield,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  Star,
  TrendingUp,
  Activity,
  Grid3X3,
  List,
  Table as TableIcon,
  SortAsc,
  SortDesc,
  Users,
  Plus
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Patient {
  id: string;
  patient_id?: string; // External patient ID like "PAT-014"
  name: string;
  age: number;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  insurance: string;
  lastVisit: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  medicalInfo: {
    allergies: string[];
    medications: string[];
    conditions: string[];
  };
  appointments: Array<{
    date: string;
    time: string;
    type: string;
    status: string;
    provider: string;
  }>;
  documents: Array<{
    name: string;
    type: string;
    date: string;
  }>;
  nextAppointment: string | null;
  totalVisits: number;
  outstandingBalance: number;
  riskLevel: 'low' | 'medium' | 'high';
  preferredProvider: string;
}

interface PatientSearchSystemProps {
  patients: Patient[];
  onPatientSelect: (patient: Patient) => void;
  isLoadingPatients?: boolean;
  isConnected?: boolean;
  onQuickRegister?: (data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    insuranceName?: string;
    insuranceId?: string;
  }) => Promise<Patient | void>;
}

interface SearchFilters {
  searchTerm: string;
  status: string;
  insurance: string;
  ageRange: string;
  riskLevel: string;
  provider: string;
  hasOutstandingBalance: string;
  hasUpcomingAppointment: string;
  sortBy: string;
  sortOrder: string;
}

export function PatientSearchSystem({ patients, onPatientSelect, isLoadingPatients = false, isConnected = true, onQuickRegister }: PatientSearchSystemProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    status: 'all',
    insurance: 'all',
    ageRange: 'all',
    riskLevel: 'all',
    provider: 'all',
    hasOutstandingBalance: 'all',
    hasUpcomingAppointment: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [qrFirstName, setQrFirstName] = useState('');
  const [qrLastName, setQrLastName] = useState('');
  const [qrDob, setQrDob] = useState('');
  const [qrInsuranceName, setQrInsuranceName] = useState('');
  const [qrInsuranceId, setQrInsuranceId] = useState('');
  const [qrSubmitting, setQrSubmitting] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  const insuranceProviders = useMemo(() => {
    const providers = new Set(patients.map(p => p.insurance));
    return Array.from(providers);
  }, [patients]);

  const providers = useMemo(() => {
    const providerSet = new Set(patients.map(p => p.preferredProvider));
    return Array.from(providerSet);
  }, [patients]);

  const filteredPatients = useMemo(() => {
    let filtered = patients.filter(patient => {
      const matchesSearch = !filters.searchTerm || 
        patient.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        patient.phone.includes(filters.searchTerm) ||
        patient.address.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesStatus = filters.status === 'all' || patient.status === filters.status;
      const matchesInsurance = filters.insurance === 'all' || patient.insurance === filters.insurance;
      const matchesRiskLevel = filters.riskLevel === 'all' || patient.riskLevel === filters.riskLevel;
      const matchesProvider = filters.provider === 'all' || patient.preferredProvider === filters.provider;
      
      const matchesAgeRange = (() => {
        if (filters.ageRange === 'all') return true;
        if (filters.ageRange === '0-18') return patient.age >= 0 && patient.age <= 18;
        if (filters.ageRange === '19-35') return patient.age >= 19 && patient.age <= 35;
        if (filters.ageRange === '36-55') return patient.age >= 36 && patient.age <= 55;
        if (filters.ageRange === '56+') return patient.age >= 56;
        return true;
      })();

      const matchesOutstandingBalance = (() => {
        if (filters.hasOutstandingBalance === 'all') return true;
        if (filters.hasOutstandingBalance === 'yes') return patient.outstandingBalance > 0;
        if (filters.hasOutstandingBalance === 'no') return patient.outstandingBalance === 0;
        return true;
      })();

      const matchesUpcomingAppointment = (() => {
        if (filters.hasUpcomingAppointment === 'all') return true;
        if (filters.hasUpcomingAppointment === 'yes') return patient.nextAppointment !== null;
        if (filters.hasUpcomingAppointment === 'no') return patient.nextAppointment === null;
        return true;
      })();

      return matchesSearch && matchesStatus && matchesInsurance && matchesAgeRange && 
             matchesRiskLevel && matchesProvider && matchesOutstandingBalance && matchesUpcomingAppointment;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'age':
          comparison = (a.age || 0) - (b.age || 0);
          break;
        case 'lastVisit':
          comparison = new Date(a.lastVisit || 0).getTime() - new Date(b.lastVisit || 0).getTime();
          break;
        case 'totalVisits':
          comparison = (a.totalVisits || 0) - (b.totalVisits || 0);
          break;
        case 'outstandingBalance':
          comparison = (a.outstandingBalance || 0) - (b.outstandingBalance || 0);
          break;
        default:
          comparison = (a.name || '').localeCompare(b.name || '');
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [patients, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  // Reset page when filters change
  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      insurance: 'all',
      ageRange: 'all',
      riskLevel: 'all',
      provider: 'all',
      hasOutstandingBalance: 'all',
      hasUpcomingAppointment: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all' && value !== 'name' && value !== 'asc');

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPatientCard = (patient: Patient) => (
    <Card 
      key={patient.id} 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500"
      onClick={() => onPatientSelect(patient)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                <Badge className={getStatusBadgeColor(patient.status)}>
                  {patient.status}
                </Badge>
                <Badge className={getRiskBadgeColor(patient.riskLevel)}>
                  {patient.riskLevel} risk
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="space-y-1">
                  <p className="flex items-center"><span className="font-medium mr-2">ID:</span> {patient.id}</p>
                  <p className="flex items-center"><span className="font-medium mr-2">Age:</span> {patient.age}</p>
                  <p className="flex items-center"><span className="font-medium mr-2">DOB:</span> {patient.dateOfBirth}</p>
                </div>
                <div className="space-y-1">
                  <p className="flex items-center"><Phone className="h-3 w-3 mr-2" /> {patient.phone}</p>
                  <p className="flex items-center"><Mail className="h-3 w-3 mr-2" /> {patient.email}</p>
                  <p className="flex items-center"><MapPin className="h-3 w-3 mr-2" /> {patient.address}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Insurance</span>
                    <Shield className="h-4 w-4 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-600">{patient.insurance}</p>
                  {patient.outstandingBalance > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      Outstanding: ${patient.outstandingBalance.toFixed(2)}
                    </p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Medical Info</span>
                    <Stethoscope className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="text-xs text-gray-600">
                    <p>Allergies: {patient.medicalInfo.allergies.length}</p>
                    <p>Conditions: {patient.medicalInfo.conditions.length}</p>
                    <p>Visits: {patient.totalVisits}</p>
                  </div>
                </div>
              </div>

              {patient.nextAppointment && (
                <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">Next Appointment</span>
                    </div>
                    <span className="text-sm text-blue-600">{patient.nextAppointment}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); }}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); }}>
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); }}>
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPatientListItem = (patient: Patient) => (
    <div
      key={patient.id}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-white"
      onClick={() => onPatientSelect(patient)}
    >
      <div className="flex items-center space-x-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-blue-100 text-blue-600">
            {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-900">{patient.name}</h3>
            <Badge className={getStatusBadgeColor(patient.status)} variant="outline">
              {patient.status}
            </Badge>
            <Badge className={getRiskBadgeColor(patient.riskLevel)} variant="outline">
              {patient.riskLevel}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            ID: {patient.patient_id || patient.id} • Age: {patient.age} • {patient.insurance} • 
            {patient.outstandingBalance > 0 && (
              <span className="text-red-600 ml-2">Outstanding: ${patient.outstandingBalance.toFixed(2)}</span>
            )}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right text-sm">
          <p className="text-gray-600">Last visit: {patient.lastVisit}</p>
          <p className="text-gray-500">Total visits: {patient.totalVisits}</p>
          {patient.nextAppointment && (
            <p className="text-blue-600">Next: {patient.nextAppointment}</p>
          )}
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }}>
            <MessageSquare className="h-4 w-4" />
          </Button>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );

  const renderPatientTable = () => (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Avatar</TableHead>
            <TableHead>Patient Name</TableHead>
            <TableHead>Patient ID</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>DOB</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Insurance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Last Visit</TableHead>
            <TableHead>Total Visits</TableHead>
            <TableHead>Outstanding Balance</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedPatients.map((patient) => (
            <TableRow 
              key={patient.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onPatientSelect(patient)}
            >
              <TableCell>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell className="text-sm text-gray-600 font-mono">
                {patient.patient_id || (patient.id.length > 20 ? `${patient.id.substring(0, 20)}...` : patient.id)}
              </TableCell>
              <TableCell>{patient.age}</TableCell>
              <TableCell className="text-sm text-gray-600">
                {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell className="text-sm">{patient.phone || 'N/A'}</TableCell>
              <TableCell className="text-sm">{patient.email || 'N/A'}</TableCell>
              <TableCell className="text-sm">{patient.insurance || 'N/A'}</TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(patient.status)} variant="outline">
                  {patient.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getRiskBadgeColor(patient.riskLevel)} variant="outline">
                  {patient.riskLevel}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {patient.lastVisit || 'N/A'}
              </TableCell>
              <TableCell className="text-sm">{patient.totalVisits || 0}</TableCell>
              <TableCell className="text-sm">
                {patient.outstandingBalance > 0 ? (
                  <span className="text-red-600 font-medium">
                    ${patient.outstandingBalance.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-gray-400">$0.00</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onPatientSelect(patient);
                    }}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                    }}
                    title="Message"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Handle loading state
  if (isLoadingPatients) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  // Handle connection error
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-red-600 font-medium">Database Connection Error</p>
            <p className="text-red-500 text-sm mt-1">Unable to load patient data</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!patients || patients.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">No Patients Found</p>
            <p className="text-gray-500 text-sm mt-1">Start by registering a new patient</p>
          </div>
          <Button onClick={() => setShowQuickRegister(true)}>
            <Plus className="h-4 w-4 mr-2" /> Quick Register Patient
          </Button>

          <Dialog open={showQuickRegister} onOpenChange={setShowQuickRegister}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quick Patient Registration</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="qr-first-name">First Name *</Label>
                  <Input id="qr-first-name" value={qrFirstName} onChange={(e) => setQrFirstName(e.target.value)} placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qr-last-name">Last Name *</Label>
                  <Input id="qr-last-name" value={qrLastName} onChange={(e) => setQrLastName(e.target.value)} placeholder="Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qr-dob">Date of Birth *</Label>
                  <Input id="qr-dob" type="date" value={qrDob} onChange={(e) => setQrDob(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qr-ins-name">Insurance Name</Label>
                  <Input id="qr-ins-name" value={qrInsuranceName} onChange={(e) => setQrInsuranceName(e.target.value)} placeholder="Aetna / BlueCross" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qr-ins-id">Insurance ID</Label>
                  <Input id="qr-ins-id" value={qrInsuranceId} onChange={(e) => setQrInsuranceId(e.target.value)} placeholder="ABC12345" />
                </div>
              </div>
              {qrError && (
                <div className="text-sm text-red-600">{qrError}</div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowQuickRegister(false)} disabled={qrSubmitting}>Cancel</Button>
                <Button onClick={async () => {
                  setQrError(null);
                  if (!qrFirstName.trim() || !qrLastName.trim() || !qrDob) {
                    setQrError('First name, last name, and DOB are required.');
                    return;
                  }
                  if (!qrInsuranceName.trim() && !qrInsuranceId.trim()) {
                    setQrError('Provide either Insurance Name or Insurance ID.');
                    return;
                  }
                  setQrSubmitting(true);
                  try {
                    const data = {
                      firstName: qrFirstName.trim(),
                      lastName: qrLastName.trim(),
                      dateOfBirth: qrDob,
                      insuranceName: qrInsuranceName.trim() || undefined,
                      insuranceId: qrInsuranceId.trim() || undefined,
                    };
                    let created: Patient | void | undefined = undefined;
                    if (onQuickRegister) {
                      created = await onQuickRegister(data);
                    }
                    const name = `${data.firstName} ${data.lastName}`.trim();
                    const fallbackPatient: Patient = {
                      id: Math.random().toString(36).slice(2),
                      name,
                      age: 0,
                      phone: '',
                      email: '',
                      status: 'active',
                      insurance: data.insuranceName || data.insuranceId || '',
                      lastVisit: '',
                      address: '',
                      dateOfBirth: data.dateOfBirth,
                      emergencyContact: { name: '', phone: '', relation: '' },
                      medicalInfo: { allergies: [], medications: [], conditions: [] },
                      appointments: [],
                      documents: [],
                      nextAppointment: null,
                      totalVisits: 0,
                      outstandingBalance: 0,
                      riskLevel: 'low',
                      preferredProvider: '',
                    };
                    onPatientSelect((created as Patient) || fallbackPatient);
                    setShowQuickRegister(false);
                    setQrFirstName('');
                    setQrLastName('');
                    setQrDob('');
                    setQrInsuranceName('');
                    setQrInsuranceId('');
                  } catch (e) {
                    setQrError('Failed to register patient. Please try again.');
                  } finally {
                    setQrSubmitting(false);
                  }
                }} disabled={qrSubmitting}>
                  {qrSubmitting ? 'Registering...' : 'Register'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patients by name, ID, email, phone, or address..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="pl-10 h-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                {Object.values(filters).filter(f => f !== 'all' && f !== 'name' && f !== 'asc').length}
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Insurance</label>
              <Select value={filters.insurance} onValueChange={(value) => handleFilterChange('insurance', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Insurance</SelectItem>
                  {insuranceProviders.map(provider => (
                    <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
              <Select value={filters.ageRange} onValueChange={(value) => handleFilterChange('ageRange', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="0-18">0-18</SelectItem>
                  <SelectItem value="19-35">19-35</SelectItem>
                  <SelectItem value="36-55">36-55</SelectItem>
                  <SelectItem value="56+">56+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
              <Select value={filters.riskLevel} onValueChange={(value) => handleFilterChange('riskLevel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
              <Select value={filters.provider} onValueChange={(value) => handleFilterChange('provider', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map(provider => (
                    <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Outstanding Balance</label>
              <Select value={filters.hasOutstandingBalance} onValueChange={(value) => handleFilterChange('hasOutstandingBalance', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Has Balance</SelectItem>
                  <SelectItem value="no">No Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upcoming Appointment</label>
              <Select value={filters.hasUpcomingAppointment} onValueChange={(value) => handleFilterChange('hasUpcomingAppointment', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Has Appointment</SelectItem>
                  <SelectItem value="no">No Appointment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="age">Age</SelectItem>
                  <SelectItem value="lastVisit">Last Visit</SelectItem>
                  <SelectItem value="totalVisits">Total Visits</SelectItem>
                  <SelectItem value="outstandingBalance">Outstanding Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary and View Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">{Math.min(endIndex, filteredPatients.length)}</span> of{' '}
            <span className="font-medium">{filteredPatients.length}</span> patients
            {filteredPatients.length !== patients.length && (
              <span className="text-gray-500"> (filtered from {patients.length} total)</span>
            )}
          </span>
          {hasActiveFilters && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Activity className="h-3 w-3 mr-1" />
              Filtered
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(parseInt(value)); setCurrentPage(1); }}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={filters.sortOrder === 'asc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, sortOrder: 'asc' }))}
          >
            <SortAsc className="h-4 w-4" />
          </Button>
          <Button
            variant={filters.sortOrder === 'desc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, sortOrder: 'desc' }))}
          >
            <SortDesc className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-gray-300 mx-2" />
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Performance Warning for Grid View */}
      {viewMode === 'grid' && filteredPatients.length > 100 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              Grid view may be slow with large datasets. Consider using list view for better performance with {filteredPatients.length}+ patients.
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto"
              onClick={() => setViewMode('list')}
            >
              Switch to List View
            </Button>
          </div>
        </div>
      )}

      {/* Patient Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {paginatedPatients.map(renderPatientCard)}
        </div>
      ) : viewMode === 'table' ? (
        renderPatientTable()
      ) : (
        <div className="space-y-3">
          {paginatedPatients.map(renderPatientListItem)}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNumber > totalPages) return null;
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600 mb-4">
            {hasActiveFilters 
              ? "No patients match your current search criteria." 
              : "No patients are currently registered in the system."}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
          <div className="mt-4">
            <Button onClick={() => setShowQuickRegister(true)}>
              <Plus className="h-4 w-4 mr-2" /> Quick Register Patient
            </Button>
          </div>

          <Dialog open={showQuickRegister} onOpenChange={setShowQuickRegister}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quick Patient Registration</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="qr-first-name">First Name *</Label>
                  <Input id="qr-first-name" value={qrFirstName} onChange={(e) => setQrFirstName(e.target.value)} placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qr-last-name">Last Name *</Label>
                  <Input id="qr-last-name" value={qrLastName} onChange={(e) => setQrLastName(e.target.value)} placeholder="Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qr-dob">Date of Birth *</Label>
                  <Input id="qr-dob" type="date" value={qrDob} onChange={(e) => setQrDob(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qr-ins-name">Insurance Name</Label>
                  <Input id="qr-ins-name" value={qrInsuranceName} onChange={(e) => setQrInsuranceName(e.target.value)} placeholder="Aetna / BlueCross" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qr-ins-id">Insurance ID</Label>
                  <Input id="qr-ins-id" value={qrInsuranceId} onChange={(e) => setQrInsuranceId(e.target.value)} placeholder="ABC12345" />
                </div>
              </div>
              {qrError && (
                <div className="text-sm text-red-600">{qrError}</div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowQuickRegister(false)} disabled={qrSubmitting}>Cancel</Button>
                <Button onClick={async () => {
                  setQrError(null);
                  if (!qrFirstName.trim() || !qrLastName.trim() || !qrDob) {
                    setQrError('First name, last name, and DOB are required.');
                    return;
                  }
                  if (!qrInsuranceName.trim() && !qrInsuranceId.trim()) {
                    setQrError('Provide either Insurance Name or Insurance ID.');
                    return;
                  }
                  setQrSubmitting(true);
                  try {
                    const data = {
                      firstName: qrFirstName.trim(),
                      lastName: qrLastName.trim(),
                      dateOfBirth: qrDob,
                      insuranceName: qrInsuranceName.trim() || undefined,
                      insuranceId: qrInsuranceId.trim() || undefined,
                    };
                    let created: Patient | void | undefined = undefined;
                    if (onQuickRegister) {
                      created = await onQuickRegister(data);
                    }
                    const name = `${data.firstName} ${data.lastName}`.trim();
                    const fallbackPatient: Patient = {
                      id: Math.random().toString(36).slice(2),
                      name,
                      age: 0,
                      phone: '',
                      email: '',
                      status: 'active',
                      insurance: data.insuranceName || data.insuranceId || '',
                      lastVisit: '',
                      address: '',
                      dateOfBirth: data.dateOfBirth,
                      emergencyContact: { name: '', phone: '', relation: '' },
                      medicalInfo: { allergies: [], medications: [], conditions: [] },
                      appointments: [],
                      documents: [],
                      nextAppointment: null,
                      totalVisits: 0,
                      outstandingBalance: 0,
                      riskLevel: 'low',
                      preferredProvider: '',
                    };
                    onPatientSelect((created as Patient) || fallbackPatient);
                    setShowQuickRegister(false);
                    setQrFirstName('');
                    setQrLastName('');
                    setQrDob('');
                    setQrInsuranceName('');
                    setQrInsuranceId('');
                  } catch (e) {
                    setQrError('Failed to register patient. Please try again.');
                  } finally {
                    setQrSubmitting(false);
                  }
                }} disabled={qrSubmitting}>
                  {qrSubmitting ? 'Registering...' : 'Register'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
