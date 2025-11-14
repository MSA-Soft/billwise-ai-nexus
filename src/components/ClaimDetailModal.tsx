import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  Edit,
  Save,
  X,
  Download,
  Send,
  History,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Stethoscope,
  Code,
  CreditCard,
  Building,
  Activity
} from 'lucide-react';
import { ClaimData } from './ClaimsTable';

interface ClaimDetailModalProps {
  claim: ClaimData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClaim: ClaimData) => void;
  fullPage?: boolean; // New prop to control full-page vs modal rendering
}

export function ClaimDetailModal({ claim, isOpen, onClose, onSave, fullPage = false }: ClaimDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedClaim, setEditedClaim] = useState<ClaimData | null>(null);

  if (!claim) return null;

  const handleEdit = () => {
    setEditedClaim({ ...claim });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedClaim) {
      onSave(editedClaim);
      setIsEditing(false);
      setEditedClaim(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedClaim(null);
  };

  const handleFieldChange = (field: keyof ClaimData, value: any) => {
    if (editedClaim) {
      setEditedClaim({ ...editedClaim, [field]: value });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'denied': return 'bg-red-100 text-red-800 border-red-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resubmitted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'denied': return <XCircle className="h-4 w-4" />;
      case 'processing': return <Activity className="h-4 w-4" />;
      case 'resubmitted': return <Send className="h-4 w-4" />;
      case 'draft': return <Edit className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const currentClaim = editedClaim || claim;

  // Render the content (used in both dialog and full-page modes)
  const renderContent = () => (
    <>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="procedures">Procedures</TabsTrigger>
            <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="claimId">Claim ID</Label>
                    <Input
                      id="claimId"
                      value={currentClaim.id}
                      disabled={!isEditing}
                      onChange={(e) => handleFieldChange('id', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="patient">Patient</Label>
                    <Input
                      id="patient"
                      value={currentClaim.patient}
                      disabled={!isEditing}
                      onChange={(e) => handleFieldChange('patient', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <Input
                      id="provider"
                      value={currentClaim.provider}
                      disabled={!isEditing}
                      onChange={(e) => handleFieldChange('provider', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceDate">Service Date</Label>
                    <Input
                      id="serviceDate"
                      type="date"
                      value={currentClaim.dateOfService}
                      disabled={!isEditing}
                      onChange={(e) => handleFieldChange('dateOfService', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="submissionDate">Submission Date</Label>
                    <Input
                      id="submissionDate"
                      type="date"
                      value={currentClaim.submissionDate}
                      disabled={!isEditing}
                      onChange={(e) => handleFieldChange('submissionDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      value={currentClaim.amount}
                      disabled={!isEditing}
                      onChange={(e) => handleFieldChange('amount', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={currentClaim.status}
                      disabled={!isEditing}
                      onValueChange={(value) => handleFieldChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="denied">Denied</SelectItem>
                        <SelectItem value="resubmitted">Resubmitted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payer">Payer</Label>
                    <Input
                      id="payer"
                      value={currentClaim.payer}
                      disabled={!isEditing}
                      onChange={(e) => handleFieldChange('payer', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Total Charges</p>
                    <p className="text-2xl font-bold text-green-800">${(currentClaim.totalCharges || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Insurance Amount</p>
                    <p className="text-2xl font-bold text-blue-800">${(currentClaim.insuranceAmount || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600">Patient Responsibility</p>
                    <p className="text-2xl font-bold text-orange-800">${(currentClaim.patientResponsibility || 0).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={currentClaim.notes}
                  disabled={!isEditing}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  placeholder="Add notes about this claim..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="procedures">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Procedures & Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentClaim.procedures.map((procedure, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded">
                          <Stethoscope className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{procedure.cptCode}</p>
                          <p className="text-sm text-gray-600">{procedure.description}</p>
                          <p className="text-sm text-gray-500">Units: {procedure.units}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">${(procedure.amount || 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">per unit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagnoses">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  Diagnosis Codes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentClaim.diagnoses.map((diagnosis, index) => (
                    <div key={index} className={`p-4 rounded-lg ${
                      diagnosis.primary ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {diagnosis.primary ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Code className="h-4 w-4 text-blue-600" />
                          )}
                          <span className={`font-medium ${
                            diagnosis.primary ? 'text-green-800' : 'text-blue-800'
                          }`}>
                            {diagnosis.primary ? 'Primary Diagnosis' : 'Secondary Diagnosis'}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm font-mono mt-2 ${
                        diagnosis.primary ? 'text-green-700' : 'text-blue-700'
                      }`}>
                        {diagnosis.icdCode}
                      </p>
                      <p className={`text-sm ${
                        diagnosis.primary ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {diagnosis.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insurance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Primary Payer</span>
                    </div>
                    <p className="text-sm text-blue-700">{currentClaim.payer}</p>
                    <p className="text-xs text-blue-600 mt-1">Submission: {currentClaim.submissionMethod}</p>
                  </div>
                  
                  {currentClaim.priorAuthNumber && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Prior Authorization</span>
                      </div>
                      <p className="text-sm text-green-700">{currentClaim.priorAuthNumber}</p>
                    </div>
                  )}
                  
                  {currentClaim.referralNumber && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-purple-800">Referral Number</span>
                      </div>
                      <p className="text-sm text-purple-700">{currentClaim.referralNumber}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => console.log('Download claim')}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => console.log('View history')}>
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {isEditing && (
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </div>
    </>
  );

  // Render in full-page mode
  if (fullPage) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="h-6 w-6 mr-2 text-blue-600" />
                Claim Details - {currentClaim.id}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={`${getStatusColor(currentClaim.status)} border flex items-center`}>
                  {getStatusIcon(currentClaim.status)}
                  <span className="ml-1 capitalize">{currentClaim.status}</span>
                </Badge>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
        {renderContent()}
      </div>
    );
  }

  // Render in dialog mode (when isOpen is true and it's a modal)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-600" />
              Claim Details - {currentClaim.id}
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${getStatusColor(currentClaim.status)} border flex items-center`}>
                {getStatusIcon(currentClaim.status)}
                <span className="ml-1 capitalize">{currentClaim.status}</span>
              </Badge>
              {isEditing ? (
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            Comprehensive view and editing of claim information
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
