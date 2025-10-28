import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Building, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Shield,
  User
} from 'lucide-react';

const mockInsuranceProviders = [
  {
    id: 'INS001',
    name: 'Blue Cross Blue Shield',
    type: 'Commercial',
    eligibility: 'Active'
  },
  {
    id: 'INS002',
    name: 'Aetna',
    type: 'Commercial',
    eligibility: 'Active'
  },
  {
    id: 'INS003',
    name: 'Medicare',
    type: 'Government',
    eligibility: 'Active'
  },
  {
    id: 'INS004',
    name: 'Cigna',
    type: 'Commercial',
    eligibility: 'Active'
  },
  {
    id: 'INS005',
    name: 'UnitedHealth',
    type: 'Commercial',
    eligibility: 'Active'
  }
];

const mockProviders = [
  { id: 'PROV001', name: 'Dr. Smith', specialty: 'Internal Medicine' },
  { id: 'PROV002', name: 'Dr. Johnson', specialty: 'Endocrinology' },
  { id: 'PROV003', name: 'Dr. Davis', specialty: 'Cardiology' },
  { id: 'PROV004', name: 'Dr. Wilson', specialty: 'Family Medicine' },
  { id: 'PROV005', name: 'Dr. Anderson', specialty: 'Internal Medicine' }
];

interface InsuranceStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function InsuranceStep({ data, onUpdate }: InsuranceStepProps) {
  const [primaryInsurance, setPrimaryInsurance] = useState(data.insurance?.primary || null);
  const [secondaryInsurance, setSecondaryInsurance] = useState(data.insurance?.secondary || null);
  const [authNumber, setAuthNumber] = useState(data.insurance?.authNumber || '');
  const [eligibilityStatus, setEligibilityStatus] = useState('checking');
  const [selectedProvider, setSelectedProvider] = useState(data.provider || null);

  const handlePrimaryInsuranceChange = (insuranceId: string) => {
    const insurance = mockInsuranceProviders.find(ins => ins.id === insuranceId);
    setPrimaryInsurance(insurance);
    updateInsurance({ primary: insurance });
    
    // Simulate eligibility check
    setEligibilityStatus('checking');
    setTimeout(() => {
      setEligibilityStatus('active');
    }, 2000);
  };

  const handleSecondaryInsuranceChange = (insuranceId: string) => {
    if (insuranceId === 'none') {
      setSecondaryInsurance(null);
      updateInsurance({ secondary: null });
    } else {
      const insurance = mockInsuranceProviders.find(ins => ins.id === insuranceId);
      setSecondaryInsurance(insurance);
      updateInsurance({ secondary: insurance });
    }
  };

  const handleProviderChange = (providerId: string) => {
    const provider = mockProviders.find(prov => prov.id === providerId);
    setSelectedProvider(provider);
    onUpdate({ provider });
  };

  const updateInsurance = (updates: any) => {
    const insuranceData = {
      primary: primaryInsurance,
      secondary: secondaryInsurance,
      authNumber,
      ...updates
    };
    onUpdate({ insurance: insuranceData });
  };

  const handleAuthNumberChange = (value: string) => {
    setAuthNumber(value);
    updateInsurance({ authNumber: value });
  };

  const getEligibilityBadge = () => {
    switch (eligibilityStatus) {
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <div className="space-y-2">
        <Label htmlFor="provider">Provider</Label>
        <Select value={selectedProvider?.id || ''} onValueChange={handleProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            {mockProviders.map(provider => (
              <SelectItem key={provider.id} value={provider.id}>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{provider.name}</span>
                  <span className="text-gray-500">- {provider.specialty}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Primary Insurance */}
      <div className="space-y-2">
        <Label htmlFor="primaryInsurance">Primary Insurance *</Label>
        <Select value={primaryInsurance?.id || ''} onValueChange={handlePrimaryInsuranceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select primary insurance" />
          </SelectTrigger>
          <SelectContent>
            {mockInsuranceProviders.map(insurance => (
              <SelectItem key={insurance.id} value={insurance.id}>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>{insurance.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {insurance.type}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Primary Insurance Details */}
      {primaryInsurance && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Primary Insurance</h3>
                  <p className="text-blue-700">{primaryInsurance.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getEligibilityBadge()}
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  {primaryInsurance.type}
                </Badge>
              </div>
            </div>
            
            {eligibilityStatus === 'checking' && (
              <div className="mt-3 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-600">Verifying eligibility...</span>
              </div>
            )}
            
            {eligibilityStatus === 'active' && (
              <div className="mt-3 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Eligibility verified</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Secondary Insurance */}
      <div className="space-y-2">
        <Label htmlFor="secondaryInsurance">Secondary Insurance (Optional)</Label>
        <Select value={secondaryInsurance?.id || 'none'} onValueChange={handleSecondaryInsuranceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select secondary insurance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {mockInsuranceProviders.map(insurance => (
              <SelectItem key={insurance.id} value={insurance.id}>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>{insurance.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {insurance.type}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Secondary Insurance Details */}
      {secondaryInsurance && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">Secondary Insurance</h3>
                  <p className="text-purple-700">{secondaryInsurance.name}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-purple-700 border-purple-300">
                {secondaryInsurance.type}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Authorization Number */}
      <div className="space-y-2">
        <Label htmlFor="authNumber">Prior Authorization Number</Label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="authNumber"
            placeholder="Enter authorization number if applicable"
            value={authNumber}
            onChange={(e) => handleAuthNumberChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {authNumber && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">Authorization number added</span>
          </div>
        )}
      </div>

      {/* Insurance Summary */}
      {(primaryInsurance || secondaryInsurance) && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Insurance Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Primary:</span>
                <span className="font-medium">
                  {primaryInsurance ? primaryInsurance.name : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Secondary:</span>
                <span className="font-medium">
                  {secondaryInsurance ? secondaryInsurance.name : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium">
                  {selectedProvider ? selectedProvider.name : 'Not selected'}
                </span>
              </div>
              {authNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Auth Number:</span>
                  <span className="font-medium">{authNumber}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Messages */}
      {!primaryInsurance && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              Primary insurance is required
            </span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Please select a primary insurance provider to continue.
          </p>
        </div>
      )}
    </div>
  );
}
