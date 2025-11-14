import { useState, useEffect, useRef } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { 
  searchNPIByNumber, 
  searchTaxonomyByDescription, 
  searchTaxonomyCodes,
  getCommonTaxonomyCodes,
  type NPISearchResult 
} from "@/services/npiService";
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
  const [practices, setPractices] = useState<Practice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const [isSearchingNPI, setIsSearchingNPI] = useState(false);
  const [isSearchingTaxonomy, setIsSearchingTaxonomy] = useState(false);
  const [npiSearchResults, setNpiSearchResults] = useState<NPISearchResult | null>(null);
  const [taxonomySearchResults, setTaxonomySearchResults] = useState<Array<{ code: string; description: string }>>([]);
  const [showTaxonomyDropdown, setShowTaxonomyDropdown] = useState(false);
  
  // Edit form lookup states
  const [isSearchingNPIEdit, setIsSearchingNPIEdit] = useState(false);
  const [isSearchingTaxonomyEdit, setIsSearchingTaxonomyEdit] = useState(false);
  const [npiSearchResultsEdit, setNpiSearchResultsEdit] = useState<NPISearchResult | null>(null);
  const [taxonomySearchResultsEdit, setTaxonomySearchResultsEdit] = useState<Array<{ code: string; description: string }>>([]);
  const [showTaxonomyDropdownEdit, setShowTaxonomyDropdownEdit] = useState(false);

  // Fetch practices from database
  useEffect(() => {
    fetchPracticesFromDatabase();
  }, []);

  const fetchPracticesFromDatabase = async () => {
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      console.log('🔍 Fetching practices from database...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No active session. Cannot fetch practices.');
        setPractices([]);
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('practices' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching practices:', error);
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('⚠️ Practices table not found. Please run CREATE_PRACTICES_TABLE.sql');
          toast({
            title: 'Table Not Found',
            description: 'Practices table does not exist. Please run the SQL setup script.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error loading practices',
            description: error.message,
            variant: 'destructive',
          });
        }
        setPractices([]);
        return;
      }

      // Transform database records to match Practice interface
      const transformedPractices: Practice[] = (data || []).map((dbPractice: any) => ({
        id: dbPractice.id,
        name: dbPractice.name || '',
        npi: dbPractice.npi || '',
        organizationType: dbPractice.organization_type || '',
        taxonomySpecialty: dbPractice.taxonomy_specialty || '',
        referenceNumber: dbPractice.reference_number || '',
        tcnPrefix: dbPractice.tcn_prefix || '',
        statementTcnPrefix: dbPractice.statement_tcn_prefix || '',
        code: dbPractice.code || '',
        addressLine1: dbPractice.address_line1 || '',
        addressLine2: dbPractice.address_line2 || '',
        city: dbPractice.city || '',
        state: dbPractice.state || '',
        zipCode: dbPractice.zip_code || '',
        timeZone: dbPractice.time_zone || '',
        phone: dbPractice.phone || '',
        fax: dbPractice.fax || '',
        email: dbPractice.email || '',
        payToAddressLine1: dbPractice.pay_to_address_line1 || '',
        payToAddressLine2: dbPractice.pay_to_address_line2 || '',
        payToCity: dbPractice.pay_to_city || '',
        payToState: dbPractice.pay_to_state || '',
        payToZipCode: dbPractice.pay_to_zip_code || '',
        payToPhone: dbPractice.pay_to_phone || '',
        payToFax: dbPractice.pay_to_fax || '',
        payToEmail: dbPractice.pay_to_email || '',
        status: (dbPractice.status || 'active') as "active" | "inactive" | "pending",
        establishedDate: dbPractice.established_date || '',
        lastUpdated: dbPractice.updated_at || dbPractice.created_at || '',
        providerCount: dbPractice.provider_count || 0,
        patientCount: dbPractice.patient_count || 0,
        monthlyRevenue: parseFloat(dbPractice.monthly_revenue || '0'),
        payToSameAsPrimary: dbPractice.pay_to_same_as_primary !== false
      }));

      console.log(`✅ Successfully loaded ${transformedPractices.length} practices from database`);
      setPractices(transformedPractices);
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in fetchPracticesFromDatabase:', error);
      toast({
        title: 'Error loading practices',
        description: error.message || 'Failed to load practices from database',
        variant: 'destructive',
      });
      setPractices([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

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

  const handleAddPractice = async () => {
    if (!newPractice.name || !newPractice.npi || !newPractice.taxonomySpecialty) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, NPI, Taxonomy Specialty).",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Creating practice:', newPractice);

      // Prepare data for database (snake_case)
      const insertData: any = {
        name: newPractice.name!.trim(),
        npi: newPractice.npi!.trim(),
        organization_type: newPractice.organizationType || null,
        taxonomy_specialty: newPractice.taxonomySpecialty!.trim(),
        reference_number: newPractice.referenceNumber || null,
        tcn_prefix: newPractice.tcnPrefix || null,
        statement_tcn_prefix: newPractice.statementTcnPrefix || null,
        code: newPractice.code || null,
        address_line1: newPractice.addressLine1 || null,
        address_line2: newPractice.addressLine2 || null,
        city: newPractice.city || null,
        state: newPractice.state || null,
        zip_code: newPractice.zipCode || null,
        time_zone: newPractice.timeZone || null,
        phone: newPractice.phone || null,
        fax: newPractice.fax || null,
        email: newPractice.email || null,
        pay_to_same_as_primary: newPractice.payToSameAsPrimary !== false,
        pay_to_address_line1: newPractice.payToSameAsPrimary 
          ? (newPractice.addressLine1 || null)
          : (newPractice.payToAddressLine1 || null),
        pay_to_address_line2: newPractice.payToSameAsPrimary 
          ? (newPractice.addressLine2 || null)
          : (newPractice.payToAddressLine2 || null),
        pay_to_city: newPractice.payToSameAsPrimary 
          ? (newPractice.city || null)
          : (newPractice.payToCity || null),
        pay_to_state: newPractice.payToSameAsPrimary 
          ? (newPractice.state || null)
          : (newPractice.payToState || null),
        pay_to_zip_code: newPractice.payToSameAsPrimary 
          ? (newPractice.zipCode || null)
          : (newPractice.payToZipCode || null),
        pay_to_phone: newPractice.payToSameAsPrimary 
          ? (newPractice.phone || null)
          : (newPractice.payToPhone || null),
        pay_to_fax: newPractice.payToSameAsPrimary 
          ? (newPractice.fax || null)
          : (newPractice.payToFax || null),
        pay_to_email: newPractice.payToSameAsPrimary 
          ? (newPractice.email || null)
          : (newPractice.payToEmail || null),
        status: (newPractice.status || 'active') as 'active' | 'inactive' | 'pending',
        established_date: newPractice.establishedDate || null,
        provider_count: 0,
        patient_count: 0,
        monthly_revenue: 0
      };

      // Remove null values for optional fields
      Object.keys(insertData).forEach(key => {
        if (insertData[key] === null || insertData[key] === '') {
          delete insertData[key];
        }
      });

      const { data, error } = await supabase
        .from('practices' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating practice:', error);
        throw new Error(error.message || 'Failed to create practice');
      }

      // Refresh the practices list
      await fetchPracticesFromDatabase();

      // Reset form
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
        description: `${newPractice.name} has been successfully added.`,
    });
    } catch (error: any) {
      console.error('💥 Failed to create practice:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create practice. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleEditPractice = (practice: Practice) => {
    setSelectedPractice(practice);
    setIsEditDialogOpen(true);
  };

  // NPI Lookup Handler
  const handleNPILookup = async () => {
    if (!newPractice.npi || newPractice.npi.replace(/\D/g, '').length !== 10) {
      toast({
        title: "Invalid NPI",
        description: "Please enter a valid 10-digit NPI number.",
        variant: "destructive",
      });
      return;
    }

    setIsSearchingNPI(true);
    try {
      const result = await searchNPIByNumber(newPractice.npi);
      
      if (!result) {
        toast({
          title: "NPI Not Found",
          description: "No provider found with this NPI number.",
          variant: "destructive",
        });
        setNpiSearchResults(null);
        return;
      }

      setNpiSearchResults(result);

      // Auto-populate fields from NPI data
      if (result.basic.organization_name) {
        setNewPractice(prev => ({
          ...prev,
          name: result.basic.organization_name || prev.name,
          organizationType: result.basic.organization_name ? 'Group Practice' : prev.organizationType
        }));
      } else if (result.basic.first_name && result.basic.last_name) {
        setNewPractice(prev => ({
          ...prev,
          name: `${result.basic.first_name} ${result.basic.last_name}`.trim() || prev.name,
          organizationType: 'Solo Practice'
        }));
      }

      // Get primary address
      const primaryAddress = result.addresses?.find(addr => addr.address_1) || result.addresses?.[0];
      if (primaryAddress) {
        setNewPractice(prev => ({
          ...prev,
          addressLine1: primaryAddress.address_1 || prev.addressLine1,
          addressLine2: primaryAddress.address_2 || prev.addressLine2,
          city: primaryAddress.city || prev.city,
          state: primaryAddress.state || prev.state,
          zipCode: primaryAddress.postal_code || prev.zipCode,
          phone: primaryAddress.telephone_number || prev.phone,
          fax: primaryAddress.fax_number || prev.fax
        }));
      }

      // Get primary taxonomy
      const primaryTaxonomy = result.taxonomies?.find(tax => tax.primary) || result.taxonomies?.[0];
      if (primaryTaxonomy) {
        setNewPractice(prev => ({
          ...prev,
          taxonomySpecialty: primaryTaxonomy.desc || prev.taxonomySpecialty
        }));
      }

      toast({
        title: "NPI Found",
        description: `Provider information loaded successfully.`,
      });
    } catch (error: any) {
      console.error('Error looking up NPI:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to lookup NPI. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsSearchingNPI(false);
    }
  };

  // Taxonomy Lookup Handler
  const handleTaxonomyLookup = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setTaxonomySearchResults([]);
      setShowTaxonomyDropdown(false);
      return;
    }

    setIsSearchingTaxonomy(true);
    try {
      // First try local search (faster)
      const localResults = searchTaxonomyCodes(searchTerm);
      
      if (localResults.length > 0) {
        setTaxonomySearchResults(localResults.map(t => ({ code: t.code, description: t.description })));
        setShowTaxonomyDropdown(true);
      } else {
        // If no local results, try API search
        const apiResults = await searchTaxonomyByDescription(searchTerm, 10);
        setTaxonomySearchResults(apiResults);
        setShowTaxonomyDropdown(apiResults.length > 0);
      }
    } catch (error: any) {
      console.error('Error looking up taxonomy:', error);
      // Fallback to local search on error
      const localResults = searchTaxonomyCodes(searchTerm);
      setTaxonomySearchResults(localResults.map(t => ({ code: t.code, description: t.description })));
      setShowTaxonomyDropdown(localResults.length > 0);
    } finally {
      setIsSearchingTaxonomy(false);
    }
  };

  const handleTaxonomySelect = (code: string, description: string) => {
    setNewPractice(prev => ({ ...prev, taxonomySpecialty: description }));
    setShowTaxonomyDropdown(false);
    setTaxonomySearchResults([]);
  };

  // Edit Form NPI Lookup Handler
  const handleNPILookupEdit = async () => {
    if (!selectedPractice?.npi || selectedPractice.npi.replace(/\D/g, '').length !== 10) {
      toast({
        title: "Invalid NPI",
        description: "Please enter a valid 10-digit NPI number.",
        variant: "destructive",
      });
      return;
    }

    setIsSearchingNPIEdit(true);
    try {
      const result = await searchNPIByNumber(selectedPractice.npi);
      
      if (!result) {
        toast({
          title: "NPI Not Found",
          description: "No provider found with this NPI number.",
          variant: "destructive",
        });
        setNpiSearchResultsEdit(null);
        return;
      }

      setNpiSearchResultsEdit(result);

      // Auto-populate fields from NPI data
      if (result.basic.organization_name) {
        setSelectedPractice(prev => prev ? {
          ...prev,
          name: result.basic.organization_name || prev.name,
          organizationType: result.basic.organization_name ? 'Group Practice' : prev.organizationType
        } : null);
      } else if (result.basic.first_name && result.basic.last_name) {
        setSelectedPractice(prev => prev ? {
          ...prev,
          name: `${result.basic.first_name} ${result.basic.last_name}`.trim() || prev.name,
          organizationType: 'Solo Practice'
        } : null);
      }

      // Get primary address
      const primaryAddress = result.addresses?.find(addr => addr.address_1) || result.addresses?.[0];
      if (primaryAddress && selectedPractice) {
        setSelectedPractice(prev => prev ? {
          ...prev,
          addressLine1: primaryAddress.address_1 || prev.addressLine1,
          addressLine2: primaryAddress.address_2 || prev.addressLine2,
          city: primaryAddress.city || prev.city,
          state: primaryAddress.state || prev.state,
          zipCode: primaryAddress.postal_code || prev.zipCode,
          phone: primaryAddress.telephone_number || prev.phone,
          fax: primaryAddress.fax_number || prev.fax
        } : null);
      }

      // Get primary taxonomy
      const primaryTaxonomy = result.taxonomies?.find(tax => tax.primary) || result.taxonomies?.[0];
      if (primaryTaxonomy && selectedPractice) {
        setSelectedPractice(prev => prev ? {
          ...prev,
          taxonomySpecialty: primaryTaxonomy.desc || prev.taxonomySpecialty
        } : null);
      }

      toast({
        title: "NPI Found",
        description: `Provider information loaded successfully.`,
      });
    } catch (error: any) {
      console.error('Error looking up NPI:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to lookup NPI. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsSearchingNPIEdit(false);
    }
  };

  // Edit Form Taxonomy Lookup Handler
  const handleTaxonomyLookupEdit = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setTaxonomySearchResultsEdit([]);
      setShowTaxonomyDropdownEdit(false);
      return;
    }

    setIsSearchingTaxonomyEdit(true);
    try {
      const localResults = searchTaxonomyCodes(searchTerm);
      
      if (localResults.length > 0) {
        setTaxonomySearchResultsEdit(localResults.map(t => ({ code: t.code, description: t.description })));
        setShowTaxonomyDropdownEdit(true);
      } else {
        const apiResults = await searchTaxonomyByDescription(searchTerm, 10);
        setTaxonomySearchResultsEdit(apiResults);
        setShowTaxonomyDropdownEdit(apiResults.length > 0);
      }
    } catch (error: any) {
      console.error('Error looking up taxonomy:', error);
      const localResults = searchTaxonomyCodes(searchTerm);
      setTaxonomySearchResultsEdit(localResults.map(t => ({ code: t.code, description: t.description })));
      setShowTaxonomyDropdownEdit(localResults.length > 0);
    } finally {
      setIsSearchingTaxonomyEdit(false);
    }
  };

  const handleTaxonomySelectEdit = (code: string, description: string) => {
    setSelectedPractice(prev => prev ? { ...prev, taxonomySpecialty: description } : null);
    setShowTaxonomyDropdownEdit(false);
    setTaxonomySearchResultsEdit([]);
  };

  const handleDeletePractice = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this practice? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting practice:', id);

      const { error } = await supabase
        .from('practices' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting practice:', error);
        throw new Error(error.message || 'Failed to delete practice');
      }

      // Refresh the practices list
      await fetchPracticesFromDatabase();

    toast({
      title: "Practice Deleted",
      description: "Practice has been successfully deleted.",
    });
    } catch (error: any) {
      console.error('💥 Failed to delete practice:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete practice. Please try again.',
        variant: "destructive",
      });
    }
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

  const handleUpdatePractice = async (updatedPractice: Practice) => {
    if (!updatedPractice.id) {
      toast({
        title: "Error",
        description: "Practice ID is missing. Cannot update.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 Updating practice:', updatedPractice);

      // Prepare data for database (snake_case)
      const updateData: any = {
        name: updatedPractice.name.trim(),
        npi: updatedPractice.npi.trim(),
        organization_type: updatedPractice.organizationType || null,
        taxonomy_specialty: updatedPractice.taxonomySpecialty || null,
        reference_number: updatedPractice.referenceNumber || null,
        tcn_prefix: updatedPractice.tcnPrefix || null,
        statement_tcn_prefix: updatedPractice.statementTcnPrefix || null,
        code: updatedPractice.code || null,
        address_line1: updatedPractice.addressLine1 || null,
        address_line2: updatedPractice.addressLine2 || null,
        city: updatedPractice.city || null,
        state: updatedPractice.state || null,
        zip_code: updatedPractice.zipCode || null,
        time_zone: updatedPractice.timeZone || null,
        phone: updatedPractice.phone || null,
        fax: updatedPractice.fax || null,
        email: updatedPractice.email || null,
        pay_to_same_as_primary: updatedPractice.payToSameAsPrimary !== false,
        pay_to_address_line1: updatedPractice.payToSameAsPrimary 
          ? (updatedPractice.addressLine1 || null)
          : (updatedPractice.payToAddressLine1 || null),
        pay_to_address_line2: updatedPractice.payToSameAsPrimary 
          ? (updatedPractice.addressLine2 || null)
          : (updatedPractice.payToAddressLine2 || null),
        pay_to_city: updatedPractice.payToSameAsPrimary 
          ? (updatedPractice.city || null)
          : (updatedPractice.payToCity || null),
        pay_to_state: updatedPractice.payToSameAsPrimary 
          ? (updatedPractice.state || null)
          : (updatedPractice.payToState || null),
        pay_to_zip_code: updatedPractice.payToSameAsPrimary 
          ? (updatedPractice.zipCode || null)
          : (updatedPractice.payToZipCode || null),
        pay_to_phone: updatedPractice.payToSameAsPrimary 
          ? (updatedPractice.phone || null)
          : (updatedPractice.payToPhone || null),
        pay_to_fax: updatedPractice.payToSameAsPrimary 
          ? (updatedPractice.fax || null)
          : (updatedPractice.payToFax || null),
        pay_to_email: updatedPractice.payToSameAsPrimary 
          ? (updatedPractice.email || null)
          : (updatedPractice.payToEmail || null),
        status: updatedPractice.status as 'active' | 'inactive' | 'pending',
        established_date: updatedPractice.establishedDate || null,
        provider_count: updatedPractice.providerCount || 0,
        patient_count: updatedPractice.patientCount || 0,
        monthly_revenue: updatedPractice.monthlyRevenue || 0
      };

      // Remove null values for optional fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const { error } = await supabase
        .from('practices' as any)
        .update(updateData)
        .eq('id', updatedPractice.id);

      if (error) {
        console.error('❌ Error updating practice:', error);
        throw new Error(error.message || 'Failed to update practice');
      }

      // Refresh the practices list
      await fetchPracticesFromDatabase();

    setSelectedPractice(null);
    setIsEditDialogOpen(false);

    toast({
      title: "Practice Updated",
      description: `${updatedPractice.name} has been successfully updated.`,
    });
    } catch (error: any) {
      console.error('💥 Failed to update practice:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update practice. Please try again.',
        variant: "destructive",
      });
    }
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
                          onChange={(e) => {
                            setNewPractice(prev => ({ ...prev, npi: e.target.value }));
                            setNpiSearchResults(null);
                          }}
                          placeholder="10-digit NPI"
                          autoComplete="off"
                          maxLength={10}
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={handleNPILookup}
                          disabled={isSearchingNPI || !newPractice.npi || newPractice.npi.replace(/\D/g, '').length !== 10}
                          title="Lookup NPI information"
                        >
                          {isSearchingNPI ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          ) : (
                          <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {npiSearchResults && (
                        <Alert className="mt-2">
                          <AlertDescription className="text-sm">
                            <strong>Found:</strong> {npiSearchResults.basic.organization_name || 
                              `${npiSearchResults.basic.first_name} ${npiSearchResults.basic.last_name}`.trim()}
                            {npiSearchResults.taxonomies?.[0] && (
                              <span className="block mt-1">Specialty: {npiSearchResults.taxonomies[0].desc}</span>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
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
                    <div className="relative">
                      <Label htmlFor="taxonomySpecialty" className="text-red-600">Taxonomy Specialty *</Label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                        <Input
                          id="taxonomySpecialty"
                          value={newPractice.taxonomySpecialty}
                            onChange={(e) => {
                              setNewPractice(prev => ({ ...prev, taxonomySpecialty: e.target.value }));
                              handleTaxonomyLookup(e.target.value);
                            }}
                            onFocus={() => {
                              if (newPractice.taxonomySpecialty) {
                                handleTaxonomyLookup(newPractice.taxonomySpecialty);
                              }
                            }}
                          placeholder="Enter taxonomy specialty"
                        />
                          {showTaxonomyDropdown && taxonomySearchResults.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {taxonomySearchResults.map((taxonomy) => (
                                <div
                                  key={taxonomy.code}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                  onClick={() => handleTaxonomySelect(taxonomy.code, taxonomy.description)}
                                >
                                  <div className="font-medium text-sm">{taxonomy.description}</div>
                                  <div className="text-xs text-gray-500">Code: {taxonomy.code}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTaxonomyLookup(newPractice.taxonomySpecialty || '')}
                          disabled={isSearchingTaxonomy || !newPractice.taxonomySpecialty}
                          title="Search taxonomy codes"
                        >
                          {isSearchingTaxonomy ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          ) : (
                          <Search className="h-4 w-4" />
                          )}
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
                            onChange={(e) => {
                              setSelectedPractice(prev => prev ? { ...prev, npi: e.target.value } : null);
                              setNpiSearchResultsEdit(null);
                            }}
                            placeholder="10-digit NPI"
                            maxLength={10}
                          />
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={handleNPILookupEdit}
                            disabled={isSearchingNPIEdit || !selectedPractice.npi || selectedPractice.npi.replace(/\D/g, '').length !== 10}
                            title="Lookup NPI information"
                          >
                            {isSearchingNPIEdit ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            ) : (
                            <Search className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {npiSearchResultsEdit && (
                          <Alert className="mt-2">
                            <AlertDescription className="text-sm">
                              <strong>Found:</strong> {npiSearchResultsEdit.basic.organization_name || 
                                `${npiSearchResultsEdit.basic.first_name} ${npiSearchResultsEdit.basic.last_name}`.trim()}
                              {npiSearchResultsEdit.taxonomies?.[0] && (
                                <span className="block mt-1">Specialty: {npiSearchResultsEdit.taxonomies[0].desc}</span>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}
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
                      <div className="relative">
                        <Label htmlFor="edit-taxonomySpecialty" className="text-red-600">Taxonomy Specialty *</Label>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                          <Input
                            id="edit-taxonomySpecialty"
                            value={selectedPractice.taxonomySpecialty}
                              onChange={(e) => {
                                setSelectedPractice(prev => prev ? { ...prev, taxonomySpecialty: e.target.value } : null);
                                handleTaxonomyLookupEdit(e.target.value);
                              }}
                              onFocus={() => {
                                if (selectedPractice.taxonomySpecialty) {
                                  handleTaxonomyLookupEdit(selectedPractice.taxonomySpecialty);
                                }
                              }}
                            placeholder="Enter taxonomy specialty"
                          />
                            {showTaxonomyDropdownEdit && taxonomySearchResultsEdit.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {taxonomySearchResultsEdit.map((taxonomy) => (
                                  <div
                                    key={taxonomy.code}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                    onClick={() => handleTaxonomySelectEdit(taxonomy.code, taxonomy.description)}
                                  >
                                    <div className="font-medium text-sm">{taxonomy.description}</div>
                                    <div className="text-xs text-gray-500">Code: {taxonomy.code}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTaxonomyLookupEdit(selectedPractice.taxonomySpecialty || '')}
                            disabled={isSearchingTaxonomyEdit || !selectedPractice.taxonomySpecialty}
                            title="Search taxonomy codes"
                          >
                            {isSearchingTaxonomyEdit ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            ) : (
                            <Search className="h-4 w-4" />
                            )}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading practices...</p>
            </div>
          </div>
        ) : filteredPractices.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No practices found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "all" || filterType !== "all"
                ? "Try adjusting your search criteria"
                : "Get started by adding your first practice"}
            </p>
            {!searchTerm && filterStatus === "all" && filterType === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Practice
              </Button>
            )}
          </div>
        ) : (
          filteredPractices.map((practice) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default Practices;


