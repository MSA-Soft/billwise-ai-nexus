import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  Send, 
  Printer,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Building,
  FileText
} from 'lucide-react';

interface ClaimFilters {
  dateCreated: string;
  dateFrom: string;
  dateTo: string;
  searchField: string;
  searchValue: string;
  startsWith: boolean;
  formType: string;
  status: string;
  facility: string;
}

interface PrintOptions {
  cmsFormVersion: string;
  includesFormImage: boolean;
}

export function EnhancedClaimList() {
  // Mock data
  const mockClaims = [
    {
      id: '1',
      claimNumber: 'CLM-2024-001',
      patient: 'John Doe',
      provider: 'Dr. Smith',
      dateOfService: '2024-01-15',
      amount: 250.00,
      status: 'submitted',
      formType: 'HCFA',
      insuranceProvider: 'Blue Cross',
      submissionDate: '2024-01-16',
      cptCodes: ['99213', '36415'],
      icdCodes: ['I10', 'E11.9']
    },
    {
      id: '2',
      claimNumber: 'CLM-2024-002',
      patient: 'Jane Smith',
      provider: 'Dr. Johnson',
      dateOfService: '2024-01-14',
      amount: 450.00,
      status: 'denied',
      formType: 'CMS1500',
      insuranceProvider: 'Aetna',
      submissionDate: '2024-01-15',
      cptCodes: ['99214', '93000'],
      icdCodes: ['M79.3', 'R06.02']
    },
    {
      id: '3',
      claimNumber: 'CLM-2024-003',
      patient: 'Bob Wilson',
      provider: 'Dr. Brown',
      dateOfService: '2024-01-13',
      amount: 180.00,
      status: 'paid',
      formType: 'HCFA',
      insuranceProvider: 'Cigna',
      submissionDate: '2024-01-14',
      cptCodes: ['99212'],
      icdCodes: ['Z00.00']
    }
  ];

  const mockFacilities = [
    { id: '1', name: 'Main Clinic' },
    { id: '2', name: 'Downtown Office' },
    { id: '3', name: 'Urgent Care Center' }
  ];

  // State
  const [filteredClaims, setFilteredClaims] = useState<any[]>(mockClaims);
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [showNewClaimForm, setShowNewClaimForm] = useState(false);
  const [editingClaim, setEditingClaim] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<ClaimFilters>({
    dateCreated: 'By Date',
    dateFrom: '',
    dateTo: '',
    searchField: 'Patient Last Name',
    searchValue: '',
    startsWith: false,
    formType: '-- All --',
    status: '-- All --',
    facility: '-- All --'
  });

  // Print options
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    cmsFormVersion: '02/12',
    includesFormImage: true
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resubmitted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Send className="h-4 w-4" />;
      case 'denied': return <AlertCircle className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'resubmitted': return <RefreshCw className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleSelectClaim = (claimId: string, checked: boolean) => {
    if (checked) {
      setSelectedClaims(prev => [...prev, claimId]);
    } else {
      setSelectedClaims(prev => prev.filter(id => id !== claimId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClaims(filteredClaims.map(claim => claim.id));
    } else {
      setSelectedClaims([]);
    }
  };

  const handleDeleteClaim = (claimId: string) => {
    if (window.confirm('Are you sure you want to delete this claim?')) {
      setFilteredClaims(prev => prev.filter(claim => claim.id !== claimId));
    }
  };

  const handleSubmitClaim = (claimId: string) => {
    if (window.confirm('Are you sure you want to submit this claim?')) {
      setFilteredClaims(prev => prev.map(claim => 
        claim.id === claimId 
          ? { ...claim, status: 'submitted', submissionDate: new Date().toISOString().split('T')[0] }
          : claim
      ));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Claims List</h2>
          <p className="text-gray-600 mt-1">Advanced claim management with filtering and bulk operations</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={() => setShowNewClaimForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Claim
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="searchField">Search Field</Label>
              <Select value={filters.searchField} onValueChange={(value) => setFilters(prev => ({ ...prev, searchField: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Patient Last Name">Patient Last Name</SelectItem>
                  <SelectItem value="Patient First Name">Patient First Name</SelectItem>
                  <SelectItem value="Provider">Provider</SelectItem>
                  <SelectItem value="Claim Number">Claim Number</SelectItem>
                  <SelectItem value="Insurance Provider">Insurance Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="searchValue">Search Value</Label>
              <Input
                id="searchValue"
                placeholder="Enter search term..."
                value={filters.searchValue}
                onChange={(e) => setFilters(prev => ({ ...prev, searchValue: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-- All --">-- All --</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="startsWith"
                checked={filters.startsWith}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, startsWith: !!checked }))}
              />
              <Label htmlFor="startsWith">Starts with</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Claims ({filteredClaims.length})
            </CardTitle>
            {selectedClaims.length > 0 && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Selected ({selectedClaims.length})
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedClaims.length === filteredClaims.length && filteredClaims.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Claim #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Date of Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Form Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedClaims.includes(claim.id)}
                        onCheckedChange={(checked) => handleSelectClaim(claim.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-blue-600">{claim.claimNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        {claim.patient}
                      </div>
                    </TableCell>
                    <TableCell>{claim.provider}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(claim.dateOfService).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                        ${claim.amount.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(claim.status)}>
                        <span className="flex items-center">
                          {getStatusIcon(claim.status)}
                          <span className="ml-1">{claim.status}</span>
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{claim.formType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingClaim(claim.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingClaim(claim.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {claim.status === 'draft' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSubmitClaim(claim.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteClaim(claim.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* New Claim Form Modal */}
      {showNewClaimForm && (
        <Dialog open={showNewClaimForm} onOpenChange={(open) => !open && setShowNewClaimForm(false)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Enhanced Claim</DialogTitle>
              <DialogDescription>
                Create a new comprehensive medical claim with advanced features.
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Enhanced Claim Form</h3>
              <p className="text-gray-600">Advanced claim creation form will be available here.</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
