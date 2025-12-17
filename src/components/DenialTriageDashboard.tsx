import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { denialManagementService } from '@/services/denialManagementService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Sparkles, FileText, ClipboardList, AlertTriangle } from 'lucide-react';

type DenialRow = any;
type ClaimRow = any;

function toNumber(v: any): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '0'));
  return Number.isFinite(n) ? n : 0;
}

export function DenialTriageDashboard() {
  const { currentCompany } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [denials, setDenials] = useState<Array<{ denial: DenialRow; claim: ClaimRow | null }>>([]);
  const [search, setSearch] = useState('');

  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<any | null>(null);
  const [triageError, setTriageError] = useState<string | null>(null);

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [selected, setSelected] = useState<{ denial: DenialRow; claim: ClaimRow | null } | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [appealLoading, setAppealLoading] = useState(false);
  const [appealLetter, setAppealLetter] = useState<string | null>(null);

  useEffect(() => {
    const fetchDenials = async () => {
      setLoading(true);
      try {
        // Try company-scoped query first (if column exists), then fall back.
        const baseQuery = supabase
          .from('claim_denials' as any)
          .select('*')
          .order('denial_date', { ascending: false })
          .limit(200);

        let denialData: any[] | null = null;
        let denialError: any | null = null;

        if (currentCompany?.id) {
          const { data, error } = await (baseQuery as any).or(
            `company_id.eq.${currentCompany.id},company_id.is.null`,
          );
          denialData = data;
          denialError = error;
        } else {
          const { data, error } = await baseQuery;
          denialData = data;
          denialError = error;
        }

        if (denialError) {
          // Fallback without company filter (handles schemas without company_id)
          const { data, error } = await supabase
            .from('claim_denials' as any)
            .select('*')
            .order('denial_date', { ascending: false })
            .limit(200);
          denialData = data;
          denialError = error;
        }

        if (denialError) throw denialError;

        const claimIds = Array.from(
          new Set((denialData || []).map((d: any) => d.claim_id).filter(Boolean)),
        );

        const [claimsResult, professionalClaimsResult] = await Promise.all([
          claimIds.length
            ? supabase.from('claims' as any).select('*').in('id', claimIds)
            : Promise.resolve({ data: [], error: null }),
          claimIds.length
            ? supabase.from('professional_claims' as any).select('*').in('id', claimIds)
            : Promise.resolve({ data: [], error: null }),
        ]);

        const claimsMap = new Map<string, any>();
        (claimsResult.data || []).forEach((c: any) => claimsMap.set(c.id, c));
        (professionalClaimsResult.data || []).forEach((c: any) => claimsMap.set(c.id, c));

        setDenials(
          (denialData || []).map((d: any) => ({
            denial: d,
            claim: d.claim_id ? claimsMap.get(d.claim_id) ?? null : null,
          })),
        );
      } catch (e: any) {
        toast({
          title: 'Failed to load denials',
          description: e?.message || 'Could not fetch denial records',
          variant: 'destructive',
        });
        setDenials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDenials();
  }, [currentCompany?.id, toast]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return denials;
    return denials.filter(({ denial, claim }) => {
      const denialCode = String(denial?.denial_code ?? denial?.denialCode ?? '').toLowerCase();
      const denialReason = String(denial?.denial_reason ?? denial?.denialReason ?? '').toLowerCase();
      const claimNumber = String(claim?.claim_number ?? claim?.claimNumber ?? claim?.id ?? '').toLowerCase();
      const patientName = String(claim?.patient_name ?? claim?.patientName ?? '').toLowerCase();
      return (
        denialCode.includes(s) ||
        denialReason.includes(s) ||
        claimNumber.includes(s) ||
        patientName.includes(s)
      );
    });
  }, [denials, search]);

  const totals = useMemo(() => {
    const totalDenials = filtered.length;
    const totalDeniedAmount = filtered.reduce((sum, r) => {
      const amt = toNumber(r.denial?.denied_amount ?? r.denial?.amount ?? 0);
      return sum + amt;
    }, 0);
    return { totalDenials, totalDeniedAmount };
  }, [filtered]);

  const runTriage = async () => {
    setTriageLoading(true);
    setTriageError(null);
    try {
      const payload = filtered.slice(0, 80).map(({ denial, claim }) => ({
        denialId: String(denial?.id ?? ''),
        claimId: String(denial?.claim_id ?? claim?.id ?? ''),
        denialCode: denial?.denial_code ?? '',
        denialReason: denial?.denial_reason ?? '',
        amount: toNumber(denial?.denied_amount ?? 0),
        payerName: claim?.payer_name ?? claim?.payer ?? claim?.insurance_provider ?? '',
        procedureCodes: claim?.procedure_codes ?? claim?.cpt_codes ?? [],
        diagnosisCodes: claim?.diagnosis_codes ?? claim?.icd_codes ?? [],
        denialDate: denial?.denial_date ?? denial?.created_at ?? null,
      }));

      const result = await aiService.triageDenials(payload);
      setTriageResult(result);
      toast({ title: 'Triage ready', description: 'AI queue + clusters generated.' });
    } catch (e: any) {
      const msg = e?.message || 'Failed to run triage';
      setTriageError(msg);
      toast({ title: 'Triage failed', description: msg, variant: 'destructive' });
    } finally {
      setTriageLoading(false);
    }
  };

  const openAnalysis = async (row: { denial: DenialRow; claim: ClaimRow | null }) => {
    setSelected(row);
    setAnalysis(null);
    setAppealLetter(null);
    setAnalysisLoading(true);
    try {
      const denialId = String(row.denial?.id ?? '');
      const claimId = String(row.denial?.claim_id ?? row.claim?.id ?? '');
      const result = await denialManagementService.analyzeDenial(denialId, claimId);
      setAnalysis(result);
    } catch (e: any) {
      toast({
        title: 'Analysis failed',
        description: e?.message || 'Could not analyze denial',
        variant: 'destructive',
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const generateAppeal = async () => {
    if (!selected) return;
    setAppealLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      if (!userId) throw new Error('You must be logged in to generate an appeal workflow');

      const denialId = String(selected.denial?.id ?? '');
      const claimId = String(selected.denial?.claim_id ?? selected.claim?.id ?? '');
      const wf = await denialManagementService.createAppealWorkflow(denialId, claimId, 'standard', userId);
      setAppealLetter(wf.appealLetter);
      toast({ title: 'Appeal draft created', description: 'Saved as a draft workflow.' });
    } catch (e: any) {
      toast({
        title: 'Appeal generation failed',
        description: e?.message || 'Could not generate appeal draft',
        variant: 'destructive',
      });
    } finally {
      setAppealLoading(false);
    }
  };

  const priorityBadge = (p: string) => {
    const v = String(p || '').toLowerCase();
    if (v === 'critical') return <Badge className="bg-red-100 text-red-800">CRITICAL</Badge>;
    if (v === 'high') return <Badge className="bg-orange-100 text-orange-800">HIGH</Badge>;
    if (v === 'medium') return <Badge className="bg-yellow-100 text-yellow-800">MEDIUM</Badge>;
    return <Badge variant="secondary">LOW</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Denial Triage
          </h2>
          <Badge variant="outline">{totals.totalDenials} denials</Badge>
          <Badge variant="outline">${totals.totalDeniedAmount.toFixed(2)} denied</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search claim, patient, code, reason…"
            className="w-80"
          />
          <Button type="button" variant="outline" onClick={runTriage} disabled={triageLoading || loading || filtered.length === 0}>
            {triageLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Triage…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Triage
              </>
            )}
          </Button>
        </div>
      </div>

      {triageError && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Triage error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-red-700">{triageError}</CardContent>
        </Card>
      )}

      {triageResult?.clusters && Array.isArray(triageResult.clusters) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>AI Priority Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.isArray(triageResult?.queue) && triageResult.queue.length > 0 ? (
                triageResult.queue.slice(0, 10).map((q: any, idx: number) => (
                  <div key={`${q?.denialId ?? idx}`} className="flex items-start justify-between gap-3 border rounded-md p-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {priorityBadge(q?.priority)}
                        <span className="text-sm font-medium">
                          Claim {String(q?.claimId ?? '').slice(0, 8)}
                        </span>
                        {q?.predictedSuccessProbability != null && (
                          <Badge variant="outline">{q.predictedSuccessProbability}% success</Badge>
                        )}
                        {q?.estimatedRecoveryAmount != null && (
                          <Badge variant="outline">${toNumber(q.estimatedRecoveryAmount).toFixed(2)} rec.</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{q?.rationale}</div>
                      {q?.nextBestAction && (
                        <div className="text-sm">
                          <span className="font-medium">Next:</span> {q.nextBestAction}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No queue returned.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clusters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {triageResult.clusters.slice(0, 6).map((c: any, idx: number) => (
                <div key={idx} className="border rounded-md p-3">
                  <div className="font-medium">{c?.label || 'Cluster'}</div>
                  <div className="text-sm text-muted-foreground">
                    {c?.count ?? 0} denials • ${toNumber(c?.estimatedRecoverableAmount).toFixed(2)} recoverable
                  </div>
                  {Array.isArray(c?.denialCodes) && c.denialCodes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {c.denialCodes.slice(0, 4).map((code: string) => (
                        <Badge key={code} variant="secondary">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {Array.isArray(c?.topFixes) && c.topFixes.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                      {c.topFixes.slice(0, 3).map((t: string, i: number) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Denied Claims</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading denials…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No denial records found.</div>
          ) : (
            <div className="space-y-2">
              {filtered.slice(0, 50).map((row) => {
                const denial = row.denial;
                const claim = row.claim;
                const code = String(denial?.denial_code ?? '');
                const reason = String(denial?.denial_reason ?? '');
                const amount = toNumber(denial?.denied_amount ?? 0);
                const claimNumber = String(claim?.claim_number ?? claim?.id ?? denial?.claim_id ?? '').slice(0, 18);
                const patientName = String(claim?.patient_name ?? claim?.patient ?? 'Unknown');
                return (
                  <div key={String(denial?.id)} className="border rounded-md p-3 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800">DENIED</Badge>
                        <span className="font-medium">{claimNumber}</span>
                        {code && <Badge variant="outline">{code}</Badge>}
                        <Badge variant="outline">${amount.toFixed(2)}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {patientName} {reason ? `• ${reason}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" onClick={() => openAnalysis(row)}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => (!o ? setSelected(null) : null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Denial Analysis
            </DialogTitle>
          </DialogHeader>

          {analysisLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing…
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground">Recovery probability</div>
                    <div className="text-lg font-semibold">{analysis?.estimatedRecoveryProbability ?? '—'}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground">Estimated recovery</div>
                    <div className="text-lg font-semibold">${toNumber(analysis?.estimatedRecoveryAmount).toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground">Appealability</div>
                    <div className="text-lg font-semibold">
                      {analysis?.appealability?.canAppeal ? 'Appealable' : 'Not appealable'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {analysis?.rootCause?.primary && (
                <div>
                  <div className="text-sm font-medium mb-1">Root cause</div>
                  <div className="text-sm text-muted-foreground">{analysis.rootCause.primary}</div>
                </div>
              )}

              {Array.isArray(analysis?.recommendedActions) && analysis.recommendedActions.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-1">Recommended actions</div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {analysis.recommendedActions.slice(0, 8).map((a: any, idx: number) => (
                      <li key={idx}>
                        <span className="font-medium">{a.action}</span> — {a.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
                <Button type="button" onClick={generateAppeal} disabled={appealLoading}>
                  {appealLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    'Generate Appeal Draft'
                  )}
                </Button>
              </div>

              {appealLetter && (
                <div className="border rounded-md p-3 bg-muted/30">
                  <div className="text-sm font-medium mb-2">Appeal letter (draft)</div>
                  <pre className="text-xs whitespace-pre-wrap">{appealLetter}</pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No analysis available.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

