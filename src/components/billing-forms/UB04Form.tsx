import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// UB-04 (CMS-1450) Institutional Claim Form
// Used for hospitals, skilled nursing facilities, home health agencies

const UB04Form = () => {
  const [formData, setFormData] = useState({
    // Field 1 - Provider Name, Address, Phone
    providerName: "",
    providerAddress: "",
    providerCity: "",
    providerState: "",
    providerZip: "",
    providerPhone: "",
    // Field 2 - Pay-To Provider Name and Address
    payToName: "",
    payToAddress: "",
    // Field 3a-3b - Patient Control Number and Medical Record Number
    patientControlNumber: "",
    medicalRecordNumber: "",
    // Field 4 - Type of Bill
    typeOfBill: "",
    // Field 5 - Federal Tax Number
    federalTaxNumber: "",
    // Field 6 - Statement Covers Period
    statementFromDate: "",
    statementToDate: "",
    // Field 8 - Patient Name
    patientName: "",
    // Field 9 - Patient Address
    patientAddress: "",
    patientCity: "",
    patientState: "",
    patientZip: "",
    // Field 10 - Patient Birth Date
    patientDOB: "",
    // Field 11 - Patient Sex
    patientSex: "",
    // Field 12 - Admission Date
    admissionDate: "",
    // Field 13 - Admission Hour
    admissionHour: "",
    // Field 14 - Admission Type
    admissionType: "",
    // Field 15 - Admission Source
    admissionSource: "",
    // Field 16 - Discharge Hour
    dischargeHour: "",
    // Field 17 - Patient Status
    patientStatus: "",
    // Field 18-28 - Condition Codes
    conditionCodes: Array(11).fill(""),
    // Field 31-34 - Occurrence Codes and Dates
    occurrenceCodes: Array(4).fill({ code: "", date: "" }),
    // Field 35-36 - Occurrence Span Codes
    occurrenceSpan: Array(2).fill({ code: "", from: "", through: "" }),
    // Field 39-41 - Value Codes and Amounts
    valueCodes: Array(4).fill({ code: "", amount: "" }),
    // Field 42 - Revenue Code Lines (23 lines max)
    revenueLines: Array(23).fill(null).map(() => ({
      revenueCode: "",
      description: "",
      hcpcs: "",
      serviceDate: "",
      serviceUnits: "",
      totalCharges: "",
      nonCoveredCharges: ""
    })),
    // Field 50 - Payer Information (3 payers)
    payers: Array(3).fill({ name: "", id: "", payerIdentifier: "" }),
    // Field 58 - Insured's Name
    insuredName: "",
    // Field 60 - Insured's Unique ID
    insuredId: "",
    // Field 66 - Diagnosis and Procedure Code ICD Version Indicator
    icdVersion: "0",
    // Field 67 - Principal Diagnosis Code
    principalDiagnosis: "",
    // Field 67A-Q - Other Diagnosis Codes
    otherDiagnoses: Array(17).fill(""),
    // Field 69 - Admitting Diagnosis
    admittingDiagnosis: "",
    // Field 70 - Patient Reason Diagnosis
    patientReasonDiagnosis: "",
    // Field 74 - Principal Procedure Code and Date
    principalProcedure: "",
    principalProcedureDate: "",
    // Field 74a-e - Other Procedure Codes and Dates
    otherProcedures: Array(5).fill({ code: "", date: "" }),
    // Field 76 - Attending Provider Name and Identifiers
    attendingProvider: "",
    attendingProviderNPI: "",
    // Field 77 - Operating Provider
    operatingProvider: "",
    operatingProviderNPI: "",
    // Field 78-79 - Other Providers
    otherProvider1: "",
    otherProvider1NPI: "",
    otherProvider2: "",
    otherProvider2NPI: "",
    // Field 80 - Remarks
    remarks: "",
    // Field 81 - Code-Code Field
    codeCodeField: ""
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card className="border-2 border-gray-800">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-center text-xl font-bold">
            UB-04 UNIFORM BILLING FORM<br />
            <span className="text-sm font-normal">(CMS-1450 / Institutional Claim)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Provider Information - Fields 1-2 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border-2 border-black p-4 bg-yellow-50">
              <Label className="text-xs font-bold">1. PROVIDER NAME, ADDRESS, ZIP CODE & PHONE</Label>
              <Input placeholder="Provider Name" className="mt-2" value={formData.providerName} onChange={(e) => setFormData({ ...formData, providerName: e.target.value })} />
              <Input placeholder="Address" className="mt-2" value={formData.providerAddress} onChange={(e) => setFormData({ ...formData, providerAddress: e.target.value })} />
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Input placeholder="City" value={formData.providerCity} onChange={(e) => setFormData({ ...formData, providerCity: e.target.value })} />
                <Input placeholder="State" value={formData.providerState} onChange={(e) => setFormData({ ...formData, providerState: e.target.value })} />
                <Input placeholder="ZIP" value={formData.providerZip} onChange={(e) => setFormData({ ...formData, providerZip: e.target.value })} />
              </div>
              <Input placeholder="Phone" className="mt-2" value={formData.providerPhone} onChange={(e) => setFormData({ ...formData, providerPhone: e.target.value })} />
            </div>
            <div className="border p-4">
              <Label className="text-xs font-bold">2. PAY-TO NAME & ADDRESS</Label>
              <Input placeholder="Pay-To Provider Name" className="mt-2" value={formData.payToName} onChange={(e) => setFormData({ ...formData, payToName: e.target.value })} />
              <Input placeholder="Pay-To Address" className="mt-2" value={formData.payToAddress} onChange={(e) => setFormData({ ...formData, payToAddress: e.target.value })} />
            </div>
          </div>

          {/* Patient Control and Medical Record - Fields 3a-3b */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="border p-4">
              <Label className="text-xs font-bold">3a. PATIENT CONTROL NO.</Label>
              <Input value={formData.patientControlNumber} onChange={(e) => setFormData({ ...formData, patientControlNumber: e.target.value })} className="mt-2" />
            </div>
            <div className="border p-4">
              <Label className="text-xs font-bold">3b. MEDICAL RECORD NO.</Label>
              <Input value={formData.medicalRecordNumber} onChange={(e) => setFormData({ ...formData, medicalRecordNumber: e.target.value })} className="mt-2" />
            </div>
            <div className="border p-4 bg-red-50">
              <Label className="text-xs font-bold">4. TYPE OF BILL (Required)</Label>
              <Input 
                value={formData.typeOfBill} 
                onChange={(e) => setFormData({ ...formData, typeOfBill: e.target.value })} 
                className="mt-2" 
                placeholder="0131 (Example)"
                maxLength={4}
              />
              <p className="text-[10px] text-gray-600 mt-1">4-digit code (e.g., 0131 for Hospital Inpatient)</p>
            </div>
          </div>

          {/* Statement Covers Period - Field 6 */}
          <div className="border p-4 mb-4">
            <Label className="text-xs font-bold">6. STATEMENT COVERS PERIOD</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label className="text-xs">FROM</Label>
                <Input type="date" value={formData.statementFromDate} onChange={(e) => setFormData({ ...formData, statementFromDate: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">THROUGH</Label>
                <Input type="date" value={formData.statementToDate} onChange={(e) => setFormData({ ...formData, statementToDate: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Patient Information - Fields 8-11 */}
          <div className="border-2 border-blue-600 p-4 mb-4 bg-blue-50">
            <Label className="text-xs font-bold mb-2 block">PATIENT INFORMATION</Label>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-xs font-bold">8. PATIENT NAME (Last, First, MI)</Label>
                <Input value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} className="mt-2" />
              </div>
              <div>
                <Label className="text-xs font-bold">9. PATIENT ADDRESS</Label>
                <Input placeholder="Street Address" className="mt-2" value={formData.patientAddress} onChange={(e) => setFormData({ ...formData, patientAddress: e.target.value })} />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Input placeholder="City" value={formData.patientCity} onChange={(e) => setFormData({ ...formData, patientCity: e.target.value })} />
                  <Input placeholder="State" value={formData.patientState} onChange={(e) => setFormData({ ...formData, patientState: e.target.value })} />
                  <Input placeholder="ZIP" value={formData.patientZip} onChange={(e) => setFormData({ ...formData, patientZip: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold">10. PATIENT BIRTH DATE</Label>
                  <Input type="date" value={formData.patientDOB} onChange={(e) => setFormData({ ...formData, patientDOB: e.target.value })} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs font-bold">11. PATIENT SEX</Label>
                  <Select value={formData.patientSex} onValueChange={(value) => setFormData({ ...formData, patientSex: value })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">M - Male</SelectItem>
                      <SelectItem value="F">F - Female</SelectItem>
                      <SelectItem value="U">U - Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Admission Information - Fields 12-17 */}
          <div className="border p-4 mb-4">
            <Label className="text-xs font-bold mb-2 block">ADMISSION INFORMATION</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">12. ADMISSION DATE</Label>
                <Input type="date" value={formData.admissionDate} onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">13. ADMISSION HOUR</Label>
                <Input type="time" value={formData.admissionHour} onChange={(e) => setFormData({ ...formData, admissionHour: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">14. ADMISSION TYPE</Label>
                <Select value={formData.admissionType} onValueChange={(value) => setFormData({ ...formData, admissionType: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Emergency</SelectItem>
                    <SelectItem value="2">2 - Urgent</SelectItem>
                    <SelectItem value="3">3 - Elective</SelectItem>
                    <SelectItem value="4">4 - Newborn</SelectItem>
                    <SelectItem value="5">5 - Trauma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">15. ADMISSION SOURCE</Label>
                <Input placeholder="Code" value={formData.admissionSource} onChange={(e) => setFormData({ ...formData, admissionSource: e.target.value })} className="mt-1" maxLength={2} />
              </div>
              <div>
                <Label className="text-xs">16. DISCHARGE HOUR</Label>
                <Input type="time" value={formData.dischargeHour} onChange={(e) => setFormData({ ...formData, dischargeHour: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">17. PATIENT STATUS</Label>
                <Select value={formData.patientStatus} onValueChange={(value) => setFormData({ ...formData, patientStatus: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">01 - Discharged to Home</SelectItem>
                    <SelectItem value="02">02 - Discharged to SNF</SelectItem>
                    <SelectItem value="03">03 - Discharged to ICF</SelectItem>
                    <SelectItem value="20">20 - Expired</SelectItem>
                    <SelectItem value="30">30 - Still Patient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Revenue Code Lines - Field 42 */}
          <div className="border-2 border-black p-4 mb-4 bg-green-50">
            <Label className="text-xs font-bold mb-4 block">42-49. REVENUE CODE DETAILS (Service Lines)</Label>
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} className="border p-3 bg-white rounded">
                  <Label className="text-xs font-semibold mb-2 block">Line {index + 1}</Label>
                  <div className="grid grid-cols-7 gap-2">
                    <div>
                      <Label className="text-[10px]">Rev Code</Label>
                      <Input placeholder="0450" className="text-xs" maxLength={4} />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[10px]">Description</Label>
                      <Input placeholder="Emergency Room" className="text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px]">HCPCS/Rate</Label>
                      <Input placeholder="99285" className="text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Service Date</Label>
                      <Input type="date" className="text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Units</Label>
                      <Input type="number" placeholder="1" className="text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Total Charges</Label>
                      <Input type="number" placeholder="0.00" className="text-xs" step="0.01" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payer Information - Fields 50-58 */}
          <div className="border p-4 mb-4">
            <Label className="text-xs font-bold mb-2 block">PAYER INFORMATION</Label>
            {[0, 1, 2].map((index) => (
              <div key={index} className="border p-3 mb-2 bg-gray-50 rounded">
                <Label className="text-xs font-semibold mb-2 block">Payer {index + 1}</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="Payer Name" className="text-sm" />
                  <Input placeholder="Payer ID" className="text-sm" />
                  <Input placeholder="Payer Identifier" className="text-sm" />
                </div>
              </div>
            ))}
          </div>

          {/* Diagnosis Codes - Fields 66-70 */}
          <div className="border-2 border-red-600 p-4 mb-4 bg-red-50">
            <Label className="text-xs font-bold mb-2 block">DIAGNOSIS CODES (ICD-10-CM)</Label>
            <div className="mb-4">
              <Label className="text-xs">66. ICD VERSION INDICATOR</Label>
              <Select value={formData.icdVersion} onValueChange={(value) => setFormData({ ...formData, icdVersion: value })}>
                <SelectTrigger className="mt-1 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 - ICD-10-CM</SelectItem>
                  <SelectItem value="9">9 - ICD-9-CM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-4">
                <Label className="text-xs font-bold">67. PRINCIPAL DIAGNOSIS CODE</Label>
                <Input value={formData.principalDiagnosis} onChange={(e) => setFormData({ ...formData, principalDiagnosis: e.target.value })} placeholder="M54.5" className="mt-1" />
              </div>
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <Label className="text-xs">67{String.fromCharCode(65 + i)}. Other Dx</Label>
                  <Input placeholder={`Diagnosis ${i + 2}`} className="text-xs mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Procedure Codes - Field 74 */}
          <div className="border p-4 mb-4">
            <Label className="text-xs font-bold mb-2 block">74. PRINCIPAL PROCEDURE CODE & DATE</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Procedure Code" value={formData.principalProcedure} onChange={(e) => setFormData({ ...formData, principalProcedure: e.target.value })} />
              <Input type="date" value={formData.principalProcedureDate} onChange={(e) => setFormData({ ...formData, principalProcedureDate: e.target.value })} />
            </div>
          </div>

          {/* Provider Information - Fields 76-79 */}
          <div className="border-2 border-green-600 p-4 mb-4 bg-green-50">
            <Label className="text-xs font-bold mb-4 block">PROVIDER INFORMATION (NPI Required)</Label>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold">76. ATTENDING PROVIDER NAME & IDENTIFIERS</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input placeholder="Provider Name" value={formData.attendingProvider} onChange={(e) => setFormData({ ...formData, attendingProvider: e.target.value })} />
                  <Input placeholder="NPI (Required)" value={formData.attendingProviderNPI} onChange={(e) => setFormData({ ...formData, attendingProviderNPI: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="text-xs">77. OPERATING PROVIDER</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input placeholder="Provider Name" value={formData.operatingProvider} onChange={(e) => setFormData({ ...formData, operatingProvider: e.target.value })} />
                  <Input placeholder="NPI" value={formData.operatingProviderNPI} onChange={(e) => setFormData({ ...formData, operatingProviderNPI: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          {/* Remarks - Field 80 */}
          <div className="border p-4 mb-4">
            <Label className="text-xs font-bold">80. REMARKS</Label>
            <Textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="mt-2"
              rows={3}
              placeholder="Additional information or remarks..."
            />
          </div>

          <div className="mt-4 text-xs text-gray-600 text-center">
            <p>Form UB-04 (CMS-1450) - Institutional Claim Format</p>
            <p>For hospitals, skilled nursing facilities, and other institutional providers</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UB04Form;