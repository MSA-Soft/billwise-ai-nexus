import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { analytics } from '@/utils/analytics';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  errorRate: number;
  lastUpdated: string;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    errorRate: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(collectMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const collectMetrics = () => {
    const newMetrics: PerformanceMetrics = {
      loadTime: performance.now(),
      renderTime: performance.now(),
      memoryUsage: getMemoryUsage(),
      networkLatency: getNetworkLatency(),
      errorRate: getErrorRate(),
      lastUpdated: new Date().toISOString(),
    };

    setMetrics(newMetrics);

    // Send metrics to analytics
    analytics.trackPerformance('page_load_time', newMetrics.loadTime);
    analytics.trackPerformance('memory_usage', newMetrics.memoryUsage);
    analytics.trackPerformance('network_latency', newMetrics.networkLatency);
  };

  const getMemoryUsage = (): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return 0;
  };

  const getNetworkLatency = (): number => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      return navigation.responseEnd - navigation.requestStart;
    }
    return 0;
  };

  const getErrorRate = (): number => {
    // This would typically come from your error tracking service
    return 0;
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    collectMetrics();
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const refreshMetrics = () => {
    collectMetrics();
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }): string => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (value <= thresholds.warning) return <Clock className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance Monitor</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={isMonitoring ? 'default' : 'secondary'}>
              {isMonitoring ? 'Monitoring' : 'Stopped'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
            >
              {isMonitoring ? 'Stop' : 'Start'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshMetrics}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Load Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Load Time</span>
              {getStatusIcon(metrics.loadTime, { good: 1000, warning: 3000 })}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.loadTime, { good: 1000, warning: 3000 })}`}>
              {metrics.loadTime.toFixed(0)}ms
            </div>
          </div>

          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Memory Usage</span>
              {getStatusIcon(metrics.memoryUsage, { good: 50, warning: 100 })}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.memoryUsage, { good: 50, warning: 100 })}`}>
              {metrics.memoryUsage.toFixed(1)}MB
            </div>
          </div>

          {/* Network Latency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Network Latency</span>
              {getStatusIcon(metrics.networkLatency, { good: 200, warning: 500 })}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.networkLatency, { good: 200, warning: 500 })}`}>
              {metrics.networkLatency.toFixed(0)}ms
            </div>
          </div>

          {/* Error Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Error Rate</span>
              {getStatusIcon(metrics.errorRate, { good: 1, warning: 5 })}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.errorRate, { good: 1, warning: 5 })}`}>
              {metrics.errorRate.toFixed(1)}%
            </div>
          </div>

          {/* Last Updated */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Last Updated</span>
            <div className="text-sm text-muted-foreground">
              {new Date(metrics.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Performance Tips</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Keep load time under 1 second for optimal user experience</li>
            <li>• Monitor memory usage to prevent memory leaks</li>
            <li>• Optimize network requests to reduce latency</li>
            <li>• Keep error rate below 1% for production applications</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
