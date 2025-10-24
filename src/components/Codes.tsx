import React, { useState } from 'react';
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
import { Plus, Search, Edit, Trash2, Download, Upload, ChevronDown, ChevronUp, ChevronRight, FileText, Hash, DollarSign, Syringe, UserPlus, Circle, Building, MessageSquare, Minus, Package, List, DollarSign as DollarIcon, FilePen, Cloud, Eye, Calendar, Info, X, Check } from 'lucide-react';

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
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [procedureCodes, setProcedureCodes] = useState<Code[]>([]);
  const [diagnosisCodes, setDiagnosisCodes] = useState<Code[]>([]);
  const [icdProcedureCodes, setIcdProcedureCodes] = useState<Code[]>([]);
  const [revenueCodes, setRevenueCodes] = useState<Code[]>([]);
  const [remittanceCodes, setRemittanceCodes] = useState<Code[]>([]);
  const [adjustmentCodes, setAdjustmentCodes] = useState<Code[]>([]);
  const [inventoryCodes, setInventoryCodes] = useState<Code[]>([]);
  const [chargePanels, setChargePanels] = useState<Code[]>([]);
  const [feeSchedules, setFeeSchedules] = useState<Code[]>([]);
  const [contracts, setContracts] = useState<Code[]>([]);
  const [isNewCodeDialogOpen, setIsNewCodeDialogOpen] = useState(false);
  const [isNewDiagnosisDialogOpen, setIsNewDiagnosisDialogOpen] = useState(false);
  const [isNewICDProcedureDialogOpen, setIsNewICDProcedureDialogOpen] = useState(false);
  const [isNewRevenueDialogOpen, setIsNewRevenueDialogOpen] = useState(false);
  const [isNewRemittanceDialogOpen, setIsNewRemittanceDialogOpen] = useState(false);
  const [isNewAdjustmentDialogOpen, setIsNewAdjustmentDialogOpen] = useState(false);
  const [isNewInventoryDialogOpen, setIsNewInventoryDialogOpen] = useState(false);
  const [isNewChargePanelDialogOpen, setIsNewChargePanelDialogOpen] = useState(false);
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
    selectedContract: '',
    priceAdjustment: 'no-adjustment',
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

  const [paymentsSettings, setPaymentsSettings] = useState({
    selectedPayer: '',
    days: '90'
  });

  const [importSettings, setImportSettings] = useState({
    selectedFile: null as File | null,
    fileName: ''
  });

  const handleMenuItemClick = (menuItemId: string) => {
    setSelectedMenuItem(menuItemId);
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

  const filteredFeeSchedules = feeSchedules.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInactive = includeInactive || !code.inactive;
    
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
              <CardTitle>Recently Opened</CardTitle>
            </CardHeader>
            <CardContent>
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
                    {filteredProcedureCodes.map((code) => (
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
                    ))}
                  </tbody>
                </table>
              </div>
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
                    {filteredDiagnosisCodes.map((code) => (
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
                    ))}
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
                    {filteredICDProcedureCodes.map((code) => (
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
                    ))}
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
              {filteredRevenueCodes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent items</p>
                </div>
              ) : (
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
                      {filteredRevenueCodes.map((code) => (
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                    {filteredRemittanceCodes.map((code) => (
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
                    ))}
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
                      <th className="text-left py-3 px-4 font-semibold">Description</th>
                      <th className="text-left py-3 px-4 font-semibold">Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Inactive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdjustmentCodes.map((code) => (
                      <tr key={code.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono">{code.code}</td>
                        <td className="py-3 px-4">{code.description}</td>
                        <td className="py-3 px-4">DISCOUNT</td>
                        <td className="py-3 px-4">
                          {code.inactive ? (
                            <Badge variant="secondary">Inactive</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

          {/* Recently Opened Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Opened</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredInventoryCodes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent items</p>
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
                      {filteredInventoryCodes.map((code) => (
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
                      ))}
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

          {/* Recently Opened Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Opened</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredChargePanels.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent items</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Description</th>
                        <th className="text-left py-3 px-4 font-semibold">Codes</th>
                        <th className="text-left py-3 px-4 font-semibold">Inactive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChargePanels.map((code) => (
                        <tr key={code.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{code.code}</td>
                          <td className="py-3 px-4 text-muted-foreground">{code.description || '-'}</td>
                          <td className="py-3 px-4 font-mono text-sm">
                            {code.code === 'CT BILLING' ? '93880,76536,93306,93...' : 
                             code.code === 'MALE US' ? '76770,76870,76536' : 
                             code.code === 'MALE' ? '76770,76870,76536' : '-'}
                          </td>
                          <td className="py-3 px-4">
                            {code.inactive ? (
                              <Badge variant="secondary">Inactive</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
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
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Fee Schedule
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
              {filteredFeeSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent items</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Description</th>
                        <th className="text-left py-3 px-4 font-semibold">Codes</th>
                        <th className="text-left py-3 px-4 font-semibold">Inactive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFeeSchedules.map((code) => (
                        <tr key={code.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{code.code}</td>
                          <td className="py-3 px-4 text-muted-foreground">-</td>
                          <td className="py-3 px-4 font-mono text-sm">
                            {code.code === 'Default Fee Schedule' ? 'FS001,FS002,FS003,FS...' : '-'}
                          </td>
                          <td className="py-3 px-4">
                            {code.inactive ? (
                              <Badge variant="secondary">Inactive</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
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
              {filteredContracts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent items</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Description</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Inactive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContracts.map((code) => (
                        <tr key={code.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{code.code}</td>
                          <td className="py-3 px-4 text-muted-foreground">{code.description || '-'}</td>
                          <td className="py-3 px-4 text-muted-foreground">-</td>
                          <td className="py-3 px-4">
                            {code.inactive ? (
                              <Badge variant="secondary">Inactive</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
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
            <Button onClick={() => {
              // Handle save logic here
              console.log('Saving new code:', newCode);
              setIsNewCodeDialogOpen(false);
            }}>
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
            <Button onClick={() => {
              // Handle save logic here
              console.log('Saving new diagnosis:', newDiagnosis);
              setIsNewDiagnosisDialogOpen(false);
            }}>
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
            <Button onClick={() => {
              // Handle save logic here
              console.log('Saving new ICD procedure:', newICDProcedure);
              setIsNewICDProcedureDialogOpen(false);
            }}>
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
            <Button onClick={() => {
              // Handle save logic here
              console.log('Saving new revenue code:', newRevenue);
              setIsNewRevenueDialogOpen(false);
            }}>
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
            <Button onClick={() => {
              // Handle save logic here
              console.log('Saving new remittance code:', newRemittance);
              setIsNewRemittanceDialogOpen(false);
            }}>
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
            <Button onClick={() => {
              // Handle save logic here
              console.log('Saving new adjustment code:', newAdjustment);
              setIsNewAdjustmentDialogOpen(false);
            }}>
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
            <Button onClick={() => {
              // Handle save logic here
              console.log('Saving new inventory:', newInventory);
              setIsNewInventoryDialogOpen(false);
            }}>
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
            <Button onClick={() => {
              // Handle save logic here
              console.log('Saving new charge panel:', newChargePanel);
              setIsNewChargePanelDialogOpen(false);
            }}>
              Save Charge Panel
            </Button>
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
            <Button onClick={() => {
              // Handle save logic here
              console.log('Saving contract preview:', contractPreview);
              setIsContractPreviewOpen(false);
            }}>
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
