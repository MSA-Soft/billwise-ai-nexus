import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Save,
  X,
  CreditCard,
  User,
  Plus
} from 'lucide-react';

interface EditInsuranceFormProps {
  patientId: string;
  currentData: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (insuranceData: any) => void;
}

export function EditInsuranceForm({ patientId, currentData, isOpen, onClose, onSave }: EditInsuranceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Primary Insurance
  const [insurance_company, setInsurance_company] = useState('');
  const [insurance_id, setInsurance_id] = useState('');
  const [group_number, setGroup_number] = useState('');
  const [policy_holder_name, setPolicy_holder_name] = useState('');
  const [policy_holder_relationship, setPolicy_holder_relationship] = useState('');
  const [effective_date, setEffective_date] = useState('');
  const [expiration_date, setExpiration_date] = useState('');

  // Secondary Insurance
  const [secondary_insurance_company, setSecondary_insurance_company] = useState('');
  const [secondary_insurance_id, setSecondary_insurance_id] = useState('');
  const [secondary_group_number, setSecondary_group_number] = useState('');
  const [secondary_policy_holder_name, setSecondary_policy_holder_name] = useState('');
  const [secondary_policy_holder_relationship, setSecondary_policy_holder_relationship] = useState('');

  // Initialize form with current data
  useEffect(() => {
    if (currentData) {
      setInsurance_company(currentData.insurance || '');
      setInsurance_id(currentData.insuranceId || '');
      setGroup_number(currentData.groupNumber || '');
      setPolicy_holder_name(currentData.policyHolderName || '');
      setPolicy_holder_relationship(currentData.policyHolderRelationship || '');
      setEffective_date(currentData.effectiveDate || '');
      setExpiration_date(currentData.expirationDate || '');
      
      setSecondary_insurance_company(currentData.secondaryInsurance || '');
      setSecondary_insurance_id(currentData.secondaryInsuranceId || '');
      setSecondary_group_number(currentData.secondaryGroupNumber || '');
      setSecondary_policy_holder_name(currentData.secondaryPolicyHolderName || '');
      setSecondary_policy_holder_relationship(currentData.secondaryPolicyHolderRelationship || '');
    }
  }, [currentData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!insurance_company.trim()) newErrors.insurance_company = 'Primary insurance company is required';
    if (!insurance_id.trim()) newErrors.insurance_id = 'Primary insurance ID is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const insuranceData = {
        insurance_company,
        insurance_id,
        group_number,
        policy_holder_name,
        policy_holder_relationship,
        effective_date,
        expiration_date,
        secondary_insurance_company,
        secondary_insurance_id,
        secondary_group_number,
        secondary_policy_holder_name,
        secondary_policy_holder_relationship
      };

      onSave(insuranceData);
    } catch (error) {
      console.error('Error saving insurance information:', error);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Shield className="h-6 w-6 mr-2 text-blue-600" />
            Edit Insurance Information
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Primary Insurance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Primary Insurance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insurance_company">Insurance Company *</Label>
                    <Input
                      id="insurance_company"
                      value={insurance_company}
                      onChange={(e) => setInsurance_company(e.target.value)}
                      placeholder="Blue Cross Blue Shield"
                      className={errors.insurance_company ? 'border-red-500' : ''}
                    />
                    {errors.insurance_company && (
                      <p className="text-sm text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.insurance_company}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurance_id">Insurance ID *</Label>
                    <Input
                      id="insurance_id"
                      value={insurance_id}
                      onChange={(e) => setInsurance_id(e.target.value)}
                      placeholder="ABC123456789"
                      className={errors.insurance_id ? 'border-red-500' : ''}
                    />
                    {errors.insurance_id && (
                      <p className="text-sm text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.insurance_id}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group_number">Group Number</Label>
                    <Input
                      id="group_number"
                      value={group_number}
                      onChange={(e) => setGroup_number(e.target.value)}
                      placeholder="Group number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policy_holder_name">Policy Holder Name</Label>
                    <Input
                      id="policy_holder_name"
                      value={policy_holder_name}
                      onChange={(e) => setPolicy_holder_name(e.target.value)}
                      placeholder="Policy holder name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policy_holder_relationship">Policy Holder Relationship</Label>
                    <Select value={policy_holder_relationship} onValueChange={setPolicy_holder_relationship}>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="effective_date">Effective Date</Label>
                    <Input
                      id="effective_date"
                      type="date"
                      value={effective_date}
                      onChange={(e) => setEffective_date(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiration_date">Expiration Date</Label>
                    <Input
                      id="expiration_date"
                      type="date"
                      value={expiration_date}
                      onChange={(e) => setExpiration_date(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Insurance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Plus className="h-5 w-5 mr-2 text-green-600" />
                Secondary Insurance (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="secondary_insurance_company">Secondary Insurance Company</Label>
                    <Input
                      id="secondary_insurance_company"
                      value={secondary_insurance_company}
                      onChange={(e) => setSecondary_insurance_company(e.target.value)}
                      placeholder="Secondary insurance company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_insurance_id">Secondary Insurance ID</Label>
                    <Input
                      id="secondary_insurance_id"
                      value={secondary_insurance_id}
                      onChange={(e) => setSecondary_insurance_id(e.target.value)}
                      placeholder="Secondary insurance ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_group_number">Secondary Group Number</Label>
                    <Input
                      id="secondary_group_number"
                      value={secondary_group_number}
                      onChange={(e) => setSecondary_group_number(e.target.value)}
                      placeholder="Secondary group number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_policy_holder_name">Secondary Policy Holder Name</Label>
                    <Input
                      id="secondary_policy_holder_name"
                      value={secondary_policy_holder_name}
                      onChange={(e) => setSecondary_policy_holder_name(e.target.value)}
                      placeholder="Secondary policy holder name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_policy_holder_relationship">Secondary Policy Holder Relationship</Label>
                    <Select value={secondary_policy_holder_relationship} onValueChange={setSecondary_policy_holder_relationship}>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
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
                Save Insurance Information
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
