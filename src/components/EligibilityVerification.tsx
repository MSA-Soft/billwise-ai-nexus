/**
 * Eligibility & Benefits Verification Component (X12 270/271)
 * 
 * RESEARCH-BASED IMPLEMENTATION SUMMARY:
 * 
 * Based on comprehensive research of X12 270/271 standards and industry best practices:
 * 
 * REQUIRED FIELDS (X12 270/271 Standard):
 * - Patient Information: Name, DOB, Gender (sometimes), Address
 * - Subscriber Information: Required when different from patient (Common in family plans)
 *   - Subscriber Name, DOB, Relationship to Patient, Subscriber ID
 * - Insurance Details: Payer ID, Subscriber ID/Member ID, Group Number (often required)
 * - Service Information: Service Date, Service Type (Inpatient/Outpatient/Emergency)
 * - CPT/ICD Codes: Optional but recommended for specific service verification
 * 
 * RESPONSE DATA (X12 271 Standard):
 * - Eligibility Status (Active/Inactive)
 * - Coverage Dates (Effective/Termination)
 * - Plan Type (HMO, PPO, EPO, etc.)
 * - Financial Responsibilities: Co-pay, Deductible, Co-insurance, Out-of-pocket max
 * - Network Status (In-network/Out-of-network)
 * - Benefit Details: Service-specific coverage, limitations, exclusions
 * - Authorization Requirements: Referrals, Prior Authorizations
 * 
 * WORKFLOW BEST PRACTICES:
 * - Verify eligibility 48 hours before appointment (industry standard)
 * - Verify at multiple touchpoints: Scheduling, Pre-visit, Check-in
 * - Store verification results for audit trail
 * - Handle subscriber vs patient distinction (critical for family plans)
 * - Capture CPT/ICD codes for service-specific eligibility
 * - Track prior authorizations and referrals
 * 
 * IMPLEMENTATION ENHANCEMENTS ADDED:
 * 1. Subscriber Information Section (conditional - when different from patient)
 * 2. Service Type field (Inpatient/Outpatient/Emergency/Urgent Care/Ambulatory)
 * 3. Group Number field (required by many payers)
 * 4. Plan Type field (HMO, PPO, EPO, POS, HDHP, Medicare, Medicaid)
 * 5. Coverage Effective/Termination Dates
 * 6. CPT/ICD Codes capture (for service-specific verification)
 * 7. Enhanced Prior Authorization fields (Number, Status)
 * 8. Referral Number tracking
 * 9. Deductible Met tracking
 * 10. Out-of-Pocket Max field
 * 
 * INTEGRATION RECOMMENDATIONS:
 * - Auto-trigger verification when appointments are scheduled
 * - Pre-populate patient data from patient records
 * - Display 271 response data (coverage dates, plan type, benefits)
 * - Link to Prior Authorization module when PA required
 */

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
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
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building,
  Plus,
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
  Calculator
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getEDIService, EligibilityRequest, EligibilityResponse } from "@/services/ediService";
import { getCodeValidationService } from "@/services/codeValidationService";
import { supabase } from "@/integrations/supabase/client";

