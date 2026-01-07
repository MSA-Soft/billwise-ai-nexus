import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InsuranceStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function InsuranceStep({ data, onUpdate }: InsuranceStepProps) {
  const { toast } = useToast();
  const [primaryInsurance, setPrimaryInsurance] = useState(data.insurance?.primary || null);
  const [secondaryInsurance, setSecondaryInsurance] = useState(data.insurance?.secondary || null);
  const [authNumber, setAuthNumber] = useState(data.insurance?.authNumber || '');
  const [eligibilityStatus, setEligibilityStatus] = useState('checking');
  const [selectedProvider, setSelectedProvider] = useState(data.provider || null);
  
  // Data from Customer Setup
  const [payers, setPayers] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoadingPayers, setIsLoadingPayers] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);

  // Fetch payers and providers from Customer Setup
  useEffect(() => {
    fetchPayers();
    fetchProviders();
  }, []);

  const fetchPayers = async () => {
    try {
      setIsLoadingPayers(true);
      const { data: payersData, error } = await supabase
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

      const transformedPayers = (payersData || []).map((p: any) => ({
        id: p.id,
        name: p.name || '',
        type: p.payer_type || 'Commercial',
        planName: p.plan_name || '',
        eligibility: 'Active'
      }));

      setPayers(transformedPayers);
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
      const { data: providersData, error } = await supabase
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

      const transformedProviders = (providersData || []).map((p: any) => 
        ({
        id: p.id,
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        firstName: p.first_name || '',
        lastName: p.last_name || '',
        specialty: p.taxonomy_specialty || '',
        credentials: p.credentials || ''
      }));

      setProviders(transformedProviders);
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

  const handlePrimaryInsuranceChange = (insuranceId: string) => {
    const insurance = payers.find(ins => ins.id === insuranceId);
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
      const insurance = payers.find(ins => ins.id === insuranceId);
      setSecondaryInsurance(insurance);
      updateInsurance({ secondary: insurance });
    }
  };

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find(prov => prov.id === providerId);
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
        <Select 
          value={selectedProvider?.id || ''} 
          onValueChange={handleProviderChange}
          disabled={isLoadingProviders}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingProviders ? "Loading providers..." : "Select provider"} />
          </SelectTrigger>
          <SelectContent>
            {providers.length === 0 && !isLoadingProviders ? (
              <SelectItem value="none" disabled>No providers found. Please add providers in Customer Setup.</SelectItem>
            ) : (
              providers.map(provider => (
                <SelectItem key={provider.id} value={provider.id}>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{provider.name}</span>
                    {provider.credentials && <span className="text-gray-500">, {provider.credentials}</span>}
                    {provider.specialty && <span className="text-gray-500">- {provider.specialty}</span>}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Primary Insurance */}
      <div className="space-y-2">
        <Label htmlFor="primaryInsurance">Primary Insurance *</Label>
        <Select 
          value={primaryInsurance?.id || ''} 
          onValueChange={handlePrimaryInsuranceChange}
          disabled={isLoadingPayers}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingPayers ? "Loading payers..." : "Select primary insurance"} />
          </SelectTrigger>
          <SelectContent>
            {payers.length === 0 && !isLoadingPayers ? (
              <SelectItem value="none" disabled>No payers found. Please add payers in Customer Setup.</SelectItem>
            ) : (
              payers.map(insurance => (
                <SelectItem key={insurance.id} value={insurance.id}>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>{insurance.name}</span>
                    {insurance.planName && <span className="text-gray-500">- {insurance.planName}</span>}
                    <Badge variant="outline" className="text-xs">
                      {insurance.type}
                    </Badge>
                  </div>
                </SelectItem>
              ))
            )}
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
        <Select 
          value={secondaryInsurance?.id || 'none'} 
          onValueChange={handleSecondaryInsuranceChange}
          disabled={isLoadingPayers}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingPayers ? "Loading payers..." : "Select secondary insurance"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {payers.map(insurance => (
              <SelectItem key={insurance.id} value={insurance.id}>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>{insurance.name}</span>
                  {insurance.planName && <span className="text-gray-500">- {insurance.planName}</span>}
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
