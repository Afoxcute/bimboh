'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatternRecognitionService, PatternDetection, PatternInsight, PatternSummary } from '@/lib/services/pattern-recognition-service';
import { BackendIntegrationService } from '@/lib/services/backend-integration-service';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  BarChart3, 
  Play, 
  RefreshCw,
  Eye,
  Lightbulb,
  Zap
} from 'lucide-react';

interface PatternRecognitionCardProps {
  className?: string;
}

export function PatternRecognitionCard({ className }: PatternRecognitionCardProps) {
  const [patternSummary, setPatternSummary] = useState<PatternSummary[]>([]);
  const [patternDetections, setPatternDetections] = useState<PatternDetection[]>([]);
  const [patternInsights, setPatternInsights] = useState<PatternInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Load pattern data
  const loadPatternData = async () => {
    setIsLoading(true);
    try {
      const [summary, detections, insights] = await Promise.all([
        PatternRecognitionService.getPatternSummary(),
        PatternRecognitionService.getPatternDetections({ limit: 10 }),
        PatternRecognitionService.getPatternInsights({ limit: 10 })
      ]);

      setPatternSummary(summary);
      setPatternDetections(detections);
      setPatternInsights(insights);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load pattern data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start pattern recognition
  const startPatternRecognition = async () => {
    setIsRunning(true);
    try {
      const response = await BackendIntegrationService.startPatternRecognition();
      if (response.success) {
        // Reload data after successful pattern recognition
        await loadPatternData();
      }
    } catch (error) {
      console.error('Failed to start pattern recognition:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadPatternData();
  }, []);

  const getPatternTypeIcon = (patternType: string) => {
    switch (patternType) {
      case 'volume_spike':
      case 'volume_trend':
        return <BarChart3 className="h-4 w-4" />;
      case 'sentiment_spike':
      case 'sentiment_trend':
        return <Brain className="h-4 w-4" />;
      case 'price_breakout':
      case 'price_reversal':
        return <TrendingUp className="h-4 w-4" />;
      case 'social_viral':
      case 'engagement_spike':
        return <Zap className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getPatternTypeColor = (patternType: string) => {
    switch (patternType) {
      case 'volume_spike':
      case 'volume_trend':
        return 'bg-blue-100 text-blue-800';
      case 'sentiment_spike':
      case 'sentiment_trend':
        return 'bg-green-100 text-green-800';
      case 'price_breakout':
      case 'price_reversal':
        return 'bg-purple-100 text-purple-800';
      case 'social_viral':
      case 'engagement_spike':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightTypeIcon = (insightType: string) => {
    switch (insightType) {
      case 'opportunity':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Lightbulb className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <div>
              <CardTitle>Pattern Recognition</CardTitle>
              <CardDescription>
                AI-powered pattern detection and analysis
              </CardDescription>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPatternData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              size="sm"
              onClick={startPatternRecognition}
              disabled={isRunning}
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? 'Running...' : 'Start Analysis'}
            </Button>
          </div>
        </div>
        {lastUpdate && (
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="detections">Detections</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patternSummary.map((summary) => (
                <div key={summary.pattern_type} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getPatternTypeIcon(summary.pattern_type)}
                      <span className="font-medium capitalize">
                        {summary.pattern_type.replace('_', ' ')}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {summary.detection_count} detected
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Avg Strength</span>
                      <span>{(summary.avg_strength * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={summary.avg_strength * 100} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Avg Confidence</span>
                      <span>{(summary.avg_confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={summary.avg_confidence * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
            {patternSummary.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pattern data available</p>
                <p className="text-sm">Run pattern recognition to detect patterns</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="detections" className="space-y-4">
            <div className="space-y-3">
              {patternDetections.map((detection) => (
                <div key={detection.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getPatternTypeIcon(detection.pattern_type)}
                      <span className="font-medium">{detection.token_symbol}</span>
                      <Badge className={getPatternTypeColor(detection.pattern_type)}>
                        {detection.pattern_name}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        Strength: {(detection.pattern_strength * 100).toFixed(1)}%
                      </Badge>
                      <Badge variant="outline">
                        Confidence: {(detection.pattern_confidence * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Detected: {new Date(detection.detected_at).toLocaleString()}</span>
                    <span className={detection.is_active ? 'text-green-600' : 'text-gray-500'}>
                      {detection.is_active ? 'Active' : 'Expired'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {patternDetections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pattern detections available</p>
                <p className="text-sm">Run pattern recognition to detect patterns</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="space-y-3">
              {patternInsights.map((insight) => (
                <div key={insight.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-2">
                      {getInsightTypeIcon(insight.insight_type)}
                      <div>
                        <h4 className="font-medium">{insight.insight_title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {insight.insight_description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        Confidence: {(insight.confidence_score * 100).toFixed(1)}%
                      </Badge>
                      <Badge variant="outline">
                        Impact: {(insight.impact_score * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  {insight.recommendation && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>Token: {insight.token_symbol}</span>
                    <span>Created: {new Date(insight.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
            {patternInsights.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pattern insights available</p>
                <p className="text-sm">Run pattern recognition to generate insights</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
