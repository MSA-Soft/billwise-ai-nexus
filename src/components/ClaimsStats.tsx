import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { ClaimData } from './ClaimsTable';

interface ClaimsStatsProps {
  claims: ClaimData[];
}

export function ClaimsStats({ claims }: ClaimsStatsProps) {
  const claimStats = useMemo(() => {
    const total = claims.length;
    const approved = claims.filter(c => c.status === 'approved').length;
    const pending = claims.filter(c => c.status === 'pending').length;
    const denied = claims.filter(c => c.status === 'denied').length;
    const processing = claims.filter(c => c.status === 'processing').length;
    const resubmitted = claims.filter(c => c.status === 'resubmitted').length;
    const draft = claims.filter(c => c.status === 'draft').length;

    const totalAmount = claims.reduce((sum, claim) => sum + claim.totalCharges, 0);
    const approvedAmount = claims
      .filter(c => c.status === 'approved')
      .reduce((sum, claim) => sum + claim.totalCharges, 0);
    const pendingAmount = claims
      .filter(c => ['pending', 'processing', 'resubmitted'].includes(c.status))
      .reduce((sum, claim) => sum + claim.totalCharges, 0);

    return [
      {
        title: 'Total Claims',
        value: total.toString(),
        icon: FileText,
        color: 'blue',
        description: 'All claims in system'
      },
      {
        title: 'Approved',
        value: approved.toString(),
        icon: CheckCircle,
        color: 'green',
        description: `$${approvedAmount.toFixed(2)} approved`
      },
      {
        title: 'Pending',
        value: (pending + processing + resubmitted).toString(),
        icon: Clock,
        color: 'yellow',
        description: `$${pendingAmount.toFixed(2)} pending`
      },
      {
        title: 'Denied',
        value: denied.toString(),
        icon: XCircle,
        color: 'red',
        description: 'Requires attention'
      },
      {
        title: 'Draft',
        value: draft.toString(),
        icon: AlertCircle,
        color: 'gray',
        description: 'In progress'
      },
      {
        title: 'Total Value',
        value: `$${totalAmount.toFixed(2)}`,
        icon: DollarSign,
        color: 'purple',
        description: 'All claims combined'
      }
    ];
  }, [claims]);

  const getStatColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'red': return 'text-red-600 bg-red-50 border-red-200';
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'purple': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'gray': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600';
      case 'yellow': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      case 'blue': return 'text-blue-600';
      case 'purple': return 'text-purple-600';
      case 'gray': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {claimStats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${getStatColor(stat.color)}`}>
                <stat.icon className={`h-6 w-6 ${getIconColor(stat.color)}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
