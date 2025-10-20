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
    <div className="space-y-4 max-w-7xl mx-auto">
      <Card className="border-2">
        <CardHeader className="bg-muted/50 py-3">
          <CardTitle className="text-center text-lg font-bold uppercase">
            ADA Dental Claim Form
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* HEADER INFORMATION */}
          <div className="border-2 border-foreground p-3 mb-3">
            <Label className="font-bold text-xs mb-2 block">HEADER INFORMATION</Label>
            <div className="space-y-2">
              <div>
                <Label className="text-xs mb-1 block">1. Type of Transaction (Mark all applicable boxes)</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="statement" />
                    <label htmlFor="statement" className="text-xs">Statement of Actual Services</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="predetermination" />
                    <label htmlFor="predetermination" className="text-xs">Request for Predetermination/Preauthorization</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="epsdt" />
                    <label htmlFor="epsdt" className="text-xs">EPSDT/Title XIX</label>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs">2. Predetermination/Preauthorization Number</Label>
                <Input className="mt-1" placeholder="Enter number if applicable" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* LEFT COLUMN */}
            <div className="space-y-3">
              {/* INSURANCE COMPANY */}
              <div className="border border-foreground p-3">
                <Label className="font-bold text-xs mb-2 block">INSURANCE COMPANY/DENTAL BENEFIT PLAN INFORMATION</Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">3. Company/Plan Name, Address, City, State, Zip Code</Label>
                    <Input className="mt-1" placeholder="Company/Plan Name" />
                    <Input className="mt-1" placeholder="Address" />
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      <Input placeholder="City" />
                      <Input placeholder="State" />
                      <Input placeholder="Zip" />
                    </div>
                  </div>
                </div>
              </div>

              {/* OTHER COVERAGE */}
              <div className="border border-foreground p-3">
                <Label className="font-bold text-xs mb-2 block">OTHER COVERAGE</Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">4. Other Dental or Medical Coverage?</Label>
                    <div className="flex gap-4 mt-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="no-coverage" />
                        <label htmlFor="no-coverage" className="text-xs">No (Skip 5-11)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="yes-coverage" />
                        <label htmlFor="yes-coverage" className="text-xs">Yes (Complete 5-11)</label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">5. Name of Policyholder/Subscriber in #4 (Last, First, Middle Initial, Suffix)</Label>
                    <Input className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">6. Date of Birth (MM/DD/CCYY)</Label>
                      <Input type="date" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">7. Gender</Label>
                      <div className="flex gap-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <Checkbox id="other-m" />
                          <label htmlFor="other-m" className="text-xs">M</label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Checkbox id="other-f" />
                          <label htmlFor="other-f" className="text-xs">F</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">8. Policyholder/Subscriber ID (SSN or ID#)</Label>
                    <Input className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">9. Plan/Group Number</Label>
                      <Input className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">10. Patient's Relationship to Person Named in #5</Label>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <div className="flex items-center space-x-1">
                          <Checkbox id="rel-self" />
                          <label htmlFor="rel-self" className="text-xs">Self</label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Checkbox id="rel-spouse" />
                          <label htmlFor="rel-spouse" className="text-xs">Spouse</label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Checkbox id="rel-dependent" />
                          <label htmlFor="rel-dependent" className="text-xs">Dependent</label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Checkbox id="rel-other" />
                          <label htmlFor="rel-other" className="text-xs">Other</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">11. Other Insurance Company/Dental Benefit Plan Name, Address, City, State, Zip Code</Label>
                    <Input className="mt-1" placeholder="Company Name" />
                    <Input className="mt-1" placeholder="Address, City, State, Zip" />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-3">
              {/* POLICYHOLDER/SUBSCRIBER INFORMATION */}
              <div className="border border-foreground p-3">
                <Label className="font-bold text-xs mb-2 block">POLICYHOLDER/SUBSCRIBER INFORMATION (For Insurance Company Named in #3)</Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">12. Policyholder/Subscriber Name (Last, First, Middle Initial, Suffix), Address, City, State, Zip Code</Label>
                    <Input className="mt-1" placeholder="Name" />
                    <Input className="mt-1" placeholder="Address" />
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      <Input placeholder="City" />
                      <Input placeholder="State" />
                      <Input placeholder="Zip" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">13. Date of Birth (MM/DD/CCYY)</Label>
                      <Input type="date" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">14. Gender</Label>
                      <div className="flex gap-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <Checkbox id="sub-m" />
                          <label htmlFor="sub-m" className="text-xs">M</label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Checkbox id="sub-f" />
                          <label htmlFor="sub-f" className="text-xs">F</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">15. Policyholder/Subscriber ID (SSN or ID#)</Label>
                    <Input className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">16. Plan/Group Number</Label>
                    <Input className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">17. Employer Name</Label>
                    <Input className="mt-1" />
                  </div>
                </div>
              </div>

              {/* PATIENT INFORMATION */}
              <div className="border border-foreground p-3">
                <Label className="font-bold text-xs mb-2 block">PATIENT INFORMATION</Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">18. Relationship to Policyholder/Subscriber in #12 Above</Label>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <div className="flex items-center space-x-1">
                        <Checkbox id="pat-self" />
                        <label htmlFor="pat-self" className="text-xs">Self</label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Checkbox id="pat-spouse" />
                        <label htmlFor="pat-spouse" className="text-xs">Spouse</label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Checkbox id="pat-dependent" />
                        <label htmlFor="pat-dependent" className="text-xs">Dependent Child</label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Checkbox id="pat-other" />
                        <label htmlFor="pat-other" className="text-xs">Other</label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">19. Student Status</Label>
                    <div className="flex gap-3 mt-1">
                      <div className="flex items-center space-x-1">
                        <Checkbox id="fts" />
                        <label htmlFor="fts" className="text-xs">FTS</label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Checkbox id="pts" />
                        <label htmlFor="pts" className="text-xs">PTS</label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">20. Name (Last, First, Middle Initial, Suffix), Address, City, State, Zip Code</Label>
                    <Input className="mt-1" placeholder="Name" />
                    <Input className="mt-1" placeholder="Address" />
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      <Input placeholder="City" />
                      <Input placeholder="State" />
                      <Input placeholder="Zip" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">21. Date of Birth (MM/DD/CCYY)</Label>
                      <Input type="date" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">22. Gender</Label>
                      <div className="flex gap-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <Checkbox id="pat-m" />
                          <label htmlFor="pat-m" className="text-xs">M</label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Checkbox id="pat-f" />
                          <label htmlFor="pat-f" className="text-xs">F</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">23. Patient ID/Account # (Assigned by Dentist)</Label>
                    <Input className="mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECORD OF SERVICES PROVIDED */}
          <div className="border-2 border-foreground p-3 mb-3">
            <Label className="font-bold text-xs mb-2 block">RECORD OF SERVICES PROVIDED</Label>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-foreground">
                    <th className="border-r border-foreground p-1 text-left w-20">24. Procedure Date (MM/DD/CCYY)</th>
                    <th className="border-r border-foreground p-1 text-center w-12">25. Area of Oral Cavity</th>
                    <th className="border-r border-foreground p-1 text-center w-12">26. Tooth System</th>
                    <th className="border-r border-foreground p-1 text-center w-16">27. Tooth Number(s) or Letter(s)</th>
                    <th className="border-r border-foreground p-1 text-center w-16">28. Tooth Surface</th>
                    <th className="border-r border-foreground p-1 text-center w-20">29. Procedure Code</th>
                    <th className="border-r border-foreground p-1 text-left flex-1">30. Description</th>
                    <th className="p-1 text-right w-20">31. Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(10)].map((_, i) => (
                    <tr key={i} className="border-b border-muted">
                      <td className="border-r border-muted p-1">{i + 1}. <Input className="text-xs h-7" type="date" /></td>
                      <td className="border-r border-muted p-1"><Input className="text-xs h-7 text-center" maxLength={2} /></td>
                      <td className="border-r border-muted p-1"><Input className="text-xs h-7 text-center" maxLength={2} /></td>
                      <td className="border-r border-muted p-1"><Input className="text-xs h-7 text-center" /></td>
                      <td className="border-r border-muted p-1"><Input className="text-xs h-7 text-center" maxLength={5} /></td>
                      <td className="border-r border-muted p-1"><Input className="text-xs h-7" placeholder="D####" /></td>
                      <td className="border-r border-muted p-1"><Input className="text-xs h-7" /></td>
                      <td className="p-1"><Input className="text-xs h-7 text-right" type="number" step="0.01" placeholder="0.00" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* MISSING TEETH INFORMATION */}
            <div className="border border-foreground p-3">
              <Label className="font-bold text-xs mb-2 block">MISSING TEETH INFORMATION</Label>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs font-semibold">34. (Place an 'X' on each missing tooth) - Permanent</Label>
                  <div className="grid grid-cols-16 gap-px mt-1 text-center">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className="border border-muted p-px">
                        <Checkbox id={`perm-${i + 1}`} className="scale-75" />
                        <div className="text-[8px]">{i + 1}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-16 gap-px text-center">
                    {[...Array(16)].map((_, i) => (
                      <div key={i + 16} className="border border-muted p-px">
                        <Checkbox id={`perm-${32 - i}`} className="scale-75" />
                        <div className="text-[8px]">{32 - i}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Primary</Label>
                  <div className="grid grid-cols-10 gap-px mt-1 text-center">
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((letter) => (
                      <div key={letter} className="border border-muted p-px">
                        <Checkbox id={`prim-${letter}`} className="scale-75" />
                        <div className="text-[8px]">{letter}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-10 gap-px text-center">
                    {['T', 'S', 'R', 'Q', 'P', 'O', 'N', 'M', 'L', 'K'].map((letter) => (
                      <div key={letter} className="border border-muted p-px">
                        <Checkbox id={`prim-${letter}`} className="scale-75" />
                        <div className="text-[8px]">{letter}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">32. Other Fee(s)</Label>
                  <Input className="mt-1 text-xs" type="number" step="0.01" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">33. Total Fee</Label>
                  <Input className="mt-1 text-xs font-bold" type="number" step="0.01" />
                </div>
              </div>
            </div>

            {/* REMARKS */}
            <div className="border border-foreground p-3">
              <Label className="font-bold text-xs mb-2 block">35. Remarks</Label>
              <Textarea className="mt-1 text-xs min-h-[180px]" placeholder="Additional information..." />
            </div>
          </div>

          {/* AUTHORIZATIONS */}
          <div className="border border-foreground p-3 mb-3">
            <Label className="font-bold text-xs mb-2 block">AUTHORIZATIONS</Label>
            <div className="space-y-2">
              <div className="text-xs">
                <p>36. I have been informed of the treatment plan and associated fees. I agree to be responsible for all charges for dental services and materials not paid by my dental benefit plan, unless prohibited by law, or the treating dentist or dental practice has a contractual agreement with my plan prohibiting all or a portion of such charges. To the extent permitted by law, I consent to your use and disclosure of my protected health information to carry out payment activities in connection with this claim.</p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label className="text-xs">Patient/Guardian signature</Label>
                    <Input className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Date</Label>
                    <Input type="date" className="mt-1" />
                  </div>
                </div>
              </div>
              <div className="text-xs">
                <p>37. I hereby authorize and direct payment of the dental benefits otherwise payable to me, directly to the below named dentist or dental entity.</p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label className="text-xs">Subscriber signature</Label>
                    <Input className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Date</Label>
                    <Input type="date" className="mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* ANCILLARY CLAIM/TREATMENT INFORMATION */}
            <div className="border border-foreground p-3">
              <Label className="font-bold text-xs mb-2 block">ANCILLARY CLAIM/TREATMENT INFORMATION</Label>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">38. Place of Treatment</Label>
                  <div className="flex gap-3 mt-1 flex-wrap">
                    <div className="flex items-center space-x-1">
                      <Checkbox id="provider-office" />
                      <label htmlFor="provider-office" className="text-xs">Provider's Office</label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Checkbox id="hospital" />
                      <label htmlFor="hospital" className="text-xs">Hospital</label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Checkbox id="ecf" />
                      <label htmlFor="ecf" className="text-xs">ECF</label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Checkbox id="other-place" />
                      <label htmlFor="other-place" className="text-xs">Other</label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">39. Number of Enclosures (00 to 99)</Label>
                  <div className="flex gap-3 mt-1">
                    <div className="flex items-center space-x-1">
                      <Checkbox id="radiographs" />
                      <label htmlFor="radiographs" className="text-xs">Radiographs</label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Checkbox id="oral-images" />
                      <label htmlFor="oral-images" className="text-xs">Oral Images</label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Checkbox id="models" />
                      <label htmlFor="models" className="text-xs">Models</label>
                    </div>
                  </div>
                  <Input className="mt-1 text-xs" maxLength={2} placeholder="00" />
                </div>
                <div>
                  <Label className="text-xs">40. Is Treatment for Orthodontics?</Label>
                  <div className="flex gap-3 mt-1">
                    <div className="flex items-center space-x-1">
                      <Checkbox id="ortho-no" />
                      <label htmlFor="ortho-no" className="text-xs">No (Skip 41-42)</label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Checkbox id="ortho-yes" />
                      <label htmlFor="ortho-yes" className="text-xs">Yes (Complete 41-42)</label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">42. Months of Treatment Remaining</Label>
                    <Input className="mt-1 text-xs" type="number" />
                  </div>
                  <div>
                    <Label className="text-xs">41. Date Appliance Placed (MM/DD/CCYY)</Label>
                    <Input type="date" className="mt-1 text-xs" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">43. Replacement of Prosthesis?</Label>
                  <div className="flex gap-3 mt-1">
                    <div className="flex items-center space-x-1">
                      <Checkbox id="pros-no" />
                      <label htmlFor="pros-no" className="text-xs">No (Skip 44)</label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Checkbox id="pros-yes" />
                      <label htmlFor="pros-yes" className="text-xs">Yes (Complete 44)</label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">44. Date Prior Placement (MM/DD/CCYY)</Label>
                  <Input type="date" className="mt-1 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">45. Treatment Resulting from</Label>
                  <div className="space-y-1 mt-1">
                    <div className="flex items-center space-x-1">
                      <Checkbox id="occupational" />
                      <label htmlFor="occupational" className="text-xs">Occupational illness/injury</label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Checkbox id="auto-accident" />
                      <label htmlFor="auto-accident" className="text-xs">Auto accident</label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Checkbox id="other-accident" />
                      <label htmlFor="other-accident" className="text-xs">Other accident</label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">46. Date of Accident (MM/DD/CCYY)</Label>
                  <Input type="date" className="mt-1 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">47. Auto Accident State</Label>
                  <Input className="mt-1 text-xs" maxLength={2} />
                </div>
              </div>
            </div>

            {/* BILLING AND TREATING DENTIST */}
            <div className="space-y-3">
              {/* BILLING DENTIST */}
              <div className="border border-foreground p-3">
                <Label className="font-bold text-xs mb-2 block">BILLING DENTIST OR DENTAL ENTITY (Leave blank if dentist or dental entity is not submitting claim on behalf of the patient or insured/subscriber)</Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">48. Name, Address, City, State, Zip Code</Label>
                    <Input className="mt-1 text-xs" placeholder="Name" />
                    <Input className="mt-1 text-xs" placeholder="Address" />
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      <Input placeholder="City" className="text-xs" />
                      <Input placeholder="State" className="text-xs" />
                      <Input placeholder="Zip" className="text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">49. NPI</Label>
                      <Input className="mt-1 text-xs" maxLength={10} />
                    </div>
                    <div>
                      <Label className="text-xs">50. License Number</Label>
                      <Input className="mt-1 text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">51. SSN or TIN</Label>
                      <Input className="mt-1 text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs">52A. Additional Provider ID</Label>
                      <Input className="mt-1 text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">52. Phone Number</Label>
                      <Input type="tel" className="mt-1 text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs">58. Additional Provider ID</Label>
                      <Input className="mt-1 text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              {/* TREATING DENTIST */}
              <div className="border border-foreground p-3">
                <Label className="font-bold text-xs mb-2 block">TREATING DENTIST AND TREATMENT LOCATION INFORMATION</Label>
                <div className="space-y-2">
                  <div className="text-xs">
                    <p>53. I hereby certify that the procedures as indicated by date are in progress (for procedures that require multiple visits) or have been completed.</p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label className="text-xs">Signed (Treating Dentist)</Label>
                        <Input className="mt-1 text-xs" />
                      </div>
                      <div>
                        <Label className="text-xs">Date</Label>
                        <Input type="date" className="mt-1 text-xs" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">54. NPI</Label>
                      <Input className="mt-1 text-xs" maxLength={10} />
                    </div>
                    <div>
                      <Label className="text-xs">55. License Number</Label>
                      <Input className="mt-1 text-xs" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">56. Address, City, State, Zip Code</Label>
                    <Input className="mt-1 text-xs" placeholder="Address" />
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      <Input placeholder="City" className="text-xs" />
                      <Input placeholder="State" className="text-xs" />
                      <Input placeholder="Zip" className="text-xs" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">56A. Provider Specialty Code</Label>
                    <Input className="mt-1 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">57. Phone Number</Label>
                      <Input type="tel" className="mt-1 text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs">58. Additional Provider ID</Label>
                      <Input className="mt-1 text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground border-t pt-2">
            <p>© 2006 American Dental Association</p>
            <p>To Reorder call 1-800-947-4746 or go online at www.adacatalog.org</p>
            <p>(Same as ADA Dental Claim Form - J401, J402, J403, J404)</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 justify-end">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              Submit Claim
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ADADentalForm;
