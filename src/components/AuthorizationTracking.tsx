
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Clock, CheckCircle, AlertTriangle, Plus, Eye, Edit, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AuthorizationTracking = () => {
  const { toast } = useToast();

  const [selectedAuth, setSelectedAuth] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  const handleViewDetails = (authId: string) => {
    const auth = authorizations.find(a => a.id === authId);
    if (auth) {
      setSelectedAuth(auth);
      setViewOpen(true);
    }
  };

  const handleUpdateStatus = (authId: string) => {
    const auth = authorizations.find(a => a.id === authId);
    if (auth) {
      setSelectedAuth(auth);
      setUpdateOpen(true);
    }
  };

  const handleUseVisit = (authId: string) => {
    const auth = authorizations.find(a => a.id === authId);
    if (auth) {
      // Update the authorization status to "Used"
      const updatedAuths = authorizations.map(a => 
        a.id === authId ? { ...a, status: 'Used', usedDate: new Date().toISOString().split('T')[0] } : a
      );
      
      toast({
        title: "Visit Authorized",
        description: `Authorization used for ${auth.patientName} on ${new Date().toLocaleDateString()}`,
      });
    }
  };

  const authorizations = [
    {
      id: "AUTH-2024-001",
      patient: "John Smith",
      procedure: "MRI Brain",
      cptCode: "70553",
      payer: "Aetna",
      requestDate: "2024-06-25",
      expiryDate: "2024-09-25",
      status: "Approved",
      visits: { used: 1, authorized: 3 },
      priority: "Standard"
    },
    {
      id: "AUTH-2024-002",
      patient: "Sarah Johnson",
      procedure: "Physical Therapy",
      cptCode: "97110",
      payer: "BCBS",
      requestDate: "2024-06-28",
      expiryDate: "2024-12-28",
      status: "Pending",
      visits: { used: 0, authorized: 12 },
      priority: "Urgent"
    },
    {
      id: "AUTH-2024-003",
      patient: "Mike Davis",
      procedure: "Cardiac Catheterization",
      cptCode: "93458",
      payer: "Medicare",
      requestDate: "2024-06-30",
      expiryDate: "2024-08-30",
      status: "Under Review",
      visits: { used: 0, authorized: 1 },
      priority: "STAT"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Under Review": return "bg-blue-100 text-blue-800";
      case "Denied": return "bg-red-100 text-red-800";
      case "Expired": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "STAT": return "bg-red-100 text-red-800";
      case "Urgent": return "bg-orange-100 text-orange-800";
      case "Standard": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleNewAuthorization = () => {
    toast({
      title: "New Authorization Request",
      description: "Authorization request form opened.",
    });
  };

  const expiringAuths = authorizations.filter(auth => {
    const expiryDate = new Date(auth.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Authorization Tracking</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Alerts ({expiringAuths.length})
          </Button>
          <Button onClick={handleNewAuthorization} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Authorization
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Authorizations</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Authorizations</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">-12% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89.2%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring This Month</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiringAuths.length}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Authorizations</CardTitle>
                <div className="flex space-x-2">
                  <Input placeholder="Search authorizations..." className="w-64" />
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under-review">Under Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {authorizations.map((auth) => (
                  <div key={auth.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <Shield className="h-8 w-8 text-blue-500" />
                        <div>
                          <div className="font-semibold">{auth.id}</div>
                          <div className="text-sm text-gray-600">{auth.patient}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(auth.priority)}>{auth.priority}</Badge>
                        <Badge className={getStatusColor(auth.status)}>{auth.status}</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Procedure</div>
                        <div className="font-medium">{auth.procedure}</div>
                        <div className="text-xs text-gray-500">{auth.cptCode}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Payer</div>
                        <div className="font-medium">{auth.payer}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Visits Used</div>
                        <div className="font-medium">{auth.visits.used} / {auth.visits.authorized}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Request Date</div>
                        <div className="font-medium">{auth.requestDate}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Expiry Date</div>
                        <div className="font-medium">{auth.expiryDate}</div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(auth.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateStatus(auth.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update Status
                      </Button>
                      {auth.status === "Approved" && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleUseVisit(auth.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Use Visit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Authorization Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {authorizations.filter(auth => auth.status === "Pending" || auth.status === "Under Review").map((auth) => (
                  <div key={auth.id} className="border rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Clock className="h-8 w-8 text-yellow-500" />
                        <div>
                          <div className="font-semibold">{auth.id}</div>
                          <div className="text-sm text-gray-600">{auth.patient} - {auth.procedure}</div>
                          <div className="text-xs text-gray-500">Requested: {auth.requestDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(auth.priority)}>{auth.priority}</Badge>
                        <Badge className={getStatusColor(auth.status)}>{auth.status}</Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Follow Up
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <CardTitle>Expiring Authorizations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {expiringAuths.length > 0 ? (
                <div className="space-y-4">
                  {expiringAuths.map((auth) => {
                    const expiryDate = new Date(auth.expiryDate);
                    const today = new Date();
                    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={auth.id} className="border rounded-lg p-4 bg-orange-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <AlertTriangle className="h-8 w-8 text-orange-500" />
                            <div>
                              <div className="font-semibold">{auth.id}</div>
                              <div className="text-sm text-gray-600">{auth.patient} - {auth.procedure}</div>
                              <div className="text-xs text-orange-600 font-medium">
                                Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Visits Remaining</div>
                              <div className="font-semibold">{auth.visits.authorized - auth.visits.used}</div>
                            </div>
                            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                              <Plus className="h-4 w-4 mr-2" />
                              Renew
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                  <p className="text-gray-600">No authorizations expiring in the next 30 days.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authorization Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart showing authorization trends over time would be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approval Rate by Payer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Medicare</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                      <span className="text-sm font-medium">95%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>BCBS</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                      <span className="text-sm font-medium">88%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Aetna</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                      <span className="text-sm font-medium">82%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cigna</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '79%' }}></div>
                      </div>
                      <span className="text-sm font-medium">79%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      {selectedAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Authorization Details</h3>
            <div className="space-y-3">
              <div><strong>Patient:</strong> {selectedAuth.patientName}</div>
              <div><strong>Procedure:</strong> {selectedAuth.procedure}</div>
              <div><strong>Status:</strong> {selectedAuth.status}</div>
              <div><strong>Requested Date:</strong> {selectedAuth.requestedDate}</div>
              <div><strong>Expires:</strong> {selectedAuth.expiresDate}</div>
              <div><strong>Provider:</strong> {selectedAuth.provider}</div>
              <div><strong>Insurance:</strong> {selectedAuth.insurance}</div>
              <div><strong>Notes:</strong> {selectedAuth.notes}</div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => {
                setViewOpen(false);
                setSelectedAuth(null);
              }}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Dialog */}
      {selectedAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Authorization Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Status</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Input placeholder="Add update notes..." />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setUpdateOpen(false);
                setSelectedAuth(null);
              }}>Cancel</Button>
              <Button onClick={() => {
                toast({
                  title: "Status Updated",
                  description: `Authorization status updated for ${selectedAuth.patientName}`,
                });
                setUpdateOpen(false);
                setSelectedAuth(null);
              }}>Update</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorizationTracking;
