import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Plus,
  Search,
  Download,
  Upload
} from 'lucide-react';

const QuickActions: React.FC = () => {
  const quickActions = [
    {
      title: 'New Claim',
      description: 'Create a new billing claim',
      icon: FileText,
      color: 'bg-blue-500',
      action: () => console.log('New Claim clicked')
    },
    {
      title: 'Verify Eligibility',
      description: 'Check patient insurance eligibility',
      icon: CheckCircle,
      color: 'bg-green-500',
      action: () => console.log('Verify Eligibility clicked')
    },
    {
      title: 'Submit Prior Auth',
      description: 'Submit prior authorization request',
      icon: Clock,
      color: 'bg-yellow-500',
      action: () => console.log('Submit Prior Auth clicked')
    },
    {
      title: 'Process Payment',
      description: 'Process patient payments',
      icon: DollarSign,
      color: 'bg-purple-500',
      action: () => console.log('Process Payment clicked')
    },
    {
      title: 'Generate Report',
      description: 'Create billing reports',
      icon: TrendingUp,
      color: 'bg-indigo-500',
      action: () => console.log('Generate Report clicked')
    },
    {
      title: 'Manage Patients',
      description: 'View and edit patient information',
      icon: Users,
      color: 'bg-pink-500',
      action: () => console.log('Manage Patients clicked')
    }
  ];

  const recentActivities = [
    {
      action: 'Claim submitted',
      patient: 'John Smith',
      amount: '$1,250.00',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      action: 'Payment received',
      patient: 'Sarah Johnson',
      amount: '$850.00',
      time: '4 hours ago',
      status: 'completed'
    },
    {
      action: 'Eligibility verified',
      patient: 'Mike Davis',
      amount: '$2,100.00',
      time: '6 hours ago',
      status: 'approved'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quick Actions</h1>
          <p className="text-muted-foreground">Fast access to common billing tasks</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={action.action}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Clock className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.patient}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{activity.amount}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Billing Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Search className="w-4 h-4 mr-2" />
                Search Claims
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">EDI Connection</span>
                <span className="text-sm text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Gateway</span>
                <span className="text-sm text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className="text-sm text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Backup</span>
                <span className="text-sm text-gray-600">2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuickActions;
