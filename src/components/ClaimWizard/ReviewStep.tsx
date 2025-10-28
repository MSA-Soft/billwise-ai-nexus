import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  FileText, 
  Code, 
  CreditCard, 
  DollarSign,
  Calendar,
  Phone,
  Building,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  Activity
} from 'lucide-react';

interface ReviewStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function ReviewStep({ data }: ReviewStepProps) {
  const totalAmount = data.procedures?.reduce((sum: number, proc: any) => sum + (proc.amount * proc.units), 0) || 0;
  const primaryDiagnosis = data.diagnoses?.find((d: any) => d.primary);
  const secondaryDiagnoses = data.diagnoses?.filter((d: any) => !d.primary) || [];

  return (
    <div className="space-y-6">
      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.patient ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Name:</span>
                <span>{data.patient.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Patient ID:</span>
                <span>{data.patient.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Date of Birth:</span>
                <span>{data.patient.dob}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Phone:</span>
                <span>{data.patient.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Insurance:</span>
                <span>{data.patient.insurance}</span>
              </div>
            </div>
          ) : (
            <p className="text-red-600">No patient selected</p>
          )}
        </CardContent>
      </Card>

      {/* Service Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Service Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Service Date:</span>
              <span>{data.serviceDate || 'Not specified'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Provider:</span>
              <span>{data.provider?.name || 'Not selected'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Provider Specialty:</span>
              <span>{data.provider?.specialty || 'Not specified'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Procedures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="h-5 w-5 mr-2" />
            Procedures & Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.procedures && data.procedures.length > 0 ? (
            <div className="space-y-3">
              {data.procedures.map((procedure: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{procedure.cptCode}</p>
                      <p className="text-sm text-gray-600">{procedure.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${procedure.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">× {procedure.units} units</p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">Total Amount:</span>
                  <span className="font-bold text-lg text-green-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-red-600">No procedures added</p>
          )}
        </CardContent>
      </Card>

      {/* Diagnoses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="h-5 w-5 mr-2" />
            Diagnosis Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.diagnoses && data.diagnoses.length > 0 ? (
            <div className="space-y-3">
              {primaryDiagnosis && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Primary Diagnosis</span>
                  </div>
                  <p className="text-sm text-green-700 font-mono">{primaryDiagnosis.icdCode}</p>
                  <p className="text-sm text-green-600">{primaryDiagnosis.description}</p>
                </div>
              )}
              
              {secondaryDiagnoses.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Secondary Diagnoses</h4>
                  {secondaryDiagnoses.map((diagnosis: any, index: number) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700 font-mono">{diagnosis.icdCode}</p>
                      <p className="text-sm text-blue-600">{diagnosis.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-600">No diagnoses added</p>
          )}
        </CardContent>
      </Card>

      {/* Insurance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Insurance Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.insurance?.primary ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Primary Insurance:</span>
                <span>{data.insurance.primary.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Insurance Type:</span>
                <Badge variant="outline">{data.insurance.primary.type}</Badge>
              </div>
              {data.insurance.secondary && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Secondary Insurance:</span>
                  <span>{data.insurance.secondary.name}</span>
                </div>
              )}
              {data.insurance.authNumber && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Authorization Number:</span>
                  <span className="font-mono">{data.insurance.authNumber}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-600">No insurance information provided</p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {data.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{data.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Validation Summary */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Claim Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {data.patient ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={data.patient ? 'text-green-700' : 'text-red-700'}>
                Patient selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {data.procedures && data.procedures.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={data.procedures && data.procedures.length > 0 ? 'text-green-700' : 'text-red-700'}>
                Procedures added
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {data.diagnoses && data.diagnoses.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={data.diagnoses && data.diagnoses.length > 0 ? 'text-green-700' : 'text-red-700'}>
                Diagnoses added
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {data.insurance?.primary ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={data.insurance?.primary ? 'text-green-700' : 'text-red-700'}>
                Primary insurance selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {data.provider ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={data.provider ? 'text-green-700' : 'text-red-700'}>
                Provider selected
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
