import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  ChevronUp,
  AlertTriangle,
  Calculator,
  FileText,
  Activity,
  Bell,
  CheckSquare,
  Folder,
  DollarSign,
  Plus,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
  const [paymentData, setPaymentData] = useState({
    currentBalance: '0.00',
    newBalance: '0.00',
    copayDue: '0.00',
    paymentApplication: 'post-new-payment',
    paymentAmount: '',
    sendReceipt: false,
    receivedDate: '',
    depositDate: '',
    checkNumber: '',
    paymentType: 'copay',
    paymentSource: 'check',
    otherSource: '',
    memo: 'PATIENT COPAY - CHECK',
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

          {/* Right Side - Claim Summary and Additional Accordions */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto">
            <Accordion type="single" defaultValue="claim-summary" collapsible className="w-full">
              {/* Claim Summary Accordion */}
              <AccordionItem value="claim-summary" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Claim Summary</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
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

              {/* Estimate Accordion */}
              <AccordionItem value="estimate" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Estimate</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full justify-between bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                        >
                          New Estimate
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuItem>Create New Estimate</DropdownMenuItem>
                        <DropdownMenuItem>View Existing Estimates</DropdownMenuItem>
                        <DropdownMenuItem>Copy from Previous</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Add your estimate list/content here */}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Patient Notes Accordion */}
              <AccordionItem value="patient-notes" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Patient Notes</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 justify-start bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                      <div className="flex items-center gap-1">
                        <Select defaultValue="notes-for-claim">
                          <SelectTrigger className="w-48 bg-white border-gray-300 text-gray-700 h-9 text-sm">
                            <SelectValue placeholder="Notes for this Claim" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-notes">All Notes</SelectItem>
                            <SelectItem value="appointment-notes">Appointment Notes</SelectItem>
                            <SelectItem value="claim-notes">Claim Notes</SelectItem>
                            <SelectItem value="my-notes">My Notes</SelectItem>
                            <SelectItem value="patient-notes">Patient Notes</SelectItem>
                            <SelectItem value="payment-notes">Payment Notes</SelectItem>
                            <SelectItem value="notes-for-claim">Notes for this Claim</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex flex-col">
                          <Button variant="ghost" size="sm" className="h-3 w-6 p-0">
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-3 w-6 p-0">
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                          <ExternalLink className="h-4 w-4 text-gray-600" />
                        </Button>
                      </div>
                    </div>
                    {/* Add your patient notes list/content here */}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Follow Up Activity Accordion */}
              <AccordionItem value="follow-up-activity" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Follow Up Activity</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start bg-teal-50 hover:bg-teal-100 text-gray-900 border-l-4 border-l-green-500 pl-3"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Follow Up Notes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full justify-start bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                    {/* Add your follow up activity content here */}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Alerts Accordion */}
              <AccordionItem value="alerts" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Alerts</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Alerts</span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full justify-start bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Alert
                      </Button>
                    </div>
                    {/* Add your alerts list/content here */}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Tasks Accordion */}
              <AccordionItem value="tasks" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Tasks</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                      </Button>
                      <div className="flex items-center gap-2">
                        <Checkbox id="show-completed-tasks" />
                        <label 
                          htmlFor="show-completed-tasks" 
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          Show Completed Tasks
                        </label>
                      </div>
                      <Select defaultValue="claim-tasks">
                        <SelectTrigger className="w-32 bg-gray-100 border-gray-300 text-gray-700 h-9 text-sm">
                          <SelectValue placeholder="Claim Tasks" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claim-tasks">Claim Tasks</SelectItem>
                          <SelectItem value="all-tasks">All Tasks</SelectItem>
                          <SelectItem value="my-tasks">My Tasks</SelectItem>
                          <SelectItem value="overdue-tasks">Overdue Tasks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Add your tasks list/content here */}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Documents Accordion */}
              <AccordionItem value="documents" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Documents</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                          >
                            Add
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem>Upload Document</DropdownMenuItem>
                          <DropdownMenuItem>Create New Document</DropdownMenuItem>
                          <DropdownMenuItem>Link Existing Document</DropdownMenuItem>
                          <DropdownMenuItem>Scan Document</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="flex items-center gap-1">
                        <Select defaultValue="claim-documents">
                          <SelectTrigger className="w-40 bg-gray-100 border-gray-300 text-gray-700 h-9 text-sm">
                            <SelectValue placeholder="Claim Documents" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="claim-documents">Claim Documents</SelectItem>
                            <SelectItem value="all-documents">All Documents</SelectItem>
                            <SelectItem value="patient-documents">Patient Documents</SelectItem>
                            <SelectItem value="claim-related">Claim Related</SelectItem>
                            <SelectItem value="attachments">Attachments</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 w-9 p-0 hover:bg-gray-100"
                          title="Sort/Refresh"
                        >
                          <div className="flex flex-col">
                            <ChevronUp className="h-3 w-3 text-gray-600" />
                            <ChevronDown className="h-3 w-3 text-gray-600 -mt-1" />
                          </div>
                        </Button>
                      </div>
                    </div>
                    {/* Add your documents list/content here */}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Payment Accordion */}
              <AccordionItem value="payment" className="border-b border-gray-200">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <h3 className="font-semibold text-gray-900">Payment</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    {/* Balance Fields */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-gray-500 text-xs mb-1">Current Balance</Label>
                        <p className="text-gray-900 font-medium">${paymentData.currentBalance}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500 text-xs mb-1">New Balance</Label>
                        <p className="text-gray-900 font-medium">${paymentData.newBalance}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500 text-xs mb-1">Copay Due</Label>
                        <p className="text-gray-900 font-medium">${paymentData.copayDue}</p>
                      </div>
                    </div>

                    {/* Payment Application Options */}
                    <div>
                      <Label className="text-gray-700 text-sm font-medium mb-2 block">Payment Application Options</Label>
                      <RadioGroup 
                        value={paymentData.paymentApplication} 
                        onValueChange={(value) => setPaymentData({...paymentData, paymentApplication: value})}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cannot-apply" id="cannot-apply" disabled />
                          <label htmlFor="cannot-apply" className="text-sm text-gray-500 cursor-not-allowed">
                            Cannot apply copay to claim with no copay due
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="apply-credit" id="apply-credit" />
                          <label htmlFor="apply-credit" className="text-sm text-gray-700 cursor-pointer">
                            Apply account credit to claim
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="post-new-payment" id="post-new-payment" />
                          <label htmlFor="post-new-payment" className="text-sm text-gray-700 cursor-pointer">
                            Post new payment to claim
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="do-not-apply" id="do-not-apply" />
                          <label htmlFor="do-not-apply" className="text-sm text-gray-700 cursor-pointer">
                            Do not apply a payment or credit
                          </label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Payment Details */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-700 text-xs mb-1">Payment Amount</Label>
                        <Input
                          type="number"
                          value={paymentData.paymentAmount}
                          onChange={(e) => setPaymentData({...paymentData, paymentAmount: e.target.value})}
                          className="bg-white border-gray-300 text-gray-900 h-9 text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="send-receipt" 
                          checked={paymentData.sendReceipt}
                          onCheckedChange={(checked) => setPaymentData({...paymentData, sendReceipt: !!checked})}
                        />
                        <label htmlFor="send-receipt" className="text-sm text-gray-700 cursor-pointer">
                          Send receipt
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-gray-700 text-xs mb-1">Received Date</Label>
                          <div className="relative">
                            <Input
                              type="date"
                              value={paymentData.receivedDate}
                              onChange={(e) => setPaymentData({...paymentData, receivedDate: e.target.value})}
                              className="bg-white border-gray-300 text-gray-900 h-9 text-sm pr-10"
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-700 text-xs mb-1">Deposit Date</Label>
                          <div className="relative">
                            <Input
                              type="date"
                              value={paymentData.depositDate}
                              onChange={(e) => setPaymentData({...paymentData, depositDate: e.target.value})}
                              className="bg-white border-gray-300 text-gray-900 h-9 text-sm pr-10"
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-700 text-xs mb-1">Check #</Label>
                        <Input
                          value={paymentData.checkNumber}
                          onChange={(e) => setPaymentData({...paymentData, checkNumber: e.target.value})}
                          className="bg-white border-gray-300 text-gray-900 h-9 text-sm"
                          placeholder="Enter check number"
                        />
                      </div>
                    </div>

                    {/* Payment Type and Source */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-700 text-sm font-medium mb-2 block">Type</Label>
                        <RadioGroup 
                          value={paymentData.paymentType} 
                          onValueChange={(value) => setPaymentData({...paymentData, paymentType: value})}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="copay" id="type-copay" />
                            <label htmlFor="type-copay" className="text-sm text-gray-700 cursor-pointer">
                              Copay
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="payment" id="type-payment" />
                            <label htmlFor="type-payment" className="text-sm text-gray-700 cursor-pointer">
                              Payment
                            </label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div>
                        <Label className="text-gray-700 text-sm font-medium mb-2 block">Source</Label>
                        <RadioGroup 
                          value={paymentData.paymentSource} 
                          onValueChange={(value) => setPaymentData({...paymentData, paymentSource: value})}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="check" id="source-check" />
                            <label htmlFor="source-check" className="text-sm text-gray-700 cursor-pointer">
                              Check
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cash" id="source-cash" />
                            <label htmlFor="source-cash" className="text-sm text-gray-700 cursor-pointer">
                              Cash
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 gap-2">
                            <RadioGroupItem value="credit-card" id="source-credit-card" />
                            <label htmlFor="source-credit-card" className="text-sm text-gray-700 cursor-pointer">
                              Credit Card
                            </label>
                            {paymentData.paymentSource === 'credit-card' && (
                              <Select value={paymentData.otherSource} onValueChange={(value) => setPaymentData({...paymentData, otherSource: value})}>
                                <SelectTrigger className="w-24 h-7 text-xs bg-white border-gray-300">
                                  <SelectValue placeholder="Other" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="visa">Visa</SelectItem>
                                  <SelectItem value="mastercard">Mastercard</SelectItem>
                                  <SelectItem value="amex">Amex</SelectItem>
                                  <SelectItem value="discover">Discover</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    {/* Memo */}
                    <div>
                      <Label className="text-gray-700 text-xs mb-1">Memo</Label>
                      <Input
                        value={paymentData.memo}
                        onChange={(e) => setPaymentData({...paymentData, memo: e.target.value})}
                        className="bg-white border-gray-300 text-gray-900 h-9 text-sm"
                        placeholder="Enter memo"
                      />
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

