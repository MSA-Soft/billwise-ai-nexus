
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Send, Save, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BillingModule = () => {
  const [selectedFormat, setSelectedFormat] = useState("hcfa");
  const { toast } = useToast();

  const billingFormats = [
    { value: "hcfa", label: "HCFA/CMS-1500 (Professional)", description: "For physician and professional services" },
    { value: "ub04", label: "UB-04 (Institutional)", description: "For hospital and institutional services" },
    { value: "ada", label: "ADA (Dental)", description: "For dental services and procedures" }
  ];

  const mockClaims = [
    { id: "CLM-2024-001", patient: "John Smith", format: "HCFA", amount: 450.00, status: "Submitted", date: "2024-06-28" },
    { id: "CLM-2024-002", patient: "Sarah Johnson", format: "UB-04", amount: 1275.50, status: "Processing", date: "2024-06-29" },
    { id: "CLM-2024-003", patient: "Mike Davis", format: "ADA", amount: 325.75, status: "Paid", date: "2024-06-30" },
  ];

  const handleSubmitClaim = () => {
    toast({
      title: "Claim Submitted Successfully",
      description: "Your claim has been submitted for processing.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Processing": return "bg-blue-100 text-blue-800";
      case "Submitted": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Medical Billing Management</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <FileText className="h-4 w-4 mr-2" />
          New Claim
        </Button>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Claim</TabsTrigger>
          <TabsTrigger value="manage">Manage Claims</TabsTrigger>
          <TabsTrigger value="formats">Billing Formats</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Medical Claim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Format Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {billingFormats.map((format) => (
                  <Card 
                    key={format.value}
                    className={`cursor-pointer transition-all ${
                      selectedFormat === format.value 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedFormat(format.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">{format.label}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Claim Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Enter first name" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Enter last name" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="memberId">Member ID</Label>
                    <Input id="memberId" placeholder="Enter member ID" />
                  </div>
                  <div>
                    <Label htmlFor="insurance">Insurance Provider</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select insurance provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aetna">Aetna</SelectItem>
                        <SelectItem value="bcbs">Blue Cross Blue Shield</SelectItem>
                        <SelectItem value="cigna">Cigna</SelectItem>
                        <SelectItem value="humana">Humana</SelectItem>
                        <SelectItem value="medicare">Medicare</SelectItem>
                        <SelectItem value="medicaid">Medicaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Service Information</h3>
                  <div>
                    <Label htmlFor="serviceDate">Date of Service</Label>
                    <Input id="serviceDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="procedureCode">Procedure Code</Label>
                    <Input id="procedureCode" placeholder="Enter CPT/HCPCS code" />
                  </div>
                  <div>
                    <Label htmlFor="diagnosisCode">Diagnosis Code</Label>
                    <Input id="diagnosisCode" placeholder="Enter ICD-10 code" />
                  </div>
                  <div>
                    <Label htmlFor="chargeAmount">Charge Amount</Label>
                    <Input id="chargeAmount" type="number" placeholder="0.00" step="0.01" />
                  </div>
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dr-smith">Dr. John Smith</SelectItem>
                        <SelectItem value="dr-johnson">Dr. Sarah Johnson</SelectItem>
                        <SelectItem value="dr-davis">Dr. Mike Davis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={handleSubmitClaim} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Claim
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Claims Management</CardTitle>
                <div className="flex space-x-2">
                  <Input placeholder="Search claims..." className="w-64" />
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockClaims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="font-semibold">{claim.id}</div>
                        <div className="text-sm text-gray-600">{claim.patient}</div>
                        <div className="text-xs text-gray-500">{claim.format} • {claim.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">${claim.amount.toFixed(2)}</div>
                        <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {billingFormats.map((format) => (
              <Card key={format.value}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>{format.label}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{format.description}</p>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Key Features:</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {format.value === 'hcfa' && (
                        <>
                          <li>• Professional services billing</li>
                          <li>• Physician office visits</li>
                          <li>• Outpatient procedures</li>
                          <li>• Laboratory services</li>
                        </>
                      )}
                      {format.value === 'ub04' && (
                        <>
                          <li>• Hospital inpatient billing</li>
                          <li>• Emergency room services</li>
                          <li>• Outpatient hospital services</li>
                          <li>• Skilled nursing facilities</li>
                        </>
                      )}
                      {format.value === 'ada' && (
                        <>
                          <li>• Dental procedures</li>
                          <li>• Orthodontic treatment</li>
                          <li>• Oral surgery</li>
                          <li>• Preventive care</li>
                        </>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingModule;
