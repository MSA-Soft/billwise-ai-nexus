import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Edit, 
  ArrowRight,
  Calendar,
  Building,
  User,
  DollarSign,
  TrendingUp,
  Activity,
  Target,
  BarChart3,
  AlertCircle,
  Info,
  ExternalLink,
  Copy,
  Send,
  FileCheck,
  Receipt,
  CreditCard,
  Shield,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ClaimStatusTracking = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayer, setFilterPayer] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState<any>(null);

  // Mock claim data
  const claims = [
    {
      id: "CLM001",
      patientName: "Amina Khan",
      patientId: "PAT001",
      payer: "Blue Cross Blue Shield",
      status: "accepted",
      submittedDate: "2024-01-15",
      processedDate: "2024-01-18",
      totalAmount: 150.00,
      paidAmount: 120.00,
      patientResponsibility: 30.00,
      cptCodes: ["99213", "99214"],
      icdCodes: ["Z00.00", "I10"],
      denialReason: null,
      timeline: [
        { date: "2024-01-15", status: "submitted", description: "Claim submitted to payer" },
        { date: "2024-01-16", status: "received", description: "Payer acknowledged receipt" },
        { date: "2024-01-18", status: "processed", description: "Claim processed and approved" }
      ]
    },
    {
      id: "CLM002",
      patientName: "Hassan Ahmed",
      patientId: "PAT002",
      payer: "Aetna",
      status: "denied",
      submittedDate: "2024-01-16",
      processedDate: "2024-01-19",
      totalAmount: 200.00,
      paidAmount: 0.00,
      patientResponsibility: 200.00,
      cptCodes: ["99215"],
      icdCodes: ["M25.561"],
      denialReason: "Prior authorization required",
      timeline: [
        { date: "2024-01-16", status: "submitted", description: "Claim submitted to payer" },
        { date: "2024-01-17", status: "received", description: "Payer acknowledged receipt" },
        { date: "2024-01-19", status: "denied", description: "Claim denied - PA required" }
      ]
    },
    {
      id: "CLM003",
      patientName: "Zainab Ali",
      patientId: "PAT003",
      payer: "Cigna",
      status: "pending",
      submittedDate: "2024-01-17",
      processedDate: null,
      totalAmount: 175.00,
      paidAmount: 0.00,
      patientResponsibility: 0.00,
      cptCodes: ["99213"],
      icdCodes: ["Z00.00"],
      denialReason: null,
      timeline: [
        { date: "2024-01-17", status: "submitted", description: "Claim submitted to payer" },
        { date: "2024-01-18", status: "received", description: "Payer acknowledged receipt" },
        { date: "2024-01-19", status: "processing", description: "Claim under review" }
      ]
    }
  ];

  const payers = [
    "Blue Cross Blue Shield",
    "Aetna", 
    "Cigna",
    "Medicare",
    "Medicaid"
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "denied":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "processing":
        return <Activity className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge variant="default" className="bg-green-100 text-green-800">Accepted</Badge>;
      case "denied":
        return <Badge variant="destructive">Denied</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "processing":
        return <Badge variant="outline" className="border-blue-200 text-blue-800">Processing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.payer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || claim.status === filterStatus;
    const matchesPayer = filterPayer === "all" || claim.payer === filterPayer;
    return matchesSearch && matchesStatus && matchesPayer;
  });

  const getStatusStats = () => {
    const total = claims.length;
    const accepted = claims.filter(c => c.status === "accepted").length;
    const denied = claims.filter(c => c.status === "denied").length;
    const pending = claims.filter(c => c.status === "pending").length;
    
    return { total, accepted, denied, pending };
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileCheck className="h-8 w-8 text-blue-600" />
            Claim Status Tracking
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor real-time status of submitted claims
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Claims</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Denied</p>
                <p className="text-2xl font-bold text-red-600">{stats.denied}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tracking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracking">Status Tracking</TabsTrigger>
          <TabsTrigger value="denials">Denial Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Status Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Claim Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by claim ID, patient name, or payer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPayer} onValueChange={setFilterPayer}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by payer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payers</SelectItem>
                    {payers.map((payer) => (
                      <SelectItem key={payer} value={payer}>{payer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Claims List */}
              <div className="space-y-3">
                {filteredClaims.map((claim) => (
                  <Card 
                    key={claim.id} 
                    className={`cursor-pointer transition-all hover:bg-gray-50 ${
                      selectedClaim?.id === claim.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedClaim(claim)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(claim.status)}
                            <div>
                              <span className="font-medium">{claim.id}</span>
                              <span className="text-sm text-muted-foreground ml-2">• {claim.patientName}</span>
                            </div>
                          </div>
                          <Badge variant="outline">{claim.payer}</Badge>
                          {getStatusBadge(claim.status)}
                          <div className="text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            {claim.submittedDate}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-medium">${claim.totalAmount}</div>
                            <div className="text-sm text-muted-foreground">
                              {claim.paidAmount > 0 ? `Paid: $${claim.paidAmount}` : 'Unpaid'}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {claim.denialReason && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                          <AlertCircle className="h-4 w-4 inline mr-2" />
                          <strong>Denial Reason:</strong> {claim.denialReason}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Denial Management Tab */}
        <TabsContent value="denials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Denial Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {claims.filter(c => c.status === "denied").map((claim) => (
                  <Card key={claim.id} className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <div>
                            <span className="font-medium">{claim.id}</span>
                            <span className="text-sm text-muted-foreground ml-2">• {claim.patientName}</span>
                          </div>
                          <Badge variant="destructive">Denied</Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-red-600">${claim.totalAmount}</div>
                          <div className="text-sm text-muted-foreground">Total Denied</div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <strong>Denial Reason:</strong> {claim.denialReason}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Appeal
                        </Button>
                        <Button size="sm" variant="outline">
                          <Send className="h-4 w-4 mr-2" />
                          Resubmit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Accepted</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(stats.accepted / stats.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{stats.accepted}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Denied</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${(stats.denied / stats.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{stats.denied}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pending</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full"
                          style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{stats.pending}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Payer Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payers.map((payer) => {
                    const payerClaims = claims.filter(c => c.payer === payer);
                    const accepted = payerClaims.filter(c => c.status === "accepted").length;
                    const total = payerClaims.length;
                    const rate = total > 0 ? Math.round((accepted / total) * 100) : 0;
                    
                    return (
                      <div key={payer} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{payer}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${rate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground">{rate}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClaimStatusTracking;
  const [isLoading, setIsLoading] = useState(false);
  const [claimStatus, setClaimStatus] = useState<ClaimStatusResponse | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<any[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    claimId: "",
    patientId: "",
    payerId: "",
    serviceDate: "",
  });

  const payers = [
    { id: "MEDICARE", name: "Medicare" },
    { id: "BCBS", name: "Blue Cross Blue Shield" },
    { id: "AETNA", name: "Aetna" },
    { id: "CIGNA", name: "Cigna" },
    { id: "HUMANA", name: "Humana" },
    { id: "UHC", name: "UnitedHealth" },
  ];

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && formData.claimId) {
      const interval = setInterval(() => {
        handleCheckStatus();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, formData.claimId]);

  const handleCheckStatus = async () => {
    if (!formData.claimId || !formData.patientId || !formData.payerId || !formData.serviceDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const request: ClaimStatusRequest = {
        claimId: formData.claimId,
        patientId: formData.patientId,
        payerId: formData.payerId,
        serviceDate: formData.serviceDate,
      };

      const ediService = getEDIService();
      const result = await ediService.checkClaimStatus(request);
      setClaimStatus(result);

      // Add to history
      setTrackingHistory(prev => [{
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        claimId: formData.claimId,
        status: result.status,
        amountPaid: result.amountPaid,
        statusDate: result.statusDate,
      }, ...prev]);

      toast({
        title: "Status Updated",
        description: `Claim status: ${result.status}`,
      });

    } catch (error: any) {
      toast({
        title: "Status Check Failed",
        description: error.message || "Unable to check claim status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'pending':
        return 25;
      case 'processing':
        return 50;
      case 'paid':
        return 100;
      case 'denied':
        return 75;
      case 'rejected':
        return 75;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Claim Status Tracking</h1>
          <p className="text-muted-foreground">Track claim status with real-time EDI 276/277 integration</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          <FileText className="h-4 w-4 mr-2" />
          EDI 276/277 Enabled
        </Badge>
      </div>

      <Tabs defaultValue="track" className="space-y-6">
        <TabsList>
          <TabsTrigger value="track">Track Claim</TabsTrigger>
          <TabsTrigger value="history">Tracking History</TabsTrigger>
        </TabsList>

        <TabsContent value="track" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tracking Form */}
            <Card>
              <CardHeader>
                <CardTitle>Claim Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="claimId">Claim ID</Label>
                  <Input
                    id="claimId"
                    value={formData.claimId}
                    onChange={(e) => setFormData(prev => ({ ...prev, claimId: e.target.value }))}
                    placeholder="Enter claim ID"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientId">Patient ID</Label>
                    <Input
                      id="patientId"
                      value={formData.patientId}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                      placeholder="Enter patient ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payerId">Insurance Payer</Label>
                    <Select value={formData.payerId} onValueChange={(value) => setFormData(prev => ({ ...prev, payerId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payer" />
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

                <div>
                  <Label htmlFor="serviceDate">Service Date</Label>
                  <Input
                    id="serviceDate"
                    type="date"
                    value={formData.serviceDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceDate: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  <Label htmlFor="autoRefresh">Auto-refresh every 30 seconds</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCheckStatus} disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Check Status
                      </>
                    )}
                  </Button>
                  {autoRefresh && (
                    <Button variant="outline" onClick={() => setAutoRefresh(false)}>
                      Stop Auto-refresh
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Results */}
            <Card>
              <CardHeader>
                <CardTitle>Claim Status</CardTitle>
              </CardHeader>
              <CardContent>
                {claimStatus ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(claimStatus.status)}
                      <span className={`font-semibold ${getStatusColor(claimStatus.status)}`}>
                        {claimStatus.status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">{getStatusProgress(claimStatus.status)}%</span>
                      </div>
                      <Progress value={getStatusProgress(claimStatus.status)} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Claim ID:</span>
                        <span className="text-sm font-medium">{claimStatus.claimId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status Date:</span>
                        <span className="text-sm font-medium">
                          {new Date(claimStatus.statusDate).toLocaleDateString()}
                        </span>
                      </div>
                      {claimStatus.amountPaid && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Amount Paid:</span>
                          <span className="text-sm font-medium text-green-600">
                            ${claimStatus.amountPaid.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {claimStatus.denialReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">Denial Reason</span>
                          </div>
                          <p className="text-sm text-red-700">{claimStatus.denialReason}</p>
                        </div>
                      )}
                      {claimStatus.remittanceAdvice && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Remittance Advice</span>
                          </div>
                          <p className="text-sm text-blue-700">{claimStatus.remittanceAdvice}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter claim information and click "Check Status" to track your claim</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tracking History</CardTitle>
            </CardHeader>
            <CardContent>
              {trackingHistory.length > 0 ? (
                <div className="space-y-4">
                  {trackingHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(entry.status)}
                          <span className="font-medium">Claim {entry.claimId}</span>
                        </div>
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.amountPaid && `Paid: $${entry.amountPaid.toFixed(2)}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tracking history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClaimStatusTracking;
