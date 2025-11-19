import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, Edit, Trash2, Download, Upload, ChevronDown, ChevronUp, ChevronRight, FileText, Hash, DollarSign, Syringe, UserPlus, Circle, Building, MessageSquare, Minus, Package, List, DollarSign as DollarIcon, FilePen, Cloud, Eye, Calendar, Info, X, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Code {
  id: string;
  code: string;
  description: string;
  price: number;
  inactive: boolean;
  type: 'CPT' | 'HCPCS';
  createdAt: string;
  updatedAt: string;
}

const codeMenuItems = [
  {
    id: 'procedure',
    name: 'Procedure',
    icon: Syringe,
    description: 'Manage procedure codes and billing'
  },
  {
    id: 'diagnosis',
    name: 'Diagnosis',
    icon: UserPlus,
    description: 'Manage diagnosis codes and classifications'
  },
  {
    id: 'icd-procedure',
    name: 'ICD Procedure',
    icon: Circle,
    description: 'Manage ICD procedure codes'
  },
  {
    id: 'revenue',
    name: 'Revenue',
    icon: Building,
    description: 'Manage revenue codes and categories'
  },
  {
    id: 'remittance',
    name: 'Remittance',
    icon: MessageSquare,
    description: 'Manage remittance advice codes'
  },
  {
    id: 'adjustment',
    name: 'Adjustment',
    icon: Plus,
    description: 'Manage adjustment codes and types'
  },
  {
    id: 'inventory',
    name: 'Inventory',
    icon: Package,
    description: 'Manage inventory and supply codes'
  },
  {
    id: 'charge-panel',
    name: 'Charge Panel',
    icon: List,
    description: 'Manage charge panel configurations'
  },
  {
    id: 'fee-schedules',
    name: 'Fee Schedules',
    icon: DollarIcon,
    description: 'Manage fee schedules and pricing'
  },
  {
    id: 'contracts',
    name: 'Contracts',
    icon: FilePen,
    description: 'Manage contract codes and terms'
  }
];

const codeTypes = [
  'CPT',
  'ICD-10',
  'HCPCS',
  'DRG',
  'Revenue'
];

const categories = [
  'Evaluation and Management',
  'Emergency Department',
  'Surgery',
  'Radiology',
  'Laboratory',
  'Pathology',
  'Medicine',
  'Anesthesia',
  'Other'
];

const modifiers = [
  '',
  '25',
  '26',
  '50',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '57',
  '58',
  '59',
  '62',
  '66',
  '76',
  '77',
  '78',
  '79',
  '80',
  '81',
  '82',
  '90',
  '91',
  '92',
  '99'
];

