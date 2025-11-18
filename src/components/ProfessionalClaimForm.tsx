import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  X, 
  Printer, 
  CheckCircle, 
  MoreVertical,
  Search,
  User,
  Building,
  CreditCard,
  Calendar,
  ChevronDown,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';

interface ProfessionalClaimFormProps {
  isOpen: boolean;
  patientId?: string;
  claimType: 'professional' | 'institutional';
  onClose: () => void;
}

export function ProfessionalClaimForm({ isOpen, patientId, claimType, onClose }: ProfessionalClaimFormProps) {
  const [activeTab, setActiveTab] = useState('claim');
  const [formData, setFormData] = useState({
    claimNumber: 'New',
    referenceNumber: '',
    frequency: '1 - Original Claim',
    patient: '',
    renderingProvider: '',
    billingProvider: '',
    supervisingProvider: '',
    orderingProvider: '',
    referringProvider: '',
    facility: '',
    officeLocation: '',
    primaryInsurance: '',
    secondaryInsurance: '',
    tertiaryInsurance: '',
    dateOfService: '',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="w-full h-full bg-white text-gray-900 flex flex-col">
        {/* Top Control Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <CheckCircle className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                <Printer className="h-4 w-4 mr-2" />
                Print
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Print Claim</DropdownMenuItem>
              <DropdownMenuItem>Print Preview</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                <CheckCircle className="h-4 w-4 mr-2" />
                Review
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Validate Claim</DropdownMenuItem>
              <DropdownMenuItem>Pre-Submission Review</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                <MoreVertical className="h-4 w-4 mr-2" />
                More
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Duplicate Claim</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Form */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white border border-gray-200 rounded-md mb-4 text-gray-600">
                <TabsTrigger value="claim" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  Claim
                </TabsTrigger>
                <TabsTrigger value="charges" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  Charges
                </TabsTrigger>
                <TabsTrigger value="additional" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  Additional Info
                </TabsTrigger>
                <TabsTrigger value="ambulance" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  Ambulance Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="claim" className="space-y-4">
                {/* Claim # Section */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Claim #</Label>
                    <Input 
                      value={formData.claimNumber}
                      onChange={(e) => setFormData({...formData, claimNumber: e.target.value})}
                      className="bg-white border-gray-300 text-gray-900 h-9 text-sm px-2"
                      disabled
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Reference #</Label>
                    <Input 
                      value={formData.referenceNumber}
                      onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
                      className="bg-white border-gray-300 text-gray-900 h-9 text-sm px-2"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Frequency</Label>
                    <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-9 text-sm px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 - Original Claim">1 - Original Claim</SelectItem>
                        <SelectItem value="2 - Corrected Claim">2 - Replacement Of Prior Claim</SelectItem>
                        <SelectItem value="3 - Void Claim">3 - Void/Cancel Prior Claim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Claim is incomplete</span>
                </div>

                {/* Patient */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Patient</Label>
                    <div className="relative">
                      <Input
                        value={formData.patient}
                        onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                        className="bg-white border-gray-300 text-gray-900 border-l-4 border-l-blue-500 pl-10 h-9 text-sm px-2"
                        placeholder="Search patient..."
                      />
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500">
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Rendering Provider</Label>
                    <div className="relative">
                      <Input
                        value={formData.renderingProvider}
                        onChange={(e) => setFormData({ ...formData, renderingProvider: e.target.value })}
                        className="bg-white border-gray-300 text-gray-900 border-l-4 border-l-blue-500 pl-10 h-9 text-sm px-2"
                        placeholder="Search provider..."
                      />
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500">
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Billing Provider */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Billing Provider</Label>
                    <div className="relative">
                      <Input 
                        value={formData.billingProvider}
                        onChange={(e) => setFormData({...formData, billingProvider: e.target.value})}
                        className="bg-white border-gray-300 text-gray-900 border-l-4 border-l-blue-500 pl-10 h-9 text-sm px-2"
                        placeholder="Search provider..."
                      />
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500">
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Supervising Provider</Label>
                    <div className="relative">
                      <Input 
                        value={formData.supervisingProvider}
                        onChange={(e) => setFormData({...formData, supervisingProvider: e.target.value})}
                        className="bg-white border-gray-300 text-gray-900 pl-10 h-9 text-sm px-2"
                        placeholder="Search provider..."
                      />
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500">
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Ordering Provider */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Ordering Provider</Label>
                    <div className="relative">
                      <Input 
                        value={formData.orderingProvider}
                        onChange={(e) => setFormData({...formData, orderingProvider: e.target.value})}
                        className="bg-white border-gray-300 text-gray-900 pl-10 h-9 text-sm px-2"
                        placeholder="Search provider..."
                      />
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500">
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Referring/PCP Provider</Label>
                    <div className="relative flex gap-2">
                      <Input 
                        value={formData.referringProvider}
                        onChange={(e) => setFormData({...formData, referringProvider: e.target.value})}
                        className="bg-white border-gray-300 text-gray-900 pl-10 flex-1 h-9 text-sm px-2"
                        placeholder="Search provider..."
                      />
                      <Select>
                        <SelectTrigger className="w-20 bg-white border-gray-300 text-gray-900 h-9 text-sm px-2">
                          <SelectValue placeholder="Ref" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ref">Ref</SelectItem>
                          <SelectItem value="pcp">PCP</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500">
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Facility */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Facility</Label>
                    <div className="relative">
                      <Input 
                        value={formData.facility}
                        onChange={(e) => setFormData({...formData, facility: e.target.value})}
                        className="bg-white border-gray-300 text-gray-900 pl-10 h-9 text-sm px-2"
                        placeholder="Search facility..."
                      />
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500">
                        <Building className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Office Location</Label>
                    <Select>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-9 text-sm px-2">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Office</SelectItem>
                        <SelectItem value="branch1">Branch Office 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Primary Insurance */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Primary Insurance</Label>
                    <div className="relative">
                      <Input 
                        value={formData.primaryInsurance}
                        onChange={(e) => setFormData({...formData, primaryInsurance: e.target.value})}
                        className="bg-white border-gray-300 text-gray-900 border-l-4 border-l-blue-500 pl-10 h-9 text-sm px-2"
                        placeholder="Search insurance..."
                      />
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500">
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Secondary Insurance</Label>
                    <div className="relative">
                      <Input 
                        value={formData.secondaryInsurance}
                        onChange={(e) => setFormData({...formData, secondaryInsurance: e.target.value})}
                        className="bg-white border-gray-300 text-gray-900 pl-10 h-9 text-sm px-2"
                        placeholder="Search insurance..."
                      />
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500">
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tertiary Insurance */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-gray-700 text-xs mb-1">Tertiary Insurance</Label>
                    <div className="relative">
                      <Input 
                        value={formData.tertiaryInsurance}
                        onChange={(e) => setFormData({...formData, tertiaryInsurance: e.target.value})}
                        className="bg-white border-gray-300 text-gray-900 pl-10 h-9 text-sm px-2"
                        placeholder="Search insurance..."
                      />
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500">
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="charges">
                <div className="text-gray-500">Charges tab content</div>
              </TabsContent>

              <TabsContent value="additional">
                <div className="text-gray-500">Additional Info tab content</div>
              </TabsContent>

              <TabsContent value="ambulance">
                <div className="text-gray-500">Ambulance Info tab content</div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Side - Claim Summary */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto">
            <Accordion type="multiple" defaultValue={["claim-summary"]}>
              <AccordionItem value="claim-summary">
                <AccordionTrigger>
                  <h3 className="font-semibold text-gray-900">Claim Summary</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-500 text-xs">Form Version</Label>
                      <p className="text-gray-900">CMS-1500 02-12</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Total Amount</Label>
                      <p className="text-gray-900">$0.00</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Ins Payments</Label>
                      <p className="text-gray-900">$0.00</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Pat Payments</Label>
                      <p className="text-gray-900">$0.00</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Adjustments</Label>
                      <p className="text-gray-900">$0.00</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Balance</Label>
                      <p className="text-gray-900">$0.00</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Patient Credits</Label>
                      <p className="text-gray-900">$0.00</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Patient Follow Up Date</Label>
                      <p className="text-gray-900">--</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Patient Recall Date</Label>
                      <p className="text-gray-900">--</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Date of Service</Label>
                      <p className="text-gray-900">--</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}

