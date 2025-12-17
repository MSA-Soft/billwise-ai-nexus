import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DenialTriageDashboard } from '@/components/DenialTriageDashboard';
import { AlertTriangle, BarChart3 } from 'lucide-react';

interface ClaimData {
  id: string;
  claimNumber: string;
  patient: string;
  provider: string;
  dateOfService: string;
  amount: number;
  status: string;
  formType: string;
  insuranceProvider: string;
  submissionDate: string;
  cptCodes: string[];
  icdCodes: string[];
}

interface DenialManagementProps {
  claims: ClaimData[];
}

export function DenialManagement({ claims }: DenialManagementProps) {
  const deniedClaims = claims.filter(claim => claim.status === 'denied');
  const denialRate = claims.length > 0 ? ((deniedClaims.length / claims.length) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Denial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Denials</p>
                <p className="text-2xl font-bold text-red-600">{deniedClaims.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Denial Rate</p>
                <p className="text-2xl font-bold text-orange-600">{denialRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Appeal Time</p>
                <p className="text-2xl font-bold text-blue-600">14 days</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">—</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

          <Card>
            <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Triage & Auto-Appeal
              </CardTitle>
            </CardHeader>
            <CardContent>
          <DenialTriageDashboard />
                      </CardContent>
                    </Card>
    </div>
  );
}

