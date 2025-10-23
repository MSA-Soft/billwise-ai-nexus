import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  BookOpen, 
  Shield,
  Target, 
  Activity, 
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  CreditCard,
  Clock,
  Eye,
  Copy,
  RefreshCw,
  Zap,
  Database,
  FileCheck,
  Receipt
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PayerRulesManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayer, setSelectedPayer] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newRule, setNewRule] = useState({
    field: "",
    operator: "",
    value: "",
    action: ""
  });

  // Mock payer rules data
  const payerRules = [
    {
      id: "BCBS001",
      payerName: "Blue Cross Blue Shield",
      payerId: "BCBS",
      rules: [
        {
          id: "R001",
          name: "Prior Authorization Required",
          description: "Certain procedures require prior authorization",
          field: "cpt_code",
          operator: "in",
          value: "99215,99216,99217",
          action: "require_pa",
          isActive: true,
          effectiveDate: "2024-01-01",
          expirationDate: null
        },
        {
          id: "R002", 
          name: "CPT Code Range",
          description: "Acceptable CPT code range for primary care",
          field: "cpt_code",
          operator: "between",
          value: "99201-99215",
          action: "allow",
          isActive: true,
          effectiveDate: "2024-01-01",
          expirationDate: null
        },
        {
          id: "R003",
          name: "Diagnosis Specificity",
          description: "Require specific ICD-10 codes for certain procedures",
          field: "icd_code",
          operator: "starts_with",
          value: "Z00",
          action: "require_specificity",
          isActive: true,
          effectiveDate: "2024-01-01",
          expirationDate: null
        }
      ]
    },
    {
      id: "AETNA001",
      payerName: "Aetna",
      payerId: "AETNA",
      rules: [
        {
          id: "R004",
          name: "Modifier Requirements",
          description: "Certain modifiers required for specific procedures",
          field: "modifier",
          operator: "required",
          value: "25,59",
          action: "require_modifier",
          isActive: true,
          effectiveDate: "2024-01-01",
          expirationDate: null
        },
        {
          id: "R005",
          name: "Billing Frequency",
          description: "Limit on number of visits per year",
          field: "visit_count",
          operator: "less_than",
          value: "12",
          action: "allow",
          isActive: true,
          effectiveDate: "2024-01-01",
          expirationDate: null
        }
      ]
    },
    {
      id: "CIGNA001",
      payerName: "Cigna",
      payerId: "CIGNA",
      rules: [
        {
          id: "R006",
          name: "Coverage Verification",
          description: "Verify coverage before submitting claims",
          field: "coverage_status",
          operator: "equals",
          value: "active",
          action: "require_verification",
          isActive: true,
          effectiveDate: "2024-01-01",
          expirationDate: null
        }
      ]
    }
  ];

  const ruleFields = [
    { value: "cpt_code", label: "CPT Code" },
    { value: "icd_code", label: "ICD-10 Code" },
    { value: "modifier", label: "Modifier" },
    { value: "visit_count", label: "Visit Count" },
    { value: "coverage_status", label: "Coverage Status" },
    { value: "patient_age", label: "Patient Age" },
    { value: "service_date", label: "Service Date" }
  ];

  const operators = [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
    { value: "in", label: "In List" },
    { value: "not_in", label: "Not In List" },
    { value: "starts_with", label: "Starts With" },
    { value: "ends_with", label: "Ends With" },
    { value: "contains", label: "Contains" },
    { value: "between", label: "Between" },
    { value: "less_than", label: "Less Than" },
    { value: "greater_than", label: "Greater Than" },
    { value: "required", label: "Required" },
    { value: "optional", label: "Optional" }
  ];

  const actions = [
    { value: "allow", label: "Allow" },
    { value: "deny", label: "Deny" },
    { value: "require_pa", label: "Require Prior Authorization" },
    { value: "require_modifier", label: "Require Modifier" },
    { value: "require_specificity", label: "Require Specificity" },
    { value: "require_verification", label: "Require Verification" },
    { value: "flag_review", label: "Flag for Review" },
    { value: "auto_adjust", label: "Auto Adjust" }
  ];

  const filteredPayers = payerRules.filter(payer => 
    payer.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payer.payerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRule = () => {
    if (!selectedPayer) {
      toast({
        title: "No Payer Selected",
        description: "Please select a payer to add rules to.",
        variant: "destructive",
      });
      return;
    }

    if (!newRule.field || !newRule.operator || !newRule.value || !newRule.action) {
      toast({
        title: "Incomplete Rule",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const rule = {
      id: `R${Date.now()}`,
      name: `${newRule.field} ${newRule.operator} ${newRule.value}`,
      description: `Rule for ${newRule.field}`,
      field: newRule.field,
      operator: newRule.operator,
      value: newRule.value,
      action: newRule.action,
      isActive: true,
        effectiveDate: new Date().toISOString().split('T')[0],
      expirationDate: null
    };

    // Add rule to selected payer
    const updatedPayers = payerRules.map(payer => 
      payer.id === selectedPayer.id 
        ? { ...payer, rules: [...payer.rules, rule] }
        : payer
    );

    setNewRule({ field: "", operator: "", value: "", action: "" });

      toast({
        title: "Rule Added",
      description: "New rule has been added successfully.",
    });
  };

  const handleToggleRule = (payerId: string, ruleId: string) => {
      toast({
        title: "Rule Updated",
      description: "Rule status has been toggled.",
    });
  };

  const handleDeleteRule = (payerId: string, ruleId: string) => {
      toast({
      title: "Rule Deleted",
      description: "Rule has been removed successfully.",
    });
  };

  const handleExportRules = () => {
      toast({
      title: "Export Started",
      description: "Payer rules are being exported to Excel...",
    });
  };

  const handleImportRules = () => {
    toast({
      title: "Import Rules",
      description: "Please select a JSON or Excel file to import rules.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            Payer Rules Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Define claim and coverage behavior per payer
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportRules}>
            <Download className="h-4 w-4 mr-2" />
            Export Rules
          </Button>
          <Button variant="outline" onClick={handleImportRules}>
            <Upload className="h-4 w-4 mr-2" />
            Import Rules
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules">Payer Rules</TabsTrigger>
          <TabsTrigger value="add">Add Rule</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Payer Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payer Rules List */}
          <div className="space-y-4">
            {filteredPayers.map((payer) => (
              <Card key={payer.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{payer.payerName}</CardTitle>
                        <p className="text-sm text-muted-foreground">ID: {payer.payerId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{payer.rules.length} rules</Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedPayer(payer)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {payer.rules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {rule.isActive ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <div>
                              <span className="font-medium">{rule.name}</span>
                              <p className="text-sm text-muted-foreground">{rule.description}</p>
                            </div>
                          </div>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {rule.field} {rule.operator} {rule.value}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleToggleRule(payer.id, rule.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteRule(payer.id, rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Add Rule Tab */}
        <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Rule
              </CardTitle>
              </CardHeader>
            <CardContent className="space-y-6">
              {/* Payer Selection */}
                <div>
                <Label htmlFor="payer-select">Select Payer</Label>
                <Select value={selectedPayer?.id || ""} onValueChange={(value) => {
                  const payer = payerRules.find(p => p.id === value);
                  setSelectedPayer(payer);
                }}>
                    <SelectTrigger>
                    <SelectValue placeholder="Choose a payer" />
                    </SelectTrigger>
                    <SelectContent>
                    {payerRules.map((payer) => (
                        <SelectItem key={payer.id} value={payer.id}>
                        {payer.payerName} ({payer.payerId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rule Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field">Field</Label>
                  <Select value={newRule.field} onValueChange={(value) => setNewRule(prev => ({ ...prev, field: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {ruleFields.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                  <div>
                  <Label htmlFor="operator">Operator</Label>
                  <Select value={newRule.operator} onValueChange={(value) => setNewRule(prev => ({ ...prev, operator: value }))}>
                      <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                <div>
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    value={newRule.value}
                    onChange={(e) => setNewRule(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Enter value"
                  />
                </div>

                  <div>
                    <Label htmlFor="action">Action</Label>
                  <Select value={newRule.action} onValueChange={(value) => setNewRule(prev => ({ ...prev, action: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        {actions.map((action) => (
                          <SelectItem key={action.value} value={action.value}>
                            {action.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter rule description"
                  rows={3}
                  />
                </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="active" defaultChecked />
                <Label htmlFor="active">Rule is active</Label>
                </div>

              <div className="flex gap-3">
                <Button onClick={handleAddRule} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
                <Button variant="outline" onClick={() => setNewRule({ field: "", operator: "", value: "", action: "" })}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                  </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Rule Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Prior Authorization</span>
                  </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Template for PA requirements
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="font-medium">CPT Code Range</span>
                </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Template for acceptable CPT ranges
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Use Template
                </Button>
              </CardContent>
            </Card>

                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Modifier Rules</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Template for modifier requirements
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Rule Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Rules</span>
                    <span className="text-2xl font-bold">{payerRules.reduce((sum, payer) => sum + payer.rules.length, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Rules</span>
                    <span className="text-2xl font-bold text-green-600">
                      {payerRules.reduce((sum, payer) => sum + payer.rules.filter(r => r.isActive).length, 0)}
                    </span>
                            </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Inactive Rules</span>
                    <span className="text-2xl font-bold text-red-600">
                      {payerRules.reduce((sum, payer) => sum + payer.rules.filter(r => !r.isActive).length, 0)}
                              </span>
                            </div>
                          </div>
              </CardContent>
            </Card>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Rule Effectiveness
                </CardTitle>
            </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payerRules.map((payer) => (
                    <div key={payer.id} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{payer.payerName}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(payer.rules.filter(r => r.isActive).length / payer.rules.length) * 100}%` }}
                          ></div>
              </div>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((payer.rules.filter(r => r.isActive).length / payer.rules.length) * 100)}%
                    </span>
                  </div>
                        </div>
                      ))}
                    </div>
            </CardContent>
          </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayerRulesManagement;
