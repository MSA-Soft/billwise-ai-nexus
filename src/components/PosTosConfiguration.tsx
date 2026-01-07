import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, MapPin } from "lucide-react";

interface CodeRow {
  id: string;
  code: string;
  description: string;
  is_active: boolean;
}

export const PosTosConfiguration: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [posRows, setPosRows] = useState<CodeRow[]>([]);
  const [tosRows, setTosRows] = useState<CodeRow[]>([]);
  const [newPos, setNewPos] = useState({ code: "", description: "" });
  const [newTos, setNewTos] = useState({ code: "", description: "" });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [{ data: posData, error: posError }, { data: tosData, error: tosError }] =
        await Promise.all([
          supabase.from("place_of_service_codes" as any).select("id, code, description, is_active").order("code", { ascending: true }),
          supabase.from("type_of_service_codes" as any).select("id, code, description, is_active").order("code", { ascending: true }),
        ]);

      if (posError) throw posError;
      if (tosError) throw tosError;

      setPosRows((posData || []) as any);
      setTosRows((tosData || []) as any);
    } catch (error: any) {
      console.error("Error loading POS/TOS codes:", error);
      toast({
        title: "Error loading codes",
        description: error.message || "Unable to load POS/TOS configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addPos = async () => {
    if (!newPos.code.trim() || !newPos.description.trim()) {
      toast({ title: "Missing data", description: "Code and description are required.", variant: "destructive" });
      return;
    }
    try {
      const { data, error } = await supabase
        .from("place_of_service_codes" as any)
        .insert({ code: newPos.code.trim(), description: newPos.description.trim(), is_active: true })
        .select()
        .single();
      if (error) throw error;
      setPosRows(prev => [...prev, data as any]);
      setNewPos({ code: "", description: "" });
      toast({ title: "POS added", description: "Place of service code saved." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to add POS.", variant: "destructive" });
    }
  };

  const addTos = async () => {
    if (!newTos.code.trim() || !newTos.description.trim()) {
      toast({ title: "Missing data", description: "Code and description are required.", variant: "destructive" });
      return;
    }
    try {
      const { data, error } = await supabase
        .from("type_of_service_codes" as any)
        .insert({ code: newTos.code.trim(), description: newTos.description.trim(), is_active: true })
        .select()
        .single();
      if (error) throw error;
      setTosRows(prev => [...prev, data as any]);
      setNewTos({ code: "", description: "" });
      toast({ title: "TOS added", description: "Type of service code saved." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to add TOS.", variant: "destructive" });
    }
  };

  const toggleActive = async (table: "place_of_service_codes" | "type_of_service_codes", id: string, active: boolean) => {
    try {
      const { error } = await supabase.from(table as any).update({ is_active: active }).eq("id", id);
      if (error) throw error;
      if (table === "place_of_service_codes") {
        setPosRows(prev => prev.map(r => (r.id === id ? { ...r, is_active: active } : r)));
      } else {
        setTosRows(prev => prev.map(r => (r.id === id ? { ...r, is_active: active } : r)));
      }
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message || "Unable to update status.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            POS &amp; TOS Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Manage the configured <strong>Place of Service (POS)</strong> and <strong>Type of Service (TOS)</strong> codes
            used in Eligibility Verification and claims.
          </p>

          {/* POS */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              Place of Service (POS)
            </h3>
            <div className="flex gap-2 items-end">
              <div className="w-24">
                <Label htmlFor="newPosCode">Code</Label>
                <Input
                  id="newPosCode"
                  value={newPos.code}
                  onChange={(e) => setNewPos(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="11"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="newPosDesc">Description</Label>
                <Input
                  id="newPosDesc"
                  value={newPos.description}
                  onChange={(e) => setNewPos(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Office"
                />
              </div>
              <Button onClick={addPos} disabled={isLoading}>
                Add POS
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-32 text-center">Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.code}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={row.is_active}
                          onCheckedChange={(checked) => toggleActive("place_of_service_codes", row.id, checked as boolean)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {posRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-3">
                        No POS configured yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* TOS */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-semibold">Type of Service (TOS)</h3>
            <div className="flex gap-2 items-end">
              <div className="w-24">
                <Label htmlFor="newTosCode">Code</Label>
                <Input
                  id="newTosCode"
                  value={newTos.code}
                  onChange={(e) => setNewTos(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="newTosDesc">Description</Label>
                <Input
                  id="newTosDesc"
                  value={newTos.description}
                  onChange={(e) => setNewTos(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Medical Care"
                />
              </div>
              <Button onClick={addTos} disabled={isLoading}>
                Add TOS
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-32 text-center">Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tosRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.code}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={row.is_active}
                          onCheckedChange={(checked) => toggleActive("type_of_service_codes", row.id, checked as boolean)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {tosRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-3">
                        No TOS configured yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


