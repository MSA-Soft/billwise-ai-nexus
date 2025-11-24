import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProfessionalClaimForm } from '@/components/ProfessionalClaimForm';
import { 
  Plus, 
  ChevronDown, 
  Search,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  AlertCircle,
  TrendingUp,
  ArrowUpDown,
  Circle,
  X
} from 'lucide-react';

export function Claims() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [exactMatchesOnly, setExactMatchesOnly] = useState(false);
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  // Filters
  const [patientFilter, setPatientFilter] = useState('all'); // top-right patient filter
  const [statusFilter, setStatusFilter] = useState('all');
  const [payerFilter, setPayerFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [cptFilter, setCptFilter] = useState('');
  const [serviceDateFrom, setServiceDateFrom] = useState('');
  const [serviceDateTo, setServiceDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [patients, setPatients] = useState<Array<{ id: string; name: string; patient_id?: string }>>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);
  const [claimType, setClaimType] = useState<'professional' | 'institutional'>('professional');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [topSection, setTopSection] = useState<'all' | 'denial' | 'ai'>('all');
  
  // Quick filter buttons state
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  
  // AI filter buttons state
  const [activeAIFilter, setActiveAIFilter] = useState<string | null>(null);
  
  // Saved filters state
  const [savedFilters, setSavedFilters] = useState<Array<{ name: string; filters: any }>>([]);
  
  // Sort state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Denial Management sub-tab state
  const [denialSubTab, setDenialSubTab] = useState<'active' | 'analytics' | 'ai-insights' | 'workflows'>('active');
  
  // Column management state
  const [availableColumns, setAvailableColumns] = useState([
    'Total Charges',
    'Status',
    'Entered',
    'Facility',
    'Primary Insurance',
    'Provider',
    'Service Date',
    'Amount',
    'Payer',
    'AI Score',
    'CPT Codes',
    'Actions'
  ]);
  const [visibleColumns, setVisibleColumns] = useState([
    'Claim ID',
    'Patient',
    'Provider',
    'Service Date',
    'Amount',
    'Payer',
    'Status',
    'AI Score',
    'CPT Codes',
    'Actions'
  ]);

  // Fetch patients from database
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoadingPatients(true);
      try {
        const { data, error } = await supabase
          .from('patients' as any)
          .select('id, patient_id, first_name, last_name')
          .order('last_name', { ascending: true })
          .limit(500);

        if (error) {
          console.error('Error fetching patients:', error);
          return;
        }

        // Format patients as "LAST_NAME, FIRST_NAME" to match the UI
        const formattedPatients = (data || [])
          .filter(p => p.first_name || p.last_name)
          .map(p => ({
            id: p.id,
            patient_id: p.patient_id || `TEMP-${p.id}`,
            name: `${p.last_name || ''}, ${p.first_name || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || `Patient ${p.patient_id || p.id}`
          }));

        setPatients(formattedPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setIsLoadingPatients(false);
      }
    };

    fetchPatients();
  }, []);

  // Fetch claims from database
  useEffect(() => {
    const fetchClaims = async () => {
      setIsLoadingClaims(true);
      try {
        // First, fetch claims with nested relations that should work
        const { data: claimsData, error: claimsError } = await supabase
          .from('claims' as any)
          .select(`
            *,
            claim_procedures (*),
            claim_diagnoses (*)
          `)
          .order('created_at', { ascending: false });

        if (claimsError) {
          console.error('Error fetching claims:', claimsError);
          toast({
            title: 'Error loading claims',
            description: claimsError.message,
            variant: 'destructive',
          });
          setClaims([]);
          return;
        }

        if (!claimsData || claimsData.length === 0) {
          setClaims([]);
          setIsLoadingClaims(false);
          return;
        }

        // Get unique IDs for related data
        const patientIds = [...new Set(claimsData.map((c: any) => c.patient_id).filter(Boolean))];
        const providerIds = [...new Set(claimsData.map((c: any) => c.provider_id).filter(Boolean))];
        const facilityIds = [...new Set(claimsData.map((c: any) => c.facility_id).filter(Boolean))];
        const payerIds = [...new Set(claimsData.map((c: any) => c.primary_insurance_id).filter(Boolean))];

        // Fetch related data separately
        const [patientsResult, providersResult, facilitiesResult, payersResult] = await Promise.all([
          patientIds.length > 0 
            ? supabase.from('patients').select('id, patient_id, first_name, last_name').in('id', patientIds)
            : Promise.resolve({ data: [], error: null }),
          providerIds.length > 0
            ? supabase.from('providers').select('id, first_name, last_name, title').in('id', providerIds)
            : Promise.resolve({ data: [], error: null }),
          facilityIds.length > 0
            ? supabase.from('facilities').select('id, name').in('id', facilityIds)
            : Promise.resolve({ data: [], error: null }),
          payerIds.length > 0
            ? supabase.from('insurance_payers').select('id, name').in('id', payerIds)
            : Promise.resolve({ data: [], error: null })
        ]);

        // Create lookup maps
        const patientsMap = new Map((patientsResult.data || []).map((p: any) => [p.id, p]));
        const providersMap = new Map((providersResult.data || []).map((p: any) => [p.id, p]));
        const facilitiesMap = new Map((facilitiesResult.data || []).map((f: any) => [f.id, f]));
        const payersMap = new Map((payersResult.data || []).map((p: any) => [p.id, p]));

        // Combine the data
        const data = claimsData.map((claim: any) => ({
          ...claim,
          patients: claim.patient_id ? patientsMap.get(claim.patient_id) : null,
          providers: claim.provider_id ? providersMap.get(claim.provider_id) : null,
          facilities: claim.facility_id ? facilitiesMap.get(claim.facility_id) : null,
          insurance_payers: claim.primary_insurance_id ? payersMap.get(claim.primary_insurance_id) : null
        }));

        // Transform database claims to match UI format
        const transformedClaims = data.map((claim: any) => {
          // Related data is now single objects, not arrays
          const patient = claim.patients || null;
          const provider = claim.providers || null;
          const facility = claim.facilities || null;
          const payer = claim.insurance_payers || null;
          
          const procedures = Array.isArray(claim.claim_procedures) ? claim.claim_procedures : [];
          const diagnoses = Array.isArray(claim.claim_diagnoses) ? claim.claim_diagnoses : [];
          
          // Format patient name
          const patientName = patient 
            ? `${patient.last_name || ''}, ${patient.first_name || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
            : 'Unknown Patient';
          
          // Format provider name
          const providerName = provider
            ? `${provider.title || 'Dr.'} ${provider.first_name || ''} ${provider.last_name || ''}`.trim()
            : 'Unknown Provider';
          
          // Format service date
          const serviceDate = claim.service_date_from 
            ? new Date(claim.service_date_from).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
            : '';
          
          // Format submission date
          const submissionDate = claim.submission_date
            ? new Date(claim.submission_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
            : claim.created_at
            ? new Date(claim.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
            : '';
          
          // Get CPT codes from procedures
          const cptCodes = procedures.map((p: any) => p.cpt_code).filter(Boolean);
          
          // Map status
          let status = 'PENDING';
          if (claim.status === 'paid') status = 'PAID';
          else if (claim.status === 'denied') status = 'DENIED';
          else if (claim.status === 'submitted' || claim.status === 'processing') {
            status = payer ? `CLAIM AT ${payer.name?.toUpperCase()}` : 'CLAIM AT PAYER';
          }
          else if (claim.patient_responsibility > 0) status = 'BALANCE DUE PATIENT';
          
          // Calculate balance (patient responsibility)
          const balance = claim.patient_responsibility || 0;
          
          // Calculate AI score (placeholder - would come from AI service)
          const aiScore = Math.floor(Math.random() * 30) + 60; // Placeholder: 60-90
          
          return {
            id: claim.claim_number || claim.id,
            patient: patientName,
            dos: serviceDate,
            totalCharges: parseFloat(claim.total_charges || 0),
            balance: parseFloat(balance),
            aiScore: aiScore,
            cptCodes: cptCodes,
            status: status,
            type: claim.form_type === 'UB04' ? 'Institutional' : 'Professional',
            provider: providerName,
            submissionDate: submissionDate,
            facility: facility?.name || 'N/A',
            payer: payer?.name || 'Unknown Payer',
            // Store original data for reference
            _original: claim
          };
        });

        console.log(`✅ Successfully loaded ${transformedClaims.length} claims from database`);
        setClaims(transformedClaims);
      } catch (error: any) {
        console.error('Error fetching claims:', error);
        toast({
          title: 'Error loading claims',
          description: error.message || 'Failed to load claims from database',
          variant: 'destructive',
        });
        setClaims([]);
      } finally {
        setIsLoadingClaims(false);
      }
    };

    fetchClaims();
  }, []);

  // Column mapping to data fields
  const getColumnValue = (claim: any, columnName: string) => {
    switch (columnName) {
      case 'Claim ID':
        return claim.id;
      case 'Patient':
        return claim.patient;
      case 'DOS':
        return claim.dos;
      case 'Total Charges':
      case 'Amount':
        return `$${claim.totalCharges.toFixed(2)}`;
      case 'Balance':
        return `$${claim.balance.toFixed(2)}`;
      case 'Provider':
        return claim.provider || 'N/A';
      case 'Service Date':
        return claim.dos || 'N/A';
      case 'Payer':
        return claim.payer || 'N/A';
      case 'AI Score':
        return claim.aiScore !== undefined ? `${claim.aiScore}%` : '—';
      case 'CPT Codes':
        return claim.cptCodes ? claim.cptCodes.join(', ') : '—';
      case 'Status':
        return claim.status;
      case 'Type':
        return claim.type;
      case 'Rendering Provider':
        return claim.provider || 'N/A';
      case 'Entered':
        return claim.submissionDate || 'N/A';
      case 'Facility':
        return claim.facility || 'N/A';
      case 'Primary Insurance':
        return claim.payer || 'N/A';
      default:
        return 'N/A';
    }
  };

  // Get column header display name
  const getColumnHeader = (columnName: string) => {
    switch (columnName) {
      case 'Claim ID':
        return 'Claim ID';
      case 'Patient':
        return 'Patient';
      case 'Provider':
        return 'Provider';
      case 'Service Date':
        return 'Service Date';
      case 'Amount':
        return 'Amount';
      case 'Payer':
        return 'Payer';
      case 'AI Score':
        return 'AI Score';
      case 'CPT Codes':
        return 'CPT Codes';
      case 'Actions':
        return 'Actions';
      case 'DOS':
        return 'DOS';
      case 'Total Charges':
        return 'Total Charges';
      case 'Balance':
        return 'Balance';
      case 'Status':
        return 'Status';
      case 'Type':
        return 'Type';
      case 'Rendering Provider':
        return 'Rendering Provider';
      case 'Entered':
        return 'Entered';
      case 'Facility':
        return 'Facility';
      case 'Primary Insurance':
        return 'Primary Insurance';
      default:
        return columnName;
    }
  };

  // Helper function to get today's date in mm/dd/yyyy format
  const getTodayDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Helper function to get start of week date
  const getWeekStartDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek;
    const weekStart = new Date(today.setDate(diff));
    const month = String(weekStart.getMonth() + 1).padStart(2, '0');
    const day = String(weekStart.getDate()).padStart(2, '0');
    const year = weekStart.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Apply quick filter logic
  const applyQuickFilter = (filterType: string) => {
    const today = getTodayDate();
    const weekStart = getWeekStartDate();
    
    switch (filterType) {
      case 'today':
        setServiceDateFrom(today);
        setServiceDateTo(today);
        setActiveQuickFilter('today');
        break;
      case 'pending':
        setStatusFilter('at-payer');
        setActiveQuickFilter('pending');
        break;
      case 'denied':
        // Filter for denied claims (status contains "DENIED" or similar)
        setStatusFilter('at-payer');
        setActiveQuickFilter('denied');
        break;
      case 'this-week':
        setServiceDateFrom(weekStart);
        setServiceDateTo(getTodayDate());
        setActiveQuickFilter('this-week');
        break;
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setExactMatchesOnly(false);
    setUnpaidOnly(false);
    setPatientFilter('all');
    setStatusFilter('all');
    setPayerFilter('all');
    setProviderFilter('all');
    setPatientSearchTerm('');
    setCptFilter('');
    setServiceDateFrom('');
    setServiceDateTo('');
    setAmountMin('');
    setAmountMax('');
    setActiveQuickFilter(null);
    setActiveAIFilter(null);
  };

  // Apply AI filter
  const applyAIFilter = (filterType: string) => {
    setActiveAIFilter(filterType);
    switch (filterType) {
      case 'high-risk':
        // Filter claims with AI score < 70
        setStatusFilter('all');
        break;
      case 'ready-appeal':
        // Filter denied claims that are ready for appeal
        setStatusFilter('at-payer');
        break;
      case 'missing-docs':
        // Filter claims with missing documentation (AI score < 60)
        setStatusFilter('all');
        break;
      case 'optimization':
        // Filter claims with optimization opportunities
        setStatusFilter('all');
        break;
    }
  };

  // Save current filter
  const saveCurrentFilter = () => {
    const filterName = prompt('Enter a name for this filter:');
    if (filterName) {
      const currentFilterState = {
        searchTerm,
        exactMatchesOnly,
        unpaidOnly,
        patientFilter,
        statusFilter,
        payerFilter,
        providerFilter,
        patientSearchTerm,
        cptFilter,
        serviceDateFrom,
        serviceDateTo,
        amountMin,
        amountMax,
        activeQuickFilter,
        activeAIFilter
      };
      setSavedFilters([...savedFilters, { name: filterName, filters: currentFilterState }]);
      alert(`Filter "${filterName}" saved successfully!`);
    }
  };

  // Sort claims
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredClaims = claims.filter(claim => {
    // unpaidOnly filter
    if (unpaidOnly && claim.balance === 0) return false;

    // AI filter: High Risk (AI score < 70)
    if (activeAIFilter === 'high-risk' && claim.aiScore >= 70) return false;
    
    // AI filter: Missing Documentation (AI score < 60)
    if (activeAIFilter === 'missing-docs' && claim.aiScore >= 60) return false;
    
    // AI filter: Ready to Appeal (denied claims)
    if (activeAIFilter === 'ready-appeal' && !claim.status.toLowerCase().includes('denied') && !claim.status.toLowerCase().includes('claim at')) return false;
    
    // AI filter: Optimization Opportunities (claims with balance and low AI score)
    if (activeAIFilter === 'optimization' && (claim.balance === 0 || claim.aiScore >= 80)) return false;

    // patient filter (top-right)
    if (patientFilter && patientFilter !== 'all') {
      if (claim.patient !== patientFilter) return false;
    }

    // status filter
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'paid' && claim.status !== 'PAID') return false;
      if (statusFilter === 'balance' && !(claim.balance > 0)) return false;
      if (statusFilter === 'at-payer' && !claim.status.toLowerCase().includes('claim at')) return false;
    }

    // payer filter
    if (payerFilter && payerFilter !== 'all') {
      const pf = payerFilter.toLowerCase();
      if (!claim.payer || !claim.payer.toLowerCase().includes(pf)) return false;
    }

    // provider filter
    if (providerFilter && providerFilter !== 'all') {
      const prov = providerFilter.toLowerCase();
      if (!claim.provider || !claim.provider.toLowerCase().includes(prov)) return false;
    }

    // patient search (free text)
    if (patientSearchTerm) {
      const s = patientSearchTerm.toLowerCase();
      if (
        !(claim.patient && claim.patient.toLowerCase().includes(s)) &&
        !(claim.id && String(claim.id).includes(s))
      ) return false;
    }

    // CPT code filter
    if (cptFilter) {
      const cf = cptFilter.trim();
      if (!claim.cptCodes || !claim.cptCodes.some((c: string) => c.includes(cf))) return false;
    }

    // Service date range
    const parseDate = (d: string) => {
      if (!d) return null;
      const parts = d.split('/');
      if (parts.length !== 3) return null;
      const month = parseInt(parts[0], 10) - 1;
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    };
    const claimDate = parseDate(claim.dos);
    const fromDate = parseDate(serviceDateFrom);
    const toDate = parseDate(serviceDateTo);
    if (fromDate && claimDate && claimDate < fromDate) return false;
    if (toDate && claimDate && claimDate > toDate) return false;

    // Amount range
    if (amountMin) {
      const min = parseFloat(amountMin);
      if (!isNaN(min) && claim.totalCharges < min) return false;
    }
    if (amountMax) {
      const max = parseFloat(amountMax);
      if (!isNaN(max) && claim.totalCharges > max) return false;
    }

    // global searchTerm (top search bar)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !(claim.patient && claim.patient.toLowerCase().includes(searchLower)) &&
        !(claim.id && String(claim.id).includes(searchTerm)) &&
        !(claim.payer && claim.payer.toLowerCase().includes(searchLower))
      ) return false;
    }

    return true;
  });

  // Apply sorting
  const sortedClaims = [...filteredClaims].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let aValue: any;
    let bValue: any;
    
    switch (sortColumn) {
      case 'Claim ID':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'Patient':
        aValue = a.patient;
        bValue = b.patient;
        break;
      case 'Service Date':
      case 'DOS':
        const parseDate = (d: string) => {
          if (!d) return null;
          const parts = d.split('/');
          if (parts.length !== 3) return null;
          const month = parseInt(parts[0], 10) - 1;
          const day = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          return new Date(year, month, day).getTime();
        };
        aValue = parseDate(a.dos) || 0;
        bValue = parseDate(b.dos) || 0;
        break;
      case 'Amount':
      case 'Total Charges':
        aValue = a.totalCharges;
        bValue = b.totalCharges;
        break;
      case 'Balance':
        aValue = a.balance;
        bValue = b.balance;
        break;
      case 'Status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'AI Score':
        aValue = a.aiScore || 0;
        bValue = b.aiScore || 0;
        break;
      case 'Payer':
        aValue = a.payer || '';
        bValue = b.payer || '';
        break;
      case 'Provider':
        aValue = a.provider || '';
        bValue = b.provider || '';
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const total = claims.length;
    const paid = claims.filter(c => c.status === 'PAID').length;
    const balanceDue = claims.filter(c => c.status === 'BALANCE DUE PATIENT').length;
    const atPayer = claims.filter(c => c.status.includes('CLAIM AT')).length;
    const totalCharges = claims.reduce((sum, claim) => sum + claim.totalCharges, 0);
    const totalBalance = claims.reduce((sum, claim) => sum + claim.balance, 0);
    const paidAmount = claims
      .filter(c => c.status === 'PAID')
      .reduce((sum, claim) => sum + claim.totalCharges, 0);

    return {
      total,
      paid,
      balanceDue,
      atPayer,
      totalCharges,
      totalBalance,
      paidAmount
    };
  }, [claims]);

  const getStatusColor = (status: string) => {
    if (status === 'PAID') return 'text-green-600';
    if (status === 'BALANCE DUE PATIENT') return 'text-orange-600';
    return 'text-blue-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {/* Total Claims */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Claims</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</p>
                  <p className="text-xs text-gray-500">All claims</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paid Claims */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Paid</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stats.paid}</p>
                  <p className="text-xs text-gray-500">${stats.paidAmount.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance Due */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Balance Due</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stats.balanceDue}</p>
                  <p className="text-xs text-gray-500">${stats.totalBalance.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* At Payer */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">At Payer</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stats.atPayer}</p>
                  <p className="text-xs text-gray-500">Processing</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Charges */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Charges</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">${(stats.totalCharges / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-gray-500">All claims</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Balance */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Outstanding</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">${(stats.totalBalance / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-gray-500">Unpaid</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Control Bar */}
        <div className="mb-6 space-y-4">
          {/* First Row: Add Claim Buttons and Filters */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left: Add Claim Buttons */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-none border-r border-blue-700"
                  onClick={() => {
                    setClaimType('professional');
                    setSelectedPatientId(undefined);
                    setShowClaimForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Professional Claim
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-l-none px-2">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-96 overflow-y-auto">
                    {isLoadingPatients ? (
                      <DropdownMenuItem disabled>Loading patients...</DropdownMenuItem>
                    ) : patients.length === 0 ? (
                      <DropdownMenuItem disabled>No patients found</DropdownMenuItem>
                    ) : (
                      patients.map((patient) => (
                        <DropdownMenuItem 
                          key={patient.id}
                          onClick={() => {
                            setClaimType('professional');
                            setSelectedPatientId(patient.id);
                            setShowClaimForm(true);
                          }}
                        >
                          {patient.name}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-none border-r border-blue-700"
                  onClick={() => {
                    setClaimType('institutional');
                    setSelectedPatientId(undefined);
                    setShowClaimForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Institutional Claim
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-l-none px-2">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-96 overflow-y-auto">
                    {isLoadingPatients ? (
                      <DropdownMenuItem disabled>Loading patients...</DropdownMenuItem>
                    ) : patients.length === 0 ? (
                      <DropdownMenuItem disabled>No patients found</DropdownMenuItem>
                    ) : (
                      patients.map((patient) => (
                        <DropdownMenuItem 
                          key={patient.id}
                          onClick={() => {
                            setClaimType('institutional');
                            setSelectedPatientId(patient.id);
                            setShowClaimForm(true);
                          }}
                        >
                          {patient.name}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Right: Filter Options */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="exact-matches"
                  checked={exactMatchesOnly}
                  onCheckedChange={(checked) => setExactMatchesOnly(!!checked)}
                />
                <label htmlFor="exact-matches" className="text-sm text-gray-700 cursor-pointer">
                  Show exact matches only
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="unpaid-only"
                  checked={unpaidOnly}
                  onCheckedChange={(checked) => setUnpaidOnly(!!checked)}
                />
                <label htmlFor="unpaid-only" className="text-sm text-gray-700 cursor-pointer">
                  Show unpaid claims only
                </label>
              </div>

                      <Select value={patientFilter} onValueChange={setPatientFilter} disabled={isLoadingPatients}>
                        <SelectTrigger className="w-48 bg-white">
                          <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Filter by patient..."} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Patients</SelectItem>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.name}>
                              {patient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
            </div>
          </div>

          {/* Second Row: Search Bar - Left Aligned */}
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search by name, DOB, account#, member ID, claim ID, or TCN Number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border-gray-300 max-w-2xl"
            />
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Top Sections (visual tab bar matching image) */}
        <div className="mb-4">
          <div className="w-full bg-gray-50 border border-gray-200 rounded-full px-1 py-1">
            <div className="flex">
              <button
                onClick={() => {
                  setTopSection('all');
                  setStatusFilter('all');
                  setPatientFilter('all');
                  setPayerFilter('all');
                  setProviderFilter('all');
                  setFiltersOpen(false);
                }}
                className={`flex-1 text-center rounded-full py-2 text-sm font-medium transition-colors ${
                  topSection === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Claims
              </button>

              <button
                onClick={() => {
                  setTopSection('denial');
                  setStatusFilter('at-payer');
                  setFiltersOpen(false);
                }}
                className={`flex-1 text-center rounded-full py-2 text-sm font-medium transition-colors ${
                  topSection === 'denial'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Denial Management
              </button>

              <button
                onClick={() => {
                  setTopSection('ai');
                  setStatusFilter('all');
                  setFiltersOpen(false);
                }}
                className={`flex-1 text-center rounded-full py-2 text-sm font-medium transition-colors ${
                  topSection === 'ai'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                AI Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Conditional main area: All Claims | Denial Management | AI Analytics */}
        {topSection === 'all' ? (
          <>
            {/* Filters Panel (collapsible) */}
            <div className="mb-4">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setFiltersOpen(!filtersOpen)}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <svg
                        className={`h-4 w-4 transform transition-transform ${filtersOpen ? 'rotate-180' : 'rotate-0'}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                      <span className="font-semibold">Filters</span>
                    </button>
                    <span className="text-sm text-gray-500">Quick Filters</span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`border border-gray-200 ${activeQuickFilter === 'today' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50'}`}
                        onClick={() => applyQuickFilter('today')}
                      >
                        Today's Claims
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`border border-gray-200 ${activeQuickFilter === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50'}`}
                        onClick={() => applyQuickFilter('pending')}
                      >
                        Pending Claims
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`border border-gray-200 ${activeQuickFilter === 'denied' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50'}`}
                        onClick={() => applyQuickFilter('denied')}
                      >
                        Denied Claims
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`border border-gray-200 ${activeQuickFilter === 'this-week' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50'}`}
                        onClick={() => applyQuickFilter('this-week')}
                      >
                        This Week
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="bg-white border border-gray-200"
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                {filtersOpen && (
                  <div className="p-4 border-t border-gray-100">
                    <div className="mb-3">
                      <p className="text-xs font-medium text-purple-600 mb-2">AI-Powered Filters</p>
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`bg-white ${activeAIFilter === 'high-risk' ? 'bg-purple-100 border-purple-300 text-purple-700' : ''}`}
                          onClick={() => {
                            if (activeAIFilter === 'high-risk') {
                              setActiveAIFilter(null);
                            } else {
                              applyAIFilter('high-risk');
                            }
                          }}
                        >
                          High Risk Claims
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`bg-white ${activeAIFilter === 'ready-appeal' ? 'bg-purple-100 border-purple-300 text-purple-700' : ''}`}
                          onClick={() => {
                            if (activeAIFilter === 'ready-appeal') {
                              setActiveAIFilter(null);
                            } else {
                              applyAIFilter('ready-appeal');
                            }
                          }}
                        >
                          Ready to Appeal
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`bg-white ${activeAIFilter === 'missing-docs' ? 'bg-purple-100 border-purple-300 text-purple-700' : ''}`}
                          onClick={() => {
                            if (activeAIFilter === 'missing-docs') {
                              setActiveAIFilter(null);
                            } else {
                              applyAIFilter('missing-docs');
                            }
                          }}
                        >
                          Missing Documentation
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`bg-white ${activeAIFilter === 'optimization' ? 'bg-purple-100 border-purple-300 text-purple-700' : ''}`}
                          onClick={() => {
                            if (activeAIFilter === 'optimization') {
                              setActiveAIFilter(null);
                            } else {
                              applyAIFilter('optimization');
                            }
                          }}
                        >
                          Optimization Opportunities
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-gray-500 text-xs mb-1">Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoadingPatients}>
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="balance">Balance Due</SelectItem>
                            <SelectItem value="at-payer">At Payer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-gray-500 text-xs mb-1">Payer</Label>
                        <Select value={payerFilter} onValueChange={setPayerFilter}>
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="All payers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All payers</SelectItem>
                            <SelectItem value="blue">Blue Cross</SelectItem>
                            <SelectItem value="aetna">Aetna</SelectItem>
                            <SelectItem value="medicare">Medicare</SelectItem>
                            <SelectItem value="united">UnitedHealth</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-gray-500 text-xs mb-1">Provider</Label>
                        <Select value={providerFilter} onValueChange={setProviderFilter}>
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="All providers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All providers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-gray-500 text-xs mb-1">Patient Search</Label>
                        <Input
                          placeholder="Patient name or ID"
                          className="bg-white"
                          value={patientSearchTerm}
                          onChange={(e) => setPatientSearchTerm(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="text-gray-500 text-xs mb-1">CPT Code</Label>
                        <Input
                          placeholder="Enter CPT code"
                          className="bg-white"
                          value={cptFilter}
                          onChange={(e) => setCptFilter(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="text-gray-500 text-xs mb-1">Service Date From</Label>
                        <Input
                          placeholder="mm/dd/yyyy"
                          className="bg-white"
                          value={serviceDateFrom}
                          onChange={(e) => setServiceDateFrom(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="text-gray-500 text-xs mb-1">Service Date To</Label>
                        <Input
                          placeholder="mm/dd/yyyy"
                          className="bg-white"
                          value={serviceDateTo}
                          onChange={(e) => setServiceDateTo(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="text-gray-500 text-xs mb-1">Amount Range</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Min"
                            className="bg-white"
                            value={amountMin}
                            onChange={(e) => setAmountMin(e.target.value)}
                          />
                          <Input
                            placeholder="Max"
                            className="bg-white"
                            value={amountMax}
                            onChange={(e) => setAmountMax(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button 
                        className="bg-white border border-gray-200"
                        onClick={saveCurrentFilter}
                      >
                        Save Current Filter
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content - Claims Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recently Opened</h2>
                  <div className="flex items-center gap-1 group">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        >
                          <div className="relative">
                            <Circle className="h-4 w-4 text-gray-600" strokeWidth={2} />
                            <ArrowUpDown className="h-2.5 w-2.5 text-gray-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" strokeWidth={2.5} />
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSort('Claim ID')}>
                          Sort by Claim ID {sortColumn === 'Claim ID' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('Patient')}>
                          Sort by Patient {sortColumn === 'Patient' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('Service Date')}>
                          Sort by Service Date {sortColumn === 'Service Date' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('Amount')}>
                          Sort by Amount {sortColumn === 'Amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('Status')}>
                          Sort by Status {sortColumn === 'Status' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('AI Score')}>
                          Sort by AI Score {sortColumn === 'AI Score' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </DropdownMenuItem>
                        {sortColumn && (
                          <DropdownMenuItem onClick={() => {
                            setSortColumn(null);
                            setSortDirection('asc');
                          }}>
                            Clear Sort
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-green-50"
                      onClick={() => setShowColumnSelector(true)}
                    >
                      <Plus className="h-4 w-4 text-green-600" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {isLoadingClaims ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading claims...</p>
                  </div>
                ) : sortedClaims.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No claims found</p>
                    <p className="text-sm text-gray-500 mt-2">Create your first claim to get started</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 hover:bg-gray-50">
                        <TableHead className="text-gray-700 font-semibold w-10">
                          <Checkbox />
                        </TableHead>
                        {visibleColumns.map((columnName, idx) => (
                          <TableHead key={`${columnName}-${idx}`} className="text-gray-700 font-semibold">
                            <span>{getColumnHeader(columnName)}</span>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedClaims.map((claim) => (
                      <TableRow 
                        key={claim.id} 
                        className="border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <TableCell className="w-10">
                          <Checkbox />
                        </TableCell>
                        {visibleColumns.map((columnName, idx) => {
                          // Actions column gets custom buttons
                          if (columnName === 'Actions') {
                            return (
                              <TableCell key={`${columnName}-${idx}`} className="text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setClaimType('professional');
                                      setSelectedPatientId(undefined);
                                      setShowClaimForm(true);
                                    }}
                                  >
                                    Open
                                  </Button>
                                </div>
                              </TableCell>
                            );
                          }

                          const value = getColumnValue(claim, columnName);
                          const isStatus = columnName === 'Status';
                          const isNumeric = ['Claim ID', 'Total Charges', 'Balance', 'Amount'].includes(columnName);
                          
                          return (
                            <TableCell 
                              key={`${columnName}-${idx}`}
                              className={
                                isStatus 
                                  ? getStatusColor(claim.status)
                                  : isNumeric
                                  ? 'text-gray-900 font-medium'
                                  : 'text-gray-600'
                              }
                            >
                              {value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </>
        ) : topSection === 'denial' ? (
          <>
            {/* Denial Management Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Total Denials</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Denial Rate</p>
                  <p className="text-2xl font-bold text-orange-600">16.7%</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Avg Appeal Time</p>
                  <p className="text-2xl font-bold text-blue-700">14 days</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">78%</p>
                </CardContent>
              </Card>
            </div>

            {/* Sub-tabs */}
            <div className="mb-4">
              <div className="w-full bg-gray-50 border border-gray-200 rounded-md px-2 py-1 flex gap-2">
                <button
                  onClick={() => setDenialSubTab('active')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    denialSubTab === 'active' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Active Denials
                </button>
                <button
                  onClick={() => setDenialSubTab('analytics')}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    denialSubTab === 'analytics' 
                      ? 'bg-white text-gray-900 font-medium shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setDenialSubTab('ai-insights')}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    denialSubTab === 'ai-insights' 
                      ? 'bg-white text-gray-900 font-medium shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  AI Insights
                </button>
                <button
                  onClick={() => setDenialSubTab('workflows')}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    denialSubTab === 'workflows' 
                      ? 'bg-white text-gray-900 font-medium shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Workflows
                </button>
              </div>
            </div>

            {/* Denied Claims List - Show different content based on sub-tab */}
            {denialSubTab === 'active' && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="text-red-500">⚠️</div>
                    Denied Claims Requiring Action
                  </h3>

                  <div className="mt-4 border rounded p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">Denied</span>
                          <strong>CLM-2024-003</strong>
                        </div>
                        <div className="text-sm text-gray-600">
                          Patient: Mike Wilson | Provider: Dr. Brown
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Amount: $85.00 | Service Date: 2024-01-09
                        </div>
                        <div className="flex gap-2 mt-3">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">Auth Required</span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">Missing Documentation</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" className="text-sm">AI Analysis</Button>
                        <Button className="bg-blue-600 text-white text-sm">Generate Appeal</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {denialSubTab === 'analytics' && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Denial Analytics</h3>
                  <p className="text-gray-600">Analytics dashboard for denial trends and patterns will be displayed here.</p>
                </CardContent>
              </Card>
            )}
            
            {denialSubTab === 'ai-insights' && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
                  <p className="text-gray-600">AI-powered insights and recommendations for denial management will be displayed here.</p>
                </CardContent>
              </Card>
            )}
            
            {denialSubTab === 'workflows' && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflows</h3>
                  <p className="text-gray-600">Automated workflows for denial management will be displayed here.</p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* AI Analytics Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Avg Risk Score</p>
                  <p className="text-2xl font-bold text-gray-900">41.2%</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Flagged Claims</p>
                  <p className="text-2xl font-bold text-orange-600">3</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Potential Savings</p>
                  <p className="text-2xl font-bold text-green-600">$12,450</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Automation Rate</p>
                  <p className="text-2xl font-bold text-green-600">78%</p>
                </CardContent>
              </Card>
            </div>

            {/* Two-column analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div className="lg:col-span-2">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Risk Distribution</h4>
                    <div className="h-40 bg-gray-50 rounded border border-gray-100 flex items-center justify-center text-gray-400">[Chart Placeholder]</div>
                    <div className="text-center mt-2 text-sm text-gray-500">Total Claims Analyzed<br/><strong>{stats.total}</strong></div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Issues Detected</h4>
                    <div className="space-y-2">
                      <div className="p-2 border rounded bg-gray-50">Missing Prior Authorization <span className="ml-2 text-xs text-red-600">High</span></div>
                      <div className="p-2 border rounded bg-gray-50">Incomplete Documentation <span className="ml-2 text-xs text-yellow-600">Medium</span></div>
                      <div className="p-2 border rounded bg-gray-50">Coding Inconsistencies <span className="ml-2 text-xs text-yellow-600">Medium</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* AI-Powered Recommendations */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">AI-Powered Recommendations</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-gray-600">Automate Prior Authorization Checks</p>
                    <p className="text-xs text-gray-500 mt-2">Implement automated prior auth verification before service delivery</p>
                    <div className="mt-3 flex justify-end">
                      <Button 
                        size="sm"
                        onClick={() => {
                          alert('Automate Prior Authorization Checks feature will be implemented. This will set up automated verification before service delivery.');
                        }}
                      >
                        Implement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-gray-600">Standardize Documentation Templates</p>
                    <p className="text-xs text-gray-500 mt-2">Create standardized templates for common procedures</p>
                    <div className="mt-3 flex justify-end">
                      <Button 
                        size="sm"
                        onClick={() => {
                          alert('Standardize Documentation Templates feature will be implemented. This will create standardized templates for common procedures.');
                        }}
                      >
                        Implement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-gray-600">Enhanced Coding Training</p>
                    <p className="text-xs text-gray-500 mt-2">Regular training on coding accuracy and updates</p>
                    <div className="mt-3 flex justify-end">
                      <Button 
                        size="sm"
                        onClick={() => {
                          alert('Enhanced Coding Training feature will be implemented. This will set up regular training on coding accuracy and updates.');
                        }}
                      >
                        Implement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Next Week</p>
                  <p className="text-2xl font-bold text-gray-900">3-5</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">At Risk</p>
                  <p className="text-2xl font-bold text-orange-600">$15.4K</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">94%</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Trend</p>
                  <p className="text-2xl font-bold text-blue-600">↑ 18%</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Select Columns Modal */}
        <Dialog open={showColumnSelector} onOpenChange={setShowColumnSelector}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Select Columns</DialogTitle>
              <DialogDescription>
                Choose which columns to display in the claims table
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6 py-4">
              {/* Available Columns */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Available Columns</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableColumns.map((column) => (
                    <div
                      key={column}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-gray-900">{column}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setAvailableColumns(availableColumns.filter(c => c !== column));
                          setVisibleColumns([...visibleColumns, column]);
                        }}
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visible Columns */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Visible Columns</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {visibleColumns.map((column) => (
                    <div
                      key={column}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-gray-900">{column}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setVisibleColumns(visibleColumns.filter(c => c !== column));
                          setAvailableColumns([...availableColumns, column]);
                        }}
                      >
                        <X className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={() => setShowColumnSelector(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Professional Claim Form */}
        {showClaimForm && (
          <ProfessionalClaimForm
            isOpen={showClaimForm}
            patientId={selectedPatientId}
            claimType={claimType}
            onClose={() => {
              setShowClaimForm(false);
              setSelectedPatientId(undefined);
            }}
          />
        )}
      </div>
    </div>
  );
}
