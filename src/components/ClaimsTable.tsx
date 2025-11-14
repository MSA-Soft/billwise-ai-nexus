import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  FileText,
  Edit,
  Eye,
  Download,
  RefreshCw,
  ArrowUpDown,
  MoreHorizontal,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export interface ClaimData {
  id: string;
  patient: string;
  provider: string;
  dateOfService: string;
  submissionDate: string;
  amount: string;
  status: 'approved' | 'pending' | 'denied' | 'processing' | 'resubmitted' | 'draft';
  payer: string;
  cptCodes: string[];
  icdCodes: string[];
  totalCharges: number;
  patientResponsibility: number;
  insuranceAmount: number;
  copayAmount: number;
  deductibleAmount: number;
  priorAuthNumber: string;
  referralNumber: string;
  notes: string;
  formType: string;
  submissionMethod: string;
  isSecondaryClaim: boolean;
  procedures: Array<{
    cptCode: string;
    description: string;
    units: number;
    amount: number;
  }>;
  diagnoses: Array<{
    icdCode: string;
    description: string;
    primary: boolean;
  }>;
}

interface ClaimsTableProps {
  claims: ClaimData[];
  selectedClaims: string[];
  onSelectClaim: (claimId: string) => void;
  onSelectAll: () => void;
  onViewClaim: (claim: ClaimData) => void;
  onEditClaim: (claim: ClaimData) => void;
}

export function ClaimsTable({
  claims,
  selectedClaims,
  onSelectClaim,
  onSelectAll,
  onViewClaim,
  onEditClaim
}: ClaimsTableProps) {
  const [sortField, setSortField] = useState<keyof ClaimData>('submissionDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'denied': return <XCircle className="h-3 w-3" />;
      case 'processing': return <RefreshCw className="h-3 w-3" />;
      case 'resubmitted': return <Send className="h-3 w-3" />;
      case 'draft': return <Edit className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const handleSort = (field: keyof ClaimData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedClaims = [...claims].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedClaims.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClaims = sortedClaims.slice(startIndex, startIndex + itemsPerPage);

  const isAllSelected = selectedClaims.length === claims.length;
  const isPartiallySelected = selectedClaims.length > 0 && selectedClaims.length < claims.length;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Claims List
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm opacity-90">
              {claims.length} total claims
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={onSelectAll}
                    aria-label="Select all claims"
                    className={isPartiallySelected ? 'data-[state=checked]:bg-blue-600' : ''}
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort('id')}
                  >
                    Claim ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort('patient')}
                  >
                    Patient
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort('provider')}
                  >
                    Provider
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort('dateOfService')}
                  >
                    Service Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort('submissionDate')}
                  >
                    Submitted
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort('amount')}
                  >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Payer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CPT Codes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClaims.map((claim) => (
                <TableRow 
                  key={claim.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    // Don't trigger row click if clicking checkbox or action buttons
                    const target = e.target as HTMLElement;
                    if (!target.closest('button') && !target.closest('input[type="checkbox"]')) {
                      onViewClaim(claim);
                    }
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedClaims.includes(claim.id)}
                      onCheckedChange={() => onSelectClaim(claim.id)}
                      aria-label={`Select claim ${claim.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium font-mono">{claim.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{claim.patient}</p>
                      <p className="text-xs text-gray-500">ID: {claim.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{claim.provider}</p>
                      <p className="text-xs text-gray-500">{claim.formType}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-900">{claim.dateOfService}</p>
                      <p className="text-xs text-gray-500">
                        {Math.floor((new Date().getTime() - new Date(claim.dateOfService).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-900">{claim.submissionDate}</p>
                      <p className="text-xs text-gray-500">
                        {Math.floor((new Date().getTime() - new Date(claim.submissionDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{claim.amount}</p>
                      <p className="text-xs text-gray-500">
                        Patient: ${(claim.patientResponsibility || 0).toFixed(2)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{claim.payer}</p>
                      <p className="text-xs text-gray-500">{claim.submissionMethod}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(claim.status)} border flex items-center w-fit`}>
                      {getStatusIcon(claim.status)}
                      <span className="ml-1 capitalize">{claim.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {claim.cptCodes.slice(0, 2).map((code, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {code}
                        </Badge>
                      ))}
                      {claim.cptCodes.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{claim.cptCodes.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewClaim(claim);
                        }}
                        className="h-8 w-8 p-0 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClaim(claim);
                        }}
                        className="h-8 w-8 p-0 hover:bg-green-50"
                      >
                        <Edit className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedClaims.length)} of {sortedClaims.length} claims
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNumber > totalPages) return null;
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Empty State */}
        {claims.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
            <p className="text-gray-600">No claims match your current search criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
