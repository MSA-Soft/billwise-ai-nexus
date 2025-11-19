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
