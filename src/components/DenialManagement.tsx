
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Clock, RefreshCw, CheckCircle, TrendingUp, Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const DenialManagement = () => {
  const { toast } = useToast();

  const denialReasons = [
    { code: "CO-1", reason: "Deductible Amount", count: 45, trend: "+12%" },
    { code: "CO-2", reason: "Coinsurance Amount", count: 38, trend: "-5%" },
    { code: "CO-3", reason: "Co-payment Amount", count: 23, trend: "+8%" },
    { code: "CO-11", reason: "Diagnosis Not Covered", count: 67, trend: "+15%" },
    { code: "CO-16", reason: "Prior Authorization Required", count: 34, trend: "-10%" },
    { code: "CO-50", reason: "Non-covered Services", count: 28, trend: "+3%" }
  ];

  const [deniedClaims, setDeniedClaims] = useState([
    {
      id: "CLM-2024-001",
      patient: "Ahmad Hassan",
      amount: 450.00,
      denialCode: "CO-11",
      reason: "Diagnosis Not Covered",
      receivedDate: "2024-06-25",
      daysOpen: 5,
      priority: "High",
      status: "Under Review"
    },
    {
      id: "CLM-2024-002",
      patient: "Fatima Al-Zahra",
      amount: 275.50,
      denialCode: "CO-16",
      reason: "Prior Authorization Required",
      receivedDate: "2024-06-28",
      daysOpen: 2,
      priority: "Medium",
      status: "Pending Appeal"
    },
    {
      id: "CLM-2024-003",
      patient: "Omar Abdullah",
      amount: 125.75,
      denialCode: "CO-1",
      reason: "Deductible Amount",
      receivedDate: "2024-06-30",
      daysOpen: 0,
      priority: "Low",
      status: "New"
    }
  ] as Array<{ id: string; patient: string; amount: number; denialCode: string; reason: string; receivedDate: string; daysOpen: number; priority: string; status: string }>);

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [appealOpen, setAppealOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [denialViewOpen, setDenialViewOpen] = useState(false);
  const [selectedDenial, setSelectedDenial] = useState<any>(null);
  const [selectedClaim, setSelectedClaim] = useState<null | { id: string; patient: string; amount: number; denialCode: string; reason: string; receivedDate: string; daysOpen: number; priority: string; status: string }>(null);
  const [generatedAppeal, setGeneratedAppeal] = useState<string>('');
  const [aiConfig, setAiConfig] = useState({
    autoAppeal: true,
    successThreshold: 75,
    maxAppealsPerDay: 10,
    includeClinicalNotes: true,
    useHistoricalData: true,
    appealTemplates: ['standard', 'clinical', 'urgent']
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under Review": return "bg-blue-100 text-blue-800";
      case "Pending Appeal": return "bg-yellow-100 text-yellow-800";
      case "New": return "bg-red-100 text-red-800";
      case "Resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAutoAppeal = async (claimId: string) => {
    const claim = deniedClaims.find(c => c.id === claimId);
    if (!claim) return;

    try {
      // Show loading state
      toast({
        title: "AI Analysis in Progress",
        description: "Analyzing denial and generating appeal...",
      });

      // Import AI service
      const { aiService } = await import('@/services/aiService');
      
      // Analyze the denial
      const analysis = await aiService.analyzeDenial({
        claimId: claim.id,
        patientName: claim.patient,
        denialCode: claim.denialCode,
        denialReason: claim.reason,
        amount: claim.amount,
        procedureCodes: [], // Add actual procedure codes
        diagnosisCodes: [] // Add actual diagnosis codes
      });

      // Show results
      toast({
        title: "AI Appeal Generated",
        description: `Appeal created with ${Math.round(analysis.successProbability * 100)}% success probability`,
      });

      // Show the generated appeal in a dialog
      setGeneratedAppeal(analysis.appealText);
      setAppealOpen(true);
      
    } catch (error) {
      toast({
        title: "AI Analysis Failed",
        description: "Unable to generate appeal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleView = (claimId: string) => {
    const claim = deniedClaims.find(c => c.id === claimId) || null;
    setSelectedClaim(claim);
    setViewOpen(!!claim);
  };

  const handleEdit = (claimId: string) => {
    const claim = deniedClaims.find(c => c.id === claimId) || null;
    setSelectedClaim(claim);
    setEditOpen(!!claim);
  };

  const handleEditSave = () => {
    if (!selectedClaim) return;
    setDeniedClaims(prev => prev.map(c => c.id === selectedClaim.id ? selectedClaim : c));
    setEditOpen(false);
    toast({ title: "Claim updated", description: `${selectedClaim.id} saved.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Denial Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {
            // Simulate syncing denials
            const newDenials = Math.floor(Math.random() * 5) + 1;
            setDeniedClaims(prev => [
              ...prev,
              ...Array.from({ length: newDenials }, (_, i) => ({
                id: `DEN-${Date.now()}-${i}`,
                patient: `Patient ${prev.length + i + 1}`,
                amount: Math.floor(Math.random() * 5000) + 100,
                denialCode: `CO-${Math.floor(Math.random() * 50) + 1}`,
                reason: `Denial reason ${i + 1}`,
                receivedDate: new Date().toISOString().split('T')[0],
                daysOpen: Math.floor(Math.random() * 30) + 1,
                priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
                status: 'Open'
              }))
            ]);
            toast({
              title: "Denials Synced",
              description: `Found ${newDenials} new denials from payers`
            });
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Denials
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
            // Generate denial report
            const totalDenials = deniedClaims.length;
            const highPriority = deniedClaims.filter(d => d.priority === 'High').length;
            const totalAmount = deniedClaims.reduce((sum, d) => sum + d.amount, 0);
            const avgDaysOpen = deniedClaims.reduce((sum, d) => sum + d.daysOpen, 0) / totalDenials;
            
            const reportData = {
              totalDenials,
              highPriority,
              totalAmount: totalAmount.toFixed(2),
              avgDaysOpen: avgDaysOpen.toFixed(1),
              date: new Date().toISOString().split('T')[0]
            };
            
            // Create and download report
            const reportText = `Denial Management Report - ${reportData.date}
Total Denials: ${reportData.totalDenials}
High Priority: ${reportData.highPriority}
Total Amount: $${reportData.totalAmount}
Average Days Open: ${reportData.avgDaysOpen}`;
            
            const blob = new Blob([reportText], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `denial-report-${reportData.date}.txt`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            toast({
              title: "Report Generated",
              description: `Denial report downloaded with ${totalDenials} denials`
            });
          }}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active-denials">Active Denials</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="appeals">Appeals Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Denials</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">235</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Days to Resolve</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.5</div>
                <p className="text-xs text-muted-foreground">-2.1 days from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78.2%</div>
                <p className="text-xs text-muted-foreground">+5.3% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recovery Amount</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$186K</div>
                <p className="text-xs text-muted-foreground">+15% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Denial Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>Top Denial Reasons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {denialReasons.map((denial) => (
                  <div key={denial.code} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{denial.code}</Badge>
                      <div>
                        <div className="font-medium">{denial.reason}</div>
                        <div className="text-sm text-gray-600">{denial.count} occurrences</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        denial.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {denial.trend}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedDenial(denial);
                        setDenialViewOpen(true);
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-denials" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Denial Cases</CardTitle>
                <div className="flex space-x-2">
                  <Input placeholder="Search denials..." className="w-64" />
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deniedClaims.map((claim) => (
                  <div key={claim.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <div>
                          <div className="font-semibold">{claim.id}</div>
                          <div className="text-sm text-gray-600">{claim.patient}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(claim.priority)}>{claim.priority}</Badge>
                        <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Amount</div>
                        <div className="font-semibold">${claim.amount.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Denial Code</div>
                        <div className="font-semibold">{claim.denialCode}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Days Open</div>
                        <div className="font-semibold">{claim.daysOpen} days</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Received</div>
                        <div className="font-semibold">{claim.receivedDate}</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-1">Denial Reason</div>
                      <div className="text-sm bg-red-50 text-red-800 p-2 rounded">{claim.reason}</div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(claim.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(claim.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Claim
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleAutoAppeal(claim.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        AI Auto-Appeal
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Denial Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart showing denial trends over time would be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recovery Rate by Payer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Aetna</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>BCBS</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                      <span className="text-sm font-medium">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cigna</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Medicare</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '91%' }}></div>
                      </div>
                      <span className="text-sm font-medium">91%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appeals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appeals Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI-Powered Appeals</h3>
                <p className="text-gray-600 mb-4">
                  Our AI system automatically generates appeals based on denial patterns and historical success rates.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setConfigOpen(true)}>
                  Configure AI Appeals
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Denial Details</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Claim ID:</span> {selectedClaim.id}</div>
              <div><span className="font-medium">Patient:</span> {selectedClaim.patient}</div>
              <div><span className="font-medium">Amount:</span> ${selectedClaim.amount.toFixed(2)}</div>
              <div><span className="font-medium">Denial Code:</span> {selectedClaim.denialCode}</div>
              <div><span className="font-medium">Reason:</span> {selectedClaim.reason}</div>
              <div><span className="font-medium">Received:</span> {selectedClaim.receivedDate}</div>
              <div><span className="font-medium">Days Open:</span> {selectedClaim.daysOpen}</div>
              <div><span className="font-medium">Priority:</span> {selectedClaim.priority}</div>
              <div><span className="font-medium">Status:</span> {selectedClaim.status}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Denial</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-patient">Patient</Label>
                <Input id="edit-patient" value={selectedClaim.patient} onChange={(e) => setSelectedClaim({ ...(selectedClaim as any), patient: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="edit-amount">Amount</Label>
                <Input id="edit-amount" type="number" step="0.01" value={selectedClaim.amount} onChange={(e) => setSelectedClaim({ ...(selectedClaim as any), amount: parseFloat(e.target.value || '0') })} />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={selectedClaim.status} onValueChange={(v) => setSelectedClaim({ ...(selectedClaim as any), status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Pending Appeal">Pending Appeal</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={selectedClaim.priority} onValueChange={(v) => setSelectedClaim({ ...(selectedClaim as any), priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={handleEditSave}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Appeal Dialog */}
      <Dialog open={appealOpen} onOpenChange={setAppealOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>AI-Generated Appeal Letter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Generated Appeal Letter</h4>
              <Textarea
                value={generatedAppeal}
                readOnly
                className="min-h-[300px] bg-white"
                placeholder="AI-generated appeal letter will appear here..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAppealOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                navigator.clipboard.writeText(generatedAppeal);
                toast({
                  title: "Copied to Clipboard",
                  description: "Appeal letter copied to clipboard",
                });
              }}>
                Copy to Clipboard
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                toast({
                  title: "Appeal Submitted",
                  description: "Appeal letter has been submitted to the payer",
                });
                setAppealOpen(false);
              }}>
                Submit Appeal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Configuration Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Appeals Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Auto Appeal Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Auto Appeal Settings</h4>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoAppeal"
                  checked={aiConfig.autoAppeal}
                  onCheckedChange={(checked) => setAiConfig(prev => ({ ...prev, autoAppeal: checked }))}
                />
                <Label htmlFor="autoAppeal">Enable automatic appeal generation</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="successThreshold">Success Threshold (%)</Label>
                  <Input
                    id="successThreshold"
                    type="number"
                    value={aiConfig.successThreshold}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, successThreshold: parseInt(e.target.value) }))}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="maxAppeals">Max Appeals Per Day</Label>
                  <Input
                    id="maxAppeals"
                    type="number"
                    value={aiConfig.maxAppealsPerDay}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, maxAppealsPerDay: parseInt(e.target.value) }))}
                    min="1"
                    max="50"
                  />
                </div>
              </div>
            </div>

            {/* Appeal Templates */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Appeal Templates</h4>
              <div className="space-y-2">
                {[
                  { id: 'standard', name: 'Standard Appeal', description: 'General purpose appeal template' },
                  { id: 'clinical', name: 'Clinical Appeal', description: 'Focuses on medical necessity' },
                  { id: 'urgent', name: 'Urgent Appeal', description: 'For time-sensitive cases' },
                  { id: 'financial', name: 'Financial Appeal', description: 'For payment and coverage issues' }
                ].map((template) => (
                  <div key={template.id} className="flex items-center space-x-2 p-2 border rounded">
                    <input
                      type="checkbox"
                      id={template.id}
                      checked={aiConfig.appealTemplates.includes(template.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAiConfig(prev => ({ 
                            ...prev, 
                            appealTemplates: [...prev.appealTemplates, template.id] 
                          }));
                        } else {
                          setAiConfig(prev => ({ 
                            ...prev, 
                            appealTemplates: prev.appealTemplates.filter(t => t !== template.id) 
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <Label htmlFor={template.id} className="font-medium">{template.name}</Label>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Advanced Settings</h4>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeClinicalNotes"
                    checked={aiConfig.includeClinicalNotes}
                    onCheckedChange={(checked) => setAiConfig(prev => ({ ...prev, includeClinicalNotes: checked }))}
                  />
                  <Label htmlFor="includeClinicalNotes">Include clinical notes in appeals</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="useHistoricalData"
                    checked={aiConfig.useHistoricalData}
                    onCheckedChange={(checked) => setAiConfig(prev => ({ ...prev, useHistoricalData: checked }))}
                  />
                  <Label htmlFor="useHistoricalData">Use historical success data</Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setConfigOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  toast({
                    title: "Configuration Saved",
                    description: "AI appeals configuration has been updated successfully",
                  });
                  setConfigOpen(false);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Denial View Dialog */}
      {selectedDenial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Denial Details</h3>
            <div className="space-y-3">
              <div><strong>Code:</strong> {selectedDenial.code}</div>
              <div><strong>Reason:</strong> {selectedDenial.reason}</div>
              <div><strong>Count:</strong> {selectedDenial.count}</div>
              <div><strong>Trend:</strong> {selectedDenial.trend}</div>
              <div><strong>Impact:</strong> {selectedDenial.trend.startsWith('+') ? 'Increasing' : 'Decreasing'}</div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => {
                setDenialViewOpen(false);
                setSelectedDenial(null);
              }}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DenialManagement;
