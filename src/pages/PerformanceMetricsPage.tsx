import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PerformanceMetricsPage: React.FC = () => {
  return (
    <Layout currentPage="performance-metrics">
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Performance metrics will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PerformanceMetricsPage;

