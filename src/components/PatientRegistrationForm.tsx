import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Shield, 
  AlertCircle, 
  Calendar,
  Heart,
  FileText,
  Stethoscope,
  CreditCard,
  Users,
  Check,
  X,
  Upload,
  FileDown,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PatientRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patient: any) => void;
}

export function PatientRegistrationForm({ isOpen, onClose, onSubmit }: PatientRegistrationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Data from Customer Setup
  const [payers, setPayers] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [practices, setPractices] = useState<any[]>([]);
  const [isLoadingPayers, setIsLoadingPayers] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isLoadingPractices, setIsLoadingPractices] = useState(false);

  // Basic Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');

  // Contact Information
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');

  // Insurance Information
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [insuranceCompanyId, setInsuranceCompanyId] = useState('');
  const [insuranceId, setInsuranceId] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [policyHolderName, setPolicyHolderName] = useState('');
  const [policyHolderRelationship, setPolicyHolderRelationship] = useState('');
  const [secondaryInsurance, setSecondaryInsurance] = useState('');
  const [secondaryInsuranceCompanyId, setSecondaryInsuranceCompanyId] = useState('');
  const [secondaryInsuranceId, setSecondaryInsuranceId] = useState('');
  const [secondaryGroupNumber, setSecondaryGroupNumber] = useState('');
  const [secondaryPolicyHolderName, setSecondaryPolicyHolderName] = useState('');
  const [secondaryPolicyHolderRelationship, setSecondaryPolicyHolderRelationship] = useState('');
  
  // Provider/Practice Information
  
  // Fetch data from Customer Setup
  useEffect(() => {
    if (isOpen) {
      fetchPayers();
      fetchProviders();
      fetchPractices();
    }
  }, [isOpen]);

  const fetchPayers = async () => {
    try {
      setIsLoadingPayers(true);
      const { data, error } = await supabase
        .from('insurance_payers' as any)
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching payers:', error);
        toast({
          title: 'Error loading payers',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setPayers(data || []);
    } catch (error: any) {
      console.error('Error fetching payers:', error);
      toast({
        title: 'Error loading payers',
        description: error.message || 'Failed to load payers',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPayers(false);
    }
  };

  const fetchProviders = async () => {
    try {
      setIsLoadingProviders(true);
      const { data, error } = await supabase
        .from('providers' as any)
        .select('*')
        .eq('is_active', true)
        .order('last_name', { ascending: true });

      if (error) {
        console.error('Error fetching providers:', error);
        toast({
          title: 'Error loading providers',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setProviders(data || []);
    } catch (error: any) {
      console.error('Error fetching providers:', error);
      toast({
        title: 'Error loading providers',
        description: error.message || 'Failed to load providers',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const fetchPractices = async () => {
    try {
      setIsLoadingPractices(true);
      const { data, error } = await supabase
        .from('practices' as any)
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching practices:', error);
        return;
      }

      setPractices(data || []);
    } catch (error: any) {
      console.error('Error fetching practices:', error);
    } finally {
      setIsLoadingPractices(false);
    }
  };

  // Medical Information
  const [allergies, setAllergies] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [previousSurgeries, setPreviousSurgeries] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');

  // Helpers for immediate field-level validation
  const setFieldError = (field: string, message?: string) => {
    setErrors(prev => {
      const next = { ...prev };
      if (message) {
        next[field] = message;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const validateBasicTab = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      // Validate that date of birth is not in the future
      const dob = new Date(dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      if (dob > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
      // Validate that date is not too far in the past (e.g., more than 150 years ago)
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 150);
      if (dob < minDate) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }
    if (!gender) newErrors.gender = 'Gender is required';
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateContactTab = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) newErrors.email = 'Please enter a valid email address';
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (phone && !phoneRegex.test(phone)) newErrors.phone = 'Please enter a valid phone number';
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateInsuranceTab = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!insuranceCompany.trim()) newErrors.insuranceCompany = 'Insurance company is required';
    if (!insuranceId.trim()) newErrors.insuranceId = 'Insurance ID is required';
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic Information validation
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      // Validate that date of birth is not in the future
      const dob = new Date(dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      if (dob > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
      // Validate that date is not too far in the past (e.g., more than 150 years ago)
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 150);
      if (dob < minDate) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }
    if (!gender) newErrors.gender = 'Gender is required';

    // Contact Information validation
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!zipCode.trim()) newErrors.zipCode = 'Zip code is required';

    // Insurance validation
    if (!insuranceCompany.trim()) newErrors.insuranceCompany = 'Insurance company is required';
    if (!insuranceId.trim()) newErrors.insuranceId = 'Insurance ID is required';

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone format validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (phone && !phoneRegex.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Helper function to calculate accurate age
      const calculateAge = (dob: string): number | null => {
        if (!dob) return null;
        try {
          const birthDate = new Date(dob);
          const today = new Date();
          if (isNaN(birthDate.getTime()) || birthDate > today) return 0;
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age >= 0 ? age : 0;
        } catch {
          return null;
        }
      };

      const patientData = {
        id: Math.random().toString(36).slice(2),
        name: `${firstName} ${lastName}`.trim(),
        firstName, // CRITICAL: Add firstName field for handler
        lastName, // CRITICAL: Add lastName field for handler
        age: calculateAge(dateOfBirth),
        dateOfBirth,
        phone,
        email,
        address, // CRITICAL: Keep as separate field, not concatenated
        city, // CRITICAL: Add separate city field
        state, // CRITICAL: Add separate state field
        zipCode, // CRITICAL: Add separate zipCode field
        insurance: insuranceCompany,
        insuranceCompany, // CRITICAL: Add insuranceCompany field for handler compatibility
        insuranceCompanyId: insuranceCompanyId, // Store payer ID
        status: 'active' as const,
        emergencyContact: {
          name: emergencyContactName,
          phone: emergencyContactPhone,
          relation: emergencyContactRelation
        },
        medicalInfo: {
          allergies: allergies.split(',').map(a => a.trim()).filter(a => a),
          medications: currentMedications.split(',').map(m => m.trim()).filter(m => m),
          conditions: medicalConditions.split(',').map(c => c.trim()).filter(c => c)
        },
        appointments: [],
        documents: [],
        nextAppointment: null,
        totalVisits: 0,
        outstandingBalance: 0,
        riskLevel: 'low' as const,
        lastVisit: '',
        // Additional fields
        gender,
        insuranceId,
        groupNumber,
        policyHolderName,
        policyHolderRelationship,
        secondaryInsurance,
        secondaryInsuranceCompanyId: secondaryInsuranceCompanyId || null,
        secondaryInsuranceId,
        secondaryGroupNumber,
        secondaryPolicyHolderName,
        secondaryPolicyHolderRelationship,
        previousSurgeries,
        familyHistory
      };

      onSubmit(patientData);
      
      // Reset form
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setGender('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCity('');
      setState('');
      setZipCode('');
      setEmergencyContactName('');
      setEmergencyContactPhone('');
      setEmergencyContactRelation('');
      setInsuranceCompany('');
      setInsuranceCompanyId('');
      setInsuranceId('');
      setPreferredProvider('');
      setPrimaryPractice('');
      setGroupNumber('');
      setPolicyHolderName('');
      setPolicyHolderRelationship('');
      setSecondaryInsurance('');
      setSecondaryInsuranceId('');
      setAllergies('');
      setCurrentMedications('');
      setMedicalConditions('');
      setPreviousSurgeries('');
      setFamilyHistory('');
      setErrors({});
    } catch (error) {
      console.error('Error submitting patient registration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      'First Name,Last Name,Date of Birth,Gender,Phone,Email,Address,City,State,Zip Code,Emergency Contact Name,Emergency Contact Phone,Emergency Contact Relation,Insurance ID,Group Number,Policy Holder Name,Policy Holder Relationship,Allergies,Current Medications,Medical Conditions,Previous Surgeries,Family History',
      `${firstName || ''},${lastName || ''},${dateOfBirth || ''},${gender || ''},${phone || ''},${email || ''},${address || ''},${city || ''},${state || ''},${zipCode || ''},${emergencyContactName || ''},${emergencyContactPhone || ''},${emergencyContactRelation || ''},${insuranceId || ''},${groupNumber || ''},${policyHolderName || ''},${policyHolderRelationship || ''},${allergies || ''},${currentMedications || ''},${medicalConditions || ''},${previousSurgeries || ''},${familyHistory || ''}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-registration-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Patient registration data has been exported to CSV.",
    });
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = [
      'First Name,Last Name,Date of Birth,Gender,Phone,Email,Address,City,State,Zip Code,Emergency Contact Name,Emergency Contact Phone,Emergency Contact Relation,Insurance ID,Group Number,Policy Holder Name,Policy Holder Relationship,Allergies,Current Medications,Medical Conditions,Previous Surgeries,Family History',
      'John,Doe,1990-01-15,Male,(555) 123-4567,john.doe@example.com,123 Main St,New York,NY,10001,Jane Doe,(555) 987-6543,Spouse,ABC123456789,GRP001,John Doe,Self,Penicillin,Ibuprofen,Hypertension,Appendectomy,Heart disease',
      'Jane,Smith,1985-05-20,Female,(555) 234-5678,jane.smith@example.com,456 Oak Ave,Los Angeles,CA,90001,John Smith,(555) 876-5432,Spouse,DEF987654321,GRP002,Jane Smith,Self,None,Metformin,Diabetes,None,Diabetes'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patient-registration-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
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
        const values = lines[1].split(',').map(v => v.trim());

        // Map CSV columns to form fields
        const getValue = (headerName: string) => {
          const index = headers.indexOf(headerName);
          return index >= 0 ? values[index] : '';
        };

        // Populate form fields from CSV
        setFirstName(getValue('first name') || getValue('firstname') || '');
        setLastName(getValue('last name') || getValue('lastname') || '');
        setDateOfBirth(getValue('date of birth') || getValue('dob') || getValue('dateofbirth') || '');
        setGender(getValue('gender') || '');
        setPhone(getValue('phone') || getValue('phone number') || '');
        setEmail(getValue('email') || getValue('email address') || '');
        setAddress(getValue('address') || getValue('street address') || '');
        setCity(getValue('city') || '');
        setState(getValue('state') || '');
        setZipCode(getValue('zip code') || getValue('zipcode') || getValue('zip') || '');
        setEmergencyContactName(getValue('emergency contact name') || getValue('emergencycontactname') || '');
        setEmergencyContactPhone(getValue('emergency contact phone') || getValue('emergencycontactphone') || '');
        setEmergencyContactRelation(getValue('emergency contact relation') || getValue('emergencycontactrelation') || '');
        setInsuranceId(getValue('insurance id') || getValue('insuranceid') || getValue('member id') || '');
        setGroupNumber(getValue('group number') || getValue('groupnumber') || '');
        setPolicyHolderName(getValue('policy holder name') || getValue('policyholdername') || '');
        setPolicyHolderRelationship(getValue('policy holder relationship') || getValue('policyholderrelationship') || '');
        setAllergies(getValue('allergies') || '');
        setCurrentMedications(getValue('current medications') || getValue('medications') || '');
        setMedicalConditions(getValue('medical conditions') || getValue('conditions') || '');
        setPreviousSurgeries(getValue('previous surgeries') || getValue('surgeries') || '');
        setFamilyHistory(getValue('family history') || getValue('familyhistory') || '');

        toast({
          title: "CSV Imported",
          description: "Patient data has been loaded from CSV. Please review and complete any missing fields.",
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

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setFirstName('');
    setLastName('');
    setDateOfBirth('');
    setGender('');
    setSsn('');
    setMaritalStatus('');
    setLanguage('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCity('');
    setState('');
    setZipCode('');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setEmergencyContactRelation('');
    setInsuranceCompany('');
      setInsuranceCompanyId('');
    setInsuranceId('');
    setGroupNumber('');
    setPolicyHolderName('');
    setPolicyHolderRelationship('');
    setSecondaryInsurance('');
    setSecondaryInsuranceCompanyId('');
    setSecondaryInsuranceId('');
    setSecondaryGroupNumber('');
    setSecondaryPolicyHolderName('');
    setSecondaryPolicyHolderRelationship('');
    setAllergies('');
    setCurrentMedications('');
    setMedicalConditions('');
    setPreviousSurgeries('');
    setFamilyHistory('');
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <User className="h-6 w-6 mr-2 text-blue-600" />
            Patient Registration
          </DialogTitle>
          <DialogDescription>
            Register a new patient with complete information including contact details, insurance, and medical history.
          </DialogDescription>
        </DialogHeader>
        
        {/* CSV Import/Export Actions - Prominent Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">CSV Operations</h3>
              <p className="text-sm text-blue-700">Import patient data from CSV or export current form data</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="default"
                onClick={handleExportCSV}
                className="bg-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={handleDownloadSampleCSV}
                className="bg-white"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Sample CSV
              </Button>
              <Button
                variant="default"
                size="default"
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFirstName(v);
                      setFieldError('firstName', v.trim() ? undefined : 'First name is required');
                    }}
                      placeholder="Enter first name"
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLastName(v);
                      setFieldError('lastName', v.trim() ? undefined : 'Last name is required');
                    }}
                      placeholder="Enter last name"
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDateOfBirth(v);
                      setFieldError('dateOfBirth', v ? undefined : 'Date of birth is required');
                    }}
                      className={errors.dateOfBirth ? 'border-red-500' : ''}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className={errors.gender ? 'border-red-500' : ''} onBlur={() => setFieldError('gender', gender ? undefined : 'Gender is required')}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-sm text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.gender}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-green-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={phone}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPhone(v);
                      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                      setFieldError('phone', v.trim() ? (phoneRegex.test(v) ? undefined : 'Please enter a valid phone number') : 'Phone number is required');
                    }}
                      placeholder="(555) 123-4567"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEmail(v);
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      setFieldError('email', v.trim() ? (emailRegex.test(v) ? undefined : 'Please enter a valid email address') : 'Email is required');
                    }}
                      placeholder="patient@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAddress(v);
                      setFieldError('address', v.trim() ? undefined : 'Address is required');
                    }}
                    placeholder="123 Main Street"
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.address}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={city}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCity(v);
                      setFieldError('city', v.trim() ? undefined : 'City is required');
                    }}
                      placeholder="Anytown"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.city}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={state}
                    onChange={(e) => {
                      const v = e.target.value;
                      setState(v);
                      setFieldError('state', v.trim() ? undefined : 'State is required');
                    }}
                      placeholder="CA"
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.state}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code *</Label>
                    <Input
                      id="zipCode"
                      value={zipCode}
                    onChange={(e) => {
                      const v = e.target.value;
                      setZipCode(v);
                      setFieldError('zipCode', v.trim() ? undefined : 'Zip code is required');
                    }}
                      placeholder="12345"
                      className={errors.zipCode ? 'border-red-500' : ''}
                    />
                    {errors.zipCode && (
                      <p className="text-sm text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.zipCode}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                    Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        placeholder="(555) 987-6543"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactRelation">Relationship</Label>
                      <Select value={emergencyContactRelation} onValueChange={setEmergencyContactRelation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-emerald-600" />
                  Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insuranceCompany">Primary Insurance Company *</Label>
                    <Select
                      value={insuranceCompanyId}
                      onValueChange={(value) => {
                        const payer = payers.find(p => p.id === value);
                        setInsuranceCompanyId(value);
                        setInsuranceCompany(payer?.name || '');
                        setFieldError('insuranceCompany', value ? undefined : 'Insurance company is required');
                    }}
                      disabled={isLoadingPayers}
                    >
                      <SelectTrigger className={errors.insuranceCompany ? 'border-red-500' : ''}>
                        <SelectValue placeholder={isLoadingPayers ? "Loading payers..." : "Select insurance company"} />
                      </SelectTrigger>
                      <SelectContent>
                        {payers.length === 0 && !isLoadingPayers ? (
                          <SelectItem value="none" disabled>No payers found. Please add payers in Customer Setup.</SelectItem>
                        ) : (
                          payers.map(payer => (
                            <SelectItem key={payer.id} value={payer.id}>
                              {payer.name} {payer.plan_name ? `- ${payer.plan_name}` : ''}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.insuranceCompany && (
                      <p className="text-sm text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.insuranceCompany}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceId">Insurance ID *</Label>
                    <Input
                      id="insuranceId"
                      value={insuranceId}
                    onChange={(e) => {
                      const v = e.target.value;
                      setInsuranceId(v);
                      setFieldError('insuranceId', v.trim() ? undefined : 'Insurance ID is required');
                    }}
                      placeholder="ABC123456789"
                      className={errors.insuranceId ? 'border-red-500' : ''}
                    />
                    {errors.insuranceId && (
                      <p className="text-sm text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.insuranceId}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupNumber">Group Number</Label>
                    <Input
                      id="groupNumber"
                      value={groupNumber}
                      onChange={(e) => setGroupNumber(e.target.value)}
                      placeholder="Group number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policyHolderName">Policy Holder Name</Label>
                    <Input
                      id="policyHolderName"
                      value={policyHolderName}
                      onChange={(e) => setPolicyHolderName(e.target.value)}
                      placeholder="Policy holder name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policyHolderRelationship">Policy Holder Relationship</Label>
                    <Select value={policyHolderRelationship} onValueChange={setPolicyHolderRelationship}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Self</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-blue-500" />
                    Secondary Insurance (Optional)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondaryInsuranceCompany">Secondary Insurance Company</Label>
                      <Select
                        value={secondaryInsuranceCompanyId}
                        onValueChange={(value) => {
                          const payer = payers.find(p => p.id === value);
                          setSecondaryInsuranceCompanyId(value);
                          setSecondaryInsurance(payer?.name || '');
                        }}
                        disabled={isLoadingPayers}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingPayers ? "Loading payers..." : "Select insurance company"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {payers.length === 0 && !isLoadingPayers ? (
                            <SelectItem value="no-payers" disabled>No payers found. Please add payers in Customer Setup.</SelectItem>
                          ) : (
                            payers.map(payer => (
                              <SelectItem key={payer.id} value={payer.id}>
                                {payer.name} {payer.plan_name ? `- ${payer.plan_name}` : ''}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryInsuranceId">Secondary Insurance ID</Label>
                      <Input
                        id="secondaryInsuranceId"
                        value={secondaryInsuranceId}
                        onChange={(e) => setSecondaryInsuranceId(e.target.value)}
                        placeholder="ABC123456789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryGroupNumber">Group Number</Label>
                      <Input
                        id="secondaryGroupNumber"
                        value={secondaryGroupNumber}
                        onChange={(e) => setSecondaryGroupNumber(e.target.value)}
                        placeholder="Group number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryPolicyHolderName">Policy Holder Name</Label>
                      <Input
                        id="secondaryPolicyHolderName"
                        value={secondaryPolicyHolderName}
                        onChange={(e) => setSecondaryPolicyHolderName(e.target.value)}
                        placeholder="Policy holder name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryPolicyHolderRelationship">Policy Holder Relationship</Label>
                      <Select value={secondaryPolicyHolderRelationship} onValueChange={setSecondaryPolicyHolderRelationship}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="self">Self</SelectItem>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2 text-purple-600" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies">Known Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="List any known allergies (separate with commas)"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentMedications">Current Medications</Label>
                  <Textarea
                    id="currentMedications"
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    placeholder="List current medications (separate with commas)"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medicalConditions">Medical Conditions</Label>
                  <Textarea
                    id="medicalConditions"
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    placeholder="List any medical conditions (separate with commas)"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="previousSurgeries">Previous Surgeries</Label>
                  <Textarea
                    id="previousSurgeries"
                    value={previousSurgeries}
                    onChange={(e) => setPreviousSurgeries(e.target.value)}
                    placeholder="List any previous surgeries"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="familyHistory">Family Medical History</Label>
                  <Textarea
                    id="familyHistory"
                    value={familyHistory}
                    onChange={(e) => setFamilyHistory(e.target.value)}
                    placeholder="List relevant family medical history"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Register Patient
                  </>
                )}
              </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
