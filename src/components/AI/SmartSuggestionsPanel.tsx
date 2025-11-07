import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Lightbulb,
  FileText,
  Building,
  Code,
  Clock,
  AlertCircle,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { aiService } from '@/services/aiService';
import type { AIAnalysis } from '@/services/aiService';

interface SmartSuggestionsPanelProps {
  authorizationData: any;
  analysis?: AIAnalysis;
  onSuggestionClick?: (suggestion: string, category: string) => void;
}

export function SmartSuggestionsPanel({
  authorizationData,
  analysis,
  onSuggestionClick,
}: SmartSuggestionsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);

  useEffect(() => {
    loadSuggestions();
  }, [authorizationData, analysis]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const result = await aiService.generateSmartSuggestions(authorizationData, analysis || undefined);
      setSuggestions(result);
    } catch (error: any) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Generating smart suggestions...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions) {
    return null;
  }

  const totalSuggestions = 
    suggestions.documentationSuggestions.length +
    suggestions.improvementSuggestions.length +
    suggestions.payerSpecificSuggestions.length +
    suggestions.codeSuggestions.length +
    suggestions.urgencySuggestions.length;

  return (
    <div className="space-y-4">
      {/* Priority Actions */}
      {suggestions.priorityActions.length > 0 && (
        <Alert variant="destructive" className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Priority Actions</AlertTitle>
          <AlertDescription className="text-orange-700">
            <ul className="list-disc list-inside mt-2 space-y-1">
              {suggestions.priorityActions.map((action: string, index: number) => (
                <li key={index} className="font-medium">{action}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-600" />
            AI Smart Suggestions
            <Badge variant="secondary" className="ml-2">
              {totalSuggestions} suggestions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Documentation Suggestions */}
          {suggestions.documentationSuggestions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Documentation ({suggestions.documentationSuggestions.length})
              </h4>
              <div className="space-y-2">
                {suggestions.documentationSuggestions.map((suggestion: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-blue-50 rounded hover:bg-blue-100 cursor-pointer transition-colors"
                    onClick={() => onSuggestionClick?.(suggestion, 'documentation')}
                  >
                    <FileText className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm flex-1">{suggestion}</span>
                    <ArrowRight className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Suggestions */}
          {suggestions.improvementSuggestions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                Improvements ({suggestions.improvementSuggestions.length})
              </h4>
              <div className="space-y-2">
                {suggestions.improvementSuggestions.map((suggestion: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-yellow-50 rounded hover:bg-yellow-100 cursor-pointer transition-colors"
                    onClick={() => onSuggestionClick?.(suggestion, 'improvement')}
                  >
                    <Lightbulb className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm flex-1">{suggestion}</span>
                    <ArrowRight className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payer-Specific Suggestions */}
          {suggestions.payerSpecificSuggestions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-600" />
                Payer-Specific ({suggestions.payerSpecificSuggestions.length})
              </h4>
              <div className="space-y-2">
                {suggestions.payerSpecificSuggestions.map((suggestion: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-purple-50 rounded hover:bg-purple-100 cursor-pointer transition-colors"
                    onClick={() => onSuggestionClick?.(suggestion, 'payer')}
                  >
                    <Building className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm flex-1">{suggestion}</span>
                    <ArrowRight className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Suggestions */}
          {suggestions.codeSuggestions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Code className="h-4 w-4 text-green-600" />
                Code Suggestions ({suggestions.codeSuggestions.length})
              </h4>
              <div className="space-y-2">
                {suggestions.codeSuggestions.map((suggestion: string, index: number) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 p-2 rounded hover:opacity-80 cursor-pointer transition-colors ${
                      suggestion.startsWith('✅') 
                        ? 'bg-green-50' 
                        : 'bg-orange-50'
                    }`}
                    onClick={() => onSuggestionClick?.(suggestion, 'code')}
                  >
                    {suggestion.startsWith('✅') ? (
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Code className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-sm flex-1">{suggestion}</span>
                    {!suggestion.startsWith('✅') && (
                      <ArrowRight className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Urgency Suggestions */}
          {suggestions.urgencySuggestions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                Urgency ({suggestions.urgencySuggestions.length})
              </h4>
              <div className="space-y-2">
                {suggestions.urgencySuggestions.map((suggestion: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-indigo-50 rounded hover:bg-indigo-100 cursor-pointer transition-colors"
                    onClick={() => onSuggestionClick?.(suggestion, 'urgency')}
                  >
                    <Clock className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm flex-1">{suggestion}</span>
                    <ArrowRight className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Suggestions */}
          {totalSuggestions === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold mb-2">Excellent!</h3>
              <p className="text-muted-foreground">
                No additional suggestions. Your authorization request is well-prepared.
              </p>
            </div>
          )}

          {/* Refresh Button */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={loadSuggestions}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Refresh Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

