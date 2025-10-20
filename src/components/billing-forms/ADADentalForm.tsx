import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ADA Dental Claim Form - Official Format
// Based on 2006 ADA Dental Claim Form (J401, J402, J403, J404)

const ADADentalForm = () => {
  const { toast } = useToast();
  
  const handleSubmit = () => {
    toast({
      title: "Claim Submitted",
      description: "ADA dental claim has been submitted successfully."
    });
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your claim has been saved as a draft."
    });
  };

  return (
    <div className="max-w-[8.5in] mx-auto bg-background">
      <Card className="border border-foreground shadow-none">
        <CardHeader className="border-b border-foreground py-1 px-2">
          <CardTitle className="text-center text-sm font-bold uppercase">
            ADA Dental Claim Form
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* HEADER INFORMATION */}
          <div className="border-b border-foreground p-2">
            <Label className="font-bold text-[10px] mb-1 block uppercase">HEADER INFORMATION</Label>
            <div className="space-y-1">
              <div>
                <Label className="text-[9px] mb-0.5 block">1. Type of Transaction (Mark all applicable boxes)</Label>
                <div className="flex gap-3">
                  <div className="flex items-center space-x-1">
                    <Checkbox id="statement" className="h-3 w-3" />
                    <label htmlFor="statement" className="text-[9px]">Statement of Actual Services</label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Checkbox id="predetermination" className="h-3 w-3" />
                    <label htmlFor="predetermination" className="text-[9px]">Request for Predetermination/Preauthorization</label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Checkbox id="epsdt" className="h-3 w-3" />
                    <label htmlFor="epsdt" className="text-[9px]">EPSDT/Title XIX</label>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-[9px]">2. Predetermination/Preauthorization Number</Label>
                <Input className="mt-0.5 h-6 text-[9px]" placeholder="Enter number if applicable" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-0">
            {/* LEFT COLUMN */}
            <div className="border-r border-foreground">
              {/* INSURANCE COMPANY */}
              <div className="border-b border-foreground p-2">
                <Label className="font-bold text-[10px] mb-1 block uppercase">INSURANCE COMPANY/DENTAL BENEFIT PLAN INFORMATION</Label>
                <div className="space-y-1">
                  <div>
                    <Label className="text-[9px]">3. Company/Plan Name, Address, City, State, Zip Code</Label>
                    <Input className="mt-0.5 h-6 text-[9px]" placeholder="Company/Plan Name" />
                    <Input className="mt-0.5 h-6 text-[9px]" placeholder="Address" />
                    <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                      <Input placeholder="City" className="h-6 text-[9px]" />
                      <Input placeholder="State" className="h-6 text-[9px]" />
                      <Input placeholder="Zip" className="h-6 text-[9px]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* OTHER COVERAGE */}
              <div className="border-b border-foreground p-2">
                <Label className="font-bold text-[10px] mb-1 block uppercase">OTHER COVERAGE</Label>
                <div className="space-y-1">
                  <div>
                    <Label className="text-[9px]">4. Other Dental or Medical Coverage?</Label>
                    <div className="flex gap-3 mt-0.5">
                      <div className="flex items-center space-x-1">
                        <Checkbox id="no-coverage" className="h-3 w-3" />
                        <label htmlFor="no-coverage" className="text-[9px]">No (Skip 5-11)</label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Checkbox id="yes-coverage" className="h-3 w-3" />
                        <label htmlFor="yes-coverage" className="text-[9px]">Yes (Complete 5-11)</label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[9px]">5. Name of Policyholder/Subscriber in #4 (Last, First, Middle Initial, Suffix)</Label>
                    <Input className="mt-0.5 h-6 text-[9px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <Label className="text-[9px]">6. Date of Birth (MM/DD/CCYY)</Label>
                      <Input type="date" className="mt-0.5 h-6 text-[9px]" />
                    </div>
                    <div>
                      <Label className="text-[9px]">7. Gender</Label>
                      <div className="flex gap-2 mt-0.5">
                        <div className="flex items-center space-x-1">
                          <Checkbox id="other-m" className="h-3 w-3" />
                          <label htmlFor="other-m" className="text-[9px]">M</label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Checkbox id="other-f" className="h-3 w-3" />
                          <label htmlFor="other-f" className="text-[9px]">F</label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Checkbox id="other-u" className="h-3 w-3" />
                          <label htmlFor="other-u" className="text-[9px]">U</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[9px]">8. Policyholder/Subscriber ID (SSN or ID#)</Label>
                    <Input className="mt-0.5 h-6 text-[9px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <Label className="text-[9px]">9. Plan/Group Number</Label>
                      <Input className="mt-0.5 h-6 text-[9px]" />
                    </div>
                    <div>
                      <Label className="text-[9px]">10. Patient's Relationship to Person Named in #5</Label>
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        <div className="flex items-center space-x-0.5">
                          <Checkbox id="rel-self" className="h-3 w-3" />
                          <label htmlFor="rel-self" className="text-[9px]">Self</label>
                        </div>
                        <div className="flex items-center space-x-0.5">
                          <Checkbox id="rel-spouse" className="h-3 w-3" />
                          <label htmlFor="rel-spouse" className="text-[9px]">Spouse</label>
                        </div>
                        <div className="flex items-center space-x-0.5">
                          <Checkbox id="rel-dependent" className="h-3 w-3" />
                          <label htmlFor="rel-dependent" className="text-[9px]">Dependent</label>
                        </div>
                        <div className="flex items-center space-x-0.5">
                          <Checkbox id="rel-other" className="h-3 w-3" />
                          <label htmlFor="rel-other" className="text-[9px]">Other</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[9px]">11. Other Insurance Company/Dental Benefit Plan Name, Address, City, State, Zip Code</Label>
                    <Input className="mt-0.5 h-6 text-[9px]" placeholder="Company Name" />
                    <Input className="mt-0.5 h-6 text-[9px]" placeholder="Address, City, State, Zip" />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div>
              {/* POLICYHOLDER/SUBSCRIBER INFORMATION */}
              <div className="border-b border-foreground p-2">
                <Label className="font-bold text-[10px] mb-1 block uppercase">POLICYHOLDER/SUBSCRIBER INFORMATION (For Insurance Company Named in #3)</Label>
                <div className="space-y-1">
                  <div>
                    <Label className="text-[9px]">12. Policyholder/Subscriber Name (Last, First, Middle Initial, Suffix), Address, City, State, Zip Code</Label>
                    <Input className="mt-0.5 h-6 text-[9px]" placeholder="Name" />
                    <Input className="mt-0.5 h-6 text-[9px]" placeholder="Address" />
                    <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                      <Input placeholder="City" className="h-6 text-[9px]" />
                      <Input placeholder="State" className="h-6 text-[9px]" />
                      <Input placeholder="Zip" className="h-6 text-[9px]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <Label className="text-[9px]">13. Date of Birth (MM/DD/CCYY)</Label>
                      <Input type="date" className="mt-0.5 h-6 text-[9px]" />
                    </div>
                    <div>
                      <Label className="text-[9px]">14. Gender</Label>
                      <div className="flex gap-2 mt-0.5">
                        <div className="flex items-center space-x-1">
                          <Checkbox id="sub-m" className="h-3 w-3" />
                          <label htmlFor="sub-m" className="text-[9px]">M</label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Checkbox id="sub-f" className="h-3 w-3" />
                          <label htmlFor="sub-f" className="text-[9px]">F</label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Checkbox id="sub-u" className="h-3 w-3" />
                          <label htmlFor="sub-u" className="text-[9px]">U</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[9px]">15. Policyholder/Subscriber ID (SSN or ID#)</Label>
                    <Input className="mt-0.5 h-6 text-[9px]" />
                  </div>
                  <div>
                    <Label className="text-[9px]">16. Plan/Group Number</Label>
                    <Input className="mt-0.5 h-6 text-[9px]" />
                  </div>
                  <div>
                    <Label className="text-[9px]">17. Employer Name</Label>
                    <Input className="mt-0.5 h-6 text-[9px]" />
                  </div>
                </div>
              </div>

              {/* PATIENT INFORMATION */}
              <div className="border-b border-foreground p-2">
                <Label className="font-bold text-[10px] mb-1 block uppercase">PATIENT INFORMATION</Label>
                <div className="space-y-1">
                  <div>
                    <Label className="text-[9px]">18. Relationship to Policyholder/Subscriber in #12 Above</Label>
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      <div className="flex items-center space-x-0.5">
                        <Checkbox id="pat-self" className="h-3 w-3" />
                        <label htmlFor="pat-self" className="text-[9px]">Self</label>
                      </div>
                      <div className="flex items-center space-x-0.5">
                        <Checkbox id="pat-spouse" className="h-3 w-3" />
                        <label htmlFor="pat-spouse" className="text-[9px]">Spouse</label>
                      </div>
                      <div className="flex items-center space-x-0.5">
                        <Checkbox id="pat-dependent" className="h-3 w-3" />
                        <label htmlFor="pat-dependent" className="text-[9px]">Dependent Child</label>
                      </div>
                      <div className="flex items-center space-x-0.5">
                        <Checkbox id="pat-other" className="h-3 w-3" />
                        <label htmlFor="pat-other" className="text-[9px]">Other</label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[9px]">19. Reserved For Future</Label>
                    <Input className="mt-0.5 h-6 text-[9px]" disabled />
                  </div>
                  <div>
                    <Label className="text-[9px]">20. Name (Last, First, Middle Initial, Suffix), Address, City, State, Zip Code</Label>
                    <Input className="mt-0.5 h-6 text-[9px]" placeholder="Name" />
                    <Input className="mt-0.5 h-6 text-[9px]" placeholder="Address" />
                    <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                      <Input placeholder="City" className="h-6 text-[9px]" />
                      <Input placeholder="State" className="h-6 text-[9px]" />
                      <Input placeholder="Zip" className="h-6 text-[9px]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <Label className="text-[9px]">21. Date of Birth (MM/DD/CCYY)</Label>
                      <Input type="date" className="mt-0.5 h-6 text-[9px]" />
                    </div>
                    <div>
                      <Label className="text-[9px]">22. Gender</Label>
                      <div className="flex gap-2 mt-0.5">
                        <div className="flex items-center space-x-1">
                          <Checkbox id="pat-m" className="h-3 w-3" />
                          <label htmlFor="pat-m" className="text-[9px]">M</label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Checkbox id="pat-f" className="h-3 w-3" />
                          <label htmlFor="pat-f" className="text-[9px]">F</label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Checkbox id="pat-u" className="h-3 w-3" />
                          <label htmlFor="pat-u" className="text-[9px]">U</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[9px]">23. Patient ID/Account # (Assigned by Dentist)</Label>
                    <Input className="mt-0.5 h-6 text-[9px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECORD OF SERVICES PROVIDED */}
          <div className="border-b border-foreground p-2">
            <Label className="font-bold text-[10px] mb-1 block uppercase">RECORD OF SERVICES PROVIDED</Label>
            <div className="overflow-x-auto">
              <table className="w-full text-[9px] border-collapse border border-foreground">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="border border-foreground p-0.5 text-left" style={{width: "80px"}}>24. Procedure Date (MM/DD/CCYY)</th>
                    <th className="border border-foreground p-0.5 text-center" style={{width: "40px"}}>25. Area of Oral Cavity</th>
                    <th className="border border-foreground p-0.5 text-center" style={{width: "35px"}}>26. Tooth System</th>
                    <th className="border border-foreground p-0.5 text-center" style={{width: "60px"}}>27. Tooth Number(s) or Letter(s)</th>
                    <th className="border border-foreground p-0.5 text-center" style={{width: "50px"}}>28. Tooth Surface</th>
                    <th className="border border-foreground p-0.5 text-center" style={{width: "70px"}}>29. Procedure Code</th>
                    <th className="border border-foreground p-0.5 text-center" style={{width: "35px"}}>29a. Diag. Pointer</th>
                    <th className="border border-foreground p-0.5 text-center" style={{width: "30px"}}>29b. Qty.</th>
                    <th className="border border-foreground p-0.5 text-left">30. Description</th>
                    <th className="border border-foreground p-0.5 text-right" style={{width: "70px"}}>31. Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(10)].map((_, i) => (
                    <tr key={i}>
                      <td className="border border-foreground p-0.5"><Input className="text-[9px] h-5 border-0" type="date" /></td>
                      <td className="border border-foreground p-0.5"><Input className="text-[9px] h-5 border-0 text-center" maxLength={2} /></td>
                      <td className="border border-foreground p-0.5"><Input className="text-[9px] h-5 border-0 text-center" maxLength={2} /></td>
                      <td className="border border-foreground p-0.5"><Input className="text-[9px] h-5 border-0 text-center" /></td>
                      <td className="border border-foreground p-0.5"><Input className="text-[9px] h-5 border-0 text-center" maxLength={5} /></td>
                      <td className="border border-foreground p-0.5"><Input className="text-[9px] h-5 border-0" placeholder="D####" /></td>
                      <td className="border border-foreground p-0.5"><Input className="text-[9px] h-5 border-0 text-center" maxLength={1} placeholder="A" /></td>
                      <td className="border border-foreground p-0.5"><Input className="text-[9px] h-5 border-0 text-center" type="number" placeholder="1" /></td>
                      <td className="border border-foreground p-0.5"><Input className="text-[9px] h-5 border-0" /></td>
                      <td className="border border-foreground p-0.5"><Input className="text-[9px] h-5 border-0 text-right" type="number" step="0.01" placeholder="0.00" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-0">
            {/* MISSING TEETH AND DIAGNOSIS */}
            <div className="border-r border-b border-foreground p-2">
              <div className="space-y-1">
                <Label className="text-[9px] font-semibold">33. Missing Teeth Information (Place an "X" on each missing tooth.)</Label>
                <div className="border border-foreground">
                  <div className="grid grid-cols-16 gap-0 text-center">
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map((num) => (
                      <div key={num} className="border-r border-foreground last:border-r-0 p-1">
                        <div className="text-[8px]">{num}</div>
                        <Checkbox id={`tooth-${num}`} className="h-2.5 w-2.5 mx-auto" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-16 gap-0 text-center border-t border-foreground">
                    {[32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17].map((num) => (
                      <div key={num} className="border-r border-foreground last:border-r-0 p-1">
                        <div className="text-[8px]">{num}</div>
                        <Checkbox id={`tooth-${num}`} className="h-2.5 w-2.5 mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2">
                  <Label className="text-[9px] font-semibold">34. Diagnosis Code List Qualifier (ICD-10 = AB)</Label>
                  <Input className="mt-0.5 text-[9px] h-6" placeholder="AB" maxLength={2} />
                </div>
                <div>
                  <Label className="text-[9px] font-semibold">34a. Diagnosis Code(s)</Label>
                  <div className="grid grid-cols-4 gap-1 mt-0.5">
                    <div>
                      <Label className="text-[8px]">A</Label>
                      <Input className="text-[9px] h-6" placeholder="Code" />
                    </div>
                    <div>
                      <Label className="text-[8px]">B</Label>
                      <Input className="text-[9px] h-6" placeholder="Code" />
                    </div>
                    <div>
                      <Label className="text-[8px]">C</Label>
                      <Input className="text-[9px] h-6" placeholder="Code" />
                    </div>
                    <div>
                      <Label className="text-[8px]">D</Label>
                      <Input className="text-[9px] h-6" placeholder="Code" />
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <Label className="text-[9px]">31a. Other Fee(s)</Label>
                  <Input className="mt-0.5 text-[9px] h-6" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div>
                  <Label className="text-[9px] font-semibold">32. Total Fee</Label>
                  <Input className="mt-0.5 text-[9px] h-6 font-bold" type="number" step="0.01" placeholder="0.00" />
                </div>
              </div>
            </div>

            {/* REMARKS */}
            <div className="border-b border-foreground p-2">
              <Label className="font-bold text-[10px] mb-1 block uppercase">35. Remarks</Label>
              <Textarea className="mt-0.5 text-[9px] min-h-[200px] resize-none" placeholder="Additional information..." />
            </div>
          </div>

          {/* AUTHORIZATIONS */}
          <div className="border-b border-foreground p-2">
            <Label className="font-bold text-[10px] mb-1 block uppercase">AUTHORIZATIONS</Label>
            <div className="space-y-1">
              <div className="text-[8px]">
                <p className="mb-1"><span className="font-semibold">36.</span> I have been informed of the treatment plan and associated fees. I agree to be responsible for all charges for dental services and materials not paid by my dental benefit plan, unless prohibited by law, or the treating dentist or dental practice has a contractual agreement with my plan prohibiting all or a portion of such charges. To the extent permitted by law, I consent to your use and disclosure of my protected health information to carry out payment activities in connection with this claim.</p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <Label className="text-[9px]">Patient/Guardian signature</Label>
                    <Input className="mt-0.5 h-6 text-[9px]" />
                  </div>
                  <div>
                    <Label className="text-[9px]">Date</Label>
                    <Input type="date" className="mt-0.5 h-6 text-[9px]" />
                  </div>
                </div>
              </div>
              <div className="text-[8px]">
                <p className="mb-1"><span className="font-semibold">37.</span> I hereby authorize and direct payment of the dental benefits otherwise payable to me, directly to the below named dentist or dental entity.</p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <Label className="text-[9px]">Subscriber signature</Label>
                    <Input className="mt-0.5 h-6 text-[9px]" />
                  </div>
                  <div>
                    <Label className="text-[9px]">Date</Label>
                    <Input type="date" className="mt-0.5 h-6 text-[9px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-0">
            {/* ANCILLARY CLAIM/TREATMENT INFORMATION */}
            <div className="border-r border-b border-foreground p-2">
              <Label className="font-bold text-[10px] mb-1 block uppercase">ANCILLARY CLAIM/TREATMENT INFORMATION</Label>
              <div className="space-y-1">
                <div>
                  <Label className="text-[9px]">38. Place of Treatment</Label>
                  <div className="flex gap-2 mt-0.5 flex-wrap">
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="provider-office" className="h-3 w-3" />
                      <label htmlFor="provider-office" className="text-[9px]">Provider's Office</label>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="hospital" className="h-3 w-3" />
                      <label htmlFor="hospital" className="text-[9px]">Hospital</label>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="ecf" className="h-3 w-3" />
                      <label htmlFor="ecf" className="text-[9px]">ECF</label>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="other-place" className="h-3 w-3" />
                      <label htmlFor="other-place" className="text-[9px]">Other</label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-[9px]">39. Number of Enclosures (00 to 99)</Label>
                  <div className="flex gap-2 mt-0.5">
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="radiographs" className="h-3 w-3" />
                      <label htmlFor="radiographs" className="text-[9px]">Radiographs</label>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="oral-images" className="h-3 w-3" />
                      <label htmlFor="oral-images" className="text-[9px]">Oral Images</label>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="models" className="h-3 w-3" />
                      <label htmlFor="models" className="text-[9px]">Models</label>
                    </div>
                  </div>
                  <Input className="mt-0.5 text-[9px] h-6" maxLength={2} placeholder="00" />
                </div>
                <div>
                  <Label className="text-[9px]">40. Is Treatment for Orthodontics?</Label>
                  <div className="flex gap-2 mt-0.5">
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="ortho-no" className="h-3 w-3" />
                      <label htmlFor="ortho-no" className="text-[9px]">No (Skip 41-42)</label>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="ortho-yes" className="h-3 w-3" />
                      <label htmlFor="ortho-yes" className="text-[9px]">Yes (Complete 41-42)</label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <Label className="text-[9px]">42. Months of Treatment Remaining</Label>
                    <Input className="mt-0.5 text-[9px] h-6" type="number" />
                  </div>
                  <div>
                    <Label className="text-[9px]">41. Date Appliance Placed (MM/DD/CCYY)</Label>
                    <Input type="date" className="mt-0.5 text-[9px] h-6" />
                  </div>
                </div>
                <div>
                  <Label className="text-[9px]">43. Replacement of Prosthesis?</Label>
                  <div className="flex gap-2 mt-0.5">
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="pros-no" className="h-3 w-3" />
                      <label htmlFor="pros-no" className="text-[9px]">No (Skip 44)</label>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="pros-yes" className="h-3 w-3" />
                      <label htmlFor="pros-yes" className="text-[9px]">Yes (Complete 44)</label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-[9px]">44. Date Prior Placement (MM/DD/CCYY)</Label>
                  <Input type="date" className="mt-0.5 text-[9px] h-6" />
                </div>
                <div>
                  <Label className="text-[9px]">45. Treatment Resulting from</Label>
                  <div className="space-y-0.5 mt-0.5">
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="occupational" className="h-3 w-3" />
                      <label htmlFor="occupational" className="text-[9px]">Occupational illness/injury</label>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="auto-accident" className="h-3 w-3" />
                      <label htmlFor="auto-accident" className="text-[9px]">Auto accident</label>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="other-accident" className="h-3 w-3" />
                      <label htmlFor="other-accident" className="text-[9px]">Other accident</label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-[9px]">46. Date of Accident (MM/DD/CCYY)</Label>
                  <Input type="date" className="mt-0.5 text-[9px] h-6" />
                </div>
                <div>
                  <Label className="text-[9px]">47. Auto Accident State</Label>
                  <Input className="mt-0.5 text-[9px] h-6" maxLength={2} />
                </div>
              </div>
            </div>

            {/* BILLING AND TREATING DENTIST */}
            <div>
              {/* BILLING DENTIST */}
              <div className="border-b border-foreground p-2">
                <Label className="font-bold text-[10px] mb-1 block uppercase">BILLING DENTIST OR DENTAL ENTITY (Leave blank if dentist or dental entity is not submitting claim on behalf of the patient or insured/subscriber)</Label>
                <div className="space-y-1">
                  <div>
                    <Label className="text-[9px]">48. Name, Address, City, State, Zip Code</Label>
                    <Input className="mt-0.5 text-[9px] h-6" placeholder="Name" />
                    <Input className="mt-0.5 text-[9px] h-6" placeholder="Address" />
                    <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                      <Input placeholder="City" className="text-[9px] h-6" />
                      <Input placeholder="State" className="text-[9px] h-6" />
                      <Input placeholder="Zip" className="text-[9px] h-6" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <Label className="text-[9px]">49. NPI</Label>
                      <Input className="mt-0.5 text-[9px] h-6" maxLength={10} />
                    </div>
                    <div>
                      <Label className="text-[9px]">50. License Number</Label>
                      <Input className="mt-0.5 text-[9px] h-6" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <Label className="text-[9px]">51. SSN or TIN</Label>
                      <Input className="mt-0.5 text-[9px] h-6" />
                    </div>
                    <div>
                      <Label className="text-[9px]">52A. Additional Provider ID</Label>
                      <Input className="mt-0.5 text-[9px] h-6" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <Label className="text-[9px]">52. Phone Number</Label>
                      <Input type="tel" className="mt-0.5 text-[9px] h-6" />
                    </div>
                    <div>
                      <Label className="text-[9px]">58. Additional Provider ID</Label>
                      <Input className="mt-0.5 text-[9px] h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* TREATING DENTIST */}
              <div className="border-b border-foreground p-2">
                <Label className="font-bold text-[10px] mb-1 block uppercase">TREATING DENTIST AND TREATMENT LOCATION INFORMATION</Label>
                <div className="space-y-1">
                  <div className="text-[8px]">
                    <p className="mb-1"><span className="font-semibold">53.</span> I hereby certify that the procedures as indicated by date are in progress (for procedures that require multiple visits) or have been completed.</p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <Label className="text-[9px]">Signed (Treating Dentist)</Label>
                        <Input className="mt-0.5 text-[9px] h-6" />
                      </div>
                      <div>
                        <Label className="text-[9px]">Date</Label>
                        <Input type="date" className="mt-0.5 text-[9px] h-6" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <Label className="text-[9px]">54. NPI</Label>
                      <Input className="mt-0.5 text-[9px] h-6" maxLength={10} />
                    </div>
                    <div>
                      <Label className="text-[9px]">55. License Number</Label>
                      <Input className="mt-0.5 text-[9px] h-6" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[9px]">56. Address, City, State, Zip Code</Label>
                    <Input className="mt-0.5 text-[9px] h-6" placeholder="Address" />
                    <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                      <Input placeholder="City" className="text-[9px] h-6" />
                      <Input placeholder="State" className="text-[9px] h-6" />
                      <Input placeholder="Zip" className="text-[9px] h-6" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[9px]">56a. Provider Specialty Code</Label>
                    <Input className="mt-0.5 text-[9px] h-6" placeholder="122300000X" />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <Label className="text-[9px]">57. Phone Number</Label>
                      <Input type="tel" className="mt-0.5 text-[9px] h-6" />
                    </div>
                    <div>
                      <Label className="text-[9px]">58. Additional Provider ID</Label>
                      <Input className="mt-0.5 text-[9px] h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[8px] text-muted-foreground border-t border-foreground p-1">
            <p>© 2019 American Dental Association</p>
            <p>To reorder call 800.947.4746 or go online at ADAcatalog.org</p>
            <p>J430 (Same as ADA Dental Claim Form – J431, J432, J433, J434, J430D)</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4 justify-end px-4">
        <Button variant="outline" onClick={handleSaveDraft}>
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button onClick={handleSubmit}>
          <Send className="h-4 w-4 mr-2" />
          Submit Claim
        </Button>
      </div>
    </div>
  );
};

export default ADADentalForm;
