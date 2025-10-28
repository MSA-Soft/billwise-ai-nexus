import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  BarChart3
} from 'lucide-react';

interface ClaimData {
  id: string;
  claimNumber: string;
  patient: string;
  provider: string;
  dateOfService: string;
  amount: number;
  status: string;
  formType: string;
  insuranceProvider: string;
  submissionDate: string;
  cptCodes: string[];
  icdCodes: string[];
}

interface AIAnalysisPanelProps {
  claims: ClaimData[];
}

export function AIAnalysisPanel({ claims }: AIAnalysisPanelProps) {
  const deniedClaims = claims.filter(claim => claim.status === 'denied');
  const totalClaims = claims.length;

  // Mock AI insights
  const aiInsights = {
    denialRiskScore: 23,
    topRiskFactors: [
      { factor: 'Missing Prior Authorization', risk: 85, count: 12 },
      { factor: 'Incomplete Documentation', risk: 72, count: 8 },
      { factor: 'Incorrect Coding', risk: 45, count: 5 },
      { factor: 'Duplicate Claims', risk: 38, count: 3 },
      { factor: 'Timely Filing', risk: 25, count: 2 }
    ],
    optimizationSuggestions: [
      'Implement prior auth checking before service delivery',
      'Standardize documentation templates for common procedures',
      'Regular coding accuracy training for staff',
      'Set up automated eligibility verification',
      'Implement duplicate claim detection system'
    ],
    trendAnalysis: {
      weeklyDenialTrend: -12, // 12% decrease
      costImpact: '$15,420',
      timeToAppeal: '8.5 days average'
    },
    predictiveInsights: [
      {
        insight: 'High-risk claims identified',
        description: '3 claims flagged for potential denial based on historical patterns',
        confidence: 87,
        action: 'Review documentation before submission'
      },
      {
        insight: 'Coding pattern anomaly',
        description: 'Unusual frequency of modifier usage detected',
        confidence: 73,
        action: 'Audit recent coding practices'
      },
      {
        insight: 'Insurance verification gap',
        description: '15% of claims lack proper insurance verification',
        confidence: 91,
        action: 'Implement automated verification workflow'
      }
    ]
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-600';
    if (risk >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* AI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Risk Score</p>
                <p className="text-2xl font-bold text-green-600">{aiInsights.denialRiskScore}%</p>
                <p className="text-xs text-gray-500">Low Risk</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Weekly Trend</p>
                <p className="text-2xl font-bold text-green-600">
                  {aiInsights.trendAnalysis.weeklyDenialTrend > 0 ? '+' : ''}
                  {aiInsights.trendAnalysis.weeklyDenialTrend}%
                </p>
                <p className="text-xs text-gray-500">Denial Rate</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cost Impact</p>
                <p className="text-2xl font-bold text-orange-600">{aiInsights.trendAnalysis.costImpact}</p>
                <p className="text-xs text-gray-500">Monthly Denials</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Factors Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Top Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiInsights.topRiskFactors.map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{factor.factor}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold ${getRiskColor(factor.risk)}`}>
                        {factor.risk}%
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {factor.count} claims
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={factor.risk} 
                    className="h-2"
                    style={{
                      backgroundColor: factor.risk >= 70 ? '#fef2f2' : factor.risk >= 40 ? '#fffbeb' : '#f0fdf4'
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Optimization Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.optimizationSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{suggestion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Predictive Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.predictiveInsights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{insight.insight}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getConfidenceColor(insight.confidence)}`}
                      >
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500">Recommended Action:</span>
                      <span className="text-xs text-blue-600">{insight.action}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Take Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">AI Accuracy</p>
              <p className="text-2xl font-bold text-green-600">94.2%</p>
              <p className="text-xs text-gray-500">Prediction accuracy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Processing Time</p>
              <p className="text-2xl font-bold text-blue-600">2.3s</p>
              <p className="text-xs text-gray-500">Average analysis time</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Claims Analyzed</p>
              <p className="text-2xl font-bold text-purple-600">{totalClaims}</p>
              <p className="text-xs text-gray-500">This session</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

