import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  FileText,
  Shield,
  Zap,
  Target,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService, type AIAnalysis } from '@/services/aiService';

interface CompletenessCheckerProps {
  authorizationData: any;
  onAnalysisComplete?: (analysis: AIAnalysis) => void;
  showActions?: boolean;
}

export function CompletenessChecker({
  authorizationData,
  onAnalysisComplete,
  showActions = true,
}: CompletenessCheckerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  useEffect(() => {
    if (authorizationData) {
      runAnalysis();
    }
  }, [authorizationData]);

  const runAnalysis = async () => {
    try {
      setLoading(true);
      const result = await aiService.analyzeAuthorizationRequest(authorizationData);
      setAnalysis(result);
      setLastAnalyzed(new Date());
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (error: any) {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Unable to analyze authorization request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 75) return 'bg-blue-100 text-blue-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getCompletenessLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', icon: CheckCircle, color: 'text-green-600' };
    if (score >= 75) return { level: 'Good', icon: CheckCircle, color: 'text-blue-600' };
    if (score >= 60) return { level: 'Fair', icon: AlertTriangle, color: 'text-yellow-600' };
    return { level: 'Poor', icon: XCircle, color: 'text-red-600' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Analyzing completeness...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No analysis available</p>
            {showActions && (
              <Button onClick={runAnalysis} className="mt-4">
                <Zap className="h-4 w-4 mr-2" />
                Run Analysis
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const completeness = getCompletenessLevel(analysis.score);
  const CompletenessIcon = completeness.icon;
  const approvalProbability = (analysis as any).approvalProbability || 0;

  return (
    <div className="space-y-4">
      {/* Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              AI Completeness Analysis
            </CardTitle>
            {lastAnalyzed && (
              <span className="text-xs text-muted-foreground">
                Analyzed {lastAnalyzed.toLocaleTimeString()}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <CompletenessIcon className={`h-8 w-8 ${completeness.color}`} />
              <div>
                <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}
                </div>
                <div className="text-sm text-muted-foreground">out of 100</div>
              </div>
            </div>
            <Badge className={getScoreBadge(analysis.score)}>
              {completeness.level} Completeness
            </Badge>
            <div className="mt-4">
              <Progress value={analysis.score} className="h-3" />
            </div>
          </div>

          {/* Approval Probability */}
          {approvalProbability > 0 && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Estimated Approval Probability</span>
                <span className="text-2xl font-bold text-blue-600">{approvalProbability}%</span>
              </div>
              <Progress value={approvalProbability} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Based on completeness score and payer history
              </p>
            </div>
          )}

          {/* Critical Issues */}
          {(analysis as any).criticalIssues && (analysis as any).criticalIssues.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Critical Issues Found</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside mt-2">
                  {(analysis as any).criticalIssues.map((issue: string, index: number) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Missing Elements */}
          {analysis.missingElements.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Missing Required Elements ({analysis.missingElements.length})
              </h4>
              <div className="space-y-2">
                {analysis.missingElements.map((element, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className="text-sm">{element}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                Recommendations ({analysis.recommendations.length})
              </h4>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                    <Lightbulb className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Actions */}
          {analysis.suggestedActions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                Suggested Actions ({analysis.suggestedActions.length})
              </h4>
              <div className="space-y-2">
                {analysis.suggestedActions.map((action, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                    <Target className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {analysis.score >= 90 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Excellent!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your authorization request is well-documented and ready for submission.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={runAnalysis} variant="outline" className="flex-1">
                <Zap className="h-4 w-4 mr-2" />
                Re-analyze
              </Button>
              {analysis.score < 80 && (
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <FileText className="h-4 w-4 mr-2" />
                  View Missing Items
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

