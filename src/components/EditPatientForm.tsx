import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ChevronRight,
  Check,
  X,
  Save
} from 'lucide-react';

interface PatientData {
  id: string;
  name: string;
  age: number;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  insurance: string;
  status: 'active' | 'inactive';
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
  nextAppointment?: string | null;
  totalVisits?: number;
  outstandingBalance?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  preferredProvider?: string;
}

interface EditPatientFormProps {
  patient: PatientData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: PatientData) => void;
}

export function EditPatientForm({ patient, isOpen, onClose, onSave }: EditPatientFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Basic Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [ssn, setSsn] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [race, setRace] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [language, setLanguage] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');

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
  const [insuranceId, setInsuranceId] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [policyHolderName, setPolicyHolderName] = useState('');
  const [policyHolderRelationship, setPolicyHolderRelationship] = useState('');
  const [secondaryInsurance, setSecondaryInsurance] = useState('');
  const [secondaryInsuranceId, setSecondaryInsuranceId] = useState('');

  // Medical Information
  const [allergies, setAllergies] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [previousSurgeries, setPreviousSurgeries] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');

  // Initialize form with patient data
  useEffect(() => {
    if (patient) {
      // Parse name
      const nameParts = patient.name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      
      // Basic info
      setDateOfBirth(patient.dateOfBirth || '');
      setGender((patient as any).gender || '');
      setSsn((patient as any).ssn || '');
      setMaritalStatus((patient as any).maritalStatus || '');
      setRace((patient as any).race || '');
      setEthnicity((patient as any).ethnicity || '');
      setLanguage((patient as any).language || '');
      setStatus(patient.status || 'active');
      setRiskLevel(patient.riskLevel || 'low');
      
      // Contact info
      setPhone(patient.phone || '');
      setEmail(patient.email || '');
      
      // Parse address - handle both string format and separate fields
      if (patient.address) {
        if (typeof patient.address === 'string' && patient.address.includes(',')) {
          // Parse "address, city, state zip" format
          const addressParts = patient.address.split(',');
          if (addressParts.length >= 3) {
            setAddress(addressParts[0].trim());
            setCity(addressParts[1].trim());
            const stateZip = addressParts[2].trim().split(' ');
            setState(stateZip[0] || '');
            setZipCode(stateZip.slice(1).join(' ') || '');
          } else {
            setAddress(patient.address);
          }
        } else {
          setAddress(patient.address);
        }
      }
      
      // Use separate fields if available
      if ((patient as any).city) setCity((patient as any).city);
      if ((patient as any).state) setState((patient as any).state);
      if ((patient as any).zipCode) setZipCode((patient as any).zipCode);
      
      // Insurance
      setInsuranceCompany(patient.insurance || (patient as any).insuranceCompany || '');
      setInsuranceId((patient as any).insuranceId || '');
      setGroupNumber((patient as any).groupNumber || '');
      setPolicyHolderName((patient as any).policyHolderName || '');
      setPolicyHolderRelationship((patient as any).policyHolderRelationship || '');
      setSecondaryInsurance((patient as any).secondaryInsurance || '');
      setSecondaryInsuranceId((patient as any).secondaryInsuranceId || '');
      
      // Emergency contact
      if (patient.emergencyContact) {
        setEmergencyContactName(patient.emergencyContact.name || '');
        setEmergencyContactPhone(patient.emergencyContact.phone || '');
        setEmergencyContactRelation(patient.emergencyContact.relation || '');
      }
      
      // Medical info
      if (patient.medicalInfo) {
        setAllergies(patient.medicalInfo.allergies?.join(', ') || '');
        setCurrentMedications(patient.medicalInfo.medications?.join(', ') || '');
        setMedicalConditions(patient.medicalInfo.conditions?.join(', ') || '');
      }
      
      // Additional medical fields
      setPreviousSurgeries((patient as any).previousSurgeries || '');
      setFamilyHistory((patient as any).familyHistory || '');
    }
  }, [patient]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // For EDIT mode, we're more lenient - only validate formats, not required fields
    // since we're editing existing data

    // Basic Information validation - only validate format if provided
    if (firstName.trim() && firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    if (lastName.trim() && lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    // Date of birth validation - only if provided
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(dob.getTime())) {
        newErrors.dateOfBirth = 'Please enter a valid date';
      } else if (dob > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      } else {
        // Validate that date is not too far in the past
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 150);
        if (dob < minDate) {
          newErrors.dateOfBirth = 'Please enter a valid date of birth';
        }
      }
    }

    // Contact Information validation - only validate format if provided
    // Email format validation
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Phone format validation
    if (phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    // Address validation - only if address is provided, city/state/zip are optional
    // No strict validation for address fields in edit mode

    // Insurance validation - optional in edit mode
    // No strict validation

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
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

      const updatedPatient: any = {
        ...patient,
        id: patient.id, // Ensure ID is preserved
        name: `${firstName} ${lastName}`.trim(),
        firstName, // Add for database mapping
        lastName, // Add for database mapping
        age: calculateAge(dateOfBirth),
        dateOfBirth,
        phone,
        email,
        address, // Will be parsed in handlePatientUpdate
        city, // Separate field for database
        state, // Separate field for database
        zipCode, // Separate field for database
        insurance: insuranceCompany,
        insuranceCompany, // For database mapping
        status,
        riskLevel,
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
        // Additional fields for database
        gender,
        ssn,
        maritalStatus,
        race,
        ethnicity,
        language,
        insuranceId,
        groupNumber,
        policyHolderName,
        policyHolderRelationship,
        secondaryInsurance,
        secondaryInsuranceId,
        previousSurgeries,
        familyHistory
      };

      // Call async onSave and handle errors
      await onSave(updatedPatient);
    } catch (error: any) {
      console.error('Error updating patient:', error);
      // Error is already handled in handlePatientUpdate, but we can add additional handling here if needed
      if (error.message) {
        setErrors({ submit: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <User className="h-6 w-6 mr-2 text-blue-600" />
            Edit Patient: {patient.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="insurance" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Insurance
            </TabsTrigger>
            <TabsTrigger value="medical" className="flex items-center">
              <Stethoscope className="h-4 w-4 mr-2" />
              Medical
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
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
                      onChange={(e) => setLastName(e.target.value)}
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
                      onChange={(e) => setDateOfBirth(e.target.value)}
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
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value: 'active' | 'inactive') => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="riskLevel">Risk Level</Label>
                    <Select value={riskLevel} onValueChange={(value: 'low' | 'medium' | 'high') => setRiskLevel(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ssn">Social Security Number</Label>
                    <Input
                      id="ssn"
                      value={ssn}
                      onChange={(e) => setSsn(e.target.value)}
                      placeholder="XXX-XX-XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">Marital Status</Label>
                    <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="separated">Separated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="race">Race</Label>
                    <Select value={race} onValueChange={setRace}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select race" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="american-indian">American Indian or Alaska Native</SelectItem>
                        <SelectItem value="asian">Asian</SelectItem>
                        <SelectItem value="black">Black or African American</SelectItem>
                        <SelectItem value="native-hawaiian">Native Hawaiian or Other Pacific Islander</SelectItem>
                        <SelectItem value="white">White</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ethnicity">Ethnicity</Label>
                    <Select value={ethnicity} onValueChange={setEthnicity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ethnicity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hispanic">Hispanic or Latino</SelectItem>
                        <SelectItem value="not-hispanic">Not Hispanic or Latino</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-green-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
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
                      onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setAddress(e.target.value)}
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
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Anytown"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="12345"
                    />
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
          </TabsContent>

          <TabsContent value="insurance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-emerald-600" />
                  Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insuranceCompany">Primary Insurance Company *</Label>
                    <Input
                      id="insuranceCompany"
                      value={insuranceCompany}
                      onChange={(e) => setInsuranceCompany(e.target.value)}
                      placeholder="Blue Cross Blue Shield"
                      className={errors.insuranceCompany ? 'border-red-500' : ''}
                    />
                    {errors.insuranceCompany && (
                      <p className="text-sm text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.insuranceCompany}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceId">Insurance ID</Label>
                    <Input
                      id="insuranceId"
                      value={insuranceId}
                      onChange={(e) => setInsuranceId(e.target.value)}
                      placeholder="ABC123456789"
                    />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondaryInsurance">Secondary Insurance Company</Label>
                      <Input
                        id="secondaryInsurance"
                        value={secondaryInsurance}
                        onChange={(e) => setSecondaryInsurance(e.target.value)}
                        placeholder="Secondary insurance company"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryInsuranceId">Secondary Insurance ID</Label>
                      <Input
                        id="secondaryInsuranceId"
                        value={secondaryInsuranceId}
                        onChange={(e) => setSecondaryInsuranceId(e.target.value)}
                        placeholder="Secondary insurance ID"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical" className="space-y-6">
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
          </TabsContent>
        </Tabs>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <div className="flex space-x-2">
            {activeTab !== 'basic' && (
              <Button 
                variant="outline" 
                onClick={() => {
                  const tabs = ['basic', 'contact', 'insurance', 'medical'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                  }
                }}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}
            {activeTab !== 'medical' ? (
              <Button 
                onClick={() => {
                  const tabs = ['basic', 'contact', 'insurance', 'medical'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                  }
                }}
                disabled={isSubmitting}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSave} 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
