import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AuthorizationRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AuthorizationRequestDialog = ({ open, onOpenChange, onSuccess }: AuthorizationRequestDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [payers, setPayers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patient_name: "",
    patient_dob: "",
    patient_member_id: "",
    provider_npi: "",
    requesting_physician: "",
    payer_id: "",
    payer_name: "",
    procedure_code: "",
    procedure_description: "",
    diagnosis_codes: "",
    clinical_indication: "",
    urgency: "routine",
    requested_start_date: "",
    requested_end_date: "",
    units_requested: 1
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPayers();
    }
  }, [open]);

  const fetchPayers = async () => {
    const { data } = await supabase
      .from('payers')
      .select('*')
      .order('name');
    
    if (data) {
      setPayers(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create an authorization');
      }

      const selectedPayer = payers.find(p => p.id === formData.payer_id);
      
      const { error } = await supabase
        .from('authorization_requests')
        .insert({
          ...formData,
          payer_name: selectedPayer?.name || formData.payer_name,
          diagnosis_codes: formData.diagnosis_codes.split(',').map(c => c.trim()),
          created_by: user.id,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Authorization Created",
        description: "Prior authorization request has been created successfully."
      });

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        patient_name: "",
        patient_dob: "",
        patient_member_id: "",
        provider_npi: "",
        requesting_physician: "",
        payer_id: "",
        payer_name: "",
        procedure_code: "",
        procedure_description: "",
        diagnosis_codes: "",
        clinical_indication: "",
        urgency: "routine",
        requested_start_date: "",
        requested_end_date: "",
        units_requested: 1
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Prior Authorization Request</DialogTitle>
          <DialogDescription>
            Complete the form below to submit a new prior authorization request
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient_name">Patient Name *</Label>
                <Input
                  id="patient_name"
                  value={formData.patient_name}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="patient_dob">Date of Birth *</Label>
                <Input
                  id="patient_dob"
                  type="date"
                  value={formData.patient_dob}
                  onChange={(e) => setFormData({ ...formData, patient_dob: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="patient_member_id">Member ID *</Label>
                <Input
                  id="patient_member_id"
                  value={formData.patient_member_id}
                  onChange={(e) => setFormData({ ...formData, patient_member_id: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Provider Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Provider Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requesting_physician">Requesting Physician *</Label>
                <Input
                  id="requesting_physician"
                  value={formData.requesting_physician}
                  onChange={(e) => setFormData({ ...formData, requesting_physician: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="provider_npi">Provider NPI *</Label>
                <Input
                  id="provider_npi"
                  value={formData.provider_npi}
                  onChange={(e) => setFormData({ ...formData, provider_npi: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Payer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Insurance Payer</h3>
            <div>
              <Label htmlFor="payer_id">Select Payer *</Label>
              <Select
                value={formData.payer_id}
                onValueChange={(value) => setFormData({ ...formData, payer_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select insurance payer" />
                </SelectTrigger>
                <SelectContent>
                  {payers.map((payer) => (
                    <SelectItem key={payer.id} value={payer.id}>
                      {payer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clinical Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Clinical Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="procedure_code">Procedure Code (CPT) *</Label>
                <Input
                  id="procedure_code"
                  placeholder="e.g., 99213"
                  value={formData.procedure_code}
                  onChange={(e) => setFormData({ ...formData, procedure_code: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="diagnosis_codes">Diagnosis Codes (ICD-10) *</Label>
                <Input
                  id="diagnosis_codes"
                  placeholder="e.g., M54.5, M51.2"
                  value={formData.diagnosis_codes}
                  onChange={(e) => setFormData({ ...formData, diagnosis_codes: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="procedure_description">Procedure Description *</Label>
              <Input
                id="procedure_description"
                value={formData.procedure_description}
                onChange={(e) => setFormData({ ...formData, procedure_description: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="clinical_indication">Clinical Indication / Medical Necessity *</Label>
              <Textarea
                id="clinical_indication"
                rows={4}
                value={formData.clinical_indication}
                onChange={(e) => setFormData({ ...formData, clinical_indication: e.target.value })}
                placeholder="Provide detailed clinical justification for the requested procedure..."
                required
              />
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Service Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="urgency">Urgency Level *</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="expedited">Expedited</SelectItem>
                    <SelectItem value="stat">STAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="requested_start_date">Start Date *</Label>
                <Input
                  id="requested_start_date"
                  type="date"
                  value={formData.requested_start_date}
                  onChange={(e) => setFormData({ ...formData, requested_start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="units_requested">Units Requested *</Label>
                <Input
                  id="units_requested"
                  type="number"
                  min="1"
                  value={formData.units_requested}
                  onChange={(e) => setFormData({ ...formData, units_requested: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Authorization
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthorizationRequestDialog;