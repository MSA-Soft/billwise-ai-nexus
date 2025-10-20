import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// UB-04 Institutional Claim Form (CMS-1450)
// Exact replication of official form layout

const UB04Form = () => {
  const { toast } = useToast();
  
  const handleSubmit = () => {
    toast({
      title: "Claim Submitted",
      description: "UB-04 institutional claim has been submitted successfully."
    });
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your claim has been saved as a draft."
    });
  };

  return (
    <div className="max-w-[11in] mx-auto bg-background">
      <Card className="border border-foreground shadow-none">
        <CardContent className="p-0">
          {/* TOP SECTION - Provider Info */}
          <div className="border-b border-foreground flex">
            {/* Field 1 - Billing Provider */}
            <div className="flex-1 border-r border-foreground p-1">
              <Label className="text-[7px] font-bold block mb-0.5">1. PROVIDER NAME, ADDRESS, ZIP CODE & PHONE NUMBER</Label>
              <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="Provider Name" />
              <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="Address" />
              <div className="flex gap-0.5">
                <Input className="h-5 text-[8px] flex-1 border-0 p-0.5" placeholder="City, State, Zip" />
                <Input className="h-5 text-[8px] w-24 border-0 p-0.5" placeholder="Phone" />
              </div>
            </div>
            
            {/* Field 2 - Pay-To Provider */}
            <div className="w-48 border-r border-foreground p-1">
              <Label className="text-[7px] font-bold block mb-0.5">2. PAY-TO NAME AND ADDRESS</Label>
              <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" />
              <Input className="h-5 text-[8px] border-0 p-0.5" />
            </div>
            
            {/* Field 3a - Patient Control Number */}
            <div className="w-32 border-r border-foreground p-1">
              <Label className="text-[7px] font-bold block mb-0.5">3a. PAT. CNTL #</Label>
              <Input className="h-5 text-[8px] border-0 p-0.5" />
            </div>
            
            {/* Field 3b - Medical Record Number */}
            <div className="w-32 p-1">
              <Label className="text-[7px] font-bold block mb-0.5">3b. MED REC #</Label>
              <Input className="h-5 text-[8px] border-0 p-0.5" />
            </div>
          </div>

          {/* Field 4 & 5 Row */}
          <div className="border-b border-foreground flex">
            <div className="w-32 border-r border-foreground p-1 bg-pink-100">
              <Label className="text-[7px] font-bold block mb-0.5 text-pink-800">4. TYPE OF BILL</Label>
              <div className="flex gap-px">
                <Input className="h-6 text-[8px] w-7 border border-foreground p-0.5 text-center font-mono bg-white" maxLength={1} />
                <Input className="h-6 text-[8px] w-7 border border-foreground p-0.5 text-center font-mono bg-white" maxLength={1} />
                <Input className="h-6 text-[8px] w-7 border border-foreground p-0.5 text-center font-mono bg-white" maxLength={1} />
                <Input className="h-6 text-[8px] w-7 border border-foreground p-0.5 text-center font-mono bg-white" maxLength={1} />
              </div>
            </div>
            
            <div className="flex-1 p-1">
              <Label className="text-[7px] font-bold block mb-0.5">5. FED. TAX NO.</Label>
              <Input className="h-6 text-[8px] border-0 p-0.5" />
            </div>
            
            <div className="w-48 border-l border-foreground p-1">
              <Label className="text-[7px] font-bold block mb-0.5">6. STATEMENT COVERS PERIOD</Label>
              <div className="flex gap-0.5">
                <Input type="date" className="h-5 text-[7px] flex-1 border-0 p-0.5" />
                <span className="text-[8px] self-center">THROUGH</span>
                <Input type="date" className="h-5 text-[7px] flex-1 border-0 p-0.5" />
              </div>
            </div>
          </div>

          {/* MAIN GRID SECTION */}
          <div className="flex">
            {/* LEFT COLUMN - Patient Info & Codes */}
            <div className="w-[35%] border-r border-foreground">
              {/* Field 7 - Not Used */}
              <div className="border-b border-foreground p-1 bg-gray-100">
                <Label className="text-[7px] text-gray-500">7. (NOT USED)</Label>
              </div>

              {/* Field 8 - Patient Name */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold">8. PATIENT NAME</Label>
                <div className="flex gap-0.5 mt-0.5">
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5" placeholder="Last" />
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5" placeholder="First" />
                  <Input className="h-5 text-[8px] w-12 border-0 p-0.5" placeholder="MI" />
                </div>
              </div>

              {/* Field 9 - Patient Address */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold">9. PATIENT ADDRESS</Label>
                <Input className="h-5 text-[8px] mt-0.5 border-0 p-0.5" placeholder="Street" />
                <div className="flex gap-0.5 mt-0.5">
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5" placeholder="City" />
                  <Input className="h-5 text-[8px] w-12 border-0 p-0.5" placeholder="ST" />
                  <Input className="h-5 text-[8px] w-20 border-0 p-0.5" placeholder="Zip" />
                </div>
              </div>

              {/* Fields 10-11 - Birthdate & Sex */}
              <div className="flex border-b border-foreground">
                <div className="flex-1 border-r border-foreground p-1">
                  <Label className="text-[7px] font-bold">10. BIRTHDATE</Label>
                  <Input type="date" className="h-5 text-[8px] mt-0.5 border-0 p-0.5" />
                </div>
                <div className="w-16 p-1">
                  <Label className="text-[7px] font-bold">11. SEX</Label>
                  <div className="flex gap-1 mt-0.5">
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="sex-m" className="h-2.5 w-2.5" />
                      <label htmlFor="sex-m" className="text-[7px]">M</label>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <Checkbox id="sex-f" className="h-2.5 w-2.5" />
                      <label htmlFor="sex-f" className="text-[7px]">F</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fields 12-13 - Admission Date & Hour */}
              <div className="flex border-b border-foreground">
                <div className="flex-1 border-r border-foreground p-1">
                  <Label className="text-[7px] font-bold">12. ADMISSION DATE</Label>
                  <Input type="date" className="h-5 text-[8px] mt-0.5 border-0 p-0.5" />
                </div>
                <div className="w-16 p-1">
                  <Label className="text-[7px] font-bold">13. HR</Label>
                  <Input className="h-5 text-[8px] mt-0.5 border-0 p-0.5 text-center" maxLength={2} placeholder="00" />
                </div>
              </div>

              {/* Fields 14-16 - Type, Source, DHR */}
              <div className="flex border-b border-foreground">
                <div className="w-14 border-r border-foreground p-1">
                  <Label className="text-[7px] font-bold">14. TYPE</Label>
                  <Input className="h-5 text-[8px] mt-0.5 border-0 p-0.5 text-center" maxLength={1} />
                </div>
                <div className="w-14 border-r border-foreground p-1">
                  <Label className="text-[7px] font-bold">15. SRC</Label>
                  <Input className="h-5 text-[8px] mt-0.5 border-0 p-0.5 text-center" maxLength={1} />
                </div>
                <div className="flex-1 p-1">
                  <Label className="text-[7px] font-bold">16. DHR</Label>
                  <Input className="h-5 text-[8px] mt-0.5 border-0 p-0.5 text-center" maxLength={2} placeholder="00" />
                </div>
              </div>

              {/* Field 17 - Status */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold">17. STAT</Label>
                <Input className="h-5 text-[8px] mt-0.5 border-0 p-0.5 text-center" maxLength={2} />
              </div>

              {/* Fields 18-28 - Condition Codes */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">18-28. CONDITION CODES</Label>
                <div className="grid grid-cols-6 gap-0.5">
                  {[...Array(11)].map((_, i) => (
                    <Input key={i} className="h-5 text-[8px] border border-foreground p-0.5 text-center" maxLength={2} />
                  ))}
                </div>
              </div>

              {/* Fields 29-30 - ACDT State */}
              <div className="flex border-b border-foreground">
                <div className="w-16 border-r border-foreground p-1">
                  <Label className="text-[7px] font-bold">29. ACDT ST</Label>
                  <Input className="h-5 text-[8px] mt-0.5 border-0 p-0.5 text-center" maxLength={2} />
                </div>
                <div className="flex-1 p-1">
                  <Label className="text-[7px] font-bold">30. (NOT USED)</Label>
                </div>
              </div>

              {/* Fields 31-34 - Occurrence Codes & Dates */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">31-34. OCCURRENCE CODE - DATE</Label>
                <div className="space-y-0.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-0.5">
                      <Label className="text-[7px] w-6 self-center">3{i + 1}</Label>
                      <Input className="h-5 text-[8px] w-10 border border-foreground p-0.5 text-center" maxLength={2} />
                      <Input type="date" className="h-5 text-[7px] flex-1 border border-foreground p-0.5" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Fields 35-36 - Occurrence Span */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">35-36. OCCURRENCE SPAN - FROM/THROUGH</Label>
                <div className="space-y-0.5">
                  {[35, 36].map((num) => (
                    <div key={num} className="flex gap-0.5">
                      <Label className="text-[7px] w-6 self-center">{num}</Label>
                      <Input className="h-5 text-[8px] w-10 border border-foreground p-0.5 text-center" maxLength={2} />
                      <Input type="date" className="h-5 text-[7px] flex-[2] border border-foreground p-0.5" />
                      <Input type="date" className="h-5 text-[7px] flex-[2] border border-foreground p-0.5" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Field 37 - Not Used */}
              <div className="border-b border-foreground p-1 bg-gray-100">
                <Label className="text-[7px] text-gray-500">37. (NOT USED)</Label>
              </div>

              {/* Field 38 - Responsible Party */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">38. RESPONSIBLE PARTY NAME AND ADDRESS</Label>
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="Name" />
                <Input className="h-5 text-[8px] border-0 p-0.5" placeholder="Address" />
              </div>

              {/* Fields 39-41 - Value Codes */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">39-41. VALUE CODES | AMOUNT</Label>
                <div className="space-y-0.5">
                  {[39, 40, 41].map((num, i) => (
                    <div key={num} className="flex gap-0.5">
                      <Label className="text-[7px] w-6 self-center">{num}</Label>
                      <div className="flex gap-0.5 flex-1">
                        <Input className="h-5 text-[8px] w-10 border border-foreground p-0.5 text-center" maxLength={2} placeholder="a" />
                        <Input className="h-5 text-[8px] flex-1 border border-foreground p-0.5 text-right" placeholder="0.00" />
                        <Input className="h-5 text-[8px] w-10 border border-foreground p-0.5 text-center" maxLength={2} placeholder="b" />
                        <Input className="h-5 text-[8px] flex-1 border border-foreground p-0.5 text-right" placeholder="0.00" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CENTER - Revenue Code Lines */}
            <div className="flex-1 relative">
              {/* Vertical "PAGE OF" Banner */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-pink-200 flex items-center justify-center border-r border-foreground">
                <div className="transform -rotate-90 whitespace-nowrap origin-center">
                  <span className="text-[9px] font-bold text-pink-800 tracking-wider">PAGE OF</span>
                </div>
              </div>

              <div className="ml-6">
                {/* Creation Date Header */}
                <div className="bg-pink-200 border-b border-foreground p-0.5 text-center">
                  <span className="text-[7px] font-bold text-pink-800 tracking-wide">CREATION DATE</span>
                </div>

                {/* Totals Banner */}
                <div className="bg-pink-200 border-b border-foreground p-1 text-center">
                  <span className="text-[8px] font-bold text-pink-800 tracking-wider">TOTALS</span>
                </div>

                {/* Revenue Code Grid Header */}
                <div className="border-b border-foreground bg-gray-50">
                  <table className="w-full text-[6px]">
                    <thead>
                      <tr>
                        <th className="border-r border-foreground p-0.5 text-left font-bold" style={{width: "10%"}}>42<br/>REV.<br/>CD.</th>
                        <th className="border-r border-foreground p-0.5 text-left font-bold" style={{width: "25%"}}>43<br/>DESCRIPTION</th>
                        <th className="border-r border-foreground p-0.5 text-center font-bold" style={{width: "15%"}}>44<br/>HCPCS/RATE/<br/>HIPPS CODE</th>
                        <th className="border-r border-foreground p-0.5 text-center font-bold" style={{width: "10%"}}>45<br/>SERV.<br/>DATE</th>
                        <th className="border-r border-foreground p-0.5 text-center font-bold" style={{width: "10%"}}>46<br/>SERV.<br/>UNITS</th>
                        <th className="border-r border-foreground p-0.5 text-right font-bold" style={{width: "15%"}}>47<br/>TOTAL<br/>CHARGES</th>
                        <th className="border-r border-foreground p-0.5 text-right font-bold" style={{width: "15%"}}>48<br/>NON-COVERED<br/>CHARGES</th>
                        <th className="p-0.5 text-center font-bold" style={{width: "5%"}}>49</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(23)].map((_, i) => (
                        <tr key={i} className="border-t border-foreground hover:bg-gray-50">
                          <td className="border-r border-foreground p-0">
                            <Input className="h-4 text-[7px] border-0 p-0.5 text-center" maxLength={4} />
                          </td>
                          <td className="border-r border-foreground p-0">
                            <Input className="h-4 text-[7px] border-0 p-0.5" />
                          </td>
                          <td className="border-r border-foreground p-0">
                            <Input className="h-4 text-[7px] border-0 p-0.5 text-center" />
                          </td>
                          <td className="border-r border-foreground p-0">
                            <Input className="h-4 text-[7px] border-0 p-0.5 text-center" maxLength={6} />
                          </td>
                          <td className="border-r border-foreground p-0">
                            <Input className="h-4 text-[7px] border-0 p-0.5 text-center" />
                          </td>
                          <td className="border-r border-foreground p-0">
                            <Input className="h-4 text-[7px] border-0 p-0.5 text-right" />
                          </td>
                          <td className="border-r border-foreground p-0">
                            <Input className="h-4 text-[7px] border-0 p-0.5 text-right" />
                          </td>
                          <td className="p-0">
                            <Input className="h-4 text-[7px] border-0 p-0.5 text-center" maxLength={1} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Payer Info */}
            <div className="w-[28%] border-l border-foreground">
              {/* Field 50 - Payer Name */}
              <div className="border-b border-foreground p-1 bg-pink-200">
                <Label className="text-[7px] font-bold text-pink-800 block mb-0.5">50. PAYER NAME</Label>
                <Input className="h-5 text-[8px] border-0 p-0.5 bg-white" placeholder="A" />
                <Input className="h-5 text-[8px] mt-0.5 border-0 p-0.5 bg-white" placeholder="B" />
                <Input className="h-5 text-[8px] mt-0.5 border-0 p-0.5 bg-white" placeholder="C" />
              </div>

              {/* Field 51 - Health Plan ID */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">51. HEALTH PLAN ID</Label>
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="A" />
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="B" />
                <Input className="h-5 text-[8px] border-0 p-0.5" placeholder="C" />
              </div>

              {/* Field 52 - Release Info */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">52. REL. INFO</Label>
                <div className="flex gap-0.5">
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5 text-center" maxLength={1} placeholder="A" />
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5 text-center" maxLength={1} placeholder="B" />
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5 text-center" maxLength={1} placeholder="C" />
                </div>
              </div>

              {/* Field 53 - Assignment */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">53. ASG. BEN.</Label>
                <div className="flex gap-0.5">
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5 text-center" maxLength={1} placeholder="A" />
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5 text-center" maxLength={1} placeholder="B" />
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5 text-center" maxLength={1} placeholder="C" />
                </div>
              </div>

              {/* Field 54 - Prior Payments */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">54. PRIOR PAYMENTS</Label>
                <div className="flex gap-0.5">
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5 text-right" placeholder="A - 0.00" />
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5 text-right" placeholder="B - 0.00" />
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5 text-right" placeholder="C - 0.00" />
                </div>
              </div>

              {/* Field 55 - Est Amount Due */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">55. EST. AMOUNT DUE</Label>
                <div className="flex gap-0.5">
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5 text-right" placeholder="A - 0.00" />
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5 text-right" placeholder="B - 0.00" />
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5 text-right" placeholder="C - 0.00" />
                </div>
              </div>

              {/* Field 56 - NPI */}
              <div className="border-b border-foreground p-1 bg-pink-200">
                <Label className="text-[7px] font-bold text-pink-800 block mb-0.5">56. NPI</Label>
                <Input className="h-5 text-[8px] border-0 p-0.5 bg-white" maxLength={10} placeholder="A" />
                <Input className="h-5 text-[8px] mt-0.5 border-0 p-0.5 bg-white" maxLength={10} placeholder="B" />
                <Input className="h-5 text-[8px] mt-0.5 border-0 p-0.5 bg-white" maxLength={10} placeholder="C" />
              </div>

              {/* Field 57 - Other Provider ID */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">57. OTHER PROVIDER ID</Label>
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="A" />
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="B" />
                <Input className="h-5 text-[8px] border-0 p-0.5" placeholder="C" />
              </div>

              {/* Field 58 - Insured's Name */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">58. INSURED'S NAME</Label>
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="A" />
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="B" />
                <Input className="h-5 text-[8px] border-0 p-0.5" placeholder="C" />
              </div>

              {/* Field 59 - P.Rel */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">59. P. REL.</Label>
                <div className="flex gap-0.5">
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5 text-center" maxLength={2} placeholder="A" />
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5 text-center" maxLength={2} placeholder="B" />
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5 text-center" maxLength={2} placeholder="C" />
                </div>
              </div>

              {/* Field 60 - Insured's Unique ID */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">60. INSURED'S UNIQUE ID</Label>
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="A" />
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="B" />
                <Input className="h-5 text-[8px] border-0 p-0.5" placeholder="C" />
              </div>

              {/* Field 61 - Group Name */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">61. GROUP NAME</Label>
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="A" />
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="B" />
                <Input className="h-5 text-[8px] border-0 p-0.5" placeholder="C" />
              </div>

              {/* Field 62 - Insurance Group Number */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">62. INSURANCE GROUP NO.</Label>
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="A" />
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="B" />
                <Input className="h-5 text-[8px] border-0 p-0.5" placeholder="C" />
              </div>

              {/* Field 63 - Treatment Auth Codes */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">63. TREATMENT AUTHORIZATION CODES</Label>
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="A" />
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="B" />
                <Input className="h-5 text-[8px] border-0 p-0.5" placeholder="C" />
              </div>

              {/* Field 64 - Doc Control Number */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">64. DOC. CONTROL NUMBER</Label>
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="A" />
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="B" />
                <Input className="h-5 text-[8px] border-0 p-0.5" placeholder="C" />
              </div>

              {/* Field 65 - Employer Name */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">65. EMPLOYER NAME</Label>
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="A" />
                <Input className="h-5 text-[8px] mb-0.5 border-0 p-0.5" placeholder="B" />
                <Input className="h-5 text-[8px] border-0 p-0.5" placeholder="C" />
              </div>

              {/* Field 66 - DX Version */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">66. DX VER.</Label>
                <Input className="h-5 text-[8px] border-0 p-0.5 text-center" maxLength={1} placeholder="0" />
              </div>

              {/* Field 67 - Principal & Other Diagnosis */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">67. PRINCIPAL DIAGNOSIS</Label>
                <Input className="h-5 text-[8px] mb-1 border-0 p-0.5" />
                <Label className="text-[6px] block mb-0.5">67A-Q. OTHER DIAGNOSIS</Label>
                <div className="grid grid-cols-2 gap-0.5">
                  {[...Array(12)].map((_, i) => (
                    <Input key={i} className="h-4 text-[7px] border border-foreground p-0.5" />
                  ))}
                </div>
              </div>

              {/* Field 68 - Not Used */}
              <div className="border-b border-foreground p-1 bg-gray-100">
                <Label className="text-[7px] text-gray-500">68. (NOT USED)</Label>
              </div>

              {/* Field 69 - Admitting Diagnosis */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">69. ADMITTING DIAGNOSIS</Label>
                <Input className="h-5 text-[8px] border-0 p-0.5" />
              </div>

              {/* Field 70 - Patient Reason Dx */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">70. PATIENT REASON DX</Label>
                <div className="flex gap-0.5">
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5" placeholder="A" />
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5" placeholder="B" />
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5" placeholder="C" />
                </div>
              </div>

              {/* Field 71 - PPS Code */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">71. PPS CODE</Label>
                <Input className="h-5 text-[8px] border-0 p-0.5" />
              </div>

              {/* Field 72 - ECI */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">72. ECI</Label>
                <div className="grid grid-cols-3 gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <Input key={i} className="h-5 text-[8px] border border-foreground p-0.5 text-center" maxLength={2} />
                  ))}
                </div>
              </div>

              {/* Field 73 - Not Used */}
              <div className="border-b border-foreground p-1 bg-gray-100">
                <Label className="text-[7px] text-gray-500">73. (NOT USED)</Label>
              </div>

              {/* Field 74 - Principal Procedure */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">74. PRINCIPAL PROCEDURE CODE | DATE</Label>
                <div className="flex gap-0.5 mb-1">
                  <Input className="h-5 text-[8px] flex-1 border-0 p-0.5" />
                  <Input type="date" className="h-5 text-[7px] w-20 border-0 p-0.5" />
                </div>
                <Label className="text-[6px] block mb-0.5">74A-E. OTHER PROCEDURE CODE | DATE</Label>
                <div className="space-y-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-0.5">
                      <Input className="h-4 text-[7px] flex-1 border border-foreground p-0.5" />
                      <Input type="date" className="h-4 text-[6px] w-16 border border-foreground p-0.5" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Field 75 - Not Used */}
              <div className="border-b border-foreground p-1 bg-gray-100">
                <Label className="text-[7px] text-gray-500">75. (NOT USED)</Label>
              </div>

              {/* Field 76 - Attending */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">76. ATTENDING | NPI</Label>
                <div className="flex gap-0.5 mb-0.5">
                  <Input className="h-4 text-[7px] w-10 border-0 p-0.5 text-center" maxLength={2} placeholder="QUAL" />
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" placeholder="NPI" maxLength={10} />
                </div>
                <Input className="h-4 text-[7px] border-0 p-0.5" placeholder="LAST | FIRST" />
              </div>

              {/* Field 77 - Operating */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">77. OPERATING | NPI</Label>
                <div className="flex gap-0.5 mb-0.5">
                  <Input className="h-4 text-[7px] w-10 border-0 p-0.5 text-center" maxLength={2} placeholder="QUAL" />
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" placeholder="NPI" maxLength={10} />
                </div>
                <Input className="h-4 text-[7px] border-0 p-0.5" placeholder="LAST | FIRST" />
              </div>

              {/* Fields 78-79 - Other Physicians */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">78-79. OTHER | NPI</Label>
                {[78, 79].map((num) => (
                  <div key={num} className="mb-0.5">
                    <div className="flex gap-0.5">
                      <Input className="h-4 text-[7px] w-10 border border-foreground p-0.5 text-center" maxLength={2} placeholder="QUAL" />
                      <Input className="h-4 text-[7px] flex-1 border border-foreground p-0.5" placeholder="NPI" maxLength={10} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Field 80 - Remarks */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">80. REMARKS</Label>
                <Input className="h-5 text-[8px] border-0 p-0.5" />
              </div>

              {/* Field 81 - Code-Code */}
              <div className="border-b border-foreground p-1">
                <Label className="text-[7px] font-bold block mb-0.5">81. CODE-CODE</Label>
                <div className="grid grid-cols-4 gap-0.5">
                  {[...Array(4)].map((_, i) => (
                    <Input key={i} className="h-5 text-[8px] border border-foreground p-0.5 text-center" maxLength={2} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="text-center text-[7px] text-muted-foreground border-t border-foreground p-1 bg-gray-50">
            <p>APPROVED OMB NO. 0938-0997 FORM CMS-1450 (UB-04)</p>
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

export default UB04Form;