export const Codes: React.FC = () => {
  const { toast } = useToast();
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [procedureCodes, setProcedureCodes] = useState<Code[]>([]);
  const [isLoadingProcedureCodes, setIsLoadingProcedureCodes] = useState(false);
  const isFetchingProcedureRef = useRef(false);
  const [diagnosisCodes, setDiagnosisCodes] = useState<Code[]>([]);
  const [isLoadingDiagnosisCodes, setIsLoadingDiagnosisCodes] = useState(false);
  const isFetchingDiagnosisRef = useRef(false);
  const [icdProcedureCodes, setICDProcedureCodes] = useState<Code[]>([]);
  const [isLoadingICDProcedureCodes, setIsLoadingICDProcedureCodes] = useState(false);
  const isFetchingICDProcedureRef = useRef(false);
  const [revenueCodes, setRevenueCodes] = useState<Code[]>([]);
  const [isLoadingRevenueCodes, setIsLoadingRevenueCodes] = useState(false);
  const isFetchingRevenueRef = useRef(false);
  const [remittanceCodes, setRemittanceCodes] = useState<Code[]>([]);
  const [isLoadingRemittanceCodes, setIsLoadingRemittanceCodes] = useState(false);
  const isFetchingRemittanceRef = useRef(false);
  const [adjustmentCodes, setAdjustmentCodes] = useState<Code[]>([]);
  const [isLoadingAdjustmentCodes, setIsLoadingAdjustmentCodes] = useState(false);
  const isFetchingAdjustmentRef = useRef(false);
  const [inventoryCodes, setInventoryCodes] = useState<Code[]>([]);
  const [isLoadingInventoryCodes, setIsLoadingInventoryCodes] = useState(false);
  const isFetchingInventoryRef = useRef(false);
  const [chargePanels, setChargePanels] = useState<Code[]>([]);
  const [isLoadingChargePanels, setIsLoadingChargePanels] = useState(false);
  const isFetchingChargePanelRef = useRef(false);
  const [feeSchedules, setFeeSchedules] = useState<any[]>([]);
  const [isLoadingFeeSchedules, setIsLoadingFeeSchedules] = useState(false);
  const isFetchingFeeScheduleRef = useRef(false);
  const [contracts, setContracts] = useState<Code[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const isFetchingContractRef = useRef(false);
  const [isNewCodeDialogOpen, setIsNewCodeDialogOpen] = useState(false);
  const [isNewDiagnosisDialogOpen, setIsNewDiagnosisDialogOpen] = useState(false);
  const [isNewICDProcedureDialogOpen, setIsNewICDProcedureDialogOpen] = useState(false);
  const [isNewRevenueDialogOpen, setIsNewRevenueDialogOpen] = useState(false);
  const [isNewRemittanceDialogOpen, setIsNewRemittanceDialogOpen] = useState(false);
  const [isNewAdjustmentDialogOpen, setIsNewAdjustmentDialogOpen] = useState(false);
  const [isNewInventoryDialogOpen, setIsNewInventoryDialogOpen] = useState(false);
  const [isNewChargePanelDialogOpen, setIsNewChargePanelDialogOpen] = useState(false);
  const [isNewFeeScheduleDialogOpen, setIsNewFeeScheduleDialogOpen] = useState(false);
  const [isFeeSchedulePreviewOpen, setIsFeeSchedulePreviewOpen] = useState(false);
  const [isNewContractDialogOpen, setIsNewContractDialogOpen] = useState(false);
  const [isContractPreviewOpen, setIsContractPreviewOpen] = useState(false);
  const [isContractBasedDialogOpen, setIsContractBasedDialogOpen] = useState(false);
  const [isMedicareDialogOpen, setIsMedicareDialogOpen] = useState(false);
  const [isPaymentsDialogOpen, setIsPaymentsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState({
    code: '',
    type: 'CPT®/HCPCS',
    dept: '',
    description: '',
    excludeFromDuplicate: false,
    allInclusive: false,
    percentageOfClaim: false,
    defaultPrice: 0.00,
    defaultUnits: 1.00,
    defaultChargeStatus: '',
    revCode: '',
    placeOfService: '',
    cliaNumber: '',
    typeOfService: '',
    narrativeNotes: '',
    additionalDescription: '',
    globalModifier1: '',
    globalModifier2: '',
    globalModifier3: '',
    globalModifier4: '',
    icd1: '',
    icd2: '',
    icd3: '',
    icd4: '',
    globalSurgeryPeriod: 'None',
    priorAuthRequirements: 'None',
    drugPrice: 0.00,
    drugUnits: 1.00,
    drugUnitsMeasure: 'Unit (UN)',
    drugCode: '',
    drugCodeFormat: '',
    effectiveDate: '',
    terminationDate: '',
    printOnSuperbills: false,
    category: '',
    statementDescription: ''
  });

  const [newDiagnosis, setNewDiagnosis] = useState({
    code: '',
    codeType: 'ICD-10',
    description: '',
    effectiveDate: '',
    terminationDate: '',
    cpt1: '',
    cpt2: '',
    cpt3: '',
    cpt4: '',
    cpt5: '',
    cpt6: '',
    printOnSuperbill: false,
    superbillDescription: ''
  });

  const [newICDProcedure, setNewICDProcedure] = useState({
    code: '',
    codeType: 'ICD-10',
    description: ''
  });

  const [newRevenue, setNewRevenue] = useState({
    code: '',
    price: 0.00,
    excludeFromDuplicate: false,
    description: '',
    statementDescription: ''
  });

  const [newRemittance, setNewRemittance] = useState({
    code: '',
    type: 'Adj Reason',
    informationLevel: 'INFO - This code represents general information only.',
    includeOnDenialReports: false,
    includeOnAdjustmentReports: false,
    reportDescription: '',
    longDescription: '',
    useMemoline: false
  });

  const [newAdjustment, setNewAdjustment] = useState({
    code: '',
    adjustmentType: 'Credit',
    description: ''
  });

  const [newInventory, setNewInventory] = useState({
    code: '',
    procedureCode: '',
    quantity: 0,
    codeDescription: '',
    billingDescription: '',
    useAlert: false
  });

  const [newChargePanel, setNewChargePanel] = useState({
    title: '',
    code: 'CP001',
    type: 'Professional',
    description: '',
    codeDetails: [{
      id: '1',
      code: '',
      pos: '',
      tos: '',
      modifierOptions: 'Code Defaults',
      modifier1: '',
      modifier2: '',
      modifier3: '',
      modifier4: '',
      price: 'Code Default',
      units: '0.00',
      total: '',
      other: 'Other',
      delete: false
    }]
  });

  const [newContract, setNewContract] = useState({
    priceCreationMethod: 'empty'
  });

  const [newFeeSchedule, setNewFeeSchedule] = useState({
    priceCreationMethod: 'empty'
  });

  const [anotherFeeScheduleSettings, setAnotherFeeScheduleSettings] = useState({
    selectedFeeSchedules: [],
    priceAdjustment: 'increase',
    increaseBy: '0.00',
    decreaseBy: '0.00',
    adjustTo: '1.0000',
    adjustToPercent: '100.00',
    roundUp: false
  });

  const [feeSchedulePreview, setFeeSchedulePreview] = useState({
    name: '',
    effectiveFrom: '',
    effectiveTo: '',
    sequenceNumber: 'NEW',
    description: '',
    procedures: []
  });

  const [contractPreview, setContractPreview] = useState({
    name: '',
    type: 'FFS',
    sequenceNumber: 'NEW',
    allowUsersToUpdatePrices: true,
    procedures: [
      { id: '1', code: '71271', price: '0.00', description: 'CT THORAX LUNG CANCER SCR C-', type: 'Procedure', exclude: false },
      { id: '2', code: '76536', price: '0.00', description: 'US EXAM OF HEAD AND NECK', type: 'Procedure', exclude: false },
      { id: '3', code: '76705', price: '0.00', description: 'ECHO EXAM OF ABDOMEN', type: 'Procedure', exclude: false },
      { id: '4', code: '76770', price: '0.00', description: 'US EXAM ABDO BACK WALL COMP', type: 'Procedure', exclude: false },
      { id: '5', code: '76856', price: '0.00', description: 'US EXAM PELVIC COMPLETE', type: 'Procedure', exclude: false },
      { id: '6', code: '76857', price: '0.00', description: 'US EXAM PELVIC LIMITED', type: 'Procedure', exclude: false },
      { id: '7', code: '76870', price: '0.00', description: 'US EXAM SCROTUM', type: 'Procedure', exclude: false },
      { id: '8', code: '77063', price: '0.00', description: 'BREAST TOMOSYNTHESIS BI', type: 'Procedure', exclude: false },
      { id: '9', code: '77067', price: '0.00', description: 'SCR MAMMO BI INCL CAD', type: 'Procedure', exclude: false },
      { id: '10', code: '93306', price: '0.00', description: 'TTE W/DOPPLER COMPLETE', type: 'Procedure', exclude: false },
      { id: '11', code: '93880', price: '0.00', description: 'EXTRACRANIAL BILAT STUDY', type: 'Procedure', exclude: false },
      { id: '12', code: '93978', price: '0.00', description: 'VASCULAR STUDY', type: 'Procedure', exclude: false }
    ]
  });

  const [contractBasedSettings, setContractBasedSettings] = useState({
    contractMethod: 'maximum-price', // 'maximum-price' or 'specific-contract'
    selectedContract: '',
    priceAdjustment: 'increase',
    increaseBy: '0.00',
    decreaseBy: '0.00',
    adjustTo: '1.0000',
    adjustToPercent: '100.00',
    roundUp: false
  });

  const [medicareSettings, setMedicareSettings] = useState({
    feeScheduleYear: '2025',
    carrierMethod: 'zip-code',
    zipCode: '',
    carrier: '',
    locality: '',
    pricingMethod: 'non-facility',
    includeNonApplicable: false,
    priceAdjustment: 'no-adjustment',
    increaseBy: '0.00',
    decreaseBy: '0.00',
    adjustTo: '1.0000',
    adjustToPercent: '100.00',
    roundUp: false
  });

  const [chargesBasedSettings, setChargesBasedSettings] = useState({
    days: '180',
    priceAdjustment: 'increase',
    increaseBy: '0.00',
    decreaseBy: '0.00',
    adjustTo: '1.0000',
    adjustToPercent: '100.00',
    roundUp: false
  });

  const [paymentsSettings, setPaymentsSettings] = useState({
    selectedPayer: '',
    days: '90'
  });

  const [importSettings, setImportSettings] = useState({
    selectedFile: null as File | null,
    fileName: '',
    priceAdjustment: 'increase',
    increaseBy: '0.00',
    decreaseBy: '0.00',
    adjustTo: '1.0000',
    adjustToPercent: '100.00',
    roundUp: false
  });

  const handleMenuItemClick = (menuItemId: string) => {
    setSelectedMenuItem(menuItemId);
    // Fetch procedure codes when procedure menu is selected
    if (menuItemId === 'procedure') {
      fetchProcedureCodesFromDatabase();
    }
    // Fetch diagnosis codes when diagnosis menu is selected
    if (menuItemId === 'diagnosis') {
      fetchDiagnosisCodesFromDatabase();
    }
    // Fetch ICD Procedure codes when icd-procedure menu is selected
    if (menuItemId === 'icd-procedure') {
      fetchICDProcedureCodesFromDatabase();
    }
    // Fetch Revenue codes when revenue menu is selected
    if (menuItemId === 'revenue') {
      fetchRevenueCodesFromDatabase();
    }
    // Fetch Remittance codes when remittance menu is selected
    if (menuItemId === 'remittance') {
      fetchRemittanceCodesFromDatabase();
    }
    // Fetch Adjustment codes when adjustment menu is selected
    if (menuItemId === 'adjustment') {
      fetchAdjustmentCodesFromDatabase();
    }
    // Fetch Inventory codes when inventory menu is selected
    if (menuItemId === 'inventory') {
      fetchInventoryCodesFromDatabase();
    }
    // Fetch Charge Panels when charge-panel menu is selected
    if (menuItemId === 'charge-panel') {
      fetchChargePanelsFromDatabase();
    }
    // Fetch Contracts when contracts menu is selected
    if (menuItemId === 'contracts') {
      fetchContractsFromDatabase();
    }
    // Fetch Fee Schedules when fee-schedules menu is selected
    if (menuItemId === 'fee-schedules') {
      fetchFeeSchedulesFromDatabase();
    }
  };

  // Fetch Procedure codes (CPT/HCPCS) from database
  const fetchProcedureCodesFromDatabase = async () => {
    if (isFetchingProcedureRef.current) {
      return;
    }

    try {
      isFetchingProcedureRef.current = true;
      setIsLoadingProcedureCodes(true);
      console.log('🔍 Fetching CPT/HCPCS procedure codes from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch procedure codes.');
        setProcedureCodes([]);
        setIsLoadingProcedureCodes(false);
        isFetchingProcedureRef.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('cpt_hcpcs_codes' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching CPT/HCPCS codes:', error);
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('⚠️ CPT/HCPCS codes table not found. Please run CREATE_CPT_HCPCS_CODES_TABLE.sql');
          toast({
            title: 'Table Not Found',
            description: 'CPT/HCPCS codes table does not exist. Please run the SQL setup script.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading CPT/HCPCS codes',
            description: error.message,
            variant: 'destructive',
          });
        }
        setProcedureCodes([]);
        return;
      }

      // Transform database records to match Code interface
      const transformedCodes: Code[] = (data || []).map((dbCode: any) => ({
        id: dbCode.id,
        code: dbCode.code || '',
        description: dbCode.description || dbCode.superbill_description || '',
        price: dbCode.default_price ? parseFloat(dbCode.default_price) : 0.00,
        inactive: !(dbCode.is_active || dbCode.status === 'active'),
        type: (dbCode.type === 'CPT' || dbCode.type === 'HCPCS') ? dbCode.type : 'CPT' as 'CPT' | 'HCPCS',
        createdAt: dbCode.created_at || '',
        updatedAt: dbCode.updated_at || dbCode.created_at || ''
      }));

      console.log(`✅ Successfully loaded ${transformedCodes.length} CPT/HCPCS procedure codes from database`);
      setProcedureCodes(transformedCodes);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchProcedureCodesFromDatabase:', error);
      toast({
        title: 'Error loading CPT/HCPCS codes',
        description: error.message || 'Failed to load CPT/HCPCS codes from database',
        variant: 'destructive',
      });
      setProcedureCodes([]);
    } finally {
      setIsLoadingProcedureCodes(false);
      isFetchingProcedureRef.current = false;
    }
  };

  // Fetch Remittance codes from database
  const fetchRemittanceCodesFromDatabase = async () => {
    if (isFetchingRemittanceRef.current) {
      return;
    }

    try {
      isFetchingRemittanceRef.current = true;
      setIsLoadingRemittanceCodes(true);
      console.log('🔍 Fetching Remittance codes from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch Remittance codes.');
        setRemittanceCodes([]);
        setIsLoadingRemittanceCodes(false);
        isFetchingRemittanceRef.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('remittance_codes' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching Remittance codes:', error);
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('⚠️ Remittance codes table not found. Please run CREATE_REMITTANCE_CODES_TABLE.sql');
          toast({
            title: 'Table Not Found',
            description: 'Remittance codes table does not exist. Please run the SQL setup script.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading Remittance codes',
            description: error.message,
            variant: 'destructive',
          });
        }
        setRemittanceCodes([]);
        return;
      }

      // Transform database records to match Code interface
      const transformedCodes: Code[] = (data || []).map((dbCode: any) => ({
        id: dbCode.id,
        code: dbCode.code || '',
        description: dbCode.report_description || dbCode.long_description || '',
        price: 0.00, // Remittance codes don't have prices
        inactive: !(dbCode.is_active || dbCode.status === 'active'),
        type: 'HCPCS' as 'CPT' | 'HCPCS', // Default type for Remittance codes
        createdAt: dbCode.created_at || '',
        updatedAt: dbCode.updated_at || dbCode.created_at || ''
      }));

      console.log(`✅ Successfully loaded ${transformedCodes.length} Remittance codes from database`);
      setRemittanceCodes(transformedCodes);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchRemittanceCodesFromDatabase:', error);
      toast({
        title: 'Error loading Remittance codes',
        description: error.message || 'Failed to load Remittance codes from database',
        variant: 'destructive',
      });
      setRemittanceCodes([]);
    } finally {
      setIsLoadingRemittanceCodes(false);
      isFetchingRemittanceRef.current = false;
    }
  };

  // Fetch Revenue codes from database
  const fetchRevenueCodesFromDatabase = async () => {
    if (isFetchingRevenueRef.current) {
      return;
    }

    try {
      isFetchingRevenueRef.current = true;
      setIsLoadingRevenueCodes(true);
      console.log('🔍 Fetching Revenue codes from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch Revenue codes.');
        setRevenueCodes([]);
        setIsLoadingRevenueCodes(false);
        isFetchingRevenueRef.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('revenue_codes' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching Revenue codes:', error);
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('⚠️ Revenue codes table not found. Please run CREATE_REVENUE_CODES_TABLE.sql');
          toast({
            title: 'Table Not Found',
            description: 'Revenue codes table does not exist. Please run the SQL setup script.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading Revenue codes',
            description: error.message,
            variant: 'destructive',
          });
        }
        setRevenueCodes([]);
        return;
      }

      // Transform database records to match Code interface
      const transformedCodes: Code[] = (data || []).map((dbCode: any) => ({
        id: dbCode.id,
        code: dbCode.code || '',
        description: dbCode.description || '',
        price: dbCode.price ? parseFloat(dbCode.price) : 0.00,
        inactive: !(dbCode.is_active || dbCode.status === 'active'),
        type: 'Revenue' as any, // Revenue codes have their own type
        createdAt: dbCode.created_at || '',
        updatedAt: dbCode.updated_at || dbCode.created_at || ''
      }));

      console.log(`✅ Successfully loaded ${transformedCodes.length} Revenue codes from database`);
      setRevenueCodes(transformedCodes);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchRevenueCodesFromDatabase:', error);
      toast({
        title: 'Error loading Revenue codes',
        description: error.message || 'Failed to load Revenue codes from database',
        variant: 'destructive',
      });
      setRevenueCodes([]);
    } finally {
      setIsLoadingRevenueCodes(false);
      isFetchingRevenueRef.current = false;
    }
  };

  // Fetch ICD Procedure codes from database
  const fetchICDProcedureCodesFromDatabase = async () => {
    if (isFetchingICDProcedureRef.current) {
      return;
    }

    try {
      isFetchingICDProcedureRef.current = true;
      setIsLoadingICDProcedureCodes(true);
      console.log('🔍 Fetching ICD Procedure codes from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch ICD Procedure codes.');
        setICDProcedureCodes([]);
        setIsLoadingICDProcedureCodes(false);
        isFetchingICDProcedureRef.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('icd_procedure_codes' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching ICD Procedure codes:', error);
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('⚠️ ICD Procedure codes table not found. Please run CREATE_ICD_PROCEDURE_CODES_TABLE.sql');
          toast({
            title: 'Table Not Found',
            description: 'ICD Procedure codes table does not exist. Please run the SQL setup script.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading ICD Procedure codes',
            description: error.message,
            variant: 'destructive',
          });
        }
        setICDProcedureCodes([]);
        return;
      }

      // Transform database records to match Code interface
      const transformedCodes: Code[] = (data || []).map((dbCode: any) => ({
        id: dbCode.id,
        code: dbCode.code || '',
        description: dbCode.description || '',
        price: 0.00, // ICD Procedure codes don't have prices
        inactive: !(dbCode.is_active || dbCode.status === 'active'),
        type: 'HCPCS' as 'CPT' | 'HCPCS', // Default type for ICD Procedure codes
        createdAt: dbCode.created_at || '',
        updatedAt: dbCode.updated_at || dbCode.created_at || ''
      }));

      console.log(`✅ Successfully loaded ${transformedCodes.length} ICD Procedure codes from database`);
      setICDProcedureCodes(transformedCodes);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchICDProcedureCodesFromDatabase:', error);
      toast({
        title: 'Error loading ICD Procedure codes',
        description: error.message || 'Failed to load ICD Procedure codes from database',
        variant: 'destructive',
      });
      setICDProcedureCodes([]);
    } finally {
      setIsLoadingICDProcedureCodes(false);
      isFetchingICDProcedureRef.current = false;
    }
  };

  // Fetch diagnosis codes from database
  // Fetch Adjustment codes from database
  const fetchAdjustmentCodesFromDatabase = async () => {
    if (isFetchingAdjustmentRef.current) {
      return;
    }

    try {
      isFetchingAdjustmentRef.current = true;
      setIsLoadingAdjustmentCodes(true);
      console.log('🔍 Fetching Adjustment codes from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch Adjustment codes.');
        setAdjustmentCodes([]);
        setIsLoadingAdjustmentCodes(false);
        isFetchingAdjustmentRef.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('adjustment_codes' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching Adjustment codes:', error);
        // Check for schema cache error (PGRST205) or table not found
        if (error.code === 'PGRST205' || error.code === '42P01' || 
            error.message?.includes('schema cache') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('not bind')) {
          console.warn('⚠️ Adjustment codes table not found or not bound to database. Please run FIX_ADJUSTMENT_CODES_BINDING.sql');
          toast({
            title: 'Database Binding Error',
            description: 'Adjustment codes table is not bound to database. Run FIX_ADJUSTMENT_CODES_BINDING.sql in Supabase SQL Editor to fix this.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading Adjustment codes',
            description: error.message,
            variant: 'destructive',
          });
        }
        setAdjustmentCodes([]);
        return;
      }

      // Transform database records to match Code interface
      const transformedCodes: (Code & { category?: string })[] = (data || []).map((dbCode: any) => ({
        id: dbCode.id,
        code: dbCode.code || '',
        description: dbCode.description || '',
        price: 0.00, // Adjustment codes don't have prices
        inactive: !(dbCode.is_active || dbCode.status === 'active'),
        type: 'HCPCS' as 'CPT' | 'HCPCS', // Adjustment codes don't have a specific type
        createdAt: dbCode.created_at || '',
        updatedAt: dbCode.updated_at || dbCode.created_at || '',
        category: dbCode.adjustment_type || 'Credit' // Store adjustment type (Credit, Debit, Discount, Write-off)
      }));

      console.log(`✅ Successfully loaded ${transformedCodes.length} Adjustment codes from database`);
      setAdjustmentCodes(transformedCodes);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchAdjustmentCodesFromDatabase:', error);
      toast({
        title: 'Error loading Adjustment codes',
        description: error.message || 'Failed to load Adjustment codes from database',
        variant: 'destructive',
      });
      setAdjustmentCodes([]);
    } finally {
      setIsLoadingAdjustmentCodes(false);
      isFetchingAdjustmentRef.current = false;
    }
  };

  // Fetch Inventory codes from database
  const fetchInventoryCodesFromDatabase = async () => {
    if (isFetchingInventoryRef.current) {
      return;
    }

    try {
      isFetchingInventoryRef.current = true;
      setIsLoadingInventoryCodes(true);
      console.log('🔍 Fetching Inventory codes from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch Inventory codes.');
        setInventoryCodes([]);
        setIsLoadingInventoryCodes(false);
        isFetchingInventoryRef.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('inventory_codes' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching Inventory codes:', error);
        // Check for schema cache error (PGRST205) or table not found
        if (error.code === 'PGRST205' || error.code === '42P01' || 
            error.message?.includes('schema cache') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('not bind')) {
          console.warn('⚠️ Inventory codes table not found or not bound to database. Please run FIX_INVENTORY_CODES_BINDING.sql');
          toast({
            title: 'Database Binding Error',
            description: 'Inventory codes table is not bound to database. Run FIX_INVENTORY_CODES_BINDING.sql in Supabase SQL Editor to fix this.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading Inventory codes',
            description: error.message,
            variant: 'destructive',
          });
        }
        setInventoryCodes([]);
        return;
      }

      // Transform database records to match Code interface
      const transformedCodes: Code[] = (data || []).map((dbCode: any) => ({
        id: dbCode.id,
        code: dbCode.code || '',
        description: dbCode.code_description || dbCode.billing_description || '',
        price: 0.00, // Inventory codes don't have prices
        inactive: !(dbCode.is_active || dbCode.status === 'active'),
        type: 'HCPCS' as 'CPT' | 'HCPCS', // Inventory codes don't have a specific type
        createdAt: dbCode.created_at || '',
        updatedAt: dbCode.updated_at || dbCode.created_at || ''
      }));

      console.log(`✅ Successfully loaded ${transformedCodes.length} Inventory codes from database`);
      setInventoryCodes(transformedCodes);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchInventoryCodesFromDatabase:', error);
      toast({
        title: 'Error loading Inventory codes',
        description: error.message || 'Failed to load Inventory codes from database',
        variant: 'destructive',
      });
      setInventoryCodes([]);
    } finally {
      setIsLoadingInventoryCodes(false);
      isFetchingInventoryRef.current = false;
    }
  };

  // Fetch Charge Panels from database
  const fetchChargePanelsFromDatabase = async () => {
    if (isFetchingChargePanelRef.current) {
      return;
    }

    try {
      isFetchingChargePanelRef.current = true;
      setIsLoadingChargePanels(true);
      console.log('🔍 Fetching Charge Panels from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch Charge Panels.');
        setChargePanels([]);
        setIsLoadingChargePanels(false);
        isFetchingChargePanelRef.current = false;
        return;
      }

      // Fetch panels with their details
      const { data: panelsData, error: panelsError } = await supabase
        .from('charge_panels' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (panelsError) {
        console.error('❌ Error fetching Charge Panels:', panelsError);
        if (panelsError.code === 'PGRST205' || panelsError.code === '42P01' || 
            panelsError.message?.includes('schema cache') || 
            panelsError.message?.includes('does not exist')) {
          console.warn('⚠️ Charge panels table not found in schema cache. Please run CREATE_CHARGE_PANELS_TABLE.sql');
          toast({
            title: 'Schema Cache Error',
            description: 'Table exists but not in schema cache. Run CREATE_CHARGE_PANELS_TABLE.sql and restart Supabase project.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading Charge Panels',
            description: panelsError.message,
            variant: 'destructive',
          });
        }
        setChargePanels([]);
        return;
      }

      // Fetch details for all panels
      const panelIds = (panelsData || []).map((p: any) => p.id);
      let detailsData: any[] = [];
      
      if (panelIds.length > 0) {
        const { data: details, error: detailsError } = await supabase
          .from('charge_panel_details' as any)
          .select('*')
          .in('charge_panel_id', panelIds)
          .order('charge_panel_id', { ascending: true })
          .order('sequence_order', { ascending: true });

        if (!detailsError && details) {
          detailsData = details;
        }
      }

      // Transform database records to match Code interface
      const transformedPanels: Code[] = (panelsData || []).map((panel: any) => {
        const panelDetails = detailsData.filter((d: any) => d.charge_panel_id === panel.id);
        const codesList = panelDetails.map((d: any) => d.code).filter(Boolean).join(', ');
        
        return {
          id: panel.id,
          code: panel.code || '',
          description: panel.description || panel.title || '',
          price: 0.00, // Charge panels don't have direct prices
          inactive: !(panel.is_active || panel.status === 'active'),
          type: 'HCPCS' as 'CPT' | 'HCPCS',
          createdAt: panel.created_at || '',
          updatedAt: panel.updated_at || panel.created_at || '',
          // Store additional data for display
          title: panel.title,
          panelType: panel.type,
          codesCount: panelDetails.length
        } as Code & { title?: string; panelType?: string; codesCount?: number; codesList?: string };
      });

      console.log(`✅ Successfully loaded ${transformedPanels.length} Charge Panels from database`);
      setChargePanels(transformedPanels);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchChargePanelsFromDatabase:', error);
      toast({
        title: 'Error loading Charge Panels',
        description: error.message || 'Failed to load Charge Panels from database',
        variant: 'destructive',
      });
      setChargePanels([]);
    } finally {
      setIsLoadingChargePanels(false);
      isFetchingChargePanelRef.current = false;
    }
  };

  const fetchDiagnosisCodesFromDatabase = async () => {
    if (isFetchingDiagnosisRef.current) {
      return;
    }

    try {
      isFetchingDiagnosisRef.current = true;
      setIsLoadingDiagnosisCodes(true);
      console.log('🔍 Fetching diagnosis codes from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch diagnosis codes.');
        setDiagnosisCodes([]);
        setIsLoadingDiagnosisCodes(false);
        isFetchingDiagnosisRef.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('diagnosis_codes' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching diagnosis codes:', error);
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('⚠️ Diagnosis codes table not found. Please run CREATE_DIAGNOSIS_CODES_TABLE.sql');
          toast({
            title: 'Table Not Found',
            description: 'Diagnosis codes table does not exist. Please run the SQL setup script.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading diagnosis codes',
            description: error.message,
            variant: 'destructive',
          });
        }
        setDiagnosisCodes([]);
        return;
      }

      // Transform database records to match Code interface
      const transformedCodes: Code[] = (data || []).map((dbCode: any) => ({
        id: dbCode.id,
        code: dbCode.code || '',
        description: dbCode.description || '',
        price: 0.00, // Diagnosis codes don't have prices
        inactive: !(dbCode.is_active || dbCode.status === 'active'),
        type: 'HCPCS' as 'CPT' | 'HCPCS', // Default type for diagnosis codes
        createdAt: dbCode.created_at || '',
        updatedAt: dbCode.updated_at || dbCode.created_at || ''
      }));

      console.log(`✅ Successfully loaded ${transformedCodes.length} diagnosis codes from database`);
      setDiagnosisCodes(transformedCodes);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchDiagnosisCodesFromDatabase:', error);
      toast({
        title: 'Error loading diagnosis codes',
        description: error.message || 'Failed to load diagnosis codes from database',
        variant: 'destructive',
      });
      setDiagnosisCodes([]);
    } finally {
      setIsLoadingDiagnosisCodes(false);
      isFetchingDiagnosisRef.current = false;
    }
  };

  const handleSaveNewAdjustment = async () => {
    if (!newAdjustment.code || !newAdjustment.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields (Code and Description).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating Adjustment code:', newAdjustment);

      // Prepare data for database (using adjustment_codes table)
      const insertData: any = {
        code: newAdjustment.code.trim(),
        description: newAdjustment.description.trim(),
        adjustment_type: newAdjustment.adjustmentType || 'Credit',
        status: 'active',
        is_active: true
      };

      const { data, error } = await supabase
        .from('adjustment_codes' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating Adjustment code:', error);
        // Check for binding/schema cache errors
        if (error.code === 'PGRST205' || error.code === '42P01' || 
            error.message?.includes('schema cache') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('not bind')) {
          toast({
            title: 'Database Binding Error',
            description: 'Adjustment codes table is not bound to database. Run FIX_ADJUSTMENT_CODES_BINDING.sql in Supabase SQL Editor to fix this.',
            variant: 'destructive',
          });
          return;
        }
        throw new Error(error.message || 'Failed to create Adjustment code');
      }

      // Reset form
      setNewAdjustment({
        code: '',
        adjustmentType: 'Credit',
        description: ''
      });
      setIsNewAdjustmentDialogOpen(false);

      // Refresh the Adjustment codes list
      await fetchAdjustmentCodesFromDatabase();

      toast({
        title: "Adjustment Code Added",
        description: `Adjustment code ${newAdjustment.code} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create Adjustment code:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create Adjustment code. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleSaveNewInventory = async () => {
    if (!newInventory.code) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required field (Code).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating Inventory code:', newInventory);

      // Prepare data for database (using inventory_codes table)
      const insertData: any = {
        code: newInventory.code.trim(),
        procedure_code: newInventory.procedureCode || null,
        quantity: newInventory.quantity || 0,
        code_description: newInventory.codeDescription || null,
        billing_description: newInventory.billingDescription || null,
        use_alert: newInventory.useAlert || false,
        status: 'active',
        is_active: true
      };

      // Remove null values for optional fields
      Object.keys(insertData).forEach(key => {
        if (insertData[key] === null || insertData[key] === '') {
          delete insertData[key];
        }
      });

      const { data, error } = await supabase
        .from('inventory_codes' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating Inventory code:', error);
        // Check for binding/schema cache errors
        if (error.code === 'PGRST205' || error.code === '42P01' || 
            error.message?.includes('schema cache') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('not bind')) {
          toast({
            title: 'Database Binding Error',
            description: 'Inventory codes table is not bound to database. Run FIX_INVENTORY_CODES_BINDING.sql in Supabase SQL Editor to fix this.',
            variant: 'destructive',
          });
          return;
        }
        throw new Error(error.message || 'Failed to create Inventory code');
      }

      // Reset form
      setNewInventory({
        code: '',
        procedureCode: '',
        quantity: 0,
        codeDescription: '',
        billingDescription: '',
        useAlert: false
      });
      setIsNewInventoryDialogOpen(false);

      // Refresh the Inventory codes list
      await fetchInventoryCodesFromDatabase();

      toast({
        title: "Inventory Code Added",
        description: `Inventory code ${newInventory.code} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create Inventory code:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create Inventory code. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleSaveNewChargePanel = async () => {
    if (!newChargePanel.title || !newChargePanel.code) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields (Title and Code).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating Charge Panel:', newChargePanel);

      // Prepare panel data
      const panelData: any = {
        title: newChargePanel.title.trim(),
        code: newChargePanel.code.trim(),
        type: newChargePanel.type || 'Professional',
        description: newChargePanel.description || null,
        status: 'active',
        is_active: true
      };

      // Remove null values
      Object.keys(panelData).forEach(key => {
        if (panelData[key] === null || panelData[key] === '') {
          delete panelData[key];
        }
      });

      // Insert the panel
      const { data: panelResult, error: panelError } = await supabase
        .from('charge_panels' as any)
        .insert(panelData)
        .select()
        .single();

      if (panelError) {
        console.error('❌ Error creating Charge Panel:', panelError);
        if (panelError.code === 'PGRST205' || panelError.code === '42P01' || 
            panelError.message?.includes('schema cache') || 
            panelError.message?.includes('does not exist')) {
          toast({
            title: 'Schema Cache Error',
            description: 'Table exists but not in schema cache. Run CREATE_CHARGE_PANELS_TABLE.sql and restart Supabase project.',
            variant: 'destructive',
          });
          return;
        }
        throw new Error(panelError.message || 'Failed to create Charge Panel');
      }

      // Insert panel details if any exist
      if (panelResult && !panelError && newChargePanel.codeDetails && newChargePanel.codeDetails.length > 0) {
        const panelId = (panelResult as any).id;
        if (!panelId) {
          throw new Error('Failed to get panel ID after creation');
        }
        
        const validDetails = newChargePanel.codeDetails
          .filter(detail => !detail.delete && detail.code) // Filter out deleted and empty codes
          .map((detail, index) => ({
            charge_panel_id: panelId,
            code: detail.code || null,
            pos: detail.pos || null,
            tos: detail.tos || null,
            modifier_options: detail.modifierOptions || 'Code Defaults',
            modifier1: detail.modifier1 || null,
            modifier2: detail.modifier2 || null,
            modifier3: detail.modifier3 || null,
            modifier4: detail.modifier4 || null,
            price: detail.price || 'Code Default',
            units: detail.units ? parseFloat(detail.units) : 0.00,
            total: detail.total || null,
            other: detail.other || null,
            sequence_order: index + 1
          }))
          .filter(detail => detail.code); // Only include details with codes

        if (validDetails.length > 0) {
          const { error: detailsError } = await supabase
            .from('charge_panel_details' as any)
            .insert(validDetails);

          if (detailsError) {
            console.error('❌ Error creating Charge Panel Details:', detailsError);
            // Don't fail the whole operation, just log the error
            toast({
              title: "Warning",
              description: "Charge Panel created but some details failed to save.",
              variant: "default",
            });
          }
        }
      }

      // Reset form
      setNewChargePanel({
        title: '',
        code: 'CP001',
        type: 'Professional',
        description: '',
        codeDetails: [{
          id: '1',
          code: '',
          pos: '',
          tos: '',
          modifierOptions: 'Code Defaults',
          modifier1: '',
          modifier2: '',
          modifier3: '',
          modifier4: '',
          price: 'Code Default',
          units: '0.00',
          total: '',
          other: 'Other',
          delete: false
        }]
      });
      setIsNewChargePanelDialogOpen(false);

      // Refresh the Charge Panels list
      await fetchChargePanelsFromDatabase();

      toast({
        title: "Charge Panel Added",
        description: `Charge Panel ${newChargePanel.title} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create Charge Panel:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create Charge Panel. Please try again.',
        variant: "destructive",
      });
    }
  };

  const fetchFeeSchedulesFromDatabase = async () => {
    if (isFetchingFeeScheduleRef.current) {
      return;
    }
    isFetchingFeeScheduleRef.current = true;
    setIsLoadingFeeSchedules(true);

    try {
      const { data, error } = await supabase
        .from('fee_schedules' as any)
        .select('*')
        .order('sequence_number', { ascending: true });

      if (error) {
        console.error('Error fetching fee schedules:', error);
        if (error.code === 'PGRST205' || error.code === '42P01' || 
            error.message?.includes('schema cache') || 
            error.message?.includes('does not exist')) {
          toast({
            title: 'Table Not Found',
            description: 'Fee schedules table does not exist. Please run CREATE_FEE_SCHEDULES_TABLE.sql in Supabase SQL Editor.',
            variant: 'destructive',
          });
          setFeeSchedules([]);
          return;
        }
        throw error;
      }

      if (data) {
        // Transform data to match the expected structure
        const transformedData = data.map((schedule: any) => ({
          id: schedule.id,
          name: schedule.name,
          description: schedule.description || '',
          sequence_number: schedule.sequence_number,
          effective_from: schedule.effective_from,
          effective_to: schedule.effective_to,
          price_creation_method: schedule.price_creation_method,
          creation_settings: schedule.creation_settings,
          status: schedule.status,
          inactive: !schedule.is_active || schedule.status === 'inactive',
          created_at: schedule.created_at,
          updated_at: schedule.updated_at
        }));
        setFeeSchedules(transformedData);
      } else {
        setFeeSchedules([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch fee schedules:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch fee schedules. Please try again.',
        variant: 'destructive',
      });
      setFeeSchedules([]);
    } finally {
      setIsLoadingFeeSchedules(false);
      isFetchingFeeScheduleRef.current = false;
    }
  };

  const fetchContractsFromDatabase = async () => {
    if (isFetchingContractRef.current) {
      return;
    }

    try {
      isFetchingContractRef.current = true;
      setIsLoadingContracts(true);
      console.log('🔍 Fetching Contracts from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch Contracts.');
        setContracts([]);
        setIsLoadingContracts(false);
        isFetchingContractRef.current = false;
        return;
      }

      // Fetch contracts with their procedures
      const { data: contractsData, error: contractsError } = await supabase
        .from('contracts' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (contractsError) {
        console.error('❌ Error fetching Contracts:', contractsError);
        if (contractsError.code === 'PGRST205' || contractsError.code === '42P01' || 
            contractsError.message?.includes('schema cache') || 
            contractsError.message?.includes('does not exist')) {
          console.warn('⚠️ Contracts table not found in schema cache. Please run CREATE_CONTRACTS_TABLE.sql');
          toast({
            title: 'Schema Cache Error',
            description: 'Table exists but not in schema cache. Run CREATE_CONTRACTS_TABLE.sql and restart Supabase project.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading Contracts',
            description: contractsError.message,
            variant: 'destructive',
          });
        }
        setContracts([]);
        return;
      }

      // Fetch procedures for all contracts
      const contractIds = (contractsData || []).map((c: any) => c.id);
      let proceduresData: any[] = [];
      
      if (contractIds.length > 0) {
        const { data: procedures, error: proceduresError } = await supabase
          .from('contract_procedures' as any)
          .select('*')
          .in('contract_id', contractIds)
          .order('contract_id', { ascending: true })
          .order('sequence_order', { ascending: true });

        if (!proceduresError && procedures) {
          proceduresData = procedures;
        }
      }

      // Transform database records to match Code interface
      const transformedContracts: Code[] = (contractsData || []).map((contract: any) => {
        const contractProcedures = proceduresData.filter((p: any) => p.contract_id === contract.id);
        const proceduresCount = contractProcedures.length;
        
        return {
          id: contract.id,
          code: contract.name || '',
          description: contract.type || '',
          price: 0.00, // Contracts don't have direct prices
          inactive: !(contract.is_active || contract.status === 'active'),
          type: 'HCPCS' as 'CPT' | 'HCPCS',
          createdAt: contract.created_at || '',
          updatedAt: contract.updated_at || contract.created_at || '',
          // Store additional data for display
          contractType: contract.type,
          sequenceNumber: contract.sequence_number,
          proceduresCount: proceduresCount
        } as Code & { contractType?: string; sequenceNumber?: string; proceduresCount?: number };
      });

      console.log(`✅ Successfully loaded ${transformedContracts.length} Contracts from database`);
      setContracts(transformedContracts);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchContractsFromDatabase:', error);
      toast({
        title: 'Error loading Contracts',
        description: error.message || 'Failed to load Contracts from database',
        variant: 'destructive',
      });
      setContracts([]);
    } finally {
      setIsLoadingContracts(false);
      isFetchingContractRef.current = false;
    }
  };

  const handleSaveNewContract = async () => {
    if (!contractPreview.name || !contractPreview.sequenceNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields (Name and Sequence #).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating Contract:', contractPreview);

      // Prepare contract data
      const contractData: any = {
        name: contractPreview.name.trim(),
        type: contractPreview.type || 'FFS',
        sequence_number: contractPreview.sequenceNumber.trim(),
        allow_users_to_update_prices: contractPreview.allowUsersToUpdatePrices || false,
        status: 'active',
        is_active: true
      };

      // Insert the contract
      const { data: contractResult, error: contractError } = await supabase
        .from('contracts' as any)
        .insert(contractData)
        .select()
        .single();

      if (contractError) {
        console.error('❌ Error creating Contract:', contractError);
        if (contractError.code === 'PGRST205' || contractError.code === '42P01' || 
            contractError.message?.includes('schema cache') || 
            contractError.message?.includes('does not exist')) {
          toast({
            title: 'Schema Cache Error',
            description: 'Table exists but not in schema cache. Run CREATE_CONTRACTS_TABLE.sql and restart Supabase project.',
            variant: 'destructive',
          });
          return;
        }
        if (contractError.code === '23505') { // Unique constraint violation
          toast({
            title: 'Duplicate Sequence Number',
            description: 'A contract with this sequence number already exists. Please use a different sequence number.',
            variant: 'destructive',
          });
          return;
        }
        throw new Error(contractError.message || 'Failed to create Contract');
      }

      // Insert contract procedures if any exist
      if (contractResult && !contractError && contractPreview.procedures && contractPreview.procedures.length > 0) {
        const contractId = (contractResult as any).id;
        if (!contractId) {
          throw new Error('Failed to get contract ID after creation');
        }
        
        const validProcedures = contractPreview.procedures
          .filter(proc => !proc.exclude && proc.code) // Filter out excluded and empty codes
          .map((proc, index) => ({
            contract_id: contractId,
            code: proc.code || '',
            price: proc.price ? parseFloat(proc.price.toString()) : 0.00,
            description: proc.description || null,
            type: proc.type || 'Procedure',
            exclude: proc.exclude || false,
            sequence_order: index + 1
          }))
          .filter(proc => proc.code); // Only include procedures with codes

        if (validProcedures.length > 0) {
          const { error: proceduresError } = await supabase
            .from('contract_procedures' as any)
            .insert(validProcedures);

          if (proceduresError) {
            console.error('❌ Error creating Contract Procedures:', proceduresError);
            // Don't fail the whole operation, just log the error
            toast({
              title: "Warning",
              description: "Contract created but some procedures failed to save.",
              variant: "default",
            });
          }
        }
      }

      // Reset form
      setContractPreview({
        name: '',
        type: 'FFS',
        sequenceNumber: 'NEW',
        allowUsersToUpdatePrices: true,
        procedures: [
          { id: '1', code: '71271', price: '0.00', description: 'CT THORAX LUNG CANCER SCR C-', type: 'Procedure', exclude: false },
          { id: '2', code: '76536', price: '0.00', description: 'US EXAM OF HEAD AND NECK', type: 'Procedure', exclude: false },
          { id: '3', code: '76705', price: '0.00', description: 'ECHO EXAM OF ABDOMEN', type: 'Procedure', exclude: false },
          { id: '4', code: '76770', price: '0.00', description: 'US EXAM ABDO BACK WALL COMP', type: 'Procedure', exclude: false },
          { id: '5', code: '76856', price: '0.00', description: 'US EXAM PELVIC COMPLETE', type: 'Procedure', exclude: false },
          { id: '6', code: '76857', price: '0.00', description: 'US EXAM PELVIC LIMITED', type: 'Procedure', exclude: false },
          { id: '7', code: '76870', price: '0.00', description: 'US EXAM SCROTUM', type: 'Procedure', exclude: false },
          { id: '8', code: '77063', price: '0.00', description: 'BREAST TOMOSYNTHESIS BI', type: 'Procedure', exclude: false },
          { id: '9', code: '77067', price: '0.00', description: 'SCR MAMMO BI INCL CAD', type: 'Procedure', exclude: false },
          { id: '10', code: '93306', price: '0.00', description: 'TTE W/DOPPLER COMPLETE', type: 'Procedure', exclude: false },
          { id: '11', code: '93880', price: '0.00', description: 'EXTRACRANIAL BILAT STUDY', type: 'Procedure', exclude: false },
          { id: '12', code: '93978', price: '0.00', description: 'VASCULAR STUDY', type: 'Procedure', exclude: false }
        ]
      });
      setIsContractPreviewOpen(false);
      setIsNewContractDialogOpen(false);

      // Refresh the Contracts list
      await fetchContractsFromDatabase();

      toast({
        title: "Contract Added",
        description: `Contract ${contractPreview.name} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create Contract:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create Contract. Please try again.',
        variant: "destructive",
      });
    }
  };

  // Helper function to apply price adjustments
  const applyPriceAdjustment = (basePrice: number, adjustment: any): number => {
    let adjustedPrice = basePrice;

    if (adjustment.priceAdjustment === 'increase') {
      const increasePercent = parseFloat(adjustment.increaseBy || '0');
      adjustedPrice = basePrice * (1 + increasePercent / 100);
    } else if (adjustment.priceAdjustment === 'decrease') {
      const decreasePercent = parseFloat(adjustment.decreaseBy || '0');
      adjustedPrice = basePrice * (1 - decreasePercent / 100);
    } else if (adjustment.priceAdjustment === 'adjust-to') {
      const multiplier = parseFloat(adjustment.adjustTo || '1');
      adjustedPrice = basePrice * multiplier;
    }

    if (adjustment.roundUp) {
      adjustedPrice = Math.ceil(adjustedPrice);
    }

    return Math.max(0, adjustedPrice); // Ensure price is not negative
  };

  // Helper function to process procedures based on creation method
  const processFeeScheduleProcedures = async (
    method: string,
    feeScheduleId: string,
    settings: any
  ): Promise<void> => {
    let procedures: any[] = [];

    try {
      if (method === 'empty') {
        // Use procedures from feeSchedulePreview
        procedures = feeSchedulePreview.procedures.map((proc, index) => ({
          fee_schedule_id: feeScheduleId,
          code: proc.code || '',
          price: proc.price ? parseFloat(proc.price.toString()) : 0.00,
          description: proc.description || null,
          type: proc.type || 'Procedure',
          sequence_order: index + 1
        })).filter(proc => proc.code);
      } else if (method === 'another-fee-schedule') {
        // Get selected fee schedule and copy its procedures
        const selectedSchedule = settings.selectedFeeSchedules.find((s: any) => s.selected);
        if (selectedSchedule) {
          // Fetch procedures from the selected fee schedule
          // Note: This would require fetching from another fee schedule
          // For now, we'll use the preview procedures
          procedures = feeSchedulePreview.procedures.map((proc, index) => ({
            fee_schedule_id: feeScheduleId,
            code: proc.code || '',
            price: applyPriceAdjustment(
              proc.price ? parseFloat(proc.price.toString()) : 0.00,
              settings
            ),
            description: proc.description || null,
            type: proc.type || 'Procedure',
            sequence_order: index + 1
          })).filter(proc => proc.code);
        }
      } else if (method === 'medicare') {
        // Medicare fee schedule - would need to fetch from Medicare API or database
        // For now, use preview procedures with adjustments
        procedures = feeSchedulePreview.procedures.map((proc, index) => ({
          fee_schedule_id: feeScheduleId,
          code: proc.code || '',
          price: applyPriceAdjustment(
            proc.price ? parseFloat(proc.price.toString()) : 0.00,
            settings
          ),
          description: proc.description || null,
          type: proc.type || 'Procedure',
          sequence_order: index + 1
        })).filter(proc => proc.code);
      } else if (method === 'contract') {
        // Get procedures from contract
        if (settings.contractMethod === 'specific-contract' && settings.selectedContract) {
          // Fetch procedures from the selected contract
          const { data: contractProcedures } = await supabase
            .from('contract_procedures' as any)
            .select('*')
            .eq('contract_id', settings.selectedContract);

          if (contractProcedures) {
            procedures = contractProcedures.map((proc: any, index: number) => ({
              fee_schedule_id: feeScheduleId,
              code: proc.code || '',
              price: applyPriceAdjustment(parseFloat(proc.price || '0'), settings),
              description: proc.description || null,
              type: proc.type || 'Procedure',
              sequence_order: index + 1
            })).filter((proc: any) => proc.code);
          }
        } else if (settings.contractMethod === 'maximum-price') {
          // Get maximum price from all contracts for each code
          // This would require a more complex query
          // For now, use preview procedures
          procedures = feeSchedulePreview.procedures.map((proc, index) => ({
            fee_schedule_id: feeScheduleId,
            code: proc.code || '',
            price: applyPriceAdjustment(
              proc.price ? parseFloat(proc.price.toString()) : 0.00,
              settings
            ),
            description: proc.description || null,
            type: proc.type || 'Procedure',
            sequence_order: index + 1
          })).filter(proc => proc.code);
        }
      } else if (method === 'charges') {
        // Get maximum charges from the last N days
        // This would require querying charges/transactions table
        // For now, use preview procedures
        procedures = feeSchedulePreview.procedures.map((proc, index) => ({
          fee_schedule_id: feeScheduleId,
          code: proc.code || '',
          price: applyPriceAdjustment(
            proc.price ? parseFloat(proc.price.toString()) : 0.00,
            settings
          ),
          description: proc.description || null,
          type: proc.type || 'Procedure',
          sequence_order: index + 1
        })).filter(proc => proc.code);
      } else if (method === 'import') {
        // Import from file - would need to parse CSV/Excel
        // For now, use preview procedures
        procedures = feeSchedulePreview.procedures.map((proc, index) => ({
          fee_schedule_id: feeScheduleId,
          code: proc.code || '',
          price: applyPriceAdjustment(
            proc.price ? parseFloat(proc.price.toString()) : 0.00,
            settings
          ),
          description: proc.description || null,
          type: proc.type || 'Procedure',
          sequence_order: index + 1
        })).filter(proc => proc.code);
      }

      // Insert procedures if any exist
      if (procedures.length > 0) {
        const { error: proceduresError } = await supabase
          .from('fee_schedule_procedures' as any)
          .insert(procedures);

        if (proceduresError) {
          console.error('❌ Error creating Fee Schedule Procedures:', proceduresError);
          throw new Error('Failed to save procedures');
        }
      }
    } catch (error: any) {
      console.error('❌ Error processing procedures:', error);
      throw error;
    }
  };

  // Main function to save fee schedule
  const handleSaveFeeSchedule = async () => {
    if (!feeSchedulePreview.name || !feeSchedulePreview.sequenceNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields (Name and Sequence #).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating Fee Schedule:', {
        preview: feeSchedulePreview,
        method: newFeeSchedule.priceCreationMethod,
        settings: {
          anotherFeeSchedule: anotherFeeScheduleSettings,
          medicare: medicareSettings,
          contract: contractBasedSettings,
          charges: chargesBasedSettings,
          import: importSettings
        }
      });

      // Get settings based on creation method
      let creationSettings: any = {};
      if (newFeeSchedule.priceCreationMethod === 'another-fee-schedule') {
        creationSettings = anotherFeeScheduleSettings;
      } else if (newFeeSchedule.priceCreationMethod === 'medicare') {
        creationSettings = medicareSettings;
      } else if (newFeeSchedule.priceCreationMethod === 'contract') {
        creationSettings = contractBasedSettings;
      } else if (newFeeSchedule.priceCreationMethod === 'charges') {
        creationSettings = chargesBasedSettings;
      } else if (newFeeSchedule.priceCreationMethod === 'import') {
        creationSettings = importSettings;
      }

      // Prepare fee schedule data
      const feeScheduleData: any = {
        name: feeSchedulePreview.name.trim(),
        description: feeSchedulePreview.description || null,
        sequence_number: feeSchedulePreview.sequenceNumber.trim(),
        effective_from: feeSchedulePreview.effectiveFrom || null,
        effective_to: feeSchedulePreview.effectiveTo || null,
        price_creation_method: newFeeSchedule.priceCreationMethod,
        creation_settings: creationSettings,
        status: 'active',
        is_active: true
      };

      // Remove null values for optional fields
      Object.keys(feeScheduleData).forEach(key => {
        if (feeScheduleData[key] === null || feeScheduleData[key] === '') {
          if (key !== 'description' && key !== 'effective_from' && key !== 'effective_to') {
            delete feeScheduleData[key];
          }
        }
      });

      // Insert the fee schedule
      const { data: feeScheduleResult, error: feeScheduleError } = await supabase
        .from('fee_schedules' as any)
        .insert(feeScheduleData)
        .select()
        .single();

      if (feeScheduleError) {
        console.error('❌ Error creating Fee Schedule:', feeScheduleError);
        if (feeScheduleError.code === 'PGRST205' || feeScheduleError.code === '42P01' || 
            feeScheduleError.message?.includes('schema cache') || 
            feeScheduleError.message?.includes('does not exist')) {
          toast({
            title: 'Schema Cache Error',
            description: 'Table exists but not in schema cache. Run CREATE_FEE_SCHEDULES_TABLE.sql and restart Supabase project.',
            variant: 'destructive',
          });
          return;
        }
        if (feeScheduleError.code === '23505') { // Unique constraint violation
          toast({
            title: 'Duplicate Sequence Number',
            description: 'A fee schedule with this sequence number already exists. Please use a different sequence number.',
            variant: 'destructive',
          });
          return;
        }
        throw new Error(feeScheduleError.message || 'Failed to create Fee Schedule');
      }

      // Process and insert procedures based on creation method
      if (feeScheduleResult && !feeScheduleError) {
        const feeScheduleId = (feeScheduleResult as any).id;
        if (!feeScheduleId) {
          throw new Error('Failed to get fee schedule ID after creation');
        }

        await processFeeScheduleProcedures(
          newFeeSchedule.priceCreationMethod,
          feeScheduleId,
          creationSettings
        );
      }

      // Reset form
      setFeeSchedulePreview({
        name: '',
        effectiveFrom: '',
        effectiveTo: '',
        sequenceNumber: 'NEW',
        description: '',
        procedures: []
      });
      setNewFeeSchedule({ priceCreationMethod: 'empty' });
      setIsFeeSchedulePreviewOpen(false);
      setIsNewFeeScheduleDialogOpen(false);

      // Refresh the fee schedules list
      await fetchFeeSchedulesFromDatabase();

      toast({
        title: "Fee Schedule Added",
        description: `Fee Schedule ${feeSchedulePreview.name} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create Fee Schedule:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create Fee Schedule. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleSaveNewRemittance = async () => {
    if (!newRemittance.code) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required field (Code).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating Remittance code:', newRemittance);

      // Prepare data for database (snake_case) - consistent naming
      const insertData: any = {
        code: newRemittance.code.trim(),
        type: newRemittance.type || 'Adj Reason',
        information_level: newRemittance.informationLevel || 'INFO - This code represents general information only.',
        include_on_denial_reports: newRemittance.includeOnDenialReports || false,
        include_on_adjustment_reports: newRemittance.includeOnAdjustmentReports || false,
        report_description: newRemittance.reportDescription || null,
        long_description: newRemittance.longDescription || null,
        use_memoline: newRemittance.useMemoline || false,
        status: 'active',
        is_active: true
      };

      // Remove null values for optional fields
      Object.keys(insertData).forEach(key => {
        if (insertData[key] === null || insertData[key] === '') {
          delete insertData[key];
        }
      });

      const { data, error } = await supabase
        .from('remittance_codes' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating Remittance code:', error);
        throw new Error(error.message || 'Failed to create Remittance code');
      }

      // Reset form
      setNewRemittance({
        code: '',
        type: 'Adj Reason',
        informationLevel: 'INFO - This code represents general information only.',
        includeOnDenialReports: false,
        includeOnAdjustmentReports: false,
        reportDescription: '',
        longDescription: '',
        useMemoline: false
      });
      setIsNewRemittanceDialogOpen(false);

      // Refresh the Remittance codes list
      await fetchRemittanceCodesFromDatabase();

      toast({
        title: "Remittance Code Added",
        description: `Remittance code ${newRemittance.code} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create Remittance code:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create Remittance code. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleSaveNewRevenue = async () => {
    if (!newRevenue.code || !newRevenue.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields (Code and Description).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating Revenue code:', newRevenue);

      // Prepare data for database (snake_case) - consistent naming
      const insertData: any = {
        code: newRevenue.code.trim(),
        description: newRevenue.description.trim(),
        price: newRevenue.price || 0.00,
        exclude_from_duplicate: newRevenue.excludeFromDuplicate || false,
        statement_description: newRevenue.statementDescription || null,
        status: 'active',
        is_active: true
      };

      // Remove null values for optional fields
      Object.keys(insertData).forEach(key => {
        if (insertData[key] === null || insertData[key] === '') {
          delete insertData[key];
        }
      });

      const { data, error } = await supabase
        .from('revenue_codes' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating Revenue code:', error);
        throw new Error(error.message || 'Failed to create Revenue code');
      }

      // Reset form
      setNewRevenue({
        code: '',
        price: 0.00,
        excludeFromDuplicate: false,
        description: '',
        statementDescription: ''
      });
      setIsNewRevenueDialogOpen(false);

      // Refresh the Revenue codes list
      await fetchRevenueCodesFromDatabase();

      toast({
        title: "Revenue Code Added",
        description: `Revenue code ${newRevenue.code} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create Revenue code:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create Revenue code. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleSaveNewICDProcedure = async () => {
    if (!newICDProcedure.code || !newICDProcedure.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields (Code and Description).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating ICD Procedure code:', newICDProcedure);

      // Prepare data for database (snake_case) - consistent naming
      const insertData: any = {
        code: newICDProcedure.code.trim(),
        code_type: newICDProcedure.codeType || 'ICD-10',
        description: newICDProcedure.description.trim(),
        status: 'active',
        is_active: true
      };

      const { data, error } = await supabase
        .from('icd_procedure_codes' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating ICD Procedure code:', error);
        throw new Error(error.message || 'Failed to create ICD Procedure code');
      }

      // Reset form
      setNewICDProcedure({
        code: '',
        codeType: 'ICD-10',
        description: ''
      });
      setIsNewICDProcedureDialogOpen(false);

      // Refresh the ICD Procedure codes list
      await fetchICDProcedureCodesFromDatabase();

      toast({
        title: "ICD Procedure Code Added",
        description: `ICD Procedure code ${newICDProcedure.code} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create ICD Procedure code:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create ICD Procedure code. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleSaveNewDiagnosis = async () => {
    if (!newDiagnosis.code || !newDiagnosis.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields (Code and Description).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating diagnosis code:', newDiagnosis);

      // Prepare data for database (snake_case) - consistent naming
      const insertData: any = {
        code: newDiagnosis.code.trim(),
        code_type: newDiagnosis.codeType || 'ICD-10',
        description: newDiagnosis.description.trim(),
        effective_date: newDiagnosis.effectiveDate || null,
        termination_date: newDiagnosis.terminationDate || null,
        cpt1: newDiagnosis.cpt1 || null,
        cpt2: newDiagnosis.cpt2 || null,
        cpt3: newDiagnosis.cpt3 || null,
        cpt4: newDiagnosis.cpt4 || null,
        cpt5: newDiagnosis.cpt5 || null,
        cpt6: newDiagnosis.cpt6 || null,
        print_on_superbill: newDiagnosis.printOnSuperbill || false,
        superbill_description: newDiagnosis.superbillDescription || null,
        status: 'active',
        is_active: true
      };

      // Remove null values for optional fields
      Object.keys(insertData).forEach(key => {
        if (insertData[key] === null || insertData[key] === '') {
          delete insertData[key];
        }
      });

      const { data, error } = await supabase
        .from('diagnosis_codes' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating diagnosis code:', error);
        throw new Error(error.message || 'Failed to create diagnosis code');
      }

      // Reset form
      setNewDiagnosis({
        code: '',
        codeType: 'ICD-10',
        description: '',
        effectiveDate: '',
        terminationDate: '',
        cpt1: '',
        cpt2: '',
        cpt3: '',
        cpt4: '',
        cpt5: '',
        cpt6: '',
        printOnSuperbill: false,
        superbillDescription: ''
      });
      setIsNewDiagnosisDialogOpen(false);

      // Refresh the diagnosis codes list
      await fetchDiagnosisCodesFromDatabase();

      toast({
        title: "Diagnosis Code Added",
        description: `Diagnosis code ${newDiagnosis.code} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create diagnosis code:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create diagnosis code. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleSaveNewCode = async () => {
    if (!newCode.code || !newCode.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields (Code and Description).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating CPT/HCPCS code:', newCode);

      // Prepare data for database (snake_case) - consistent naming
      const insertData: any = {
        code: newCode.code.trim(),
        type: newCode.type || 'CPT®/HCPCS',
        dept: newCode.dept || null,
        description: newCode.description.trim(),
        exclude_from_duplicate: newCode.excludeFromDuplicate || false,
        all_inclusive: newCode.allInclusive || false,
        percentage_of_claim: newCode.percentageOfClaim || false,
        default_price: newCode.defaultPrice || 0.00,
        default_units: newCode.defaultUnits || 1.00,
        default_charge_status: newCode.defaultChargeStatus || null,
        rev_code: newCode.revCode || null,
        place_of_service: newCode.placeOfService || null,
        clia_number: newCode.cliaNumber || null,
        type_of_service: newCode.typeOfService || null,
        narrative_notes: newCode.narrativeNotes || null,
        additional_description: newCode.additionalDescription || null,
        global_modifier1: newCode.globalModifier1 || null,
        global_modifier2: newCode.globalModifier2 || null,
        global_modifier3: newCode.globalModifier3 || null,
        global_modifier4: newCode.globalModifier4 || null,
        icd1: newCode.icd1 || null,
        icd2: newCode.icd2 || null,
        icd3: newCode.icd3 || null,
        icd4: newCode.icd4 || null,
        global_surgery_period: newCode.globalSurgeryPeriod || 'None',
        prior_auth_requirements: newCode.priorAuthRequirements || 'None',
        drug_price: newCode.drugPrice || 0.00,
        drug_units: newCode.drugUnits || 1.00,
        drug_units_measure: newCode.drugUnitsMeasure || 'Unit (UN)',
        drug_code: newCode.drugCode || null,
        drug_code_format: newCode.drugCodeFormat || null,
        effective_date: newCode.effectiveDate || null,
        termination_date: newCode.terminationDate || null,
        print_on_superbills: newCode.printOnSuperbills || false,
        category: newCode.category || null,
        superbill_description: newCode.description || null, // Using description for superbill_description
        statement_description: newCode.statementDescription || null,
        status: 'active',
        is_active: true
      };

      // Remove null values for optional fields
      Object.keys(insertData).forEach(key => {
        if (insertData[key] === null || insertData[key] === '') {
          delete insertData[key];
        }
      });

      const { data, error } = await supabase
        .from('cpt_hcpcs_codes' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating CPT/HCPCS code:', error);
        throw new Error(error.message || 'Failed to create code');
      }

      // Reset form
      setNewCode({
        code: '',
        type: 'CPT®/HCPCS',
        dept: '',
        description: '',
        excludeFromDuplicate: false,
        allInclusive: false,
        percentageOfClaim: false,
        defaultPrice: 0.00,
        defaultUnits: 1.00,
        defaultChargeStatus: '',
        revCode: '',
        placeOfService: '',
        cliaNumber: '',
        typeOfService: '',
        narrativeNotes: '',
        additionalDescription: '',
        globalModifier1: '',
        globalModifier2: '',
        globalModifier3: '',
        globalModifier4: '',
        icd1: '',
        icd2: '',
        icd3: '',
        icd4: '',
        globalSurgeryPeriod: 'None',
        priorAuthRequirements: 'None',
        drugPrice: 0.00,
        drugUnits: 1.00,
        drugUnitsMeasure: 'Unit (UN)',
        drugCode: '',
        drugCodeFormat: '',
        effectiveDate: '',
        terminationDate: '',
        printOnSuperbills: false,
        category: '',
        statementDescription: ''
      });
      setIsNewCodeDialogOpen(false);

      // Refresh the procedure codes list
      await fetchProcedureCodesFromDatabase();

      toast({
        title: "CPT/HCPCS Code Added",
        description: `Code ${newCode.code} has been successfully added.`,
      });
    } catch (error: any) {
      console.error('💥 Failed to create CPT/HCPCS code:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create code. Please try again.',
        variant: "destructive",
      });
    }
  };

  const filteredProcedureCodes = procedureCodes.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInactive = includeInactive || !code.inactive;
    
    return matchesSearch && matchesInactive;
  });

  const filteredDiagnosisCodes = diagnosisCodes.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInactive = includeInactive || !code.inactive;
    
    return matchesSearch && matchesInactive;
  });

  const filteredICDProcedureCodes = icdProcedureCodes.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInactive = includeInactive || !code.inactive;
    
    return matchesSearch && matchesInactive;
  });

  const filteredRevenueCodes = revenueCodes.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInactive = includeInactive || !code.inactive;
    
    return matchesSearch && matchesInactive;
  });

  const filteredRemittanceCodes = remittanceCodes.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInactive = includeInactive || !code.inactive;
    
    return matchesSearch && matchesInactive;
  });

  const filteredAdjustmentCodes = adjustmentCodes.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInactive = includeInactive || !code.inactive;
    
    return matchesSearch && matchesInactive;
  });

  const filteredInventoryCodes = inventoryCodes.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInactive = includeInactive || !code.inactive;
    
    return matchesSearch && matchesInactive;
  });

  const filteredChargePanels = chargePanels.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInactive = includeInactive || !code.inactive;
    
    return matchesSearch && matchesInactive;
  });

  const filteredFeeSchedules = feeSchedules.filter(schedule => {
    const matchesSearch = 
      (schedule.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (schedule.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (schedule.sequence_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInactive = includeInactive || !schedule.inactive;
    
    return matchesSearch && matchesInactive;
  });

  const filteredContracts = contracts.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInactive = includeInactive || !code.inactive;
    
    return matchesSearch && matchesInactive;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Codes Management</h1>
          <p className="text-muted-foreground">Manage billing codes, CPT codes, ICD-10 codes, and more</p>
        </div>
      </div>

      {/* Codes Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {codeMenuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Card 
              key={item.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedMenuItem === item.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleMenuItemClick(item.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <IconComponent className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Menu Item Content */}
      {selectedMenuItem === 'procedure' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search-cpt-hcpcs"
                    name="search-cpt-hcpcs"
                    placeholder="Search for CPT®/HCPCS codes by code or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-inactive"
                    checked={includeInactive}
                    onCheckedChange={(checked) => setIncludeInactive(!!checked)}
                  />
                  <Label htmlFor="include-inactive">Include inactive codes</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setIsNewCodeDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New CPT®/HCPCS
            </Button>
            <Button variant="outline">
              <Cloud className="w-4 h-4 mr-2" />
              Add From HCPCS List
            </Button>
            <Button variant="outline">
              <Cloud className="w-4 h-4 mr-2" />
              Add From CPT® List
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Show All
            </Button>
          </div>

          {/* Recently Opened Table */}
          <Card>
            <CardHeader>
              <CardTitle>CPT®/HCPCS Codes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingProcedureCodes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading CPT/HCPCS codes...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Code</th>
                        <th className="text-left py-3 px-4 font-semibold">Description</th>
                        <th className="text-left py-3 px-4 font-semibold">Price</th>
                        <th className="text-left py-3 px-4 font-semibold">Inactive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProcedureCodes.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted-foreground">
                            No CPT/HCPCS codes found. Click "New CPT®/HCPCS" to add your first code.
                          </td>
                        </tr>
                      ) : (
                        filteredProcedureCodes.map((code) => (
                          <tr key={code.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono">{code.code}</td>
                            <td className="py-3 px-4">{code.description}</td>
                            <td className="py-3 px-4">${code.price.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              {code.inactive ? (
                                <Badge variant="secondary">Inactive</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Diagnosis Codes Interface */}
      {selectedMenuItem === 'diagnosis' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search-diagnosis"
                    name="search-diagnosis"
                    placeholder="Search for Diagnosis codes by code or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-inactive-diagnosis"
                    checked={includeInactive}
                    onCheckedChange={(checked) => setIncludeInactive(!!checked)}
                  />
                  <Label htmlFor="include-inactive-diagnosis">Include inactive codes</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setIsNewDiagnosisDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Diagnosis
            </Button>
            <Button variant="outline">
              <Cloud className="w-4 h-4 mr-2" />
              Add From Master List
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Show All
            </Button>
          </div>

          {/* Recently Opened Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Opened</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Diagnosis Code</th>
                      <th className="text-left py-3 px-4 font-semibold">Description</th>
                      <th className="text-left py-3 px-4 font-semibold">Inactive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingDiagnosisCodes ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                            <span className="text-muted-foreground">Loading diagnosis codes...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredDiagnosisCodes.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-muted-foreground">
                          No diagnosis codes found. {searchTerm || includeInactive ? 'Try adjusting your search criteria.' : 'Get started by creating your first diagnosis code.'}
                        </td>
                      </tr>
                    ) : (
                      filteredDiagnosisCodes.map((code) => (
                        <tr key={code.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono">{code.code}</td>
                          <td className="py-3 px-4">{code.description}</td>
                          <td className="py-3 px-4">
                            {code.inactive ? (
                              <Badge variant="secondary">Inactive</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ICD Procedure Codes Interface */}
      {selectedMenuItem === 'icd-procedure' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search-icd-pcs" className="text-sm font-medium text-gray-700">
                    Search for ICD-PCS codes by code or description.
                  </Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search-icd-pcs"
                      name="search-icd-pcs"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-blue-500"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-inactive-icd-procedure"
                    checked={includeInactive}
                    onCheckedChange={(checked) => setIncludeInactive(!!checked)}
                  />
                  <Label htmlFor="include-inactive-icd-procedure">Include inactive codes</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button 
              className="bg-gray-700 hover:bg-gray-600 text-white"
              onClick={() => setIsNewICDProcedureDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New ICD Procedure Code
            </Button>
            <Button variant="outline" className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
              <Cloud className="w-4 h-4 mr-2" />
              Add From Master List
            </Button>
            <Button variant="outline" className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
              <Eye className="w-4 h-4 mr-2" />
              Show All
            </Button>
          </div>

          {/* Recently Opened Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Opened</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold bg-blue-600 text-white">ICD Proc Code</th>
                      <th className="text-left py-3 px-4 font-semibold bg-blue-600 text-white">Description</th>
                      <th className="text-left py-3 px-4 font-semibold bg-blue-600 text-white">Inactive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingICDProcedureCodes ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                            <span className="text-muted-foreground">Loading ICD Procedure codes...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredICDProcedureCodes.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-muted-foreground">
                          No ICD Procedure codes found. {searchTerm || includeInactive ? 'Try adjusting your search criteria.' : 'Get started by creating your first ICD Procedure code.'}
                        </td>
                      </tr>
                    ) : (
                      filteredICDProcedureCodes.map((code) => (
                        <tr key={code.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono">{code.code}</td>
                          <td className="py-3 px-4">{code.description}</td>
                          <td className="py-3 px-4">
                            {code.inactive ? (
                              <Badge variant="secondary">Inactive</Badge>
                            ) : (
                              <div className="flex items-center">
                                <Checkbox checked={!code.inactive} disabled />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Codes Interface */}
      {selectedMenuItem === 'revenue' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search-revenue"
                    name="search-revenue"
                    placeholder="Search for revenue codes by code or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-inactive-revenue"
                    checked={includeInactive}
                    onCheckedChange={(checked) => setIncludeInactive(!!checked)}
                  />
                  <Label htmlFor="include-inactive-revenue">Include inactive codes</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setIsNewRevenueDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Revenue Code
            </Button>
            <Button variant="outline">
              <Cloud className="w-4 h-4 mr-2" />
              Add From Master List
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Show All
            </Button>
          </div>

          {/* Recently Opened Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Opened</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Revenue Code</th>
                      <th className="text-left py-3 px-4 font-semibold">Description</th>
                      <th className="text-left py-3 px-4 font-semibold">Inactive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingRevenueCodes ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                            <span className="text-muted-foreground">Loading Revenue codes...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredRevenueCodes.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-muted-foreground">
                          No Revenue codes found. {searchTerm || includeInactive ? 'Try adjusting your search criteria.' : 'Get started by creating your first Revenue code.'}
                        </td>
                      </tr>
                    ) : (
                      filteredRevenueCodes.map((code) => (
                        <tr key={code.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono">{code.code}</td>
                          <td className="py-3 px-4">{code.description}</td>
                          <td className="py-3 px-4">
                            {code.inactive ? (
                              <Badge variant="secondary">Inactive</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Remittance Codes Interface */}
      {selectedMenuItem === 'remittance' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search-remittance"
                    name="search-remittance"
                    placeholder="Search for remittance codes by code, description, or memoline"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-inactive-remittance"
                    checked={includeInactive}
                    onCheckedChange={(checked) => setIncludeInactive(!!checked)}
                  />
                  <Label htmlFor="include-inactive-remittance">Include inactive codes</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setIsNewRemittanceDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Remittance Code
            </Button>
            <Button variant="outline">
              <Cloud className="w-4 h-4 mr-2" />
              Add Remark
            </Button>
            <Button variant="outline">
              <Cloud className="w-4 h-4 mr-2" />
              Add Adj Reason
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Show All
            </Button>
          </div>

          {/* Recently Opened Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Opened</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Code</th>
                      <th className="text-left py-3 px-4 font-semibold">Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Information Level</th>
                      <th className="text-left py-3 px-4 font-semibold">Description</th>
                      <th className="text-left py-3 px-4 font-semibold">Inactive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingRemittanceCodes ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                            <span className="text-muted-foreground">Loading Remittance codes...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredRemittanceCodes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No Remittance codes found. {searchTerm || includeInactive ? 'Try adjusting your search criteria.' : 'Get started by creating your first Remittance code.'}
                        </td>
                      </tr>
                    ) : (
                      filteredRemittanceCodes.map((code) => (
                        <tr key={code.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono">{code.code}</td>
                          <td className="py-3 px-4">Adj. Reason</td>
                          <td className="py-3 px-4">INFO</td>
                          <td className="py-3 px-4">{code.description}</td>
                          <td className="py-3 px-4">
                            {code.inactive ? (
                              <Badge variant="secondary">Inactive</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Adjustment Codes Interface */}
      {selectedMenuItem === 'adjustment' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search-adjustment"
                    name="search-adjustment"
                    placeholder="Search for adjustment codes by code or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-inactive-adjustment"
                    checked={includeInactive}
                    onCheckedChange={(checked) => setIncludeInactive(!!checked)}
                  />
                  <Label htmlFor="include-inactive-adjustment">Include inactive codes</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setIsNewAdjustmentDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Adjustment Code
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Show All
            </Button>
          </div>

          {/* Adjustment Codes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Adjustment Codes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAdjustmentCodes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading Adjustment codes...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Code</th>
                        <th className="text-left py-3 px-4 font-semibold">Description</th>
                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                        <th className="text-left py-3 px-4 font-semibold">Inactive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdjustmentCodes.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted-foreground">
                            No Adjustment codes found. Click "New Adjustment Code" to add your first code.
                          </td>
                        </tr>
                      ) : (
                        filteredAdjustmentCodes.map((code) => {
                          // Get adjustment type from category field (stored in database)
                          const adjustmentType = (code as any).category || (code as any).adjustmentType || 'Credit';
                          return (
                            <tr key={code.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 font-mono">{code.code}</td>
                              <td className="py-3 px-4">{code.description}</td>
                              <td className="py-3 px-4">
                                <Badge variant="outline">{adjustmentType}</Badge>
                              </td>
                              <td className="py-3 px-4">
                                {code.inactive ? (
                                  <Badge variant="secondary">Inactive</Badge>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventory Codes Interface */}
      {selectedMenuItem === 'inventory' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search-inventory"
                    name="search-inventory"
                    placeholder="Search for inventory code by code name or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-inactive-inventory"
                    checked={includeInactive}
                    onCheckedChange={(checked) => setIncludeInactive(!!checked)}
                  />
                  <Label htmlFor="include-inactive-inventory">Include inactive codes</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setIsNewInventoryDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Inventory
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Show All
            </Button>
          </div>

          {/* Inventory Codes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Codes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingInventoryCodes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading Inventory codes...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Code</th>
                        <th className="text-left py-3 px-4 font-semibold">Description</th>
                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                        <th className="text-left py-3 px-4 font-semibold">Inactive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventoryCodes.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted-foreground">
                            No Inventory codes found. Click "New Inventory" to add your first code.
                          </td>
                        </tr>
                      ) : (
                        filteredInventoryCodes.map((code) => (
                          <tr key={code.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono">{code.code}</td>
                            <td className="py-3 px-4">{code.description}</td>
                            <td className="py-3 px-4">{code.type}</td>
                            <td className="py-3 px-4">
                              {code.inactive ? (
                                <Badge variant="secondary">Inactive</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charge Panel Interface */}
      {selectedMenuItem === 'charge-panel' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search-charge-panel" className="text-sm font-medium text-gray-700 mb-2 block">
                    Search for charge panel by title or code
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search-charge-panel"
                      name="search-charge-panel"
                      placeholder="Search for charge panel by title or code"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-blue-500"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-inactive-charge-panel"
                    checked={includeInactive}
                    onCheckedChange={(checked) => setIncludeInactive(!!checked)}
                  />
                  <Label htmlFor="include-inactive-charge-panel">Include inactive panels</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setIsNewChargePanelDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Panel
            </Button>
            <Button variant="outline">
              <List className="w-4 h-4 mr-2" />
              Show All
            </Button>
          </div>

          {/* Charge Panels Table */}
          <Card>
            <CardHeader>
              <CardTitle>Charge Panels</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingChargePanels ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading Charge Panels...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Description</th>
                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                        <th className="text-left py-3 px-4 font-semibold">Codes</th>
                        <th className="text-left py-3 px-4 font-semibold">Inactive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChargePanels.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No Charge Panels found. Click "Add Panel" to create your first charge panel.
                          </td>
                        </tr>
                      ) : (
                        filteredChargePanels.map((panel) => {
                          const panelData = panel as Code & { title?: string; panelType?: string; codesCount?: number; codesList?: string };
                          return (
                            <tr key={panel.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium">{panelData.title || panel.code}</td>
                              <td className="py-3 px-4 text-muted-foreground">{panel.description || '-'}</td>
                              <td className="py-3 px-4">
                                <Badge variant="outline">{panelData.panelType || 'Professional'}</Badge>
                              </td>
                              <td className="py-3 px-4 font-mono text-sm">
                                {panelData.codesCount ? `${panelData.codesCount} codes` : '-'}
                              </td>
                              <td className="py-3 px-4">
                                {panel.inactive ? (
                                  <Badge variant="secondary">Inactive</Badge>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fee Schedules Interface */}
      {selectedMenuItem === 'fee-schedules' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search-fee-schedules" className="text-sm font-medium text-gray-700 mb-2 block">
                    Search for fee schedule by name, description, or sequence #
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search-fee-schedules"
                      name="search-fee-schedules"
                      placeholder="Search for fee schedule by name, description, or sequence #"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-inactive-fee-schedules"
                    checked={includeInactive}
                    onCheckedChange={(checked) => setIncludeInactive(!!checked)}
                  />
                  <Label htmlFor="include-inactive-fee-schedules">Include inactive fee schedules</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setIsNewFeeScheduleDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Fee Schedule
            </Button>
            <Button variant="outline">
              <List className="w-4 h-4 mr-2" />
              Show All
            </Button>
          </div>

          {/* Fee Schedules Table */}
          <Card>
            <CardHeader>
              <CardTitle>Fee Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingFeeSchedules ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading fee schedules...</p>
                  </div>
                </div>
              ) : filteredFeeSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm || !includeInactive 
                      ? 'No fee schedules found matching your criteria.' 
                      : 'No fee schedules found. Click "New Fee Schedule" to create your first fee schedule.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Sequence #</th>
                        <th className="text-left py-3 px-4 font-semibold">Description</th>
                        <th className="text-left py-3 px-4 font-semibold">Method</th>
                        <th className="text-left py-3 px-4 font-semibold">Effective From</th>
                        <th className="text-left py-3 px-4 font-semibold">Effective To</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFeeSchedules.map((schedule) => (
                        <tr key={schedule.id} className="border-b hover:bg-gray-50 cursor-pointer">
                          <td className="py-3 px-4 font-medium">{schedule.name}</td>
                          <td className="py-3 px-4 font-mono text-sm">{schedule.sequence_number}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {schedule.description || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">
                              {schedule.price_creation_method === 'empty' ? 'Empty' :
                               schedule.price_creation_method === 'another-fee-schedule' ? 'Based on Fee Schedule' :
                               schedule.price_creation_method === 'medicare' ? 'Medicare' :
                               schedule.price_creation_method === 'contract' ? 'Contract' :
                               schedule.price_creation_method === 'charges' ? 'Charges' :
                               schedule.price_creation_method === 'import' ? 'Import' :
                               schedule.price_creation_method || '-'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {schedule.effective_from ? new Date(schedule.effective_from).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {schedule.effective_to ? new Date(schedule.effective_to).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3 px-4">
                            {schedule.inactive ? (
                              <Badge variant="secondary">Inactive</Badge>
                            ) : (
                              <Badge variant="default">Active</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contracts Interface */}
      {selectedMenuItem === 'contracts' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search-contracts" className="text-sm font-medium text-gray-700 mb-2 block">
                    Search for Contract by name or sequence #
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search-contracts"
                      name="search-contracts"
                      placeholder="Search for Contract by name or sequence #"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-inactive-contracts"
                    checked={includeInactive}
                    onCheckedChange={(checked) => setIncludeInactive(!!checked)}
                  />
                  <Label htmlFor="include-inactive-contracts">Include inactive contracts</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setIsNewContractDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Contract
            </Button>
            <Button variant="outline">
              <List className="w-4 h-4 mr-2" />
              Show All
            </Button>
          </div>

          {/* Recently Opened Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Opened</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingContracts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading contracts...</span>
                </div>
              ) : filteredContracts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No contracts found. Click "New Contract" to create one.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                        <th className="text-left py-3 px-4 font-semibold">Sequence #</th>
                        <th className="text-left py-3 px-4 font-semibold">Procedures</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContracts.map((code) => {
                        const contract = code as Code & { contractType?: string; sequenceNumber?: string; proceduresCount?: number };
                        return (
                          <tr key={code.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{code.code}</td>
                            <td className="py-3 px-4 text-muted-foreground">{contract.contractType || '-'}</td>
                            <td className="py-3 px-4 font-mono text-sm">{contract.sequenceNumber || '-'}</td>
                            <td className="py-3 px-4 text-muted-foreground">{contract.proceduresCount || 0} procedures</td>
                            <td className="py-3 px-4">
                              {code.inactive ? (
                                <Badge variant="secondary">Inactive</Badge>
                              ) : (
                                <Badge variant="default">Active</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Other Menu Items Content */}
      {selectedMenuItem && selectedMenuItem !== 'procedure' && selectedMenuItem !== 'diagnosis' && selectedMenuItem !== 'icd-procedure' && selectedMenuItem !== 'revenue' && selectedMenuItem !== 'remittance' && selectedMenuItem !== 'adjustment' && selectedMenuItem !== 'inventory' && selectedMenuItem !== 'charge-panel' && selectedMenuItem !== 'fee-schedules' && selectedMenuItem !== 'contracts' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const selectedItem = codeMenuItems.find(item => item.id === selectedMenuItem);
                if (selectedItem) {
                  const IconComponent = selectedItem.icon;
                  return (
                    <>
                      <IconComponent className="w-5 h-5" />
                      {selectedItem.name}
                    </>
                  );
                }
                return null;
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {(() => {
                  const selectedItem = codeMenuItems.find(item => item.id === selectedMenuItem);
                  return selectedItem ? `Manage ${selectedItem.name.toLowerCase()} codes and configurations` : '';
                })()}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This section will contain the specific management interface for the selected code type.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Code Dialog */}
      <Dialog open={isNewCodeDialogOpen} onOpenChange={setIsNewCodeDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New CPT®/HCPCS Code</DialogTitle>
            <DialogDescription>
              Create a new procedure code with comprehensive billing and configuration options.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  name="code"
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newCode.type} onValueChange={(value) => setNewCode({ ...newCode, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPT®/HCPCS">CPT®/HCPCS</SelectItem>
                    <SelectItem value="ICD-10">ICD-10</SelectItem>
                    <SelectItem value="Revenue">Revenue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dept">Dept.</Label>
                <Input
                  id="dept"
                  name="dept"
                  value={newCode.dept}
                  onChange={(e) => setNewCode({ ...newCode, dept: e.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={newCode.description}
                onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                className="w-full h-24 p-3 border border-red-500 rounded-md"
                placeholder="Enter procedure description"
              />
              {!newCode.description && (
                <p className="text-red-500 text-sm mt-1">Please enter a description.</p>
              )}
            </div>

            <Separator />

            {/* Claim Defaults */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Claim Defaults</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excludeFromDuplicate"
                      checked={newCode.excludeFromDuplicate}
                      onCheckedChange={(checked) => setNewCode({ ...newCode, excludeFromDuplicate: !!checked })}
                    />
                    <Label htmlFor="excludeFromDuplicate">Exclude this code from duplicate service checks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allInclusive"
                      checked={newCode.allInclusive}
                      onCheckedChange={(checked) => setNewCode({ ...newCode, allInclusive: !!checked })}
                    />
                    <Label htmlFor="allInclusive">This is an all inclusive code</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="percentageOfClaim"
                      checked={newCode.percentageOfClaim}
                      onCheckedChange={(checked) => setNewCode({ ...newCode, percentageOfClaim: !!checked })}
                    />
                    <Label htmlFor="percentageOfClaim">This code is a percentage of the claim total</Label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="defaultPrice">Default Price</Label>
                    <Input
                      id="defaultPrice"
                      name="defaultPrice"
                      type="number"
                      step="0.01"
                      value={newCode.defaultPrice}
                      onChange={(e) => setNewCode({ ...newCode, defaultPrice: parseFloat(e.target.value) || 0 })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="defaultUnits">Default Units</Label>
                    <Input
                      id="defaultUnits"
                      name="defaultUnits"
                      type="number"
                      step="0.01"
                      value={newCode.defaultUnits}
                      onChange={(e) => setNewCode({ ...newCode, defaultUnits: parseFloat(e.target.value) || 1 })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="defaultChargeStatus">Default Charge Status</Label>
                    <Select value={newCode.defaultChargeStatus} onValueChange={(value) => setNewCode({ ...newCode, defaultChargeStatus: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="revCode">Rev Code</Label>
                    <div className="flex">
                      <Input
                        id="revCode"
                        name="revCode"
                        value={newCode.revCode}
                        onChange={(e) => setNewCode({ ...newCode, revCode: e.target.value })}
                        autoComplete="off"
                      />
                      <Button variant="outline" size="sm" className="ml-2">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="placeOfService">Place of Service</Label>
                    <div className="flex">
                      <Input
                        id="placeOfService"
                        name="placeOfService"
                        value={newCode.placeOfService}
                        onChange={(e) => setNewCode({ ...newCode, placeOfService: e.target.value })}
                        autoComplete="off"
                      />
                      <Button variant="outline" size="sm" className="ml-2">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cliaNumber">CLIA Number</Label>
                    <Input
                      id="cliaNumber"
                      name="cliaNumber"
                      value={newCode.cliaNumber}
                      onChange={(e) => setNewCode({ ...newCode, cliaNumber: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="typeOfService">Type of Service</Label>
                    <div className="flex">
                      <Input
                        id="typeOfService"
                        name="typeOfService"
                        value={newCode.typeOfService}
                        onChange={(e) => setNewCode({ ...newCode, typeOfService: e.target.value })}
                        autoComplete="off"
                      />
                      <Button variant="outline" size="sm" className="ml-2">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="narrativeNotes">Narrative Notes</Label>
                  <textarea
                    id="narrativeNotes"
                    name="narrativeNotes"
                    value={newCode.narrativeNotes}
                    onChange={(e) => setNewCode({ ...newCode, narrativeNotes: e.target.value })}
                    className="w-full h-20 p-3 border rounded-md"
                    placeholder="Enter narrative notes"
                  />
                </div>

                <div>
                  <Label htmlFor="additionalDescription">Additional Description (for non-specific procedure codes)</Label>
                  <textarea
                    id="additionalDescription"
                    name="additionalDescription"
                    value={newCode.additionalDescription}
                    onChange={(e) => setNewCode({ ...newCode, additionalDescription: e.target.value })}
                    className="w-full h-20 p-3 border rounded-md"
                    placeholder="Enter additional description"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Modifiers */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Modifiers</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Global Modifiers</Label>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="globalModifier1">Global 1</Label>
                      <div className="flex">
                        <Input
                          id="globalModifier1"
                          name="globalModifier1"
                          value={newCode.globalModifier1}
                          onChange={(e) => setNewCode({ ...newCode, globalModifier1: e.target.value })}
                          autoComplete="off"
                        />
                        <Button variant="outline" size="sm" className="ml-2">
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="globalModifier2">Global 2</Label>
                      <div className="flex">
                        <Input
                          id="globalModifier2"
                          name="globalModifier2"
                          value={newCode.globalModifier2}
                          onChange={(e) => setNewCode({ ...newCode, globalModifier2: e.target.value })}
                          autoComplete="off"
                        />
                        <Button variant="outline" size="sm" className="ml-2">
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="globalModifier3">Global 3</Label>
                      <div className="flex">
                        <Input
                          id="globalModifier3"
                          name="globalModifier3"
                          value={newCode.globalModifier3}
                          onChange={(e) => setNewCode({ ...newCode, globalModifier3: e.target.value })}
                          autoComplete="off"
                        />
                        <Button variant="outline" size="sm" className="ml-2">
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="globalModifier4">Global 4</Label>
                      <div className="flex">
                        <Input
                          id="globalModifier4"
                          name="globalModifier4"
                          value={newCode.globalModifier4}
                          onChange={(e) => setNewCode({ ...newCode, globalModifier4: e.target.value })}
                          autoComplete="off"
                        />
                        <Button variant="outline" size="sm" className="ml-2">
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="text-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  + Create situational modifiers
                </Button>
              </div>
            </div>

            <Separator />

            {/* Diagnosis Codes */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Diagnosis Codes</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="icd1">ICD #1</Label>
                  <div className="flex">
                    <Input
                      id="icd1"
                      name="icd1"
                      value={newCode.icd1}
                      onChange={(e) => setNewCode({ ...newCode, icd1: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm" className="ml-2">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="icd2">ICD #2</Label>
                  <div className="flex">
                    <Input
                      id="icd2"
                      name="icd2"
                      value={newCode.icd2}
                      onChange={(e) => setNewCode({ ...newCode, icd2: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm" className="ml-2">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="icd3">ICD #3</Label>
                  <div className="flex">
                    <Input
                      id="icd3"
                      name="icd3"
                      value={newCode.icd3}
                      onChange={(e) => setNewCode({ ...newCode, icd3: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm" className="ml-2">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="icd4">ICD #4</Label>
                  <div className="flex">
                    <Input
                      id="icd4"
                      name="icd4"
                      value={newCode.icd4}
                      onChange={(e) => setNewCode({ ...newCode, icd4: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm" className="ml-2">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Billing Alerts */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Billing Alerts</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label>Global Surgery Period</Label>
                    <Info className="w-4 h-4 text-gray-500" />
                  </div>
                  <Select value={newCode.globalSurgeryPeriod} onValueChange={(value) => setNewCode({ ...newCode, globalSurgeryPeriod: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="10 days">10 days</SelectItem>
                      <SelectItem value="90 days">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Label>Prior Authorization Requirements</Label>
                    <Info className="w-4 h-4 text-gray-500" />
                  </div>
                  <RadioGroup value={newCode.priorAuthRequirements} onValueChange={(value) => setNewCode({ ...newCode, priorAuthRequirements: value })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="None" id="auth-none" />
                      <Label htmlFor="auth-none">None</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="All Payers" id="auth-all" />
                      <Label htmlFor="auth-all">All Payers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Certain Payers Only" id="auth-certain" />
                      <Label htmlFor="auth-certain">Certain Payers Only</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <Separator />

            {/* Drug Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Drug Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="drugPrice">Drug Price</Label>
                  <Input
                    id="drugPrice"
                    name="drugPrice"
                    type="number"
                    step="0.01"
                    value={newCode.drugPrice}
                    onChange={(e) => setNewCode({ ...newCode, drugPrice: parseFloat(e.target.value) || 0 })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="drugUnits">Drug Units</Label>
                  <Input
                    id="drugUnits"
                    name="drugUnits"
                    type="number"
                    step="0.01"
                    value={newCode.drugUnits}
                    onChange={(e) => setNewCode({ ...newCode, drugUnits: parseFloat(e.target.value) || 1 })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="drugUnitsMeasure">Drug Units Measure</Label>
                  <Select value={newCode.drugUnitsMeasure} onValueChange={(value) => setNewCode({ ...newCode, drugUnitsMeasure: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unit (UN)">Unit (UN)</SelectItem>
                      <SelectItem value="Milligram (MG)">Milligram (MG)</SelectItem>
                      <SelectItem value="Gram (G)">Gram (G)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="drugCode">Drug Code</Label>
                  <Input
                    id="drugCode"
                    name="drugCode"
                    value={newCode.drugCode}
                    onChange={(e) => setNewCode({ ...newCode, drugCode: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="drugCodeFormat">Drug Code Format</Label>
                  <Select value={newCode.drugCodeFormat} onValueChange={(value) => setNewCode({ ...newCode, drugCodeFormat: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NDC">NDC</SelectItem>
                      <SelectItem value="UPC">UPC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Effective/Termination Dates */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Effective/Termination Dates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <div className="flex">
                    <Input
                      id="effectiveDate"
                      name="effectiveDate"
                      type="date"
                      value={newCode.effectiveDate}
                      onChange={(e) => setNewCode({ ...newCode, effectiveDate: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm" className="ml-2">
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="terminationDate">Termination Date</Label>
                  <div className="flex">
                    <Input
                      id="terminationDate"
                      name="terminationDate"
                      type="date"
                      value={newCode.terminationDate}
                      onChange={(e) => setNewCode({ ...newCode, terminationDate: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm" className="ml-2">
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Superbill Options */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Superbill Options</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="printOnSuperbills"
                    checked={newCode.printOnSuperbills}
                    onCheckedChange={(checked) => setNewCode({ ...newCode, printOnSuperbills: !!checked })}
                  />
                  <Label htmlFor="printOnSuperbills">Print this code on superbills</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      value={newCode.category}
                      onChange={(e) => setNewCode({ ...newCode, category: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      value={newCode.description}
                      onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Statement Options */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Statement Options</h3>
              <div>
                <Label htmlFor="statementDescription">Statement Description</Label>
                <Input
                  id="statementDescription"
                  name="statementDescription"
                  value={newCode.statementDescription}
                  onChange={(e) => setNewCode({ ...newCode, statementDescription: e.target.value })}
                  autoComplete="off"
                  placeholder="Statement Description"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsNewCodeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewCode}>
              Save Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Diagnosis Dialog */}
      <Dialog open={isNewDiagnosisDialogOpen} onOpenChange={setIsNewDiagnosisDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Code</DialogTitle>
            <DialogDescription>
              Create a new diagnosis code with associated procedure codes and superbill options.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Code Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="diagnosis-code">Code</Label>
                <Input
                  id="diagnosis-code"
                  name="diagnosis-code"
                  value={newDiagnosis.code}
                  onChange={(e) => setNewDiagnosis({ ...newDiagnosis, code: e.target.value })}
                  autoComplete="off"
                  className="border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="code-type">Code Type</Label>
                <Select value={newDiagnosis.codeType} onValueChange={(value) => setNewDiagnosis({ ...newDiagnosis, codeType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ICD-10">ICD-10</SelectItem>
                    <SelectItem value="ICD-9">ICD-9</SelectItem>
                    <SelectItem value="DSM-5">DSM-5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="diagnosis-description">Description</Label>
              <textarea
                id="diagnosis-description"
                name="diagnosis-description"
                value={newDiagnosis.description}
                onChange={(e) => setNewDiagnosis({ ...newDiagnosis, description: e.target.value })}
                className="w-full h-24 p-3 border border-red-500 rounded-md"
                placeholder="Enter diagnosis description"
              />
              {!newDiagnosis.description && (
                <p className="text-red-500 text-sm mt-1">Please enter a description.</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="diagnosis-effective-date">Effective Date</Label>
                <div className="flex">
                  <Input
                    id="diagnosis-effective-date"
                    name="diagnosis-effective-date"
                    type="date"
                    value={newDiagnosis.effectiveDate}
                    onChange={(e) => setNewDiagnosis({ ...newDiagnosis, effectiveDate: e.target.value })}
                    autoComplete="off"
                  />
                  <Button variant="outline" size="sm" className="ml-2">
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="diagnosis-termination-date">Termination Date</Label>
                <div className="flex">
                  <Input
                    id="diagnosis-termination-date"
                    name="diagnosis-termination-date"
                    type="date"
                    value={newDiagnosis.terminationDate}
                    onChange={(e) => setNewDiagnosis({ ...newDiagnosis, terminationDate: e.target.value })}
                    autoComplete="off"
                  />
                  <Button variant="outline" size="sm" className="ml-2">
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Default Procedure Codes */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Default Procedure Codes</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cpt1">CPT #1</Label>
                  <div className="flex">
                    <Input
                      id="cpt1"
                      name="cpt1"
                      value={newDiagnosis.cpt1}
                      onChange={(e) => setNewDiagnosis({ ...newDiagnosis, cpt1: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm" className="ml-2">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cpt2">CPT #2</Label>
                  <div className="flex">
                    <Input
                      id="cpt2"
                      name="cpt2"
                      value={newDiagnosis.cpt2}
                      onChange={(e) => setNewDiagnosis({ ...newDiagnosis, cpt2: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm" className="ml-2">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cpt3">CPT #3</Label>
                  <div className="flex">
                    <Input
                      id="cpt3"
                      name="cpt3"
                      value={newDiagnosis.cpt3}
                      onChange={(e) => setNewDiagnosis({ ...newDiagnosis, cpt3: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm" className="ml-2">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cpt4">CPT #4</Label>
                  <div className="flex">
                    <Input
                      id="cpt4"
                      name="cpt4"
                      value={newDiagnosis.cpt4}
                      onChange={(e) => setNewDiagnosis({ ...newDiagnosis, cpt4: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm" className="ml-2">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cpt5">CPT #5</Label>
                  <div className="flex">
                    <Input
                      id="cpt5"
                      name="cpt5"
                      value={newDiagnosis.cpt5}
                      onChange={(e) => setNewDiagnosis({ ...newDiagnosis, cpt5: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm" className="ml-2">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cpt6">CPT #6</Label>
                  <div className="flex">
                    <Input
                      id="cpt6"
                      name="cpt6"
                      value={newDiagnosis.cpt6}
                      onChange={(e) => setNewDiagnosis({ ...newDiagnosis, cpt6: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="sm" className="ml-2">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Superbill Options */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Superbill Options</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="print-on-superbill"
                    checked={newDiagnosis.printOnSuperbill}
                    onCheckedChange={(checked) => setNewDiagnosis({ ...newDiagnosis, printOnSuperbill: !!checked })}
                  />
                  <Label htmlFor="print-on-superbill">Print code on Superbill</Label>
                </div>
                <div>
                  <Label htmlFor="superbill-description">Superbill description</Label>
                  <Input
                    id="superbill-description"
                    name="superbill-description"
                    value={newDiagnosis.superbillDescription}
                    onChange={(e) => setNewDiagnosis({ ...newDiagnosis, superbillDescription: e.target.value })}
                    autoComplete="off"
                    placeholder="Enter superbill description"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsNewDiagnosisDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewDiagnosis}>
              Save Diagnosis
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New ICD Procedure Dialog */}
      <Dialog open={isNewICDProcedureDialogOpen} onOpenChange={setIsNewICDProcedureDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ICD Procedure Codes</DialogTitle>
            <DialogDescription>
              Create a new ICD procedure code with description and type.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Code Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icd-procedure-code">Code</Label>
                <Input
                  id="icd-procedure-code"
                  name="icd-procedure-code"
                  value={newICDProcedure.code}
                  onChange={(e) => setNewICDProcedure({ ...newICDProcedure, code: e.target.value })}
                  autoComplete="off"
                  className="border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="icd-code-type">Code Type</Label>
                <Select value={newICDProcedure.codeType} onValueChange={(value) => setNewICDProcedure({ ...newICDProcedure, codeType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ICD-10">ICD-10</SelectItem>
                    <SelectItem value="ICD-9">ICD-9</SelectItem>
                    <SelectItem value="ICD-PCS">ICD-PCS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="icd-procedure-description">Description</Label>
              <textarea
                id="icd-procedure-description"
                name="icd-procedure-description"
                value={newICDProcedure.description}
                onChange={(e) => setNewICDProcedure({ ...newICDProcedure, description: e.target.value })}
                className="w-full h-24 p-3 border border-red-500 rounded-md"
                placeholder="Enter ICD procedure description"
              />
              {!newICDProcedure.description && (
                <p className="text-red-500 text-sm mt-1">Please enter a description.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsNewICDProcedureDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveNewICDProcedure}>
              <Check className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Revenue Dialog */}
      <Dialog open={isNewRevenueDialogOpen} onOpenChange={setIsNewRevenueDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Revenue Code</DialogTitle>
            <DialogDescription>
              Create a new revenue code with pricing and configuration options.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Code and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revenue-code">Code</Label>
                <Input
                  id="revenue-code"
                  name="revenue-code"
                  value={newRevenue.code}
                  onChange={(e) => setNewRevenue({ ...newRevenue, code: e.target.value })}
                  autoComplete="off"
                  className="border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="revenue-price">Price</Label>
                <Input
                  id="revenue-price"
                  name="revenue-price"
                  type="number"
                  step="0.01"
                  value={newRevenue.price}
                  onChange={(e) => setNewRevenue({ ...newRevenue, price: parseFloat(e.target.value) || 0 })}
                  autoComplete="off"
                  readOnly
                />
              </div>
            </div>

            {/* Exclude from Duplicate Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="exclude-from-duplicate-revenue"
                checked={newRevenue.excludeFromDuplicate}
                onCheckedChange={(checked) => setNewRevenue({ ...newRevenue, excludeFromDuplicate: !!checked })}
              />
              <Label htmlFor="exclude-from-duplicate-revenue">Exclude this code from duplicate service checks</Label>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="revenue-description">Description</Label>
              <textarea
                id="revenue-description"
                name="revenue-description"
                value={newRevenue.description}
                onChange={(e) => setNewRevenue({ ...newRevenue, description: e.target.value })}
                className="w-full h-24 p-3 border border-red-500 rounded-md"
                placeholder="Enter revenue code description"
              />
              {!newRevenue.description && (
                <p className="text-red-500 text-sm mt-1">Please enter a description.</p>
              )}
            </div>

            <Separator />

            {/* Statement Options */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-blue-600 text-white p-2 rounded">Statement Options</h3>
              <div>
                <Label htmlFor="statement-description">Statement Description</Label>
                <Input
                  id="statement-description"
                  name="statement-description"
                  value={newRevenue.statementDescription}
                  onChange={(e) => setNewRevenue({ ...newRevenue, statementDescription: e.target.value })}
                  autoComplete="off"
                  placeholder="Enter statement description"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsNewRevenueDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewRevenue}>
              Save Revenue Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Remittance Dialog */}
      <Dialog open={isNewRemittanceDialogOpen} onOpenChange={setIsNewRemittanceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Code</DialogTitle>
            <DialogDescription>
              Create a new remittance code with type, information level, and reporting options.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Code Field */}
            <div>
              <Label htmlFor="remittance-code">Code</Label>
              <Input
                id="remittance-code"
                name="remittance-code"
                value={newRemittance.code}
                onChange={(e) => setNewRemittance({ ...newRemittance, code: e.target.value })}
                autoComplete="off"
                className="border-red-500"
              />
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="remittance-type">Type</Label>
              <Select value={newRemittance.type} onValueChange={(value) => setNewRemittance({ ...newRemittance, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adj Reason">Adj Reason</SelectItem>
                  <SelectItem value="Remark">Remark</SelectItem>
                  <SelectItem value="Denial">Denial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Information Level */}
            <div>
              <Label htmlFor="information-level">Information Level</Label>
              <Select value={newRemittance.informationLevel} onValueChange={(value) => setNewRemittance({ ...newRemittance, informationLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFO - This code represents general information only.">INFO - This code represents general information only.</SelectItem>
                  <SelectItem value="WARN - This code represents a warning condition.">WARN - This code represents a warning condition.</SelectItem>
                  <SelectItem value="ERROR - This code represents an error condition.">ERROR - This code represents an error condition.</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Report Inclusion Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-on-denial-reports"
                  checked={newRemittance.includeOnDenialReports}
                  onCheckedChange={(checked) => setNewRemittance({ ...newRemittance, includeOnDenialReports: !!checked })}
                />
                <Label htmlFor="include-on-denial-reports">Include this code on my denial reports</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-on-adjustment-reports"
                  checked={newRemittance.includeOnAdjustmentReports}
                  onCheckedChange={(checked) => setNewRemittance({ ...newRemittance, includeOnAdjustmentReports: !!checked })}
                />
                <Label htmlFor="include-on-adjustment-reports">Include this code on my adjustment reason reports</Label>
              </div>
            </div>

            {/* Description Fields */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="report-description">Report Description</Label>
                <Input
                  id="report-description"
                  name="report-description"
                  value={newRemittance.reportDescription}
                  onChange={(e) => setNewRemittance({ ...newRemittance, reportDescription: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="long-description">Long Description</Label>
                <Input
                  id="long-description"
                  name="long-description"
                  value={newRemittance.longDescription}
                  onChange={(e) => setNewRemittance({ ...newRemittance, longDescription: e.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>

            <Separator />

            {/* Memoline Section */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <Label className="text-sm font-medium">Memoline</Label>
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use-memoline"
                    checked={newRemittance.useMemoline}
                    onCheckedChange={(checked) => setNewRemittance({ ...newRemittance, useMemoline: !!checked })}
                  />
                  <Label htmlFor="use-memoline">Use Memoline on Activity and Statements</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsNewRemittanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewRemittance}>
              Save Remittance Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Adjustment Dialog */}
      <Dialog open={isNewAdjustmentDialogOpen} onOpenChange={setIsNewAdjustmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Adjustment Code</DialogTitle>
            <DialogDescription>
              Create a new adjustment code with type and description.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Code Field */}
            <div>
              <Label htmlFor="adjustment-code">Code</Label>
              <Input
                id="adjustment-code"
                name="adjustment-code"
                value={newAdjustment.code}
                onChange={(e) => setNewAdjustment({ ...newAdjustment, code: e.target.value })}
                autoComplete="off"
                className="border-red-500"
              />
            </div>

            {/* Adjustment Type */}
            <div>
              <Label htmlFor="adjustment-type">Adjustment Type</Label>
              <Select value={newAdjustment.adjustmentType} onValueChange={(value) => setNewAdjustment({ ...newAdjustment, adjustmentType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit">Credit</SelectItem>
                  <SelectItem value="Debit">Debit</SelectItem>
                  <SelectItem value="Discount">Discount</SelectItem>
                  <SelectItem value="Write-off">Write-off</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="adjustment-description">Description</Label>
              <Input
                id="adjustment-description"
                name="adjustment-description"
                value={newAdjustment.description}
                onChange={(e) => setNewAdjustment({ ...newAdjustment, description: e.target.value })}
                autoComplete="off"
                className="border-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsNewAdjustmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewAdjustment}>
              Save Adjustment Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Inventory Dialog */}
      <Dialog open={isNewInventoryDialogOpen} onOpenChange={setIsNewInventoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Inventory</DialogTitle>
            <DialogDescription>
              Create a new inventory code with details and descriptions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Code Field */}
            <div>
              <Label htmlFor="inventory-code">Code</Label>
              <Input
                id="inventory-code"
                name="inventory-code"
                value={newInventory.code}
                onChange={(e) => setNewInventory({ ...newInventory, code: e.target.value })}
                autoComplete="off"
                className="border-blue-500"
              />
            </div>

            {/* Procedure Code */}
            <div>
              <Label htmlFor="procedure-code">Procedure Code</Label>
              <div className="flex gap-2">
                <Input
                  id="procedure-code"
                  name="procedure-code"
                  value={newInventory.procedureCode}
                  onChange={(e) => setNewInventory({ ...newInventory, procedureCode: e.target.value })}
                  autoComplete="off"
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={newInventory.quantity}
                  onChange={(e) => setNewInventory({ ...newInventory, quantity: parseInt(e.target.value) || 0 })}
                  autoComplete="off"
                  className="w-32"
                />
                <div className="flex flex-col">
                  <Button variant="outline" size="sm" className="h-4 w-6 p-0">
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-4 w-6 p-0">
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Code Description */}
            <div>
              <Label htmlFor="code-description">Code Description</Label>
              <textarea
                id="code-description"
                name="code-description"
                value={newInventory.codeDescription}
                onChange={(e) => setNewInventory({ ...newInventory, codeDescription: e.target.value })}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter code description..."
              />
            </div>

            {/* Billing Description */}
            <div>
              <Label htmlFor="billing-description">Billing Description</Label>
              <textarea
                id="billing-description"
                name="billing-description"
                value={newInventory.billingDescription}
                onChange={(e) => setNewInventory({ ...newInventory, billingDescription: e.target.value })}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter billing description..."
              />
            </div>

            {/* Use Alert Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-alert"
                checked={newInventory.useAlert}
                onCheckedChange={(checked) => setNewInventory({ ...newInventory, useAlert: !!checked })}
              />
              <Label htmlFor="use-alert">Use Alert</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsNewInventoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewInventory}>
              Save Inventory
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Charge Panel Dialog */}
      <Dialog open={isNewChargePanelDialogOpen} onOpenChange={setIsNewChargePanelDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>New Charge Panel</DialogTitle>
            <DialogDescription>
              Create a new charge panel with general information and code details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* General Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">General Information</h3>
              
              {/* Title */}
              <div>
                <Label htmlFor="charge-panel-title">Title</Label>
                <Input
                  id="charge-panel-title"
                  name="charge-panel-title"
                  value={newChargePanel.title}
                  onChange={(e) => setNewChargePanel({ ...newChargePanel, title: e.target.value })}
                  autoComplete="off"
                  className="border-blue-500"
                />
              </div>

              {/* Code and Type Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="charge-panel-code">Code</Label>
                  <Input
                    id="charge-panel-code"
                    name="charge-panel-code"
                    value={newChargePanel.code}
                    onChange={(e) => setNewChargePanel({ ...newChargePanel, code: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="charge-panel-type">Type</Label>
                  <Select value={newChargePanel.type} onValueChange={(value) => setNewChargePanel({ ...newChargePanel, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Facility">Facility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="charge-panel-description">Description</Label>
                <textarea
                  id="charge-panel-description"
                  name="charge-panel-description"
                  value={newChargePanel.description}
                  onChange={(e) => setNewChargePanel({ ...newChargePanel, description: e.target.value })}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter description..."
                />
              </div>
            </div>

            {/* Code Details Table Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Code Details</h3>
              
              <div className="overflow-x-auto border border-gray-300 rounded-md">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-xs">Code</th>
                      <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-xs">POS</th>
                      <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-xs">TOS</th>
                      <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-xs">Modifier Options</th>
                      <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-xs">Modifier 1</th>
                      <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-xs">Modifier 2</th>
                      <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-xs">Modifier 3</th>
                      <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-xs">Modifier 4</th>
                      <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-xs">Price</th>
                      <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-xs">Units</th>
                      <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-xs">Total</th>
                      <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-xs">Other</th>
                      <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-xs">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newChargePanel.codeDetails.map((detail, index) => (
                      <tr key={detail.id}>
                        <td className="border border-gray-300 px-2 py-2">
                          <div className="flex items-center gap-1">
                            <Input
                              value={detail.code}
                              onChange={(e) => {
                                const updatedDetails = [...newChargePanel.codeDetails];
                                updatedDetails[index].code = e.target.value;
                                setNewChargePanel({ ...newChargePanel, codeDetails: updatedDetails });
                              }}
                              className="w-20 text-xs"
                              autoComplete="off"
                            />
                            <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                              <Search className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <div className="flex items-center gap-1">
                            <Input
                              value={detail.pos}
                              onChange={(e) => {
                                const updatedDetails = [...newChargePanel.codeDetails];
                                updatedDetails[index].pos = e.target.value;
                                setNewChargePanel({ ...newChargePanel, codeDetails: updatedDetails });
                              }}
                              className="w-16 text-xs"
                              autoComplete="off"
                            />
                            <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                              <Search className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <div className="flex items-center gap-1">
                            <Input
                              value={detail.tos}
                              onChange={(e) => {
                                const updatedDetails = [...newChargePanel.codeDetails];
                                updatedDetails[index].tos = e.target.value;
                                setNewChargePanel({ ...newChargePanel, codeDetails: updatedDetails });
                              }}
                              className="w-16 text-xs"
                              autoComplete="off"
                            />
                            <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                              <Search className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <Select value={detail.modifierOptions} onValueChange={(value) => {
                            const updatedDetails = [...newChargePanel.codeDetails];
                            updatedDetails[index].modifierOptions = value;
                            setNewChargePanel({ ...newChargePanel, codeDetails: updatedDetails });
                          }}>
                            <SelectTrigger className="w-24 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Code Defaults">Code Defaults</SelectItem>
                              <SelectItem value="Custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <div className="flex items-center gap-1">
                            <Input
                              value={detail.modifier1}
                              onChange={(e) => {
                                const updatedDetails = [...newChargePanel.codeDetails];
                                updatedDetails[index].modifier1 = e.target.value;
                                setNewChargePanel({ ...newChargePanel, codeDetails: updatedDetails });
                              }}
                              className="w-12 text-xs"
                              autoComplete="off"
                            />
                            <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                              <Search className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <div className="flex items-center gap-1">
                            <Input
                              value={detail.modifier2}
                              onChange={(e) => {
                                const updatedDetails = [...newChargePanel.codeDetails];
                                updatedDetails[index].modifier2 = e.target.value;
                                setNewChargePanel({ ...newChargePanel, codeDetails: updatedDetails });
                              }}
                              className="w-12 text-xs"
                              autoComplete="off"
                            />
                            <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                              <Search className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <div className="flex items-center gap-1">
                            <Input
                              value={detail.modifier3}
                              onChange={(e) => {
                                const updatedDetails = [...newChargePanel.codeDetails];
                                updatedDetails[index].modifier3 = e.target.value;
                                setNewChargePanel({ ...newChargePanel, codeDetails: updatedDetails });
                              }}
                              className="w-12 text-xs"
                              autoComplete="off"
                            />
                            <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                              <Search className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <div className="flex items-center gap-1">
                            <Input
                              value={detail.modifier4}
                              onChange={(e) => {
                                const updatedDetails = [...newChargePanel.codeDetails];
                                updatedDetails[index].modifier4 = e.target.value;
                                setNewChargePanel({ ...newChargePanel, codeDetails: updatedDetails });
                              }}
                              className="w-12 text-xs"
                              autoComplete="off"
                            />
                            <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                              <Search className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <Select value={detail.price} onValueChange={(value) => {
                            const updatedDetails = [...newChargePanel.codeDetails];
                            updatedDetails[index].price = value;
                            setNewChargePanel({ ...newChargePanel, codeDetails: updatedDetails });
                          }}>
                            <SelectTrigger className="w-20 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Code Default">Code Default</SelectItem>
                              <SelectItem value="Custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <Input
                            value={detail.units}
                            onChange={(e) => {
                              const updatedDetails = [...newChargePanel.codeDetails];
                              updatedDetails[index].units = e.target.value;
                              setNewChargePanel({ ...newChargePanel, codeDetails: updatedDetails });
                            }}
                            className="w-16 text-xs"
                            autoComplete="off"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <Input
                            value={detail.total}
                            onChange={(e) => {
                              const updatedDetails = [...newChargePanel.codeDetails];
                              updatedDetails[index].total = e.target.value;
                              setNewChargePanel({ ...newChargePanel, codeDetails: updatedDetails });
                            }}
                            className="w-16 text-xs"
                            autoComplete="off"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <Input
                            value={detail.other}
                            onChange={(e) => {
                              const updatedDetails = [...newChargePanel.codeDetails];
                              updatedDetails[index].other = e.target.value;
                              setNewChargePanel({ ...newChargePanel, codeDetails: updatedDetails });
                            }}
                            className="w-16 text-xs"
                            autoComplete="off"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          <Checkbox
                            checked={detail.delete}
                            onCheckedChange={(checked) => {
                              const updatedDetails = [...newChargePanel.codeDetails];
                              updatedDetails[index].delete = !!checked;
                              setNewChargePanel({ ...newChargePanel, codeDetails: updatedDetails });
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsNewChargePanelDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewChargePanel}>
              Save Charge Panel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Fee Schedule Dialog */}
      <Dialog open={isNewFeeScheduleDialogOpen} onOpenChange={setIsNewFeeScheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Fee Schedule</DialogTitle>
            <DialogDescription>
              Please choose how you would like to create the prices on this fee schedule.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <RadioGroup
              value={newFeeSchedule.priceCreationMethod}
              onValueChange={(value) => setNewFeeSchedule({ ...newFeeSchedule, priceCreationMethod: value })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="empty" id="fee-schedule-empty" />
                <Label htmlFor="fee-schedule-empty" className="cursor-pointer">Create an empty fee schedule</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="another-fee-schedule" id="another-fee-schedule" />
                <Label htmlFor="another-fee-schedule" className="cursor-pointer">
                  Set prices based on another fee schedule
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medicare" id="fee-schedule-medicare" />
                <Label htmlFor="fee-schedule-medicare" className="cursor-pointer">
                  Set prices based on the Medicare Fee Schedule
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="contract" id="fee-schedule-contract" />
                <Label htmlFor="fee-schedule-contract" className="cursor-pointer">
                  Set prices based on a Contract
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="charges" id="fee-schedule-charges" />
                <Label htmlFor="fee-schedule-charges" className="cursor-pointer">
                  Set prices based on charges entered
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="import" id="fee-schedule-import" />
                <Label htmlFor="fee-schedule-import" className="cursor-pointer">
                  Import prices
                </Label>
              </div>
            </RadioGroup>

            {/* Fee Schedule Selection and Adjust Prices - shown when "another-fee-schedule" is selected */}
            {newFeeSchedule.priceCreationMethod === 'another-fee-schedule' && (
              <div className="space-y-6 mt-6 pt-6 border-t">
                {/* Fee Schedule Selection Table */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Fee Schedule Selection</h3>
                  <div className="overflow-x-auto border border-gray-300 rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left py-3 px-4 font-semibold">Fee Schedule</th>
                          <th className="text-left py-3 px-4 font-semibold">Effective From</th>
                          <th className="text-left py-3 px-4 font-semibold">Effective To</th>
                          <th className="text-left py-3 px-4 font-semibold">Sequence #</th>
                        </tr>
                      </thead>
                      <tbody>
                        {anotherFeeScheduleSettings.selectedFeeSchedules.map((schedule) => (
                          <tr key={schedule.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="fee-schedule-selection"
                                  id={`schedule-${schedule.id}`}
                                  checked={schedule.selected}
                                  onChange={() => {
                                    const updated = anotherFeeScheduleSettings.selectedFeeSchedules.map(s =>
                                      s.id === schedule.id ? { ...s, selected: true } : { ...s, selected: false }
                                    );
                                    setAnotherFeeScheduleSettings({
                                      ...anotherFeeScheduleSettings,
                                      selectedFeeSchedules: updated
                                    });
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor={`schedule-${schedule.id}`} className="cursor-pointer">
                                  {schedule.name}
                                </Label>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Input
                                type="date"
                                value={schedule.effectiveFrom}
                                onChange={(e) => {
                                  const updated = anotherFeeScheduleSettings.selectedFeeSchedules.map(s =>
                                    s.id === schedule.id ? { ...s, effectiveFrom: e.target.value } : s
                                  );
                                  setAnotherFeeScheduleSettings({
                                    ...anotherFeeScheduleSettings,
                                    selectedFeeSchedules: updated
                                  });
                                }}
                                className="w-full"
                                autoComplete="off"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <Input
                                type="date"
                                value={schedule.effectiveTo}
                                onChange={(e) => {
                                  const updated = anotherFeeScheduleSettings.selectedFeeSchedules.map(s =>
                                    s.id === schedule.id ? { ...s, effectiveTo: e.target.value } : s
                                  );
                                  setAnotherFeeScheduleSettings({
                                    ...anotherFeeScheduleSettings,
                                    selectedFeeSchedules: updated
                                  });
                                }}
                                className="w-full"
                                autoComplete="off"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={schedule.sequenceNumber}
                                  onChange={(e) => {
                                    const updated = anotherFeeScheduleSettings.selectedFeeSchedules.map(s =>
                                      s.id === schedule.id ? { ...s, sequenceNumber: e.target.value } : s
                                    );
                                    setAnotherFeeScheduleSettings({
                                      ...anotherFeeScheduleSettings,
                                      selectedFeeSchedules: updated
                                    });
                                  }}
                                  placeholder="Sequence #"
                                  className="w-full"
                                  autoComplete="off"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    const newSchedule = {
                                      id: String(Date.now()),
                                      name: 'Fee Schedule',
                                      effectiveFrom: '',
                                      effectiveTo: '',
                                      sequenceNumber: '',
                                      selected: false
                                    };
                                    setAnotherFeeScheduleSettings({
                                      ...anotherFeeScheduleSettings,
                                      selectedFeeSchedules: [...anotherFeeScheduleSettings.selectedFeeSchedules, newSchedule]
                                    });
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Adjust Prices Section */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Adjust Prices</h3>
                    
                    <RadioGroup
                      value={anotherFeeScheduleSettings.priceAdjustment}
                      onValueChange={(value) => setAnotherFeeScheduleSettings({ ...anotherFeeScheduleSettings, priceAdjustment: value })}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no-adjustment" id="another-no-adjustment" />
                        <Label htmlFor="another-no-adjustment">Do not adjust the prices of the new Fee Schedule</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="increase" id="another-increase" />
                        <Label htmlFor="another-increase" className="flex items-center space-x-2">
                          <span>Increase prices by</span>
                          <Input
                            value={anotherFeeScheduleSettings.increaseBy}
                            onChange={(e) => setAnotherFeeScheduleSettings({ ...anotherFeeScheduleSettings, increaseBy: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>%</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="decrease" id="another-decrease" />
                        <Label htmlFor="another-decrease" className="flex items-center space-x-2">
                          <span>Decrease prices by</span>
                          <Input
                            value={anotherFeeScheduleSettings.decreaseBy}
                            onChange={(e) => setAnotherFeeScheduleSettings({ ...anotherFeeScheduleSettings, decreaseBy: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>%</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="adjust-to" id="another-adjust-to" />
                        <Label htmlFor="another-adjust-to" className="flex items-center space-x-2">
                          <span>Adjust prices to</span>
                          <Input
                            value={anotherFeeScheduleSettings.adjustTo}
                            onChange={(e) => setAnotherFeeScheduleSettings({ ...anotherFeeScheduleSettings, adjustTo: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>times (or</span>
                          <Input
                            value={anotherFeeScheduleSettings.adjustToPercent}
                            onChange={(e) => setAnotherFeeScheduleSettings({ ...anotherFeeScheduleSettings, adjustToPercent: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>% of) the selected prices</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="another-round-up"
                          checked={anotherFeeScheduleSettings.roundUp}
                          onCheckedChange={(checked) => setAnotherFeeScheduleSettings({ ...anotherFeeScheduleSettings, roundUp: !!checked })}
                        />
                        <Label htmlFor="another-round-up">Round prices up to the next whole dollar amount</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Medicare Fee Schedule Settings - shown when "medicare" is selected */}
            {newFeeSchedule.priceCreationMethod === 'medicare' && (
              <div className="space-y-6 mt-6 pt-6 border-t">
                {/* Medicare Fee Schedule Year */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="medicare-fee-schedule-year" className="text-sm font-medium text-gray-700 mb-2 block">
                      Medicare Fee Schedule Year
                    </Label>
                    <Select value={medicareSettings.feeScheduleYear} onValueChange={(value) => setMedicareSettings({ ...medicareSettings, feeScheduleYear: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Medicare Carrier and Locality */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Medicare Carrier and Locality</h3>
                    
                    <RadioGroup
                      value={medicareSettings.carrierMethod}
                      onValueChange={(value) => setMedicareSettings({ ...medicareSettings, carrierMethod: value })}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="zip-code" id="medicare-zip-code" />
                        <Label htmlFor="medicare-zip-code" className="flex items-center space-x-2">
                          <span>Use your ZIP code</span>
                          <Input
                            value={medicareSettings.zipCode}
                            onChange={(e) => setMedicareSettings({ ...medicareSettings, zipCode: e.target.value })}
                            placeholder="ZIP code"
                            className="w-32"
                            autoComplete="off"
                          />
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="carrier-locality" id="medicare-carrier-locality" />
                        <Label htmlFor="medicare-carrier-locality" className="flex items-center space-x-2">
                          <span>Enter the carrier and locality</span>
                          <Input
                            value={medicareSettings.carrier}
                            onChange={(e) => setMedicareSettings({ ...medicareSettings, carrier: e.target.value })}
                            placeholder="Carrier"
                            className="w-32"
                            autoComplete="off"
                          />
                          <Input
                            value={medicareSettings.locality}
                            onChange={(e) => setMedicareSettings({ ...medicareSettings, locality: e.target.value })}
                            placeholder="Locality"
                            className="w-32"
                            autoComplete="off"
                          />
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Pricing Method */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Pricing Method</h3>
                    
                    <RadioGroup
                      value={medicareSettings.pricingMethod}
                      onValueChange={(value) => setMedicareSettings({ ...medicareSettings, pricingMethod: value })}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="non-facility" id="medicare-non-facility" />
                          <Label htmlFor="medicare-non-facility">Non-facility pricing</Label>
                        </div>
                        <div className="flex items-center space-x-2 ml-6">
                          <Checkbox
                            id="medicare-include-non-applicable"
                            checked={medicareSettings.includeNonApplicable}
                            onCheckedChange={(checked) => setMedicareSettings({ ...medicareSettings, includeNonApplicable: !!checked })}
                          />
                          <Label htmlFor="medicare-include-non-applicable">Include prices for codes that are not applicable for non-facility</Label>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="facility" id="medicare-facility" />
                        <Label htmlFor="medicare-facility">Facility pricing</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Adjust Prices Section */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Adjust Prices</h3>
                    
                    <RadioGroup
                      value={medicareSettings.priceAdjustment}
                      onValueChange={(value) => setMedicareSettings({ ...medicareSettings, priceAdjustment: value })}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no-adjustment" id="medicare-inline-no-adjustment" />
                        <Label htmlFor="medicare-inline-no-adjustment">Do not adjust the prices of the new Fee Schedule</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="increase" id="medicare-inline-increase" />
                        <Label htmlFor="medicare-inline-increase" className="flex items-center space-x-2">
                          <span>Increase prices by</span>
                          <Input
                            value={medicareSettings.increaseBy}
                            onChange={(e) => setMedicareSettings({ ...medicareSettings, increaseBy: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>%</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="decrease" id="medicare-inline-decrease" />
                        <Label htmlFor="medicare-inline-decrease" className="flex items-center space-x-2">
                          <span>Decrease prices by</span>
                          <Input
                            value={medicareSettings.decreaseBy}
                            onChange={(e) => setMedicareSettings({ ...medicareSettings, decreaseBy: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>%</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="adjust-to" id="medicare-inline-adjust-to" />
                        <Label htmlFor="medicare-inline-adjust-to" className="flex items-center space-x-2">
                          <span>Adjust prices to</span>
                          <Input
                            value={medicareSettings.adjustTo}
                            onChange={(e) => setMedicareSettings({ ...medicareSettings, adjustTo: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>times (or</span>
                          <Input
                            value={medicareSettings.adjustToPercent}
                            onChange={(e) => setMedicareSettings({ ...medicareSettings, adjustToPercent: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>% of) the selected prices</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="medicare-inline-round-up"
                          checked={medicareSettings.roundUp}
                          onCheckedChange={(checked) => setMedicareSettings({ ...medicareSettings, roundUp: !!checked })}
                        />
                        <Label htmlFor="medicare-inline-round-up">Round prices up to the next whole dollar amount</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Contract Settings - shown when "contract" is selected */}
            {newFeeSchedule.priceCreationMethod === 'contract' && (
              <div className="space-y-6 mt-6 pt-6 border-t">
                {/* Contract Selection Method */}
                <div className="space-y-4">
                  <RadioGroup
                    value={contractBasedSettings.contractMethod}
                    onValueChange={(value) => setContractBasedSettings({ ...contractBasedSettings, contractMethod: value })}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="maximum-price" id="contract-maximum-price" />
                      <Label htmlFor="contract-maximum-price">Use the maximum contract price for each code</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="specific-contract" id="contract-specific" />
                      <Label htmlFor="contract-specific">Base prices on a specific contract</Label>
                    </div>
                  </RadioGroup>

                  {/* Show contract selector when "specific-contract" is selected */}
                  {contractBasedSettings.contractMethod === 'specific-contract' && (
                    <div className="ml-6 mt-2">
                      <Label htmlFor="select-contract" className="text-sm font-medium text-gray-700 mb-2 block">
                        Specify Contract
                      </Label>
                      <Select 
                        value={contractBasedSettings.selectedContract} 
                        onValueChange={(value) => setContractBasedSettings({ ...contractBasedSettings, selectedContract: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a contract" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contract1">Contract 1 - Medicare FFS</SelectItem>
                          <SelectItem value="contract2">Contract 2 - HMO Standard</SelectItem>
                          <SelectItem value="contract3">Contract 3 - PPO Premium</SelectItem>
                          <SelectItem value="contract4">Contract 4 - Medicaid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Adjust Prices Section */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Adjust Prices</h3>
                    
                    <RadioGroup
                      value={contractBasedSettings.priceAdjustment}
                      onValueChange={(value) => setContractBasedSettings({ ...contractBasedSettings, priceAdjustment: value })}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no-adjustment" id="contract-no-adjustment" />
                        <Label htmlFor="contract-no-adjustment">Do not adjust the prices of the new Fee Schedule</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="increase" id="contract-increase" />
                        <Label htmlFor="contract-increase" className="flex items-center space-x-2">
                          <span>Increase prices by</span>
                          <Input
                            value={contractBasedSettings.increaseBy}
                            onChange={(e) => setContractBasedSettings({ ...contractBasedSettings, increaseBy: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>%</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="decrease" id="contract-decrease" />
                        <Label htmlFor="contract-decrease" className="flex items-center space-x-2">
                          <span>Decrease prices by</span>
                          <Input
                            value={contractBasedSettings.decreaseBy}
                            onChange={(e) => setContractBasedSettings({ ...contractBasedSettings, decreaseBy: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>%</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="adjust-to" id="contract-adjust-to" />
                        <Label htmlFor="contract-adjust-to" className="flex items-center space-x-2">
                          <span>Adjust prices to</span>
                          <Input
                            value={contractBasedSettings.adjustTo}
                            onChange={(e) => setContractBasedSettings({ ...contractBasedSettings, adjustTo: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>times (or</span>
                          <Input
                            value={contractBasedSettings.adjustToPercent}
                            onChange={(e) => setContractBasedSettings({ ...contractBasedSettings, adjustToPercent: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>% of) the selected prices</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="contract-round-up"
                          checked={contractBasedSettings.roundUp}
                          onCheckedChange={(checked) => setContractBasedSettings({ ...contractBasedSettings, roundUp: !!checked })}
                        />
                        <Label htmlFor="contract-round-up">Round prices up to the next whole dollar amount</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Charges Based Settings - shown when "charges" is selected */}
            {newFeeSchedule.priceCreationMethod === 'charges' && (
              <div className="space-y-6 mt-6 pt-6 border-t">
                {/* Days Input */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Set the prices based on the maximum amount entered in the last
                    </Label>
                    <Input
                      value={chargesBasedSettings.days}
                      onChange={(e) => setChargesBasedSettings({ ...chargesBasedSettings, days: e.target.value })}
                      className="w-20"
                      type="number"
                      min="1"
                      autoComplete="off"
                    />
                    <Label className="text-sm font-medium text-gray-700">days.</Label>
                  </div>
                </div>

                {/* Adjust Prices Section */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Adjust Prices</h3>
                    
                    <RadioGroup
                      value={chargesBasedSettings.priceAdjustment}
                      onValueChange={(value) => setChargesBasedSettings({ ...chargesBasedSettings, priceAdjustment: value })}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no-adjustment" id="charges-no-adjustment" />
                        <Label htmlFor="charges-no-adjustment">Do not adjust the prices of the new Fee Schedule</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="increase" id="charges-increase" />
                        <Label htmlFor="charges-increase" className="flex items-center space-x-2">
                          <span>Increase prices by</span>
                          <Input
                            value={chargesBasedSettings.increaseBy}
                            onChange={(e) => setChargesBasedSettings({ ...chargesBasedSettings, increaseBy: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>%</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="decrease" id="charges-decrease" />
                        <Label htmlFor="charges-decrease" className="flex items-center space-x-2">
                          <span>Decrease prices by</span>
                          <Input
                            value={chargesBasedSettings.decreaseBy}
                            onChange={(e) => setChargesBasedSettings({ ...chargesBasedSettings, decreaseBy: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>%</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="adjust-to" id="charges-adjust-to" />
                        <Label htmlFor="charges-adjust-to" className="flex items-center space-x-2">
                          <span>Adjust prices to</span>
                          <Input
                            value={chargesBasedSettings.adjustTo}
                            onChange={(e) => setChargesBasedSettings({ ...chargesBasedSettings, adjustTo: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>times (or</span>
                          <Input
                            value={chargesBasedSettings.adjustToPercent}
                            onChange={(e) => setChargesBasedSettings({ ...chargesBasedSettings, adjustToPercent: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>% of) the selected prices</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="charges-round-up"
                          checked={chargesBasedSettings.roundUp}
                          onCheckedChange={(checked) => setChargesBasedSettings({ ...chargesBasedSettings, roundUp: !!checked })}
                        />
                        <Label htmlFor="charges-round-up">Round prices up to the next whole dollar amount</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Import Prices Settings - shown when "import" is selected */}
            {newFeeSchedule.priceCreationMethod === 'import' && (
              <div className="space-y-6 mt-6 pt-6 border-t">
                {/* File to Import Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Label htmlFor="fee-schedule-file-to-import" className="text-sm font-medium text-gray-700 mb-2 block">
                        File to Import
                      </Label>
                      <Input
                        id="fee-schedule-file-to-import"
                        name="fee-schedule-file-to-import"
                        value={importSettings.fileName}
                        placeholder="No file selected"
                        readOnly
                        className="bg-gray-50"
                        autoComplete="off"
                      />
                    </div>
                    <div className="pt-6">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.csv,.xls,.xlsx';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              setImportSettings({
                                ...importSettings,
                                selectedFile: file,
                                fileName: file.name
                              });
                            }
                          };
                          input.click();
                        }}
                      >
                        Select a File
                      </Button>
                    </div>
                  </div>

                  {/* Information Text */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Supported formats: Comma delimited (.csv), Excel (.xls or .xlsx)</p>
                    <p>Note: Excel file import will only import the first sheet.</p>
                    <p>Codes can have a maximum of 10 characters.</p>
                  </div>
                </div>

                {/* Example Format Section */}
                <div className="space-y-4">
                  <div className="bg-teal-50 border border-teal-200 rounded-md p-4">
                    <h3 className="text-lg font-semibold text-teal-900 mb-4">Example Format</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Column headers must be the first row. Columns marked with a * are required.
                    </p>
                    
                    <div className="overflow-x-auto border border-gray-300 rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Code*</th>
                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Description</th>
                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Default</th>
                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Price*</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-300">
                            <td className="border border-gray-300 px-3 py-2 font-mono">99212</td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              <div>If the code is not in your local list, it's added with this description.</div>
                              <div className="font-semibold">OFFICE VISIT</div>
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              <div>If the code is not in your local list, it's added with this default price.</div>
                              <div className="font-semibold">45.00</div>
                            </td>
                            <td className="border border-gray-300 px-3 py-2 font-mono">50.25</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Adjust Prices Section */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Adjust Prices</h3>
                    
                    <RadioGroup
                      value={importSettings.priceAdjustment}
                      onValueChange={(value) => setImportSettings({ ...importSettings, priceAdjustment: value })}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no-adjustment" id="import-no-adjustment" />
                        <Label htmlFor="import-no-adjustment">Do not adjust the prices of the new Fee Schedule</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="increase" id="import-increase" />
                        <Label htmlFor="import-increase" className="flex items-center space-x-2">
                          <span>Increase prices by</span>
                          <Input
                            value={importSettings.increaseBy}
                            onChange={(e) => setImportSettings({ ...importSettings, increaseBy: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>%</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="decrease" id="import-decrease" />
                        <Label htmlFor="import-decrease" className="flex items-center space-x-2">
                          <span>Decrease prices by</span>
                          <Input
                            value={importSettings.decreaseBy}
                            onChange={(e) => setImportSettings({ ...importSettings, decreaseBy: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>%</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="adjust-to" id="import-adjust-to" />
                        <Label htmlFor="import-adjust-to" className="flex items-center space-x-2">
                          <span>Adjust prices to</span>
                          <Input
                            value={importSettings.adjustTo}
                            onChange={(e) => setImportSettings({ ...importSettings, adjustTo: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>times (or</span>
                          <Input
                            value={importSettings.adjustToPercent}
                            onChange={(e) => setImportSettings({ ...importSettings, adjustToPercent: e.target.value })}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                          <span>% of) the selected prices</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="import-round-up"
                          checked={importSettings.roundUp}
                          onCheckedChange={(checked) => setImportSettings({ ...importSettings, roundUp: !!checked })}
                        />
                        <Label htmlFor="import-round-up">Round prices up to the next whole dollar amount</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsNewFeeScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              console.log('Creating new fee schedule with method:', newFeeSchedule.priceCreationMethod);
              setIsNewFeeScheduleDialogOpen(false);
              // Open preview dialog for all methods
              setIsFeeSchedulePreviewOpen(true);
            }}>
              Show Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fee Schedule Preview Dialog */}
      <Dialog open={isFeeSchedulePreviewOpen} onOpenChange={setIsFeeSchedulePreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">Fee Schedules</DialogTitle>
              <div className="flex items-center gap-2">
                <Button onClick={handleSaveFeeSchedule}>
                  <Check className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsFeeSchedulePreviewOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Fee Schedule Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="fee-schedule-name">Name</Label>
                <Input
                  id="fee-schedule-name"
                  name="fee-schedule-name"
                  value={feeSchedulePreview.name}
                  onChange={(e) => setFeeSchedulePreview({ ...feeSchedulePreview, name: e.target.value })}
                  placeholder="Enter fee schedule name"
                  autoComplete="off"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fee-schedule-effective-from">Effective From</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="fee-schedule-effective-from"
                      name="fee-schedule-effective-from"
                      type="date"
                      value={feeSchedulePreview.effectiveFrom}
                      onChange={(e) => setFeeSchedulePreview({ ...feeSchedulePreview, effectiveFrom: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="icon" type="button">
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="fee-schedule-effective-to">Effective To</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="fee-schedule-effective-to"
                      name="fee-schedule-effective-to"
                      type="date"
                      value={feeSchedulePreview.effectiveTo}
                      onChange={(e) => setFeeSchedulePreview({ ...feeSchedulePreview, effectiveTo: e.target.value })}
                      autoComplete="off"
                    />
                    <Button variant="outline" size="icon" type="button">
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="fee-schedule-sequence">Sequence #</Label>
                  <Input
                    id="fee-schedule-sequence"
                    name="fee-schedule-sequence"
                    value={feeSchedulePreview.sequenceNumber}
                    onChange={(e) => setFeeSchedulePreview({ ...feeSchedulePreview, sequenceNumber: e.target.value })}
                    placeholder="Enter sequence number"
                    autoComplete="off"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fee-schedule-description">Description</Label>
                <textarea
                  id="fee-schedule-description"
                  name="fee-schedule-description"
                  value={feeSchedulePreview.description}
                  onChange={(e) => setFeeSchedulePreview({ ...feeSchedulePreview, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                  className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Procedures Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Procedures</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" type="button">
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" type="button">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-300 rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="text-left py-3 px-4 font-semibold">Code</th>
                      <th className="text-left py-3 px-4 font-semibold">Price</th>
                      <th className="text-left py-3 px-4 font-semibold">Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeSchedulePreview.procedures.map((procedure, index) => (
                      <tr 
                        key={procedure.id} 
                        className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}
                      >
                        <td className="py-3 px-4 font-mono">{procedure.code}</td>
                        <td className="py-3 px-4">
                          <Input
                            value={procedure.price}
                            onChange={(e) => {
                              const updatedProcedures = feeSchedulePreview.procedures.map(p => 
                                p.id === procedure.id ? { ...p, price: e.target.value } : p
                              );
                              setFeeSchedulePreview({ ...feeSchedulePreview, procedures: updatedProcedures });
                            }}
                            className="w-24 text-xs"
                            autoComplete="off"
                          />
                        </td>
                        <td className="py-3 px-4 text-sm">{procedure.type}</td>
                        <td className="py-3 px-4 text-sm">{procedure.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Contract Dialog */}
      <Dialog open={isNewContractDialogOpen} onOpenChange={setIsNewContractDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Contract</DialogTitle>
            <DialogDescription>
              Please choose how you would like to create the prices on this contract.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <RadioGroup
              value={newContract.priceCreationMethod}
              onValueChange={(value) => setNewContract({ ...newContract, priceCreationMethod: value })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="empty" id="empty" />
                <Label htmlFor="empty">Create an empty contract</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="another-contract" id="another-contract" />
                <Label htmlFor="another-contract" className="cursor-pointer" onClick={() => setIsContractBasedDialogOpen(true)}>
                  Set prices based on another contract
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medicare" id="medicare" />
                <Label htmlFor="medicare" className="cursor-pointer" onClick={() => setIsMedicareDialogOpen(true)}>
                  Set prices based on the Medicare Fee Schedule
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="payments" id="payments" />
                <Label htmlFor="payments" className="cursor-pointer" onClick={() => setIsPaymentsDialogOpen(true)}>
                  Set prices based on payments entered
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="import" id="import" />
                <Label htmlFor="import" className="cursor-pointer" onClick={() => setIsImportDialogOpen(true)}>
                  Import prices
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsNewContractDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle save logic here
              console.log('Creating new contract with method:', newContract.priceCreationMethod);
              setIsNewContractDialogOpen(false);
              setIsContractPreviewOpen(true);
            }}>
              Show Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contract Preview Dialog */}
      <Dialog open={isContractPreviewOpen} onOpenChange={setIsContractPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Contract Preview</DialogTitle>
            <DialogDescription>
              Review and configure the contract details and procedures.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Contract Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contract Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="contract-name">Name</Label>
                  <Input
                    id="contract-name"
                    name="contract-name"
                    value={contractPreview.name}
                    onChange={(e) => setContractPreview({ ...contractPreview, name: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="contract-type">Type</Label>
                  <Select value={contractPreview.type} onValueChange={(value) => setContractPreview({ ...contractPreview, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FFS">FFS</SelectItem>
                      <SelectItem value="HMO">HMO</SelectItem>
                      <SelectItem value="PPO">PPO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contract-sequence">Sequence #</Label>
                  <Input
                    id="contract-sequence"
                    name="contract-sequence"
                    value={contractPreview.sequenceNumber}
                    onChange={(e) => setContractPreview({ ...contractPreview, sequenceNumber: e.target.value })}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allow-users-update"
                  checked={contractPreview.allowUsersToUpdatePrices}
                  onCheckedChange={(checked) => setContractPreview({ ...contractPreview, allowUsersToUpdatePrices: !!checked })}
                />
                <Label htmlFor="allow-users-update">Allow users posting payments to update prices</Label>
              </div>
            </div>

            {/* Procedures Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Procedures</h3>
                <div className="flex items-center gap-2">
                  <Input placeholder="Search procedures..." className="w-64" />
                  <Button variant="outline" size="sm">
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-300 rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Code</th>
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Price</th>
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Description</th>
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Type</th>
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Exclude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractPreview.procedures.map((procedure) => (
                      <tr key={procedure.id} className="border-b border-gray-300">
                        <td className="border border-gray-300 px-3 py-2 font-mono">{procedure.code}</td>
                        <td className="border border-gray-300 px-3 py-2">
                          <Input
                            value={procedure.price}
                            onChange={(e) => {
                              const updatedProcedures = contractPreview.procedures.map(p => 
                                p.id === procedure.id ? { ...p, price: e.target.value } : p
                              );
                              setContractPreview({ ...contractPreview, procedures: updatedProcedures });
                            }}
                            className="w-20 text-xs"
                            autoComplete="off"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm">{procedure.description}</td>
                        <td className="border border-gray-300 px-3 py-2 text-sm">{procedure.type}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <Checkbox
                            checked={procedure.exclude}
                            onCheckedChange={(checked) => {
                              const updatedProcedures = contractPreview.procedures.map(p => 
                                p.id === procedure.id ? { ...p, exclude: !!checked } : p
                              );
                              setContractPreview({ ...contractPreview, procedures: updatedProcedures });
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsContractPreviewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewContract}>
              Save Contract
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contract Based Settings Dialog */}
      <Dialog open={isContractBasedDialogOpen} onOpenChange={setIsContractBasedDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Set Prices Based on Another Contract</DialogTitle>
            <DialogDescription>
              Configure the contract selection and price adjustment settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Contract Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="specify-contract" className="text-sm font-medium text-gray-700 mb-2 block">
                  Specify Contract
                </Label>
                <Select value={contractBasedSettings.selectedContract} onValueChange={(value) => setContractBasedSettings({ ...contractBasedSettings, selectedContract: value })}>
                  <SelectTrigger className="border-red-500">
                    <SelectValue placeholder="Specify Contract" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract1">Contract 1 - Medicare FFS</SelectItem>
                    <SelectItem value="contract2">Contract 2 - HMO Standard</SelectItem>
                    <SelectItem value="contract3">Contract 3 - PPO Premium</SelectItem>
                    <SelectItem value="contract4">Contract 4 - Medicaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Adjust Prices Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Adjust Prices</h3>
              
              <RadioGroup
                value={contractBasedSettings.priceAdjustment}
                onValueChange={(value) => setContractBasedSettings({ ...contractBasedSettings, priceAdjustment: value })}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-adjustment" id="no-adjustment" />
                  <Label htmlFor="no-adjustment">Do not adjust the prices of the new Contract</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="increase" id="increase" />
                  <Label htmlFor="increase" className="flex items-center space-x-2">
                    <span>Increase prices by</span>
                    <Input
                      value={contractBasedSettings.increaseBy}
                      onChange={(e) => setContractBasedSettings({ ...contractBasedSettings, increaseBy: e.target.value })}
                      className="w-20 text-xs"
                      autoComplete="off"
                    />
                    <span>%</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="decrease" id="decrease" />
                  <Label htmlFor="decrease" className="flex items-center space-x-2">
                    <span>Decrease prices by</span>
                    <Input
                      value={contractBasedSettings.decreaseBy}
                      onChange={(e) => setContractBasedSettings({ ...contractBasedSettings, decreaseBy: e.target.value })}
                      className="w-20 text-xs"
                      autoComplete="off"
                    />
                    <span>%</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="adjust-to" id="adjust-to" />
                  <Label htmlFor="adjust-to" className="flex items-center space-x-2">
                    <span>Adjust prices to</span>
                    <Input
                      value={contractBasedSettings.adjustTo}
                      onChange={(e) => setContractBasedSettings({ ...contractBasedSettings, adjustTo: e.target.value })}
                      className="w-20 text-xs"
                      autoComplete="off"
                    />
                    <span>times (or</span>
                    <Input
                      value={contractBasedSettings.adjustToPercent}
                      onChange={(e) => setContractBasedSettings({ ...contractBasedSettings, adjustToPercent: e.target.value })}
                      className="w-20 text-xs"
                      autoComplete="off"
                    />
                    <span>% of) the selected prices</span>
                  </Label>
                </div>
              </RadioGroup>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="round-up"
                  checked={contractBasedSettings.roundUp}
                  onCheckedChange={(checked) => setContractBasedSettings({ ...contractBasedSettings, roundUp: !!checked })}
                />
                <Label htmlFor="round-up">Round prices up to the next whole dollar amount</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsContractBasedDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle save logic here
              console.log('Saving contract based settings:', contractBasedSettings);
              setIsContractBasedDialogOpen(false);
            }}>
              Apply Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Medicare Settings Dialog */}
      <Dialog open={isMedicareDialogOpen} onOpenChange={setIsMedicareDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Set Prices Based on the Medicare Fee Schedule</DialogTitle>
            <DialogDescription>
              Configure Medicare fee schedule settings and pricing options.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Medicare Fee Schedule Year */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="fee-schedule-year" className="text-sm font-medium text-gray-700 mb-2 block">
                  Medicare Fee Schedule Year
                </Label>
                <Select value={medicareSettings.feeScheduleYear} onValueChange={(value) => setMedicareSettings({ ...medicareSettings, feeScheduleYear: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Medicare Carrier and Locality */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Medicare Carrier and Locality</h3>
                
                <RadioGroup
                  value={medicareSettings.carrierMethod}
                  onValueChange={(value) => setMedicareSettings({ ...medicareSettings, carrierMethod: value })}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="zip-code" id="zip-code" />
                    <Label htmlFor="zip-code" className="flex items-center space-x-2">
                      <span>Use your ZIP code</span>
                      <Input
                        value={medicareSettings.zipCode}
                        onChange={(e) => setMedicareSettings({ ...medicareSettings, zipCode: e.target.value })}
                        placeholder="ZIP code"
                        className="w-32"
                        autoComplete="off"
                      />
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="carrier-locality" id="carrier-locality" />
                    <Label htmlFor="carrier-locality" className="flex items-center space-x-2">
                      <span>Enter the carrier and locality</span>
                      <Input
                        value={medicareSettings.carrier}
                        onChange={(e) => setMedicareSettings({ ...medicareSettings, carrier: e.target.value })}
                        placeholder="Carrier"
                        className="w-32"
                        autoComplete="off"
                      />
                      <Input
                        value={medicareSettings.locality}
                        onChange={(e) => setMedicareSettings({ ...medicareSettings, locality: e.target.value })}
                        placeholder="Locality"
                        className="w-32"
                        autoComplete="off"
                      />
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Pricing Method */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Pricing Method</h3>
                
                <RadioGroup
                  value={medicareSettings.pricingMethod}
                  onValueChange={(value) => setMedicareSettings({ ...medicareSettings, pricingMethod: value })}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non-facility" id="non-facility" />
                    <Label htmlFor="non-facility">Non-facility pricing</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="facility" id="facility" />
                    <Label htmlFor="facility">Facility pricing</Label>
                  </div>
                </RadioGroup>

                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="include-non-applicable"
                    checked={medicareSettings.includeNonApplicable}
                    onCheckedChange={(checked) => setMedicareSettings({ ...medicareSettings, includeNonApplicable: !!checked })}
                  />
                  <Label htmlFor="include-non-applicable">Include prices for codes that are not applicable for non-facility</Label>
                </div>
              </div>
            </div>

            {/* Adjust Prices */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Adjust Prices</h3>
                
                <RadioGroup
                  value={medicareSettings.priceAdjustment}
                  onValueChange={(value) => setMedicareSettings({ ...medicareSettings, priceAdjustment: value })}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no-adjustment" id="medicare-no-adjustment" />
                    <Label htmlFor="medicare-no-adjustment">Do not adjust the prices of the new Fee Schedule</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="increase" id="medicare-increase" />
                    <Label htmlFor="medicare-increase" className="flex items-center space-x-2">
                      <span>Increase prices by</span>
                      <Input
                        value={medicareSettings.increaseBy}
                        onChange={(e) => setMedicareSettings({ ...medicareSettings, increaseBy: e.target.value })}
                        className="w-20 text-xs"
                        autoComplete="off"
                      />
                      <span>%</span>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="decrease" id="medicare-decrease" />
                    <Label htmlFor="medicare-decrease" className="flex items-center space-x-2">
                      <span>Decrease prices by</span>
                      <Input
                        value={medicareSettings.decreaseBy}
                        onChange={(e) => setMedicareSettings({ ...medicareSettings, decreaseBy: e.target.value })}
                        className="w-20 text-xs"
                        autoComplete="off"
                      />
                      <span>%</span>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="adjust-to" id="medicare-adjust-to" />
                    <Label htmlFor="medicare-adjust-to" className="flex items-center space-x-2">
                      <span>Adjust prices to</span>
                      <Input
                        value={medicareSettings.adjustTo}
                        onChange={(e) => setMedicareSettings({ ...medicareSettings, adjustTo: e.target.value })}
                        className="w-20 text-xs"
                        autoComplete="off"
                      />
                      <span>times (or</span>
                      <Input
                        value={medicareSettings.adjustToPercent}
                        onChange={(e) => setMedicareSettings({ ...medicareSettings, adjustToPercent: e.target.value })}
                        className="w-20 text-xs"
                        autoComplete="off"
                      />
                      <span>% of) the selected prices</span>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="medicare-round-up"
                    checked={medicareSettings.roundUp}
                    onCheckedChange={(checked) => setMedicareSettings({ ...medicareSettings, roundUp: !!checked })}
                  />
                  <Label htmlFor="medicare-round-up">Round prices up to the next whole dollar amount</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsMedicareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle save logic here
              console.log('Saving Medicare settings:', medicareSettings);
              setIsMedicareDialogOpen(false);
            }}>
              Apply Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payments Settings Dialog */}
      <Dialog open={isPaymentsDialogOpen} onOpenChange={setIsPaymentsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Set Prices Based on Payments Entered</DialogTitle>
            <DialogDescription>
              Configure how prices are set based on historical payment data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Payer Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="specify-payer" className="text-sm font-medium text-gray-700 mb-2 block">
                  Specify Payer
                </Label>
                <Select value={paymentsSettings.selectedPayer} onValueChange={(value) => setPaymentsSettings({ ...paymentsSettings, selectedPayer: value })}>
                  <SelectTrigger className="border-red-500">
                    <SelectValue placeholder="Specify Payer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medicare">Medicare</SelectItem>
                    <SelectItem value="medicaid">Medicaid</SelectItem>
                    <SelectItem value="aetna">Aetna</SelectItem>
                    <SelectItem value="cigna">Cigna</SelectItem>
                    <SelectItem value="humana">Humana</SelectItem>
                    <SelectItem value="bcbs">Blue Cross Blue Shield</SelectItem>
                    <SelectItem value="united">UnitedHealthcare</SelectItem>
                    <SelectItem value="all-payers">All Payers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Days Configuration */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="days-input" className="text-sm font-medium text-gray-700 mb-2 block">
                  Payment Period
                </Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Set the prices based on the average allowed amount for payments entered in the last
                  </span>
                  <Input
                    id="days-input"
                    name="days-input"
                    value={paymentsSettings.days}
                    onChange={(e) => setPaymentsSettings({ ...paymentsSettings, days: e.target.value })}
                    className="w-20 text-center"
                    autoComplete="off"
                  />
                  <span className="text-sm text-gray-600">days.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsPaymentsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle save logic here
              console.log('Saving payments settings:', paymentsSettings);
              setIsPaymentsDialogOpen(false);
            }}>
              Apply Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Prices Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Import prices</span>
            </DialogTitle>
            <DialogDescription>
              Import price data from a file to set up your contract pricing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* File Import Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="file-to-import" className="text-sm font-medium text-gray-700 mb-2 block">
                    File to Import
                  </Label>
                  <Input
                    id="file-to-import"
                    name="file-to-import"
                    value={importSettings.fileName}
                    placeholder="No file selected"
                    readOnly
                    className="bg-gray-50"
                    autoComplete="off"
                  />
                </div>
                <div className="pt-6">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.csv,.xls,.xlsx';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          setImportSettings({
                            ...importSettings,
                            selectedFile: file,
                            fileName: file.name
                          });
                        }
                      };
                      input.click();
                    }}
                  >
                    Select a File
                  </Button>
                </div>
              </div>
            </div>

            {/* Information Text */}
            <div className="space-y-2 text-sm text-gray-600">
              <p>Supported formats: Comma delimited (.csv), Excel (.xls or .xlsx)</p>
              <p>Note: Excel file import will only import the first sheet.</p>
              <p>Codes can have a maximum of 10 characters.</p>
            </div>

            {/* Example Format Section */}
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-md p-4">
                <h3 className="text-lg font-semibold text-teal-900 mb-4">Example Format</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Column headers must be the first row. Columns marked with a * are required.
                </p>
                
                <div className="overflow-x-auto border border-gray-300 rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Code*</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Description</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Default</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Price*</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="border border-gray-300 px-3 py-2 font-mono">99212</td>
                        <td className="border border-gray-300 px-3 py-2 text-sm">
                          <div>If the code is not in your local list, it's added with this description.</div>
                          <div className="font-semibold">OFFICE VISIT</div>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm">
                          <div>If the code is not in your local list, it's added with this default price.</div>
                          <div className="font-semibold">45.00</div>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 font-mono">50.25</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Handle import logic here
                console.log('Importing prices from file:', importSettings.selectedFile);
                setIsImportDialogOpen(false);
              }}
              disabled={!importSettings.selectedFile}
            >
              Import Prices
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};
