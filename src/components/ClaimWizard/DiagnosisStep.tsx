import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Trash2, 
  Code, 
  Search,
  CheckCircle,
  Circle
} from 'lucide-react';

interface DiagnosisStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function DiagnosisStep({ data, onUpdate }: DiagnosisStepProps) {
  const { toast } = useToast();
  const [diagnoses, setDiagnoses] = useState(data.diagnoses || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [icdCodes, setIcdCodes] = useState<Array<{ code: string; description: string }>>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [filteredIcdCodes, setFilteredIcdCodes] = useState<Array<{ code: string; description: string }>>([]);

  // Fetch ICD codes from database
  useEffect(() => {
    const fetchIcdCodes = async () => {
      setIsLoadingCodes(true);
      try {
        const { data: codesData, error } = await supabase
          .from('diagnosis_codes' as any)
          .select('code, description')
          .eq('is_active', true)
          .order('code', { ascending: true })
          .limit(1000); // Limit to 1000 most common codes

        if (error) {
          console.error('Error fetching ICD codes:', error);
          toast({
            title: 'Error loading ICD codes',
            description: error.message,
            variant: 'destructive',
          });
          // Fallback to empty array
          setIcdCodes([]);
          return;
        }

        // Transform database records to match expected format
        const transformedCodes = (codesData || []).map((dbCode: any) => ({
          code: dbCode.code || '',
          description: dbCode.description || ''
        }));

        setIcdCodes(transformedCodes);
        console.log(`✅ Loaded ${transformedCodes.length} ICD codes from database`);
      } catch (error: any) {
        console.error('Error fetching ICD codes:', error);
        toast({
          title: 'Error loading ICD codes',
          description: error.message || 'Failed to load ICD codes',
          variant: 'destructive',
        });
        setIcdCodes([]);
      } finally {
        setIsLoadingCodes(false);
      }
    };

    fetchIcdCodes();
  }, []);

  // Filter ICD codes based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredIcdCodes(icdCodes);
      return;
    }

    const filtered = icdCodes.filter(icd =>
      icd.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      icd.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIcdCodes(filtered);
  }, [searchTerm, icdCodes]);

  const addDiagnosis = (icdCode: any) => {
    const newDiagnosis = {
      icdCode: icdCode.code,
      description: icdCode.description,
      primary: diagnoses.length === 0 // First diagnosis is primary by default
    };
    const updatedDiagnoses = [...diagnoses, newDiagnosis];
    setDiagnoses(updatedDiagnoses);
    onUpdate({ diagnoses: updatedDiagnoses });
  };

  const removeDiagnosis = (index: number) => {
    const updatedDiagnoses = diagnoses.filter((_, i) => i !== index);
    // If we removed the primary diagnosis, make the first remaining one primary
    if (updatedDiagnoses.length > 0 && diagnoses[index].primary) {
      updatedDiagnoses[0].primary = true;
    }
    setDiagnoses(updatedDiagnoses);
    onUpdate({ diagnoses: updatedDiagnoses });
  };

  const togglePrimary = (index: number) => {
    const updatedDiagnoses = diagnoses.map((diag, i) => ({
      ...diag,
      primary: i === index
    }));
    setDiagnoses(updatedDiagnoses);
    onUpdate({ diagnoses: updatedDiagnoses });
  };

  return (
    <div className="space-y-6">
      {/* ICD Code Search */}
      <div className="space-y-2">
        <Label htmlFor="icdSearch">Search ICD-10 Codes</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="icdSearch"
            placeholder="Search by code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Available ICD Codes */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">
          Available ICD-10 Codes ({filteredIcdCodes.length})
          {isLoadingCodes && <span className="text-sm text-gray-500 ml-2">(Loading...)</span>}
        </h3>
        {isLoadingCodes ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading ICD codes...</p>
          </div>
        ) : filteredIcdCodes.length === 0 ? (
          <div className="text-center py-8">
            <Code className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No ICD codes found</p>
            {searchTerm && <p className="text-xs text-gray-500 mt-1">Try a different search term</p>}
          </div>
        ) : (
          <div className="max-h-40 overflow-y-auto space-y-2">
            {filteredIcdCodes.map((icd) => (
            <Card key={icd.code} className="border-gray-200 hover:border-green-300 transition-colors">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded">
                      <Code className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{icd.code}</h4>
                      <p className="text-sm text-gray-600">{icd.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addDiagnosis(icd)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </div>

      {/* Selected Diagnoses */}
      {diagnoses.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">
            Selected Diagnoses ({diagnoses.length})
          </h3>
          
          <div className="space-y-3">
            {diagnoses.map((diagnosis, index) => (
              <Card key={index} className={`${
                diagnosis.primary 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-blue-200 bg-blue-50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${
                        diagnosis.primary ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <Code className={`h-4 w-4 ${
                          diagnosis.primary ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className={`font-medium ${
                          diagnosis.primary ? 'text-green-900' : 'text-blue-900'
                        }`}>
                          {diagnosis.icdCode}
                        </h4>
                        <p className={`text-sm ${
                          diagnosis.primary ? 'text-green-700' : 'text-blue-700'
                        }`}>
                          {diagnosis.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`primary-${index}`}
                          checked={diagnosis.primary}
                          onCheckedChange={() => togglePrimary(index)}
                        />
                        <Label 
                          htmlFor={`primary-${index}`} 
                          className={`text-sm font-medium ${
                            diagnosis.primary ? 'text-green-700' : 'text-blue-700'
                          }`}
                        >
                          Primary
                        </Label>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDiagnosis(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {diagnosis.primary && (
                    <div className="mt-3 flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        This is the primary diagnosis for this claim
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {diagnoses.length === 0 && (
        <div className="text-center py-8">
          <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No diagnoses added</h3>
          <p className="text-gray-600">Search and add diagnosis codes to continue.</p>
        </div>
      )}

      {/* Primary Diagnosis Warning */}
      {diagnoses.length > 0 && !diagnoses.some(d => d.primary) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Circle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Please select a primary diagnosis
            </span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            At least one diagnosis must be marked as primary for the claim.
          </p>
        </div>
      )}
    </div>
  );
}
