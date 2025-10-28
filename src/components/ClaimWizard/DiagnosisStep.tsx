import { useState, useEffect } from 'react';
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

const mockIcdCodes = [
  { code: 'I10', description: 'Essential hypertension' },
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
  { code: 'Z00.00', description: 'Encounter for general adult medical examination' },
  { code: 'M79.3', description: 'Panniculitis, unspecified' },
  { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris' },
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified' },
  { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis' },
  { code: 'M25.561', description: 'Pain in right knee' }
];

interface DiagnosisStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function DiagnosisStep({ data, onUpdate }: DiagnosisStepProps) {
  const [diagnoses, setDiagnoses] = useState(data.diagnoses || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIcdCodes, setFilteredIcdCodes] = useState(mockIcdCodes);

  useEffect(() => {
    const filtered = mockIcdCodes.filter(icd =>
      icd.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      icd.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIcdCodes(filtered);
  }, [searchTerm]);

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
        </h3>
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
