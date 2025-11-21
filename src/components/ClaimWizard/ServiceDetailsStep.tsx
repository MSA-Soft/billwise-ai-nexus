import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
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

interface ServiceDetailsStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function ServiceDetailsStep({ data, onUpdate }: ServiceDetailsStepProps) {
  const { toast } = useToast();
  const [serviceDate, setServiceDate] = useState(data.serviceDate || new Date().toISOString().split('T')[0]);
  const [procedures, setProcedures] = useState(data.procedures || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [cptCodes, setCptCodes] = useState<Array<{ code: string; description: string; amount: number }>>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [filteredCptCodes, setFilteredCptCodes] = useState<Array<{ code: string; description: string; amount: number }>>([]);

  // Fetch CPT codes from database
  useEffect(() => {
    const fetchCptCodes = async () => {
      setIsLoadingCodes(true);
      try {
        const { data: codesData, error } = await supabase
          .from('cpt_hcpcs_codes' as any)
          .select('code, description, default_price, superbill_description')
          .eq('is_active', true)
          .order('code', { ascending: true })
          .limit(1000); // Limit to 1000 most common codes

        if (error) {
          console.error('Error fetching CPT codes:', error);
          toast({
            title: 'Error loading CPT codes',
            description: error.message,
            variant: 'destructive',
          });
          // Fallback to empty array
          setCptCodes([]);
          return;
        }

        // Transform database records to match expected format
        const transformedCodes = (codesData || []).map((dbCode: any) => ({
          code: dbCode.code || '',
          description: dbCode.description || dbCode.superbill_description || '',
          amount: dbCode.default_price ? parseFloat(dbCode.default_price) : 0.00
        }));

        setCptCodes(transformedCodes);
        console.log(`✅ Loaded ${transformedCodes.length} CPT codes from database`);
      } catch (error: any) {
        console.error('Error fetching CPT codes:', error);
        toast({
          title: 'Error loading CPT codes',
          description: error.message || 'Failed to load CPT codes',
          variant: 'destructive',
        });
        setCptCodes([]);
      } finally {
        setIsLoadingCodes(false);
      }
    };

    fetchCptCodes();
  }, []);

  // Filter CPT codes based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCptCodes(cptCodes);
      return;
    }

    const filtered = cptCodes.filter(cpt =>
      cpt.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cpt.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCptCodes(filtered);
  }, [searchTerm, cptCodes]);

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
          {isLoadingCodes && <span className="text-sm text-gray-500 ml-2">(Loading...)</span>}
        </h3>
        {isLoadingCodes ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading CPT codes...</p>
          </div>
        ) : filteredCptCodes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No CPT codes found</p>
            {searchTerm && <p className="text-xs text-gray-500 mt-1">Try a different search term</p>}
          </div>
        ) : (
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
        )}
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
