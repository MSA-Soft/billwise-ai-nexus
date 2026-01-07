/**
 * Eligibility & Benefits Verification Component
 * X12 270/271 EDI compliant eligibility verification with comprehensive form handling
 */

//#region Imports
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  CreditCard, 
  Search, 
  Download, 
  Upload, 
  FileText,
  FileDown, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building,
  Plus,
  Columns3,
  Trash2,
  Eye,
  Edit,
  Copy,
  RefreshCw,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Calculator,
  Printer,
  CreditCard as CreditCardIcon,
  FileCheck,
  Save,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Stethoscope
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getEDIService, EligibilityRequest, EligibilityResponse } from "@/services/ediService";
import { getCodeValidationService } from "@/services/codeValidationService";
import { supabase } from "@/integrations/supabase/client";
import { eligibilityAuditService } from "@/services/eligibilityAuditService";
import { useAuth } from "@/contexts/AuthContext";
import AuthorizationRequestDialog from '@/components/AuthorizationRequestDialog';
import { PatientRegistrationForm } from '@/components/PatientRegistrationForm';
//#endregion

type HistoryDownloadFormat = "xlsx" | "csv" | "pdf" | "json";

//#region Component
const EligibilityVerification = () => {
  //#region Hooks & Services
  const { toast } = useToast();
  const { user, currentCompany, isSuperAdmin } = useAuth();
  //#endregion

  //#region State - Loading & Results
  const [isLoading, setIsLoading] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResponse | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);
  const [patients, setPatients] = useState<Array<{ patient_id: string | null; patient_name: string | null; id: string }>>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [facilities, setFacilities] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);
  const [providers, setProviders] = useState<Array<{ id: string; npi: string; first_name: string; last_name: string; title?: string }>>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [nppList, setNppList] = useState<Array<{ id: string; name: string; npi: string }>>([]);
  const [isLoadingNpp, setIsLoadingNpp] = useState(false);
  const [payers, setPayers] = useState<any[]>([]);
  const [isLoadingPayers, setIsLoadingPayers] = useState(false);
  const [verificationSerialNo, setVerificationSerialNo] = useState(1);
  const [cptCodeFees, setCptCodeFees] = useState<Map<string, number>>(new Map());
  const [estimateTemplates, setEstimateTemplates] = useState<Array<{ id: string; name: string; data: any }>>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);
  const [showAbnDialog, setShowAbnDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPatientEditModal, setShowPatientEditModal] = useState(false);
  const [showPatientRegistrationModal, setShowPatientRegistrationModal] = useState(false);
  // Dynamic columns for verification history
  const [historyVisibleColumns, setHistoryVisibleColumns] = useState<string[]>([
    "S.No",
    "Patient",
    "Payer",
    "Plan Type",
    "Network Status",
    "Eligible",
    "Deductible Remaining",
    "Out-of-Pocket Remaining",
    "Method",
    "Date",
  ]);
  const [historyAvailableColumns, setHistoryAvailableColumns] = useState<string[]>([
    "Referral Required",
    "Prior Auth Required",
    "Previous Balance",
    "Patient Responsibility",
    "Current Visit Amount",
  ]);
  const [showHistoryColumnSelector, setShowHistoryColumnSelector] = useState(false);
  const [historyDragIndex, setHistoryDragIndex] = useState<number | null>(null);
  const [expandedHistoryRows, setExpandedHistoryRows] = useState<Record<string, boolean>>({});
  const [historyDownloadFormat, setHistoryDownloadFormat] = useState<HistoryDownloadFormat>("xlsx");
  const historyArrayMove = <T,>(arr: T[], from: number, to: number) => {
    const next = arr.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  };
  //#endregion

  //#region State - Patient Management
  const [patientIdSearch, setPatientIdSearch] = useState("");
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [patientComboboxOpen, setPatientComboboxOpen] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [posComboboxOpen, setPosComboboxOpen] = useState(false);
  const [posSearchQuery, setPosSearchQuery] = useState("");
  const [tosComboboxOpen, setTosComboboxOpen] = useState(false);
  const [tosSearchQuery, setTosSearchQuery] = useState("");
  
  // State for POS and TOS codes (configured from database, not hardcoded)
  const [placeOfServiceCodes, setPlaceOfServiceCodes] = useState<Array<{code: string; description: string}>>([]);
  const [typeOfServiceCodes, setTypeOfServiceCodes] = useState<Array<{code: string; description: string}>>([]);
  
  // Fetch POS and TOS codes from database
  useEffect(() => {
    const fetchCodes = async () => {
      try {
        // Try to fetch POS codes from database
        const { data: posData, error: posError } = await supabase
          .from('place_of_service_codes' as any)
          .select('code, description')
          .order('code', { ascending: true });
          
        if (!posError && posData && Array.isArray(posData)) {
          setPlaceOfServiceCodes(posData as any);
        }
        
        // Try to fetch TOS codes from database
        const { data: tosData, error: tosError } = await supabase
          .from('type_of_service_codes' as any)
          .select('code, description')
          .order('code', { ascending: true });
          
        if (!tosError && tosData && Array.isArray(tosData)) {
          setTypeOfServiceCodes(tosData as any);
        }
      } catch (error) {
        console.warn('Could not fetch POS/TOS codes from database. Please configure place_of_service_codes and type_of_service_codes tables:', error);
      }
    };
    
    fetchCodes();
  }, []);
  
  // SQL to create tables if needed (for reference):
  /*
  CREATE TABLE place_of_service_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  CREATE TABLE type_of_service_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  */
  
  
  const [showQuickAddPatient, setShowQuickAddPatient] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    insuranceId: "",
    groupNumber: ""
  });
  //#endregion

  const getHistoryColumnHeader = (column: string) => {
    switch (column) {
      case "S.No":
        return "S.No";
      case "Patient":
        return "Patient";
      case "Payer":
        return "Payer";
      case "Plan Type":
        return "Plan Type";
      case "Network Status":
        return "Network";
      case "Eligible":
        return "Eligibility";
      case "Deductible Remaining":
        return "Deductible Remaining";
      case "Out-of-Pocket Remaining":
        return "Out-of-Pocket Remaining";
      case "Method":
        return "Contact Via";
      case "Date":
        return "Date";
      case "Referral Required":
        return "Referral Required";
      case "Prior Auth Required":
        return "Prior Auth Required";
      case "Previous Balance":
        return "Previous Balance";
      case "Patient Responsibility":
        return "PT Responsibility";
      case "Current Visit Amount":
        return "Current Visit";
      default:
        return column;
    }
  };

  const getHistoryColumnValue = (entry: any, column: string) => {
    switch (column) {
      case "S.No":
        // rendered using row index
        return "—";
      case "Patient":
        return entry.patientName || entry.patientId || "—";
      case "Payer":
        return entry.payerId || "—";
      case "Plan Type":
        return entry.planType || "—";
      case "Network Status":
        return entry.inNetworkStatus || "—";
      case "Eligible":
        return entry.isEligible ? "Eligible" : "InEligible";
      case "Deductible Remaining":
        return entry.deductibleRemaining ?? "—";
      case "Out-of-Pocket Remaining":
        return entry.outOfPocketRemaining ?? "—";
      case "Method":
        return entry.verificationMethod || "—";
      case "Date":
        return entry.timestamp
          ? new Date(entry.timestamp).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            })
          : "—";
      case "Referral Required":
        return entry.referralRequired ? "Yes" : "No";
      case "Prior Auth Required":
        return entry.preAuthorizationRequired ? "Yes" : "No";
      case "Previous Balance":
        return entry.previousBalanceCredit ?? "0.00";
      case "Patient Responsibility":
        return entry.patientResponsibility ?? "0.00";
      case "Current Visit Amount":
        return entry.currentVisitAmount ?? "0.00";
      default:
        return "—";
    }
  };

  //#region State - Verification Form
  const [verificationForm, setVerificationForm] = useState({
    serialNo: "",
    description: "", // Service description
    providerId: "", // Provider selection
    providerName: "", // Provider display name
    nppId: "", // Non-Physician Practitioner ID
    nppName: "", // Non-Physician Practitioner name
    appointmentLocation: "",
    appointmentDate: "",
    dateOfService: "",
    demographic: "",
    typeOfVisit: "",
    serviceType: "", // Inpatient, Outpatient, Emergency, etc.
    status: "pending" as "pending" | "verified" | "completed" | "cancelled",
    isSelfPay: false,
    patientName: "",
    patientId: "", // External patient ID (PAT-001) for display
    patientUuid: "", // Internal UUID from patients.id for database
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    patientGender: "",
    patientAddress: "",
    patientCity: "",
    patientState: "",
    patientZip: "",
    patientPhone: "",
    subscriberIsPatient: true,
    subscriberId: "",
    subscriberFirstName: "",
    subscriberLastName: "",
    subscriberMiddleInitial: "",
    subscriberDOB: "",
    subscriberGender: "",
    subscriberRelationship: "", // Self, Spouse, Child, Parent, etc.
    subscriberAddress: "",
    subscriberCity: "",
    subscriberState: "",
    subscriberZip: "",
    primaryInsurance: "",
    primaryInsuranceId: "",
    insuranceId: "",
    groupNumber: "",
    insurancePlan: "",
    planType: "",
    effectiveDate: "",
    terminationDate: "",
    coPay: "",
    coInsurance: "",
    deductible: "",
    deductibleMet: "",
    outOfPocketRemaining: "",
    outOfPocketMax: "",
    inNetworkStatus: "",
    allowedAmount: "",
    copayBeforeDeductible: true,
    deductibleStatus: "Met" as "Met" | "Not Met",
    deductibleAmount: "",
    cptCodes: [] as Array<{
      code: string;
      modifier1: string;
      modifier2: string;
      icd: string; // Linked ICD code
      pos: string; // Place of Service
      tos: string; // Type of Service
      units: string;
      charge: string;
    }>,
    icdCodes: [] as Array<{
      code: string;
      description: string;
      type: string;
      isPrimary: boolean;
    }>,
    currentCpt: {
      code: "",
      modifier1: "",
      modifier2: "",
      icd: "", // ICD code linked to this CPT
      pos: "",
      tos: "",
      units: "",
      charge: "",
    },
    // Current ICD row being edited (kept for compatibility)
    currentIcd: {
      code: "",
      description: "",
      type: "DX", // DX = Diagnosis, PX = Procedure
      isPrimary: false,
    },
    
    // Secondary Insurance
    secondaryInsuranceName: "",
    secondaryInsurance: "",
    secondaryInsuranceCoverage: "",
    secondaryInsuranceId: "", // Subscriber/Member ID
    secondaryGroupNumber: "",
    secondaryRelationshipCode: "", // Self, Spouse, Child, Parent, Other
    secondaryEffectiveDate: "",
    secondaryTerminationDate: "",
    secondarySubscriberFirstName: "",
    secondarySubscriberLastName: "",
    secondarySubscriberDOB: "",
    secondarySubscriberGender: "",
    secondaryCoPay: "",
    secondaryDeductible: "",
    secondaryDeductibleMet: "",
    secondaryCoInsurance: "",
    secondaryPolicyHolderName: "",
    secondaryPolicyHolderRelationship: "",
    cobRule: "", // Auto-detect or manual: Birthday Rule, Employee Rule, Medicare Rule, etc.
    cobIndicator: "S" as "P" | "S" | "T" | "A", // Primary, Secondary, Tertiary, Unknown
    
    // Referral & Authorization
    referralRequired: false,
    referralStatus: "active", // Active or Inactive
    referralObtainedFrom: "", // "PCP" or "Insurance Approved PCP"
    referralPCPStatus: "", // "On File" or "Required" (only if obtained from PCP)
    referralNumber: "",
    preAuthorizationRequired: false,
    priorAuthNumber: "",
    priorAuthStatus: "", // Not Started, Request Submitted, Pending, Under Review, Approved, Denied, Expired, Cancelled
    priorAuthRequestDate: "",
    priorAuthSubmissionDate: "",
    priorAuthSubmissionMethod: "", // Electronic (X12 278), Portal, Fax, Email, Phone
    priorAuthPayerConfirmationNumber: "",
    priorAuthExpectedResponseDate: "",
    priorAuthResponseDate: "",
    priorAuthEffectiveDate: "",
    priorAuthExpirationDate: "",
    priorAuthDenialReasonCode: "",
    priorAuthDenialReason: "",
    priorAuthApprovedQuantity: "",
    priorAuthApprovedFrequency: "",
    priorAuthServiceDate: "",
    priorAuthAppealSubmitted: false,
    priorAuthAppealDate: "",
    priorAuthAppealStatus: "", // Pending, Approved, Denied
    priorAuthAppealDecisionDate: "",
    
    // Financial Information
    previousBalanceCredit: "",
    patientResponsibility: "",
    collection: "",
    estimatedCost: "",
    // Visit amounts
    billedAmount: "",
    // QMB and Coverage
    isQMB: false, // Qualified Medicare Beneficiary
    isCoveredService: true, // Is service Medicare covered
    // Insurance Payments
    primaryPayment: "", // Amount paid by primary insurance
    secondaryPayment: "", // Amount paid by secondary insurance (if any)
    // Coverage percents (prototype-driven)
    primaryCoveragePercent: "",
    secondaryCoveragePercent: "",
    
    // Additional Information
    remarks: "",
    comments: "",
    commentEntries: [] as Array<{id: string, text: string, attachments: Array<{id: string, name: string, type: string, size: number, content: string, uploadedAt: string}>, timestamp: string, author: string}>,
    attachments: [] as Array<{id: string, name: string, type: string, size: number, content: string, uploadedAt: string}>,
    dateChecked: new Date().toISOString().split('T')[0],
    verifiedBy: "", // User who performed verification
    checkBy: "", // Current user who checked (QA/Review)
    verificationMethod: "manual", // manual, automated, portal
    demographicChangesMade: false,
    qa: false,
    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    // Policy Holder Information
    policyHolderName: "",
    policyHolderRelationship: "",
    // Medical Information
    knownAllergies: "",
    currentMedications: "",
    medicalConditions: "",
    previousSurgeries: "",
    familyHistory: "",
    // Demographic display (read-only, populated when patient selected)
    demographicDisplay: {
      patientId: "",
      firstName: "",
      lastName: "",
      middleInitial: "",
      suffix: "",
      dob: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      ssn: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
    } as {
      patientId: string;
      firstName: string;
      lastName: string;
      middleInitial: string;
      suffix: string;
      dob: string;
      gender: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      ssn: string;
      emergencyContactName: string;
      emergencyContactPhone: string;
      emergencyContactRelation: string;
    },
  });
  
  // Monitor CPT codes for Surgery TOS and automatically set prior authorization
  useEffect(() => {
    const hasSurgeryTos = verificationForm.cptCodes.some(
      cpt => (cpt.tos || "").toUpperCase() === "2" // TOS code 2 = Surgery
    );
    
    // Only update if there's a mismatch between TOS and prior auth status
    if (hasSurgeryTos && !verificationForm.preAuthorizationRequired) {
      // Surgery TOS is present but prior auth is not set - enable it
      setVerificationForm(prev => ({ ...prev, preAuthorizationRequired: true }));
    }
  }, [verificationForm.cptCodes]);
  
  // Enhanced form state
  const [formData, setFormData] = useState({
    // Patient Information
    patientId: "",
    patientLastName: "",
    patientFirstName: "",
    patientMiddleInitial: "",
    patientSuffix: "",
    patientDob: "",
    patientGender: "",
    patientSsn: "",
    patientPhone: "",
    patientEmail: "",
    patientAddress: "",
    patientCity: "",
    patientState: "",
    patientZip: "",
    
    // Subscriber Information
    subscriberId: "",
    subscriberLastName: "",
    subscriberFirstName: "",
    subscriberMiddleInitial: "",
    subscriberSuffix: "",
    subscriberDob: "",
    subscriberGender: "",
    subscriberSsn: "",
    subscriberPhone: "",
    subscriberEmail: "",
    subscriberAddress: "",
    subscriberCity: "",
    subscriberState: "",
    subscriberZip: "",
    subscriberRelationship: "",
    
    // Insurance Information
    payerId: "",
    groupNumber: "",
    policyNumber: "",
    effectiveDate: "",
    terminationDate: "",
    
    // Service Information
    serviceDate: "",
    serviceCodes: [] as string[],
    diagnosisCodes: [] as string[],
    priorAuthRequired: false,
    priorAuthNumber: "",
    
    // Additional Information
    providerNpi: "",
    facilityId: "",
    notes: "",
  });

  const [currentServiceCode, setCurrentServiceCode] = useState("");
  const [currentDiagnosisCode, setCurrentDiagnosisCode] = useState("");
  const [batchVerification, setBatchVerification] = useState(false);
  const [batchData, setBatchData] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFormDialog, setShowFormDialog] = useState(false);
  
  // Filter states
  const [filterGroup1, setFilterGroup1] = useState("dateOfService"); // dateOfService, patient, noAppointment
  const [filterGroup2, setFilterGroup2] = useState("today"); // year, month, biweekly, weekly, today, tomorrow, custom
  const [filterGroup3, setFilterGroup3] = useState({ checked: true, unchecked: true }); // checked/unchecked
  
  // Hierarchical filter states (Year → Month → Time Period) - default to current week
  const initialNow = new Date();
  const initialYear = initialNow.getFullYear().toString();
  const initialMonth = (initialNow.getMonth() + 1).toString();
  const initialWeek = (Math.floor((initialNow.getDate() - 1) / 7) + 1).toString();

  const [selectedFilterYear, setSelectedFilterYear] = useState<string>(initialYear); // Selected year for filtering
  const [selectedFilterMonth, setSelectedFilterMonth] = useState<string>(initialMonth); // Selected month for filtering
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>("week"); // Selected time period (whole month, custom, 15 days, week, yesterday, today, tomorrow)
  const [selectedWeek, setSelectedWeek] = useState<string>(initialWeek); // Selected week (1, 2, 3, 4)
  const [selectedDay, setSelectedDay] = useState<string>(""); // Selected day (monday, tuesday, etc.)
  
  // Filter value states
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [customRangeStart, setCustomRangeStart] = useState("");
  const [customRangeEnd, setCustomRangeEnd] = useState("");

  // Fetch verification history from database
  useEffect(() => {
    const fetchVerificationHistory = async () => {
      // Super admins can see all records, regular users need a company
      if (!isSuperAdmin && !currentCompany) {
        console.log('Waiting for company to load...');
        return;
      }

      try {
        if (isSuperAdmin) {
          console.log('👑 Super admin - fetching all verification records');
        } else {
          console.log('Fetching verification history for company:', currentCompany.id);
        }
        
        // Build query with company_id filter
        // Super admins see all records, regular users see only their company's records
        let data: any[] | null = null;
        let error: any = null;
        
        try {
          let query = supabase
            .from('eligibility_verifications' as any)
            .select('*');
          
          // Only filter by company_id if not super admin
          if (!isSuperAdmin && currentCompany) {
            query = query.eq('company_id', currentCompany.id);
            console.log('🔍 Query filter: company_id =', currentCompany.id);
          } else if (isSuperAdmin) {
            console.log('🔍 Query filter: None (super admin - showing all records)');
          }
          
          query = query
            .order('created_at', { ascending: false })
            .limit(500);

          const result = await query;
          data = result.data;
          error = result.error;
        } catch (queryError: any) {
          console.error('❌ Query execution error:', queryError);
          error = queryError;
        }

        if (error) {
          console.error('❌ Error fetching verification history:', error);
          console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          
          // Log the actual query being executed for debugging
          console.error('❌ Query attempted:', {
            table: 'eligibility_verifications',
            filter: isSuperAdmin ? 'None (super admin)' : `company_id = ${currentCompany?.id}`,
            company_id: currentCompany?.id,
            isSuperAdmin
          });
          
          // If table doesn't exist, start with empty array
          if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
            console.warn('Eligibility verifications table does not exist');
            setVerificationHistory([]);
            return;
          }
          
          // If permission denied, it might be RLS issue
          if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('policy')) {
            console.error('RLS Policy Error - Permission denied. Check Row Level Security policies.');
            toast({
              title: 'Permission Error',
              description: 'Unable to load verification history. Please check database permissions and RLS policies.',
              variant: 'destructive',
            });
            setVerificationHistory([]);
            return;
          }
          
          toast({
            title: 'Error loading verification history',
            description: error.message || 'Failed to load verification history',
            variant: 'destructive',
          });
          setVerificationHistory([]);
          return;
        }

        console.log('✅ Fetched verification history:', data?.length || 0, 'records');
        if (data && data.length > 0) {
          const firstRecord = data[0] as any;
          console.log('📋 Sample record:', {
            id: firstRecord.id,
            company_id: firstRecord.company_id,
            patient_name: firstRecord.patient_name,
            created_at: firstRecord.created_at
          });
        } else {
          if (isSuperAdmin) {
            console.warn('⚠️ No verification records found (super admin view)');
          } else {
            console.warn('⚠️ No verification records found for company:', currentCompany.id);
          }
          // Diagnostic: Check if ANY records exist (without company filter)
          const { data: allData, error: allError } = await supabase
            .from('eligibility_verifications' as any)
            .select('id, company_id, patient_name, created_at')
            .limit(5);
          
          if (allError) {
            console.error('🔍 Diagnostic query error:', allError);
            console.error('🔍 Error code:', allError.code);
            console.error('🔍 Error message:', allError.message);
            console.error('🔍 Error details:', allError.details);
            console.error('🔍 Error hint:', allError.hint);
            
            if (allError.code === '42501' || allError.message?.includes('permission denied') || allError.message?.includes('policy')) {
              console.error('🚨 RLS POLICY ISSUE: Row Level Security is blocking access to eligibility_verifications table');
              toast({
                title: 'RLS Policy Issue',
                description: 'Row Level Security policies are preventing access to eligibility verifications. Please check your database RLS policies.',
                variant: 'destructive',
              });
            }
          } else if (allData) {
            console.log('🔍 Diagnostic: Found', allData.length, 'total records in database (any company)');
            if (allData.length > 0) {
              console.log('🔍 Sample records:', (allData as any[]).map((r: any) => ({
                id: r.id,
                company_id: r.company_id,
                patient_name: r.patient_name
              })));
              console.warn('⚠️ Records exist but don\'t match company filter. Company IDs in records:', 
                (allData as any[]).map((r: any) => r.company_id));
            } else {
              console.warn('⚠️ No records found in database at all (RLS may be blocking or table is empty)');
            }
          }
          
          // Additional diagnostic: Try querying with user_id filter
          try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
              console.log('🔍 Testing user-specific query for user:', currentUser.id);
              const { data: userData, error: userError } = await supabase
                .from('eligibility_verifications' as any)
                .select('id, company_id, user_id, patient_name, created_at')
                .eq('user_id', currentUser.id)
                .limit(5);
              
              if (userError) {
                console.error('🔍 User-specific query error:', userError);
                console.error('🔍 Error code:', userError.code);
                console.error('🔍 Error message:', userError.message);
                if (userError.code === '42501' || userError.message?.includes('permission denied')) {
                  console.error('🚨 RLS BLOCKING: Cannot query even with user_id filter - RLS policies are too restrictive');
                }
              } else {
                console.log('🔍 Found', userData?.length || 0, 'records for current user:', currentUser.id);
                if (userData && userData.length > 0) {
                  console.log('🔍 User records company IDs:', (userData as any[]).map((r: any) => r.company_id));
                  console.warn('⚠️ Records exist for user but not matching company filter. This suggests RLS allows user-based access but company filter may be the issue.');
                } else {
                  console.warn('⚠️ No records found even with user_id filter - RLS may be blocking all access or table is empty');
                }
              }
              
              // Also try a count query to see if we can access the table at all
              const { count, error: countError } = await supabase
                .from('eligibility_verifications' as any)
                .select('*', { count: 'exact', head: true });
              
              if (countError) {
                console.error('🔍 Count query error:', countError);
              } else {
                console.log('🔍 Total records in table (via count):', count);
                if (count && count > 0) {
                  console.warn('⚠️ Table has', count, 'records but query returned 0 - RLS is filtering them out');
                }
              }
            }
          } catch (userErr) {
            console.error('🔍 Error checking user-specific records:', userErr);
          }
        }

        // Transform database records to match component's expected format
        const recordData = Array.isArray(data) ? data : [];
        
        // Collect all unique facility IDs from records.
        // IMPORTANT: Some legacy records store a location name (e.g. "Downtown") in appointment_location.
        // The facilities table expects UUIDs in the id column, so we must only send valid UUIDs to .in('id', ...).
        const rawFacilityIds = recordData
          .map((r: any) => r.facility_id || r.appointment_location)
          .filter(Boolean);

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const facilityIds = [...new Set(rawFacilityIds.filter((id: string) => uuidRegex.test(id)))];
        
        // Fetch facility names for all valid UUID IDs
        const facilityNameMap = new Map<string, string>();
        if (facilityIds.length > 0) {
          try {
            const { data: facilityData, error: facilityError } = await supabase
              .from('facilities' as any)
              .select('id, name')
              .in('id', facilityIds);
            
            if (!facilityError && facilityData) {
              facilityData.forEach((f: any) => {
                facilityNameMap.set(f.id, f.name);
              });
              // Update facilities state with fetched facilities
              setFacilities(prev => {
                const existingIds = new Set(prev.map(f => f.id));
                const newFacilities = facilityData.filter((f: any) => !existingIds.has(f.id));
                return [...prev, ...newFacilities.map((f: any) => ({ id: f.id, name: f.name }))];
              });
            }
          } catch (err) {
            console.warn('Could not fetch facility names:', err);
          }
        }
        
        // Helper function to get facility name from ID
        const getFacilityName = (facilityId: string | null | undefined): string => {
          if (!facilityId) return '';
          // First check the map from database
          if (facilityNameMap.has(facilityId)) {
            return facilityNameMap.get(facilityId)!;
          }
          // Then check facilities state
          const facility = facilities.find(f => f.id === facilityId);
          return facility ? facility.name : facilityId; // Return ID if facility not found
        };
        
        const transformedHistory = recordData.map((record: any) => {
          // Get facility name from ID
          const appointmentLocationId = record.appointment_location || record.facility_id || '';
          const appointmentLocationName = getFacilityName(appointmentLocationId);
          
          return {
            id: record.id,
            timestamp: record.created_at || record.date_checked || new Date().toISOString(),
            patientId: record.patient_id || '',
            patientName: record.patient_name || '',
            payerId: record.primary_insurance_name || '',
            isEligible: record.is_eligible || false,
            coverage: {
              copay: parseFloat(record.copay || 0),
              deductible: parseFloat(record.deductible || 0),
              coinsurance: record.coinsurance ? `${record.coinsurance}%` : '0%',
              outOfPocketMax: record.out_of_pocket_max || ''
            },
            planType: record.plan_type || '',
            effectiveDate: record.effective_date || '',
            terminationDate: record.termination_date || '',
            inNetworkStatus: record.in_network_status || '',
            serialNo: record.serial_no || `VER-${record.id.substring(0, 8)}`,
            appointmentLocation: appointmentLocationName || appointmentLocationId || '', // Use name if available, fallback to ID
            appointmentDate: record.appointment_date || record.date_of_service || '',
            dateOfService: record.date_of_service || '',
            typeOfVisit: record.type_of_visit || '',
            serviceType: record.service_type || '',
            patientDob: record.patient_dob || '',
            patientGender: record.patient_gender || '',
            providerName: record.provider_name || '',
            nppName: record.npp_name || '',
            insuranceId: record.insurance_id || '',
            memberId: record.insurance_id || '', // Alias for display
            groupNumber: record.group_number || '',
            totalCollectible: parseFloat(record.collection_amount || record.patient_responsibility || 0).toFixed(2),
            referralRequired: record.referral_required || false,
            preAuthorizationRequired: record.pre_authorization_required || false,
            previousBalanceCredit: parseFloat(record.previous_balance_credit || 0).toFixed(2),
            patientResponsibility: parseFloat(record.patient_responsibility || 0).toFixed(2),
            currentVisitAmount: parseFloat(record.estimated_cost || record.billed_amount || 0).toFixed(2),
            remarks: record.remarks || '',
            notes: record.remarks || '', // Alias for display
            verificationMethod: record.verification_method || 'manual',
            created_by: record.verified_by || '',
            created_by_name: record.verified_by || '',
            verified_by: record.verified_by || '',
            allowedAmount: parseFloat(record.allowed_amount || 0),
            estimatedResponsibility: parseFloat(record.patient_responsibility || 0),
            copayBeforeDeductible: record.copay_before_deductible !== undefined ? record.copay_before_deductible : true,
            coinsurance: record.coinsurance ? `${record.coinsurance}%` : '0%',
            deductible: parseFloat(record.deductible || 0),
            copay: parseFloat(record.copay || 0),
            outOfPocketMax: record.out_of_pocket_max || '',
            deductibleMet: record.deductible_status === 'Met' || record.deductible_met === true,
            outOfPocketRemaining: record.out_of_pocket_remaining || ''
          };
        });

        setVerificationHistory(transformedHistory);
      } catch (error: any) {
        console.error('Error fetching verification history:', error);
        setVerificationHistory([]);
      }
    };

    fetchVerificationHistory();
  }, [currentCompany, facilities, isSuperAdmin]); // Also depend on facilities and isSuperAdmin

  // Edit dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<any | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [verifyingIds, setVerifyingIds] = useState<string[]>([]);
  
  // Real-time validation state
  const [cptValidation, setCptValidation] = useState<{
    isValid: boolean;
    description: string;
    warnings: string[];
    errors: string[];
  } | null>(null);
  const [icdValidation, setIcdValidation] = useState<{
    isValid: boolean;
    description: string;
    warnings: string[];
    errors: string[];
  } | null>(null);
  const [modifierValidation, setModifierValidation] = useState<{
    modifier1: { isValid: boolean; message: string } | null;
    modifier2: { isValid: boolean; message: string } | null;
  }>({ modifier1: null, modifier2: null });

  const openEdit = (entry: any) => {
    setEditEntry({ ...entry });
    setIsEditOpen(true);
  };

  const handleEditChange = (field: string, value: any) => {
    if (!editEntry) return;
    if (field.startsWith('coverage.')) {
      const [, key] = field.split('.');
      setEditEntry({ ...editEntry, coverage: { ...editEntry.coverage, [key]: value } });
    } else {
      setEditEntry({ ...editEntry, [field]: value });
    }
  };

  const saveEdit = async () => {
    if (!editEntry) return;
    // Update in database
    try {
      const { error: updateError } = await supabase
        .from('eligibility_verifications' as any)
        .update({
          patient_name: editEntry.patientName,
          appointment_location: editEntry.appointmentLocation,
          appointment_date: editEntry.appointmentDate,
          type_of_visit: editEntry.typeOfVisit,
          remarks: editEntry.remarks,
          updated_at: new Date().toISOString()
        })
        .eq('id', editEntry.id);

      if (updateError) {
        console.error('Error updating verification in database:', updateError);
        toast({
          title: 'Warning',
          description: 'Verification updated locally but database update failed',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error updating verification:', error);
    }

    setVerificationHistory(prev => prev.map(e => e.id === editEntry.id ? editEntry : e));
    setIsEditOpen(false);
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const expandAll = () => setExpandedRows(verificationHistory.map(e => e.id));
  const collapseAll = () => setExpandedRows([]);

  const copySummary = async (entry: any) => {
    const estimated = entry.estimatedResponsibility;
    const fallbackTotal = (entry.coverage?.copay ?? 0) + (entry.coverage?.deductible ?? 0);
    const total = estimated ?? entry.totalCollectible ?? fallbackTotal;
    const text = `Eligibility for ${entry.patientName || entry.patientId}
S.No: ${entry.serialNo || '-'}
Payer: ${entry.payerId}
Status: ${entry.isEligible ? 'Eligible' : 'InEligible'}
Plan: ${entry.planType || '-'}
Network: ${entry.inNetworkStatus || '-'}
Appointment Location: ${entry.appointmentLocation || '-'}
DOS/Appt Date: ${entry.appointmentDate || '-'}
Type of Visit: ${entry.typeOfVisit || '-'}
Copay: $${entry.coverage?.copay ?? 0}
Deductible: $${entry.coverage?.deductible ?? 0}
Coinsurance: ${entry.coverage?.coinsurance ?? '-'}
Allowed Amount: $${entry.allowedAmount ?? '-'}
Estimated Responsibility: $${estimated ?? '-'}
Total Collectible: $${total}
Effective: ${entry.effectiveDate || '-'}
Termination: ${entry.terminationDate || '-'}`;
    try { await navigator.clipboard.writeText(text); toast({ title: 'Copied', description: 'Summary copied to clipboard' }); } catch {}
  };

  const duplicateToForm = (entry: any) => {
    setVerificationForm(v => ({
      ...v,
      // Patient Information
      patientId: entry.patientId || v.patientId,
      patientName: entry.patientName || v.patientName,
      dob: entry.patientDob || entry.patient_dob || v.dob,
      patientGender: entry.patientGender || entry.patient_gender || v.patientGender,
      patientAddress: entry.patientAddress || entry.patient_address || v.patientAddress,
      patientCity: entry.patientCity || entry.patient_city || v.patientCity,
      patientState: entry.patientState || entry.patient_state || v.patientState,
      patientZip: entry.patientZip || entry.patient_zip || v.patientZip,
      patientPhone: entry.patientPhone || entry.patient_phone || v.patientPhone,
      
      // Appointment Information
      appointmentDate: entry.appointmentDate || entry.appointment_date || v.appointmentDate,
      dateOfService: entry.dateOfService || entry.date_of_service || v.dateOfService,
      appointmentLocation: entry.appointmentLocation || entry.appointment_location || v.appointmentLocation,
      typeOfVisit: entry.typeOfVisit || entry.type_of_visit || v.typeOfVisit,
      serviceType: entry.serviceType || entry.service_type || v.serviceType,
      
      // Insurance Information
      primaryInsurance: entry.payerId || entry.primary_insurance_name || v.primaryInsurance,
      insuranceId: entry.insuranceId || entry.insurance_id || v.insuranceId,
      insurancePlan: entry.insurancePlan || entry.insurance_plan || v.insurancePlan,
      groupNumber: entry.groupNumber || entry.group_number || v.groupNumber,
      planType: entry.planType || entry.plan_type || v.planType,
      effectiveDate: entry.effectiveDate || entry.effective_date || v.effectiveDate,
      terminationDate: entry.terminationDate || entry.termination_date || v.terminationDate,
      
      // Financial Information
      coPay: String(entry.coverage?.copay ?? entry.copay ?? entry.co_pay ?? v.coPay),
      coInsurance: String(entry.coverage?.coinsurance ?? entry.coinsurance ?? entry.co_insurance ?? v.coInsurance),
      deductible: String(entry.coverage?.deductible ?? entry.deductible ?? v.deductible),
      deductibleStatus: entry.deductibleStatus || entry.deductible_status || v.deductibleStatus,
      deductibleAmount: String(entry.deductibleAmount ?? entry.deductible_amount ?? v.deductibleAmount),
      outOfPocketRemaining: String(entry.outOfPocketRemaining ?? entry.out_of_pocket_remaining ?? v.outOfPocketRemaining),
      outOfPocketMax: String(entry.outOfPocketMax ?? entry.out_of_pocket_max ?? v.outOfPocketMax),
      inNetworkStatus: entry.inNetworkStatus || entry.in_network_status || v.inNetworkStatus,
      allowedAmount: String(entry.allowedAmount ?? entry.allowed_amount ?? v.allowedAmount),
      
      // Provider Information
      providerId: entry.providerId || entry.provider_id || v.providerId,
      providerName: entry.providerName || entry.provider_name || v.providerName,
      nppId: entry.nppId || entry.npp_id || v.nppId,
      nppName: entry.nppName || entry.npp_name || v.nppName,
      
      // Secondary Insurance
      secondaryInsuranceName: entry.secondaryInsuranceName || entry.secondary_insurance_name || v.secondaryInsuranceName,
      secondaryInsuranceCoverage: entry.secondaryInsuranceCoverage || entry.secondary_insurance_coverage || v.secondaryInsuranceCoverage,
      secondaryInsuranceId: entry.secondaryInsuranceId || entry.secondary_insurance_id || v.secondaryInsuranceId,
      secondaryGroupNumber: entry.secondaryGroupNumber || entry.secondary_group_number || v.secondaryGroupNumber,
      
      // Referral & Authorization
      referralRequired: entry.referralRequired || entry.referral_required || v.referralRequired,
      referralNumber: entry.referralNumber || entry.referral_number || v.referralNumber,
      preAuthorizationRequired: entry.preAuthorizationRequired || entry.pre_authorization_required || v.preAuthorizationRequired,
      priorAuthNumber: entry.priorAuthNumber || entry.prior_auth_number || v.priorAuthNumber,
      
      // Financial Information
      previousBalanceCredit: String(entry.previousBalanceCredit ?? entry.previous_balance_credit ?? v.previousBalanceCredit),
      patientResponsibility: String(entry.patientResponsibility ?? entry.patient_responsibility ?? v.patientResponsibility),
      collection: String(entry.collection ?? v.collection),
      estimatedCost: String(entry.estimatedCost ?? entry.estimated_cost ?? v.estimatedCost),
      
      // Additional Information
      remarks: entry.remarks || v.remarks,
      comments: entry.comments || v.comments,
      commentEntries: entry.commentEntries || entry.comment_entries || v.commentEntries,
      dateChecked: entry.dateChecked || entry.date_checked || new Date().toISOString().split('T')[0],
      verificationMethod: entry.verificationMethod || entry.verification_method || v.verificationMethod,
      demographicChangesMade: entry.demographicChangesMade || entry.demographic_changes_made || v.demographicChangesMade,
      qa: entry.qa || v.qa,
      
      // CPT and ICD Codes (if available in the entry)
      // Prefer full JSON details when available, otherwise map simple code arrays to full objects
      cptCodes: entry.cptCodes
        || entry.cpt_details
        || (Array.isArray(entry.cpt_codes)
          ? entry.cpt_codes.map((code: string) => ({
              code,
              modifier1: "",
              modifier2: "",
              icd: "",
              pos: "",
              tos: "",
              units: "",
              charge: "",
            }))
          : v.cptCodes),
      icdCodes: entry.icdCodes
        || entry.icd_details
        || (Array.isArray(entry.icd_codes)
          ? entry.icd_codes.map((code: string) => ({
              code,
              description: "",
              type: "DX",
              isPrimary: false,
            }))
          : v.icdCodes),
      
      // Status
      status: entry.status || v.status,
      
      // QMB and Coverage
      isQMB: entry.isQMB || entry.is_qmb || v.isQMB,
      isCoveredService: entry.isCoveredService || entry.is_covered_service || v.isCoveredService,
      
      // Insurance Payments
      primaryPayment: String(entry.primaryPayment ?? entry.primary_payment ?? v.primaryPayment),
      secondaryPayment: String(entry.secondaryPayment ?? entry.secondary_payment ?? v.secondaryPayment),
      
      // Coverage percents
      primaryCoveragePercent: String(entry.primaryCoveragePercent ?? entry.primary_coverage_percent ?? v.primaryCoveragePercent),
      secondaryCoveragePercent: String(entry.secondaryCoveragePercent ?? entry.secondary_coverage_percent ?? v.secondaryCoveragePercent),
      
      // Self Pay
      isSelfPay: entry.isSelfPay || entry.is_self_pay || v.isSelfPay,
      
      // Demographics
      demographic: entry.demographic || v.demographic,
      
      // Subscriber information
      subscriberIsPatient: entry.subscriberIsPatient || entry.subscriber_is_patient || v.subscriberIsPatient,
      subscriberId: entry.subscriberId || entry.subscriber_id || v.subscriberId,
      subscriberFirstName: entry.subscriberFirstName || entry.subscriber_first_name || v.subscriberFirstName,
      subscriberLastName: entry.subscriberLastName || entry.subscriber_last_name || v.subscriberLastName,
      subscriberDOB: entry.subscriberDOB || entry.subscriber_dob || v.subscriberDOB,
      subscriberGender: entry.subscriberGender || entry.subscriber_gender || v.subscriberGender,
      subscriberRelationship: entry.subscriberRelationship || entry.subscriber_relationship || v.subscriberRelationship,
    }));
    toast({ title: 'Prefilled', description: 'Form prefilled from history entry' });
  };

  const reverifyEntry = async (entry: any) => {
    setVerifyingIds(prev => [...prev, entry.id]);
    // Simulate a re-verification with a short delay and slight randomization
    await new Promise(r => setTimeout(r, 800));
    const updated = {
      ...entry,
      isEligible: Math.random() > 0.2, // 80% eligible
      coverage: {
        ...entry.coverage,
        copay: Math.max(0, (entry.coverage?.copay ?? 0) + (Math.random() > 0.5 ? 5 : -5)),
        deductible: Math.max(0, (entry.coverage?.deductible ?? 0)),
      },
      timestamp: new Date().toISOString(),
    };
      // Update in database
      try {
        const { error: updateError } = await supabase
          .from('eligibility_verifications' as any)
          .update({
            is_eligible: updated.isEligible,
            copay: updated.coverage?.copay || 0,
            deductible: updated.coverage?.deductible || 0,
            coinsurance: updated.coverage?.coinsurance ? parseFloat(updated.coverage.coinsurance.replace('%', '')) : 0,
            verification_result: updated,
            updated_at: new Date().toISOString(),
            status: 'verified' // Status tracks verification completion, not eligibility. Use is_eligible boolean for eligibility status.
          })
          .eq('id', entry.id);

        if (updateError) {
          console.error('Error updating verification in database:', updateError);
        }
      } catch (error: any) {
        console.error('Error updating verification:', error);
      }

      setVerificationHistory(prev => prev.map(e => e.id === entry.id ? updated : e));
      setVerifyingIds(prev => prev.filter(id => id !== entry.id));
      toast({ title: 'Re-verified', description: `Updated result for ${entry.patientId}` });
  };

  const mockPayers = [
    { id: "MEDICARE", name: "Medicare", type: "Government" },
    { id: "MEDICAID", name: "Medicaid", type: "Government" },
    { id: "BCBS", name: "Blue Cross Blue Shield", type: "Commercial" },
    { id: "AETNA", name: "Aetna", type: "Commercial" },
    { id: "CIGNA", name: "Cigna", type: "Commercial" },
    { id: "HUMANA", name: "Humana", type: "Commercial" },
    { id: "UHC", name: "UnitedHealthcare", type: "Commercial" },
    { id: "ANTHEM", name: "Anthem", type: "Commercial" },
    { id: "KAISER", name: "Kaiser Permanente", type: "Commercial" },
    { id: "MOLINA", name: "Molina Healthcare", type: "Commercial" },
  ];

  const genders = [
    { value: "M", label: "Male" },
    { value: "F", label: "Female" },
    { value: "O", label: "Other" },
    { value: "U", label: "Unknown" },
  ];

  const relationships = [
    { value: "self", label: "Self" },
    { value: "spouse", label: "Spouse" },
    { value: "child", label: "Child" },
    { value: "parent", label: "Parent" },
    { value: "sibling", label: "Sibling" },
    { value: "other", label: "Other" },
  ];

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
  ];

  // Generate year options (current year and past 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());
  
  // Check if selected year is current year
  const isCurrentYear = selectedFilterYear === currentYear.toString();
  
  // Check if selected month is current month
  const currentMonth = new Date().getMonth() + 1;
  const isCurrentMonth = selectedFilterYear === currentYear.toString() && selectedFilterMonth === currentMonth.toString();
  
  // Get current date info
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Month options
  const monthOptions = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Fetch patients from database on component mount (patients table)
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
          // Only show toast if it's not a table missing error (to avoid spam)
          if (!error.message?.includes('relation') && !error.message?.includes('does not exist')) {
            toast({
              title: "Error",
              description: error.message || "Failed to load patients. Please ensure the patients table exists and RLS policies are configured.",
              variant: "destructive",
            });
          }
          setPatients([]);
          return;
        }

        // Filter out duplicates and null values, create display-friendly format
        const patientData = Array.isArray(data) ? data : [];
        const uniquePatients = patientData
          .filter((p: any) => p?.patient_id || p?.first_name || p?.last_name)
          .map((p: any) => ({
            id: p.id,
            patient_id: p.patient_id || `TEMP-${p.id}`,
            patient_name: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || `Patient ${p.patient_id || p.id}`,
          }));

        // Remove duplicates based on patient_id
        const seen = new Set<string>();
        const unique = uniquePatients.filter(p => {
          if (seen.has(p.patient_id)) return false;
          seen.add(p.patient_id);
          return true;
        });

        setPatients(unique);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setIsLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [toast]);

  // Fetch facilities for appointment location dropdown
  useEffect(() => {
    const fetchFacilities = async () => {
      setIsLoadingFacilities(true);
      try {
        // Try to fetch from facilities table, if it doesn't exist, use mock data
        const { data, error } = await supabase
          .from('facilities' as any)
          .select('id, name')
          .eq('status', 'active')
          .order('name', { ascending: true })
          .limit(100);

        if (error) {
          console.log('Facilities table not found, using mock data');
          // Fallback to mock facilities if table doesn't exist
          setFacilities([
            { id: '1', name: 'Main Office' },
            { id: '2', name: 'Downtown Clinic' },
            { id: '3', name: 'North Branch' },
            { id: '4', name: 'South Medical Center' },
          ]);
          return;
        }

        if (data) {
          setFacilities((data as any) || []);
        } else {
          setFacilities([
            { id: '1', name: 'Main Office' },
            { id: '2', name: 'Downtown Clinic' },
            { id: '3', name: 'North Branch' },
            { id: '4', name: 'South Medical Center' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
        // Fallback to mock facilities
        setFacilities([
          { id: '1', name: 'Main Office' },
          { id: '2', name: 'Downtown Clinic' },
          { id: '3', name: 'North Branch' },
          { id: '4', name: 'South Medical Center' },
        ]);
      } finally {
        setIsLoadingFacilities(false);
      }
    };

    fetchFacilities();
  }, []);

  // Fetch providers for provider dropdown
  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoadingProviders(true);
      try {
        const { data, error } = await supabase
          .from('providers' as any)
          .select('id, npi, first_name, last_name, title')
          .eq('is_active', true)
          .order('last_name', { ascending: true })
          .limit(500);

        if (error) {
          console.log('Providers table not found, using mock data');
          setProviders([
            { id: '1', npi: '1234567890', first_name: 'John', last_name: 'Smith', title: 'MD' },
            { id: '2', npi: '2345678901', first_name: 'Jane', last_name: 'Doe', title: 'DO' },
            { id: '3', npi: '3456789012', first_name: 'Robert', last_name: 'Johnson', title: 'MD' },
          ]);
          return;
        }

        if (data) {
          setProviders((data as any) || []);
        } else {
          setProviders([
            { id: '1', npi: '1234567890', first_name: 'John', last_name: 'Smith', title: 'MD' },
            { id: '2', npi: '2345678901', first_name: 'Jane', last_name: 'Doe', title: 'DO' },
            { id: '3', npi: '3456789012', first_name: 'Robert', last_name: 'Johnson', title: 'MD' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
        setProviders([
          { id: '1', npi: '1234567890', first_name: 'John', last_name: 'Smith', title: 'MD' },
          { id: '2', npi: '2345678901', first_name: 'Jane', last_name: 'Doe', title: 'DO' },
          { id: '3', npi: '3456789012', first_name: 'Robert', last_name: 'Johnson', title: 'MD' },
        ]);
      } finally {
        setIsLoadingProviders(false);
      }
    };

    fetchProviders();
  }, []);

  // Fetch NPP (Non-Physician Practitioners) - typically Physician Assistants, Nurse Practitioners, etc.
  useEffect(() => {
    const fetchNpp = async () => {
      setIsLoadingNpp(true);
      try {
        // Try to fetch from providers table with NPP filter, or use mock data
        const { data, error } = await supabase
          .from('providers' as any)
          .select('id, npi, first_name, last_name, title')
          .eq('is_active', true)
          .or('title.ilike.%PA%,title.ilike.%NP%,title.ilike.%Nurse Practitioner%,title.ilike.%Physician Assistant%')
          .order('last_name', { ascending: true })
          .limit(100);

        if (error || !data || data.length === 0) {
          // Mock NPP data
          setNppList([
            { id: 'npp1', name: 'Sarah Johnson, PA-C', npi: '9876543210' },
            { id: 'npp2', name: 'Michael Brown, NP', npi: '8765432109' },
            { id: 'npp3', name: 'Emily Davis, PA', npi: '7654321098' },
          ]);
          return;
        }

        setNppList((data as any).map((p: any) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}${p.title ? `, ${p.title}` : ''}`,
          npi: p.npi
        })));
      } catch (error) {
        console.error('Error fetching NPP:', error);
        setNppList([
          { id: 'npp1', name: 'Sarah Johnson, PA-C', npi: '9876543210' },
          { id: 'npp2', name: 'Michael Brown, NP', npi: '8765432109' },
          { id: 'npp3', name: 'Emily Davis, PA', npi: '7654321098' },
        ]);
      } finally {
        setIsLoadingNpp(false);
      }
    };

    fetchNpp();
  }, []);

  // Generate serial number and set checkBy when form opens
  useEffect(() => {
    if (showFormDialog) {
      // Generate serial number based on timestamp or increment
      const timestamp = Date.now();
      const serialNo = `VER-${timestamp.toString().slice(-8)}`;
      // Set checkBy to current user
      const currentUserEmail = user?.email || '';
      setVerificationForm(prev => ({ 
        ...prev, 
        serialNo,
        checkBy: currentUserEmail,
        verifiedBy: currentUserEmail,
      }));
    }
  }, [showFormDialog, user]);

  // Handle patient selection from dropdown
  const handlePatientSelect = async (selectedPatientId: string) => {
    if (!selectedPatientId || selectedPatientId === "none") {
      return;
    }

    setIsSearchingPatient(true);
    try {
      // Find the patient in the patients list
      const selectedPatient = patients.find(p => 
        p.patient_id === selectedPatientId || p.id === selectedPatientId
      );

      if (!selectedPatient) {
        toast({
          title: "Error",
          description: "Selected patient not found in list.",
          variant: "destructive",
        });
        return;
      }

      // Load full patient data from database
      // Try to find by patient_id first, then by id
      let queryBuilder = supabase
        .from('patients' as any)
        .select(`
          id,
          patient_id, 
          first_name, 
          last_name,
          middle_initial,
          suffix,
          email, 
          phone, 
          date_of_birth, 
          gender, 
          address_line1, 
          city, 
          state, 
          zip_code,
          ssn
        `);

      if (selectedPatient.patient_id) {
        queryBuilder = queryBuilder.eq('patient_id', selectedPatient.patient_id);
      } else {
        queryBuilder = queryBuilder.eq('id', selectedPatient.id);
      }

      const { data, error } = await queryBuilder.single();

      if (error) {
        console.error('Error loading patient data:', error);
        throw error;
      }

      if (!data) {
        toast({
          title: "Error",
          description: "Patient data not found in database.",
          variant: "destructive",
        });
        return;
      }

      // Patient found - auto-populate ALL form fields from database
      const patientData = data as any;
      const fullName = `${patientData.last_name ?? ''}, ${patientData.first_name ?? ''}`.trim().replace(/^,|,$/g, '');
      
      // Format DOB if it exists
      let formattedDob = '';
      if (patientData.date_of_birth) {
        const dobDate = new Date(patientData.date_of_birth);
        if (!isNaN(dobDate.getTime())) {
          formattedDob = dobDate.toISOString().split('T')[0];
        }
      }

      // Fetch insurance information from patient_insurance table if it exists
      let insuranceData = null;
      try {
        const { data: insData, error: insError } = await supabase
          .from('patient_insurance' as any)
          .select('primary_insurance_id, primary_group_number, primary_insurance_company')
          .eq('patient_id', selectedPatient.id)
          .maybeSingle();
        
        if (!insError && insData) {
          insuranceData = insData;
        }
      } catch (insErr) {
        // Insurance data is optional, so we don't throw error
        console.log('Insurance data not available:', insErr);
      }
      
      setVerificationForm(prev => ({
        ...prev,
        // Patient Information - ALL from database
        patientId: patientData.patient_id || selectedPatient.patient_id || selectedPatientId, // External ID for display
        patientUuid: selectedPatient.id || '', // UUID for database
        patientName: fullName,
        dob: formattedDob || prev.dob,
        patientGender: patientData.gender || prev.patientGender,
        patientPhone: patientData.phone || "",
        patientAddress: patientData.address_line1 || prev.patientAddress,
        patientCity: patientData.city || prev.patientCity,
        patientState: patientData.state || prev.patientState,
        patientZip: patientData.zip_code || prev.patientZip,
        // Insurance information from patient_insurance table if available
        insuranceId: insuranceData?.primary_insurance_id || prev.insuranceId,
        groupNumber: insuranceData?.primary_group_number || prev.groupNumber,
        primaryInsurance: insuranceData?.primary_insurance_company || prev.primaryInsurance,
        // Populate demographic display (read-only)
        demographicDisplay: {
          patientId: patientData.patient_id || selectedPatient.patient_id || selectedPatientId,
          firstName: patientData.first_name || "",
          lastName: patientData.last_name || "",
          middleInitial: patientData.middle_initial || "",
          suffix: patientData.suffix || "",
          dob: formattedDob || "",
          gender: patientData.gender || "",
          phone: patientData.phone || "",
          email: patientData.email || "",
          address: patientData.address_line1 || "",
          city: patientData.city || "",
          state: patientData.state || "",
          zip: patientData.zip_code || "",
          ssn: patientData.ssn || "",
          emergencyContactName: patientData.emergency_contact_name || "",
          emergencyContactPhone: patientData.emergency_contact_phone || "",
          emergencyContactRelation: patientData.emergency_contact_relation || "",
        },
      }));

      // Update patient ID search field
      setPatientIdSearch(patientData.patient_id || selectedPatient.patient_id || selectedPatientId);

      toast({
        title: "Patient Selected",
        description: `Patient data loaded: ${fullName || patientData.patient_id}`,
      });
    } catch (error) {
      console.error('Error loading patient:', error);
      toast({
        title: "Error",
        description: "Failed to load patient data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearchingPatient(false);
    }
  };

  // Search for patient by ID and auto-populate form
  const searchPatientById = async (patientId: string) => {
    if (!patientId.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a Patient ID to search",
        variant: "destructive",
      });
      return;
    }

    setIsSearchingPatient(true);
    try {
      // Normalize patient ID for search (handle variations like PAT-001, P001, etc.)
      const searchTerm = patientId.trim();
      const normalizedId = searchTerm.toUpperCase().replace(/^PAT-?/, '');
      
      // Try multiple search patterns for better matching
      const searchPatterns = [
        `patient_id.ilike.%${normalizedId}%`,
        `patient_id.ilike.%PAT-${normalizedId}%`,
        `patient_id.ilike.%P-${normalizedId}%`,
        `patient_id.ilike.%${searchTerm}%`,
        `patient_id.eq.${searchTerm}`,
        `patient_id.eq.${normalizedId}`,
      ];
      
      // Search in patients table with insurance information
      const { data, error } = await supabase
        .from('patients' as any)
        .select(`
          id,
          patient_id, 
          first_name, 
          last_name,
          middle_initial,
          suffix,
          email, 
          phone, 
          date_of_birth, 
          gender, 
          address_line1, 
          city, 
          state, 
          zip_code,
          ssn,
          demographic,
          primary_insurance_id,
          insurance_member_id,
          insurance_group_number
        `)
        .or(searchPatterns.join(','))
        .limit(5);
      
      if (error) {
        console.error('Patient search error:', error);
        throw error;
      }

      // Find exact match first, then partial match
      let patient = null;
      if (data && data.length > 0) {
        // Try exact match first
        patient = data.find((p: any) => 
          p.patient_id?.toUpperCase() === searchTerm.toUpperCase() ||
          p.patient_id?.toUpperCase() === normalizedId ||
          p.patient_id?.toUpperCase().replace(/^PAT-?/, '') === normalizedId
        ) || (data as any)[0];
      }

      if (!patient) {
        // Patient not found - show quick add dialog
        setShowQuickAddPatient(true);
        toast({
          title: "Patient Not Found",
          description: "Patient not found. Please add patient using Quick Add.",
          variant: "default",
        });
        return;
      }

      // Patient found - auto-populate ALL form fields from database
      const patientData = patient as any;
      const fullName = `${patientData.last_name ?? ''}, ${patientData.first_name ?? ''}`.trim().replace(/^,|,$/g, '');
      
      // Format DOB if it exists
      let formattedDob = '';
      if (patientData.date_of_birth) {
        const dobDate = new Date(patientData.date_of_birth);
        if (!isNaN(dobDate.getTime())) {
          formattedDob = dobDate.toISOString().split('T')[0];
        }
      }
      
      setVerificationForm(prev => ({
        ...prev,
        // Patient Information - ALL from database
        patientId: patientData.patient_id || patientId, // External ID for display
        patientUuid: patientData.id || '', // UUID for database
        patientName: fullName,
        dob: formattedDob || prev.dob,
        patientGender: patientData.gender || prev.patientGender,
        patientPhone: patientData.phone || "",
        patientAddress: patientData.address_line1 || prev.patientAddress,
        patientCity: patientData.city || prev.patientCity,
        patientState: patientData.state || prev.patientState,
        patientZip: patientData.zip_code || prev.patientZip,
        // Demographic from database
        demographic: patientData.demographic || prev.demographic,
        // Insurance information if available
        insuranceId: patientData.insurance_member_id || prev.insuranceId,
        groupNumber: patientData.insurance_group_number || prev.groupNumber,
        // Populate demographic display (read-only)
        demographicDisplay: {
          patientId: patientData.patient_id || patientId,
          firstName: patientData.first_name || "",
          lastName: patientData.last_name || "",
          middleInitial: patientData.middle_initial || "",
          suffix: patientData.suffix || "",
          dob: formattedDob || "",
          gender: patientData.gender || "",
          phone: patientData.phone || "",
          email: patientData.email || "",
          address: patientData.address_line1 || "",
          city: patientData.city || "",
          state: patientData.state || "",
          zip: patientData.zip_code || "",
          ssn: patientData.ssn || "",
          emergencyContactName: patientData.emergency_contact_name || "",
          emergencyContactPhone: patientData.emergency_contact_phone || "",
          emergencyContactRelation: patientData.emergency_contact_relation || "",
        },
      }));

      // Update patient list if not already there
      const exists = patients.find(p => p.patient_id === (patient as any).patient_id);
      if (!exists && (patient as any).patient_id) {
        setPatients(prev => [...prev, {
          id: (patient as any).id || (patient as any).patient_id,
          patient_id: (patient as any).patient_id,
          patient_name: `${(patient as any).first_name ?? ''} ${(patient as any).last_name ?? ''}`.trim()
        }]);
      }

      // Update patient ID search field
      setPatientIdSearch(patientData.patient_id || patientId);

      toast({
        title: "Patient Found",
        description: `Patient data loaded: ${`${(patient as any).first_name ?? ''} ${(patient as any).last_name ?? ''}`.trim() || (patient as any).patient_id}`,
      });
    } catch (error) {
      console.error('Error searching patient:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for patient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearchingPatient(false);
    }
  };

  // Handle quick add patient submission
  const handleQuickAddPatient = async () => {
    if (!quickAddForm.firstName.trim() || !quickAddForm.lastName.trim() || !quickAddForm.dob) {
      toast({
        title: "Validation Error",
        description: "First name, last name, and date of birth are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate patient ID if not provided
      const { generatePatientId } = await import('@/utils/patientIdGenerator').catch(() => {
        // Fallback if dynamic import fails, use a simple generator
        return { generatePatientId: async () => `PAT-${Date.now()}` };
      });
      const patientId = patientIdSearch.trim() || await generatePatientId();
      const patientName = `${quickAddForm.lastName}, ${quickAddForm.firstName}`.trim().replace(/^,|,$/g, '');

      // Create patient record in patients table
      const { data, error } = await supabase
        .from('patients' as any)
        .insert({
          patient_id: patientId,
          first_name: quickAddForm.firstName,
          last_name: quickAddForm.lastName,
          date_of_birth: quickAddForm.dob,
          gender: quickAddForm.gender || null,
          phone: quickAddForm.phone || null,
          email: quickAddForm.email || null,
          address_line1: quickAddForm.address || null,
          city: quickAddForm.city || null,
          state: quickAddForm.state || null,
          zip_code: quickAddForm.zip || null,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-populate verification form with new patient data
      setVerificationForm(prev => ({
        ...prev,
        patientId: patientId, // External ID (PAT-001)
        patientUuid: (data as any)?.id || '', // UUID from database
        patientName: patientName,
        dob: quickAddForm.dob,
        patientGender: quickAddForm.gender,
        patientPhone: quickAddForm.phone,
        patientAddress: quickAddForm.address,
        patientCity: quickAddForm.city,
        patientState: quickAddForm.state,
        patientZip: quickAddForm.zip,
        insuranceId: quickAddForm.insuranceId,
        groupNumber: quickAddForm.groupNumber
      }));

      // Update patients list
      setPatients(prev => [...prev, {
        id: (data as any).id,
        patient_id: patientId,
        patient_name: patientName
      }]);

      // Close quick add dialog and reset form
      setShowQuickAddPatient(false);
      setQuickAddForm({
        firstName: "",
        lastName: "",
        dob: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        insuranceId: "",
        groupNumber: ""
      });
      setPatientIdSearch("");

      toast({
        title: "Patient Added",
        description: `Patient ${patientName} has been added successfully.`,
      });
    } catch (error: any) {
      console.error('Error adding patient:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add patient. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Modifier validation function
  const validateModifier = (modifier: string, cptCode: string): { isValid: boolean; message: string } => {
    if (!modifier || modifier.trim() === "") {
      return { isValid: true, message: "" }; // Empty modifier is valid
    }

    const cleanModifier = modifier.trim().toUpperCase();
    
    // Valid CPT modifiers (common ones)
    const validModifiers = [
      // Performance/Procedure Modifiers
      '25', '26', '27', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '62', '63', '66', '76', '77', '78', '79', '80', '81', '82', '99',
      // Anesthesia Modifiers
      'AA', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY',
      // Pricing Modifiers
      'EP', 'GA', 'GC', 'GE', 'GR', 'GY', 'GZ',
      // Informational Modifiers
      'LT', 'RT', 'E1', 'E2', 'E3', 'E4', 'FA', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'TA', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9',
      // Other common modifiers
      '90', '91', '92', '93', '95', '96', '97'
    ];

    if (validModifiers.includes(cleanModifier)) {
      // Additional context-specific validation
      if (cleanModifier === '25' && cptCode) {
        // Modifier 25 should be used with E&M codes
        const isEMCode = ['99201', '99202', '99203', '99204', '99205', '99211', '99212', '99213', '99214', '99215'].includes(cptCode);
        if (!isEMCode) {
          return { isValid: true, message: "Modifier 25 typically used with E&M codes" };
        }
      }
      if (cleanModifier === '59' && cptCode) {
        return { isValid: true, message: "Modifier 59 indicates distinct procedural service" };
      }
      return { isValid: true, message: "Valid modifier" };
    } else {
      return { isValid: false, message: "Invalid modifier code" };
    }
  };

  // Insurance-Specific CPT Fee Schedules (Prototype)
  // Allowed amounts vary by insurance company - negotiated rates per contract
  const insuranceFeeSchedules: Record<string, Record<string, number>> = {
    'MEDICARE': {
      '99213': 110.00,
      '99214': 160.00,
      '99215': 210.00,
      '99201': 85.00,
      '99202': 95.00,
      '99203': 105.00,
      '99204': 145.00,
      '99205': 190.00,
      '36415': 20.00,
      '80053': 35.00,
      '85025': 25.00,
    },
    'MEDICAID': {
      '99213': 90.00,
      '99214': 130.00,
      '99215': 170.00,
      '99201': 70.00,
      '99202': 80.00,
      '99203': 90.00,
      '99204': 120.00,
      '99205': 150.00,
      '36415': 15.00,
      '80053': 25.00,
      '85025': 20.00,
    },
    'BCBS': {
      '99213': 150.00,
      '99214': 200.00,
      '99215': 250.00,
      '99201': 100.00,
      '99202': 120.00,
      '99203': 140.00,
      '99204': 180.00,
      '99205': 220.00,
      '36415': 25.00,
      '80053': 45.00,
      '85025': 30.00,
    },
    'AETNA': {
      '99213': 145.00,
      '99214': 195.00,
      '99215': 245.00,
      '99201': 95.00,
      '99202': 115.00,
      '99203': 135.00,
      '99204': 175.00,
      '99205': 215.00,
      '36415': 24.00,
      '80053': 42.00,
      '85025': 28.00,
    },
    'CIGNA': {
      '99213': 140.00,
      '99214': 190.00,
      '99215': 240.00,
      '99201': 90.00,
      '99202': 110.00,
      '99203': 130.00,
      '99204': 170.00,
      '99205': 210.00,
      '36415': 23.00,
      '80053': 40.00,
      '85025': 27.00,
    },
    'UHC': {
      '99213': 155.00,
      '99214': 205.00,
      '99215': 255.00,
      '99201': 105.00,
      '99202': 125.00,
      '99203': 145.00,
      '99204': 185.00,
      '99205': 225.00,
      '36415': 26.00,
      '80053': 48.00,
      '85025': 32.00,
    },
    'HUMANA': {
      '99213': 148.00,
      '99214': 198.00,
      '99215': 248.00,
      '99201': 98.00,
      '99202': 118.00,
      '99203': 138.00,
      '99204': 178.00,
      '99205': 218.00,
      '36415': 24.50,
      '80053': 43.00,
      '85025': 29.00,
    },
    'ANTHEM': {
      '99213': 152.00,
      '99214': 202.00,
      '99215': 252.00,
      '99201': 102.00,
      '99202': 122.00,
      '99203': 142.00,
      '99204': 182.00,
      '99205': 222.00,
      '36415': 25.50,
      '80053': 46.00,
      '85025': 31.00,
    },
  };

  // Initialize CPT code fees (prototype - will be replaced by insurance-specific lookup)
  useEffect(() => {
    // Use default/fallback fees if no insurance selected
    const defaultFees = new Map([
      ['99213', 150.00],
      ['99214', 200.00],
      ['99215', 250.00],
      ['99201', 100.00],
      ['99202', 120.00],
      ['99203', 140.00],
      ['99204', 180.00],
      ['99205', 220.00],
      ['36415', 25.00],
      ['80053', 45.00],
      ['85025', 30.00],
    ]);
    setCptCodeFees(defaultFees);
  }, []);

  // Get allowed amount for CPT code based on selected insurance
  const getAllowedAmountForCPT = (cptCode: string, insuranceId: string): number | null => {
    if (!cptCode || !insuranceId) return null;
    const schedule = insuranceFeeSchedules[insuranceId.toUpperCase()];
    if (schedule && schedule[cptCode]) {
      return schedule[cptCode];
    }
    return null;
  };

  // Coverage percents config (prototype; admin-editable in real module)
  const coverageConfig: Record<string, Record<string, { primary: number; secondary: number }>> = {
    'MEDICARE': { '99213': { primary: 20, secondary: 40 } },
    'MEDICAID': { '99213': { primary: 80, secondary: 20 } },
    'COMMERCIAL_PPO': { '99213': { primary: 70, secondary: 0 } },
  };

  const getConfigFor = (payerId: string, cptCode: string): { allowed: number | null; primaryPercent: number | null; secondaryPercent: number | null } => {
    const allowed = getAllowedAmountForCPT(cptCode, payerId);
    const percents = coverageConfig[payerId]?.[cptCode] || null;
    return {
      allowed: allowed !== null ? allowed : null,
      primaryPercent: percents ? percents.primary : null,
      secondaryPercent: percents ? percents.secondary : null,
    };
  };

  // Real-time CPT code validation and insurance-specific allowed amount fetching
  useEffect(() => {
    const code = verificationForm.currentCpt.code.trim();
    const insuranceId = verificationForm.primaryInsurance || '';
    
    if (!code || code.length === 0) {
      setCptValidation(null);
      return;
    }

    if (code.length >= 5) {
      const validateCode = async () => {
        try {
          const codeService = getCodeValidationService();
          const result = await codeService.validateCPT(code);
          setCptValidation({
            isValid: result.isValid,
            description: result.description || "",
            warnings: result.warnings || [],
            errors: result.errors || [],
          });
          
          // Auto-populate charge dynamically when CPT code is entered
          if (result.isValid) {
            let feeToUse: number | null = null;
            
            // First try insurance-specific fee schedule / config
            if (insuranceId) {
              const cfg = getConfigFor(insuranceId, code);
              feeToUse = cfg.allowed;
              // Populate coverage percents from config if empty
              if (cfg.primaryPercent !== null && (!verificationForm.primaryCoveragePercent || verificationForm.primaryCoveragePercent === '')) {
                setVerificationForm(prev => ({ ...prev, primaryCoveragePercent: String(cfg.primaryPercent) }));
              }
              if (cfg.secondaryPercent !== null && (!verificationForm.secondaryCoveragePercent || verificationForm.secondaryCoveragePercent === '')) {
                setVerificationForm(prev => ({ ...prev, secondaryCoveragePercent: String(cfg.secondaryPercent) }));
              }
            }
            
            // If no insurance-specific found, use fallback/default fees
            if (feeToUse === null && cptCodeFees.has(code)) {
              feeToUse = cptCodeFees.get(code) || null;
            }
            
            // Always populate charge when fee is found (overwrites existing value)
            if (feeToUse !== null) {
              setVerificationForm(prev => ({
                ...prev,
                currentCpt: { ...prev.currentCpt, charge: feeToUse!.toFixed(2) }
              }));
              
              // Also update the main allowed amount
              setVerificationForm(prev => ({
                ...prev,
                allowedAmount: feeToUse!.toFixed(2)
              }));
            }
          }
        } catch (error) {
          console.error("CPT validation error:", error);
          setCptValidation({
            isValid: false,
            description: "",
            warnings: [],
            errors: ["Error validating CPT code"],
          });
        }
      };
      
      validateCode();
    } else {
      setCptValidation(null);
    }
  }, [verificationForm.currentCpt.code, verificationForm.primaryInsurance, cptCodeFees]);

  // Real-time ICD code validation
  useEffect(() => {
    const code = verificationForm.currentIcd.code.trim();
    if (!code || code.length === 0) {
      setIcdValidation(null);
      return;
    }

    if (code.length >= 3) {
      const validateCode = async () => {
        try {
          const codeService = getCodeValidationService();
          const result = await codeService.validateICD10(code);
          setIcdValidation({
            isValid: result.isValid,
            description: result.description || "",
            warnings: result.warnings || [],
            errors: result.errors || [],
          });
          
          // Auto-fill description
          if (result.description && !verificationForm.currentIcd.description) {
            setVerificationForm(prev => ({
              ...prev,
              currentIcd: { ...prev.currentIcd, description: result.description }
            }));
          }
        } catch (error) {
          console.error("ICD validation error:", error);
          setIcdValidation({
            isValid: false,
            description: "",
            warnings: [],
            errors: ["Error validating ICD code"],
          });
        }
      };
      
      validateCode();
    } else {
      setIcdValidation(null);
    }
  }, [verificationForm.currentIcd.code]);

  // Real-time modifier validation
  useEffect(() => {
    const cptCode = verificationForm.currentCpt.code.trim();
    const modifier1 = verificationForm.currentCpt.modifier1.trim();
    const modifier2 = verificationForm.currentCpt.modifier2.trim();

    setModifierValidation({
      modifier1: modifier1 ? validateModifier(modifier1, cptCode) : null,
      modifier2: modifier2 ? validateModifier(modifier2, cptCode) : null,
    });
  }, [
    verificationForm.currentCpt.modifier1,
    verificationForm.currentCpt.modifier2,
    verificationForm.currentCpt.code,
  ]);


  // Enhanced validation for new verification form
  const validateVerificationForm = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required fields per X12 270/271 standards and industry best practices
    if (!verificationForm.appointmentLocation) errors.push("Appointment Location is required");
    if (!verificationForm.appointmentDate) errors.push("Appointment Date is required");
    if (!verificationForm.typeOfVisit) errors.push("Type Of Visit is required");
    if (!verificationForm.patientId) errors.push("Patient Name is required");
    if (!verificationForm.dob) errors.push("Patient Date of Birth is required");
    if (!verificationForm.primaryInsurance) errors.push("Primary Insurance is required");
    if (!verificationForm.insuranceId) errors.push("Insurance ID (Subscriber ID) is required");
    
    // Subscriber information required when different from patient
    if (!verificationForm.subscriberIsPatient) {
      if (!verificationForm.subscriberFirstName) errors.push("Subscriber First Name is required");
      if (!verificationForm.subscriberLastName) errors.push("Subscriber Last Name is required");
      if (!verificationForm.subscriberDOB) errors.push("Subscriber Date of Birth is required");
      if (!verificationForm.subscriberRelationship) errors.push("Subscriber Relationship is required");
    }

    // Date validations
    const serviceDate = verificationForm.appointmentDate || verificationForm.dateOfService;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate patient DOB
    if (verificationForm.dob) {
      const dobDate = new Date(verificationForm.dob);
      if (dobDate > today) {
        errors.push("Patient Date of Birth cannot be in the future");
      }
      // Check if patient is too old (likely data error)
      const age = today.getFullYear() - dobDate.getFullYear();
      if (age > 150) {
        warnings.push("Patient age seems unusually high. Please verify DOB.");
      }
    }

    // Validate service date
    if (serviceDate) {
      const serviceDateObj = new Date(serviceDate);
      // Allow service date up to 1 year in the future for scheduling
      const maxFutureDate = new Date(today);
      maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
      if (serviceDateObj > maxFutureDate) {
        errors.push("Service date cannot be more than 1 year in the future");
      }
      // Warning if service date is more than 90 days in the past
      const daysDiff = (today.getTime() - serviceDateObj.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 90) {
        warnings.push("Service date is more than 90 days in the past");
      }
    }

    // Validate primary insurance coverage dates
    if (verificationForm.effectiveDate && verificationForm.terminationDate) {
      const effectiveDate = new Date(verificationForm.effectiveDate);
      const terminationDate = new Date(verificationForm.terminationDate);
      if (effectiveDate > terminationDate) {
        errors.push("Insurance effective date cannot be after termination date");
      }
      if (serviceDate) {
        const serviceDateObj = new Date(serviceDate);
        if (serviceDateObj < effectiveDate) {
          errors.push("Service date is before insurance effective date");
        }
        if (verificationForm.terminationDate && serviceDateObj > terminationDate) {
          errors.push("Service date is after insurance termination date");
        }
      }
    } else if (verificationForm.effectiveDate && serviceDate) {
      const effectiveDate = new Date(verificationForm.effectiveDate);
      const serviceDateObj = new Date(serviceDate);
      if (serviceDateObj < effectiveDate) {
        errors.push("Service date is before insurance effective date");
      }
    }

    // Validate patient DOB vs insurance effective date (check for age-related coverage)
    if (verificationForm.dob && verificationForm.effectiveDate) {
      const dobDate = new Date(verificationForm.dob);
      const effectiveDate = new Date(verificationForm.effectiveDate);
      const ageAtEffective = effectiveDate.getFullYear() - dobDate.getFullYear();
      // Medicare typically starts at 65
      if (verificationForm.planType === 'Medicare' && ageAtEffective < 65) {
        warnings.push("Medicare coverage typically starts at age 65. Please verify patient age and coverage.");
      }
      // Pediatric coverage typically ends at 18-26
      if (ageAtEffective < 18 && !verificationForm.subscriberIsPatient) {
        // Dependent child - check if coverage is appropriate
        if (verificationForm.subscriberRelationship !== 'child' && 
            verificationForm.subscriberRelationship !== 'self') {
          warnings.push("Patient is under 18. Verify dependent coverage is appropriate.");
        }
      }
    }

    // Validate secondary insurance if provided
    if (verificationForm.secondaryInsuranceName) {
      if (!verificationForm.secondaryInsuranceId) {
        errors.push("Secondary Insurance Subscriber/Member ID is required when secondary insurance is selected");
      }
      if (!verificationForm.secondaryRelationshipCode) {
        errors.push("Secondary Insurance Relationship to Subscriber is required");
      }

      // Validate secondary insurance coverage dates
      if (verificationForm.secondaryEffectiveDate && verificationForm.secondaryTerminationDate) {
        const secEffectiveDate = new Date(verificationForm.secondaryEffectiveDate);
        const secTerminationDate = new Date(verificationForm.secondaryTerminationDate);
        if (secEffectiveDate > secTerminationDate) {
          errors.push("Secondary insurance effective date cannot be after termination date");
        }
        if (serviceDate) {
          const serviceDateObj = new Date(serviceDate);
          if (serviceDateObj < secEffectiveDate) {
            errors.push("Service date is before secondary insurance effective date");
          }
          if (serviceDateObj > secTerminationDate) {
            errors.push("Service date is after secondary insurance termination date");
          }
        }
      } else if (verificationForm.secondaryEffectiveDate && serviceDate) {
        const secEffectiveDate = new Date(verificationForm.secondaryEffectiveDate);
        const serviceDateObj = new Date(serviceDate);
        if (serviceDateObj < secEffectiveDate) {
          errors.push("Service date is before secondary insurance effective date");
        }
      }

      // Validate secondary subscriber information if relationship is not self
      if (verificationForm.secondaryRelationshipCode && 
          verificationForm.secondaryRelationshipCode !== "self") {
        if (!verificationForm.secondarySubscriberFirstName && !verificationForm.secondarySubscriberLastName) {
          warnings.push("Secondary subscriber information recommended when relationship is not self");
        }
      }
    }

    // Validate prior authorization
    if (verificationForm.preAuthorizationRequired) {
      if (!verificationForm.priorAuthStatus) {
        errors.push("Prior Authorization Status is required when prior authorization is required");
      }

      // If approved, check expiration
      if (verificationForm.priorAuthStatus === "approved") {
        if (!verificationForm.priorAuthNumber) {
          errors.push("Prior Authorization Number is required when status is approved");
        }
        if (!verificationForm.priorAuthEffectiveDate) {
          errors.push("Prior Authorization Effective Date is required when approved");
        }
        if (!verificationForm.priorAuthExpirationDate) {
          errors.push("Prior Authorization Expiration Date is required when approved");
        }

        // Validate prior authorization dates
        if (verificationForm.priorAuthEffectiveDate && verificationForm.priorAuthExpirationDate) {
          const paEffectiveDate = new Date(verificationForm.priorAuthEffectiveDate);
          const paExpirationDate = new Date(verificationForm.priorAuthExpirationDate);
          if (paEffectiveDate > paExpirationDate) {
            errors.push("Prior Authorization effective date cannot be after expiration date");
          }

          // Check if authorization is expired
          if (paExpirationDate < today) {
            errors.push("Prior Authorization has expired. Please obtain new authorization.");
          }

          // Check if service date is within authorization period
          if (serviceDate) {
            const serviceDateObj = new Date(serviceDate);
            if (serviceDateObj < paEffectiveDate) {
              errors.push("Service date is before prior authorization effective date");
            }
            if (serviceDateObj > paExpirationDate) {
              errors.push("Service date is after prior authorization expiration date");
            }
          }

          // Warning if authorization expires soon
          const daysUntilExpiration = (paExpirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
          if (daysUntilExpiration > 0 && daysUntilExpiration <= 7) {
            warnings.push(`Prior Authorization expires in ${Math.ceil(daysUntilExpiration)} days`);
          }
        }
      }

      // If denied, check if appeal is submitted
      if (verificationForm.priorAuthStatus === "denied") {
        if (!verificationForm.priorAuthDenialReasonCode && !verificationForm.priorAuthDenialReason) {
          warnings.push("Denial reason should be documented when prior authorization is denied");
        }
      }
    }

    // Validate insurance ID format (basic validation)
    if (verificationForm.insuranceId) {
      const insuranceId = verificationForm.insuranceId.trim();
      if (insuranceId.length < 3) {
        errors.push("Insurance ID must be at least 3 characters");
      }
      if (insuranceId.length > 50) {
        errors.push("Insurance ID cannot exceed 50 characters");
      }
      // Check for invalid characters
      if (!/^[A-Z0-9\-_]+$/i.test(insuranceId)) {
        warnings.push("Insurance ID contains unusual characters. Please verify format.");
      }
    }

    // Validate group number format
    if (verificationForm.groupNumber && verificationForm.groupNumber.trim()) {
      const groupNumber = verificationForm.groupNumber.trim();
      if (groupNumber.length > 30) {
        errors.push("Group Number cannot exceed 30 characters");
      }
    }

    // Validate secondary insurance ID format
    if (verificationForm.secondaryInsuranceId && verificationForm.secondaryInsuranceId.trim()) {
      const secInsuranceId = verificationForm.secondaryInsuranceId.trim();
      if (secInsuranceId.length < 3) {
        errors.push("Secondary Insurance ID must be at least 3 characters");
      }
      if (secInsuranceId.length > 50) {
        errors.push("Secondary Insurance ID cannot exceed 50 characters");
      }
    }

    // Validate secondary coverage percentage
    if (verificationForm.secondaryCoveragePercent) {
      const secPercent = parseFloat(verificationForm.secondaryCoveragePercent);
      if (isNaN(secPercent) || secPercent < 0 || secPercent > 100) {
        errors.push("Secondary Coverage Percentage must be between 0 and 100");
      }
    }

    // Validate address if provided
    if (verificationForm.patientAddress || verificationForm.patientCity || verificationForm.patientState || verificationForm.patientZip) {
      if (verificationForm.patientAddress && !verificationForm.patientCity) {
        warnings.push("Address city is recommended when address is provided");
      }
      if (verificationForm.patientZip) {
        const zip = verificationForm.patientZip.trim();
        // US ZIP code validation (5 digits or 5+4 format)
        if (!/^\d{5}(-\d{4})?$/.test(zip)) {
          warnings.push("ZIP code format may be invalid. Expected: 12345 or 12345-6789");
        }
      }
    }

    // Validate CPT codes if provided
    if (verificationForm.cptCodes.length > 0) {
      const invalidCptCodes = verificationForm.cptCodes.filter(cpt => {
        const code = cpt.code.trim();
        return code && (code.length !== 5 || !/^\d{5}$/.test(code));
      });
      if (invalidCptCodes.length > 0) {
        errors.push(`${invalidCptCodes.length} CPT code(s) have invalid format. CPT codes must be 5 digits.`);
      }
    }

    // Validate ICD codes if provided
    if (verificationForm.icdCodes.length > 0) {
      const invalidIcdCodes = verificationForm.icdCodes.filter(icd => {
        const code = icd.code.trim();
        return code && (!/^[A-Z]\d{2}/.test(code) || code.length < 3 || code.length > 7);
      });
      if (invalidIcdCodes.length > 0) {
        errors.push(`${invalidIcdCodes.length} ICD code(s) have invalid format. ICD-10 codes must start with a letter followed by digits.`);
      }

      // Check for primary diagnosis
      const hasPrimary = verificationForm.icdCodes.some(icd => icd.isPrimary);
      if (!hasPrimary && verificationForm.icdCodes.length > 0) {
        warnings.push("At least one ICD code should be marked as primary diagnosis");
      }
    }

    // Validate calculation consistency
    if (verificationForm.allowedAmount && verificationForm.patientResponsibility) {
      const allowed = parseFloat(verificationForm.allowedAmount);
      const responsibility = parseFloat(verificationForm.patientResponsibility);
      if (!isNaN(allowed) && !isNaN(responsibility) && responsibility > allowed) {
        warnings.push("Patient responsibility exceeds allowed amount. Please verify calculation.");
      }
    }

    // Show warnings if any
    if (warnings.length > 0) {
      toast({
        title: "Validation Warnings",
        description: warnings.join("; "),
        variant: "default",
      });
    }
    
    return errors;
  };

  // Check Eligibility and Save to Database
  const handleCheckEligibility = async () => {
    const validationErrors = validateVerificationForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    // Auto-flag prior authorization when TOS indicates surgery or facility-based services
    const hasSurgeryTos = verificationForm.cptCodes.some(
      cpt => (cpt.tos || "").toUpperCase() === "2" // TOS code 2 = Surgery
    );
    const hasFacilityPos = verificationForm.cptCodes.some(
      cpt => cpt.pos && !["11", "12"].includes(cpt.pos) // anything other than Office/Home treated as facility
    );
    if ((hasSurgeryTos || hasFacilityPos) && !verificationForm.preAuthorizationRequired) {
      setVerificationForm(prev => ({ ...prev, preAuthorizationRequired: true }));
      if (verificationForm.patientId) {
        setShowAuthDialog(true);
      }
    }

    setIsLoading(true);
    let errorOccurred = false;
    let savedSuccessfully = false;
    try {
      const request: EligibilityRequest = {
        patientId: verificationForm.patientId,
        subscriberId: verificationForm.subscriberIsPatient ? verificationForm.insuranceId : verificationForm.subscriberId || verificationForm.insuranceId,
        payerId: verificationForm.primaryInsurance,
        serviceDate: verificationForm.appointmentDate || verificationForm.dateOfService,
        serviceCodes: verificationForm.cptCodes.map(cpt => cpt.code).filter(code => code.trim() !== ""), // Extract CPT codes
        diagnosisCodes: verificationForm.icdCodes.map(icd => icd.code).filter(code => code.trim() !== ""), // Extract ICD codes
      };

      // Validate request before sending
      if (!request.patientId || !request.subscriberId || !request.payerId) {
        throw new Error("Missing required fields for eligibility verification");
      }

      const ediService = getEDIService();
      const result = await ediService.checkEligibility(request);
      
      if (!result) {
        throw new Error("No response received from eligibility service");
      }
      
      setEligibilityResult(result);

      // Save to database and get current user info
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      let verificationId: string | null = null;
      let userName = 'Unknown';
      let userEmail = 'unknown';

      if (currentUser) {
        userEmail = currentUser.email || currentUser.id;
        userName = currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Unknown';

        try {
          if (!currentCompany?.id) {
            console.error('No company_id available - cannot save to database');
            toast({
              title: "Save Error",
              description: "Company information is missing. Please ensure you are logged in with a valid company.",
              variant: "destructive",
            });
            throw new Error("Company ID is required to save eligibility verification");
          }

          console.log('Saving eligibility verification with company_id:', currentCompany.id);
          
          // Look up patient UUID if we have patientId but no patientUuid
          // CRITICAL: patient_id column in eligibility_verifications is UUID type, NOT character varying
          let finalPatientUuid: string | null = null;
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          
          console.log('🔍 Starting patient UUID lookup:', {
            patientId: verificationForm.patientId,
            patientUuid: verificationForm.patientUuid,
            patientIdType: typeof verificationForm.patientId,
            patientUuidType: typeof verificationForm.patientUuid
          });
          
          // First check if we already have a valid UUID
          if (verificationForm.patientUuid) {
            if (uuidRegex.test(verificationForm.patientUuid)) {
              finalPatientUuid = verificationForm.patientUuid;
              console.log('✅ Using stored patientUuid:', finalPatientUuid);
            } else {
              console.warn('⚠️ patientUuid exists but is not a valid UUID:', verificationForm.patientUuid);
            }
          }
          
          // If we still don't have a UUID, try patientId
          if (!finalPatientUuid && verificationForm.patientId) {
            // Check if patientId is already a UUID
            if (uuidRegex.test(verificationForm.patientId)) {
              finalPatientUuid = verificationForm.patientId;
              console.log('✅ patientId is already a UUID:', finalPatientUuid);
            } else {
              // Look up UUID from patients table using patient_id (external ID)
              try {
                console.log('🔍 Looking up patient UUID for patient_id:', verificationForm.patientId);
                let patientQuery = supabase
                  .from('patients' as any)
                  .select('id')
                  .eq('patient_id', verificationForm.patientId)
                  .limit(1);
                
                // Filter by company_id if not super admin
                if (!isSuperAdmin && currentCompany?.id) {
                  patientQuery = patientQuery.eq('company_id', currentCompany.id);
                }
                
                const { data: patientData, error: patientError } = await patientQuery.maybeSingle();
                
                if (patientError) {
                  console.error('❌ Error looking up patient:', patientError);
                }
                
                if (!patientError && patientData && (patientData as any)?.id) {
                  const foundUuid = (patientData as any).id;
                  if (uuidRegex.test(foundUuid)) {
                    finalPatientUuid = foundUuid;
                    console.log('✅ Found patient UUID:', finalPatientUuid, 'for patient_id:', verificationForm.patientId);
                  } else {
                    console.error('❌ Found patient id is not a valid UUID:', foundUuid);
                    finalPatientUuid = null;
                  }
                } else {
                  console.warn('⚠️ Could not find patient UUID for patient_id:', verificationForm.patientId);
                  if (patientData) {
                    console.warn('⚠️ Patient data returned:', patientData);
                  }
                  finalPatientUuid = null;
                }
              } catch (lookupError) {
                console.error('❌ Error looking up patient UUID:', lookupError);
                finalPatientUuid = null;
              }
            }
          }
          
          // Final validation - ensure we never send a non-UUID string
          if (finalPatientUuid && !uuidRegex.test(finalPatientUuid)) {
            console.error('❌ CRITICAL: finalPatientUuid is not a valid UUID, setting to null:', finalPatientUuid);
            finalPatientUuid = null;
          }
          
          console.log('🔍 Final patient UUID result:', {
            finalPatientUuid,
            isNull: finalPatientUuid === null,
            isValidUuid: finalPatientUuid ? uuidRegex.test(finalPatientUuid) : false
          });
          
          // Look up primary_insurance_id if primaryInsurance is provided
          // primary_insurance_id must be a UUID, but primaryInsurance might be a name string
          let primaryInsuranceId: string | null = null;
          const primaryInsuranceValue = verificationForm.primaryInsurance || '';
          
          // Check if primaryInsurance is already a UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
          if (primaryInsuranceValue && uuidRegex.test(primaryInsuranceValue)) {
            // It's already a UUID, use it directly
            primaryInsuranceId = primaryInsuranceValue;
          } else if (primaryInsuranceValue) {
            // It's a name string, try to look up the UUID from insurance_payers table
            try {
              // Try to find by name first, then by payer_name
              let insurancePayer: any = null;
              let insuranceError: any = null;
              
              // First try name field
              const { data: nameData, error: nameError } = await supabase
                .from('insurance_payers' as any)
                .select('id')
                .ilike('name', `%${primaryInsuranceValue}%`)
                .eq('company_id', currentCompany.id)
                .limit(1)
                .maybeSingle();
              
              if (!nameError && nameData && (nameData as any)?.id) {
                insurancePayer = nameData;
              } else {
                // If not found by name, try payer_name field
                const { data: payerNameData, error: payerNameError } = await supabase
                  .from('insurance_payers' as any)
                  .select('id')
                  .ilike('payer_name', `%${primaryInsuranceValue}%`)
                  .eq('company_id', currentCompany.id)
                  .limit(1)
                  .maybeSingle();
                
                if (!payerNameError && payerNameData && (payerNameData as any)?.id) {
                  insurancePayer = payerNameData;
                } else {
                  insuranceError = payerNameError || nameError;
                }
              }
              
              if (!insuranceError && insurancePayer?.id) {
                primaryInsuranceId = insurancePayer.id;
                console.log('✅ Found insurance payer UUID:', primaryInsuranceId, 'for name:', primaryInsuranceValue);
              } else {
                console.warn('⚠️ Could not find insurance payer UUID for:', primaryInsuranceValue, '- will store name only');
                // Set to null - we'll store the name in primary_insurance_name instead
                primaryInsuranceId = null;
              }
            } catch (lookupError) {
              console.warn('⚠️ Error looking up insurance payer:', lookupError);
              primaryInsuranceId = null;
            }
          }
          
          // CRITICAL: Ensure patient_id is ALWAYS UUID or null, NEVER a string
          const safePatientId = (() => {
            if (!finalPatientUuid) {
              console.warn('⚠️ No patient UUID available - sending null for patient_id');
              return null;
            }
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(finalPatientUuid)) {
              console.error('❌ finalPatientUuid is not a valid UUID:', finalPatientUuid, '- sending null instead');
              return null;
            }
            // Double-check it's actually a string (UUID format)
            if (typeof finalPatientUuid !== 'string') {
              console.error('❌ finalPatientUuid is not a string:', typeof finalPatientUuid, finalPatientUuid);
              return null;
            }
            return finalPatientUuid;
          })();
          
          console.log('🔍 Safe patient_id value before insert:', {
            safePatientId,
            type: typeof safePatientId,
            isNull: safePatientId === null,
            isValidUuid: safePatientId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(safePatientId) : false
          });
          
          const verificationData: any = {
            user_id: currentUser.id,
            company_id: currentCompany.id,
            serial_no: verificationForm.serialNo || `VER-${Date.now().toString().slice(-8)}`,
            description: verificationForm.description,
            provider_id: verificationForm.providerId || null,
            provider_name: verificationForm.providerName,
            npp_id: verificationForm.nppId || null,
            npp_name: verificationForm.nppName,
            facility_id: (verificationForm as any).facilityId || null,
            appointment_location: verificationForm.appointmentLocation,
            appointment_date: verificationForm.appointmentDate || verificationForm.dateOfService || null,
            date_of_service: verificationForm.dateOfService || null,
            demographic: verificationForm.demographic,
            type_of_visit: verificationForm.typeOfVisit,
            service_type: verificationForm.serviceType,
            // patient_id column is UUID in DB – use the looked-up UUID
            // IMPORTANT: Only send UUID or null, NEVER send a string like "PAT-001"
            patient_id: safePatientId,
            patient_name: verificationForm.patientName,
            patient_dob: verificationForm.dob || (verificationForm as any).patientDob || null,
            patient_gender: verificationForm.patientGender,
            primary_insurance_id: primaryInsuranceId, // Use the looked-up UUID or null
            primary_insurance_name: primaryInsuranceValue || null, // Store the name/string value here
            insurance_id: verificationForm.insuranceId,
            insurance_plan: verificationForm.insurancePlan || '',
            group_number: verificationForm.groupNumber,
            plan_type: verificationForm.planType || (result.coverage as any)?.planType || '',
            effective_date: verificationForm.effectiveDate || (result.coverage as any)?.effectiveDate || null,
            termination_date: verificationForm.terminationDate || (result.coverage as any)?.terminationDate || null,
            copay: (result.coverage?.copay ?? null) || Number(verificationForm.coPay) || null,
            coinsurance: (result.coverage?.coinsurance && typeof result.coverage.coinsurance === 'string') 
              ? parseFloat((result.coverage.coinsurance as string).replace('%', '')) 
              : (typeof result.coverage?.coinsurance === 'number' ? result.coverage.coinsurance : null) || (verificationForm.coInsurance ? parseFloat(verificationForm.coInsurance.replace('%', '')) : null),
            deductible: (result.coverage?.deductible ?? null) || Number(verificationForm.deductible) || null,
            out_of_pocket_remaining: verificationForm.outOfPocketRemaining ? parseFloat(verificationForm.outOfPocketRemaining) : null,
            in_network_status: verificationForm.inNetworkStatus || (result.coverage as any)?.inNetworkStatus || '',
            // Secondary Insurance
            secondary_insurance_name: verificationForm.secondaryInsuranceName || '',
            secondary_insurance_coverage: verificationForm.secondaryInsuranceCoverage || '',
            secondary_insurance_id: verificationForm.secondaryInsuranceId || '',
            secondary_group_number: verificationForm.secondaryGroupNumber || '',
            // Referral & Authorization
            is_eligible: result.isEligible,
            referral_required: verificationForm.referralRequired,
            referral_number: verificationForm.referralNumber || '',
            pre_authorization_required: verificationForm.preAuthorizationRequired, // Note: column name is pre_authorization_required, not prior_auth_required
            // Financial Information
            previous_balance_credit: parseFloat(verificationForm.previousBalanceCredit || '0'),
            patient_responsibility: parseFloat(verificationForm.patientResponsibility || '0'),
            collection_amount: parseFloat(verificationForm.collection || '0'),
            estimated_cost: parseFloat(verificationForm.estimatedCost || '0'),
            allowed_amount: parseFloat(verificationForm.allowedAmount || '0'),
            // CPT and ICD Codes - Store as JSONB arrays
            cpt_codes: verificationForm.cptCodes.length > 0 
              ? verificationForm.cptCodes.map(cpt => cpt.code).filter(code => code && code.trim() !== '')
              : null,
            icd_codes: verificationForm.icdCodes.length > 0
              ? verificationForm.icdCodes.map(icd => icd.code).filter(code => code && code.trim() !== '')
              : null,
            // Full CPT/ICD details for editing (JSONB)
            cpt_details: verificationForm.cptCodes.length > 0 ? verificationForm.cptCodes : null,
            icd_details: verificationForm.icdCodes.length > 0 ? verificationForm.icdCodes : null,
            // Additional Information
            remarks: verificationForm.remarks,
            comments: verificationForm.comments,
            comment_entries: verificationForm.commentEntries || [],
            attachments: verificationForm.attachments || [],
            date_checked: verificationForm.dateChecked || new Date().toISOString().split('T')[0],
            // Note: check_by field doesn't exist in schema, using verified_by instead
            demographic_changes_made: verificationForm.demographicChangesMade || false,
            qa: verificationForm.qa || false,
            verification_result: result as any,
            verification_method: verificationForm.verificationMethod || 'manual',
            verified_by: verificationForm.checkBy || userEmail, // Use checkBy value for verified_by field
            status: 'verified' // Status tracks verification completion, not eligibility. Use is_eligible boolean for eligibility status.
          };

          console.log('💾 Inserting verification data:', {
            company_id: verificationData.company_id,
            patient_id: verificationData.patient_id,
            patient_id_type: typeof verificationData.patient_id,
            patient_id_is_uuid: verificationData.patient_id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(verificationData.patient_id) : 'null',
            patient_name: verificationData.patient_name,
            serial_no: verificationData.serial_no,
            user_id: verificationData.user_id,
            verificationForm_patientId: verificationForm.patientId,
            verificationForm_patientUuid: verificationForm.patientUuid
          });

          const { data: savedVerification, error: saveError } = await supabase
            .from('eligibility_verifications' as any)
            .insert(verificationData)
            .select()
            .single();

          if (saveError) {
            console.error('❌ Error saving verification:', saveError);
            console.error('❌ Save error details:', {
              message: saveError.message,
              code: saveError.code,
              details: saveError.details,
              hint: saveError.hint
            });
            console.error('❌ Verification data that failed:', {
              company_id: verificationData.company_id,
              user_id: verificationData.user_id,
              patient_id: verificationData.patient_id,
              serial_no: verificationData.serial_no
            });
            // Show user-friendly error message
            const errorMsg = saveError.message || "Failed to save eligibility verification to database.";
            const hintMsg = saveError.hint ? ` Hint: ${saveError.hint}` : "";
            
            // Special handling for RLS policy errors
            let description = errorMsg + hintMsg;
            if (saveError.code === '42501' || errorMsg.includes('row-level security')) {
              description = "Row Level Security (RLS) policy is blocking this operation. Please contact your database administrator to set up RLS policies for the eligibility_verifications table. The user needs INSERT permission for rows matching their company_id.";
            }
            
            toast({
              title: "Database Save Error",
              description: description + " The verification was not saved. Please try again or check your permissions.",
              variant: "destructive",
            });
            errorOccurred = true;
            savedSuccessfully = false;
            // Don't proceed with adding to history or showing success message
            return;
          } else if (savedVerification) {
            verificationId = (savedVerification as any).id;
            savedSuccessfully = true;
            console.log('✅ Eligibility verification saved successfully!');
            console.log('✅ Saved verification ID:', verificationId);
            console.log('✅ Saved verification data:', savedVerification);

            // If Referral Required is checked, also save to referrals table
            if (verificationForm.referralRequired) {
              try {
                const referralData: any = {
                  company_id: currentCompany.id,
                  user_id: currentUser.id,
                  patient_id: verificationForm.patientId,
                  patient_name: verificationForm.patientName,
                  appointment_location: verificationForm.appointmentLocation,
                  appointment_date: verificationForm.appointmentDate || verificationForm.dateOfService || null,
                  date_of_service: verificationForm.dateOfService || null,
                  demographic: verificationForm.demographic,
                  type_of_visit: verificationForm.typeOfVisit,
                  primary_insurance: verificationForm.primaryInsurance || '',
                  insurance_id: verificationForm.insuranceId,
                  insurance_plan: verificationForm.insurancePlan || '',
                  copay: (result.coverage?.copay ?? null) || Number(verificationForm.coPay) || null,
                  coinsurance: (result.coverage?.coinsurance && typeof result.coverage.coinsurance === 'string') 
                    ? parseFloat((result.coverage.coinsurance as string).replace('%', '')) 
                    : (typeof result.coverage?.coinsurance === 'number' ? result.coverage.coinsurance : null) || (verificationForm.coInsurance ? parseFloat(verificationForm.coInsurance.replace('%', '')) : null),
                  deductible: (result.coverage?.deductible ?? null) || Number(verificationForm.deductible) || null,
                  out_of_pocket_remaining: verificationForm.outOfPocketRemaining ? parseFloat(verificationForm.outOfPocketRemaining) : null,
                  secondary_insurance_name: verificationForm.secondaryInsuranceName || '',
                  secondary_insurance_coverage: verificationForm.secondaryInsuranceCoverage || '',
                  in_network_status: verificationForm.inNetworkStatus || (result.coverage as any)?.inNetworkStatus || '',
                  referral_required: true,
                  referral_number: verificationForm.referralNumber || '',
                  pre_authorization_required: verificationForm.preAuthorizationRequired,
                  previous_balance_credit: parseFloat(verificationForm.previousBalanceCredit || '0'),
                  patient_responsibility: parseFloat(verificationForm.patientResponsibility || '0'),
                  collection_amount: parseFloat(verificationForm.collection || '0'),
                  remarks: verificationForm.remarks,
                  comments: verificationForm.comments,
                  comment_entries: verificationForm.commentEntries || [],
                  attachments: verificationForm.attachments || [],
                  date_checked: verificationForm.dateChecked || new Date().toISOString().split('T')[0],
                  // Note: check_by field may not exist in referrals table schema
                  demographic_changes_made: verificationForm.demographicChangesMade || false,
                  qa: verificationForm.qa || false,
                  eligibility_verification_id: verificationId, // Link to eligibility verification
                };

                const { data: savedReferral, error: referralError } = await supabase
                  .from('referrals' as any)
                  .insert(referralData)
                  .select()
                  .single();

                if (referralError) {
                  console.error('❌ Error saving referral:', referralError);
                  // Don't fail the whole save if referral save fails
                  toast({
                    title: "Referral Save Warning",
                    description: "Eligibility verification saved, but failed to save referral data. " + (referralError.message || ""),
                    variant: "default",
                  });
                } else {
                  console.log('✅ Referral saved successfully!');
                  console.log('✅ Saved referral ID:', (savedReferral as any).id);
                }
              } catch (referralErr: any) {
                console.error('Error saving referral:', referralErr);
                // Don't fail the whole save if referral save fails
                toast({
                  title: "Referral Save Warning",
                  description: "Eligibility verification saved, but failed to save referral data.",
                  variant: "default",
                });
              }
            }

            // Log audit action
            verificationId = (savedVerification as any).id;
            savedSuccessfully = true;
            console.log('✅ Eligibility verification saved successfully!');
            console.log('✅ Saved verification ID:', verificationId);
            console.log('✅ Saved verification data:', savedVerification);

            // Log audit action
            await eligibilityAuditService.logVerify(
              verificationId,
              {
                patient_id: verificationForm.patientId,
                patient_name: verificationForm.patientName,
                payer: verificationForm.primaryInsurance,
                is_eligible: result.isEligible,
                verification_method: verificationForm.verificationMethod,
                check_by: verificationForm.checkBy || userEmail,
                qa: verificationForm.qa,
              },
              'Eligibility verification performed'
            );

          }
        } catch (error) {
          console.error('Error saving verification to database:', error);
          const errorMsg = error instanceof Error ? error.message : "Failed to save eligibility verification to database.";
          toast({
            title: "Database Save Error",
            description: errorMsg + " The verification was not saved. Please try again.",
            variant: "destructive",
          });
          errorOccurred = true;
          savedSuccessfully = false;
          // Don't proceed with adding to history or showing success message
          return;
        }
      } else {
        // No current user - cannot save
        console.error('No current user - cannot save to database');
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save eligibility verifications. Please log in and try again.",
          variant: "destructive",
        });
        errorOccurred = true;
        savedSuccessfully = false;
        // Don't proceed with adding to history or showing success message
        return;
      }

      // Only proceed if save was successful
      if (!savedSuccessfully) {
        // Error already shown above, just return
        return;
      }

      // Add to history with user info - include all fields to match database structure and display requirements
      const coinsuranceValue = verificationForm.coInsurance || (result.coverage?.coinsurance ? `${result.coverage.coinsurance}%` : '0%');
      const copayValue = (result.coverage?.copay ?? null) || Number(verificationForm.coPay) || 0;
      const deductibleValue = (result.coverage?.deductible ?? null) || Number(verificationForm.deductible) || 0;
      
      const newEntry = {
        id: verificationId || Date.now().toString(),
        timestamp: new Date().toISOString(),
        patientId: verificationForm.patientId || '',
        patientName: verificationForm.patientName || '',
        payerId: verificationForm.primaryInsurance || '',
        isEligible: result.isEligible,
        coverage: {
          copay: copayValue,
          deductible: deductibleValue,
          coinsurance: coinsuranceValue,
          outOfPocketMax: verificationForm.outOfPocketMax || result.coverage?.outOfPocketMax || '',
        },
        planType: verificationForm.planType || (result.coverage as any)?.planType || '',
        effectiveDate: verificationForm.effectiveDate || (result.coverage as any)?.effectiveDate || '',
        terminationDate: verificationForm.terminationDate || (result.coverage as any)?.terminationDate || '',
        inNetworkStatus: verificationForm.inNetworkStatus || (result.coverage as any)?.inNetworkStatus || '',
        serialNo: verificationForm.serialNo || `VER-${Date.now().toString().slice(-8)}`,
        appointmentLocation: verificationForm.appointmentLocation || '',
        appointmentDate: verificationForm.appointmentDate || verificationForm.dateOfService || '',
        dateOfService: verificationForm.dateOfService || '',
        typeOfVisit: verificationForm.typeOfVisit || '',
        serviceType: verificationForm.serviceType || '',
        patientDob: verificationForm.dob || (verificationForm as any).patientDob || '',
        patientGender: verificationForm.patientGender || '',
        providerName: verificationForm.providerName || '',
        nppName: verificationForm.nppName || '',
        insuranceId: verificationForm.insuranceId || '',
        memberId: verificationForm.insuranceId || '', // Alias for display
        groupNumber: verificationForm.groupNumber || '',
        totalCollectible: (Number(copayValue) + Number(deductibleValue)).toFixed(2),
        estimatedResponsibility: parseFloat(verificationForm.patientResponsibility || '0'),
        allowedAmount: parseFloat(verificationForm.allowedAmount || '0'),
        copayBeforeDeductible: verificationForm.copayBeforeDeductible,
        referralRequired: verificationForm.referralRequired || false,
        preAuthorizationRequired: verificationForm.preAuthorizationRequired || false,
        previousBalanceCredit: parseFloat(verificationForm.previousBalanceCredit || '0').toFixed(2),
        patientResponsibility: parseFloat(verificationForm.patientResponsibility || '0').toFixed(2),
        currentVisitAmount: parseFloat(verificationForm.estimatedCost || '0').toFixed(2),
        remarks: verificationForm.remarks || '',
        notes: verificationForm.remarks || '', // Alias for display
        verificationMethod: verificationForm.verificationMethod || 'manual',
        created_by: userEmail,
        created_by_name: userName,
        verified_by: userEmail,
        coinsurance: coinsuranceValue,
        deductible: deductibleValue,
        copay: copayValue,
        outOfPocketMax: verificationForm.outOfPocketMax || result.coverage?.outOfPocketMax || '',
        deductibleMet: verificationForm.deductibleStatus === 'Met',
        outOfPocketRemaining: verificationForm.outOfPocketRemaining || '',
      };

      // Only add to local history if save was successful
      // This prevents showing entries that weren't actually saved to the database
      if (savedSuccessfully) {
        // Add to local history immediately for UI responsiveness
        setVerificationHistory(prev => [newEntry, ...prev]);

        // Show success message
        toast({
          title: "Eligibility Checked & Saved",
          description: result.isEligible 
            ? "Patient is eligible for coverage. Results have been saved to database." 
            : "Patient is not eligible for coverage. Results have been saved to database.",
        });
        
        // Refresh history from database to ensure we have the latest data
        // This ensures data persists after page refresh
        setTimeout(async () => {
          try {
            if (currentCompany?.id) {
              const { data: refreshData, error: refreshError } = await supabase
                .from('eligibility_verifications' as any)
                .select('*')
                .eq('company_id', currentCompany.id)
                .order('created_at', { ascending: false })
                .limit(500);

              if (!refreshError && refreshData) {
                // Collect all unique facility IDs from records.
                // IMPORTANT: Some legacy records store a location name (e.g. "Downtown") in appointment_location.
                // The facilities table expects UUIDs in the id column, so we must only send valid UUIDs to .in('id', ...).
                const rawFacilityIds = refreshData
                  .map((r: any) => r.facility_id || r.appointment_location)
                  .filter(Boolean);

                // Only keep values that look like UUIDs to avoid 400 errors like id=in.(Downtown)
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                const facilityIds = [...new Set(rawFacilityIds.filter((id: string) => uuidRegex.test(id)))];
                
                // Fetch facility names for all valid UUID IDs
                const facilityNameMap = new Map<string, string>();
                if (facilityIds.length > 0) {
                  try {
                    const { data: facilityData, error: facilityError } = await supabase
                      .from('facilities' as any)
                      .select('id, name')
                      .in('id', facilityIds);
                    
                    if (!facilityError && facilityData) {
                      facilityData.forEach((f: any) => {
                        facilityNameMap.set(f.id, f.name);
                      });
                      // Update facilities state with fetched facilities
                      setFacilities(prev => {
                        const existingIds = new Set(prev.map(f => f.id));
                        const newFacilities = facilityData.filter((f: any) => !existingIds.has(f.id));
                        return [...prev, ...newFacilities.map((f: any) => ({ id: f.id, name: f.name }))];
                      });
                    }
                  } catch (err) {
                    console.warn('Could not fetch facility names:', err);
                  }
                }
                
                // Helper function to get facility name from ID
                const getFacilityName = (facilityId: string | null | undefined): string => {
                  if (!facilityId) return '';
                  // First check the map from database
                  if (facilityNameMap.has(facilityId)) {
                    return facilityNameMap.get(facilityId)!;
                  }
                  // Then check facilities state
                  const facility = facilities.find(f => f.id === facilityId);
                  return facility ? facility.name : facilityId; // Return ID if facility not found
                };
                
                const transformedHistory = refreshData.map((record: any) => {
                  // Get facility name from ID
                  const appointmentLocationId = record.appointment_location || record.facility_id || '';
                  const appointmentLocationName = getFacilityName(appointmentLocationId);
                  
                  return {
                    id: record.id,
                    timestamp: record.created_at || record.date_checked || new Date().toISOString(),
                    patientId: record.patient_id || '',
                    patientName: record.patient_name || '',
                    payerId: record.primary_insurance_name || '',
                    isEligible: record.is_eligible || false,
                    coverage: {
                      copay: parseFloat(record.copay || 0),
                      deductible: parseFloat(record.deductible || 0),
                      coinsurance: record.coinsurance ? `${record.coinsurance}%` : '0%',
                      outOfPocketMax: record.out_of_pocket_max || ''
                    },
                    planType: record.plan_type || '',
                    effectiveDate: record.effective_date || '',
                    terminationDate: record.termination_date || '',
                    inNetworkStatus: record.in_network_status || '',
                    serialNo: record.serial_no || `VER-${record.id.substring(0, 8)}`,
                    appointmentLocation: appointmentLocationName || appointmentLocationId || '', // Use name if available, fallback to ID
                    appointmentDate: record.appointment_date || record.date_of_service || '',
                    dateOfService: record.date_of_service || '',
                    typeOfVisit: record.type_of_visit || '',
                    serviceType: record.service_type || '',
                    patientDob: record.patient_dob || '',
                    patientGender: record.patient_gender || '',
                    providerName: record.provider_name || '',
                    nppName: record.npp_name || '',
                    insuranceId: record.insurance_id || '',
                    memberId: record.insurance_id || '',
                    groupNumber: record.group_number || '',
                    totalCollectible: parseFloat(record.collection_amount || record.patient_responsibility || 0).toFixed(2),
                    referralRequired: record.referral_required || false,
                    preAuthorizationRequired: record.pre_authorization_required || false,
                    previousBalanceCredit: parseFloat(record.previous_balance_credit || 0).toFixed(2),
                    patientResponsibility: parseFloat(record.patient_responsibility || 0).toFixed(2),
                    currentVisitAmount: parseFloat(record.estimated_cost || record.billed_amount || 0).toFixed(2),
                    remarks: record.remarks || '',
                    notes: record.remarks || '',
                    verificationMethod: record.verification_method || 'manual',
                    created_by: record.verified_by || '',
                    created_by_name: record.verified_by || '',
                    verified_by: record.verified_by || '',
                    allowedAmount: parseFloat(record.allowed_amount || 0),
                    estimatedResponsibility: parseFloat(record.patient_responsibility || 0),
                    copayBeforeDeductible: record.copay_before_deductible !== undefined ? record.copay_before_deductible : true,
                    coinsurance: record.coinsurance ? `${record.coinsurance}%` : '0%',
                    deductible: parseFloat(record.deductible || 0),
                    copay: parseFloat(record.copay || 0),
                    outOfPocketMax: record.out_of_pocket_max || '',
                    deductibleMet: record.deductible_status === 'Met' || record.deductible_met === true,
                    outOfPocketRemaining: record.out_of_pocket_remaining || ''
                  };
                });
                setVerificationHistory(transformedHistory);
                console.log('History refreshed from database:', transformedHistory.length, 'records');
              } else if (refreshError) {
                console.error('Error refreshing history from database:', refreshError);
              }
            }
          } catch (refreshErr) {
            console.error('Error refreshing history:', refreshErr);
          }
        }, 500); // Small delay to ensure database write is complete
      }
      
      // Close dialog after verification
      setShowFormDialog(false);
    } catch (error: any) {
      errorOccurred = true;
      console.error('Eligibility verification error:', error);
      const errorMessage = error?.message || "An error occurred while verifying eligibility. Please try again.";
      toast({
        title: "Verification Error",
        description: errorMessage,
        variant: "destructive",
      });
      // Don't close dialog on error so user can fix and retry
    } finally {
      setIsLoading(false);
      if (errorOccurred) {
        // Keep form open on error
        return;
      }
      
      // Reset form to initial state with all new fields (only if saved successfully)
      if (savedSuccessfully) {
        setVerificationForm({
        serialNo: "",
        description: "", // Service description
        providerId: "", // Provider selection
        providerName: "", // Provider display name
        nppId: "", // Non-Physician Practitioner ID
        nppName: "", // Non-Physician Practitioner name
        appointmentLocation: "",
        appointmentDate: "",
        dateOfService: "",
        demographic: "",
        typeOfVisit: "",
        serviceType: "", // Inpatient, Outpatient, Emergency, etc.
        status: "pending" as "pending" | "verified" | "completed" | "cancelled",
        isSelfPay: false,
        patientName: "",
        patientId: "", // External patient ID (PAT-001) for display
        patientUuid: "", // Internal UUID from patients.id for database
        firstName: "",
        lastName: "",
        dob: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        patientGender: "",
        patientAddress: "",
        patientCity: "",
        patientState: "",
        patientZip: "",
        patientPhone: "",
        subscriberIsPatient: true,
        subscriberId: "",
        subscriberFirstName: "",
        subscriberLastName: "",
        subscriberMiddleInitial: "",
        subscriberDOB: "",
        subscriberGender: "",
        subscriberRelationship: "", // Self, Spouse, Child, Parent, etc.
        subscriberAddress: "",
        subscriberCity: "",
        subscriberState: "",
        subscriberZip: "",
        primaryInsurance: "",
        primaryInsuranceId: "",
        insuranceId: "",
        groupNumber: "",
        insurancePlan: "",
        planType: "",
        effectiveDate: "",
        terminationDate: "",
        coPay: "",
        coInsurance: "",
        deductible: "",
        deductibleMet: "",
        outOfPocketRemaining: "",
        outOfPocketMax: "",
        inNetworkStatus: "",
        allowedAmount: "",
        copayBeforeDeductible: true,
        deductibleStatus: "Met" as "Met" | "Not Met",
        deductibleAmount: "",
        cptCodes: [] as Array<{
          code: string;
          modifier1: string;
          modifier2: string;
          icd: string; // Linked ICD code
          pos: string; // Place of Service
          tos: string; // Type of Service
          units: string;
          charge: string;
        }>,
        icdCodes: [] as Array<{
          code: string;
          description: string;
          type: string;
          isPrimary: boolean;
        }>,
        currentCpt: {
          code: "",
          modifier1: "",
          modifier2: "",
          icd: "", // ICD code linked to this CPT
          pos: "",
          tos: "",
          units: "",
          charge: "",
        },
        // Current ICD row being edited (kept for compatibility)
        currentIcd: {
          code: "",
          description: "",
          type: "DX", // DX = Diagnosis, PX = Procedure
          isPrimary: false,
        },
        
        // Secondary Insurance
        secondaryInsuranceName: "",
        secondaryInsurance: "",
        secondaryInsuranceCoverage: "",
        secondaryInsuranceId: "", // Subscriber/Member ID
        secondaryGroupNumber: "",
        secondaryRelationshipCode: "", // Self, Spouse, Child, Parent, Other
        secondaryEffectiveDate: "",
        secondaryTerminationDate: "",
        secondarySubscriberFirstName: "",
        secondarySubscriberLastName: "",
        secondarySubscriberDOB: "",
        secondarySubscriberGender: "",
        secondaryCoPay: "",
        secondaryDeductible: "",
        secondaryDeductibleMet: "",
        secondaryCoInsurance: "",
        secondaryPolicyHolderName: "",
        secondaryPolicyHolderRelationship: "",
        cobRule: "", // Auto-detect or manual: Birthday Rule, Employee Rule, Medicare Rule, etc.
        cobIndicator: "S" as "P" | "S" | "T" | "A", // Primary, Secondary, Tertiary, Unknown
        
        // Referral & Authorization
        referralRequired: false,
        referralStatus: "active", // Active or Inactive
        referralObtainedFrom: "", // "PCP" or "Insurance Approved PCP"
        referralPCPStatus: "", // "On File" or "Required" (only if obtained from PCP)
        referralNumber: "",
        preAuthorizationRequired: false,
        priorAuthNumber: "",
        priorAuthStatus: "", // Not Started, Request Submitted, Pending, Under Review, Approved, Denied, Expired, Cancelled
        priorAuthRequestDate: "",
        priorAuthSubmissionDate: "",
        priorAuthSubmissionMethod: "", // Electronic (X12 278), Portal, Fax, Email, Phone
        priorAuthPayerConfirmationNumber: "",
        priorAuthExpectedResponseDate: "",
        priorAuthResponseDate: "",
        priorAuthEffectiveDate: "",
        priorAuthExpirationDate: "",
        priorAuthDenialReasonCode: "",
        priorAuthDenialReason: "",
        priorAuthApprovedQuantity: "",
        priorAuthApprovedFrequency: "",
        priorAuthServiceDate: "",
        priorAuthAppealSubmitted: false,
        priorAuthAppealDate: "",
        priorAuthAppealStatus: "", // Pending, Approved, Denied
        priorAuthAppealDecisionDate: "",
        
        // Financial Information
        previousBalanceCredit: "",
        patientResponsibility: "",
        collection: "",
        estimatedCost: "",
        // Visit amounts
        billedAmount: "",
        // QMB and Coverage
        isQMB: false, // Qualified Medicare Beneficiary
        isCoveredService: true, // Is service Medicare covered
        // Insurance Payments
        primaryPayment: "", // Amount paid by primary insurance
        secondaryPayment: "", // Amount paid by secondary insurance (if any)
        // Coverage percents (prototype-driven)
        primaryCoveragePercent: "",
        secondaryCoveragePercent: "",
        
        // Additional Information
        remarks: "",
        comments: "",
        commentEntries: [] as Array<{id: string, text: string, attachments: Array<{id: string, name: string, type: string, size: number, content: string, uploadedAt: string}>, timestamp: string, author: string}>,
        attachments: [] as Array<{id: string, name: string, type: string, size: number, content: string, uploadedAt: string}>,
        dateChecked: new Date().toISOString().split('T')[0],
        verifiedBy: "", // User who performed verification
        checkBy: "", // Current user who checked (QA/Review)
        verificationMethod: "manual", // manual, automated, portal
        demographicChangesMade: false,
        qa: false,
        // Emergency Contact
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
        // Policy Holder Information
        policyHolderName: "",
        policyHolderRelationship: "",
        // Medical Information
        knownAllergies: "",
        currentMedications: "",
        medicalConditions: "",
        previousSurgeries: "",
        familyHistory: "",
        // Demographic display (read-only, populated when patient selected)
        demographicDisplay: {
          patientId: "",
          firstName: "",
          lastName: "",
          middleInitial: "",
          suffix: "",
          dob: "",
          gender: "",
          phone: "",
          email: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          ssn: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
          emergencyContactRelation: "",
        } as {
          patientId: string;
          firstName: string;
          lastName: string;
          middleInitial: string;
          suffix: string;
          dob: string;
          gender: string;
          phone: string;
          email: string;
          address: string;
          city: string;
          state: string;
          zip: string;
          ssn: string;
          emergencyContactName: string;
          emergencyContactPhone: string;
          emergencyContactRelation: string;
        }
      });
      }
    }
  };

  // Alias for backward compatibility
  const handleVerifyEligibility = handleCheckEligibility;

  const addServiceCode = () => {
    if (currentServiceCode.trim()) {
      setFormData(prev => ({
        ...prev,
        serviceCodes: [...prev.serviceCodes, currentServiceCode.trim()],
      }));
      setCurrentServiceCode("");
    }
  };

  const addDiagnosisCode = () => {
    if (currentDiagnosisCode.trim()) {
      setFormData(prev => ({
        ...prev,
        diagnosisCodes: [...prev.diagnosisCodes, currentDiagnosisCode.trim()],
      }));
      setCurrentDiagnosisCode("");
    }
  };

  const removeServiceCode = (index: number) => {
    setFormData(prev => ({
      ...prev,
      serviceCodes: prev.serviceCodes.filter((_, i) => i !== index),
    }));
  };

  const removeDiagnosisCode = (index: number) => {
    setFormData(prev => ({
      ...prev,
      diagnosisCodes: prev.diagnosisCodes.filter((_, i) => i !== index),
    }));
  };

  // CSV Import/Export Functions
  const handleExportEligibilityCSV = () => {
    const csvContent = [
      'Patient ID,Patient Name,Date of Birth,Primary Insurance,Insurance ID,Group Number,Appointment Date,Type of Visit,Service Type',
      `${verificationForm.patientId || ''},${verificationForm.patientName || ''},${verificationForm.dob || ''},${verificationForm.primaryInsurance || ''},${verificationForm.insuranceId || ''},${verificationForm.groupNumber || ''},${verificationForm.appointmentDate || ''},${verificationForm.typeOfVisit || ''},${verificationForm.serviceType || ''}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eligibility-verification-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Eligibility verification data has been exported to CSV.",
    });
  };

  const handleDownloadEligibilitySampleCSV = () => {
    const csvContent = [
      'Patient ID,Patient Name,Date of Birth,Primary Insurance,Insurance ID,Group Number,Appointment Date,Type of Visit,Service Type,Subscriber ID,Subscriber First Name,Subscriber Last Name,Subscriber Date of Birth,Subscriber Relationship',
      'PAT-001,John Doe,1990-01-15,Blue Cross Blue Shield,ABC123456789,GRP001,2024-12-20,consultation,outpatient,ABC123456789,John,Doe,1990-01-15,self',
      'PAT-002,Jane Smith,1985-05-20,Aetna,DEF987654321,GRP002,2024-12-21,follow_up,outpatient,DEF987654321,Jane,Smith,1985-05-20,self'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eligibility-verification-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper function to parse CSV line properly (handles quoted values)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };

  const handleImportEligibilityCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          toast({
            title: "Import Failed",
            description: "CSV file must contain at least a header row and one data row.",
            variant: "destructive",
          });
          return;
        }

        // Parse headers and first data row
        const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const values = parseCSVLine(lines[1]).map(v => v.trim().replace(/^"|"$/g, ''));

        const getValue = (headerName: string) => {
          const index = headers.indexOf(headerName);
          return index >= 0 && values[index] ? values[index] : '';
        };

        // Get all possible header variations
        const patientId = getValue('patient id') || getValue('patientid') || getValue('patient_id');
        const patientName = getValue('patient name') || getValue('patientname') || getValue('patient_name');
        const dob = getValue('date of birth') || getValue('dob') || getValue('dateofbirth') || getValue('patient dob');
        const primaryInsurance = getValue('primary insurance') || getValue('primaryinsurance') || getValue('insurance company') || getValue('payer');
        const insuranceId = getValue('insurance id') || getValue('insuranceid') || getValue('subscriber id') || getValue('subscriberid') || getValue('member id');
        const groupNumber = getValue('group number') || getValue('groupnumber') || getValue('group_number');
        const appointmentDate = getValue('appointment date') || getValue('appointmentdate') || getValue('service date') || getValue('servicedate') || getValue('date of service');
        const typeOfVisit = getValue('type of visit') || getValue('typeofvisit') || getValue('visit type');
        const serviceType = getValue('service type') || getValue('servicetype');
        const subscriberId = getValue('subscriber id') || getValue('subscriberid') || insuranceId;
        const subscriberFirstName = getValue('subscriber first name') || getValue('subscriberfirstname') || getValue('subscriber firstname');
        const subscriberLastName = getValue('subscriber last name') || getValue('subscriberlastname') || getValue('subscriber lastname');
        const subscriberDOB = getValue('subscriber date of birth') || getValue('subscriberdob') || getValue('subscriber dob');
        const subscriberRelationship = getValue('subscriber relationship') || getValue('subscriberrelationship') || getValue('relationship');
        const appointmentLocation = getValue('appointment location') || getValue('appointmentlocation') || getValue('location');
        const description = getValue('description') || getValue('service description');

        // Populate verification form from CSV - force update all fields
        setVerificationForm(prev => {
          const updated = {
            ...prev,
            // Only update if CSV has a value, otherwise keep existing
            patientId: patientId || prev.patientId,
            patientName: patientName || prev.patientName,
            dob: dob || prev.dob,
            primaryInsurance: primaryInsurance || prev.primaryInsurance,
            insuranceId: insuranceId || prev.insuranceId,
            groupNumber: groupNumber || prev.groupNumber,
            appointmentDate: appointmentDate || prev.appointmentDate,
            dateOfService: appointmentDate || prev.dateOfService,
            typeOfVisit: typeOfVisit || prev.typeOfVisit,
            serviceType: serviceType || prev.serviceType,
            subscriberId: subscriberId || prev.subscriberId,
            subscriberFirstName: subscriberFirstName || prev.subscriberFirstName,
            subscriberLastName: subscriberLastName || prev.subscriberLastName,
            subscriberDOB: subscriberDOB || prev.subscriberDOB,
            subscriberRelationship: subscriberRelationship || prev.subscriberRelationship,
            appointmentLocation: appointmentLocation || prev.appointmentLocation,
            description: description || prev.description,
          };
          
          // Log for debugging
          console.log('CSV Import - Updating form with:', {
            patientId,
            patientName,
            dob,
            primaryInsurance,
            insuranceId,
            appointmentDate
          });
          
          return updated;
        });

        // If patient ID is provided, try to fetch patient data
        if (patientId) {
          // Trigger patient search to auto-fill additional fields
          setTimeout(() => {
            searchPatientById(patientId);
          }, 100);
        }

        toast({
          title: "CSV Imported Successfully",
          description: `Form populated with ${patientId ? 'Patient ID: ' + patientId : 'data'} from CSV. ${patientId ? 'Fetching patient details...' : 'Please review and complete any missing fields.'}`,
        });
      } catch (error: any) {
        console.error('CSV Import Error:', error);
        toast({
          title: "Import Failed",
          description: error.message || "Error reading CSV file. Please check the format and try again.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Batch verification functions
  const handleBatchVerification = async () => {
    if (!batchData.trim()) {
      toast({
        title: "No Data",
        description: "Please enter batch data for verification.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const errors: string[] = [];
    const results: any[] = [];
    
    try {
      const lines = batchData.trim().split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error("No valid data lines found in batch input");
      }

      if (lines.length > 100) {
        toast({
          title: "Batch Size Warning",
          description: "Batch size exceeds 100 records. Processing first 100 only.",
          variant: "default",
        });
      }
      
      const linesToProcess = lines.slice(0, 100);
      
      for (let i = 0; i < linesToProcess.length; i++) {
        const line = linesToProcess[i];
        const [patientId, subscriberId, payerId, serviceDate] = line.split(',').map(s => s.trim());
        
        if (!patientId || !subscriberId || !payerId || !serviceDate) {
          errors.push(`Line ${i + 1}: Missing required fields (Patient ID, Subscriber ID, Payer ID, Service Date)`);
          continue;
        }

        // Validate service date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(serviceDate)) {
          errors.push(`Line ${i + 1}: Invalid service date format. Expected YYYY-MM-DD`);
          continue;
        }

        try {
          const request: EligibilityRequest = {
            patientId,
            subscriberId,
            payerId,
            serviceDate,
            serviceCodes: formData.serviceCodes || [],
            diagnosisCodes: formData.diagnosisCodes || [],
          };

          const ediService = getEDIService();
          const result = await ediService.checkEligibility(request);
          results.push({ request, result });
        } catch (error: any) {
          errors.push(`Line ${i + 1}: ${error.message || "Verification failed"}`);
          console.error(`Batch verification error for line ${i + 1}:`, error);
        }
      }

      if (results.length > 0) {
      // Save batch verifications to database
      // First, look up UUIDs for all patient IDs
      const patientIdMap = new Map<string, string | null>();
      const uniquePatientIds = [...new Set(results.map(({ request }) => request.patientId))];
      
      for (const patientIdStr of uniquePatientIds) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(patientIdStr)) {
          // Already a UUID
          patientIdMap.set(patientIdStr, patientIdStr);
        } else {
          // Look up UUID from patients table
          try {
            let patientQuery = supabase
              .from('patients' as any)
              .select('id')
              .eq('patient_id', patientIdStr)
              .limit(1);
            
            if (!isSuperAdmin && currentCompany?.id) {
              patientQuery = patientQuery.eq('company_id', currentCompany.id);
            }
            
            const { data: patientData, error: patientError } = await patientQuery.maybeSingle();
            
            if (!patientError && patientData && (patientData as any)?.id) {
              patientIdMap.set(patientIdStr, (patientData as any).id);
            } else {
              console.warn('⚠️ Could not find patient UUID for patient_id:', patientIdStr);
              patientIdMap.set(patientIdStr, null);
            }
          } catch (lookupError) {
            console.warn('⚠️ Error looking up patient UUID for:', patientIdStr, lookupError);
            patientIdMap.set(patientIdStr, null);
          }
        }
      }
      
      const batchEntries = results.map(({ request, result }) => {
        const patientUuid = patientIdMap.get(request.patientId);
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const finalPatientUuid = patientUuid && uuidRegex.test(patientUuid) ? patientUuid : null;
        
        return {
          user_id: user?.id || null,
          company_id: currentCompany?.id || null,
          patient_id: finalPatientUuid, // UUID or null, NEVER a string
          patient_name: request.patientId, // Store the external ID as name
          primary_insurance_name: request.payerId,
          is_eligible: result.isEligible,
          copay: result.coverage?.copay || 0,
          deductible: result.coverage?.deductible || 0,
          coinsurance: result.coverage?.coinsurance ? parseFloat(result.coverage.coinsurance.replace('%', '')) : 0,
          plan_type: result.coverage?.planType || '',
          effective_date: result.coverage?.effectiveDate || null,
          termination_date: result.coverage?.terminationDate || null,
          verification_result: result,
          status: 'verified' as const, // Status tracks verification completion, not eligibility. Use is_eligible boolean for eligibility status.
          verification_method: 'batch',
          verified_by: user?.email || 'system'
        };
      });

      try {
        const { data: savedBatch, error: batchError } = await supabase
          .from('eligibility_verifications' as any)
          .insert(batchEntries)
          .select();

        if (batchError) {
          console.error('Error saving batch verifications to database:', batchError);
        }

        // Map saved entries to component format
        const transformedBatch = (savedBatch || []).map((saved: any, index: number) => {
          const { request, result } = results[index];
          return {
            id: saved.id,
            timestamp: saved.created_at || new Date().toISOString(),
            patientId: request.patientId,
            payerId: request.payerId,
            isEligible: result.isEligible,
            coverage: result.coverage,
          };
        });

        setVerificationHistory(prev => [...transformedBatch, ...prev]);
      } catch (error: any) {
        console.error('Error saving batch verifications:', error);
        // Fallback to local state if database save fails
        setVerificationHistory(prev => [...results.map(({ request, result }) => ({
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          patientId: request.patientId,
          payerId: request.payerId,
          isEligible: result.isEligible,
          coverage: result.coverage,
        })), ...prev]);
      }

      toast({
        title: "Batch Verification Complete",
          description: `Processed ${results.length} of ${linesToProcess.length} verifications successfully.${errors.length > 0 ? ` ${errors.length} errors occurred.` : ''}`,
          variant: errors.length > 0 ? "default" : "default",
        });
      }

      if (errors.length > 0) {
        console.error("Batch verification errors:", errors);
        // Show first 5 errors
        const errorSummary = errors.slice(0, 5).join("; ");
        toast({
          title: "Batch Verification Errors",
          description: errorSummary + (errors.length > 5 ? ` (and ${errors.length - 5} more)` : ""),
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('Batch verification error:', error);
      toast({
        title: "Batch Verification Failed",
        description: error.message || "Unable to process batch verification.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportHistory = () => {
    const csvContent = [
      "Patient ID,Payer,Date,Status,Copay,Deductible,Coinsurance,Allowed Amount,Estimated Responsibility,Copay Before Deductible",
      ...verificationHistory.map(entry => 
        `${entry.patientId},${entry.payerId},${entry.timestamp ? new Date(entry.timestamp).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : ''},${entry.isEligible ? 'Eligible' : 'InEligible'},${entry.coverage?.copay ?? ''},${entry.coverage?.deductible ?? ''},${entry.coverage?.coinsurance ?? ''},${entry.allowedAmount ?? ''},${entry.estimatedResponsibility ?? ''},${entry.copayBeforeDeductible ?? ''}`
      ).join('\n')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eligibility-verification-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearForm = () => {
    setFormData({
      patientId: "",
      patientLastName: "",
      patientFirstName: "",
      patientMiddleInitial: "",
      patientSuffix: "",
      patientDob: "",
      patientGender: "",
      patientSsn: "",
      patientPhone: "",
      patientEmail: "",
      patientAddress: "",
      patientCity: "",
      patientState: "",
      patientZip: "",
      subscriberId: "",
      subscriberLastName: "",
      subscriberFirstName: "",
      subscriberMiddleInitial: "",
      subscriberSuffix: "",
      subscriberDob: "",
      subscriberGender: "",
      subscriberSsn: "",
      subscriberPhone: "",
      subscriberEmail: "",
      subscriberAddress: "",
      subscriberCity: "",
      subscriberState: "",
      subscriberZip: "",
      subscriberRelationship: "",
      payerId: "",
      groupNumber: "",
      policyNumber: "",
      effectiveDate: "",
      terminationDate: "",
      serviceDate: "",
      serviceCodes: [],
      diagnosisCodes: [],
      priorAuthRequired: false,
      priorAuthNumber: "",
      providerNpi: "",
      facilityId: "",
      notes: "",
    });
    setEligibilityResult(null);
  };

  // Helper function to check if entry date matches time period filter
  const matchesTimePeriod = (entryDate: string): boolean => {
    if (!selectedFilterYear || !selectedFilterMonth || !selectedTimePeriod) {
      return true; // No time period filter applied
    }

    const entry = new Date(entryDate);
    const entryYear = entry.getFullYear().toString();
    const entryMonth = (entry.getMonth() + 1).toString();
    const entryDateOnly = entry.toISOString().split('T')[0];

    // First check if year and month match
    if (entryYear !== selectedFilterYear || entryMonth !== selectedFilterMonth) {
      return false;
    }

    // Then check time period
    switch (selectedTimePeriod) {
      case "wholeMonth":
        return true; // Already filtered by year/month

      case "custom":
        if (!customRangeStart || !customRangeEnd) return true;
        return entryDateOnly >= customRangeStart && entryDateOnly <= customRangeEnd;

      case "15days": {
        const monthEnd = new Date(parseInt(selectedFilterYear), parseInt(selectedFilterMonth), 0);
        const last15DaysStart = new Date(monthEnd);
        last15DaysStart.setDate(last15DaysStart.getDate() - 14);
        const startDateStr = last15DaysStart.toISOString().split('T')[0];
        const endDateStr = monthEnd.toISOString().split('T')[0];
        return entryDateOnly >= startDateStr && entryDateOnly <= endDateStr;
      }

      case "week": {
        // If a specific week is selected
        if (selectedWeek) {
          const year = parseInt(selectedFilterYear);
          const month = parseInt(selectedFilterMonth);
          const weekNumber = parseInt(selectedWeek);
          
          // Get the first day of the month
          const firstDayOfMonth = new Date(year, month - 1, 1);
          const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
          
          // Calculate week boundaries: Week 1 = days 1-7, Week 2 = days 8-14, Week 3 = days 15-21, Week 4 = days 22-28/end
          const daysInMonth = new Date(year, month, 0).getDate();
          let weekStartDate: number;
          let weekEndDate: number;
          
          if (weekNumber === 1) {
            weekStartDate = 1;
            weekEndDate = Math.min(7, daysInMonth);
          } else if (weekNumber === 2) {
            weekStartDate = 8;
            weekEndDate = Math.min(14, daysInMonth);
          } else if (weekNumber === 3) {
            weekStartDate = 15;
            weekEndDate = Math.min(21, daysInMonth);
          } else if (weekNumber === 4) {
            weekStartDate = 22;
            weekEndDate = daysInMonth;
          } else {
            return false;
          }
          
          // If a specific day is selected within the week
          if (selectedDay) {
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayIndex = dayNames.indexOf(selectedDay.toLowerCase());
            
            if (dayIndex === -1) return false;
            
            // Find the date of the selected day within the week range
            // We need to find which date in the week range corresponds to the selected day name
            for (let date = weekStartDate; date <= weekEndDate; date++) {
              const testDate = new Date(year, month - 1, date);
              if (testDate.getDay() === dayIndex) {
                const entryDay = entry.getDate();
                return entryDay === date && entryYear === selectedFilterYear && entryMonth === selectedFilterMonth;
              }
            }
            
            // Day not found in this week range
            return false;
          }
          
          // Otherwise, filter by the entire week
          const entryDay = entry.getDate();
          return entryDay >= weekStartDate && entryDay <= weekEndDate && entryYear === selectedFilterYear && entryMonth === selectedFilterMonth;
        }
        
        // If no week selected, return false (shouldn't happen, but handle it)
        return false;
      }

      case "yesterday": {
        const yesterdayDate = new Date(today);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        return entryDateOnly === yesterdayDate.toISOString().split('T')[0];
      }

      case "today":
        return entryDateOnly === today.toISOString().split('T')[0];

      case "tomorrow": {
        const tomorrowDate = new Date(today);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        return entryDateOnly === tomorrowDate.toISOString().split('T')[0];
      }

      default:
        return true;
    }
  };

  const filteredHistory = verificationHistory.filter(entry => {
    const matchesSearch = (entry.patientName || entry.patientId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        entry.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        entry.payerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || 
                        (filterStatus === "eligible" && entry.isEligible) ||
                        (filterStatus === "ineligible" && !entry.isEligible);
    
    // Check date filter (using appointmentDate or timestamp)
    const entryDate = entry.appointmentDate || entry.timestamp;
    const matchesDate = matchesTimePeriod(entryDate);
    
    // Check patient filter if set
    const matchesPatient = !selectedPatient || entry.patientId === selectedPatient;
    
    return matchesSearch && matchesFilter && matchesDate && matchesPatient;
  });

  const allHistoryExpanded =
    filteredHistory.length > 0 &&
    filteredHistory.every((e: any) => !!expandedHistoryRows[e.id]);

  const toggleHistoryRow = (id: string) => {
    setExpandedHistoryRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAllHistory = () => {
    const next: Record<string, boolean> = {};
    filteredHistory.forEach((e: any) => {
      if (e?.id) next[e.id] = true;
    });
    setExpandedHistoryRows(next);
  };

  const collapseAllHistory = () => setExpandedHistoryRows({});

  const safeFilePart = (value: unknown) => {
    const raw = String(value ?? "").trim();
    const slug = raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);
    return slug || "record";
  };

  const getHistoryEntryExportRows = (entry: any): Array<{ Field: string; Value: string }> => {
    const cptCodes = Array.isArray(entry?.cptCodes)
      ? entry.cptCodes
      : Array.isArray(entry?.cpt_codes)
        ? entry.cpt_codes
        : [];
    const icdCodes = Array.isArray(entry?.icdCodes)
      ? entry.icdCodes
      : Array.isArray(entry?.icd_codes)
        ? entry.icd_codes
        : [];

    const serviceDate =
      entry?.appointmentDate ??
      entry?.timestamp ??
      entry?.serviceDate ??
      entry?.service_date ??
      entry?.created_at ??
      null;

    const serviceDateLabel = serviceDate ? new Date(serviceDate).toISOString().split("T")[0] : "";

    const rows: Array<{ Field: string; Value: string }> = [
      { Field: "Record ID", Value: String(entry?.id ?? "") },
      { Field: "Date", Value: serviceDateLabel },
      { Field: "Patient", Value: String(entry?.patientName ?? entry?.patient_name ?? entry?.patientId ?? entry?.patient_id ?? "") },
      { Field: "Patient ID", Value: String(entry?.patientId ?? entry?.patient_id ?? "") },
      { Field: "Payer", Value: String(entry?.payerId ?? entry?.payer_id ?? entry?.payer_name ?? "") },
      { Field: "Plan Type", Value: String(entry?.planType ?? entry?.plan_type ?? "") },
      { Field: "Network Status", Value: String(entry?.inNetworkStatus ?? entry?.in_network_status ?? "") },
      { Field: "Eligibility", Value: entry?.isEligible ? "Eligible" : "InEligible" },
      { Field: "Appointment Location", Value: String(entry?.appointmentLocation ?? entry?.scheduled_location ?? "") },
      { Field: "Type of Visit", Value: String(entry?.typeOfVisit ?? entry?.type_of_visit ?? "") },
      { Field: "Verification Method", Value: String(entry?.verificationMethod ?? entry?.verification_method ?? "") },
      { Field: "CPT Codes", Value: cptCodes.length ? cptCodes.join(", ") : "" },
      { Field: "ICD Codes", Value: icdCodes.length ? icdCodes.join(", ") : "" },
      { Field: "Prior Auth Required", Value: entry?.preAuthorizationRequired ? "Yes" : "No" },
      { Field: "Prior Auth #", Value: String(entry?.priorAuthNumber ?? entry?.prior_auth_number ?? "") },
      { Field: "Referral Required", Value: entry?.referralRequired ? "Yes" : "No" },
      { Field: "Referral #", Value: String(entry?.referralNumber ?? entry?.referral_number ?? "") },
      { Field: "Copay", Value: String(entry?.coverage?.copay ?? entry?.coPay ?? entry?.copay ?? "") },
      { Field: "Deductible", Value: String(entry?.coverage?.deductible ?? entry?.deductible ?? "") },
      { Field: "Out-of-Pocket Remaining", Value: String(entry?.outOfPocketRemaining ?? entry?.out_of_pocket_remaining ?? "") },
      { Field: "Allowed Amount", Value: String(entry?.allowedAmount ?? entry?.allowed_amount ?? "") },
      { Field: "Estimated Cost", Value: String(entry?.estimatedCost ?? entry?.estimated_cost ?? "") },
    ];

    return rows
      .map((r) => ({
        Field: r.Field,
        Value:
          r.Value === "undefined" || r.Value === "null"
            ? ""
            : String(r.Value ?? ""),
      }))
      .filter((r) => r.Field);
  };

  const downloadTextFile = (filename: string, mimeType: string, content: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadHistoryEntry = async (entry: any) => {
    try {
      const rows = getHistoryEntryExportRows(entry);
      const datePart = (() => {
        const d = entry?.appointmentDate ?? entry?.timestamp ?? entry?.serviceDate ?? entry?.created_at;
        try {
          return d ? new Date(d).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
        } catch {
          return new Date().toISOString().split("T")[0];
        }
      })();

      const namePart = safeFilePart(entry?.patientName ?? entry?.patient_name ?? entry?.patientId ?? entry?.patient_id ?? "eligibility");
      const baseName = `eligibility-verification-${namePart}-${datePart}`;

      if (historyDownloadFormat === "json") {
        let json = "";
        try {
          json = JSON.stringify(entry, null, 2);
        } catch {
          json = JSON.stringify({ error: "Unable to stringify record", recordId: entry?.id ?? null }, null, 2);
        }
        downloadTextFile(`${baseName}.json`, "application/json", json);
        return;
      }

      if (historyDownloadFormat === "csv") {
        const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        const csv = ["Field,Value", ...rows.map((r) => `${escape(r.Field)},${escape(r.Value)}`)].join("\n");
        downloadTextFile(`${baseName}.csv`, "text/csv", csv);
        return;
      }

      if (historyDownloadFormat === "xlsx") {
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.json_to_sheet(rows);
        (ws as any)["!cols"] = [{ wch: 28 }, { wch: 80 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Verification");
        XLSX.writeFile(wb, `${baseName}.xlsx`);
        return;
      }

      if (historyDownloadFormat === "pdf") {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        const marginX = 12;
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = 14;

        doc.setFontSize(12);
        doc.text("Eligibility Verification Record", marginX, y);
        y += 8;

        doc.setFontSize(9);
        for (const row of rows) {
          const line = `${row.Field}: ${row.Value || "—"}`;
          const wrapped = doc.splitTextToSize(line, 180);
          for (const part of wrapped) {
            if (y > pageHeight - 12) {
              doc.addPage();
              y = 14;
            }
            doc.text(part, marginX, y);
            y += 5;
          }
        }

        doc.save(`${baseName}.pdf`);
        return;
      }
    } catch (err: any) {
      console.error("Download record failed:", err);
      toast({
        title: "Download failed",
        description: err?.message || "Unable to download this record.",
        variant: "destructive",
      });
    }
  };

  const downloadHistoryList = async (entries: any[]) => {
    try {
      if (!entries || entries.length === 0) {
        toast({
          title: "Nothing to download",
          description: "No verification records found for the current filter.",
          variant: "default",
        });
        return;
      }

      const datePart = new Date().toISOString().split("T")[0];
      const baseName = `eligibility-verification-history-${datePart}`;

      if (historyDownloadFormat === "json") {
        downloadTextFile(`${baseName}.json`, "application/json", JSON.stringify(entries, null, 2));
        return;
      }

      const listRows = entries.map((e: any) => {
        const cptCodes = Array.isArray(e?.cptCodes)
          ? e.cptCodes
          : Array.isArray(e?.cpt_codes)
            ? e.cpt_codes
            : [];
        const icdCodes = Array.isArray(e?.icdCodes)
          ? e.icdCodes
          : Array.isArray(e?.icd_codes)
            ? e.icd_codes
            : [];

        const when =
          e?.appointmentDate ??
          e?.timestamp ??
          e?.serviceDate ??
          e?.service_date ??
          e?.created_at ??
          null;
        let date = "";
        try {
          date = when ? new Date(when).toISOString().split("T")[0] : "";
        } catch {
          date = "";
        }

        return {
          Date: date,
          Patient: String(e?.patientName ?? e?.patient_name ?? ""),
          Patient_ID: String(e?.patientId ?? e?.patient_id ?? ""),
          Payer: String(e?.payerId ?? e?.payer_id ?? ""),
          Plan_Type: String(e?.planType ?? e?.plan_type ?? ""),
          Network_Status: String(e?.inNetworkStatus ?? e?.in_network_status ?? ""),
        Eligibility: e?.isEligible ? "Eligible" : "InEligible",
          Location: String(e?.appointmentLocation ?? e?.scheduled_location ?? ""),
          Type_Of_Visit: String(e?.typeOfVisit ?? e?.type_of_visit ?? ""),
          Method: String(e?.verificationMethod ?? e?.verification_method ?? ""),
          CPT_Codes: cptCodes.length ? cptCodes.join(", ") : "",
          ICD_Codes: icdCodes.length ? icdCodes.join(", ") : "",
          Prior_Auth_Required: e?.preAuthorizationRequired ? "Yes" : "No",
          Prior_Auth_Number: String(e?.priorAuthNumber ?? e?.prior_auth_number ?? ""),
          Referral_Required: e?.referralRequired ? "Yes" : "No",
          Referral_Number: String(e?.referralNumber ?? e?.referral_number ?? ""),
          Copay: String(e?.coverage?.copay ?? e?.coPay ?? e?.copay ?? ""),
          Deductible: String(e?.coverage?.deductible ?? e?.deductible ?? ""),
          OOP_Remaining: String(e?.outOfPocketRemaining ?? e?.out_of_pocket_remaining ?? ""),
          Allowed_Amount: String(e?.allowedAmount ?? e?.allowed_amount ?? ""),
          Estimated_Cost: String(e?.estimatedCost ?? e?.estimated_cost ?? ""),
        };
      });

      if (historyDownloadFormat === "csv") {
        const headers = Object.keys(listRows[0] || {});
        const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        const csv = [
          headers.join(","),
          ...listRows.map((row) => headers.map((h) => escape((row as any)[h])).join(",")),
        ].join("\n");
        downloadTextFile(`${baseName}.csv`, "text/csv", csv);
        return;
      }

      if (historyDownloadFormat === "xlsx") {
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.json_to_sheet(listRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "History");
        XLSX.writeFile(wb, `${baseName}.xlsx`);
        return;
      }

      if (historyDownloadFormat === "pdf") {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({ orientation: "landscape" });
        const marginX = 10;
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = 12;

        doc.setFontSize(12);
        doc.text("Eligibility Verification History", marginX, y);
        y += 8;
        doc.setFontSize(8);

        const cols = ["Date", "Patient", "Patient_ID", "Payer", "Eligibility", "CPT_Codes", "Allowed_Amount"];
        const colWidths = [22, 45, 28, 32, 18, 60, 30];
        const drawRow = (values: string[]) => {
          let x = marginX;
          const lineHeight = 4.2;
          const wrapped = values.map((v, i) => doc.splitTextToSize(v || "—", colWidths[i] - 2));
          const rowHeight = Math.max(...wrapped.map((w) => w.length)) * lineHeight + 2;

          if (y + rowHeight > pageHeight - 10) {
            doc.addPage();
            y = 12;
          }

          wrapped.forEach((lines, i) => {
            doc.text(lines, x + 1, y + 4);
            x += colWidths[i];
          });
          y += rowHeight;
        };

        // Header
        drawRow(cols);
        // Data
        listRows.forEach((r: any) => {
          drawRow(cols.map((c) => String(r[c] ?? "")));
        });

        doc.save(`${baseName}.pdf`);
      }
    } catch (err: any) {
      console.error("Download history failed:", err);
      toast({
        title: "Download failed",
        description: err?.message || "Unable to download verification history.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Real-time Eligibility Verification
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive patient insurance coverage verification with EDI 270/271 integration
          </p>
        </div>
        <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="h-4 w-4 mr-2" />
          EDI 270/271 Enabled
        </Badge>
          <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Verification
          </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Eligibility Verification</DialogTitle>
                <DialogDescription>
                  Enter patient information to verify insurance eligibility and benefits
                </DialogDescription>
              </DialogHeader>
              
              {/* CSV Import/Export Actions - Prominent Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">CSV Operations</h3>
                    <p className="text-sm text-blue-700">Import eligibility data from CSV or export current form data</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={handleExportEligibilityCSV}
                      className="bg-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={handleDownloadEligibilitySampleCSV}
                      className="bg-white"
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Sample CSV
                    </Button>
                    <Button
                      variant="default"
                      size="default"
                      asChild
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <label className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Import CSV
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleImportEligibilityCSV}
                          className="hidden"
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
              
      <div className="max-w-full overflow-hidden">
      <Tabs defaultValue="verify" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="verify">Single Verification</TabsTrigger>
          <TabsTrigger value="batch">Batch Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="verify" className="space-y-6">
                  <div className="space-y-6">
                    {/* Verification Info - Compact Single Row */}
                    <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                      <div>
                        <Label htmlFor="serialNo">Verification No (Auto)</Label>
                        <Input
                          id="serialNo"
                          value={verificationForm.serialNo}
                          readOnly
                          className="bg-muted h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="appointmentLocation">Appointment Location *</Label>
                        <Select 
                          value={verificationForm.appointmentLocation} 
                          onValueChange={(value) => setVerificationForm(prev => ({ ...prev, appointmentLocation: value }))}
                          disabled={isLoadingFacilities}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder={isLoadingFacilities ? "Loading..." : "Select location"} />
                          </SelectTrigger>
                          <SelectContent>
                            {facilities.map((facility) => (
                              <SelectItem key={facility.id} value={facility.id}>
                                {facility.name}
                              </SelectItem>
                            ))}
                            {facilities.length === 0 && !isLoadingFacilities && (
                              <SelectItem value="none" disabled>No facilities found</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="appointmentDate">Appointment Date *</Label>
                        <Input
                          id="appointmentDate"
                          type="date"
                          value={verificationForm.appointmentDate || verificationForm.dateOfService}
                          onChange={(e) => {
                            const date = e.target.value;
                            setVerificationForm(prev => ({ 
                              ...prev, 
                              appointmentDate: date,
                              dateOfService: date 
                            }));
                          }}
                          className="h-9"
                          max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="provider">Provider *</Label>
                        <Select 
                          value={verificationForm.providerId} 
                          onValueChange={(value) => {
                            const provider = providers.find(p => p.id === value);
                            setVerificationForm(prev => ({ 
                              ...prev, 
                              providerId: value,
                              providerName: provider ? `${provider.first_name} ${provider.last_name}${provider.title ? `, ${provider.title}` : ''}` : ""
                            }));
                          }}
                          disabled={isLoadingProviders || verificationForm.isSelfPay}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder={isLoadingProviders ? "Loading..." : "Select provider"} />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.first_name} {provider.last_name}{provider.title ? `, ${provider.title}` : ''} (NPI: {provider.npi})
                              </SelectItem>
                            ))}
                            {providers.length === 0 && !isLoadingProviders && (
                              <SelectItem value="none" disabled>No providers found</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Patient Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          Patient Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                  {/* Single Row: Select Patient, Patient Name, DOB */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="patientSelect">Select Patient *</Label>
                      <Popover open={patientComboboxOpen} onOpenChange={setPatientComboboxOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={patientComboboxOpen}
                            className="w-full justify-between h-9 font-normal"
                            disabled={isLoadingPatients}
                          >
                            {verificationForm.patientId
                              ? patients.find(p => (p.patient_id || p.id) === verificationForm.patientId)?.patient_name || verificationForm.patientName || "Select..."
                              : isLoadingPatients ? "Loading..." : "Search patient..."}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput 
                              placeholder="Search by name, ID, or DOB..." 
                              value={patientSearchQuery}
                              onValueChange={setPatientSearchQuery}
                            />
                            <CommandList>
                              <CommandEmpty>No patient found.</CommandEmpty>
                              <CommandGroup>
                                {patients
                                  .filter(patient => {
                                    const query = patientSearchQuery.toLowerCase();
                                    if (!query) return true;
                                    const name = (patient.patient_name || "").toLowerCase();
                                    const id = (patient.patient_id || "").toLowerCase();
                                    return name.includes(query) || id.includes(query);
                                  })
                                  .map((patient) => (
                                    <CommandItem
                                      key={patient.id}
                                      value={`${patient.patient_name} ${patient.patient_id}`}
                                      onSelect={() => {
                                        handlePatientSelect(patient.patient_id || patient.id);
                                        setPatientComboboxOpen(false);
                                        setPatientSearchQuery("");
                                      }}
                                    >
                                      <CheckCircle
                                        className={`mr-2 h-4 w-4 ${verificationForm.patientId === (patient.patient_id || patient.id) ? "opacity-100" : "opacity-0"}`}
                                      />
                                      {patient.patient_name} {patient.patient_id && `(${patient.patient_id})`}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="patientName">Patient Name *</Label>
                      <Input
                        id="patientName"
                        value={verificationForm.patientName}
                        readOnly
                        className="bg-muted h-9"
                        placeholder="Auto-filled"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dob">Date of Birth *</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={verificationForm.dob}
                        readOnly
                        className="bg-muted h-9"
                      />
                      {/* Primary Insurance - Collapsible */}

                    </div>
                  </div>
                  
                    <Collapsible defaultOpen={false} className="border rounded-lg">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            <span className="text-lg font-semibold">Primary Insurance</span>
                          </div>
                          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 pt-0 space-y-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              id="isSelfPay"
                              checked={verificationForm.isSelfPay}
                              onCheckedChange={(checked) => {
                                setVerificationForm(prev => ({ 
                                  ...prev, 
                                  isSelfPay: checked as boolean,
                                  primaryInsurance: checked ? "" : prev.primaryInsurance,
                                  insuranceId: checked ? "" : prev.insuranceId,
                                  providerId: checked ? "" : prev.providerId,
                                  nppId: checked ? "" : prev.nppId,
                                }));
                              }}
                            />
                            <Label htmlFor="isSelfPay" className="cursor-pointer font-medium">Self Pay (No Insurance)</Label>
                          </div>
                          {/* Row 1: Insurance Name, ID, Plan, Plan Type */}
                          <div className="grid grid-cols-4 gap-3">
                            <div>
                              <Label htmlFor="primaryInsurance">Insurance Name *</Label>
                              <Select 
                                value={verificationForm.primaryInsurance} 
                                onValueChange={(value) => setVerificationForm(prev => ({ ...prev, primaryInsurance: value }))}
                                disabled={verificationForm.isSelfPay}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder={verificationForm.isSelfPay ? "N/A - Self Pay" : "Select insurance"} />
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
                            <div>
                              <Label htmlFor="insuranceId">Insurance ID *</Label>
                              <Input
                                id="insuranceId"
                                value={verificationForm.insuranceId}
                                onChange={(e) => setVerificationForm(prev => ({ ...prev, insuranceId: e.target.value }))}
                                placeholder="Subscriber/Member ID"
                                disabled={verificationForm.isSelfPay}
                                className="h-9"
                              />
                            </div>
                          
                            <div>
                              <Label htmlFor="planType">Plan Type</Label>
                              <Select 
                                value={verificationForm.planType} 
                                onValueChange={(value) => setVerificationForm(prev => ({ ...prev, planType: value }))}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="HMO">HMO</SelectItem>
                                  <SelectItem value="PPO">PPO</SelectItem>
                                  <SelectItem value="EPO">EPO</SelectItem>
                                  <SelectItem value="POS">POS</SelectItem>
                                  <SelectItem value="HDHP">HDHP</SelectItem>
                                  <SelectItem value="Medicare">Medicare</SelectItem>
                                  <SelectItem value="Medicaid">Medicaid</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        
                        {/* Primary Insurance Cost Sharing */}
                        <div className="p-4 pt-0 space-y-3 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300">Primary Insurance Cost Sharing</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                              <Label htmlFor="coPay">Co-pay</Label>
                              <Input
                                id="coPay"
                                type="number"
                                step="0.01"
                                value={verificationForm.coPay}
                                onChange={(e) => setVerificationForm(prev => ({ ...prev, coPay: e.target.value }))}
                                placeholder="0.00"
                                className="h-9"
                              />
                            </div>
                            <div>
                              <Label htmlFor="coInsurance">Co-insurance (%)</Label>
                              <Input
                                id="coInsurance"
                                type="number"
                                step="0.01"
                                value={verificationForm.coInsurance}
                                onChange={(e) => setVerificationForm(prev => ({ ...prev, coInsurance: e.target.value }))}
                                placeholder="0.00"
                                className="h-9"
                              />
                            </div>
                            <div>
                              <Label htmlFor="deductibleStatus">Deductible Status</Label>
                              <Select
                                value={verificationForm.deductibleStatus}
                                onValueChange={(value) => setVerificationForm(prev => ({ ...prev, deductibleStatus: value as "Met" | "Not Met" }))}
                              >
                                <SelectTrigger id="deductibleStatus" className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Met">Met</SelectItem>
                                  <SelectItem value="Not Met">Not Met</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="deductibleAmount">Deductible Amount</Label>
                              <Input
                                id="deductibleAmount"
                                type="number"
                                step="0.01"
                                value={verificationForm.deductibleAmount}
                                onChange={(e) => setVerificationForm(prev => ({ ...prev, deductibleAmount: e.target.value }))}
                                placeholder="0.00"
                                className="h-9"
                                disabled={verificationForm.deductibleStatus === "Met"}
                              />
                              {verificationForm.deductibleStatus === "Met" && (
                                <p className="text-xs text-muted-foreground mt-1">Deductible met - amount locked at $0</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Secondary Insurance - Collapsible */}
                    <Collapsible defaultOpen={false} className="border rounded-lg">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                          <div className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-blue-600" />
                            <span className="text-lg font-semibold">Secondary Insurance (Optional)</span>
                          </div>
                          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 pt-0 space-y-3">
                          {/* Row 1: Insurance Name, ID, Plan, Plan Type */}
                          <div className="grid grid-cols-4 gap-3">
                            <div>
                              <Label htmlFor="secondaryInsuranceName">Insurance Name</Label>
                              <Select 
                                value={verificationForm.secondaryInsuranceName} 
                                onValueChange={(value) => setVerificationForm(prev => ({ ...prev, secondaryInsuranceName: value }))}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select insurance" />
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
                            <div>
                              <Label htmlFor="secondaryInsuranceId">Insurance ID</Label>
                              <Input
                                id="secondaryInsuranceId"
                                value={verificationForm.secondaryInsuranceId}
                                onChange={(e) => setVerificationForm(prev => ({ ...prev, secondaryInsuranceId: e.target.value }))}
                                placeholder="Subscriber/Member ID"
                                className="h-9"
                              />
                            </div>
                           
                            <div>
                              <Label htmlFor="secondaryRelationshipCode">Plan Type</Label>
                              <Select
                                value={verificationForm.secondaryRelationshipCode}
                                onValueChange={(value) => setVerificationForm(prev => ({ ...prev, secondaryRelationshipCode: value }))}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="HMO">HMO</SelectItem>
                                  <SelectItem value="PPO">PPO</SelectItem>
                                  <SelectItem value="EPO">EPO</SelectItem>
                                  <SelectItem value="POS">POS</SelectItem>
                                  <SelectItem value="Medicare">Medicare</SelectItem>
                                  <SelectItem value="Medicaid">Medicaid</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        
                        {/* Secondary Insurance Cost Sharing */}
                        <div className="p-4 pt-0 space-y-3 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300">Secondary Insurance Cost Sharing</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                              <Label htmlFor="secondaryCoPay">Secondary Co-pay</Label>
                              <Input
                                id="secondaryCoPay"
                                type="number"
                                step="0.01"
                                value={verificationForm.secondaryCoPay}
                                onChange={(e) => setVerificationForm(prev => ({ ...prev, secondaryCoPay: e.target.value }))}
                                placeholder="0.00"
                                className="h-9"
                              />
                            </div>
                            <div>
                              <Label htmlFor="secondaryDeductible">Secondary Deductible</Label>
                              <Input
                                id="secondaryDeductible"
                                type="number"
                                step="0.01"
                                value={verificationForm.secondaryDeductible}
                                onChange={(e) => setVerificationForm(prev => ({ ...prev, secondaryDeductible: e.target.value }))}
                                placeholder="0.00"
                                className="h-9"
                              />
                            </div>
                            <div>
                              <Label htmlFor="secondaryDeductibleMet">Secondary Deductible Met</Label>
                              <Input
                                id="secondaryDeductibleMet"
                                type="number"
                                step="0.01"
                                value={verificationForm.secondaryDeductibleMet}
                                onChange={(e) => setVerificationForm(prev => ({ ...prev, secondaryDeductibleMet: e.target.value }))}
                                placeholder="0.00"
                                className="h-9"
                              />
                            </div>
                            <div>
                              <Label htmlFor="secondaryCoInsurance">Secondary Co-insurance (%)</Label>
                              <Input
                                id="secondaryCoInsurance"
                                type="number"
                                step="0.01"
                                value={verificationForm.secondaryCoInsurance}
                                onChange={(e) => setVerificationForm(prev => ({ ...prev, secondaryCoInsurance: e.target.value }))}
                                placeholder="0.00"
                                className="h-9"
                              />
                            </div>
                            <div>
                              <Label htmlFor="secondaryCoveragePercent">Secondary Coverage %</Label>
                              <Input
                                id="secondaryCoveragePercent"
                                type="number"
                                step="0.01"
                                value={verificationForm.secondaryCoveragePercent}
                                onChange={(e) => setVerificationForm(prev => ({ ...prev, secondaryCoveragePercent: e.target.value }))}
                                placeholder="0.00"
                                className="h-9"
                              />
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                  {/* Demographic Read-Only Section - Only shows when patient is selected */}
                  {verificationForm.patientId && verificationForm.demographicDisplay.patientId && (
                    <Card className="mt-4 border-blue-200 dark:border-blue-800">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            Demographic (Read-Only)
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">Patient demographic information from database</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Open the patient edit modal
                            setShowPatientEditModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Patient ID</Label>
                            <p className="font-medium">{verificationForm.demographicDisplay.patientId || '—'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">First Name</Label>
                            <p className="font-medium">{verificationForm.demographicDisplay.firstName || '—'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Last Name</Label>
                            <p className="font-medium">{verificationForm.demographicDisplay.lastName || '—'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Middle Initial</Label>
                            <p className="font-medium">{verificationForm.demographicDisplay.middleInitial || '—'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Suffix</Label>
                            <p className="font-medium">{verificationForm.demographicDisplay.suffix || '—'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                            <p className="font-medium">{verificationForm.demographicDisplay.dob || '—'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Gender</Label>
                            <p className="font-medium">{verificationForm.demographicDisplay.gender || '—'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Phone</Label>
                            <p className="font-medium">{verificationForm.demographicDisplay.phone || '—'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Email</Label>
                            <p className="font-medium">{verificationForm.demographicDisplay.email || '—'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Address</Label>
                            <p className="font-medium">{verificationForm.demographicDisplay.address || '—'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">City</Label>
                            <p className="font-medium">{verificationForm.demographicDisplay.city || '—'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">State</Label>
                            <p className="font-medium">{verificationForm.demographicDisplay.state || '—'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Zip Code</Label>
                            <p className="font-medium">{verificationForm.demographicDisplay.zip || '—'}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">SSN</Label>
                            <p className="font-medium">{verificationForm.demographicDisplay.ssn ? '***-**-' + verificationForm.demographicDisplay.ssn.slice(-4) : '—'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                      </CardContent>
                    </Card>
 
                    {/* Referral & Authorization - MOVED TO BE AFTER PATIENT INFORMATION */}
                    <Card className={verificationForm.referralRequired ? "border-2 border-amber-500 shadow-md shadow-amber-200" : ""}>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle className={verificationForm.referralRequired ? "h-5 w-5 text-amber-600" : "h-5 w-5 text-blue-600"} />
                          Referral & Authorization
                        </CardTitle>
                        {verificationForm.referralRequired && (
                          <span className="inline-flex items-center rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-400">
                            Referral Required
                          </span>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                              <div className="flex items-center justify-between pb-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="referralRequired"
                                    checked={verificationForm.referralRequired}
                                    onCheckedChange={(checked) => setVerificationForm(prev => ({ ...prev, referralRequired: checked as boolean }))}
                                  />
                                  <Label htmlFor="referralRequired" className="cursor-pointer">Referral Required</Label>
                                </div>
                                
                                <div className="flex space-x-6">
                                  {/* Referral Status - Active/Inactive */}
                                  <div className="flex items-center space-x-2">
                                    <Label className="text-sm font-medium">Status:</Label>
                                    <div className="flex items-center space-x-2">
                                      <div className="flex items-center space-x-1">
                                        <input
                                          type="radio"
                                          id="referralStatusActive"
                                          name="referralStatus"
                                          value="active"
                                          checked={verificationForm.referralStatus === 'active'}
                                          onChange={(e) => setVerificationForm(prev => ({ ...prev, referralStatus: e.target.value }))}
                                          className="h-4 w-4"
                                        />
                                        <Label htmlFor="referralStatusActive" className="text-xs cursor-pointer">Active</Label>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <input
                                          type="radio"
                                          id="referralStatusInactive"
                                          name="referralStatus"
                                          value="inactive"
                                          checked={verificationForm.referralStatus === 'inactive'}
                                          onChange={(e) => setVerificationForm(prev => ({ ...prev, referralStatus: e.target.value }))}
                                          className="h-4 w-4"
                                        />
                                        <Label htmlFor="referralStatusInactive" className="text-xs cursor-pointer">Inactive</Label>
                                      </div>
                                    </div>
                                  </div>

                                  {/* In Network Status - Yes/No */}
                                  <div className="flex items-center space-x-2">
                                    <Label className="text-sm font-medium">In-Network:</Label>
                                    <div className="flex items-center space-x-2">
                                      <div className="flex items-center space-x-1">
                                        <input
                                          type="radio"
                                          id="inNetworkYes"
                                          name="inNetworkStatus"
                                          value="yes"
                                          checked={verificationForm.inNetworkStatus === 'yes'}
                                          onChange={(e) => setVerificationForm(prev => ({ ...prev, inNetworkStatus: e.target.value }))}
                                          className="h-4 w-4"
                                        />
                                        <Label htmlFor="inNetworkYes" className="text-xs cursor-pointer">Yes</Label>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <input
                                          type="radio"
                                          id="inNetworkNo"
                                          name="inNetworkStatus"
                                          value="no"
                                          checked={verificationForm.inNetworkStatus === 'no'}
                                          onChange={(e) => setVerificationForm(prev => ({ ...prev, inNetworkStatus: e.target.value }))}
                                          className="h-4 w-4"
                                        />
                                        <Label htmlFor="inNetworkNo" className="text-xs cursor-pointer">No</Label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {verificationForm.referralRequired && (
                                <div className="ml-6 space-y-4 border-l-2 pl-4">
                        <div>
                                  <Label htmlFor="referralObtainedFrom">Obtain From</Label>
                                  <Select 
                                    value={verificationForm.referralObtainedFrom} 
                                    onValueChange={(value) => setVerificationForm(prev => ({ ...prev, referralObtainedFrom: value }))}
                                  >
                          <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                                      <SelectItem value="PCP">Obtain from PCP</SelectItem>
                                      <SelectItem value="InsuranceApprovedPCP">Insurance Approved PCP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                                {verificationForm.referralObtainedFrom === "PCP" && (
                      <div>
                                  <Label htmlFor="referralPCPStatus">PCP Status</Label>
                                  <Select 
                                    value={verificationForm.referralPCPStatus} 
                                    onValueChange={(value) => setVerificationForm(prev => ({ ...prev, referralPCPStatus: value }))}
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="onFile">On File</SelectItem>
                                      <SelectItem value="required">Required</SelectItem>
                                    </SelectContent>
                                  </Select>
                      </div>
                                )}
                                <div>
                                  <Label htmlFor="referralNumber">Referral Number</Label>
                                  <Input
                                    id="referralNumber"
                                    value={verificationForm.referralNumber}
                                    onChange={(e) => setVerificationForm(prev => ({ ...prev, referralNumber: e.target.value }))}
                                    placeholder="Enter referral number if available"
                                    className="h-9"
                                  />
                                </div>
                      </div>
                              )}

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="preAuthorizationRequired"
                                  checked={verificationForm.preAuthorizationRequired}
                                  onCheckedChange={(checked) => {
                                    setVerificationForm(prev => ({ ...prev, preAuthorizationRequired: checked as boolean }));
                                    // Open authorization dialog when checked
                                    if (checked && verificationForm.patientId) {
                                      setShowAuthDialog(true);
                                    } else if (checked && !verificationForm.patientId) {
                                      toast({
                                        title: "Patient Required",
                                        description: "Please select a patient first before creating a prior authorization request.",
                                        variant: "destructive"
                                      });
                                    }
                                  }}
                                />
                                <Label htmlFor="preAuthorizationRequired" className="cursor-pointer">Pre-Authorization Required</Label>
                                {verificationForm.preAuthorizationRequired && verificationForm.patientId && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAuthDialog(true)}
                                    className="ml-2"
                                  >
                                    Create Authorization Request
                                  </Button>
                                )}
                              </div>

                              {verificationForm.preAuthorizationRequired && (
                                <div className="ml-6 space-y-4 border-l-2 pl-4 border-blue-200 dark:border-blue-800">
                                  {/* Prior Authorization Status & Basic Info */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div>
                                      <Label htmlFor="priorAuthStatus">Prior Auth Status *</Label>
                                      <Select
                                        value={verificationForm.priorAuthStatus}
                                        onValueChange={(value) => {
                                          const updates: any = { priorAuthStatus: value };
                                          // Auto-set dates based on status (only if not already set)
                                          if (value === "request_submitted" && !verificationForm.priorAuthSubmissionDate) {
                                            updates.priorAuthSubmissionDate = new Date().toISOString().split('T')[0];
                                          }
                                          if (value === "request_submitted" && !verificationForm.priorAuthRequestDate) {
                                            updates.priorAuthRequestDate = new Date().toISOString().split('T')[0];
                                          }
                                          if (value === "approved" && !verificationForm.priorAuthResponseDate) {
                                            updates.priorAuthResponseDate = new Date().toISOString().split('T')[0];
                                          }
                                          // If status changes to denied, clear approval-related fields
                                          if (value === "denied") {
                                            updates.priorAuthNumber = "";
                                            updates.priorAuthEffectiveDate = "";
                                            updates.priorAuthExpirationDate = "";
                                          }
                                          // If status changes to expired, update expiration flag
                                          if (value === "expired") {
                                            // Keep existing dates but mark as expired
                                          }
                                          setVerificationForm(prev => ({ ...prev, ...updates }));
                                        }}
                                      >
                                        <SelectTrigger className="h-9">
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="not_started">Not Started</SelectItem>
                                          <SelectItem value="request_submitted">Request Submitted</SelectItem>
                                          <SelectItem value="pending">Pending Review</SelectItem>
                                          <SelectItem value="under_review">Under Review</SelectItem>
                                          <SelectItem value="additional_info_requested">Additional Info Requested</SelectItem>
                                          <SelectItem value="approved">Approved</SelectItem>
                                          <SelectItem value="denied">Denied</SelectItem>
                                          <SelectItem value="expired">Expired</SelectItem>
                                          <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="priorAuthNumber">Authorization Number</Label>
                                      <Input
                                        id="priorAuthNumber"
                                        value={verificationForm.priorAuthNumber}
                                        onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthNumber: e.target.value }))}
                                        placeholder="Enter authorization number"
                                        className="h-9"
                                        disabled={verificationForm.priorAuthStatus !== "approved"}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="priorAuthSubmissionMethod">Submission Method</Label>
                                      <Select
                                        value={verificationForm.priorAuthSubmissionMethod}
                                        onValueChange={(value) => setVerificationForm(prev => ({ ...prev, priorAuthSubmissionMethod: value }))}
                                      >
                                        <SelectTrigger className="h-9">
                                          <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="electronic">Electronic (X12 278)</SelectItem>
                                          <SelectItem value="portal">Payer Portal</SelectItem>
                                          <SelectItem value="fax">Fax</SelectItem>
                                          <SelectItem value="email">Email</SelectItem>
                                          <SelectItem value="phone">Phone (Verbal)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="priorAuthPayerConfirmationNumber">Payer Confirmation #</Label>
                                      <Input
                                        id="priorAuthPayerConfirmationNumber"
                                        value={verificationForm.priorAuthPayerConfirmationNumber}
                                        onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthPayerConfirmationNumber: e.target.value }))}
                                        placeholder="Payer confirmation number"
                                        className="h-9"
                                      />
                                    </div>
                                  </div>

                                  {/* Prior Authorization Dates */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div>
                                      <Label htmlFor="priorAuthRequestDate">Request Date</Label>
                                      <Input
                                        id="priorAuthRequestDate"
                                        type="date"
                                        value={verificationForm.priorAuthRequestDate}
                                        onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthRequestDate: e.target.value }))}
                                        className="h-9"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="priorAuthSubmissionDate">Submission Date</Label>
                                      <Input
                                        id="priorAuthSubmissionDate"
                                        type="date"
                                        value={verificationForm.priorAuthSubmissionDate}
                                        onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthSubmissionDate: e.target.value }))}
                                        className="h-9"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="priorAuthExpectedResponseDate">Expected Response Date</Label>
                                      <Input
                                        id="priorAuthExpectedResponseDate"
                                        type="date"
                                        value={verificationForm.priorAuthExpectedResponseDate}
                                        onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthExpectedResponseDate: e.target.value }))}
                                        className="h-9"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="priorAuthResponseDate">Response Date</Label>
                                      <Input
                                        id="priorAuthResponseDate"
                                        type="date"
                                        value={verificationForm.priorAuthResponseDate}
                                        onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthResponseDate: e.target.value }))}
                                        className="h-9"
                                      />
                                    </div>
                                  </div>

                                  {/* Authorization Effective & Expiration Dates */}
                                  {(verificationForm.priorAuthStatus === "approved" || verificationForm.priorAuthNumber) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                                      <div>
                                        <Label htmlFor="priorAuthEffectiveDate">Authorization Effective Date *</Label>
                                        <Input
                                          id="priorAuthEffectiveDate"
                                          type="date"
                                          value={verificationForm.priorAuthEffectiveDate}
                                          onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthEffectiveDate: e.target.value }))}
                                          className="h-9"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="priorAuthExpirationDate">Authorization Expiration Date *</Label>
                                        <Input
                                          id="priorAuthExpirationDate"
                                          type="date"
                                          value={verificationForm.priorAuthExpirationDate}
                                          onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthExpirationDate: e.target.value }))}
                                          className="h-9"
                                        />
                                        {verificationForm.priorAuthExpirationDate && new Date(verificationForm.priorAuthExpirationDate) < new Date() && (
                                          <p className="text-xs text-red-600 mt-1">⚠️ Authorization has expired</p>
                                        )}
                                      </div>
                                      <div>
                                        <Label htmlFor="priorAuthApprovedQuantity">Approved Quantity</Label>
                                        <Input
                                          id="priorAuthApprovedQuantity"
                                          value={verificationForm.priorAuthApprovedQuantity}
                                          onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthApprovedQuantity: e.target.value }))}
                                          placeholder="e.g., 1, 10, etc."
                                          className="h-9"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="priorAuthApprovedFrequency">Approved Frequency</Label>
                                        <Input
                                          id="priorAuthApprovedFrequency"
                                          value={verificationForm.priorAuthApprovedFrequency}
                                          onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthApprovedFrequency: e.target.value }))}
                                          placeholder="e.g., Once, Daily, Weekly"
                                          className="h-9"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Denial Information */}
                                  {verificationForm.priorAuthStatus === "denied" && (
                                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800 space-y-3">
                                      <Label className="text-sm font-semibold text-red-900 dark:text-red-100">Denial Information</Label>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                          <Label htmlFor="priorAuthDenialReasonCode">Denial Reason Code</Label>
                                          <Input
                                            id="priorAuthDenialReasonCode"
                                            value={verificationForm.priorAuthDenialReasonCode}
                                            onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthDenialReasonCode: e.target.value }))}
                                            placeholder="e.g., MN (Medical Necessity)"
                                            className="h-9"
                                          />
                                        </div>
                                        <div className="sm:col-span-1">
                                          <Label htmlFor="priorAuthDenialReason">Denial Reason Description</Label>
                                          <Textarea
                                            id="priorAuthDenialReason"
                                            value={verificationForm.priorAuthDenialReason}
                                            onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthDenialReason: e.target.value }))}
                                            placeholder="Enter denial reason..."
                                            rows={2}
                                            className="resize-none"
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Appeal Section */}
                                      <div className="border-t pt-3 mt-3">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <Checkbox
                                            id="priorAuthAppealSubmitted"
                                            checked={verificationForm.priorAuthAppealSubmitted}
                                            onCheckedChange={(checked) => setVerificationForm(prev => ({ ...prev, priorAuthAppealSubmitted: checked as boolean }))}
                                          />
                                          <Label htmlFor="priorAuthAppealSubmitted" className="cursor-pointer">Appeal Submitted</Label>
                                        </div>
                                        {verificationForm.priorAuthAppealSubmitted && (
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 ml-6">
                                            <div>
                                              <Label htmlFor="priorAuthAppealDate">Appeal Date</Label>
                                              <Input
                                                id="priorAuthAppealDate"
                                                type="date"
                                                value={verificationForm.priorAuthAppealDate}
                                                onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthAppealDate: e.target.value }))}
                                                className="h-9"
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="priorAuthAppealStatus">Appeal Status</Label>
                                              <Select
                                                value={verificationForm.priorAuthAppealStatus}
                                                onValueChange={(value) => setVerificationForm(prev => ({ ...prev, priorAuthAppealStatus: value }))}
                                      >
                                        <SelectTrigger className="h-9">
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="approved">Approved</SelectItem>
                                          <SelectItem value="denied">Denied</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                            <div>
                                              <Label htmlFor="priorAuthAppealDecisionDate">Appeal Decision Date</Label>
                                              <Input
                                                id="priorAuthAppealDecisionDate"
                                                type="date"
                                                value={verificationForm.priorAuthAppealDecisionDate}
                                                onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthAppealDecisionDate: e.target.value }))}
                                                className="h-9"
                                              />
                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Service Date (if approved) */}
                                    {verificationForm.priorAuthStatus === "approved" && (
                                      <div>
                                        <Label htmlFor="priorAuthServiceDate">Service Date (When service was/will be provided)</Label>
                                        <Input
                                          id="priorAuthServiceDate"
                                          type="date"
                                          value={verificationForm.priorAuthServiceDate}
                                          onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthServiceDate: e.target.value }))}
                                          className="h-9"
                                        />
                                        {verificationForm.priorAuthExpirationDate && verificationForm.priorAuthServiceDate && 
                                         new Date(verificationForm.priorAuthServiceDate) > new Date(verificationForm.priorAuthExpirationDate) && (
                                          <p className="text-xs text-yellow-600 mt-1">⚠️ Service date is after authorization expiration</p>
                                        )}
                                      </div>
                                    )}

                                    {/* Status Alerts */}
                                    {verificationForm.priorAuthStatus === "pending" && verificationForm.priorAuthExpectedResponseDate && 
                                     new Date(verificationForm.priorAuthExpectedResponseDate) < new Date() && (
                                      <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                        <AlertDescription className="text-yellow-800 dark:text-yellow-200 text-sm">
                                          Expected response date has passed. Follow up with payer.
                                        </AlertDescription>
                                      </Alert>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                    {/* Service Codes (CPT/ICD) - Optional but recommended for specific service verification */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Service Codes (Optional)
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Add CPT and ICD codes for specific service verification</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* CPT Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">CPT Section</Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const code = verificationForm.currentCpt.code.trim();
                                  if (!code) {
                                    toast({
                                      title: "CPT Code Required",
                                      description: "Please enter a CPT code in the table row below before adding.",
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  
                                  // Validate that code is at least 5 digits
                                  if (code.length < 5) {
                                    toast({
                                      title: "Invalid CPT Code",
                                      description: "CPT code must be at least 5 characters.",
                                      variant: "destructive",
                                    });
                                    return;
                                  }

                                  // Check if code already exists in the list
                                  const codeExists = verificationForm.cptCodes.some(
                                    cpt => cpt.code.trim() === code
                                  );
                                  
                                  if (codeExists) {
                                    toast({
                                      title: "Duplicate CPT Code",
                                      description: `CPT code ${code} is already in the list.`,
                                      variant: "destructive",
                                    });
                                    return;
                                  }

                                  // Add the CPT code
                                  setVerificationForm(prev => ({
                                    ...prev,
                                    cptCodes: [...prev.cptCodes, { ...prev.currentCpt }],
                                    currentCpt: {
                                      code: "",
                                      modifier1: "",
                                      modifier2: "",
                                      icd: "",
                                      pos: "",
                                      tos: "",
                                      units: "",
                                      charge: "",
                                    }
                                  }));

                                  toast({
                                    title: "CPT Code Added",
                                    description: `CPT code ${code} has been added successfully.`,
                                  });
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add CPT
                              </Button>
                            </div>
                          </div>
                          
                          {/* CPT Table */}
                          <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto max-w-full">
                              <table className="w-full text-sm max-w-full">
                                <thead className="bg-muted">
                                  <tr>
                                    <th className="p-2 text-left font-medium">CPT Code</th>
                                    <th className="p-2 text-left font-medium">Mod 1</th>
                                    <th className="p-2 text-left font-medium">Mod 2</th>
                                    <th className="p-2 text-left font-medium">ICD</th>
                                    <th className="p-2 text-left font-medium">POS</th>
                                    <th className="p-2 text-left font-medium">TOS</th>
                                    <th className="p-2 text-left font-medium">Units</th>
                                    <th className="p-2 text-left font-medium">Charge</th>
                                    <th className="p-2 text-left font-medium">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {verificationForm.cptCodes.map((cpt, index) => (
                                    <tr key={index} className="border-t">
                                      <td className="p-2">{cpt.code}</td>
                                      <td className="p-2">{cpt.modifier1 || "-"}</td>
                                      <td className="p-2">{cpt.modifier2 || "-"}</td>
                                      <td className="p-2">{cpt.icd || "-"}</td>
                                      <td className="p-2">{placeOfServiceCodes.find(p => p.code === cpt.pos)?.description?.substring(0, 15) || cpt.pos || "-"}</td>
                                      <td className="p-2">{typeOfServiceCodes.find(t => t.code === cpt.tos)?.description?.substring(0, 15) || cpt.tos || "-"}</td>
                                      <td className="p-2">{cpt.units || "-"}</td>
                                      <td className="p-2">${cpt.charge || "0.00"}</td>
                                      <td className="p-2">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setVerificationForm(prev => ({
                                            ...prev,
                                            cptCodes: prev.cptCodes.filter((_, i) => i !== index)
                                          }))}
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                  {/* Add New CPT Row */}
                                  <tr className="border-t bg-muted/30">
                                    <td className="p-2">
                                      <div className="relative">
                                        <Input
                                          placeholder="99213"
                                          value={verificationForm.currentCpt.code}
                                          onChange={(e) => setVerificationForm(prev => ({
                                            ...prev,
                                            currentCpt: { ...prev.currentCpt, code: e.target.value }
                                          }))}
                                          className={`h-8 w-20 pr-6 ${cptValidation?.isValid === false ? 'border-red-500' : cptValidation?.isValid === true ? 'border-green-500' : ''}`}
                                          maxLength={5}
                                        />
                                        {cptValidation && (
                                          <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                            {cptValidation.isValid ? (
                                              <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                              <XCircle className="h-4 w-4 text-red-500" />
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      {cptValidation && (
                                        <div className="mt-1 text-xs">
                                          {cptValidation.isValid && cptValidation.description && (
                                            <div className="text-green-600">{cptValidation.description}</div>
                                          )}
                                          {cptValidation.errors.length > 0 && (
                                            <div className="text-red-600">{cptValidation.errors[0]}</div>
                                          )}
                                          {cptValidation.warnings.length > 0 && (
                                            <div className="text-yellow-600">{cptValidation.warnings[0]}</div>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-2">
                                      <div className="relative">
                                        <Input
                                          placeholder="25"
                                          value={verificationForm.currentCpt.modifier1}
                                          onChange={(e) => setVerificationForm(prev => ({
                                            ...prev,
                                            currentCpt: { ...prev.currentCpt, modifier1: e.target.value }
                                          }))}
                                          className={`h-8 w-16 pr-6 ${modifierValidation.modifier1?.isValid === false ? 'border-red-500' : modifierValidation.modifier1?.isValid === true ? 'border-green-500' : ''}`}
                                          maxLength={2}
                                        />
                                        {modifierValidation.modifier1 && (
                                          <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                            {modifierValidation.modifier1.isValid ? (
                                              <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                              <XCircle className="h-4 w-4 text-red-500" />
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      {modifierValidation.modifier1 && !modifierValidation.modifier1.isValid && (
                                        <div className="mt-1 text-xs text-red-600">{modifierValidation.modifier1.message}</div>
                                      )}
                                    </td>
                                    <td className="p-2">
                                      <div className="relative">
                                        <Input
                                          placeholder="25"
                                          value={verificationForm.currentCpt.modifier2}
                                          onChange={(e) => setVerificationForm(prev => ({
                                            ...prev,
                                            currentCpt: { ...prev.currentCpt, modifier2: e.target.value }
                                          }))}
                                          className={`h-8 w-16 pr-6 ${modifierValidation.modifier2?.isValid === false ? 'border-red-500' : modifierValidation.modifier2?.isValid === true ? 'border-green-500' : ''}`}
                                          maxLength={2}
                                        />
                                        {modifierValidation.modifier2 && (
                                          <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                            {modifierValidation.modifier2.isValid ? (
                                              <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                              <XCircle className="h-4 w-4 text-red-500" />
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      {modifierValidation.modifier2 && !modifierValidation.modifier2.isValid && (
                                        <div className="mt-1 text-xs text-red-600">{modifierValidation.modifier2.message}</div>
                                      )}
                                    </td>

                                    <td className="p-2">
                                      <Input
                                        placeholder="E11.9"
                                        value={verificationForm.currentCpt.icd}
                                        onChange={(e) => setVerificationForm(prev => ({
                                          ...prev,
                                          currentCpt: { ...prev.currentCpt, icd: e.target.value }
                                        }))}
                                        className="h-8 w-20"
                                        maxLength={10}
                                      />
                                    </td>
                                    <td className="p-2">
                                      <Popover open={posComboboxOpen} onOpenChange={setPosComboboxOpen}>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={posComboboxOpen}
                                            className="h-8 w-24 justify-between text-xs font-normal px-2"
                                          >
                                            {verificationForm.currentCpt.pos
                                              ? verificationForm.currentCpt.pos
                                              : "POS"}
                                            <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0" align="start">
                                          <Command>
                                            <CommandInput placeholder="Search POS..." value={posSearchQuery} onValueChange={setPosSearchQuery} />
                                            <CommandList>
                                              <CommandEmpty>No place of service found.</CommandEmpty>
                                              <CommandGroup>
                                                {placeOfServiceCodes
                                                  .filter(pos => {
                                                    const query = posSearchQuery.toLowerCase();
                                                    if (!query) return true;
                                                    return pos.code.includes(query) || pos.description.toLowerCase().includes(query);
                                                  })
                                                  .map((pos) => (
                                                    <CommandItem
                                                      key={pos.code}
                                                      value={`${pos.code} ${pos.description}`}
                                                      onSelect={() => {
                                                        setVerificationForm(prev => ({
                                                          ...prev,
                                                          currentCpt: { ...prev.currentCpt, pos: pos.code }
                                                        }));
                                                        setPosComboboxOpen(false);
                                                        setPosSearchQuery("");
                                                      }}
                                                    >
                                                      <CheckCircle className={`mr-2 h-4 w-4 ${verificationForm.currentCpt.pos === pos.code ? "opacity-100" : "opacity-0"}`} />
                                                      {pos.code} - {pos.description}
                                                    </CommandItem>
                                                  ))}
                                              </CommandGroup>
                                            </CommandList>
                                          </Command>
                                        </PopoverContent>
                                      </Popover>
                                    </td>
                                    <td className="p-2">
                                      <Popover open={tosComboboxOpen} onOpenChange={setTosComboboxOpen}>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={tosComboboxOpen}
                                            className="h-8 w-20 justify-between text-xs font-normal px-2"
                                          >
                                            {verificationForm.currentCpt.tos
                                              ? verificationForm.currentCpt.tos
                                              : "TOS"}
                                            <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0" align="start">
                                          <Command>
                                            <CommandInput placeholder="Search TOS..." value={tosSearchQuery} onValueChange={setTosSearchQuery} />
                                            <CommandList>
                                              <CommandEmpty>No type of service found.</CommandEmpty>
                                              <CommandGroup>
                                                {typeOfServiceCodes
                                                  .filter(tos => {
                                                    const query = tosSearchQuery.toLowerCase();
                                                    if (!query) return true;
                                                    return tos.code.toLowerCase().includes(query) || tos.description.toLowerCase().includes(query);
                                                  })
                                                  .map((tos) => (
                                                    <CommandItem
                                                      key={tos.code}
                                                      value={`${tos.code} ${tos.description}`}
                                                      onSelect={() => {
                                                        setVerificationForm(prev => ({
                                                          ...prev,
                                                          currentCpt: { ...prev.currentCpt, tos: tos.code },
                                                          // Automatically set prior authorization required if Surgery (code "2") is selected
                                                          preAuthorizationRequired: tos.code === "2" ? true : prev.preAuthorizationRequired
                                                        }));
                                                        setTosComboboxOpen(false);
                                                        setTosSearchQuery("");
                                                      }}
                                                    >
                                                      <CheckCircle className={`mr-2 h-4 w-4 ${verificationForm.currentCpt.tos === tos.code ? "opacity-100" : "opacity-0"}`} />
                                                      {tos.code} - {tos.description}
                                                    </CommandItem>
                                                  ))}
                                              </CommandGroup>
                                            </CommandList>
                                          </Command>
                                        </PopoverContent>
                                      </Popover>
                                    </td>
                                    <td className="p-2">
                                      <Input
                                        type="number"
                                        placeholder="1"
                                        value={verificationForm.currentCpt.units}
                                        onChange={(e) => setVerificationForm(prev => ({
                                          ...prev,
                                          currentCpt: { ...prev.currentCpt, units: e.target.value }
                                        }))}
                                        className="h-8 w-16"
                                      />
                                    </td>
                                    <td className="p-2">
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="150.00"
                                        value={verificationForm.currentCpt.charge}
                                        onChange={(e) => setVerificationForm(prev => ({
                                          ...prev,
                                          currentCpt: { ...prev.currentCpt, charge: e.target.value }
                                        }))}
                                        className="h-8 w-20"
                                      />
                                    </td>


                                    <td className="p-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const code = verificationForm.currentCpt.code.trim();
                                          if (!code) {
                                            toast({
                                              title: "CPT Code Required",
                                              description: "Please enter a CPT code before adding.",
                                              variant: "destructive",
                                            });
                                            return;
                                          }
                                          
                                          // Validate that code is at least 5 digits
                                          if (code.length < 5) {
                                            toast({
                                              title: "Invalid CPT Code",
                                              description: "CPT code must be at least 5 characters.",
                                              variant: "destructive",
                                            });
                                            return;
                                          }

                                          // Check if code already exists in the list
                                          const codeExists = verificationForm.cptCodes.some(
                                            cpt => cpt.code.trim() === code
                                          );
                                          
                                          if (codeExists) {
                                            toast({
                                              title: "Duplicate CPT Code",
                                              description: `CPT code ${code} is already in the list.`,
                                              variant: "destructive",
                                            });
                                            return;
                                          }

                                          // Add the CPT code and check if any CPT code has Surgery TOS (code "2") to automatically set prior authorization
                                          setVerificationForm(prev => ({
                                            ...prev,
                                            cptCodes: [...prev.cptCodes, { ...prev.currentCpt }],
                                            // Check if any CPT code in the list has Surgery TOS ("2") to automatically set prior authorization required
                                            preAuthorizationRequired: [...prev.cptCodes, { ...prev.currentCpt }].some(cpt => cpt.tos === "2") ? true : prev.preAuthorizationRequired,
                                            currentCpt: {
                                              code: "",
                                              modifier1: "",
                                              modifier2: "",
                                              icd: "",
                                              pos: "",
                                              tos: "",
                                              units: "",
                                              charge: "",
                                            }
                                          }));

                                          toast({
                                            title: "CPT Code Added",
                                            description: `CPT code ${code} has been added successfully.`,
                                          });
                                        }}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Subscriber Information (when different from patient) 
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          Subscriber Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="subscriberIsPatient"
                            checked={verificationForm.subscriberIsPatient}
                            onCheckedChange={(checked) => setVerificationForm(prev => ({ ...prev, subscriberIsPatient: checked as boolean }))}
                          />
                          <Label htmlFor="subscriberIsPatient" className="cursor-pointer">Subscriber is the same as Patient</Label>
                        </div>

                        {!verificationForm.subscriberIsPatient && (
                          <div className="space-y-4 border-l-2 pl-4 ml-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              <div>
                                <Label htmlFor="subscriberFirstName">Subscriber First Name *</Label>
                                <Input
                                  id="subscriberFirstName"
                                  value={verificationForm.subscriberFirstName}
                                  onChange={(e) => setVerificationForm(prev => ({ ...prev, subscriberFirstName: e.target.value }))}
                                  placeholder="First name"
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label htmlFor="subscriberLastName">Subscriber Last Name *</Label>
                                <Input
                                  id="subscriberLastName"
                                  value={verificationForm.subscriberLastName}
                                  onChange={(e) => setVerificationForm(prev => ({ ...prev, subscriberLastName: e.target.value }))}
                                  placeholder="Last name"
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label htmlFor="subscriberDOB">Subscriber DOB *</Label>
                                <Input
                                  id="subscriberDOB"
                                  type="date"
                                  value={verificationForm.subscriberDOB}
                                  onChange={(e) => setVerificationForm(prev => ({ ...prev, subscriberDOB: e.target.value }))}
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label htmlFor="subscriberRelationship">Relationship to Patient *</Label>
                                <Select
                                  value={verificationForm.subscriberRelationship}
                                  onValueChange={(value) => setVerificationForm(prev => ({ ...prev, subscriberRelationship: value }))}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select relationship" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="self">Self</SelectItem>
                                    <SelectItem value="spouse">Spouse</SelectItem>
                                    <SelectItem value="child">Child</SelectItem>
                                    <SelectItem value="parent">Parent</SelectItem>
                                    <SelectItem value="sibling">Sibling</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="subscriberId">Subscriber ID</Label>
                                <Input
                                  id="subscriberId"
                                  value={verificationForm.subscriberId}
                                  onChange={(e) => setVerificationForm(prev => ({ ...prev, subscriberId: e.target.value }))}
                                  placeholder="Subscriber member ID"
                                  className="h-9"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
*/}
                    {/* Financial Calculation & Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calculator className="h-5 w-5 text-blue-600" />
                          Financial Calculation & Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Input Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <Label htmlFor="currentVisitCharges" className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Current Visit Charges (Auto-calculated)
                            </Label>
                            <Input
                              id="currentVisitCharges"
                              type="number"
                              step="0.01"
                              value={(() => {
                                const base = verificationForm.cptCodes.reduce((sum, cpt) => {
                                  const charge = isNaN(parseFloat(cpt.charge)) ? 0 : parseFloat(cpt.charge);
                                  const units = isNaN(parseFloat(cpt.units)) || !parseFloat(cpt.units) ? 1 : parseFloat(cpt.units);
                                  return sum + (charge * units);
                                }, 0);
                                // Include the in-progress CPT row if user has entered anything meaningful
                                const hasPending = (verificationForm.currentCpt.code?.trim?.() || "") !== "" || (verificationForm.currentCpt.charge ?? "") !== "";
                                if (hasPending) {
                                  const pCharge = isNaN(parseFloat(verificationForm.currentCpt.charge)) ? 0 : parseFloat(verificationForm.currentCpt.charge);
                                  const pUnits = isNaN(parseFloat(verificationForm.currentCpt.units)) || !parseFloat(verificationForm.currentCpt.units) ? 1 : parseFloat(verificationForm.currentCpt.units);
                                  return (base + (pCharge * pUnits)).toFixed(2);
                                }
                                return base.toFixed(2);
                              })()}
                              readOnly
                              className="bg-muted font-semibold h-9"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {(() => {
                                const hasPending = (verificationForm.currentCpt.code?.trim?.() || "") !== "" || (verificationForm.currentCpt.charge ?? "") !== "";
                                const count = verificationForm.cptCodes.length + (hasPending ? 1 : 0);
                                return `Sum of all CPT charges (${count} ${count === 1 ? 'code' : 'codes'})`;
                              })()}
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="allowedAmount">Allowed Amount (Insurance)</Label>
                            <Input
                              id="allowedAmount"
                              type="number"
                              step="0.01"
                              value={verificationForm.allowedAmount}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, allowedAmount: e.target.value }))}
                              placeholder="0.00"
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label htmlFor="primaryPayment">Insurance Payment Amount</Label>
                            <Input
                              id="primaryPayment"
                              type="number"
                              step="0.01"
                              value={verificationForm.primaryPayment}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, primaryPayment: e.target.value }))}
                              placeholder="0.00"
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label htmlFor="previousBalanceCredit">Previous Balance / Credit</Label>
                            <Input
                              id="previousBalanceCredit"
                              type="number"
                              step="0.01"
                              value={verificationForm.previousBalanceCredit}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, previousBalanceCredit: e.target.value }))}
                              placeholder="0.00"
                              className="h-9"
                            />
                          </div>
                        </div>

                        {/* Coverage Details & Cost Sharing */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t pt-6">
                          <div>
                            <Label htmlFor="isQMB">QMB Status (Qualified Medicare Beneficiary)</Label>
                            <Select
                              value={verificationForm.isQMB ? "Yes" : "No"}
                              onValueChange={(value) => setVerificationForm(prev => ({ ...prev, isQMB: value === "Yes" }))}
                            >
                              <SelectTrigger id="isQMB" className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes (QMB Patient)</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="outOfPocketRemaining">Out Of Pocket Remaining</Label>
                            <Input
                              id="outOfPocketRemaining"
                              type="number"
                              step="0.01"
                              value={verificationForm.outOfPocketRemaining}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, outOfPocketRemaining: e.target.value }))}
                              placeholder="0.00"
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label htmlFor="outOfPocketMax">Out Of Pocket Max</Label>
                            <Input
                              id="outOfPocketMax"
                              type="number"
                              step="0.01"
                              value={verificationForm.outOfPocketMax}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, outOfPocketMax: e.target.value }))}
                              placeholder="0.00"
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label htmlFor="patientResponsibility">Patient Responsibility (Calculated)</Label>
                            <Input
                              id="patientResponsibility"
                              type="number"
                              step="0.01"
                              value={verificationForm.patientResponsibility}
                              readOnly
                              className="bg-muted font-semibold h-9"
                            />
                          </div>
                        </div>

                        {/* Calculation Breakdown */}
                        {(() => {
                          // Calculate current visit charges from CPT codes
                          // Sum CPT charges including the in-progress row if not yet added
                          const baseCharges = verificationForm.cptCodes.reduce((sum, cpt) => {
                            const charge = isNaN(parseFloat(cpt.charge)) ? 0 : parseFloat(cpt.charge);
                            const units = isNaN(parseFloat(cpt.units)) || !parseFloat(cpt.units) ? 1 : parseFloat(cpt.units);
                            return sum + (charge * units);
                          }, 0);
                          const hasPendingRow = (verificationForm.currentCpt.code?.trim?.() || "") !== "" || (verificationForm.currentCpt.charge ?? "") !== "";
                          const pendingCharge = hasPendingRow
                            ? ((isNaN(parseFloat(verificationForm.currentCpt.charge)) ? 0 : parseFloat(verificationForm.currentCpt.charge)) *
                               (isNaN(parseFloat(verificationForm.currentCpt.units)) || !parseFloat(verificationForm.currentCpt.units) ? 1 : parseFloat(verificationForm.currentCpt.units)))
                            : 0;
                          const currentVisitCharges = baseCharges + pendingCharge;

                          // Get values
                          const allowedAmount = parseFloat(verificationForm.allowedAmount) || 0;
                          const copay = parseFloat(verificationForm.coPay) || 0;
                          const coinsurancePercent = parseFloat(verificationForm.coInsurance) || 0;
                          const deductibleAmount = verificationForm.deductibleStatus === "Met" ? 0 : (parseFloat(verificationForm.deductibleAmount) || 0);
                          const insurancePayment = parseFloat(verificationForm.primaryPayment) || 0;
                          const oopYtd = parseFloat(verificationForm.outOfPocketRemaining) || 0;
                          const oopMax = parseFloat(verificationForm.outOfPocketMax) || 0;
                          const previousBalance = parseFloat(verificationForm.previousBalanceCredit) || 0;
                          const hasSecondary = (verificationForm.secondaryInsuranceName || "").trim() !== "";
                          const secondaryPercent = parseFloat(verificationForm.secondaryCoveragePercent) || 0;

                          // QMB Check - If QMB and Medicare Covered, patient pays $0
                          let patientResponsibility = 0;
                          let calculationBreakdown: any = {
                            currentVisitCharges: currentVisitCharges,
                            allowedAmount: allowedAmount,
                            contractualWriteOff: Math.max(0, currentVisitCharges - allowedAmount),
                            copay: 0,
                            deductibleApplied: 0,
                            remainingAfterDeductible: 0,
                            coinsurance: 0,
                            insurancePays: 0,
                            secondaryPays: 0,
                            secondaryCopay: 0,
                            secondaryDeductibleApplied: 0,
                            oopBeforeCap: 0,
                            oopCapApplied: 0,
                            patientResponsibilityBeforeOOP: 0,
                            finalPatientResponsibility: 0,
                            isQMBZeroed: false,
                            oopMaxReached: false
                          };

                          // QMB Check: If QMB patient AND Medicare covered service, patient pays $0
                          const strIncludesMedicareCalc = (s?: string) => (s || '').toLowerCase().includes('medicare');
                          const isMedicarePlan = verificationForm.planType === "Medicare" ||
                            strIncludesMedicareCalc(verificationForm.primaryInsurance) ||
                            strIncludesMedicareCalc(verificationForm.insurancePlan) ||
                            strIncludesMedicareCalc(verificationForm.groupNumber);
                          
                          // Out-of-Pocket Remaining Check: If OOP remaining is explicitly set to 0, patient responsibility is 0 (insurance pays all)
                          // This means the patient has already met their out-of-pocket maximum for the year
                          // Only apply this rule if the field has been explicitly set (not empty)
                          if (verificationForm.outOfPocketRemaining !== "" && oopYtd === 0) {
                            // Patient has already met out-of-pocket maximum - insurance pays everything
                            const baseAmount = allowedAmount > 0 ? allowedAmount : currentVisitCharges;
                            patientResponsibility = 0;
                            calculationBreakdown.finalPatientResponsibility = 0;
                            calculationBreakdown.oopMaxReached = true;
                            calculationBreakdown.insurancePays = baseAmount;
                            calculationBreakdown.copay = 0;
                            calculationBreakdown.deductibleApplied = 0;
                            calculationBreakdown.coinsurance = 0;
                            calculationBreakdown.patientResponsibilityBeforeOOP = 0;
                            calculationBreakdown.oopCapApplied = 0;
                          } else if (verificationForm.isQMB && verificationForm.isCoveredService && isMedicarePlan) {
                            // QMB Patient - Federal law: $0 responsibility for Medicare covered services
                            calculationBreakdown.isQMBZeroed = true;
                            patientResponsibility = 0;
                            calculationBreakdown.finalPatientResponsibility = 0;
                          } else {
                            // Normal Calculation Flow
                            // Step 1: Start with Allowed Amount (or billed if no allowed amount)
                            const baseAmount = allowedAmount > 0 ? allowedAmount : currentVisitCharges;
                            calculationBreakdown.allowedAmount = baseAmount;

                            // Step 2: Apply Copay first (for services where copay applies)
                            // In many health plans, copay is applied for specific service types regardless of deductible status
                            calculationBreakdown.copay = Math.min(copay, baseAmount);
                            let remainingAfterCopay = Math.max(0, baseAmount - calculationBreakdown.copay);

                            // Step 3: Apply Deductible on remaining amount
                            // Deductible is typically applied after copay for services that have copay
                            // For services without copay, the full amount goes toward deductible
                            if (deductibleAmount > 0) {
                              calculationBreakdown.deductibleApplied = Math.min(remainingAfterCopay, deductibleAmount);
                              calculationBreakdown.remainingAfterDeductible = Math.max(0, remainingAfterCopay - calculationBreakdown.deductibleApplied);
                            } else {
                              calculationBreakdown.remainingAfterDeductible = remainingAfterCopay;
                            }

                            // Step 4: Apply Coinsurance
                            // According to the formula: Patient Responsibility = Co-pay + Deductible Applied + (Allowed Amount × Co-insurance %)
                            calculationBreakdown.coinsurance = (baseAmount * coinsurancePercent) / 100;
                            calculationBreakdown.insurancePays = baseAmount - calculationBreakdown.copay - calculationBreakdown.deductibleApplied - calculationBreakdown.coinsurance;

                            // Calculate patient responsibility before OOP max
                            calculationBreakdown.patientResponsibilityBeforeOOP = 
                              calculationBreakdown.copay + 
                              calculationBreakdown.deductibleApplied + 
                              calculationBreakdown.coinsurance;

                            // Step 5: Apply Out-of-Pocket Maximum Cap
                            if (oopMax > 0) {
                              const oopAfterThisVisit = oopYtd + calculationBreakdown.patientResponsibilityBeforeOOP;
                              
                              if (oopAfterThisVisit >= oopMax) {
                                // OOP Max reached or exceeded
                                calculationBreakdown.oopMaxReached = oopYtd >= oopMax;
                                if (calculationBreakdown.oopMaxReached) {
                                  // Already at max - patient pays $0
                                  calculationBreakdown.finalPatientResponsibility = 0;
                                  calculationBreakdown.oopCapApplied = calculationBreakdown.patientResponsibilityBeforeOOP;
                                } else {
                                  // Reaching max this visit - only pay difference
                                  const remainingToMax = oopMax - oopYtd;
                                  calculationBreakdown.finalPatientResponsibility = Math.min(calculationBreakdown.patientResponsibilityBeforeOOP, remainingToMax);
                                  calculationBreakdown.oopCapApplied = Math.max(0, calculationBreakdown.patientResponsibilityBeforeOOP - remainingToMax);
                                }
                              } else {
                                calculationBreakdown.finalPatientResponsibility = calculationBreakdown.patientResponsibilityBeforeOOP;
                              }
                              calculationBreakdown.oopBeforeCap = oopAfterThisVisit;
                            } else {
                              calculationBreakdown.finalPatientResponsibility = calculationBreakdown.patientResponsibilityBeforeOOP;
                            }

                            // Step 6: Apply Secondary Insurance (COB) on remaining patient responsibility
                            if (hasSecondary && calculationBreakdown.finalPatientResponsibility > 0) {
                              // Get secondary insurance details
                              const secondaryCoPay = parseFloat(verificationForm.secondaryCoPay) || 0;
                              const secondaryDeductible = parseFloat(verificationForm.secondaryDeductible) || 0;
                              const secondaryDeductibleMet = parseFloat(verificationForm.secondaryDeductibleMet) || 0;
                              const secondaryCoInsurance = parseFloat(verificationForm.secondaryCoInsurance) || 0;
                              
                              // Start with remaining patient responsibility
                              let secondaryRemaining = calculationBreakdown.finalPatientResponsibility;
                              
                              // Step 6a: Apply Secondary Co-pay (if applicable)
                              if (secondaryCoPay > 0) {
                                const secondaryCopayApplied = Math.min(secondaryCoPay, secondaryRemaining);
                                secondaryRemaining = Math.max(0, secondaryRemaining - secondaryCopayApplied);
                                calculationBreakdown.secondaryCopay = secondaryCopayApplied;
                              }
                              
                              // Step 6b: Apply Secondary Deductible (if not met)
                              if (secondaryDeductible > 0 && secondaryDeductibleMet < secondaryDeductible) {
                                const remainingDeductible = secondaryDeductible - secondaryDeductibleMet;
                                const deductibleApplied = Math.min(remainingDeductible, secondaryRemaining);
                                secondaryRemaining = Math.max(0, secondaryRemaining - deductibleApplied);
                                calculationBreakdown.secondaryDeductibleApplied = deductibleApplied;
                              }
                              
                              // Step 6c: Apply Secondary Co-insurance or Coverage Percentage
                              let secondaryPayment = 0;
                              if (secondaryCoInsurance > 0) {
                                // Use co-insurance percentage if provided
                                secondaryPayment = (secondaryRemaining * secondaryCoInsurance) / 100;
                              } else if (secondaryPercent > 0) {
                                // Fall back to coverage percentage
                                secondaryPayment = (secondaryRemaining * secondaryPercent) / 100;
                              }
                              
                              // Ensure secondary payment doesn't exceed remaining balance
                              secondaryPayment = Math.min(secondaryPayment, secondaryRemaining);
                              
                              // Step 6d: Calculate final patient responsibility after secondary
                              calculationBreakdown.secondaryPays = secondaryPayment;
                              calculationBreakdown.finalPatientResponsibility = Math.max(0, secondaryRemaining - secondaryPayment);
                              
                              // Validation: Ensure total payments don't exceed 100% of allowed amount
                              const totalPayments = calculationBreakdown.insurancePays + calculationBreakdown.secondaryPays;
                              const totalPatientResponsibility = calculationBreakdown.finalPatientResponsibility;
                              const totalCoverage = totalPayments + totalPatientResponsibility;
                              
                              // Strict validation: Total cannot exceed 100% of allowed amount (with minimal rounding tolerance)
                              const maxAllowedTotal = baseAmount;
                              const tolerance = 0.01; // $0.01 tolerance for rounding
                              
                              if (totalCoverage > maxAllowedTotal + tolerance) {
                                // Recalculate to ensure we don't exceed 100%
                                const remainingForSecondary = Math.max(0, maxAllowedTotal - calculationBreakdown.insurancePays - totalPatientResponsibility);
                                
                                if (calculationBreakdown.secondaryPays > remainingForSecondary) {
                                  calculationBreakdown.secondaryPays = Math.max(0, remainingForSecondary);
                                  // Recalculate patient responsibility after secondary adjustment
                                  calculationBreakdown.finalPatientResponsibility = Math.max(0, secondaryRemaining - calculationBreakdown.secondaryPays);
                                }
                                
                                // Final check: ensure total doesn't exceed 100%
                                const finalTotal = calculationBreakdown.insurancePays + calculationBreakdown.secondaryPays + calculationBreakdown.finalPatientResponsibility;
                                if (finalTotal > maxAllowedTotal + tolerance) {
                                  // Last resort: adjust patient responsibility to ensure total is exactly at allowed amount
                                  calculationBreakdown.finalPatientResponsibility = Math.max(0, maxAllowedTotal - calculationBreakdown.insurancePays - calculationBreakdown.secondaryPays);
                                }
                              }
                              
                              // Additional validation: Ensure secondary doesn't exceed remaining patient responsibility
                              if (calculationBreakdown.secondaryPays > secondaryRemaining) {
                                calculationBreakdown.secondaryPays = Math.max(0, secondaryRemaining);
                                calculationBreakdown.finalPatientResponsibility = Math.max(0, secondaryRemaining - calculationBreakdown.secondaryPays);
                              }
                            }

                            patientResponsibility = calculationBreakdown.finalPatientResponsibility;
                          }

                          // Update form state with calculated value
                          if (Math.abs(patientResponsibility - parseFloat(verificationForm.patientResponsibility || "0")) > 0.01) {
                            setTimeout(() => {
                              setVerificationForm(prev => ({ ...prev, patientResponsibility: patientResponsibility.toFixed(2) }));
                            }, 0);
                          }

                          return (
                            <div className="space-y-4">
                              {showCalculationDetails && (
                                <>
                                  <Separator />
                                  
                                  {/* Breakdown Display */}
                                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Calculation Breakdown
                                  </h3>
                                  {calculationBreakdown.isQMBZeroed && (
                                    <Badge variant="default" className="bg-green-600">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      QMB Protected
                                    </Badge>
                                  )}
                                </div>

                                <div className="space-y-3">
                                  {/* Current Visit Charges */}
                                  <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-700">
                                    <span className="text-sm font-medium">Current Visit Charges (Billed)</span>
                                    <span className="font-semibold">${currentVisitCharges.toFixed(2)}</span>
                                  </div>

                                  {/* Allowed Amount */}
                                  <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-700">
                                    <span className="text-sm font-medium">Allowed Amount</span>
                                    <span className="font-semibold">${calculationBreakdown.allowedAmount.toFixed(2)}</span>
                                  </div>

                                  {/* Contractual Write-off */}
                                  {calculationBreakdown.contractualWriteOff > 0 && (
                                    <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-700">
                                      <span className="text-sm text-muted-foreground">Contractual Write-off</span>
                                      <span className="text-sm text-muted-foreground">-${calculationBreakdown.contractualWriteOff.toFixed(2)}</span>
                                    </div>
                                  )}

                                  {/* QMB Message */}
                                  {calculationBreakdown.isQMBZeroed && (
                                    <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <AlertDescription className="text-green-800 dark:text-green-200">
                                        <strong>QMB Patient:</strong> Federal law prohibits billing QMB patients for Medicare-covered services. Patient responsibility: $0.00
                                      </AlertDescription>
                                    </Alert>
                                  )}

                                  {/* Normal Calculation Breakdown */}
                                  {!calculationBreakdown.isQMBZeroed && (
                                    <>
                                      {/* Copay */}
                                      {calculationBreakdown.copay > 0 && (
                                        <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-700">
                                          <span className="text-sm font-medium flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            Copay
                                          </span>
                                          <span className="font-semibold">${calculationBreakdown.copay.toFixed(2)}</span>
                                        </div>
                                      )}

                                      {/* Deductible */}
                                      {calculationBreakdown.deductibleApplied > 0 && (
                                        <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-700">
                                          <span className="text-sm font-medium flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            Deductible Applied
                                          </span>
                                          <span className="font-semibold">${calculationBreakdown.deductibleApplied.toFixed(2)}</span>
                                        </div>
                                      )}

                                      {/* Coinsurance */}
                                      {calculationBreakdown.coinsurance > 0 && (
                                        <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-700">
                                          <span className="text-sm font-medium flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            Coinsurance ({verificationForm.coInsurance}%)
                                          </span>
                                          <span className="font-semibold">${calculationBreakdown.coinsurance.toFixed(2)}</span>
                                        </div>
                                      )}

                                      {/* Insurance Payment */}
                                      {calculationBreakdown.insurancePays > 0 && (
                                        <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-700">
                                          <span className="text-sm font-medium flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            Insurance Pays
                                          </span>
                                          <span className="font-semibold text-green-600 dark:text-green-400">
                                            ${calculationBreakdown.insurancePays.toFixed(2)}
                                          </span>
                                        </div>
                                      )}

                                      {/* Secondary Insurance Payment */}
                                      {calculationBreakdown.secondaryPays > 0 && (
                                        <div className="flex justify-between items-center py-2 border-b border-blue-200 dark:border-blue-700">
                                          <span className="text-sm font-medium flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            Secondary Pays{verificationForm.secondaryInsuranceName ? ` (${verificationForm.secondaryInsuranceName})` : ''}
                                          </span>
                                          <span className="font-semibold text-green-600 dark:text-green-400">
                                            ${calculationBreakdown.secondaryPays.toFixed(2)}
                                          </span>
                                        </div>
                                      )}

                                      {/* OOP Max Info */}
                                      {oopMax > 0 && (
                                        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Out-of-Pocket Progress</span>
                                            <span className="text-sm font-semibold">
                                              ${oopYtd.toFixed(2)} / ${oopMax.toFixed(2)}
                                            </span>
                                          </div>
                                          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-2">
                                            <div 
                                              className="bg-blue-600 h-2 rounded-full transition-all"
                                              style={{ width: `${Math.min(100, (oopYtd / oopMax) * 100)}%` }}
                                            />
                                          </div>
                                          {calculationBreakdown.oopMaxReached && (
                                            <Alert className="mt-2 bg-green-50 dark:bg-green-950 border-green-200">
                                              <CheckCircle className="h-4 w-4 text-green-600" />
                                              <AlertDescription className="text-green-800 dark:text-green-200 text-xs">
                                                Out-of-pocket maximum reached! Patient responsibility reduced to $0.00
                                              </AlertDescription>
                                            </Alert>
                                          )}
                                          {calculationBreakdown.oopCapApplied > 0 && !calculationBreakdown.oopMaxReached && (
                                            <Alert className="mt-2 bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
                                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                              <AlertDescription className="text-yellow-800 dark:text-yellow-200 text-xs">
                                                OOP max reached this visit. Patient responsibility reduced by ${calculationBreakdown.oopCapApplied.toFixed(2)}
                                              </AlertDescription>
                                            </Alert>
                                          )}
                                        </div>
                                      )}

                                      <Separator className="my-4" />
                                    </>
                                  )}

                                  {/* Final Patient Responsibility */}
                                  <div className="flex justify-between items-center py-3 bg-blue-100 dark:bg-blue-900 rounded-lg px-4 -mx-4 -mb-4">
                                    <span className="text-lg font-bold">Patient Responsibility</span>
                                    <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                      ${patientResponsibility.toFixed(2)}
                                    </span>
                                  </div>

                                  {/* Previous Balance */}
                                  {previousBalance !== 0 && (
                                    <div className="flex justify-between items-center py-2 mt-4 bg-amber-50 dark:bg-amber-950 rounded-lg px-4 border border-amber-200 dark:border-amber-800">
                                      <span className="text-sm font-medium">Previous Balance</span>
                                      <span className="font-semibold text-amber-700 dark:text-amber-300">
                                        {previousBalance > 0 ? '+' : ''}${previousBalance.toFixed(2)}
                                      </span>
                                    </div>
                                  )}

                                  {/* Total Collectible */}
                                  {previousBalance !== 0 && (
                                    <div className="flex justify-between items-center py-3 mt-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg px-4 border-2 border-purple-300 dark:border-purple-700">
                                      <span className="text-lg font-bold">Total Collectible</span>
                                      <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                        ${(patientResponsibility + previousBalance).toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                    {/* Additional Information & QA */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Additional Information & QA
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <Label htmlFor="dateChecked">Date Checked</Label>
                            <Input
                              id="dateChecked"
                              type="date"
                              value={verificationForm.dateChecked}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, dateChecked: e.target.value }))}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label htmlFor="checkBy">Check By (Current User)</Label>
                            <Input
                              id="checkBy"
                              value={verificationForm.checkBy || user?.email || ''}
                              readOnly
                              className="bg-muted h-9"
                              placeholder="Auto-filled with current user"
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-8">
                            <Checkbox
                              id="qa"
                              checked={verificationForm.qa}
                              onCheckedChange={(checked) => setVerificationForm(prev => ({ ...prev, qa: checked as boolean }))}
                            />
                            <Label htmlFor="qa" className="cursor-pointer">QA</Label>
                          </div>
                       </div>
                        <div>
                          <Label htmlFor="remarks">Remarks</Label>
                          <Textarea
                            id="remarks"
                            value={verificationForm.remarks}
                            onChange={(e) => setVerificationForm(prev => ({ ...prev, remarks: e.target.value }))}
                            placeholder="Enter any additional remarks or notes..."
                            rows={3}
                            className="resize-none"
                          />
                        </div>
                        
                        {/* Comments & Attachments */}
                        <div className="space-y-4 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label>Comments & Attachments</Label>
                              <p className="text-xs text-muted-foreground">
                                Organize this eligibility into clear steps with notes and files, similar to an Asana activity feed.
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Add a new comment entry
                                setVerificationForm(prev => ({
                                  ...prev,
                                  comments: prev.comments || "",
                                  commentEntries: [
                                    ...prev.commentEntries,
                                    {
                                      id: Math.random().toString(36).substring(2, 9),
                                      text: "",
                                      attachments: [],
                                      timestamp: new Date().toISOString(),
                                      author: user?.email || "Current User"
                                    }
                                  ]
                                }));
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Step
                            </Button>
                          </div>
                          
                          {/* Display existing comment entries */}
                          <div className="space-y-4">
                            {verificationForm.commentEntries && verificationForm.commentEntries.map((commentEntry, index) => {
                              const isLast = index === verificationForm.commentEntries.length - 1;
                              return (
                                <div key={commentEntry.id} className="flex gap-3">
                                  {/* Timeline rail / step indicator */}
                                  <div className="flex flex-col items-center">
                                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-sm">
                                      {index + 1}
                                    </div>
                                    {!isLast && (
                                      <div className="flex-1 w-px bg-border mt-1" />
                                    )}
                                  </div>

                                  {/* Comment card */}
                                  <div className="flex-1">
                                    <div className="border rounded-lg p-3 bg-background shadow-sm">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex flex-col">
                                          <span className="text-xs font-semibold text-blue-700">
                                            Step {index + 1}
                                          </span>
                                          <span className="text-[11px] text-muted-foreground">
                                            {new Date(commentEntry.timestamp).toLocaleString()} • {commentEntry.author}
                                          </span>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setVerificationForm(prev => {
                                              const newEntries = [...prev.commentEntries];
                                              newEntries.splice(index, 1);
                                              return { ...prev, commentEntries: newEntries };
                                            });
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>

                                      <Textarea
                                        value={commentEntry.text}
                                        onChange={(e) => {
                                          setVerificationForm(prev => {
                                            const newEntries = [...prev.commentEntries];
                                            newEntries[index] = { ...commentEntry, text: e.target.value };
                                            return { ...prev, commentEntries: newEntries };
                                          });
                                        }}
                                        placeholder="Describe this step, what was checked, or any action taken..."
                                        rows={2}
                                        className="resize-none mb-2"
                                      />
                                      
                                      {/* Individual comment attachments */}
                                      <div className="space-y-2">
                                        <Input
                                          type="file"
                                          multiple
                                          onChange={(e) => {
                                            const files = e.target.files;
                                            if (files && files.length > 0) {
                                              Array.from(files).forEach(file => {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                  const fileData = {
                                                    id: Math.random().toString(36).substring(2, 9),
                                                    name: file.name,
                                                    type: file.type,
                                                    size: file.size,
                                                    content: event.target?.result as string,
                                                    uploadedAt: new Date().toISOString(),
                                                  };
                                                  setVerificationForm(prev => {
                                                    const newEntries = [...prev.commentEntries];
                                                    const updatedEntry = {
                                                      ...newEntries[index],
                                                      attachments: [...newEntries[index].attachments, fileData]
                                                    };
                                                    newEntries[index] = updatedEntry;
                                                    return { ...prev, commentEntries: newEntries };
                                                  });
                                                };
                                                reader.readAsDataURL(file);
                                              });
                                              e.target.value = '';
                                            }
                                          }}
                                          className="h-8 text-xs"
                                        />
                                        
                                        {/* Display comment attachments */}
                                        {commentEntry.attachments.length > 0 && (
                                          <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                                            {commentEntry.attachments.map((attachment, attIndex) => (
                                              <div key={attachment.id} className="flex items-center justify-between px-2 py-1 bg-muted rounded text-[11px]">
                                                <div className="flex items-center space-x-2">
                                                  <FileText className="h-3 w-3 text-muted-foreground" />
                                                  <span className="truncate max-w-[180px]">{attachment.name}</span>
                                                  <span className="text-[10px] text-muted-foreground">
                                                    {(attachment.size / 1024).toFixed(1)} KB
                                                  </span>
                                                </div>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => {
                                                    setVerificationForm(prev => {
                                                      const newEntries = [...prev.commentEntries];
                                                      const updatedAttachments = newEntries[index].attachments.filter((_, i) => i !== attIndex);
                                                      newEntries[index] = {
                                                        ...newEntries[index],
                                                        attachments: updatedAttachments
                                                      };
                                                      return { ...prev, commentEntries: newEntries };
                                                    });
                                                  }}
                                                  className="h-5 w-5 p-0"
                                                >
                                                  <X className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>



              {/* Action Buttons */}
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex gap-2 flex-wrap">
                        {/* Primary Action: Check Eligibility & Save */}
                        <Button 
                          onClick={handleCheckEligibility} 
                          disabled={isLoading} 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {isLoading ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Checking Eligibility...
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              Check Eligibility & Save
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Calculate button - trigger calculation using the same complex logic as the breakdown
                            // Calculate current visit charges from CPT codes
                            const baseCharges = verificationForm.cptCodes.reduce((sum, cpt) => {
                              const charge = isNaN(parseFloat(cpt.charge)) ? 0 : parseFloat(cpt.charge);
                              const units = isNaN(parseFloat(cpt.units)) || !parseFloat(cpt.units) ? 1 : parseFloat(cpt.units);
                              return sum + (charge * units);
                            }, 0);
                            const hasPendingRow = (verificationForm.currentCpt.code?.trim?.() || "") !== "" || (verificationForm.currentCpt.charge ?? "") !== "";
                            const pendingCharge = hasPendingRow
                              ? ((isNaN(parseFloat(verificationForm.currentCpt.charge)) ? 0 : parseFloat(verificationForm.currentCpt.charge)) *
                                 (isNaN(parseFloat(verificationForm.currentCpt.units)) || !parseFloat(verificationForm.currentCpt.units) ? 1 : parseFloat(verificationForm.currentCpt.units)))
                              : 0;
                            const currentVisitCharges = baseCharges + pendingCharge;

                            // Get values
                            const allowedAmount = parseFloat(verificationForm.allowedAmount) || 0;
                            const copay = parseFloat(verificationForm.coPay) || 0;
                            const coinsurancePercent = parseFloat(verificationForm.coInsurance) || 0;
                            const deductibleAmount = verificationForm.deductibleStatus === "Met" ? 0 : (parseFloat(verificationForm.deductibleAmount) || 0);
                            const insurancePayment = parseFloat(verificationForm.primaryPayment) || 0;
                            const oopYtd = parseFloat(verificationForm.outOfPocketRemaining) || 0;
                            const oopMax = parseFloat(verificationForm.outOfPocketMax) || 0;
                            const previousBalance = parseFloat(verificationForm.previousBalanceCredit) || 0;
                            const hasSecondary = (verificationForm.secondaryInsuranceName || "").trim() !== "";
                            const secondaryPercent = parseFloat(verificationForm.secondaryCoveragePercent) || 0;

                            // QMB Check: If QMB patient AND Medicare covered service, patient pays $0
                            const strIncludesMedicareCalc = (s?: string) => (s || '').toLowerCase().includes('medicare');
                            const isMedicarePlan = verificationForm.planType === "Medicare" ||
                              strIncludesMedicareCalc(verificationForm.primaryInsurance) ||
                              strIncludesMedicareCalc(verificationForm.insurancePlan) ||
                              strIncludesMedicareCalc(verificationForm.groupNumber);
                            
                            // Out-of-Pocket Remaining Check: If OOP remaining is explicitly set to 0, patient responsibility is 0 (insurance pays all)
                            // This means the patient has already met their out-of-pocket maximum for the year
                            // Only apply this rule if the field has been explicitly set (not empty)
                            let patientResp = 0;
                            if (verificationForm.outOfPocketRemaining !== "" && oopYtd === 0) {
                              // Patient has already met out-of-pocket maximum - insurance pays everything
                              const baseAmount = allowedAmount > 0 ? allowedAmount : currentVisitCharges;
                              patientResp = 0;
                              // Set the calculated values in the breakdown object
                              // For the button calculation, we just need the final result
                            } else if (verificationForm.isQMB && verificationForm.isCoveredService && isMedicarePlan) {
                              // QMB Patient - Federal law: $0 responsibility for Medicare covered services
                              patientResp = 0;
                            } else {
                              // Normal Calculation Flow
                              // Step 1: Start with Allowed Amount (or billed if no allowed amount)
                              const baseAmount = allowedAmount > 0 ? allowedAmount : currentVisitCharges;
                              
                              // Step 2: Apply Copay first (for services where copay applies)
                              // In many health plans, copay is applied for specific service types regardless of deductible status
                              const calculatedCopay = Math.min(copay, baseAmount);
                              let remainingAfterCopay = Math.max(0, baseAmount - calculatedCopay);
                              
                              // Step 3: Apply Deductible on remaining amount
                              // Deductible is typically applied after copay for services that have copay
                              // For services without copay, the full amount goes toward deductible
                              let remainingAfterDeductible = remainingAfterCopay;
                              let deductibleApplied = 0;
                              if (deductibleAmount > 0) {
                                deductibleApplied = Math.min(remainingAfterCopay, deductibleAmount);
                                remainingAfterDeductible = Math.max(0, remainingAfterCopay - deductibleApplied);
                              }
                              
                              // Step 4: Apply Coinsurance
                              // According to the formula: Patient Responsibility = Co-pay + Deductible Applied + (Allowed Amount × Co-insurance %)
                              let coinsuranceAmount = (baseAmount * coinsurancePercent) / 100;
                              
                              // Calculate patient responsibility before OOP max
                              const patientResponsibilityBeforeOOP = calculatedCopay + deductibleApplied + coinsuranceAmount;
                              
                              // Step 5: Apply Out-of-Pocket Maximum Cap
                              let finalPatientResponsibility = patientResponsibilityBeforeOOP;
                              if (oopMax > 0) {
                                const oopAfterThisVisit = oopYtd + patientResponsibilityBeforeOOP;
                                
                                if (oopAfterThisVisit >= oopMax) {
                                  // OOP Max reached or exceeded
                                  if (oopYtd >= oopMax) {
                                    // Already at max - patient pays $0
                                    finalPatientResponsibility = 0;
                                  } else {
                                    // Reaching max this visit - only pay difference
                                    const remainingToMax = oopMax - oopYtd;
                                    finalPatientResponsibility = Math.min(patientResponsibilityBeforeOOP, remainingToMax);
                                  }
                                } else {
                                  finalPatientResponsibility = patientResponsibilityBeforeOOP;
                                }
                              } else {
                                finalPatientResponsibility = patientResponsibilityBeforeOOP;
                              }

                              patientResp = finalPatientResponsibility;
                              
                              // Step 6: Apply Secondary Insurance (COB) on remaining patient responsibility
                              if (hasSecondary && patientResp > 0) {
                                // Get secondary insurance details
                                const secondaryCoPay = parseFloat(verificationForm.secondaryCoPay) || 0;
                                const secondaryDeductible = parseFloat(verificationForm.secondaryDeductible) || 0;
                                const secondaryDeductibleMet = parseFloat(verificationForm.secondaryDeductibleMet) || 0;
                                const secondaryCoInsurance = parseFloat(verificationForm.secondaryCoInsurance) || 0;
                                
                                // Start with remaining patient responsibility
                                let secondaryRemaining = patientResp;
                                
                                // Step 6a: Apply Secondary Co-pay (if applicable)
                                if (secondaryCoPay > 0) {
                                  const secondaryCopayApplied = Math.min(secondaryCoPay, secondaryRemaining);
                                  secondaryRemaining = Math.max(0, secondaryRemaining - secondaryCopayApplied);
                                }
                                
                                // Step 6b: Apply Secondary Deductible (if not met)
                                if (secondaryDeductible > 0 && secondaryDeductibleMet < secondaryDeductible) {
                                  const remainingDeductible = secondaryDeductible - secondaryDeductibleMet;
                                  const deductibleAppliedSecondary = Math.min(remainingDeductible, secondaryRemaining);
                                  secondaryRemaining = Math.max(0, secondaryRemaining - deductibleAppliedSecondary);
                                }
                                
                                // Step 6c: Apply Secondary Co-insurance or Coverage Percentage
                                let secondaryPayment = 0;
                                if (secondaryCoInsurance > 0) {
                                  // Use co-insurance percentage if provided
                                  secondaryPayment = (secondaryRemaining * secondaryCoInsurance) / 100;
                                } else if (secondaryPercent > 0) {
                                  // Fall back to coverage percentage
                                  secondaryPayment = (secondaryRemaining * secondaryPercent) / 100;
                                }
                                
                                // Ensure secondary payment doesn't exceed remaining balance
                                secondaryPayment = Math.min(secondaryPayment, secondaryRemaining);
                                secondaryRemaining = Math.max(0, secondaryRemaining - secondaryPayment);
                                
                                patientResp = secondaryRemaining;
                              }
                            }
                            
                            setVerificationForm(prev => ({
                              ...prev,
                              patientResponsibility: patientResp.toFixed(2)
                            }));
                            
                            toast({
                              title: "Calculated",
                              description: `Patient responsibility: $${patientResp.toFixed(2)}`,
                            });
                          }}
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          Calculate
                        </Button>
                        <Button
                          variant={showCalculationDetails ? "default" : "outline"}
                          onClick={() => {
                            setShowCalculationDetails(!showCalculationDetails);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {showCalculationDetails ? "Hide Details" : "Show Details"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowTemplateDialog(true)}
                        >
                          <FileCheck className="h-4 w-4 mr-2" />
                          Estimate Template
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            // ABN - Advance Beneficiary Notice
                            const isMedicare = verificationForm.planType === "Medicare" || 
                              verificationForm.primaryInsurance?.toLowerCase().includes('medicare');
                            if (isMedicare) {
                              setShowAbnDialog(true);
                            } else {
                              toast({
                                title: "ABN Not Required",
                                description: "ABN is typically required for Medicare services only",
                                variant: "default",
                              });
                            }
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          ABN
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Print estimate
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              const printContent = `
                                <html>
                                  <head>
                                    <title>Estimate of Patient Services</title>
                                    <style>
                                      body { font-family: Arial, sans-serif; padding: 20px; }
                                      h1 { color: #1e40af; }
                                      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                      th { background-color: #f3f4f6; }
                                      .summary { margin-top: 30px; padding: 15px; background-color: #f9fafb; border: 2px solid #1e40af; }
                                      .total { font-size: 18px; font-weight: bold; color: #1e40af; }
                                    </style>
                                  </head>
                                  <body>
                                    <h1>Estimate of Patient Services</h1>
                                    <p><strong>Patient:</strong> ${verificationForm.patientName || verificationForm.patientId}</p>
                                    <p><strong>Date of Service:</strong> ${verificationForm.appointmentDate || verificationForm.dateOfService}</p>
                                    <p><strong>Provider:</strong> ${verificationForm.providerName || 'N/A'}</p>
                                    <p><strong>Insurance:</strong> ${verificationForm.primaryInsurance || 'Self Pay'}</p>
                                    ${verificationForm.cptCodes.length > 0 ? `
                                    <table>
                                      <thead>
                                        <tr>
                                          <th>CPT Code</th>
                                          <th>Description</th>
                                          <th>Units</th>
                                          <th>Charge</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        ${verificationForm.cptCodes.map(cpt => `
                                          <tr>
                                            <td>${cpt.code}</td>
                                            <td>CPT Code ${cpt.code}</td>
                                            <td>${cpt.units || '1'}</td>
                                            <td>$${cpt.charge || '0.00'}</td>
                                          </tr>
                                        `).join('')}
                                      </tbody>
                                    </table>
                                    ` : ''}
                                    <div class="summary">
                                      <p><strong>Total Estimated Charges:</strong> $${(() => {
                                        const total = verificationForm.cptCodes.reduce((sum, cpt) => {
                                          const charge = parseFloat(cpt.charge) || 0;
                                          const units = parseFloat(cpt.units) || 1;
                                          return sum + (charge * units);
                                        }, 0);
                                        return total.toFixed(2);
                                      })()}</p>
                                      <p><strong>Estimated Insurance Benefit:</strong> $${(parseFloat(verificationForm.primaryPayment) || 0).toFixed(2)}</p>
                                      <p class="total">Estimated Patient Responsibility: $${(parseFloat(verificationForm.patientResponsibility) || 0).toFixed(2)}</p>
                                    </div>
                                    <p style="margin-top: 30px; font-size: 12px; color: #666;">
                                      This is an estimate only. Actual charges may vary based on services rendered and insurance coverage.
                                    </p>
                                  </body>
                                </html>
                              `;
                              printWindow.document.write(printContent);
                              printWindow.document.close();
                              printWindow.focus();
                              setTimeout(() => {
                                printWindow.print();
                              }, 250);
                            }
                          }}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Payment processing - open payment dialog
                            if (!verificationForm.patientId) {
                              toast({
                                title: "Patient Required",
                                description: "Please select a patient before processing payment",
                                variant: "destructive",
                              });
                              return;
                            }
                            setShowPaymentDialog(true);
                          }}
                        >
                          <CreditCardIcon className="h-4 w-4 mr-2" />
                          Payment
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Void estimate
                            if (confirm('Are you sure you want to void this estimate?')) {
                              setShowFormDialog(false);
                              setVerificationForm({
                                serialNo: "",
                                description: "", // Service description
                                providerId: "", // Provider selection
                                providerName: "", // Provider display name
                                nppId: "", // Non-Physician Practitioner ID
                                nppName: "", // Non-Physician Practitioner name
                                appointmentLocation: "",
                                appointmentDate: "",
                                dateOfService: "",
                                demographic: "",
                                typeOfVisit: "",
                                serviceType: "", // Inpatient, Outpatient, Emergency, etc.
                                status: "pending" as "pending" | "verified" | "completed" | "cancelled",
                                isSelfPay: false,
                                patientName: "",
                                patientId: "", // External patient ID (PAT-001) for display
                                patientUuid: "", // Internal UUID from patients.id for database
                                firstName: "",
                                lastName: "",
                                dob: "",
                                gender: "",
                                phone: "",
                                email: "",
                                address: "",
                                city: "",
                                state: "",
                                zip: "",
                                patientGender: "",
                                patientAddress: "",
                                patientCity: "",
                                patientState: "",
                                patientZip: "",
                                patientPhone: "",
                                subscriberIsPatient: true,
                                subscriberId: "",
                                subscriberFirstName: "",
                                subscriberLastName: "",
                                subscriberMiddleInitial: "",
                                subscriberDOB: "",
                                subscriberGender: "",
                                subscriberRelationship: "", // Self, Spouse, Child, Parent, etc.
                                subscriberAddress: "",
                                subscriberCity: "",
                                subscriberState: "",
                                subscriberZip: "",
                                primaryInsurance: "",
                                primaryInsuranceId: "",
                                insuranceId: "",
                                groupNumber: "",
                                insurancePlan: "",
                                planType: "",
                                effectiveDate: "",
                                terminationDate: "",
                                coPay: "",
                                coInsurance: "",
                                deductible: "",
                                deductibleMet: "",
                                outOfPocketRemaining: "",
                                outOfPocketMax: "",
                                inNetworkStatus: "",
                                allowedAmount: "",
                                copayBeforeDeductible: true,
                                deductibleStatus: "Met" as "Met" | "Not Met",
                                deductibleAmount: "",
                                cptCodes: [] as Array<{
                                  code: string;
                                  modifier1: string;
                                  modifier2: string;
                                  icd: string; // Linked ICD code
                                  pos: string; // Place of Service
                                  tos: string; // Type of Service
                                  units: string;
                                  charge: string;
                                }>,
                                icdCodes: [] as Array<{
                                  code: string;
                                  description: string;
                                  type: string;
                                  isPrimary: boolean;
                                }>,
                                currentCpt: {
                                  code: "",
                                  modifier1: "",
                                  modifier2: "",
                                  icd: "", // ICD code linked to this CPT
                                  pos: "",
                                  tos: "",
                                  units: "",
                                  charge: "",
                                },
                                // Current ICD row being edited (kept for compatibility)
                                currentIcd: {
                                  code: "",
                                  description: "",
                                  type: "DX", // DX = Diagnosis, PX = Procedure
                                  isPrimary: false,
                                },
                                
                                // Secondary Insurance
                                secondaryInsuranceName: "",
                                secondaryInsurance: "",
                                secondaryInsuranceCoverage: "",
                                secondaryInsuranceId: "", // Subscriber/Member ID
                                secondaryGroupNumber: "",
                                secondaryRelationshipCode: "", // Self, Spouse, Child, Parent, Other
                                secondaryEffectiveDate: "",
                                secondaryTerminationDate: "",
                                secondarySubscriberFirstName: "",
                                secondarySubscriberLastName: "",
                                secondarySubscriberDOB: "",
                                secondarySubscriberGender: "",
                                secondaryCoPay: "",
                                secondaryDeductible: "",
                                secondaryDeductibleMet: "",
                                secondaryCoInsurance: "",
                                secondaryPolicyHolderName: "",
                                secondaryPolicyHolderRelationship: "",
                                cobRule: "", // Auto-detect or manual: Birthday Rule, Employee Rule, Medicare Rule, etc.
                                cobIndicator: "S" as "P" | "S" | "T" | "A", // Primary, Secondary, Tertiary, Unknown
                                
                                // Referral & Authorization
                                referralRequired: false,
                                referralStatus: "active", // Active or Inactive
                                referralObtainedFrom: "", // "PCP" or "Insurance Approved PCP"
                                referralPCPStatus: "", // "On File" or "Required" (only if obtained from PCP)
                                referralNumber: "",
                                preAuthorizationRequired: false,
                                priorAuthNumber: "",
                                priorAuthStatus: "", // Not Started, Request Submitted, Pending, Under Review, Approved, Denied, Expired, Cancelled
                                priorAuthRequestDate: "",
                                priorAuthSubmissionDate: "",
                                priorAuthSubmissionMethod: "", // Electronic (X12 278), Portal, Fax, Email, Phone
                                priorAuthPayerConfirmationNumber: "",
                                priorAuthExpectedResponseDate: "",
                                priorAuthResponseDate: "",
                                priorAuthEffectiveDate: "",
                                priorAuthExpirationDate: "",
                                priorAuthDenialReasonCode: "",
                                priorAuthDenialReason: "",
                                priorAuthApprovedQuantity: "",
                                priorAuthApprovedFrequency: "",
                                priorAuthServiceDate: "",
                                priorAuthAppealSubmitted: false,
                                priorAuthAppealDate: "",
                                priorAuthAppealStatus: "", // Pending, Approved, Denied
                                priorAuthAppealDecisionDate: "",
                                
                                // Financial Information
                                previousBalanceCredit: "",
                                patientResponsibility: "",
                                collection: "",
                                estimatedCost: "",
                                // Visit amounts
                                billedAmount: "",
                                // QMB and Coverage
                                isQMB: false, // Qualified Medicare Beneficiary
                                isCoveredService: true, // Is service Medicare covered
                                // Insurance Payments
                                primaryPayment: "", // Amount paid by primary insurance
                                secondaryPayment: "", // Amount paid by secondary insurance (if any)
                                // Coverage percents (prototype-driven)
                                primaryCoveragePercent: "",
                                secondaryCoveragePercent: "",
                                
                                // Additional Information
                                remarks: "",
                                comments: "",
                                commentEntries: [] as Array<{id: string, text: string, attachments: Array<{id: string, name: string, type: string, size: number, content: string, uploadedAt: string}>, timestamp: string, author: string}>,
                                attachments: [] as Array<{id: string, name: string, type: string, size: number, content: string, uploadedAt: string}>,
                                dateChecked: new Date().toISOString().split('T')[0],
                                verifiedBy: "", // User who performed verification
                                checkBy: "", // Current user who checked (QA/Review)
                                verificationMethod: "manual", // manual, automated, portal
                                demographicChangesMade: false,
                                qa: false,
                                // Emergency Contact
                                emergencyContactName: "",
                                emergencyContactPhone: "",
                                emergencyContactRelation: "",
                                // Policy Holder Information
                                policyHolderName: "",
                                policyHolderRelationship: "",
                                // Medical Information
                                knownAllergies: "",
                                currentMedications: "",
                                medicalConditions: "",
                                previousSurgeries: "",
                                familyHistory: "",
                                // Demographic display (read-only, populated when patient selected)
                                demographicDisplay: {
                                  patientId: "",
                                  firstName: "",
                                  lastName: "",
                                  middleInitial: "",
                                  suffix: "",
                                  dob: "",
                                  gender: "",
                                  phone: "",
                                  email: "",
                                  address: "",
                                  city: "",
                                  state: "",
                                  zip: "",
                                  ssn: "",
                                  emergencyContactName: "",
                                  emergencyContactPhone: "",
                                  emergencyContactRelation: "",
                                } as {
                                  patientId: string;
                                  firstName: string;
                                  lastName: string;
                                  middleInitial: string;
                                  suffix: string;
                                  dob: string;
                                  gender: string;
                                  phone: string;
                                  email: string;
                                  address: string;
                                  city: string;
                                  state: string;
                                  zip: string;
                                  ssn: string;
                                  emergencyContactName: string;
                                  emergencyContactPhone: string;
                                  emergencyContactRelation: string;
                                }
                              });
                              toast({
                                title: "Voided",
                                description: "Estimate has been voided",
                              });
                            }
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Void
                        </Button>
                        <Button variant="outline" onClick={() => setShowFormDialog(false)}>
                          Close
                        </Button>
                      </div>
          </div>
          </div>
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Batch Eligibility Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Upload a CSV file or paste data in the format: Patient ID, Subscriber ID, Payer ID, Service Date (one per line)
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="batchData">Batch Data</Label>
                <Textarea
                  id="batchData"
                  value={batchData}
                  onChange={(e) => setBatchData(e.target.value)}
                  placeholder="PAT001,SUB001,MEDICARE,2024-01-15&#10;PAT002,SUB002,BCBS,2024-01-16&#10;PAT003,SUB003,AETNA,2024-01-17"
                  rows={8}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleBatchVerification} disabled={isLoading || !batchData.trim()}>
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing Batch...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Process Batch
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setBatchData("")}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={exportHistory} disabled={verificationHistory.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Dashboard View - Default view with filters and statistics */}
      {/* Compact Filter Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterGroup1("");
                setFilterGroup2("");
                setFilterGroup3({ checked: true, unchecked: true });
                setSelectedDate("");
                setSelectedPatient("");
                setSelectedYear("");
                setSelectedMonth("");
                setCustomRangeStart("");
                setCustomRangeEnd("");
                // Clear hierarchical filters
                setSelectedFilterYear("");
                setSelectedFilterMonth("");
                setSelectedTimePeriod("");
                setSelectedWeek("");
                setSelectedDay("");
              }}
              className="h-7 text-xs"
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter By - Compact */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Filter By</Label>
              <Select 
                value={filterGroup1 || "none"} 
                onValueChange={(value) => {
                  // If Custom Range is active and user selects Date of Service, clear it
                  if (filterGroup2 === "custom" && value === "dateOfService") {
                    toast({
                      title: "Filter Conflict",
                      description: "Date of Service filter is disabled when Custom Range is active. Use Custom Range dates instead.",
                      variant: "default",
                    });
                    return;
                  }
                  setFilterGroup1(value === "none" ? "" : value);
                }}
                disabled={filterGroup2 === "custom"}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="dateOfService" disabled={filterGroup2 === "custom"}>Date of Service</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="noAppointment">No Appointment</SelectItem>
                </SelectContent>
              </Select>
              {filterGroup1 === "dateOfService" && filterGroup2 !== "custom" && (
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-9 text-sm"
                />
              )}
              {filterGroup2 === "custom" && filterGroup1 === "dateOfService" && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  Date of Service filter is disabled. Use Custom Range dates above instead.
                </div>
              )}
              {filterGroup1 === "patient" && (
                <Select value={selectedPatient} onValueChange={setSelectedPatient} disabled={isLoadingPatients}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={isLoadingPatients ? "Loading..." : "Select patient"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingPatients ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : patients.length > 0 ? (
                      patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.patient_id || patient.id}>
                          {patient.patient_name} {patient.patient_id && `(${patient.patient_id})`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No patients found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Hierarchical Time Period Filter: Year → Month → Time Period */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Time Period</Label>
              
              {/* Step 1: Year Selection */}
              <Select 
                value={selectedFilterYear || "none"} 
                onValueChange={(value) => {
                  if (value === "none") {
                    setSelectedFilterYear("");
                    setSelectedFilterMonth("");
                    setSelectedTimePeriod("");
                  } else {
                    setSelectedFilterYear(value);
                    // Reset month, time period, week, and day when year changes
                    setSelectedFilterMonth("");
                    setSelectedTimePeriod("");
                    setSelectedWeek("");
                    setSelectedDay("");
                  }
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Step 2: Month Selection (only shown after year is selected) */}
              {selectedFilterYear && (
                <Select 
                  value={selectedFilterMonth || "none"} 
                  onValueChange={(value) => {
                    if (value === "none") {
                      setSelectedFilterMonth("");
                      setSelectedTimePeriod("");
                    } else {
                      setSelectedFilterMonth(value);
                      // Reset time period, week, and day when month changes
                      setSelectedTimePeriod("");
                      setSelectedWeek("");
                      setSelectedDay("");
                    }
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {monthOptions.map((month) => (
                      <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Step 3: Time Period Options (only shown after month is selected) */}
              {selectedFilterYear && selectedFilterMonth && (
                <Select 
                  value={selectedTimePeriod || "none"} 
                  onValueChange={(value) => {
                    setSelectedTimePeriod(value === "none" ? "" : value);
                    // Reset week and day when time period changes
                    if (value !== "week") {
                      setSelectedWeek("");
                      setSelectedDay("");
                    }
                    // When Custom Range is selected, clear Date of Service filter to avoid confusion
                    if (value === "custom" && filterGroup1 === "dateOfService") {
                      setFilterGroup1("");
                      setSelectedDate("");
                    }
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Time Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="wholeMonth">Whole Month</SelectItem>
                    <SelectItem value="custom">Custom Date Range</SelectItem>
                    <SelectItem value="15days">Last 15 Days</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    {/* Show Yesterday only if it's current year and current month */}
                    {isCurrentYear && isCurrentMonth && (
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                    )}
                    {/* Show Today only if it's current year and current month */}
                    {isCurrentYear && isCurrentMonth && (
                      <SelectItem value="today">Today</SelectItem>
                    )}
                    {/* Show Tomorrow only if it's current year and current month */}
                    {isCurrentYear && isCurrentMonth && (
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}

              {/* Step 4: Week Selection (only shown when "Week" is selected) */}
              {selectedTimePeriod === "week" && selectedFilterYear && selectedFilterMonth && (
                <Select 
                  value={selectedWeek || "none"} 
                  onValueChange={(value) => {
                    setSelectedWeek(value === "none" ? "" : value);
                    // Reset day when week changes
                    setSelectedDay("");
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Week" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="1">Week 1</SelectItem>
                    <SelectItem value="2">Week 2</SelectItem>
                    <SelectItem value="3">Week 3</SelectItem>
                    <SelectItem value="4">Week 4</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Step 5: Day Selection (only shown when a week is selected) */}
              {selectedTimePeriod === "week" && selectedWeek && selectedFilterYear && selectedFilterMonth && (
                <Select 
                  value={selectedDay || "none"} 
                  onValueChange={(value) => {
                    setSelectedDay(value === "none" ? "" : value);
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Show All Days in Week)</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Custom Date Range Input (shown when "Custom Date Range" is selected) */}
              {selectedTimePeriod === "custom" && selectedFilterYear && selectedFilterMonth && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Start Date</Label>
                      <Input
                        type="date"
                        value={customRangeStart}
                        onChange={(e) => setCustomRangeStart(e.target.value)}
                        className="h-9 text-sm"
                        placeholder="Start"
                        min={`${selectedFilterYear}-${selectedFilterMonth.padStart(2, '0')}-01`}
                        max={`${selectedFilterYear}-${selectedFilterMonth.padStart(2, '0')}-${new Date(parseInt(selectedFilterYear), parseInt(selectedFilterMonth), 0).getDate()}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">End Date</Label>
                      <Input
                        type="date"
                        value={customRangeEnd}
                        onChange={(e) => setCustomRangeEnd(e.target.value)}
                        className="h-9 text-sm"
                        placeholder="End"
                        min={customRangeStart || `${selectedFilterYear}-${selectedFilterMonth.padStart(2, '0')}-01`}
                        max={`${selectedFilterYear}-${selectedFilterMonth.padStart(2, '0')}-${new Date(parseInt(selectedFilterYear), parseInt(selectedFilterMonth), 0).getDate()}`}
                      />
                    </div>
                  </div>
                  {customRangeStart && customRangeEnd && new Date(customRangeStart) > new Date(customRangeEnd) && (
                    <p className="text-xs text-red-600">End date must be after start date</p>
                  )}
                </div>
              )}
            </div>

            {/* Status - Compact */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Status</Label>
              <div className="flex gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checked"
                    checked={filterGroup3.checked}
                    onCheckedChange={(checked) => 
                      setFilterGroup3(prev => ({ ...prev, checked: checked as boolean }))
                    }
                  />
                  <Label htmlFor="checked" className="text-sm cursor-pointer font-normal">Checked</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="unchecked"
                    checked={filterGroup3.unchecked}
                    onCheckedChange={(checked) => 
                      setFilterGroup3(prev => ({ ...prev, unchecked: checked as boolean }))
                    }
                  />
                  <Label htmlFor="unchecked" className="text-sm cursor-pointer font-normal">Unchecked</Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Verifications</p>
                <p className="text-2xl font-bold">{verificationHistory.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eligible</p>
                <p className="text-2xl font-bold text-green-600">
                  {verificationHistory.filter(h => h.isEligible).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">InEligible</p>
                <p className="text-2xl font-bold text-red-600">
                  {verificationHistory.filter(h => !h.isEligible).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {verificationHistory.length > 0 
                    ? Math.round((verificationHistory.filter(h => h.isEligible).length / verificationHistory.length) * 100)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for history and analytics views */}
      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Verification History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Verification History
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    value={historyDownloadFormat}
                    onValueChange={(v) => setHistoryDownloadFormat(v as HistoryDownloadFormat)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Download format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">XLSX</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadHistoryList(filteredHistory)}
                    disabled={filteredHistory.length === 0}
                    title={`Download filtered history as ${historyDownloadFormat.toUpperCase()}`}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (allHistoryExpanded ? collapseAllHistory() : expandAllHistory())}
                    disabled={filteredHistory.length === 0}
                    title={allHistoryExpanded ? "Collapse all rows" : "Expand all rows"}
                  >
                    {allHistoryExpanded ? "Collapse All" : "Expand All"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                  onClick={() => setShowHistoryColumnSelector(true)}
                  title="Select columns"
                >
                    <Columns3 className="h-4 w-4 mr-2" />
                    Columns
                </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by patient name, ID, or payer..."
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
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="eligible">Eligible Only</SelectItem>
                    <SelectItem value="ineligible">InEligible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {historyVisibleColumns.map((col) => (
                          <TableHead key={col}>{getHistoryColumnHeader(col)}</TableHead>
                        ))}
                        <TableHead className="w-[140px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.flatMap((entry: any, rowIndex: number) => {
                        const isExpanded = !!expandedHistoryRows[entry.id];
                        const mainRow = (
                          <TableRow
                            key={entry.id}
                            className="cursor-pointer hover:bg-muted/30"
                            onClick={() => toggleHistoryRow(entry.id)}
                            title="Click to expand/collapse"
                          >
                          {historyVisibleColumns.map((col) => {
                            const value = getHistoryColumnValue(entry, col);

                            if (col === "S.No") {
                              return (
                                <TableCell key={col} className="font-medium">
                                  <div className="flex items-center gap-1">
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    {String(rowIndex + 1).padStart(3, "0")}
                                  </div>
                                </TableCell>
                              );
                            }

                            if (col === "Eligible") {
                              return (
                                <TableCell key={col}>
                                  <Badge
                                    variant={entry.isEligible ? "secondary" : "destructive"}
                                  >
                                    {entry.isEligible ? "Eligible" : "InEligible"}
                                  </Badge>
                                </TableCell>
                              );
                            }

                            if (col === "Date") {
                              return (
                                <TableCell key={col}>
                                  {entry.timestamp
                                    ? new Date(entry.timestamp).toLocaleDateString("en-US", {
                                        month: "2-digit",
                                        day: "2-digit",
                                        year: "numeric",
                                      })
                                    : "—"}
                                </TableCell>
                              );
                            }

                            return <TableCell key={col}>{value}</TableCell>;
                          })}
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateToForm(entry);
                                  // Optionally open the form dialog if it's not already visible
                                  setShowFormDialog(true);
                                }}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  reverifyEntry(entry);
                                }}
                                disabled={verifyingIds.includes(entry.id)}
                                title="Re-verify"
                              >
                                {verifyingIds.includes(entry.id) ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateToForm(entry);
                                }}
                                title="Copy to form"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        );

                        const detailRow = isExpanded ? (
                          <TableRow key={`${entry.id}-details`} className="bg-muted/10">
                            <TableCell colSpan={historyVisibleColumns.length + 1}>
                              <div className="p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-semibold">Full details</div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleHistoryRow(entry.id);
                                    }}
                                  >
                                    Collapse
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <div className="text-xs text-muted-foreground">Patient</div>
                                    <div className="font-medium">{entry.patientName || entry.patientId || "—"}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Payer / Plan</div>
                                    <div className="font-medium">{entry.payerId || "—"}</div>
                                    <div className="text-xs text-muted-foreground">{entry.planType || "—"}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Network</div>
                                    <div className="font-medium">{entry.inNetworkStatus || "—"}</div>
                                  </div>

                                  <div>
                                    <div className="text-xs text-muted-foreground">Appointment</div>
                                    <div className="font-medium">{entry.appointmentLocation || "—"}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {(entry.appointmentDate || entry.timestamp)
                                        ? new Date(entry.appointmentDate || entry.timestamp).toLocaleString()
                                        : "—"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Type of Visit</div>
                                    <div className="font-medium">{entry.typeOfVisit || "—"}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Method</div>
                                    <div className="font-medium">{entry.verificationMethod || "—"}</div>
                                  </div>

                                  <div>
                                    <div className="text-xs text-muted-foreground">CPT Codes</div>
                                    <div className="font-medium">
                                      {Array.isArray(entry.cptCodes) ? entry.cptCodes.join(", ") :
                                        Array.isArray(entry.cpt_codes) ? entry.cpt_codes.join(", ") : "—"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">ICD Codes</div>
                                    <div className="font-medium">
                                      {Array.isArray(entry.icdCodes) ? entry.icdCodes.join(", ") :
                                        Array.isArray(entry.icd_codes) ? entry.icd_codes.join(", ") : "—"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Prior Auth / Referral</div>
                                    <div className="font-medium">
                                      PA: {entry.preAuthorizationRequired ? "Yes" : "No"} · Referral: {entry.referralRequired ? "Yes" : "No"}
                                    </div>
                                    {(entry.referralNumber || entry.priorAuthNumber) && (
                                      <div className="text-xs text-muted-foreground">
                                        {entry.referralNumber ? `Referral #: ${entry.referralNumber}` : ""}
                                        {entry.priorAuthNumber ? `  PA #: ${entry.priorAuthNumber}` : ""}
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <div className="text-xs text-muted-foreground">Copay / Deductible</div>
                                    <div className="font-medium">
                                      Copay: {entry.coverage?.copay ?? entry.coPay ?? "—"} · Deductible: {entry.coverage?.deductible ?? entry.deductible ?? "—"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">OOP Remaining</div>
                                    <div className="font-medium">{entry.outOfPocketRemaining ?? entry.out_of_pocket_remaining ?? "—"}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Estimates</div>
                                    <div className="font-medium">
                                      Allowed: {entry.allowedAmount ?? entry.allowed_amount ?? "—"} · Est: {entry.estimatedCost ?? entry.estimated_cost ?? "—"}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadHistoryEntry(entry);
                                    }}
                                    title={`Download this record as ${historyDownloadFormat.toUpperCase()}`}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : null;

                        return detailRow ? [mainRow, detailRow] : [mainRow];
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No verification history found</p>
                  {searchTerm && (
                    <p className="text-sm mt-2">Try adjusting your search criteria</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Column selector dialog for Verification History */}
          <Dialog open={showHistoryColumnSelector} onOpenChange={setShowHistoryColumnSelector}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Select Columns</DialogTitle>
                <DialogDescription>
                  Choose which columns to display in the Verification History table.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 py-4">
                {/* Available Columns */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Available Columns</h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {historyAvailableColumns.length === 0 && (
                      <p className="text-sm text-muted-foreground">No more columns to add.</p>
                    )}
                    {historyAvailableColumns.map((column) => (
                      <div
                        key={column}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-gray-900">{getHistoryColumnHeader(column)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            setHistoryAvailableColumns(
                              historyAvailableColumns.filter((c) => c !== column)
                            );
                            setHistoryVisibleColumns([...historyVisibleColumns, column]);
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
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">Visible Columns</h3>
                  <p className="text-xs text-muted-foreground mb-2">Drag to reorder. “S.No” is always shown.</p>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {historyVisibleColumns.map((column, idx) => (
                      <div
                        key={column}
                        className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        draggable
                        onDragStart={(e) => {
                          setHistoryDragIndex(idx);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", String(idx));
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const from = historyDragIndex ?? Number(e.dataTransfer.getData("text/plain"));
                          if (!Number.isFinite(from) || from === idx) return;
                          setHistoryVisibleColumns((prev) => historyArrayMove(prev, from, idx));
                          setHistoryDragIndex(null);
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-gray-900 truncate">{getHistoryColumnHeader(column)}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                            disabled={idx === 0}
                            onClick={() => setHistoryVisibleColumns((prev) => historyArrayMove(prev, idx, idx - 1))}
                            title="Move up"
                          >
                            <ChevronUp className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            disabled={idx === historyVisibleColumns.length - 1}
                            onClick={() => setHistoryVisibleColumns((prev) => historyArrayMove(prev, idx, idx + 1))}
                            title="Move down"
                          >
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            disabled={column === "S.No"}
                          onClick={() => {
                              if (column === "S.No") return;
                            if (historyVisibleColumns.length === 1) return;
                              setHistoryVisibleColumns(historyVisibleColumns.filter((c) => c !== column));
                            setHistoryAvailableColumns([...historyAvailableColumns, column]);
                          }}
                            title={column === "S.No" ? "S.No is always visible" : "Remove"}
                        >
                          <X className="h-4 w-4 text-gray-600" />
                        </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => setShowHistoryColumnSelector(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Done
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Eligibility Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Eligibility Rate</span>
                    <span className="text-2xl font-bold text-green-600">
                      {verificationHistory.length > 0 
                        ? Math.round((verificationHistory.filter(h => h.isEligible).length / verificationHistory.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${verificationHistory.length > 0 
                          ? (verificationHistory.filter(h => h.isEligible).length / verificationHistory.length) * 100
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Payer Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    verificationHistory.reduce((acc, entry) => {
                      acc[entry.payerId] = (acc[entry.payerId] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([payer, count]) => (
                    <div key={payer} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{payer}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${verificationHistory.length > 0 ? ((count as number) / verificationHistory.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistoryColumnSelector(true)}
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                Columns
              </Button>
            </CardHeader>
            <CardContent>
              {verificationHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No verification history found</p>
                  {searchTerm && (
                    <p className="text-sm mt-2">Try adjusting your search criteria</p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {historyVisibleColumns.map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2 text-left font-medium text-muted-foreground"
                          >
                            {getHistoryColumnHeader(col)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {verificationHistory.slice(0, 50).map((entry) => (
                        <tr key={entry.id} className="border-b last:border-0">
                          {historyVisibleColumns.map((col) => (
                            <td key={`${entry.id}-${col}`} className="px-3 py-2">
                              {getHistoryColumnValue(entry, col)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Verification Entry Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Verification</DialogTitle>
            <DialogDescription>Update key fields for this verification entry.</DialogDescription>
          </DialogHeader>
          {editEntry && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-patient">Patient ID</Label>
                <Input id="edit-patient" value={editEntry.patientId}
                  onChange={(e) => handleEditChange('patientId', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-payer">Payer</Label>
                <Input id="edit-payer" value={editEntry.payerId}
                  onChange={(e) => handleEditChange('payerId', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-plan">Plan Type</Label>
                <Input id="edit-plan" value={editEntry.planType || ''}
                  onChange={(e) => handleEditChange('planType', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-network">Network Status</Label>
                <Input id="edit-network" value={editEntry.inNetworkStatus || ''}
                  onChange={(e) => handleEditChange('inNetworkStatus', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-copay">Copay</Label>
                <Input id="edit-copay" type="number" value={editEntry.coverage?.copay ?? 0}
                  onChange={(e) => handleEditChange('coverage.copay', Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="edit-deductible">Deductible</Label>
                <Input id="edit-deductible" type="number" value={editEntry.coverage?.deductible ?? 0}
                  onChange={(e) => handleEditChange('coverage.deductible', Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="edit-coins">Coinsurance</Label>
                <Input id="edit-coins" value={editEntry.coverage?.coinsurance ?? ''}
                  onChange={(e) => handleEditChange('coverage.coinsurance', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-effective">Effective Date</Label>
                <Input id="edit-effective" type="date" value={editEntry.effectiveDate || ''}
                  onChange={(e) => handleEditChange('effectiveDate', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-termination">Termination Date</Label>
                <Input id="edit-termination" type="date" value={editEntry.terminationDate || ''}
                  onChange={(e) => handleEditChange('terminationDate', e.target.value)} />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Estimate Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Estimate Templates</DialogTitle>
            <DialogDescription>
              Save and load estimate templates for common scenarios
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Template name (e.g., 'Standard Office Visit')"
                id="templateName"
                className="flex-1"
              />
              <Button
                onClick={() => {
                  const templateName = (document.getElementById('templateName') as HTMLInputElement)?.value;
                  if (!templateName) {
                    toast({
                      title: "Error",
                      description: "Please enter a template name",
                      variant: "destructive",
                    });
                    return;
                  }
                  const newTemplate = {
                    id: Date.now().toString(),
                    name: templateName,
                    data: { ...verificationForm },
                  };
                  setEstimateTemplates(prev => [...prev, newTemplate]);
                  (document.getElementById('templateName') as HTMLInputElement).value = '';
                  toast({
                    title: "Template Saved",
                    description: `Template "${templateName}" has been saved`,
                  });
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
            {estimateTemplates.length > 0 && (
              <div className="border rounded-lg">
                <div className="p-3 bg-muted font-semibold">Saved Templates</div>
                <div className="divide-y">
                  {estimateTemplates.map((template) => (
                    <div key={template.id} className="p-3 flex items-center justify-between hover:bg-muted/50">
                      <span className="font-medium">{template.name}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setVerificationForm(template.data);
                            setShowTemplateDialog(false);
                            toast({
                              title: "Template Loaded",
                              description: `Template "${template.name}" has been loaded`,
                            });
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Load
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Delete template "${template.name}"?`)) {
                              setEstimateTemplates(prev => prev.filter(t => t.id !== template.id));
                              toast({
                                title: "Template Deleted",
                                description: `Template "${template.name}" has been deleted`,
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {estimateTemplates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No templates saved yet</p>
                <p className="text-sm mt-2">Save your current estimate as a template for quick reuse</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ABN Dialog */}
      <Dialog open={showAbnDialog} onOpenChange={setShowAbnDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Advance Beneficiary Notice (ABN)
            </DialogTitle>
            <DialogDescription>
              Medicare Advance Beneficiary Notice of Noncoverage
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                An ABN is required when Medicare may not pay for a service. The patient must be notified in advance.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div>
                <Label>Patient Name</Label>
                <Input value={verificationForm.patientName || ''} readOnly className="bg-muted" />
              </div>
              <div>
                <Label>Service/Item</Label>
                <Textarea
                  placeholder="Describe the service or item that may not be covered..."
                  rows={3}
                  defaultValue={verificationForm.cptCodes.map(cpt => `CPT ${cpt.code}`).join(', ')}
                />
              </div>
              <div>
                <Label>Reason Medicare May Not Pay</Label>
                <Select defaultValue="not_medically_necessary">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_medically_necessary">Not medically necessary</SelectItem>
                    <SelectItem value="experimental">Experimental/Investigational</SelectItem>
                    <SelectItem value="frequency">Frequency limitation exceeded</SelectItem>
                    <SelectItem value="other">Other (specify in remarks)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estimated Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  defaultValue={verificationForm.patientResponsibility || '0.00'}
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="abnSigned" />
                <Label htmlFor="abnSigned" className="cursor-pointer">
                  Patient has signed the ABN form
                </Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAbnDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "ABN Generated",
                description: "ABN form has been generated and saved",
              });
              setShowAbnDialog(false);
            }}>
              <FileText className="h-4 w-4 mr-2" />
              Generate ABN
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5 text-green-600" />
              Process Payment
            </DialogTitle>
            <DialogDescription>
              Process payment for patient responsibility
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Patient:</span>
                <span>{verificationForm.patientName || verificationForm.patientId}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Amount Due:</span>
                <span className="text-lg font-bold text-green-600">
                  ${(parseFloat(verificationForm.patientResponsibility) || 0).toFixed(2)}
                </span>
              </div>
              {parseFloat(verificationForm.previousBalanceCredit || '0') !== 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Previous Balance:</span>
                  <span className={parseFloat(verificationForm.previousBalanceCredit || '0') > 0 ? 'text-red-600' : 'text-green-600'}>
                    ${parseFloat(verificationForm.previousBalanceCredit || '0').toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Payment Method</Label>
                <Select defaultValue="credit_card">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  defaultValue={verificationForm.patientResponsibility || '0.00'}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Payment notes or reference number..."
                  rows={2}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              try {
                // Save payment to database
                if (verificationForm.patientId) {
                  const { error } = await supabase.from('payments' as any).insert({
                    patient_id: verificationForm.patientId,
                    amount: parseFloat(verificationForm.patientResponsibility) || 0,
                    payment_method: 'credit_card',
                    status: 'completed',
                    processed_at: new Date().toISOString(),
                  });
                  if (error) throw error;
                }
                toast({
                  title: "Payment Processed",
                  description: `Payment of $${(parseFloat(verificationForm.patientResponsibility) || 0).toFixed(2)} has been processed successfully`,
                });
                setShowPaymentDialog(false);
              } catch (error: any) {
                toast({
                  title: "Payment Error",
                  description: error.message || "Failed to process payment",
                  variant: "destructive",
                });
              }
            }}>
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Add Patient Dialog */}
      <Dialog open={showQuickAddPatient} onOpenChange={setShowQuickAddPatient}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Add Patient</DialogTitle>
            <DialogDescription>
              Patient not found. Please add patient information to continue with eligibility verification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Patient ID: <strong>{patientIdSearch || 'Will be auto-generated'}</strong>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="qa-firstName">First Name *</Label>
                <Input
                  id="qa-firstName"
                  value={quickAddForm.firstName}
                  onChange={(e) => setQuickAddForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="qa-lastName">Last Name *</Label>
                <Input
                  id="qa-lastName"
                  value={quickAddForm.lastName}
                  onChange={(e) => setQuickAddForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="qa-dob">Date of Birth *</Label>
                <Input
                  id="qa-dob"
                  type="date"
                  value={quickAddForm.dob}
                  onChange={(e) => setQuickAddForm(prev => ({ ...prev, dob: e.target.value }))}
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="qa-gender">Gender</Label>
                <Select
                  value={quickAddForm.gender}
                  onValueChange={(value) => setQuickAddForm(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                    <SelectItem value="U">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="qa-phone">Phone</Label>
                <Input
                  id="qa-phone"
                  type="tel"
                  value={quickAddForm.phone}
                  onChange={(e) => setQuickAddForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="qa-email">Email</Label>
                <Input
                  id="qa-email"
                  type="email"
                  value={quickAddForm.email}
                  onChange={(e) => setQuickAddForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john.doe@example.com"
                  className="h-9"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="qa-address">Address</Label>
                <Input
                  id="qa-address"
                  value={quickAddForm.address}
                  onChange={(e) => setQuickAddForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="qa-city">City</Label>
                <Input
                  id="qa-city"
                  value={quickAddForm.city}
                  onChange={(e) => setQuickAddForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="qa-state">State</Label>
                <Input
                  id="qa-state"
                  value={quickAddForm.state}
                  onChange={(e) => setQuickAddForm(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="State"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="qa-zip">ZIP Code</Label>
                <Input
                  id="qa-zip"
                  value={quickAddForm.zip}
                  onChange={(e) => setQuickAddForm(prev => ({ ...prev, zip: e.target.value }))}
                  placeholder="12345"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="qa-insuranceId">Insurance ID</Label>
                <Input
                  id="qa-insuranceId"
                  value={quickAddForm.insuranceId}
                  onChange={(e) => setQuickAddForm(prev => ({ ...prev, insuranceId: e.target.value }))}
                  placeholder="Insurance/Member ID"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="qa-groupNumber">Group Number</Label>
                <Input
                  id="qa-groupNumber"
                  value={quickAddForm.groupNumber}
                  onChange={(e) => setQuickAddForm(prev => ({ ...prev, groupNumber: e.target.value }))}
                  placeholder="Group Number"
                  className="h-9"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowQuickAddPatient(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuickAddPatient}>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Authorization Request Dialog */}
      <AuthorizationRequestDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={(newAuthId) => {
          toast({
            title: "Authorization Request Created",
            description: "Prior authorization request has been created successfully.",
          });
          // Keep dialog open if new auth was created so user can see the saved data
          // User can close manually
          if (!newAuthId) {
            setShowAuthDialog(false);
          }
        }}
        patientId={verificationForm.patientId}
        patientData={{
          name: verificationForm.patientName,
          dob: verificationForm.dob,
          memberId: verificationForm.insuranceId,
          payerId: verificationForm.primaryInsurance,
          payerName: verificationForm.primaryInsurance,
          cptCodes: verificationForm.cptCodes.map(c => c.code).filter(Boolean),
          icdCodes: verificationForm.icdCodes.map(c => c.code).filter(Boolean),
          providerId: verificationForm.providerId,
          providerNpi: providers.find(p => p.id === verificationForm.providerId)?.npi || "",
          facilityId: verificationForm.appointmentLocation || undefined,
          facilityName: facilities.find(f => f.id === verificationForm.appointmentLocation)?.name || undefined,
          appointmentDate: verificationForm.appointmentDate || verificationForm.dateOfService || undefined,
          appointmentType: verificationForm.typeOfVisit || undefined,
        }}
      />

      {/* Patient Edit Modal */}
      <Dialog open={showPatientEditModal} onOpenChange={setShowPatientEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Edit Patient Information
            </DialogTitle>
            <DialogDescription>
              Update patient information including demographics, contact, insurance, and medical details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modal-patient-id">Patient ID</Label>
                  <Input 
                    id="modal-patient-id" 
                    value={verificationForm.patientId || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      patientId: e.target.value,
                      demographicDisplay: {
                        ...prev.demographicDisplay,
                        patientId: e.target.value
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="modal-first-name">First Name *</Label>
                  <Input 
                    id="modal-first-name" 
                    value={verificationForm.firstName || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      firstName: e.target.value,
                      demographicDisplay: {
                        ...prev.demographicDisplay,
                        firstName: e.target.value
                      }
                    }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="modal-last-name">Last Name *</Label>
                  <Input 
                    id="modal-last-name" 
                    value={verificationForm.lastName || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      lastName: e.target.value,
                      demographicDisplay: {
                        ...prev.demographicDisplay,
                        lastName: e.target.value
                      }
                    }))}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label htmlFor="modal-dob">Date of Birth *</Label>
                  <Input 
                    id="modal-dob" 
                    type="date" 
                    value={verificationForm.dob || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      dob: e.target.value,
                      demographicDisplay: {
                        ...prev.demographicDisplay,
                        dob: e.target.value
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="modal-gender">Gender *</Label>
                  <Select 
                    value={verificationForm.gender || ''}
                    onValueChange={(value) => setVerificationForm(prev => ({
                      ...prev,
                      gender: value,
                      demographicDisplay: {
                        ...prev.demographicDisplay,
                        gender: value
                      }
                    }))}
                  >
                    <SelectTrigger id="modal-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="O">Other</SelectItem>
                      <SelectItem value="U">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                <Phone className="h-4 w-4 mr-2 text-green-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modal-phone">Phone Number *</Label>
                  <Input 
                    id="modal-phone" 
                    value={verificationForm.phone || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      phone: e.target.value,
                      demographicDisplay: {
                        ...prev.demographicDisplay,
                        phone: e.target.value
                      }
                    }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="modal-email">Email Address *</Label>
                  <Input 
                    id="modal-email" 
                    value={verificationForm.email || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    placeholder="patient@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="modal-address">Street Address *</Label>
                  <Input 
                    id="modal-address" 
                    value={verificationForm.address || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      address: e.target.value,
                      demographicDisplay: {
                        ...prev.demographicDisplay,
                        address: e.target.value
                      }
                    }))}
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <Label htmlFor="modal-city">City *</Label>
                  <Input 
                    id="modal-city" 
                    value={verificationForm.city || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      city: e.target.value,
                      demographicDisplay: {
                        ...prev.demographicDisplay,
                        city: e.target.value
                      }
                    }))}
                    placeholder="Anytown"
                  />
                </div>
                <div>
                  <Label htmlFor="modal-state">State *</Label>
                  <Select 
                    value={verificationForm.state || ''}
                    onValueChange={(value) => setVerificationForm(prev => ({
                      ...prev,
                      state: value,
                      demographicDisplay: {
                        ...prev.demographicDisplay,
                        state: value
                      }
                    }))}
                  >
                    <SelectTrigger id="modal-state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="modal-zip">Zip Code *</Label>
                  <Input 
                    id="modal-zip" 
                    value={verificationForm.zip || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      zip: e.target.value,
                      demographicDisplay: {
                        ...prev.demographicDisplay,
                        zip: e.target.value
                      }
                    }))}
                    placeholder="12345"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="modal-emergency-contact-name">Contact Name</Label>
                    <Input
                      id="modal-emergency-contact-name"
                      value={verificationForm.emergencyContactName || ''}
                      onChange={(e) => setVerificationForm(prev => ({
                        ...prev,
                        emergencyContactName: e.target.value,
                        demographicDisplay: {
                          ...prev.demographicDisplay,
                          emergencyContactName: e.target.value
                        }
                      }))}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="modal-emergency-contact-phone">Contact Phone</Label>
                    <Input
                      id="modal-emergency-contact-phone"
                      value={verificationForm.emergencyContactPhone || ''}
                      onChange={(e) => setVerificationForm(prev => ({
                        ...prev,
                        emergencyContactPhone: e.target.value,
                        demographicDisplay: {
                          ...prev.demographicDisplay,
                          emergencyContactPhone: e.target.value
                        }
                      }))}
                      placeholder="(555) 987-6543"
                    />
                  </div>
                  <div>
                    <Label htmlFor="modal-emergency-contact-relation">Relationship</Label>
                    <Select
                      value={verificationForm.emergencyContactRelation || ''}
                      onValueChange={(value) => setVerificationForm(prev => ({
                        ...prev,
                        emergencyContactRelation: value,
                        demographicDisplay: {
                          ...prev.demographicDisplay,
                          emergencyContactRelation: value
                        }
                      }))}
                    >
                      <SelectTrigger id="modal-emergency-contact-relation">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Insurance Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-emerald-600" />
                Insurance Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="modal-primary-insurance-company">Primary Insurance Company *</Label>
                  <Select
                    value={verificationForm.primaryInsuranceId || ''}
                    onValueChange={(value) => {
                      const payer = mockPayers.find(p => p.id === value);
                      setVerificationForm(prev => ({
                        ...prev,
                        primaryInsuranceId: value,
                        primaryInsurance: payer?.name || '',
                      }));
                    }}
                    disabled={isLoadingPayers}
                  >
                    <SelectTrigger id="modal-primary-insurance-company" className="min-w-[200px]">
                      <SelectValue placeholder={isLoadingPayers ? "Loading payers..." : "Select insurance company"} />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPayers.length === 0 && !isLoadingPayers ? (
                        <SelectItem value="none" disabled>No payers found. Please add payers in Customer Setup.</SelectItem>
                      ) : (
                        mockPayers.map(payer => (
                          <SelectItem key={payer.id} value={payer.id}>
                            {payer.name} {payer.type ? `- ${payer.type}` : ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="modal-insurance-id">Insurance ID *</Label>
                  <Input
                    id="modal-insurance-id"
                    value={verificationForm.insuranceId || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      insuranceId: e.target.value
                    }))}
                    placeholder="ABC123456789"
                  />
                </div>
                <div>
                  <Label htmlFor="modal-group-number">Group Number</Label>
                  <Input
                    id="modal-group-number"
                    value={verificationForm.groupNumber || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      groupNumber: e.target.value
                    }))}
                    placeholder="Group number"
                  />
                </div>
                <div>
                  <Label htmlFor="modal-policy-holder-name">Policy Holder Name</Label>
                  <Input
                    id="modal-policy-holder-name"
                    value={verificationForm.policyHolderName || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      policyHolderName: e.target.value
                    }))}
                    placeholder="Policy holder name"
                  />
                </div>
                <div>
                  <Label htmlFor="modal-policy-holder-relationship">Policy Holder Relationship</Label>
                  <Select
                    value={verificationForm.policyHolderRelationship || ''}
                    onValueChange={(value) => setVerificationForm(prev => ({
                      ...prev,
                      policyHolderRelationship: value
                    }))}
                  >
                    <SelectTrigger id="modal-policy-holder-relationship">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Self</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-500" />
                  Secondary Insurance (Optional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="modal-secondary-insurance-company">Secondary Insurance Company</Label>
                    <Select
                      value={verificationForm.secondaryInsuranceId || ''}
                      onValueChange={(value) => {
                        const payer = mockPayers.find(p => p.id === value);
                        setVerificationForm(prev => ({
                          ...prev,
                          secondaryInsuranceId: value,
                          secondaryInsurance: payer?.name || '',
                        }));
                      }}
                      disabled={isLoadingPayers}
                    >
                      <SelectTrigger id="modal-secondary-insurance-company">
                        <SelectValue placeholder={isLoadingPayers ? "Loading payers..." : "Select insurance company"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {mockPayers.length === 0 && !isLoadingPayers ? (
                          <SelectItem value="no-payers" disabled>No payers found. Please add payers in Customer Setup.</SelectItem>
                        ) : (
                          mockPayers.map(payer => (
                            <SelectItem key={payer.id} value={payer.id}>
                              {payer.name} {payer.type ? `- ${payer.type}` : ''}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="modal-secondary-insurance-id">Secondary Insurance ID</Label>
                    <Input
                      id="modal-secondary-insurance-id"
                      value={verificationForm.secondaryInsuranceId || ''}
                      onChange={(e) => setVerificationForm(prev => ({
                        ...prev,
                        secondaryInsuranceId: e.target.value
                      }))}
                      placeholder="ABC123456789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="modal-secondary-group-number">Group Number</Label>
                    <Input
                      id="modal-secondary-group-number"
                      value={verificationForm.secondaryGroupNumber || ''}
                      onChange={(e) => setVerificationForm(prev => ({
                        ...prev,
                        secondaryGroupNumber: e.target.value
                      }))}
                      placeholder="Group number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="modal-secondary-policy-holder-name">Policy Holder Name</Label>
                    <Input
                      id="modal-secondary-policy-holder-name"
                      value={verificationForm.secondaryPolicyHolderName || ''}
                      onChange={(e) => setVerificationForm(prev => ({
                        ...prev,
                        secondaryPolicyHolderName: e.target.value
                      }))}
                      placeholder="Policy holder name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="modal-secondary-policy-holder-relationship">Policy Holder Relationship</Label>
                    <Select
                      value={verificationForm.secondaryPolicyHolderRelationship || ''}
                      onValueChange={(value) => setVerificationForm(prev => ({
                        ...prev,
                        secondaryPolicyHolderRelationship: value
                      }))}
                    >
                      <SelectTrigger id="modal-secondary-policy-holder-relationship">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Self</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Medical Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                <Stethoscope className="h-4 w-4 mr-2 text-purple-600" />
                Medical Information
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="modal-known-allergies">Known Allergies</Label>
                  <Textarea
                    id="modal-known-allergies"
                    value={verificationForm.knownAllergies || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      knownAllergies: e.target.value
                    }))}
                    placeholder="List any known allergies (separate with commas)"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="modal-current-medications">Current Medications</Label>
                  <Textarea
                    id="modal-current-medications"
                    value={verificationForm.currentMedications || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      currentMedications: e.target.value
                    }))}
                    placeholder="List current medications (separate with commas)"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="modal-medical-conditions">Medical Conditions</Label>
                  <Textarea
                    id="modal-medical-conditions"
                    value={verificationForm.medicalConditions || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      medicalConditions: e.target.value
                    }))}
                    placeholder="List any medical conditions (separate with commas)"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="modal-previous-surgeries">Previous Surgeries</Label>
                  <Textarea
                    id="modal-previous-surgeries"
                    value={verificationForm.previousSurgeries || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      previousSurgeries: e.target.value
                    }))}
                    placeholder="List any previous surgeries"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="modal-family-history">Family Medical History</Label>
                  <Textarea
                    id="modal-family-history"
                    value={verificationForm.familyHistory || ''}
                    onChange={(e) => setVerificationForm(prev => ({
                      ...prev,
                      familyHistory: e.target.value
                    }))}
                    placeholder="List relevant family medical history"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowPatientEditModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Optionally, you can add validation or save logic here
                toast({
                  title: "Patient Information Updated",
                  description: "Patient information has been updated successfully."
                });
                setShowPatientEditModal(false);
              }}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Registration Form Modal */}
      <PatientRegistrationForm 
        isOpen={showPatientRegistrationModal}
        onClose={() => setShowPatientRegistrationModal(false)}
        onSubmit={(patientData) => {
          // Handle patient registration submission
          toast({
            title: "Patient Registered Successfully",
            description: `${patientData.firstName} ${patientData.lastName} has been registered.`
          });
          
          // Optionally populate the main form with the new patient data
          setVerificationForm(prev => ({
            ...prev,
            patientId: patientData.id,
            patientName: `${patientData.firstName} ${patientData.lastName}`,
            firstName: patientData.firstName,
            lastName: patientData.lastName,
            dob: patientData.dateOfBirth,
            gender: patientData.gender,
            phone: patientData.phone,
            email: patientData.email,
            address: patientData.address,
            city: patientData.city,
            state: patientData.state,
            zip: patientData.zipCode,
            insuranceId: patientData.insuranceId,
            primaryInsurance: patientData.insuranceCompany,
            // Map insurance company ID if available
            primaryInsuranceId: patientData.insuranceCompanyId,
            // Set subscriber information to match patient
            subscriberFirstName: patientData.firstName,
            subscriberLastName: patientData.lastName,
            subscriberDob: patientData.dateOfBirth,
            subscriberGender: patientData.gender,
            subscriberId: patientData.insuranceId,
            subscriberRelationship: "Self", // Since patient is self
            // Medical information
            medicalInfo: patientData.medicalInfo,
            emergencyContact: patientData.emergencyContact,
            // Insurance details
            groupNumber: patientData.groupNumber,
            policyHolderName: patientData.policyHolderName,
            policyHolderRelationship: patientData.policyHolderRelationship,
            // Secondary insurance if available
            secondaryInsurance: patientData.secondaryInsurance,
            secondaryInsuranceId: patientData.secondaryInsuranceId,
            secondaryGroupNumber: patientData.secondaryGroupNumber,
            secondaryPolicyHolderName: patientData.secondaryPolicyHolderName,
            secondaryPolicyHolderRelationship: patientData.secondaryPolicyHolderRelationship,
            // Medical history
            knownAllergies: patientData.allergies,
            currentMedications: patientData.currentMedications,
            medicalConditions: patientData.medicalConditions,
            previousSurgeries: patientData.previousSurgeries,
            familyHistory: patientData.familyHistory,
            // Update demographic display as well
            demographicDisplay: {
              ...prev.demographicDisplay,
              patientId: patientData.id,
              firstName: patientData.firstName,
              lastName: patientData.lastName,
              dob: patientData.dateOfBirth,
              gender: patientData.gender,
              phone: patientData.phone,
              address: patientData.address,
              city: patientData.city,
              state: patientData.state,
              zip: patientData.zipCode,
              ssn: patientData.ssn,
              maritalStatus: patientData.maritalStatus,
              language: patientData.language,
              emergencyContactName: patientData.emergencyContact?.name,
              emergencyContactPhone: patientData.emergencyContact?.phone,
              emergencyContactRelation: patientData.emergencyContact?.relation,
            }
          }));
          
          setShowPatientRegistrationModal(false);
        }}
      />
    </div>
  );
};

export default EligibilityVerification;
