import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// CMS-1500 (HCFA) Professional Claim Form
// Reference: https://nucc.org official form structure

const CMS1500Form = () => {
  const [formData, setFormData] = useState({
    // Box 1 - Insurance Type
    insuranceType: "",
    // Box 1a - Insured's ID Number
    insuredId: "",
    // Box 2 - Patient's Name
    patientLastName: "",
    patientFirstName: "",
    patientMiddleInitial: "",
    // Box 3 - Patient's Birth Date and Sex
    patientDOB: "",
    patientSex: "",
    // Box 4 - Insured's Name
    insuredLastName: "",
    insuredFirstName: "",
    insuredMiddleInitial: "",
    // Box 5 - Patient's Address
    patientAddress: "",
    patientCity: "",
    patientState: "",
    patientZip: "",
    patientPhone: "",
    // Box 6 - Patient Relationship to Insured
    patientRelationship: "",
    // Box 7 - Insured's Address
    insuredAddress: "",
    insuredCity: "",
    insuredState: "",
    insuredZip: "",
    insuredPhone: "",
    // Box 9 - Other Insured's Name
    otherInsuredName: "",
    // Box 9a - Other Insured's Policy
    otherInsuredPolicy: "",
    // Box 9d - Insurance Plan Name
    otherInsurancePlan: "",
    // Box 10 - Is Patient's Condition Related To
    employmentRelated: false,
    autoAccident: false,
    otherAccident: false,
    // Box 11 - Insured's Policy Group Number
    policyGroupNumber: "",
    // Box 11a - Insured's Date of Birth and Sex
    insuredDOB: "",
    insuredSex: "",
    // Box 11c - Insurance Plan Name
    insurancePlanName: "",
    // Box 11d - Is there another health benefit plan
    anotherPlan: false,
    // Box 12 - Patient's or Authorized Person's Signature
    patientSignature: "",
    patientSignatureDate: "",
    // Box 13 - Insured's or Authorized Person's Signature
    insuredSignature: "",
    // Box 14 - Date of Current Illness/Injury/Pregnancy
    currentIllnessDate: "",
    // Box 15 - Other Date
    otherDate: "",
    // Box 16 - Dates Unable to Work
    unableToWorkFrom: "",
    unableToWorkTo: "",
    // Box 17 - Name of Referring Provider
    referringProvider: "",
    // Box 17a - Referring Provider NPI
    referringProviderNPI: "",
    // Box 18 - Hospitalization Dates
    hospitalizationFrom: "",
    hospitalizationTo: "",
    // Box 19 - Additional Claim Information
    additionalInfo: "",
    // Box 20 - Outside Lab
    outsideLab: false,
    outsideLabCharges: "",
    // Box 21 - Diagnosis Codes (ICD-10)
    diagnosis1: "",
    diagnosis2: "",
    diagnosis3: "",
    diagnosis4: "",
    // Box 22 - Resubmission Code
    resubmissionCode: "",
    originalRef: "",
    // Box 23 - Prior Authorization Number
    priorAuthNumber: "",
    // Box 24 - Service Lines (6 lines standard)
    serviceLines: Array(6).fill(null).map(() => ({
      dateFrom: "",
      dateTo: "",
      placeOfService: "",
      emg: false,
      cptCode: "",
      modifier1: "",
      modifier2: "",
      modifier3: "",
      modifier4: "",
      diagnosisPointer: "",
      charges: "",
      daysUnits: "",
      epsdt: "",
      renderingProviderNPI: ""
    })),
    // Box 25 - Federal Tax ID
    federalTaxId: "",
    taxIdType: "EIN",
    // Box 26 - Patient Account Number
    patientAccountNumber: "",
    // Box 27 - Accept Assignment
    acceptAssignment: false,
    // Box 28 - Total Charge
    totalCharge: "",
    // Box 29 - Amount Paid
    amountPaid: "",
    // Box 30 - Balance Due
    balanceDue: "",
    // Box 31 - Signature of Provider
    providerSignature: "",
    providerSignatureDate: "",
    // Box 32 - Service Facility Location
    facilityName: "",
    facilityAddress: "",
    facilityCity: "",
    facilityState: "",
    facilityZip: "",
    facilityNPI: "",
    // Box 33 - Billing Provider Info
    billingProviderName: "",
    billingProviderAddress: "",
    billingProviderCity: "",
    billingProviderState: "",
    billingProviderZip: "",
    billingProviderPhone: "",
    billingProviderNPI: ""
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Card className="border-2 border-gray-800">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-center text-xl font-bold">
            HEALTH INSURANCE CLAIM FORM<br />
            <span className="text-sm font-normal">(CMS-1500 / HCFA-1500)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* CARRIER SECTION - Top Right */}
          <div className="mb-4 p-4 border-2 border-black">
            <Label className="text-xs font-bold">CARRIER BLOCK (Payer Information)</Label>
            <Input placeholder="Payer Name" className="mt-2" />
            <Input placeholder="Payer Address" className="mt-2" />
            <Input placeholder="City, State ZIP" className="mt-2" />
          </div>

          {/* Box 1 & 1a */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border p-4">
              <Label className="text-xs font-bold">1. INSURANCE TYPE (Check One)</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="medicare" />
                  <label htmlFor="medicare" className="text-sm">MEDICARE</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="medicaid" />
                  <label htmlFor="medicaid" className="text-sm">MEDICAID</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="tricare" />
                  <label htmlFor="tricare" className="text-sm">TRICARE</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="champva" />
                  <label htmlFor="champva" className="text-sm">CHAMPVA</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="group" />
                  <label htmlFor="group" className="text-sm">GROUP HEALTH PLAN</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="feca" />
                  <label htmlFor="feca" className="text-sm">FECA BLK LUNG</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="other" />
                  <label htmlFor="other" className="text-sm">OTHER</label>
                </div>
              </div>
            </div>
            <div className="border p-4">
              <Label className="text-xs font-bold">1a. INSURED'S I.D. NUMBER</Label>
              <Input
                value={formData.insuredId}
                onChange={(e) => setFormData({ ...formData, insuredId: e.target.value })}
                className="mt-2"
                placeholder="Enter ID number"
              />
            </div>
          </div>

          {/* Boxes 2-7 - Patient and Insured Information */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Box 2 */}
            <div className="border p-4">
              <Label className="text-xs font-bold">2. PATIENT'S NAME (Last, First, Middle Initial)</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Input placeholder="Last" value={formData.patientLastName} onChange={(e) => setFormData({ ...formData, patientLastName: e.target.value })} />
                <Input placeholder="First" value={formData.patientFirstName} onChange={(e) => setFormData({ ...formData, patientFirstName: e.target.value })} />
                <Input placeholder="MI" value={formData.patientMiddleInitial} onChange={(e) => setFormData({ ...formData, patientMiddleInitial: e.target.value })} />
              </div>
            </div>

            {/* Box 3 */}
            <div className="border p-4">
              <Label className="text-xs font-bold">3. PATIENT'S BIRTH DATE & SEX</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input type="date" value={formData.patientDOB} onChange={(e) => setFormData({ ...formData, patientDOB: e.target.value })} />
                <Select value={formData.patientSex} onValueChange={(value) => setFormData({ ...formData, patientSex: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">M - Male</SelectItem>
                    <SelectItem value="F">F - Female</SelectItem>
                    <SelectItem value="X">X - Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Box 4 */}
          <div className="border p-4 mb-4">
            <Label className="text-xs font-bold">4. INSURED'S NAME (Last, First, Middle Initial)</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Input placeholder="Last" value={formData.insuredLastName} onChange={(e) => setFormData({ ...formData, insuredLastName: e.target.value })} />
              <Input placeholder="First" value={formData.insuredFirstName} onChange={(e) => setFormData({ ...formData, insuredFirstName: e.target.value })} />
              <Input placeholder="MI" value={formData.insuredMiddleInitial} onChange={(e) => setFormData({ ...formData, insuredMiddleInitial: e.target.value })} />
            </div>
          </div>

          {/* Box 5 */}
          <div className="border p-4 mb-4">
            <Label className="text-xs font-bold">5. PATIENT'S ADDRESS (Street, City, State, ZIP, Phone)</Label>
            <Input placeholder="Street Address" value={formData.patientAddress} onChange={(e) => setFormData({ ...formData, patientAddress: e.target.value })} className="mt-2" />
            <div className="grid grid-cols-4 gap-2 mt-2">
              <Input placeholder="City" value={formData.patientCity} onChange={(e) => setFormData({ ...formData, patientCity: e.target.value })} />
              <Input placeholder="State" value={formData.patientState} onChange={(e) => setFormData({ ...formData, patientState: e.target.value })} />
              <Input placeholder="ZIP" value={formData.patientZip} onChange={(e) => setFormData({ ...formData, patientZip: e.target.value })} />
              <Input placeholder="Phone" value={formData.patientPhone} onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })} />
            </div>
          </div>

          {/* Box 6 */}
          <div className="border p-4 mb-4">
            <Label className="text-xs font-bold">6. PATIENT RELATIONSHIP TO INSURED</Label>
            <Select value={formData.patientRelationship} onValueChange={(value) => setFormData({ ...formData, patientRelationship: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self">Self</SelectItem>
                <SelectItem value="spouse">Spouse</SelectItem>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-6" />

          {/* Box 21 - Diagnosis Codes */}
          <div className="border p-4 mb-4 bg-yellow-50">
            <Label className="text-xs font-bold">21. DIAGNOSIS OR NATURE OF ILLNESS OR INJURY (ICD-10-CM)</Label>
            <div className="grid grid-cols-4 gap-4 mt-2">
              <div>
                <Label className="text-xs">A.</Label>
                <Input placeholder="ICD-10 Code" value={formData.diagnosis1} onChange={(e) => setFormData({ ...formData, diagnosis1: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">B.</Label>
                <Input placeholder="ICD-10 Code" value={formData.diagnosis2} onChange={(e) => setFormData({ ...formData, diagnosis2: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">C.</Label>
                <Input placeholder="ICD-10 Code" value={formData.diagnosis3} onChange={(e) => setFormData({ ...formData, diagnosis3: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">D.</Label>
                <Input placeholder="ICD-10 Code" value={formData.diagnosis4} onChange={(e) => setFormData({ ...formData, diagnosis4: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Box 23 - Prior Authorization */}
          <div className="border p-4 mb-4">
            <Label className="text-xs font-bold">23. PRIOR AUTHORIZATION NUMBER</Label>
            <Input
              value={formData.priorAuthNumber}
              onChange={(e) => setFormData({ ...formData, priorAuthNumber: e.target.value })}
              className="mt-2"
              placeholder="Enter authorization number"
            />
          </div>

          {/* Box 24 - Service Lines */}
          <div className="border-2 border-black p-4 mb-4 bg-blue-50">
            <Label className="text-xs font-bold mb-4 block">24. SERVICE DETAILS (Up to 6 Services)</Label>
            <div className="space-y-4">
              {formData.serviceLines.map((line, index) => (
                <div key={index} className="border p-3 bg-white rounded">
                  <Label className="text-xs font-semibold mb-2 block">Service Line {index + 1}</Label>
                  <div className="grid grid-cols-8 gap-2">
                    <div>
                      <Label className="text-[10px]">Date From</Label>
                      <Input type="date" className="text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Date To</Label>
                      <Input type="date" className="text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px]">POS</Label>
                      <Input placeholder="11" className="text-xs" maxLength={2} />
                    </div>
                    <div>
                      <Label className="text-[10px]">CPT/HCPCS</Label>
                      <Input placeholder="99213" className="text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Modifier</Label>
                      <Input placeholder="25" className="text-xs" maxLength={2} />
                    </div>
                    <div>
                      <Label className="text-[10px]">Diag Ptr</Label>
                      <Input placeholder="A,B" className="text-xs" maxLength={4} />
                    </div>
                    <div>
                      <Label className="text-[10px]">Charges</Label>
                      <Input type="number" placeholder="150.00" className="text-xs" step="0.01" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Units</Label>
                      <Input type="number" placeholder="1" className="text-xs" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boxes 25-28 - Federal Tax ID and Charges */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="border p-4">
              <Label className="text-xs font-bold">25. FEDERAL TAX I.D. NUMBER</Label>
              <Input
                value={formData.federalTaxId}
                onChange={(e) => setFormData({ ...formData, federalTaxId: e.target.value })}
                className="mt-2"
                placeholder="XX-XXXXXXX"
              />
              <div className="flex gap-2 mt-2">
                <div className="flex items-center space-x-1">
                  <Checkbox id="ssn" />
                  <label htmlFor="ssn" className="text-xs">SSN</label>
                </div>
                <div className="flex items-center space-x-1">
                  <Checkbox id="ein" />
                  <label htmlFor="ein" className="text-xs">EIN</label>
                </div>
              </div>
            </div>
            <div className="border p-4">
              <Label className="text-xs font-bold">26. PATIENT'S ACCOUNT NO.</Label>
              <Input
                value={formData.patientAccountNumber}
                onChange={(e) => setFormData({ ...formData, patientAccountNumber: e.target.value })}
                className="mt-2"
              />
            </div>
            <div className="border p-4">
              <Label className="text-xs font-bold">27. ACCEPT ASSIGNMENT?</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="acceptYes" />
                  <label htmlFor="acceptYes" className="text-sm">YES</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="acceptNo" />
                  <label htmlFor="acceptNo" className="text-sm">NO</label>
                </div>
              </div>
            </div>
            <div className="border p-4">
              <Label className="text-xs font-bold">28. TOTAL CHARGE</Label>
              <Input
                type="number"
                value={formData.totalCharge}
                onChange={(e) => setFormData({ ...formData, totalCharge: e.target.value })}
                className="mt-2"
                placeholder="$0.00"
                step="0.01"
              />
            </div>
          </div>

          {/* Box 32 - Service Facility */}
          <div className="border p-4 mb-4">
            <Label className="text-xs font-bold">32. SERVICE FACILITY LOCATION INFORMATION</Label>
            <Input placeholder="Facility Name" className="mt-2" value={formData.facilityName} onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })} />
            <Input placeholder="Address" className="mt-2" value={formData.facilityAddress} onChange={(e) => setFormData({ ...formData, facilityAddress: e.target.value })} />
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Input placeholder="City" value={formData.facilityCity} onChange={(e) => setFormData({ ...formData, facilityCity: e.target.value })} />
              <Input placeholder="State" value={formData.facilityState} onChange={(e) => setFormData({ ...formData, facilityState: e.target.value })} />
              <Input placeholder="ZIP" value={formData.facilityZip} onChange={(e) => setFormData({ ...formData, facilityZip: e.target.value })} />
            </div>
            <Input placeholder="Facility NPI" className="mt-2" value={formData.facilityNPI} onChange={(e) => setFormData({ ...formData, facilityNPI: e.target.value })} />
          </div>

          {/* Box 33 - Billing Provider */}
          <div className="border-2 border-black p-4 bg-green-50">
            <Label className="text-xs font-bold">33. BILLING PROVIDER INFO & PH # (Required)</Label>
            <Input placeholder="Provider/Facility Name" className="mt-2" value={formData.billingProviderName} onChange={(e) => setFormData({ ...formData, billingProviderName: e.target.value })} />
            <Input placeholder="Address" className="mt-2" value={formData.billingProviderAddress} onChange={(e) => setFormData({ ...formData, billingProviderAddress: e.target.value })} />
            <div className="grid grid-cols-4 gap-2 mt-2">
              <Input placeholder="City" value={formData.billingProviderCity} onChange={(e) => setFormData({ ...formData, billingProviderCity: e.target.value })} />
              <Input placeholder="State" value={formData.billingProviderState} onChange={(e) => setFormData({ ...formData, billingProviderState: e.target.value })} />
              <Input placeholder="ZIP" value={formData.billingProviderZip} onChange={(e) => setFormData({ ...formData, billingProviderZip: e.target.value })} />
              <Input placeholder="Phone" value={formData.billingProviderPhone} onChange={(e) => setFormData({ ...formData, billingProviderPhone: e.target.value })} />
            </div>
            <Input placeholder="Billing Provider NPI (Required)" className="mt-2" value={formData.billingProviderNPI} onChange={(e) => setFormData({ ...formData, billingProviderNPI: e.target.value })} />
          </div>

          <div className="mt-4 text-xs text-gray-600 text-center">
            <p>Form CMS-1500 (02/12) - Professional Claim Format</p>
            <p>For use with OCR and electronic submission</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CMS1500Form;