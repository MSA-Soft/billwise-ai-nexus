import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  DollarSign, 
  FileText,
  Search
} from 'lucide-react';

const mockCptCodes = [
  { code: '99213', description: 'Office visit, established patient', amount: 200.00 },
  { code: '99214', description: 'Office visit, established patient', amount: 320.00 },
  { code: '99215', description: 'Office visit, established patient', amount: 500.00 },
  { code: '36415', description: 'Blood draw', amount: 250.00 },
  { code: '93000', description: 'Electrocardiogram', amount: 250.00 },
  { code: '80053', description: 'Comprehensive metabolic panel', amount: 150.00 },
  { code: '85025', description: 'Complete blood count', amount: 100.00 },
  { code: '99212', description: 'Office visit, established patient', amount: 180.00 }
];

interface ServiceDetailsStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function ServiceDetailsStep({ data, onUpdate }: ServiceDetailsStepProps) {
  const [serviceDate, setServiceDate] = useState(data.serviceDate || new Date().toISOString().split('T')[0]);
  const [procedures, setProcedures] = useState(data.procedures || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCptCodes, setFilteredCptCodes] = useState(mockCptCodes);

  useEffect(() => {
    const filtered = mockCptCodes.filter(cpt =>
      cpt.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cpt.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCptCodes(filtered);
  }, [searchTerm]);

  const addProcedure = (cptCode: any) => {
    const newProcedure = {
      cptCode: cptCode.code,
      description: cptCode.description,
      units: 1,
      amount: cptCode.amount
    };
    const updatedProcedures = [...procedures, newProcedure];
    setProcedures(updatedProcedures);
    onUpdate({ procedures: updatedProcedures, serviceDate });
  };

  const removeProcedure = (index: number) => {
    const updatedProcedures = procedures.filter((_, i) => i !== index);
    setProcedures(updatedProcedures);
    onUpdate({ procedures: updatedProcedures, serviceDate });
  };

  const updateProcedure = (index: number, field: string, value: any) => {
    const updatedProcedures = procedures.map((proc, i) => 
      i === index ? { ...proc, [field]: value } : proc
    );
    setProcedures(updatedProcedures);
    onUpdate({ procedures: updatedProcedures, serviceDate });
  };

  const totalAmount = procedures.reduce((sum, proc) => sum + (proc.amount * proc.units), 0);

  const handleServiceDateChange = (date: string) => {
    setServiceDate(date);
    onUpdate({ procedures, serviceDate: date });
  };

  return (
    <div className="space-y-6">
      {/* Service Date */}
      <div className="space-y-2">
        <Label htmlFor="serviceDate">Service Date</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="serviceDate"
            type="date"
            value={serviceDate}
            onChange={(e) => handleServiceDateChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* CPT Code Search */}
      <div className="space-y-2">
        <Label htmlFor="cptSearch">Search CPT Codes</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="cptSearch"
            placeholder="Search by code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Available CPT Codes */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">
          Available CPT Codes ({filteredCptCodes.length})
        </h3>
        <div className="max-h-40 overflow-y-auto space-y-2">
          {filteredCptCodes.map((cpt) => (
            <Card key={cpt.code} className="border-gray-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{cpt.code}</h4>
                      <p className="text-sm text-gray-600">{cpt.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${cpt.amount.toFixed(2)}</p>
                    <Button
                      size="sm"
                      onClick={() => addProcedure(cpt)}
                      className="mt-1"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Procedures */}
      {procedures.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">
              Selected Procedures ({procedures.length})
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-lg font-semibold text-green-600">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {procedures.map((procedure, index) => (
              <Card key={index} className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900">{procedure.cptCode}</h4>
                        <p className="text-sm text-blue-700">{procedure.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <Label htmlFor={`units-${index}`} className="text-xs text-blue-700">
                          Units
                        </Label>
                        <Input
                          id={`units-${index}`}
                          type="number"
                          min="1"
                          value={procedure.units}
                          onChange={(e) => updateProcedure(index, 'units', parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-center"
                        />
                      </div>
                      
                      <div className="text-right">
                        <Label htmlFor={`amount-${index}`} className="text-xs text-blue-700">
                          Amount
                        </Label>
                        <Input
                          id={`amount-${index}`}
                          type="number"
                          step="0.01"
                          value={procedure.amount}
                          onChange={(e) => updateProcedure(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-20 h-8 text-center"
                        />
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-semibold text-blue-900">
                          ${(procedure.amount * procedure.units).toFixed(2)}
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeProcedure(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {procedures.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No procedures added</h3>
          <p className="text-gray-600">Search and add procedures to continue.</p>
        </div>
      )}
    </div>
  );
}
