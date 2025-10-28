import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
  FileText,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Building2,
  Hospital,
  Stethoscope,
  Shield,
  Activity,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Practice {
  id: string;
  name: string;
  npi: string;
  organizationType: string;
  taxonomySpecialty: string;
  referenceNumber: string;
  tcnPrefix: string;
  statementTcnPrefix: string;
  code: string;
  // Primary Office
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  timeZone: string;
  phone: string;
  fax: string;
  email: string;
  // Pay-To Address (if different)
  payToAddressLine1: string;
  payToAddressLine2: string;
  payToCity: string;
  payToState: string;
  payToZipCode: string;
  payToPhone: string;
  payToFax: string;
  payToEmail: string;
  // Additional fields
  status: "active" | "inactive" | "pending";
  establishedDate: string;
  lastUpdated: string;
  providerCount: number;
  patientCount: number;
  monthlyRevenue: number;
  payToSameAsPrimary: boolean;
}

const Practices = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [expandedPractice, setExpandedPractice] = useState<string | null>(null);

  // Initialize with empty array - data should come from database
  const [practices, setPractices] = useState<Practice[]>([]);

  const [newPractice, setNewPractice] = useState<Partial<Practice>>({
    name: "",
    npi: "",
    organizationType: "",
    taxonomySpecialty: "",
    referenceNumber: "",
    tcnPrefix: "",
    statementTcnPrefix: "",
    code: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    timeZone: "",
    phone: "",
    fax: "",
    email: "",
    payToAddressLine1: "",
    payToAddressLine2: "",
    payToCity: "",
    payToState: "",
    payToZipCode: "",
    payToPhone: "",
    payToFax: "",
    payToEmail: "",
    status: "active",
    payToSameAsPrimary: true
  });

  const organizationTypes = [
    "Solo Practice",
    "Group Practice",
    "Multi-Specialty Practice",
    "Hospital-Based",
    "Academic Medical Center",
    "Federally Qualified Health Center",
    "Rural Health Clinic",
    "Urgent Care Center",
    "Ambulatory Surgery Center",
    "Other"
  ];

  const timeZones = [
    "Eastern",
    "Central",
    "Mountain",
    "Pacific",
    "Alaska",
    "Hawaii"
  ];


  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
  ];

  const filteredPractices = practices.filter(practice => {
    const matchesSearch = (practice.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (practice.city?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (practice.organizationType?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = filterStatus === "all" || practice.status === filterStatus;
    const matchesType = filterType === "all" || practice.organizationType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddPractice = () => {
    if (!newPractice.name || !newPractice.npi || !newPractice.taxonomySpecialty) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, NPI, Taxonomy Specialty).",
        variant: "destructive",
      });
      return;
    }

    const practice: Practice = {
      id: Date.now().toString(),
      name: newPractice.name!,
      npi: newPractice.npi!,
      organizationType: newPractice.organizationType || "",
      taxonomySpecialty: newPractice.taxonomySpecialty!,
      referenceNumber: newPractice.referenceNumber || "",
      tcnPrefix: newPractice.tcnPrefix || "",
      statementTcnPrefix: newPractice.statementTcnPrefix || "",
      code: newPractice.code || "",
      addressLine1: newPractice.addressLine1 || "",
      addressLine2: newPractice.addressLine2 || "",
      city: newPractice.city || "",
      state: newPractice.state || "",
      zipCode: newPractice.zipCode || "",
      timeZone: newPractice.timeZone || "",
      phone: newPractice.phone || "",
      fax: newPractice.fax || "",
      email: newPractice.email || "",
      payToAddressLine1: newPractice.payToSameAsPrimary ? newPractice.addressLine1 || "" : newPractice.payToAddressLine1 || "",
      payToAddressLine2: newPractice.payToSameAsPrimary ? newPractice.addressLine2 || "" : newPractice.payToAddressLine2 || "",
      payToCity: newPractice.payToSameAsPrimary ? newPractice.city || "" : newPractice.payToCity || "",
      payToState: newPractice.payToSameAsPrimary ? newPractice.state || "" : newPractice.payToState || "",
      payToZipCode: newPractice.payToSameAsPrimary ? newPractice.zipCode || "" : newPractice.payToZipCode || "",
      payToPhone: newPractice.payToSameAsPrimary ? newPractice.phone || "" : newPractice.payToPhone || "",
      payToFax: newPractice.payToSameAsPrimary ? newPractice.fax || "" : newPractice.payToFax || "",
      payToEmail: newPractice.payToSameAsPrimary ? newPractice.email || "" : newPractice.payToEmail || "",
      status: newPractice.status as "active" | "inactive" | "pending",
      establishedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      providerCount: 0,
      patientCount: 0,
      monthlyRevenue: 0,
      payToSameAsPrimary: newPractice.payToSameAsPrimary || true
    };

    setPractices(prev => [practice, ...prev]);
    setNewPractice({
      name: "",
      npi: "",
      organizationType: "",
      taxonomySpecialty: "",
      referenceNumber: "",
      tcnPrefix: "",
      statementTcnPrefix: "",
      code: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      timeZone: "",
      phone: "",
      fax: "",
      email: "",
      payToAddressLine1: "",
      payToAddressLine2: "",
      payToCity: "",
      payToState: "",
      payToZipCode: "",
      payToPhone: "",
      payToFax: "",
      payToEmail: "",
      status: "active",
      payToSameAsPrimary: true
    });
    setIsAddDialogOpen(false);

    toast({
      title: "Practice Added",
      description: `${practice.name} has been successfully added.`,
    });
  };

  const handleEditPractice = (practice: Practice) => {
    setSelectedPractice(practice);
    setIsEditDialogOpen(true);
  };

  const handleDeletePractice = (id: string) => {
    setPractices(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Practice Deleted",
      description: "Practice has been successfully deleted.",
    });
  };

  const handleExportPractices = () => {
    const csvContent = [
      "Name,NPI,Organization Type,Taxonomy Specialty,Address,City,State,ZIP,Phone,Email,Status",
      ...practices.map(practice => [
        practice.name,
        practice.npi,
        practice.organizationType,
        practice.taxonomySpecialty,
        practice.addressLine1,
        practice.city,
        practice.state,
        practice.zipCode,
        practice.phone,
        practice.email,
        practice.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `practices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Practices data exported successfully!",
    });
  };

  const handleImportPractices = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const importedPractices: Practice[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',');
            const practice: Practice = {
              id: Date.now().toString() + Math.random(),
              name: values[0] || '',
              npi: values[1] || '',
              organizationType: values[2] || '',
              taxonomySpecialty: values[3] || '',
              referenceNumber: '',
              tcnPrefix: '',
              statementTcnPrefix: '',
              code: '',
              addressLine1: values[4] || '',
              addressLine2: '',
              city: values[5] || '',
              state: values[6] || '',
              zipCode: values[7] || '',
              timeZone: '',
              phone: values[8] || '',
              fax: '',
              email: values[9] || '',
              payToAddressLine1: values[4] || '',
              payToAddressLine2: '',
              payToCity: values[5] || '',
              payToState: values[6] || '',
              payToZipCode: values[7] || '',
              payToPhone: values[8] || '',
              payToFax: '',
              payToEmail: values[9] || '',
              status: (values[10] as "active" | "inactive" | "pending") || "active",
              establishedDate: new Date().toISOString().split('T')[0],
              lastUpdated: new Date().toISOString().split('T')[0],
              providerCount: 0,
              patientCount: 0,
              monthlyRevenue: 0,
              payToSameAsPrimary: true
            };
            importedPractices.push(practice);
          }
        }

        setPractices(prev => [...importedPractices, ...prev]);
        toast({
          title: "Import Complete",
          description: `${importedPractices.length} practices imported successfully!`,
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Error reading CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleUpdatePractice = (updatedPractice: Practice) => {
    setPractices(prev => prev.map(p => p.id === updatedPractice.id ? updatedPractice : p));
    setSelectedPractice(null);
    setIsEditDialogOpen(false);
    toast({
      title: "Practice Updated",
      description: `${updatedPractice.name} has been successfully updated.`,
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedPractice(expandedPractice === id ? null : id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "inactive": return "bg-red-100 text-red-800 border-red-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4" />;
      case "inactive": return <AlertTriangle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building className="h-8 w-8 text-blue-600" />
            Practices Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage medical practices, facilities, and organizational information
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportPractices}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportPractices}
              style={{ display: 'none' }}
              id="import-practices"
            />
            <Button variant="outline" onClick={() => document.getElementById('import-practices')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Practice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Practice</DialogTitle>
                <DialogDescription>
                  Enter the practice information including general details, primary office address, and additional information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* General Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">General Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-red-600">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={newPractice.name}
                        onChange={(e) => setNewPractice(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter practice name"
                        autoComplete="organization"
                      />
                    </div>
                    <div>
                      <Label htmlFor="npi" className="text-red-600">NPI *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="npi"
                          name="npi"
                          value={newPractice.npi}
                          onChange={(e) => setNewPractice(prev => ({ ...prev, npi: e.target.value }))}
                          placeholder="10-digit NPI"
                          autoComplete="off"
                        />
                        <Button variant="outline" size="sm">
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="organizationType">Organization Type</Label>
                      <Select value={newPractice.organizationType} onValueChange={(value) => setNewPractice(prev => ({ ...prev, organizationType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization type" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizationTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="taxonomySpecialty" className="text-red-600">Taxonomy Specialty *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="taxonomySpecialty"
                          value={newPractice.taxonomySpecialty}
                          onChange={(e) => setNewPractice(prev => ({ ...prev, taxonomySpecialty: e.target.value }))}
                          placeholder="Enter taxonomy specialty"
                        />
                        <Button variant="outline" size="sm">
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Sequence #</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      <div>
                        <Input
                          placeholder="Reference #"
                          value={newPractice.referenceNumber}
                          onChange={(e) => setNewPractice(prev => ({ ...prev, referenceNumber: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="TCN Prefix"
                          value={newPractice.tcnPrefix}
                          onChange={(e) => setNewPractice(prev => ({ ...prev, tcnPrefix: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Statement TCN Prefix"
                          value={newPractice.statementTcnPrefix}
                          onChange={(e) => setNewPractice(prev => ({ ...prev, statementTcnPrefix: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Code"
                          value={newPractice.code}
                          onChange={(e) => setNewPractice(prev => ({ ...prev, code: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Office */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2 bg-blue-600 text-white px-4 py-2 rounded">Primary Office</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="addressLine1" className="text-red-600">Address *</Label>
                      <Input
                        id="addressLine1"
                        value={newPractice.addressLine1}
                        onChange={(e) => setNewPractice(prev => ({ ...prev, addressLine1: e.target.value }))}
                        placeholder="Address Line 1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="addressLine2">Address Line 2</Label>
                      <Input
                        id="addressLine2"
                        value={newPractice.addressLine2}
                        onChange={(e) => setNewPractice(prev => ({ ...prev, addressLine2: e.target.value }))}
                        placeholder="Address Line 2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-red-600">City *</Label>
                      <Input
                        id="city"
                        value={newPractice.city}
                        onChange={(e) => setNewPractice(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-red-600">State *</Label>
                      <Select value={newPractice.state} onValueChange={(value) => setNewPractice(prev => ({ ...prev, state: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="zipCode" className="text-red-600">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={newPractice.zipCode}
                        onChange={(e) => setNewPractice(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="12345"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timeZone">Time Zone</Label>
                      <Select value={newPractice.timeZone} onValueChange={(value) => setNewPractice(prev => ({ ...prev, timeZone: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time zone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeZones.map((zone) => (
                            <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-red-600">Phone *</Label>
                      <Input
                        id="phone"
                        value={newPractice.phone}
                        onChange={(e) => setNewPractice(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(XXX) XXX-XXXX"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fax">Fax</Label>
                      <Input
                        id="fax"
                        value={newPractice.fax}
                        onChange={(e) => setNewPractice(prev => ({ ...prev, fax: e.target.value }))}
                        placeholder="(XXX) XXX-XXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newPractice.email}
                        onChange={(e) => setNewPractice(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="practice@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Pay-To Address */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="payToSameAsPrimary"
                      checked={newPractice.payToSameAsPrimary}
                      onCheckedChange={(checked) => setNewPractice(prev => ({ ...prev, payToSameAsPrimary: checked as boolean }))}
                    />
                    <Label htmlFor="payToSameAsPrimary">Pay-To address is the same as the primary office address</Label>
                  </div>

                  {!newPractice.payToSameAsPrimary && (
                    <>
                      <h3 className="text-lg font-semibold border-b pb-2">Pay-To Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="payToAddressLine1">Address</Label>
                          <Input
                            id="payToAddressLine1"
                            value={newPractice.payToAddressLine1}
                            onChange={(e) => setNewPractice(prev => ({ ...prev, payToAddressLine1: e.target.value }))}
                            placeholder="Address Line 1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="payToAddressLine2">Address Line 2</Label>
                          <Input
                            id="payToAddressLine2"
                            value={newPractice.payToAddressLine2}
                            onChange={(e) => setNewPractice(prev => ({ ...prev, payToAddressLine2: e.target.value }))}
                            placeholder="Address Line 2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="payToCity">City</Label>
                          <Input
                            id="payToCity"
                            value={newPractice.payToCity}
                            onChange={(e) => setNewPractice(prev => ({ ...prev, payToCity: e.target.value }))}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <Label htmlFor="payToState">State</Label>
                          <Select value={newPractice.payToState} onValueChange={(value) => setNewPractice(prev => ({ ...prev, payToState: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {states.map((state) => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="payToZipCode">ZIP Code</Label>
                          <Input
                            id="payToZipCode"
                            value={newPractice.payToZipCode}
                            onChange={(e) => setNewPractice(prev => ({ ...prev, payToZipCode: e.target.value }))}
                            placeholder="12345"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="payToPhone">Phone</Label>
                          <Input
                            id="payToPhone"
                            value={newPractice.payToPhone}
                            onChange={(e) => setNewPractice(prev => ({ ...prev, payToPhone: e.target.value }))}
                            placeholder="(XXX) XXX-XXXX"
                          />
                        </div>
                        <div>
                          <Label htmlFor="payToFax">Fax</Label>
                          <Input
                            id="payToFax"
                            value={newPractice.payToFax}
                            onChange={(e) => setNewPractice(prev => ({ ...prev, payToFax: e.target.value }))}
                            placeholder="(XXX) XXX-XXXX"
                          />
                        </div>
                        <div>
                          <Label htmlFor="payToEmail">Email</Label>
                          <Input
                            id="payToEmail"
                            type="email"
                            value={newPractice.payToEmail}
                            onChange={(e) => setNewPractice(prev => ({ ...prev, payToEmail: e.target.value }))}
                            placeholder="payto@example.com"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>


                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPractice}>
                    Add Practice
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Practice</DialogTitle>
                <DialogDescription>
                  Update the practice information including general details, primary office address, and additional information.
                </DialogDescription>
              </DialogHeader>
              {selectedPractice && (
                <div className="space-y-6">
                  {/* General Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">General Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-name" className="text-red-600">Name *</Label>
                        <Input
                          id="edit-name"
                          value={selectedPractice.name}
                          onChange={(e) => setSelectedPractice(prev => prev ? { ...prev, name: e.target.value } : null)}
                          placeholder="Enter practice name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-npi" className="text-red-600">NPI *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="edit-npi"
                            value={selectedPractice.npi}
                            onChange={(e) => setSelectedPractice(prev => prev ? { ...prev, npi: e.target.value } : null)}
                            placeholder="10-digit NPI"
                          />
                          <Button variant="outline" size="sm">
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-organizationType">Organization Type</Label>
                        <Select 
                          value={selectedPractice.organizationType} 
                          onValueChange={(value) => setSelectedPractice(prev => prev ? { ...prev, organizationType: value } : null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization type" />
                          </SelectTrigger>
                          <SelectContent>
                            {organizationTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-taxonomySpecialty" className="text-red-600">Taxonomy Specialty *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="edit-taxonomySpecialty"
                            value={selectedPractice.taxonomySpecialty}
                            onChange={(e) => setSelectedPractice(prev => prev ? { ...prev, taxonomySpecialty: e.target.value } : null)}
                            placeholder="Enter taxonomy specialty"
                          />
                          <Button variant="outline" size="sm">
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Sequence #</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        <div>
                          <Input
                            placeholder="Reference #"
                            value={selectedPractice.referenceNumber}
                            onChange={(e) => setSelectedPractice(prev => prev ? { ...prev, referenceNumber: e.target.value } : null)}
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="TCN Prefix"
                            value={selectedPractice.tcnPrefix}
                            onChange={(e) => setSelectedPractice(prev => prev ? { ...prev, tcnPrefix: e.target.value } : null)}
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="Statement TCN Prefix"
                            value={selectedPractice.statementTcnPrefix}
                            onChange={(e) => setSelectedPractice(prev => prev ? { ...prev, statementTcnPrefix: e.target.value } : null)}
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="Code"
                            value={selectedPractice.code}
                            onChange={(e) => setSelectedPractice(prev => prev ? { ...prev, code: e.target.value } : null)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Office */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2 bg-blue-600 text-white px-4 py-2 rounded">Primary Office</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-addressLine1" className="text-red-600">Address *</Label>
                        <Input
                          id="edit-addressLine1"
                          value={selectedPractice.addressLine1}
                          onChange={(e) => setSelectedPractice(prev => prev ? { ...prev, addressLine1: e.target.value } : null)}
                          placeholder="Address Line 1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-addressLine2">Address Line 2</Label>
                        <Input
                          id="edit-addressLine2"
                          value={selectedPractice.addressLine2}
                          onChange={(e) => setSelectedPractice(prev => prev ? { ...prev, addressLine2: e.target.value } : null)}
                          placeholder="Address Line 2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="edit-city" className="text-red-600">City *</Label>
                        <Input
                          id="edit-city"
                          value={selectedPractice.city}
                          onChange={(e) => setSelectedPractice(prev => prev ? { ...prev, city: e.target.value } : null)}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-state" className="text-red-600">State *</Label>
                        <Select 
                          value={selectedPractice.state} 
                          onValueChange={(value) => setSelectedPractice(prev => prev ? { ...prev, state: value } : null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-zipCode" className="text-red-600">ZIP Code *</Label>
                        <Input
                          id="edit-zipCode"
                          value={selectedPractice.zipCode}
                          onChange={(e) => setSelectedPractice(prev => prev ? { ...prev, zipCode: e.target.value } : null)}
                          placeholder="12345"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-timeZone">Time Zone</Label>
                        <Select 
                          value={selectedPractice.timeZone} 
                          onValueChange={(value) => setSelectedPractice(prev => prev ? { ...prev, timeZone: value } : null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time zone" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeZones.map((zone) => (
                              <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-phone" className="text-red-600">Phone *</Label>
                        <Input
                          id="edit-phone"
                          value={selectedPractice.phone}
                          onChange={(e) => setSelectedPractice(prev => prev ? { ...prev, phone: e.target.value } : null)}
                          placeholder="(XXX) XXX-XXXX"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-fax">Fax</Label>
                        <Input
                          id="edit-fax"
                          value={selectedPractice.fax}
                          onChange={(e) => setSelectedPractice(prev => prev ? { ...prev, fax: e.target.value } : null)}
                          placeholder="(XXX) XXX-XXXX"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={selectedPractice.email}
                          onChange={(e) => setSelectedPractice(prev => prev ? { ...prev, email: e.target.value } : null)}
                          placeholder="practice@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => selectedPractice && handleUpdatePractice(selectedPractice)}>
                      Update Practice
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Practices</p>
                <p className="text-2xl font-bold">{practices.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {practices.filter(p => p.status === 'active').length}
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
                <p className="text-sm font-medium text-muted-foreground">Total Providers</p>
                <p className="text-2xl font-bold text-blue-600">
                  {practices.reduce((sum, p) => sum + p.providerCount, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${practices.reduce((sum, p) => sum + p.monthlyRevenue, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-practices"
                  name="search-practices"
                  placeholder="Search practices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  autoComplete="off"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {organizationTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Practices List */}
      <div className="space-y-4">
        {filteredPractices.map((practice) => (
          <Card key={practice.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-semibold">{practice.name}</h3>
                    <Badge className={getStatusColor(practice.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(practice.status)}
                        <span className="capitalize">{practice.status}</span>
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{practice.organizationType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{practice.city}, {practice.state} {practice.zipCode}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{practice.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{practice.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{practice.providerCount} providers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      <span>{practice.patientCount.toLocaleString()} patients</span>
                    </div>
                  </div>


                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Established: {new Date(practice.establishedDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Last Updated: {new Date(practice.lastUpdated).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Monthly Revenue: ${practice.monthlyRevenue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(practice.id)}
                  >
                    {expandedPractice === practice.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPractice(practice)}
                    title="Edit Practice"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePractice(practice.id)}
                    title="Delete Practice"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {expandedPractice === practice.id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Practice Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">NPI:</span> {practice.npi}</div>
                        <div><span className="font-medium">Organization Type:</span> {practice.organizationType}</div>
                        <div><span className="font-medium">Taxonomy Specialty:</span> {practice.taxonomySpecialty}</div>
                        <div><span className="font-medium">Address:</span> {practice.addressLine1} {practice.addressLine2}</div>
                        <div><span className="font-medium">Time Zone:</span> {practice.timeZone}</div>
                        <div><span className="font-medium">Fax:</span> {practice.fax}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Performance Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Provider Count:</span>
                          <span className="font-medium">{practice.providerCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Patient Count:</span>
                          <span className="font-medium">{practice.patientCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Revenue:</span>
                          <span className="font-medium">${practice.monthlyRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revenue per Provider:</span>
                          <span className="font-medium">
                            ${practice.providerCount > 0 ? Math.round(practice.monthlyRevenue / practice.providerCount).toLocaleString() : '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPractices.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No practices found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "all" || filterType !== "all"
                ? "Try adjusting your search criteria"
                : "Get started by adding your first practice"}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Practice
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Practices;


