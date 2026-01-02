import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    <div className="max-w-[11in] mx-auto bg-white p-4">
      <Card className="border-2 border-black shadow-none bg-white">
        <CardContent className="p-0">
          {/* Header Row 1-6 */}
          <div className="flex border-b-2 border-black">
            {/* Field 1 */}
            <div className="flex-[2] border-r border-black p-1">
              <Label className="text-[6px] font-bold block">1 PROVIDER NAME, ADDRESS, ZIP CODE & PHONE NUMBER</Label>
              <Input className="h-4 text-[7px] border-0 p-0.5 mb-0.5" />
              <Input className="h-4 text-[7px] border-0 p-0.5 mb-0.5" />
              <Input className="h-4 text-[7px] border-0 p-0.5" />
            </div>
            
            {/* Field 2 */}
            <div className="w-36 border-r border-black p-1">
              <Label className="text-[6px] font-bold block">2 PAY-TO NAME AND ADDRESS</Label>
              <Input className="h-4 text-[7px] border-0 p-0.5 mb-0.5" />
              <Input className="h-4 text-[7px] border-0 p-0.5" />
            </div>
            
            {/* Field 3a */}
            <div className="w-24 border-r border-black p-1">
              <Label className="text-[6px] font-bold block">3a PAT CNTL#</Label>
              <Input className="h-5 text-[7px] border-0 p-0.5" />
            </div>
            
            {/* Field 3b */}
            <div className="w-24 p-1">
              <Label className="text-[6px] font-bold block">3b MED REC#</Label>
              <Input className="h-5 text-[7px] border-0 p-0.5" />
            </div>
          </div>

          {/* Header Row 2: Fields 4-6 */}
          <div className="flex border-b border-black">
            {/* Field 4 - Pink */}
            <div className="w-28 border-r border-black p-1 bg-pink-100">
              <Label className="text-[6px] font-bold block text-pink-900">4 TYPE OF BILL</Label>
              <div className="flex gap-px mt-0.5">
                <Input className="h-5 w-6 text-[7px] border border-black p-0 text-center bg-white" maxLength={1} />
                <Input className="h-5 w-6 text-[7px] border border-black p-0 text-center bg-white" maxLength={1} />
                <Input className="h-5 w-6 text-[7px] border border-black p-0 text-center bg-white" maxLength={1} />
                <Input className="h-5 w-6 text-[7px] border border-black p-0 text-center bg-white" maxLength={1} />
              </div>
            </div>
            
            {/* Field 5 */}
            <div className="flex-1 border-r border-black p-1">
              <Label className="text-[6px] font-bold block">5 FED TAX NO</Label>
              <Input className="h-5 text-[7px] border-0 p-0.5" />
            </div>
            
            {/* Field 6 */}
            <div className="w-44 p-1">
              <Label className="text-[6px] font-bold block">6 STATEMENT COVERS PERIOD</Label>
              <div className="flex gap-1 items-center mt-0.5">
                <Input type="date" className="h-5 text-[6px] flex-1 border-0 p-0.5" />
                <span className="text-[6px]">THROUGH</span>
                <Input type="date" className="h-5 text-[6px] flex-1 border-0 p-0.5" />
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="flex">
            {/* LEFT COLUMN */}
            <div className="w-[32%] border-r border-black">
              {/* Field 7 */}
              <div className="border-b border-black p-0.5 h-5 bg-gray-50">
                <Label className="text-[6px] text-gray-500">7 UNLABELED</Label>
              </div>

              {/* Field 8 */}
              <div className="border-b border-black p-1">
                <Label className="text-[6px] font-bold block">8 PATIENT NAME</Label>
                <div className="flex gap-1 mt-0.5">
                  <Input className="h-4 text-[7px] flex-[2] border-0 p-0.5" placeholder="Last" />
                  <Input className="h-4 text-[7px] flex-[2] border-0 p-0.5" placeholder="First" />
                  <Input className="h-4 text-[7px] w-10 border-0 p-0.5" placeholder="MI" />
                </div>
              </div>

              {/* Field 9 */}
              <div className="border-b border-black p-1">
                <Label className="text-[6px] font-bold block">9 PATIENT ADDRESS</Label>
                <Input className="h-4 text-[7px] border-0 p-0.5 mb-0.5" placeholder="Street" />
                <div className="flex gap-1">
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" placeholder="City" />
                  <Input className="h-4 text-[7px] w-10 border-0 p-0.5" placeholder="ST" />
                  <Input className="h-4 text-[7px] w-16 border-0 p-0.5" placeholder="Zip" />
                </div>
              </div>

              {/* Fields 10-11 */}
              <div className="flex border-b border-black">
                <div className="flex-1 border-r border-black p-1">
                  <Label className="text-[6px] font-bold block">10 BIRTHDATE</Label>
                  <Input type="date" className="h-4 text-[6px] border-0 p-0.5 mt-0.5" />
                </div>
                <div className="w-14 p-1">
                  <Label className="text-[6px] font-bold block">11 SEX</Label>
                  <div className="flex gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Checkbox className="h-2.5 w-2.5" />
                      <span className="text-[6px]">M</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Checkbox className="h-2.5 w-2.5" />
                      <span className="text-[6px]">F</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fields 12-17 */}
              <div className="flex border-b border-black">
                <div className="flex-1 border-r border-black p-1">
                  <Label className="text-[6px] font-bold block">12 ADMISSION DATE</Label>
                  <Input type="date" className="h-4 text-[6px] border-0 p-0.5 mt-0.5" />
                </div>
                <div className="w-12 border-r border-black p-1">
                  <Label className="text-[6px] font-bold block">13 HR</Label>
                  <Input className="h-4 text-[7px] border-0 p-0.5 text-center mt-0.5" maxLength={2} />
                </div>
              </div>

              <div className="flex border-b border-black">
                <div className="w-12 border-r border-black p-1">
                  <Label className="text-[6px] font-bold block">14 TYPE</Label>
                  <Input className="h-4 text-[7px] border-0 p-0.5 text-center mt-0.5" maxLength={1} />
                </div>
                <div className="w-12 border-r border-black p-1">
                  <Label className="text-[6px] font-bold block">15 SRC</Label>
                  <Input className="h-4 text-[7px] border-0 p-0.5 text-center mt-0.5" maxLength={1} />
                </div>
                <div className="flex-1 border-r border-black p-1">
                  <Label className="text-[6px] font-bold block">16 DHR</Label>
                  <Input className="h-4 text-[7px] border-0 p-0.5 text-center mt-0.5" />
                </div>
                <div className="w-12 p-1">
                  <Label className="text-[6px] font-bold block">17 STAT</Label>
                  <Input className="h-4 text-[7px] border-0 p-0.5 text-center mt-0.5" maxLength={2} />
                </div>
              </div>

              {/* Fields 18-28 */}
              <div className="border-b border-black p-1">
                <Label className="text-[6px] font-bold block mb-1">18-28 CONDITION CODES</Label>
                <div className="grid grid-cols-6 gap-0.5">
                  {[18,19,20,21,22,23,24,25,26,27,28].map((n) => (
                    <div key={n}>
                      <Label className="text-[5px] block text-center">{n}</Label>
                      <Input className="h-4 text-[7px] border border-black p-0 text-center" maxLength={2} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Fields 29-30 */}
              <div className="flex border-b border-black">
                <div className="w-16 border-r border-black p-1">
                  <Label className="text-[6px] font-bold block">29 ACDT ST</Label>
                  <Input className="h-4 text-[7px] border-0 p-0.5 text-center mt-0.5" maxLength={2} />
                </div>
                <div className="flex-1 p-1 bg-gray-50">
                  <Label className="text-[6px] text-gray-500">30 UNLABELED</Label>
                </div>
              </div>

              {/* Fields 31-34 */}
              <div className="border-b border-black p-1">
                <Label className="text-[6px] font-bold block mb-1">31-34 OCCURRENCE CODE — DATE</Label>
                {[31,32,33,34].map((n) => (
                  <div key={n} className="flex gap-1 mb-0.5">
                    <Label className="text-[5px] w-5 self-center">{n}</Label>
                    <Input className="h-4 text-[7px] w-10 border border-black p-0.5 text-center" maxLength={2} />
                    <Input type="date" className="h-4 text-[6px] flex-1 border border-black p-0.5" />
                  </div>
                ))}
              </div>

              {/* Fields 35-36 */}
              <div className="border-b border-black p-1">
                <Label className="text-[6px] font-bold block mb-1">35-36 OCCURRENCE SPAN CODE — FROM/THROUGH</Label>
                {[35,36].map((n) => (
                  <div key={n} className="flex gap-1 mb-0.5">
                    <Label className="text-[5px] w-5 self-center">{n}</Label>
                    <Input className="h-4 text-[7px] w-8 border border-black p-0.5 text-center" maxLength={2} />
                    <Input type="date" className="h-4 text-[6px] flex-1 border border-black p-0.5" />
                    <Input type="date" className="h-4 text-[6px] flex-1 border border-black p-0.5" />
                  </div>
                ))}
              </div>

              {/* Field 37 */}
              <div className="border-b border-black p-0.5 h-5 bg-gray-50">
                <Label className="text-[6px] text-gray-500">37 UNLABELED</Label>
              </div>

              {/* Field 38 */}
              <div className="border-b border-black p-1">
                <Label className="text-[6px] font-bold block">38 RESPONSIBLE PARTY NAME AND ADDRESS</Label>
                <Input className="h-4 text-[7px] border-0 p-0.5 mb-0.5" />
                <Input className="h-4 text-[7px] border-0 p-0.5" />
              </div>

              {/* Fields 39-41 */}
              <div className="p-1">
                <Label className="text-[6px] font-bold block mb-1">39-41 VALUE CODES | AMOUNT</Label>
                {[39,40,41].map((n) => (
                  <div key={n} className="flex gap-1 mb-0.5">
                    <Label className="text-[5px] w-5 self-center">{n}</Label>
                    <Input className="h-4 text-[7px] w-8 border border-black p-0.5 text-center" placeholder="a" />
                    <Input className="h-4 text-[7px] flex-1 border border-black p-0.5 text-right" />
                    <Input className="h-4 text-[7px] w-8 border border-black p-0.5 text-center" placeholder="b" />
                    <Input className="h-4 text-[7px] flex-1 border border-black p-0.5 text-right" />
                  </div>
                ))}
              </div>
            </div>

            {/* CENTER - Revenue Codes */}
            <div className="flex-1 relative">
              {/* PAGE OF Banner */}
              <div className="absolute left-0 top-0 bottom-0 w-5 bg-pink-100 flex items-center justify-center border-r border-black">
                <div className="transform -rotate-90 whitespace-nowrap">
                  <span className="text-[8px] font-bold text-pink-900 tracking-widest">PAGE OF</span>
                </div>
              </div>

              <div className="ml-5">
                {/* CREATION DATE */}
                <div className="bg-pink-100 border-b border-black p-0.5 text-center">
                  <span className="text-[7px] font-bold text-pink-900 tracking-wider">CREATION DATE</span>
                </div>

                {/* TOTALS Banner */}
                <div className="bg-pink-100 border-b border-black p-1 text-center">
                  <span className="text-[9px] font-bold text-pink-900 tracking-widest">TOTALS</span>
                </div>

                {/* Revenue Grid */}
                <table className="w-full text-[6px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border-r border-black p-0.5 text-left font-bold w-[12%]">42<br/>REV CD</th>
                      <th className="border-r border-black p-0.5 text-left font-bold w-[20%]">43<br/>DESCRIPTION</th>
                      <th className="border-r border-black p-0.5 text-center font-bold w-[15%]">44<br/>HCPCS/RATE/<br/>HIPPS CODE</th>
                      <th className="border-r border-black p-0.5 text-center font-bold w-[10%]">45<br/>SERV<br/>DATE</th>
                      <th className="border-r border-black p-0.5 text-center font-bold w-[10%]">46<br/>SERV<br/>UNITS</th>
                      <th className="border-r border-black p-0.5 text-right font-bold w-[13%]">47<br/>TOTAL<br/>CHARGES</th>
                      <th className="border-r border-black p-0.5 text-right font-bold w-[13%]">48<br/>NON-CVD<br/>CHARGES</th>
                      <th className="p-0.5 text-center font-bold w-[7%]">49</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(22)].map((_, i) => (
                      <tr key={i} className="border-t border-black">
                        <td className="border-r border-black p-0"><Input className="h-4 text-[7px] border-0 p-0.5 text-center" /></td>
                        <td className="border-r border-black p-0"><Input className="h-4 text-[7px] border-0 p-0.5" /></td>
                        <td className="border-r border-black p-0"><Input className="h-4 text-[7px] border-0 p-0.5 text-center" /></td>
                        <td className="border-r border-black p-0"><Input className="h-4 text-[7px] border-0 p-0.5 text-center" /></td>
                        <td className="border-r border-black p-0"><Input className="h-4 text-[7px] border-0 p-0.5 text-center" /></td>
                        <td className="border-r border-black p-0"><Input className="h-4 text-[7px] border-0 p-0.5 text-right" /></td>
                        <td className="border-r border-black p-0"><Input className="h-4 text-[7px] border-0 p-0.5 text-right" /></td>
                        <td className="p-0"><Input className="h-4 text-[7px] border-0 p-0.5 text-center" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT COLUMN - Payers */}
            <div className="w-[28%] border-l border-black">
              {/* Field 50 - Pink */}
              <div className="border-b border-black p-1 bg-pink-100">
                <Label className="text-[6px] font-bold block text-pink-900">50 PAYER NAME</Label>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">A</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 bg-white" />
                </div>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">B</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 bg-white" />
                </div>
                <div className="flex gap-0.5">
                  <span className="text-[6px] w-4 font-bold">C</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 bg-white" />
                </div>
              </div>

              {/* Field 51 - Pink */}
              <div className="border-b border-black p-1 bg-pink-100">
                <Label className="text-[6px] font-bold block text-pink-900">51 HEALTH PLAN ID</Label>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">A</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 bg-white" />
                </div>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">B</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 bg-white" />
                </div>
                <div className="flex gap-0.5">
                  <span className="text-[6px] w-4 font-bold">C</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 bg-white" />
                </div>
              </div>

              {/* Field 52 - Pink */}
              <div className="border-b border-black p-1 bg-pink-100">
                <Label className="text-[6px] font-bold block text-pink-900">52 REL INFO</Label>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">A</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 bg-white" />
                </div>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">B</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 bg-white" />
                </div>
                <div className="flex gap-0.5">
                  <span className="text-[6px] w-4 font-bold">C</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 bg-white" />
                </div>
              </div>

              {/* Field 53 - Pink */}
              <div className="border-b border-black p-1 bg-pink-100">
                <Label className="text-[6px] font-bold block text-pink-900">53 ASG BEN</Label>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">A</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 bg-white" />
                </div>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">B</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 bg-white" />
                </div>
                <div className="flex gap-0.5">
                  <span className="text-[6px] w-4 font-bold">C</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 bg-white" />
                </div>
              </div>

              {/* Field 54 - Pink */}
              <div className="border-b border-black p-1 bg-pink-100">
                <Label className="text-[6px] font-bold block text-pink-900">54 PRIOR PAYMENTS</Label>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">A</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 text-right bg-white" />
                </div>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">B</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 text-right bg-white" />
                </div>
                <div className="flex gap-0.5">
                  <span className="text-[6px] w-4 font-bold">C</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 text-right bg-white" />
                </div>
              </div>

              {/* Field 55 */}
              <div className="border-b border-black p-1">
                <Label className="text-[6px] font-bold block">55 EST AMOUNT DUE</Label>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">A</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 text-right" />
                </div>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">B</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 text-right" />
                </div>
                <div className="flex gap-0.5">
                  <span className="text-[6px] w-4 font-bold">C</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5 text-right" />
                </div>
              </div>

              {/* Field 56 - Pink */}
              <div className="border-b border-black p-1 bg-pink-100">
                <Label className="text-[6px] font-bold block text-pink-900">56 NATIONAL PROVIDER IDENTIFIER</Label>
                <Input className="h-4 text-[7px] border-0 p-0.5 mt-0.5 bg-white" />
              </div>

              {/* Field 57 */}
              <div className="border-b border-black p-1">
                <Label className="text-[6px] font-bold block">57 OTHER PROVIDER ID</Label>
                <div className="flex gap-0.5 mt-0.5">
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" />
                  <Input className="h-4 text-[7px] w-16 border-0 p-0.5" placeholder="Qual" />
                </div>
              </div>

              {/* Fields 58-59 */}
              <div className="flex border-b border-black">
                <div className="flex-1 border-r border-black p-1">
                  <Label className="text-[6px] font-bold block">58 INSURED'S NAME</Label>
                  <div className="flex gap-0.5 mb-0.5">
                    <span className="text-[6px] w-4">A</span>
                    <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" />
                  </div>
                  <div className="flex gap-0.5 mb-0.5">
                    <span className="text-[6px] w-4">B</span>
                    <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" />
                  </div>
                  <div className="flex gap-0.5">
                    <span className="text-[6px] w-4">C</span>
                    <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" />
                  </div>
                </div>
                <div className="w-12 p-1">
                  <Label className="text-[6px] font-bold block">59 P REL</Label>
                  <div className="mb-1.5"><Input className="h-4 text-[7px] border-0 p-0.5 text-center" /></div>
                  <div className="mb-1.5"><Input className="h-4 text-[7px] border-0 p-0.5 text-center" /></div>
                  <div><Input className="h-4 text-[7px] border-0 p-0.5 text-center" /></div>
                </div>
              </div>

              {/* Field 60 */}
              <div className="border-b border-black p-1">
                <Label className="text-[6px] font-bold block">60 INSURED'S UNIQUE ID</Label>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">A</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" />
                </div>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">B</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" />
                </div>
                <div className="flex gap-0.5">
                  <span className="text-[6px] w-4 font-bold">C</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" />
                </div>
              </div>

              {/* Field 61 */}
              <div className="border-b border-black p-1">
                <Label className="text-[6px] font-bold block">61 GROUP NAME</Label>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">A</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" />
                </div>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">B</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" />
                </div>
                <div className="flex gap-0.5">
                  <span className="text-[6px] w-4 font-bold">C</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" />
                </div>
              </div>

              {/* Field 62 */}
              <div className="border-b border-black p-1">
                <Label className="text-[6px] font-bold block">62 INSURANCE GROUP NO</Label>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">A</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" />
                </div>
                <div className="flex gap-0.5 mb-0.5">
                  <span className="text-[6px] w-4 font-bold">B</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" />
                </div>
                <div className="flex gap-0.5">
                  <span className="text-[6px] w-4 font-bold">C</span>
                  <Input className="h-4 text-[7px] flex-1 border-0 p-0.5" />
                </div>
              </div>

              {/* Fields 63-65 */}
              <div className="border-b border-black p-1">
                <Label className="text-[6px] font-bold block">63 TREATMENT AUTHORIZATION CODES</Label>
                <Input className="h-4 text-[7px] border-0 p-0.5 mb-0.5" />
                <Label className="text-[6px] font-bold block mt-1">64 DOCUMENT CONTROL NUMBER</Label>
                <Input className="h-4 text-[7px] border-0 p-0.5 mb-0.5" />
                <Label className="text-[6px] font-bold block mt-1">65 EMPLOYER NAME</Label>
                <Input className="h-4 text-[7px] border-0 p-0.5" />
              </div>

              {/* Fields 66-67 */}
              <div className="flex border-b border-black">
                <div className="flex-1 border-r border-black p-1">
                  <Label className="text-[6px] font-bold block">66 DX</Label>
                  <Input className="h-4 text-[7px] border-0 p-0.5 mt-0.5" />
                </div>
                <div className="w-12 p-1">
                  <Label className="text-[6px] font-bold block">67 PRIN PROC</Label>
                  <Input className="h-4 text-[7px] border-0 p-0.5 mt-0.5" />
                </div>
              </div>

              {/* Fields 68-75 */}
              <div className="border-b border-black p-1">
                <Label className="text-[6px] font-bold block mb-1">68-75 OTHER DIAGNOSIS CODE & QUAL</Label>
                <div className="grid grid-cols-4 gap-0.5">
                  {[68,69,70,71,72,73,74,75].map((n) => (
                    <div key={n} className="flex flex-col">
                      <Label className="text-[5px] text-center">{n}</Label>
                      <div className="flex gap-px">
                        <Input className="h-4 text-[6px] w-5 border border-black p-0 text-center" maxLength={1} />
                        <Input className="h-4 text-[6px] flex-1 border border-black p-0 text-center" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fields 76-77 */}
              <div className="flex border-b border-black">
                <div className="flex-1 border-r border-black p-1">
                  <Label className="text-[6px] font-bold block">76 ADMITTING DIAGNOSIS</Label>
                  <Input className="h-4 text-[7px] border-0 p-0.5 mt-0.5" />
                </div>
                <div className="w-10 p-1">
                  <Label className="text-[6px] font-bold block">77 QUAL</Label>
                  <Input className="h-4 text-[7px] border-0 p-0.5 mt-0.5 text-center" />
                </div>
              </div>

              {/* Field 78 */}
              <div className="border-b border-black p-1">
                <Label className="text-[6px] font-bold block">78 UNLABELED</Label>
                <Input className="h-4 text-[7px] border-0 p-0.5 mt-0.5" />
              </div>

              {/* Fields 79-81 */}
              <div className="p-1">
                <Label className="text-[6px] font-bold block">79 PROCEDURE CODE</Label>
                <div className="grid grid-cols-3 gap-0.5 mb-2">
                  {['a','b','c','d','e','f'].map((l) => (
                    <div key={l} className="flex flex-col">
                      <Label className="text-[5px] text-center">{l}</Label>
                      <div className="flex gap-px">
                        <Input className="h-4 text-[6px] flex-1 border border-black p-0 text-center" />
                        <Input type="date" className="h-4 text-[5px] w-16 border border-black p-0" />
                      </div>
                    </div>
                  ))}
                </div>
                <Label className="text-[6px] font-bold block mt-2">80 REMARKS</Label>
                <textarea className="w-full h-12 text-[7px] border border-black p-0.5 resize-none" />
                <Label className="text-[6px] font-bold block mt-1">81 CC CODE</Label>
                <div className="grid grid-cols-4 gap-0.5 mt-0.5">
                  {['a','b','c','d'].map((l) => (
                    <Input key={l} className="h-4 text-[7px] border border-black p-0 text-center" maxLength={2} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={handleSaveDraft}>
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
        <Button onClick={handleSubmit}>
          <Send className="w-4 h-4 mr-2" />
          Submit Claim
        </Button>
      </div>
    </div>
  );
};

export default UB04Form;