const EligibilityVerification = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResponse | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);
  const [patients, setPatients] = useState<Array<{ patient_id: string | null; patient_name: string | null; id: string }>>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [facilities, setFacilities] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);
  const [verificationSerialNo, setVerificationSerialNo] = useState(1);
  const [cptCodeFees, setCptCodeFees] = useState<Map<string, number>>(new Map());
  


  // New Verification Form State
  const [verificationForm, setVerificationForm] = useState({
    serialNo: "",
    appointmentLocation: "",
    appointmentDate: "",
    dateOfService: "",
    demographic: "",
    typeOfVisit: "",
    serviceType: "", // Inpatient, Outpatient, Emergency, etc.
    
    // Patient Information
    patientName: "",
    patientId: "",
    dob: "",
    patientGender: "",
    patientAddress: "",
    patientCity: "",
    patientState: "",
    patientZip: "",
    patientPhone: "",
    
    // Subscriber Information (when different from patient)
    subscriberIsPatient: true, // If false, show subscriber fields
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
    
    // Primary Insurance
    primaryInsurance: "",
    insuranceId: "", // Subscriber ID/Member ID
    groupNumber: "", // Group Number (often required)
    insurancePlan: "",
    planType: "", // HMO, PPO, EPO, etc.
    effectiveDate: "",
    terminationDate: "",
    
    // Coverage Details (from 271 response)
    coPay: "",
    coInsurance: "",
    deductible: "",
    deductibleMet: "",
    outOfPocketRemaining: "",
    outOfPocketMax: "",
    inNetworkStatus: "",
    // Estimation Inputs
    allowedAmount: "",
    copayBeforeDeductible: true,
    
    // Deductible new fields per spec
    deductibleStatus: "Met" as "Met" | "Not Met",
    deductibleAmount: "",
    
    // Service Codes (for specific service verification)
    cptCodes: [] as Array<{
      code: string;
      modifier1: string;
      modifier2: string;
      modifier3: string;
      pos: string; // Place of Service
      tos: string; // Type of Service
      units: string;
      charge: string;
      renderingNpi: string;
    }>,
    icdCodes: [] as Array<{
      code: string;
      description: string;
      type: string; // DX (Diagnosis), PX (Procedure), etc.
      isPrimary: boolean;
    }>,
    // Current CPT row being edited
    currentCpt: {
      code: "",
      modifier1: "",
      modifier2: "",
      modifier3: "",
      pos: "",
      tos: "",
      units: "",
      charge: "",
      renderingNpi: "",
    },
    // Current ICD row being edited
    currentIcd: {
      code: "",
      description: "",
      type: "DX", // DX = Diagnosis, PX = Procedure
      isPrimary: false,
    },
    
    // Secondary Insurance
    secondaryInsuranceName: "",
    secondaryInsuranceCoverage: "",
    secondaryInsuranceId: "",
    secondaryGroupNumber: "",
    
    // Referral & Authorization
    referralRequired: false,
    referralObtainedFrom: "", // "PCP" or "Insurance Approved PCP"
    referralPCPStatus: "", // "On File" or "Required" (only if obtained from PCP)
    referralNumber: "",
    preAuthorizationRequired: false,
    priorAuthNumber: "",
    priorAuthStatus: "", // Pending, Approved, Denied
    
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
    dateChecked: new Date().toISOString().split('T')[0],
    verifiedBy: "", // User who performed verification
    verificationMethod: "manual", // manual, automated, portal
    demographicChangesMade: false,
    qa: false,
  });

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
  
  // Filter value states
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [customRangeStart, setCustomRangeStart] = useState("");
  const [customRangeEnd, setCustomRangeEnd] = useState("");

  // Seed dummy verification history on first load (for demo/low-space preview)
  useEffect(() => {
    if (verificationHistory.length === 0) {
      const now = Date.now();
      const sample = [
        {
          id: String(now - 1000),
          timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
          patientId: 'PT-1001',
          patientName: 'John Carter',
          payerId: 'AETNA',
          isEligible: true,
          coverage: { copay: 30, deductible: 500, coinsurance: '20%' },
          planType: 'PPO',
          effectiveDate: '2025-01-01',
          terminationDate: '',
          inNetworkStatus: 'In-Network'
        },
        {
          id: String(now - 2000),
          timestamp: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
          patientId: 'PT-1002',
          patientName: 'Aisha Khan',
          payerId: 'UHC',
          isEligible: false,
          coverage: { copay: 0, deductible: 0, coinsurance: '0%' },
          planType: 'HMO',
          effectiveDate: '2024-07-01',
          terminationDate: '2025-06-30',
          inNetworkStatus: 'Out-of-Network'
        },
        {
          id: String(now - 3000),
          timestamp: new Date(now - 1000 * 60 * 60 * 50).toISOString(),
          patientId: 'PT-1003',
          patientName: 'Maria Gomez',
          payerId: 'MEDICARE',
          isEligible: true,
          coverage: { copay: 0, deductible: 240, coinsurance: '0%' },
          planType: 'Medicare',
          effectiveDate: '2023-01-01',
          terminationDate: '',
          inNetworkStatus: 'N/A'
        }
      ];
      // Enrich samples with visit metadata
      const enriched = sample.map((e, i) => ({
        ...e,
        serialNo: `VER-${18430000 + i}`,
        appointmentLocation: ['Main Office', 'Downtown Clinic', 'North Branch'][i % 3],
        appointmentDate: new Date(now - (i + 1) * 60 * 60 * 1000).toISOString().split('T')[0],
        typeOfVisit: ['New Patient', 'Follow-up', 'Consult'][i % 3],
        totalCollectible: (e.coverage?.copay ?? 0) + (e.coverage?.deductible ?? 0),
        referralRequired: i % 2 === 0,
        preAuthorizationRequired: i % 3 === 0,
        previousBalanceCredit: i % 2 === 0 ? '0.00' : '35.00',
        patientResponsibility: i % 2 === 0 ? '30.00' : '65.00',
        currentVisitAmount: i % 2 === 0 ? '95.00' : '120.00',
        remarks: i % 2 === 0 ? 'Verified via portal' : 'Phone verification',
        verificationMethod: i % 2 === 0 ? 'portal' : 'manual',
      }));
      setVerificationHistory(enriched);
    }
  }, []);

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
    modifier3: { isValid: boolean; message: string } | null;
  }>({ modifier1: null, modifier2: null, modifier3: null });

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

  const saveEdit = () => {
    if (!editEntry) return;
    setVerificationHistory(prev => prev.map(e => e.id === editEntry.id ? editEntry : e));
    setIsEditOpen(false);
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const expandAll = () => setExpandedRows(filteredHistory.map(e => e.id));
  const collapseAll = () => setExpandedRows([]);

  const copySummary = async (entry: any) => {
    const estimated = entry.estimatedResponsibility;
    const fallbackTotal = (entry.coverage?.copay ?? 0) + (entry.coverage?.deductible ?? 0);
    const total = estimated ?? entry.totalCollectible ?? fallbackTotal;
    const text = `Eligibility for ${entry.patientName || entry.patientId}\nS.No: ${entry.serialNo || '-'}\nPayer: ${entry.payerId}\nStatus: ${entry.isEligible ? 'Eligible' : 'Not Eligible'}\nPlan: ${entry.planType || '-'}\nNetwork: ${entry.inNetworkStatus || '-'}\nAppointment Location: ${entry.appointmentLocation || '-'}\nDOS/Appt Date: ${entry.appointmentDate || '-'}\nType of Visit: ${entry.typeOfVisit || '-'}\nCopay: $${entry.coverage?.copay ?? 0}\nDeductible: $${entry.coverage?.deductible ?? 0}\nCoinsurance: ${entry.coverage?.coinsurance ?? '-'}\nAllowed Amount: $${entry.allowedAmount ?? '-'}\nEstimated Responsibility: $${estimated ?? '-'}\nTotal Collectible: $${total}\nEffective: ${entry.effectiveDate || '-'}\nTermination: ${entry.terminationDate || '-'}`;
    try { await navigator.clipboard.writeText(text); toast({ title: 'Copied', description: 'Summary copied to clipboard' }); } catch {}
  };

  const duplicateToForm = (entry: any) => {
    setVerificationForm(v => ({
      ...v,
      patientId: entry.patientId,
      patientName: entry.patientName || '',
      appointmentDate: new Date().toISOString().split('T')[0],
      dateOfService: new Date().toISOString().split('T')[0],
      appointmentLocation: entry.appointmentLocation || v.appointmentLocation,
      typeOfVisit: entry.typeOfVisit || v.typeOfVisit,
      primaryInsurance: entry.payerId,
      insurancePlan: entry.payerId,
      planType: entry.planType || v.planType,
      effectiveDate: entry.effectiveDate || v.effectiveDate,
      terminationDate: entry.terminationDate || v.terminationDate,
      inNetworkStatus: entry.inNetworkStatus || v.inNetworkStatus,
      coPay: String(entry.coverage?.copay ?? v.coPay),
      deductible: String(entry.coverage?.deductible ?? v.deductible),
      coInsurance: String(entry.coverage?.coinsurance ?? v.coInsurance),
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
    setVerificationHistory(prev => prev.map(e => e.id === entry.id ? updated : e));
    setVerifyingIds(prev => prev.filter(id => id !== entry.id));
    toast({ title: 'Re-verified', description: `Updated result for ${entry.patientId}` });
  };

  const payers = [
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

  // Fetch patients from database on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoadingPatients(true);
      try {
        const { data, error } = await supabase
          .from('collections_accounts')
          .select('id, patient_id, patient_name')
          .not('patient_name', 'is', null)
          .order('patient_name', { ascending: true })
          .limit(500);

        if (error) {
          console.error('Error fetching patients:', error);
          toast({
            title: "Error",
            description: "Failed to load patients",
            variant: "destructive",
          });
          return;
        }

        // Filter out duplicates and null values, create display-friendly format
        const uniquePatients = (data || [])
          .filter(p => p.patient_name || p.patient_id)
          .map(p => ({
            id: p.id,
            patient_id: p.patient_id || `TEMP-${p.id}`,
            patient_name: p.patient_name || `Patient ${p.patient_id || p.id}`,
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

  // Generate serial number when form opens
  useEffect(() => {
    if (showFormDialog) {
      // Generate serial number based on timestamp or increment
      const timestamp = Date.now();
      const serialNo = `VER-${timestamp.toString().slice(-8)}`;
      setVerificationForm(prev => ({ ...prev, serialNo }));
    }
  }, [showFormDialog]);

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
    const modifier3 = verificationForm.currentCpt.modifier3.trim();

    setModifierValidation({
      modifier1: modifier1 ? validateModifier(modifier1, cptCode) : null,
      modifier2: modifier2 ? validateModifier(modifier2, cptCode) : null,
      modifier3: modifier3 ? validateModifier(modifier3, cptCode) : null,
    });
  }, [
    verificationForm.currentCpt.modifier1,
    verificationForm.currentCpt.modifier2,
    verificationForm.currentCpt.modifier3,
    verificationForm.currentCpt.code,
  ]);


  // Enhanced validation for new verification form
  const validateVerificationForm = () => {
    const errors: string[] = [];
    
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
    
    return errors;
  };

  const handleVerifyEligibility = async () => {
    const validationErrors = validateVerificationForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const request: EligibilityRequest = {
        patientId: verificationForm.patientId,
        subscriberId: verificationForm.subscriberIsPatient ? verificationForm.insuranceId : verificationForm.subscriberId || verificationForm.insuranceId,
        payerId: verificationForm.primaryInsurance,
        serviceDate: verificationForm.appointmentDate || verificationForm.dateOfService,
        serviceCodes: verificationForm.cptCodes.map(cpt => cpt.code).filter(code => code.trim() !== ""), // Extract CPT codes
        diagnosisCodes: verificationForm.icdCodes.map(icd => icd.code).filter(code => code.trim() !== ""), // Extract ICD codes
      };

      const ediService = getEDIService();
      const result = await ediService.checkEligibility(request);
      setEligibilityResult(result);

      // Add to history
      setVerificationHistory(prev => [{
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        patientId: verificationForm.patientId,
        patientName: verificationForm.patientName,
        payerId: verificationForm.primaryInsurance,
        isEligible: result.isEligible,
        coverage: result.coverage,
        serialNo: verificationForm.serialNo,
        appointmentLocation: verificationForm.appointmentLocation,
        appointmentDate: verificationForm.appointmentDate || verificationForm.dateOfService,
        typeOfVisit: verificationForm.typeOfVisit,
        totalCollectible: (Number(result.coverage?.copay ?? 0)) + (Number(result.coverage?.deductible ?? 0)),
        estimatedResponsibility: 0,
        allowedAmount: verificationForm.allowedAmount,
        copayBeforeDeductible: verificationForm.copayBeforeDeductible,
        referralRequired: verificationForm.referralRequired,
        preAuthorizationRequired: verificationForm.preAuthorizationRequired,
        previousBalanceCredit: verificationForm.previousBalanceCredit,
        patientResponsibility: verificationForm.patientResponsibility,
        currentVisitAmount: verificationForm.estimatedCost,
        remarks: verificationForm.remarks,
        verificationMethod: verificationForm.verificationMethod,
      }, ...prev]);

      toast({
        title: "Eligibility Verified",
        description: result.isEligible ? "Patient is eligible for coverage" : "Patient is not eligible for coverage",
      });
      
      // Close dialog after verification
      setShowFormDialog(false);
      
      // Reset form to initial state with all new fields
      setVerificationForm({
        serialNo: "",
        appointmentLocation: "",
        appointmentDate: "",
        dateOfService: "",
        demographic: "",
        typeOfVisit: "",
        serviceType: "",
        patientName: "",
        patientId: "",
        dob: "",
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
        subscriberRelationship: "",
        subscriberAddress: "",
        subscriberCity: "",
        subscriberState: "",
        subscriberZip: "",
        primaryInsurance: "",
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
        deductibleStatus: "Met",
        deductibleAmount: "",
        cptCodes: [],
        icdCodes: [],
        currentCpt: {
          code: "",
          modifier1: "",
          modifier2: "",
          modifier3: "",
          pos: "",
          tos: "",
          units: "",
          charge: "",
          renderingNpi: "",
        },
        currentIcd: {
          code: "",
          description: "",
          type: "DX",
          isPrimary: false,
        },
        secondaryInsuranceName: "",
        secondaryInsuranceCoverage: "",
        secondaryInsuranceId: "",
        secondaryGroupNumber: "",
        referralRequired: false,
        referralObtainedFrom: "",
        referralPCPStatus: "",
        referralNumber: "",
        preAuthorizationRequired: false,
        priorAuthNumber: "",
        priorAuthStatus: "",
        previousBalanceCredit: "",
        patientResponsibility: "",
        collection: "",
        estimatedCost: "",
        billedAmount: "",
        isQMB: false,
        isCoveredService: true,
        primaryPayment: "",
        secondaryPayment: "",
        primaryCoveragePercent: "",
        secondaryCoveragePercent: "",
        remarks: "",
        dateChecked: new Date().toISOString().split('T')[0],
        verifiedBy: "",
        verificationMethod: "manual",
        demographicChangesMade: false,
        qa: false,
      });

    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Unable to verify eligibility. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    try {
      const lines = batchData.trim().split('\n');
      const results = [];
      
      for (const line of lines) {
        const [patientId, subscriberId, payerId, serviceDate] = line.split(',');
        if (patientId && subscriberId && payerId && serviceDate) {
          const request: EligibilityRequest = {
            patientId: patientId.trim(),
            subscriberId: subscriberId.trim(),
            payerId: payerId.trim(),
            serviceDate: serviceDate.trim(),
            serviceCodes: formData.serviceCodes,
            diagnosisCodes: formData.diagnosisCodes,
          };

          const ediService = getEDIService();
          const result = await ediService.checkEligibility(request);
          results.push({ request, result });
        }
      }

      setVerificationHistory(prev => [...results.map(({ request, result }) => ({
        id: Date.now().toString() + Math.random(),
        timestamp: new Date().toISOString(),
        patientId: request.patientId,
        payerId: request.payerId,
        isEligible: result.isEligible,
        coverage: result.coverage,
      })), ...prev]);

      toast({
        title: "Batch Verification Complete",
        description: `Processed ${results.length} verifications successfully.`,
      });

    } catch (error: any) {
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
        `${entry.patientId},${entry.payerId},${new Date(entry.timestamp).toLocaleDateString()},${entry.isEligible ? 'Eligible' : 'Not Eligible'},${entry.coverage?.copay ?? ''},${entry.coverage?.deductible ?? ''},${entry.coverage?.coinsurance ?? ''},${entry.allowedAmount ?? ''},${entry.estimatedResponsibility ?? ''},${entry.copayBeforeDeductible ?? ''}`
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

  const filteredHistory = verificationHistory.filter(entry => {
    const matchesSearch = entry.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        entry.payerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || 
                        (filterStatus === "eligible" && entry.isEligible) ||
                        (filterStatus === "ineligible" && !entry.isEligible);
    return matchesSearch && matchesFilter;
  });

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
      <Tabs defaultValue="verify" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="verify">Single Verification</TabsTrigger>
          <TabsTrigger value="batch">Batch Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="verify" className="space-y-6">
                  <div className="space-y-6">
                    {/* Serial Number - Auto Generated */}
            <Card>
              <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-5 w-5 text-blue-600" />
                          Verification Details
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                            <Label htmlFor="serialNo">S.No (Auto Generated)</Label>
                    <Input
                              id="serialNo"
                              value={verificationForm.serialNo}
                              readOnly
                              className="bg-muted"
                    />
                  </div>
                  <div>
                            <Label htmlFor="appointmentLocation">Appointment Location *</Label>
                            <Select 
                              value={verificationForm.appointmentLocation} 
                              onValueChange={(value) => setVerificationForm(prev => ({ ...prev, appointmentLocation: value }))}
                              disabled={isLoadingFacilities}
                            >
                              <SelectTrigger>
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
                            <Label htmlFor="appointmentDate">Appointment Date / Date of Service *</Label>
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
                      />
                    </div>
                  </div>
                      </CardContent>
                    </Card>

                    {/* Patient Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          Patient Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                            <Label htmlFor="demographic">Demographic</Label>
                            <Select 
                              value={verificationForm.demographic} 
                              onValueChange={(value) => setVerificationForm(prev => ({ ...prev, demographic: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select demographic" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="adult">Adult</SelectItem>
                                <SelectItem value="child">Child</SelectItem>
                                <SelectItem value="senior">Senior</SelectItem>
                              </SelectContent>
                            </Select>
                    </div>
                    <div>
                            <Label htmlFor="typeOfVisit">Type Of Visit *</Label>
                            <Select 
                              value={verificationForm.typeOfVisit} 
                              onValueChange={(value) => setVerificationForm(prev => ({ ...prev, typeOfVisit: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select visit type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="consultation">Consultation</SelectItem>
                                <SelectItem value="follow-up">Follow-up</SelectItem>
                                <SelectItem value="routine">Routine</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="preventive">Preventive</SelectItem>
                              </SelectContent>
                            </Select>
                    </div>
                    <div>
                            <Label htmlFor="serviceType">Service Type</Label>
                            <Select 
                              value={verificationForm.serviceType} 
                              onValueChange={(value) => setVerificationForm(prev => ({ ...prev, serviceType: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select service type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="outpatient">Outpatient</SelectItem>
                                <SelectItem value="inpatient">Inpatient</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                                <SelectItem value="urgent-care">Urgent Care</SelectItem>
                                <SelectItem value="ambulatory">Ambulatory</SelectItem>
                              </SelectContent>
                            </Select>
                    </div>
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                            <Label htmlFor="patientName">Patient Name *</Label>
                            <Select 
                              value={verificationForm.patientId} 
                              onValueChange={(value) => {
                                const patient = patients.find(p => 
                                  (p.patient_id && p.patient_id === value) || 
                                  (!p.patient_id && p.id === value)
                                );
                                setVerificationForm(prev => ({ 
                                  ...prev, 
                                  patientId: value,
                                  patientName: patient?.patient_name || ""
                                }));
                              }}
                              disabled={isLoadingPatients}
                            >
                        <SelectTrigger>
                                <SelectValue placeholder={isLoadingPatients ? "Loading..." : "Select patient"} />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.length === 0 && !isLoadingPatients ? (
                            <SelectItem value="none" disabled>No patients found</SelectItem>
                          ) : (
                            patients.map((patient) => {
                              const displayId = patient.patient_id || `TEMP-${patient.id}`;
                              const selectValue = patient.patient_id || patient.id;
                              return (
                                <SelectItem key={patient.id} value={selectValue}>
                                  {patient.patient_name || 'Unknown'} {displayId && `(${displayId})`}
                                </SelectItem>
                              );
                            })
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                            <Label htmlFor="patientNameDisplay">Patient Name (Display)</Label>
                      <Input
                              id="patientNameDisplay"
                              value={verificationForm.patientName}
                              readOnly
                              className="bg-muted"
                      />
                    </div>
                    <div>
                            <Label htmlFor="dob">Date of Birth (DOB) *</Label>
                      <Input
                              id="dob"
                              type="date"
                              value={verificationForm.dob}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, dob: e.target.value }))}
                      />
                    </div>
                  </div>
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
                          </div>
                          
                          {/* CPT Table */}
                          <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-muted">
                                  <tr>
                                    <th className="p-2 text-left font-medium">CPT Code</th>
                                    <th className="p-2 text-left font-medium">Modifier 1</th>
                                    <th className="p-2 text-left font-medium">Modifier 2</th>
                                    <th className="p-2 text-left font-medium">Modifier 3</th>
                                    <th className="p-2 text-left font-medium">POS</th>
                                    <th className="p-2 text-left font-medium">TOS</th>
                                    <th className="p-2 text-left font-medium">Units</th>
                                    <th className="p-2 text-left font-medium">Charge</th>
                                    <th className="p-2 text-left font-medium">Rendering NPI</th>
                                    <th className="p-2 text-left font-medium">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {verificationForm.cptCodes.map((cpt, index) => (
                                    <tr key={index} className="border-t">
                                      <td className="p-2">{cpt.code}</td>
                                      <td className="p-2">{cpt.modifier1 || "-"}</td>
                                      <td className="p-2">{cpt.modifier2 || "-"}</td>
                                      <td className="p-2">{cpt.modifier3 || "-"}</td>
                                      <td className="p-2">{cpt.pos || "-"}</td>
                                      <td className="p-2">{cpt.tos || "-"}</td>
                                      <td className="p-2">{cpt.units || "-"}</td>
                                      <td className="p-2">${cpt.charge || "0.00"}</td>
                                      <td className="p-2">{cpt.renderingNpi || "-"}</td>
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
                                      <div className="relative">
                                        <Input
                                          placeholder="25"
                                          value={verificationForm.currentCpt.modifier3}
                                          onChange={(e) => setVerificationForm(prev => ({
                                            ...prev,
                                            currentCpt: { ...prev.currentCpt, modifier3: e.target.value }
                                          }))}
                                          className={`h-8 w-16 pr-6 ${modifierValidation.modifier3?.isValid === false ? 'border-red-500' : modifierValidation.modifier3?.isValid === true ? 'border-green-500' : ''}`}
                                          maxLength={2}
                                        />
                                        {modifierValidation.modifier3 && (
                                          <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                            {modifierValidation.modifier3.isValid ? (
                                              <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                              <XCircle className="h-4 w-4 text-red-500" />
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      {modifierValidation.modifier3 && !modifierValidation.modifier3.isValid && (
                                        <div className="mt-1 text-xs text-red-600">{modifierValidation.modifier3.message}</div>
                                      )}
                                    </td>
                                    <td className="p-2">
                                      <Input
                                        placeholder="11"
                                        value={verificationForm.currentCpt.pos}
                                        onChange={(e) => setVerificationForm(prev => ({
                                          ...prev,
                                          currentCpt: { ...prev.currentCpt, pos: e.target.value }
                                        }))}
                                        className="h-8 w-16"
                                        maxLength={2}
                                      />
                                    </td>
                                    <td className="p-2">
                                      <Input
                                        placeholder="1"
                                        value={verificationForm.currentCpt.tos}
                                        onChange={(e) => setVerificationForm(prev => ({
                                          ...prev,
                                          currentCpt: { ...prev.currentCpt, tos: e.target.value }
                                        }))}
                                        className="h-8 w-16"
                                        maxLength={2}
                                      />
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
                                      <Input
                                        placeholder="1234567890"
                                        value={verificationForm.currentCpt.renderingNpi}
                                        onChange={(e) => setVerificationForm(prev => ({
                                          ...prev,
                                          currentCpt: { ...prev.currentCpt, renderingNpi: e.target.value }
                                        }))}
                                        className="h-8 w-28"
                                        maxLength={10}
                                      />
                                    </td>
                                    <td className="p-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          if (verificationForm.currentCpt.code.trim()) {
                                            setVerificationForm(prev => ({
                                              ...prev,
                                              cptCodes: [...prev.cptCodes, { ...prev.currentCpt }],
                                              currentCpt: {
                                                code: "",
                                                modifier1: "",
                                                modifier2: "",
                                                modifier3: "",
                                                pos: "",
                                                tos: "",
                                                units: "",
                                                charge: "",
                                                renderingNpi: "",
                                              }
                                            }));
                                          }
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

                        {/* ICD Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">ICD Section</Label>
                          </div>
                          
                          {/* ICD Table */}
                          <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-muted">
                                  <tr>
                                    <th className="p-2 text-left font-medium">ICD Code</th>
                                    <th className="p-2 text-left font-medium">Description</th>
                                    <th className="p-2 text-left font-medium">Type</th>
                                    <th className="p-2 text-left font-medium">Primary?</th>
                                    <th className="p-2 text-left font-medium">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {verificationForm.icdCodes.map((icd, index) => (
                                    <tr key={index} className="border-t">
                                      <td className="p-2">{icd.code}</td>
                                      <td className="p-2">{icd.description || "-"}</td>
                                      <td className="p-2">{icd.type}</td>
                                      <td className="p-2">
                                        {icd.isPrimary ? (
                                          <Badge variant="default">Primary</Badge>
                                        ) : (
                                          <Badge variant="outline">Secondary</Badge>
                                        )}
                                      </td>
                                      <td className="p-2">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setVerificationForm(prev => ({
                                            ...prev,
                                            icdCodes: prev.icdCodes.filter((_, i) => i !== index)
                                          }))}
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                  {/* Add New ICD Row */}
                                  <tr className="border-t bg-muted/30">
                                    <td className="p-2">
                                      <div className="relative">
                                        <Input
                                          placeholder="E11.9"
                                          value={verificationForm.currentIcd.code}
                                          onChange={(e) => setVerificationForm(prev => ({
                                            ...prev,
                                            currentIcd: { ...prev.currentIcd, code: e.target.value }
                                          }))}
                                          className={`h-8 w-24 pr-6 ${icdValidation?.isValid === false ? 'border-red-500' : icdValidation?.isValid === true ? 'border-green-500' : ''}`}
                                          maxLength={10}
                                        />
                                        {icdValidation && (
                                          <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                            {icdValidation.isValid ? (
                                              <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                              <XCircle className="h-4 w-4 text-red-500" />
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      {icdValidation && (
                                        <div className="mt-1 text-xs">
                                          {icdValidation.isValid && icdValidation.description && (
                                            <div className="text-green-600 line-clamp-1">{icdValidation.description}</div>
                                          )}
                                          {icdValidation.errors.length > 0 && (
                                            <div className="text-red-600">{icdValidation.errors[0]}</div>
                                          )}
                                          {icdValidation.warnings.length > 0 && (
                                            <div className="text-yellow-600">{icdValidation.warnings[0]}</div>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-2">
                                      <Input
                                        placeholder="Type 2 diabetes without complications"
                                        value={verificationForm.currentIcd.description}
                                        onChange={(e) => setVerificationForm(prev => ({
                                          ...prev,
                                          currentIcd: { ...prev.currentIcd, description: e.target.value }
                                        }))}
                                        className="h-8 min-w-[200px]"
                                      />
                                    </td>
                                    <td className="p-2">
                                      <Select
                                        value={verificationForm.currentIcd.type}
                                        onValueChange={(value) => setVerificationForm(prev => ({
                                          ...prev,
                                          currentIcd: { ...prev.currentIcd, type: value }
                                        }))}
                                      >
                                        <SelectTrigger className="h-8 w-20">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="DX">DX</SelectItem>
                                          <SelectItem value="PX">PX</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </td>
                                    <td className="p-2">
                                      <Checkbox
                                        checked={verificationForm.currentIcd.isPrimary}
                                        onCheckedChange={(checked) => setVerificationForm(prev => ({
                                          ...prev,
                                          currentIcd: { ...prev.currentIcd, isPrimary: checked as boolean }
                                        }))}
                                      />
                                    </td>
                                    <td className="p-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          if (verificationForm.currentIcd.code.trim()) {
                                            setVerificationForm(prev => ({
                                              ...prev,
                                              icdCodes: [...prev.icdCodes, { ...prev.currentIcd }],
                                              currentIcd: {
                                                code: "",
                                                description: "",
                                                type: "DX",
                                                isPrimary: false,
                                              }
                                            }));
                                          }
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

                    {/* Subscriber Information (when different from patient) */}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="subscriberFirstName">Subscriber First Name *</Label>
                                <Input
                                  id="subscriberFirstName"
                                  value={verificationForm.subscriberFirstName}
                                  onChange={(e) => setVerificationForm(prev => ({ ...prev, subscriberFirstName: e.target.value }))}
                                  placeholder="First name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="subscriberLastName">Subscriber Last Name *</Label>
                                <Input
                                  id="subscriberLastName"
                                  value={verificationForm.subscriberLastName}
                                  onChange={(e) => setVerificationForm(prev => ({ ...prev, subscriberLastName: e.target.value }))}
                                  placeholder="Last name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="subscriberDOB">Subscriber DOB *</Label>
                                <Input
                                  id="subscriberDOB"
                                  type="date"
                                  value={verificationForm.subscriberDOB}
                                  onChange={(e) => setVerificationForm(prev => ({ ...prev, subscriberDOB: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="subscriberRelationship">Relationship to Patient *</Label>
                                <Select
                                  value={verificationForm.subscriberRelationship}
                                  onValueChange={(value) => setVerificationForm(prev => ({ ...prev, subscriberRelationship: value }))}
                                >
                                  <SelectTrigger>
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
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Primary Insurance */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          Primary Insurance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                            <Label htmlFor="primaryInsurance">Primary Insurance *</Label>
                            <Select 
                              value={verificationForm.primaryInsurance} 
                              onValueChange={(value) => setVerificationForm(prev => ({ ...prev, primaryInsurance: value }))}
                            >
                        <SelectTrigger>
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
                            <Label htmlFor="insuranceId">Insurance ID (Subscriber ID) *</Label>
                      <Input
                              id="insuranceId"
                              value={verificationForm.insuranceId}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, insuranceId: e.target.value }))}
                              placeholder="Enter subscriber/member ID"
                      />
                    </div>
                    <div>
                            <Label htmlFor="groupNumber">Group Number</Label>
                      <Input
                              id="groupNumber"
                              value={verificationForm.groupNumber}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, groupNumber: e.target.value }))}
                              placeholder="Enter group number"
                      />
                    </div>
                    <div>
                            <Label htmlFor="insurancePlan">Insurance Plan</Label>
                    <Input
                              id="insurancePlan"
                              value={verificationForm.insurancePlan}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, insurancePlan: e.target.value }))}
                              placeholder="Enter plan name"
                    />
                  </div>
                    <div>
                            <Label htmlFor="planType">Plan Type</Label>
                            <Select 
                              value={verificationForm.planType} 
                              onValueChange={(value) => setVerificationForm(prev => ({ ...prev, planType: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select plan type" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                            <Label htmlFor="effectiveDate">Effective Date</Label>
                      <Input
                              id="effectiveDate"
                              type="date"
                              value={verificationForm.effectiveDate}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                              placeholder="Coverage start date"
                      />
                    </div>
                    <div>
                            <Label htmlFor="terminationDate">Termination Date</Label>
                      <Input
                              id="terminationDate"
                              type="date"
                              value={verificationForm.terminationDate}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, terminationDate: e.target.value }))}
                              placeholder="Coverage end date"
                      />
                    </div>
                    <div>
                            <Label htmlFor="inNetworkStatus">In Network Status</Label>
                            <Select 
                              value={verificationForm.inNetworkStatus} 
                              onValueChange={(value) => setVerificationForm(prev => ({ ...prev, inNetworkStatus: value }))}
                            >
                        <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                                <SelectItem value="in-network">In Network</SelectItem>
                                <SelectItem value="out-of-network">Out of Network</SelectItem>
                                <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                      </CardContent>
                    </Card>

                    {/* Secondary Insurance (moved up to be included before calculation) */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building className="h-5 w-5 text-blue-600" />
                          Secondary Insurance (Optional)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="secondaryInsuranceName">Sec. Ins Name</Label>
                            <Select 
                              value={verificationForm.secondaryInsuranceName} 
                              onValueChange={(value) => setVerificationForm(prev => ({ ...prev, secondaryInsuranceName: value }))}
                            >
                              <SelectTrigger>
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
                            <Label htmlFor="secondaryCoveragePercent">Secondary Coverage (%)</Label>
                            <Input
                              id="secondaryCoveragePercent"
                              type="number"
                              step="0.01"
                              value={verificationForm.secondaryCoveragePercent}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, secondaryCoveragePercent: e.target.value }))}
                              placeholder="e.g., 40"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Coverage Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Coverage Details & Cost Sharing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* QMB and Coverage Service Flags - Radio Buttons */}
                        <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div>
                            <Label className="text-base font-semibold mb-3 block">
                              QMB Status (Qualified Medicare Beneficiary)
                            </Label>
                            <div className="flex items-center space-x-6">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="qmb-yes"
                                  name="qmb-status"
                                  checked={verificationForm.isQMB === true}
                                  onChange={() => setVerificationForm(prev => ({ ...prev, isQMB: true }))}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="qmb-yes" className="cursor-pointer font-medium">
                                  Yes (QMB Patient)
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="qmb-no"
                                  name="qmb-status"
                                  checked={verificationForm.isQMB === false}
                                  onChange={() => setVerificationForm(prev => ({ ...prev, isQMB: false }))}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="qmb-no" className="cursor-pointer font-medium">
                                  No
                                </Label>
                              </div>
                            </div>
                          </div>
                          
                          {(() => {
                            const strIncludesMedicare = (s?: string) => (s || '').toLowerCase().includes('medicare');
                            const medicareRecognized = verificationForm.planType === 'Medicare' 
                              || strIncludesMedicare(verificationForm.primaryInsurance)
                              || strIncludesMedicare(verificationForm.insurancePlan)
                              || strIncludesMedicare(verificationForm.groupNumber);
                            return verificationForm.isQMB ? (
                            <>
                              <div>
                                <Label className="text-base font-semibold mb-3 block">
                                  Is this a Medicare Covered Service?
                                </Label>
                                <div className="flex items-center space-x-6">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="covered-yes"
                                      name="covered-service"
                                      checked={verificationForm.isCoveredService === true}
                                      onChange={() => setVerificationForm(prev => ({ ...prev, isCoveredService: true }))}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Label htmlFor="covered-yes" className="cursor-pointer font-medium">
                                      Yes (Covered)
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="covered-no"
                                      name="covered-service"
                                      checked={verificationForm.isCoveredService === false}
                                      onChange={() => setVerificationForm(prev => ({ ...prev, isCoveredService: false }))}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Label htmlFor="covered-no" className="cursor-pointer font-medium">
                                      No (Not Covered)
                                    </Label>
                                  </div>
                                </div>
                              </div>
                              <Alert className="mt-3">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  <strong>Federal Law:</strong> QMB patients cannot be billed for Medicare-covered services. If service is covered, patient responsibility will automatically be $0.00.
                                </AlertDescription>
                              </Alert>
                              {!medicareRecognized && (
                                <Alert className="mt-2 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                  <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-200">
                                    QMB is selected, but the primary plan is not recognized as Medicare. Select Plan Type "Medicare" or choose the Medicare payer so the $0 responsibility rule can apply.
                                  </AlertDescription>
                                </Alert>
                              )}
                            </>
                            ) : null;
                          })()}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor="coPay">Co-pay</Label>
                            <Input
                              id="coPay"
                              type="number"
                              step="0.01"
                              value={verificationForm.coPay}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, coPay: e.target.value }))}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="coInsurance">Co-Insurance (%)</Label>
                            <Input
                              id="coInsurance"
                              type="number"
                              step="0.01"
                              value={verificationForm.coInsurance}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, coInsurance: e.target.value }))}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="deductibleStatus">Deductible Status</Label>
                            <Select
                              value={verificationForm.deductibleStatus}
                              onValueChange={(value) => setVerificationForm(prev => ({ ...prev, deductibleStatus: value as "Met" | "Not Met", deductibleAmount: value === "Met" ? "0" : prev.deductibleAmount }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
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
                              value={verificationForm.deductibleAmount || (verificationForm.deductibleStatus === "Met" ? "0" : "")}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, deductibleAmount: e.target.value }))}
                              placeholder="0.00"
                              disabled={verificationForm.deductibleStatus === "Met"}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {verificationForm.deductibleStatus === "Met" ? "Deductible met – amount locked at $0" : "Enter a positive amount"}
                            </p>
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
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>


                    {/* Referral & Authorization */}
              <Card>
                <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-blue-600" />
                          Referral & Authorization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="referralRequired"
                            checked={verificationForm.referralRequired}
                            onCheckedChange={(checked) => setVerificationForm(prev => ({ ...prev, referralRequired: checked as boolean }))}
                          />
                          <Label htmlFor="referralRequired" className="cursor-pointer">Referral Required</Label>
                        </div>

                        {verificationForm.referralRequired && (
                          <div className="ml-6 space-y-4 border-l-2 pl-4">
                  <div>
                              <Label htmlFor="referralObtainedFrom">Obtain From</Label>
                              <Select 
                                value={verificationForm.referralObtainedFrom} 
                                onValueChange={(value) => setVerificationForm(prev => ({ ...prev, referralObtainedFrom: value }))}
                              >
                      <SelectTrigger>
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
                                  <SelectTrigger>
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
                              />
                            </div>
                </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="preAuthorizationRequired"
                            checked={verificationForm.preAuthorizationRequired}
                            onCheckedChange={(checked) => setVerificationForm(prev => ({ ...prev, preAuthorizationRequired: checked as boolean }))}
                          />
                          <Label htmlFor="preAuthorizationRequired" className="cursor-pointer">Pre-Authorization Required</Label>
                        </div>

                        {verificationForm.preAuthorizationRequired && (
                          <div className="ml-6 space-y-4 border-l-2 pl-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="priorAuthNumber">Prior Authorization Number</Label>
                                <Input
                                  id="priorAuthNumber"
                                  value={verificationForm.priorAuthNumber}
                                  onChange={(e) => setVerificationForm(prev => ({ ...prev, priorAuthNumber: e.target.value }))}
                                  placeholder="Enter prior auth number"
                                />
                              </div>
                              <div>
                                <Label htmlFor="priorAuthStatus">Prior Auth Status</Label>
                                <Select
                                  value={verificationForm.priorAuthStatus}
                                  onValueChange={(value) => setVerificationForm(prev => ({ ...prev, priorAuthStatus: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="denied">Denied</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                              className="bg-muted font-semibold"
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
                          let calculationBreakdown = {
                            currentVisitCharges: currentVisitCharges,
                            allowedAmount: allowedAmount,
                            contractualWriteOff: Math.max(0, currentVisitCharges - allowedAmount),
                            copay: 0,
                            deductibleApplied: 0,
                            remainingAfterDeductible: 0,
                            coinsurance: 0,
                            insurancePays: 0,
                            secondaryPays: 0,
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
                          if (verificationForm.isQMB && verificationForm.isCoveredService && isMedicarePlan) {
                            // QMB Patient - Federal law: $0 responsibility for Medicare covered services
                            calculationBreakdown.isQMBZeroed = true;
                            patientResponsibility = 0;
                            calculationBreakdown.finalPatientResponsibility = 0;
                          } else {
                            // Normal Calculation Flow
                            // Step 1: Start with Allowed Amount (or billed if no allowed amount)
                            const baseAmount = allowedAmount > 0 ? allowedAmount : currentVisitCharges;
                            calculationBreakdown.allowedAmount = baseAmount;

                            // Step 2: Apply Copay first
                            calculationBreakdown.copay = Math.min(copay, baseAmount);
                            let remainingAfterCopay = Math.max(0, baseAmount - calculationBreakdown.copay);

                            // Step 3: Apply Deductible
                            if (deductibleAmount > 0) {
                              calculationBreakdown.deductibleApplied = Math.min(remainingAfterCopay, deductibleAmount);
                              calculationBreakdown.remainingAfterDeductible = Math.max(0, remainingAfterCopay - calculationBreakdown.deductibleApplied);
                            } else {
                              calculationBreakdown.remainingAfterDeductible = remainingAfterCopay;
                            }

                            // Step 4: Apply Coinsurance
                            if (coinsurancePercent > 0 && calculationBreakdown.remainingAfterDeductible > 0) {
                              calculationBreakdown.coinsurance = (calculationBreakdown.remainingAfterDeductible * coinsurancePercent) / 100;
                              calculationBreakdown.insurancePays = calculationBreakdown.remainingAfterDeductible - calculationBreakdown.coinsurance;
                            } else {
                              calculationBreakdown.insurancePays = calculationBreakdown.remainingAfterDeductible;
                            }

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
                              const secondaryShare = secondaryPercent > 0
                                ? (calculationBreakdown.finalPatientResponsibility * secondaryPercent) / 100
                                : 0;
                              calculationBreakdown.secondaryPays = Math.min(
                                calculationBreakdown.finalPatientResponsibility,
                                Math.max(0, secondaryShare)
                              );
                              calculationBreakdown.finalPatientResponsibility = Math.max(0, calculationBreakdown.finalPatientResponsibility - calculationBreakdown.secondaryPays);
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
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>

                    {/* Additional Information */}
              <Card>
                <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div>
                          <Label htmlFor="remarks">Remarks</Label>
                          <Textarea
                            id="remarks"
                            value={verificationForm.remarks}
                            onChange={(e) => setVerificationForm(prev => ({ ...prev, remarks: e.target.value }))}
                            placeholder="Enter any additional remarks or notes..."
                            rows={4}
                          />
                  </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                            <Label htmlFor="dateChecked">Date Checked</Label>
                    <Input
                              id="dateChecked"
                              type="date"
                              value={verificationForm.dateChecked}
                              onChange={(e) => setVerificationForm(prev => ({ ...prev, dateChecked: e.target.value }))}
                            />
                  </div>
                          <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                              id="demographicChangesMade"
                              checked={verificationForm.demographicChangesMade}
                              onCheckedChange={(checked) => setVerificationForm(prev => ({ ...prev, demographicChangesMade: checked as boolean }))}
                            />
                            <Label htmlFor="demographicChangesMade" className="cursor-pointer">Demographic Changes Made</Label>
                  </div>
                          <div className="flex items-center space-x-2 pt-6">
                            <Checkbox
                              id="qa"
                              checked={verificationForm.qa}
                              onCheckedChange={(checked) => setVerificationForm(prev => ({ ...prev, qa: checked as boolean }))}
                            />
                            <Label htmlFor="qa" className="cursor-pointer">QA</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowFormDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleVerifyEligibility} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Eligibility
                    </>
                  )}
                </Button>
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
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={exportHistory} disabled={verificationHistory.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Dashboard View - Default view with filters and statistics */}
      {/* Filter Groups */}
      <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Group 1: Date of service, Patient, No appointment */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter By</Label>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={filterGroup1 === "dateOfService" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterGroup1("dateOfService")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Date of Service
                  </Button>
                  <Button
                    variant={filterGroup1 === "patient" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterGroup1("patient")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Patient
                  </Button>
                  <Button
                    variant={filterGroup1 === "noAppointment" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterGroup1("noAppointment")}
                  >
                    No Appointment
                  </Button>
                </div>
                {/* Conditional dropdowns for Filter By */}
                {filterGroup1 === "dateOfService" && (
                  <div className="mt-3">
                    <Label className="text-xs text-muted-foreground mb-1 block">Select Date</Label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full sm:w-48"
                    />
                  </div>
                )}
                {filterGroup1 === "patient" && (
                  <div className="mt-3">
                    <Label className="text-xs text-muted-foreground mb-1 block">Select Patient</Label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient} disabled={isLoadingPatients}>
                      <SelectTrigger className="w-full sm:w-64">
                        <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Select patient"} />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingPatients ? (
                          <SelectItem value="loading" disabled>Loading patients...</SelectItem>
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
                  </div>
                )}
              </div>

              {/* Group 2: Year, month, biweekly, weekly, today, tomorrow, etc. */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Time Period</Label>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={filterGroup2 === "year" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterGroup2("year")}
                  >
                    Year
                  </Button>
                  <Button
                    variant={filterGroup2 === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterGroup2("month")}
                  >
                    Month
                  </Button>
                  <Button
                    variant={filterGroup2 === "biweekly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterGroup2("biweekly")}
                  >
                    Biweekly
                  </Button>
                  <Button
                    variant={filterGroup2 === "weekly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterGroup2("weekly")}
                  >
                    Weekly
                  </Button>
                  <Button
                    variant={filterGroup2 === "today" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterGroup2("today")}
                  >
                    Today
                  </Button>
                  <Button
                    variant={filterGroup2 === "tomorrow" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterGroup2("tomorrow")}
                  >
                    Tomorrow
                  </Button>
                  <Button
                    variant={filterGroup2 === "custom" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterGroup2("custom")}
                  >
                    Custom Range
                  </Button>
                </div>
                {/* Conditional dropdowns for Time Period */}
                {filterGroup2 === "year" && (
                  <div className="mt-3">
                    <Label className="text-xs text-muted-foreground mb-1 block">Select Year</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {filterGroup2 === "month" && (
                  <div className="mt-3 flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-[120px]">
                      <Label className="text-xs text-muted-foreground mb-1 block">Select Year</Label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {yearOptions.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <Label className="text-xs text-muted-foreground mb-1 block">Select Month</Label>
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {monthOptions.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {filterGroup2 === "custom" && (
                  <div className="mt-3 flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-[150px]">
                      <Label className="text-xs text-muted-foreground mb-1 block">Start Date</Label>
                      <Input
                        type="date"
                        value={customRangeStart}
                        onChange={(e) => setCustomRangeStart(e.target.value)}
                      />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <Label className="text-xs text-muted-foreground mb-1 block">End Date</Label>
                      <Input
                        type="date"
                        value={customRangeEnd}
                        onChange={(e) => setCustomRangeEnd(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Group 3: Checked and Unchecked */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="checked"
                      checked={filterGroup3.checked}
                      onCheckedChange={(checked) => 
                        setFilterGroup3(prev => ({ ...prev, checked: checked as boolean }))
                      }
                    />
                    <Label htmlFor="checked" className="cursor-pointer">Checked</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="unchecked"
                      checked={filterGroup3.unchecked}
                      onCheckedChange={(checked) => 
                        setFilterGroup3(prev => ({ ...prev, unchecked: checked as boolean }))
                      }
                    />
                    <Label htmlFor="unchecked" className="cursor-pointer">Unchecked</Label>
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
                <p className="text-sm font-medium text-muted-foreground">Not Eligible</p>
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
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Verification History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by patient ID or payer..."
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
                    <SelectItem value="ineligible">Not Eligible</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={expandAll}>Expand all</Button>
                  <Button variant="outline" onClick={collapseAll}>Collapse all</Button>
                </div>
              </div>

              {filteredHistory.length > 0 ? (
                <div className="space-y-3">
                  {filteredHistory.map((entry) => (
                    <HoverCard key={entry.id}>
                      <HoverCardTrigger asChild>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-default" onClick={() => toggleRow(entry.id)}>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {entry.isEligible ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              <span className="font-medium">Patient {entry.patientId}</span>
                            </div>
                            <Badge variant="outline">{entry.payerId}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-muted-foreground">
                              Copay: ${entry.coverage.copay} • Ded: ${entry.coverage.deductible}
                            </div>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(entry); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); reverifyEntry(entry); }} disabled={verifyingIds.includes(entry.id)}>
                              {verifyingIds.includes(entry.id) ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); duplicateToForm(entry); }}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent align="start" className="w-96">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{entry.payerId}</span>
                            <Badge variant="secondary">{entry.isEligible ? 'Eligible' : 'Not Eligible'}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div>
                              <div className="font-medium text-foreground">Patient</div>
                              <div>{entry.patientId}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Date</div>
                              <div>{new Date(entry.timestamp).toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Plan</div>
                              <div>{entry.planType || '—'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Network</div>
                              <div>{entry.inNetworkStatus || '—'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Copay</div>
                              <div>${entry.coverage.copay}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Deductible</div>
                              <div>${entry.coverage.deductible}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Coinsurance</div>
                              <div>{entry.coverage.coinsurance}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Effective</div>
                              <div>{entry.effectiveDate || '—'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Termination</div>
                              <div>{entry.terminationDate || '—'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">OOP Max</div>
                              <div>{entry.outOfPocketMax || '—'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">OOP Remaining</div>
                              <div>{entry.outOfPocketRemaining || '—'}</div>
                            </div>
                          </div>
                          <div className="pt-2 flex justify-end">
                            <Button size="sm" onClick={() => openEdit(entry)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </Button>
                          </div>
                        </div>
                      </HoverCardContent>
                      {expandedRows.includes(entry.id) && (
                        <div className="mt-2 border rounded-lg p-3 text-sm text-muted-foreground">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <div>
                              <div className="font-medium text-foreground">S.No</div>
                              <div>{entry.serialNo || '—'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Appointment Location</div>
                              <div>{entry.appointmentLocation || '—'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">DOS / Appointment Date</div>
                              <div>{entry.appointmentDate || '—'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Type of Visit</div>
                              <div>{entry.typeOfVisit || '—'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Patient Name</div>
                              <div>{entry.patientName || entry.patientId}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Total Collectible</div>
                              <div>${(entry.estimatedResponsibility ?? entry.totalCollectible ?? ((entry.coverage?.copay ?? 0) + (entry.coverage?.deductible ?? 0)))}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Insurance Name</div>
                              <div>{entry.payerId}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Active</div>
                              <div>{entry.isEligible ? 'Yes' : 'No'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Network Status</div>
                              <div>{entry.inNetworkStatus || '—'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Copay</div>
                              <div>${entry.coverage?.copay ?? 0}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Co-insurance</div>
                              <div>{entry.coverage?.coinsurance ?? '—'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Deductible Met</div>
                              <div>{entry.deductibleMet ? 'Met' : 'Not Met'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Member ID</div>
                              <div>{entry.memberId || '—'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Group #</div>
                              <div>{entry.groupNumber || '—'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Out-of-Pocket Max</div>
                              <div>{entry.outOfPocketMax || '—'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">OOP Remaining</div>
                              <div>{entry.outOfPocketRemaining || '—'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Referral Required</div>
                              <div>{entry.referralRequired ? 'Yes' : 'No'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Prior Auth Required</div>
                              <div>{entry.preAuthorizationRequired ? 'Yes' : 'No'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Previous Balance</div>
                              <div>${entry.previousBalanceCredit || '0.00'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">PT Responsibility</div>
                              <div>${entry.patientResponsibility || '0.00'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Current Visit</div>
                              <div>${entry.currentVisitAmount || '0.00'}</div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Contact Via</div>
                              <div>{entry.verificationMethod || '—'}</div>
                            </div>
                            <div className="col-span-2">
                              <div className="font-medium text-foreground">Notes</div>
                              <div>{entry.notes || '—'}</div>
                            </div>
                          </div>
                          <div className="pt-2 flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => copySummary(entry)}>Copy summary</Button>
                            <Button size="sm" onClick={() => duplicateToForm(entry)}>Duplicate to form</Button>
                          </div>
                        </div>
                      )}
                    </HoverCard>
                  ))}
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
                            style={{ width: `${verificationHistory.length > 0 ? (Number(count) / verificationHistory.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">{String(count)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verificationHistory.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {entry.isEligible ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <span className="font-medium">Patient {entry.patientId}</span>
                        <span className="text-sm text-muted-foreground ml-2">• {entry.payerId}</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
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
    </div>
  );
};

export default EligibilityVerification;
