import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// ADA Dental Claim Form (Version 2024)
// Used for dental services billing

const ADADentalForm = () => {
  const [formData, setFormData] = useState({
    // HEADER INFORMATION
    predetermination: false,
    standard: true,
    // CARRIER INFORMATION
    carrierName: "",
    carrierAddress: "",
    carrierCity: "",
    carrierState: "",
    carrierZip: "",
    // PATIENT INFORMATION
    patientLastName: "",
    patientFirstName: "",
    patientMiddleInitial: "",
    patientAddress: "",
    patientCity: "",
    patientState: "",
    patientZip: "",
    patientDOB: "",
    patientSex: "",
    patientId: "",
    // INSURANCE INFORMATION
    subscriberName: "",
    subscriberDOB: "",
    subscriberSex: "",
    subscriberId: "",
    groupNumber: "",
    relationshipToSubscriber: "",
    // OTHER COVERAGE
    otherCoverage: false,
    otherCarrierName: "",
    otherSubscriberName: "",
    otherSubscriberId: "",
    otherGroupNumber: "",
    // PROVIDER INFORMATION
    dentistLastName: "",
    dentistFirstName: "",
    dentistLicense: "",
    dentistNPI: "",
    dentistTIN: "",
    dentistAddress: "",
    dentistCity: "",
    dentistState: "",
    dentistZip: "",
    dentistPhone: "",
    // BILLING PROVIDER
    billingProviderName: "",
    billingProviderAddress: "",
    billingProviderNPI: "",
    billingProviderTIN: "",
    // PLACE OF TREATMENT
    placeOfTreatment: "",
    // PROCEDURES (10 lines)
    procedures: Array(10).fill(null).map(() => ({
      procedureDate: "",
      toothCode: "",
      toothSurface: "",
      procedureCode: "",
      description: "",
      fee: ""
    })),
    // MISSING TEETH INFORMATION
    missingTeeth: {
      permanent: Array(32).fill(false),
      primary: Array(20).fill(false)
    },
    // ORTHODONTIC TREATMENT
    orthodonticTreatment: false,
    orthodonticMonthsRemaining: "",
    appliancePlaced: false,
    appliancePlacedDate: "",
    // PROSTHESIS
    prosthesis: false,
    prosthesisType: "",
    priorPlacementDate: "",
    // TREATMENT PLAN
    treatmentPlan: false,
    // REMARKS
    remarks: "",
    // AUTHORIZATION
    patientSignature: "",
    patientSignatureDate: "",
    subscriberSignature: "",
    subscriberSignatureDate: "",
    // TOTALS
    totalFee: ""
  });

  const permanentTeeth = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16",
    "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32"
  ];

  const primaryTeeth = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
    "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card className="border-2 border-gray-800">
        <CardHeader className="bg-purple-50">
          <CardTitle className="text-center text-xl font-bold">
            AMERICAN DENTAL ASSOCIATION<br />
            DENTAL CLAIM FORM<br />
            <span className="text-sm font-normal">(Version 2024)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Type of Transaction */}
          <div className="border-2 border-black p-4 mb-4 bg-yellow-50">
            <Label className="text-xs font-bold mb-2 block">TYPE OF TRANSACTION</Label>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="statement" 
                  checked={formData.standard}
                  onCheckedChange={(checked) => setFormData({ ...formData, standard: checked as boolean, predetermination: false })}
                />
                <label htmlFor="statement" className="text-sm font-medium">Statement of Actual Services</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="predetermination"
                  checked={formData.predetermination}
                  onCheckedChange={(checked) => setFormData({ ...formData, predetermination: checked as boolean, standard: false })}
                />
                <label htmlFor="predetermination" className="text-sm font-medium">Request for Predetermination/Preauthorization</label>
              </div>
            </div>
          </div>

          {/* SECTION 1 - Insurance Company/Dental Benefit Plan Information */}
          <div className="border-2 border-blue-600 p-4 mb-4 bg-blue-50">
            <Label className="text-xs font-bold mb-3 block">SECTION 1 - INSURANCE COMPANY / DENTAL BENEFIT PLAN</Label>
            <div className="space-y-3">
              <Input 
                placeholder="1. Company/Plan Name" 
                value={formData.carrierName}
                onChange={(e) => setFormData({ ...formData, carrierName: e.target.value })}
              />
              <Input 
                placeholder="Address" 
                value={formData.carrierAddress}
                onChange={(e) => setFormData({ ...formData, carrierAddress: e.target.value })}
              />
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="City" value={formData.carrierCity} onChange={(e) => setFormData({ ...formData, carrierCity: e.target.value })} />
                <Input placeholder="State" value={formData.carrierState} onChange={(e) => setFormData({ ...formData, carrierState: e.target.value })} />
                <Input placeholder="ZIP Code" value={formData.carrierZip} onChange={(e) => setFormData({ ...formData, carrierZip: e.target.value })} />
              </div>
            </div>
          </div>

          {/* SECTION 2 - Subscriber (Policyholder) Information */}
          <div className="border p-4 mb-4">
            <Label className="text-xs font-bold mb-3 block">SECTION 2 - SUBSCRIBER (POLICYHOLDER) INFORMATION</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">11. Subscriber Name (Last, First, MI)</Label>
                <Input 
                  placeholder="Subscriber Name" 
                  value={formData.subscriberName}
                  onChange={(e) => setFormData({ ...formData, subscriberName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">12. Subscriber ID / SSN</Label>
                <Input 
                  placeholder="Subscriber ID" 
                  value={formData.subscriberId}
                  onChange={(e) => setFormData({ ...formData, subscriberId: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">13. Subscriber Birth Date</Label>
                <Input 
                  type="date"
                  value={formData.subscriberDOB}
                  onChange={(e) => setFormData({ ...formData, subscriberDOB: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">14. Sex</Label>
                <Select value={formData.subscriberSex} onValueChange={(value) => setFormData({ ...formData, subscriberSex: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">M - Male</SelectItem>
                    <SelectItem value="F">F - Female</SelectItem>
                    <SelectItem value="X">X - Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">15. Group Number</Label>
                <Input 
                  placeholder="Group Number" 
                  value={formData.groupNumber}
                  onChange={(e) => setFormData({ ...formData, groupNumber: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3 - Patient Information */}
          <div className="border-2 border-green-600 p-4 mb-4 bg-green-50">
            <Label className="text-xs font-bold mb-3 block">SECTION 3 - PATIENT INFORMATION</Label>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="7. Last Name" value={formData.patientLastName} onChange={(e) => setFormData({ ...formData, patientLastName: e.target.value })} />
                <Input placeholder="First Name" value={formData.patientFirstName} onChange={(e) => setFormData({ ...formData, patientFirstName: e.target.value })} />
                <Input placeholder="MI" value={formData.patientMiddleInitial} onChange={(e) => setFormData({ ...formData, patientMiddleInitial: e.target.value })} maxLength={1} />
              </div>
              <Input placeholder="8. Patient Address" value={formData.patientAddress} onChange={(e) => setFormData({ ...formData, patientAddress: e.target.value })} />
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="City" value={formData.patientCity} onChange={(e) => setFormData({ ...formData, patientCity: e.target.value })} />
                <Input placeholder="State" value={formData.patientState} onChange={(e) => setFormData({ ...formData, patientState: e.target.value })} />
                <Input placeholder="ZIP" value={formData.patientZip} onChange={(e) => setFormData({ ...formData, patientZip: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">9. Patient Birth Date</Label>
                  <Input type="date" value={formData.patientDOB} onChange={(e) => setFormData({ ...formData, patientDOB: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">10. Sex</Label>
                  <Select value={formData.patientSex} onValueChange={(value) => setFormData({ ...formData, patientSex: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">M - Male</SelectItem>
                      <SelectItem value="F">F - Female</SelectItem>
                      <SelectItem value="X">X - Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">16. Patient ID</Label>
                  <Input placeholder="Patient ID" value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">17. Relationship to Subscriber</Label>
                <Select value={formData.relationshipToSubscriber} onValueChange={(value) => setFormData({ ...formData, relationshipToSubscriber: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Self</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="dependent">Dependent Child</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Missing Teeth Information */}
          <div className="border p-4 mb-4">
            <Label className="text-xs font-bold mb-3 block">MISSING TEETH INFORMATION</Label>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold mb-2 block">Permanent Teeth (1-32)</Label>
                <div className="grid grid-cols-16 gap-1">
                  {permanentTeeth.map((tooth) => (
                    <div key={tooth} className="text-center">
                      <Checkbox id={`perm-${tooth}`} className="mx-auto" />
                      <label htmlFor={`perm-${tooth}`} className="text-[10px] block mt-1">{tooth}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold mb-2 block">Primary Teeth (A-T)</Label>
                <div className="grid grid-cols-10 gap-1">
                  {primaryTeeth.map((tooth) => (
                    <div key={tooth} className="text-center">
                      <Checkbox id={`prim-${tooth}`} className="mx-auto" />
                      <label htmlFor={`prim-${tooth}`} className="text-[10px] block mt-1">{tooth}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Procedure Information */}
          <div className="border-2 border-black p-4 mb-4 bg-purple-50">
            <Label className="text-xs font-bold mb-4 block">DENTAL PROCEDURES (CDT Codes)</Label>
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} className="border p-3 bg-white rounded">
                  <Label className="text-xs font-semibold mb-2 block">Procedure {index + 1}</Label>
                  <div className="grid grid-cols-6 gap-2">
                    <div>
                      <Label className="text-[10px]">Date</Label>
                      <Input type="date" className="text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Tooth #/Letter</Label>
                      <Input placeholder="14" className="text-xs" maxLength={2} />
                    </div>
                    <div>
                      <Label className="text-[10px]">Surface</Label>
                      <Input placeholder="MOD" className="text-xs" maxLength={5} />
                    </div>
                    <div>
                      <Label className="text-[10px]">Procedure Code</Label>
                      <Input placeholder="D2391" className="text-xs" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[10px]">Description</Label>
                      <Input placeholder="Resin-based composite - 1 surface" className="text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Fee</Label>
                      <Input type="number" placeholder="185.00" className="text-xs" step="0.01" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prosthesis Information */}
          <div className="border p-4 mb-4">
            <Label className="text-xs font-bold mb-3 block">PROSTHESIS / ORTHODONTIC INFORMATION</Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="prosthesis"
                    checked={formData.prosthesis}
                    onCheckedChange={(checked) => setFormData({ ...formData, prosthesis: checked as boolean })}
                  />
                  <label htmlFor="prosthesis" className="text-sm">Initial Placement of Prosthesis</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="replacement" />
                  <label htmlFor="replacement" className="text-sm">Replacement of Prosthesis</label>
                </div>
              </div>
              {formData.prosthesis && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Prior Placement Date (if replacement)</Label>
                    <Input type="date" value={formData.priorPlacementDate} onChange={(e) => setFormData({ ...formData, priorPlacementDate: e.target.value })} className="mt-1" />
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    id="ortho"
                    checked={formData.orthodonticTreatment}
                    onCheckedChange={(checked) => setFormData({ ...formData, orthodonticTreatment: checked as boolean })}
                  />
                  <label htmlFor="ortho" className="text-sm font-medium">Orthodontic Treatment</label>
                </div>
                {formData.orthodonticTreatment && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div>
                      <Label className="text-xs">Months of Treatment Remaining</Label>
                      <Input 
                        type="number" 
                        value={formData.orthodonticMonthsRemaining}
                        onChange={(e) => setFormData({ ...formData, orthodonticMonthsRemaining: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Appliance Placement Date</Label>
                      <Input 
                        type="date"
                        value={formData.appliancePlacedDate}
                        onChange={(e) => setFormData({ ...formData, appliancePlacedDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="border p-4 mb-4">
            <Label className="text-xs font-bold">REMARKS</Label>
            <Textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="mt-2"
              rows={3}
              placeholder="Additional information or special considerations..."
            />
          </div>

          {/* Provider Information */}
          <div className="border-2 border-orange-600 p-4 mb-4 bg-orange-50">
            <Label className="text-xs font-bold mb-4 block">TREATING DENTIST AND BILLING PROVIDER</Label>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold">Treating Dentist Name</Label>
                  <Input 
                    placeholder="Last Name, First Name" 
                    value={formData.dentistLastName}
                    onChange={(e) => setFormData({ ...formData, dentistLastName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Dentist NPI (Required)</Label>
                  <Input 
                    placeholder="10-digit NPI" 
                    value={formData.dentistNPI}
                    onChange={(e) => setFormData({ ...formData, dentistNPI: e.target.value })}
                    className="mt-1"
                    maxLength={10}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Dentist License Number</Label>
                  <Input 
                    value={formData.dentistLicense}
                    onChange={(e) => setFormData({ ...formData, dentistLicense: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Dentist Tax ID / TIN</Label>
                  <Input 
                    value={formData.dentistTIN}
                    onChange={(e) => setFormData({ ...formData, dentistTIN: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Dentist Address</Label>
                <Input 
                  placeholder="Street Address"
                  value={formData.dentistAddress}
                  onChange={(e) => setFormData({ ...formData, dentistAddress: e.target.value })}
                  className="mt-1"
                />
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <Input placeholder="City" value={formData.dentistCity} onChange={(e) => setFormData({ ...formData, dentistCity: e.target.value })} />
                  <Input placeholder="State" value={formData.dentistState} onChange={(e) => setFormData({ ...formData, dentistState: e.target.value })} />
                  <Input placeholder="ZIP" value={formData.dentistZip} onChange={(e) => setFormData({ ...formData, dentistZip: e.target.value })} />
                  <Input placeholder="Phone" value={formData.dentistPhone} onChange={(e) => setFormData({ ...formData, dentistPhone: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          {/* Ancillary Information */}
          <div className="border p-4 mb-4">
            <Label className="text-xs font-bold mb-2 block">PLACE OF TREATMENT</Label>
            <Select value={formData.placeOfTreatment} onValueChange={(value) => setFormData({ ...formData, placeOfTreatment: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select place of treatment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="11">11 - Office</SelectItem>
                <SelectItem value="12">12 - Home</SelectItem>
                <SelectItem value="21">21 - Inpatient Hospital</SelectItem>
                <SelectItem value="22">22 - Outpatient Hospital</SelectItem>
                <SelectItem value="23">23 - Emergency Room - Hospital</SelectItem>
                <SelectItem value="24">24 - Ambulatory Surgical Center</SelectItem>
                <SelectItem value="32">32 - Nursing Facility</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total Fee */}
          <div className="border-2 border-black p-4 bg-yellow-50">
            <Label className="text-xs font-bold">TOTAL FEE</Label>
            <Input
              type="number"
              value={formData.totalFee}
              onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
              className="mt-2 text-lg font-bold"
              placeholder="$0.00"
              step="0.01"
            />
          </div>

          <div className="mt-4 text-xs text-gray-600 text-center">
            <p>ADA Dental Claim Form - Version 2024</p>
            <p>© American Dental Association - For dental services billing</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ADADentalForm;
