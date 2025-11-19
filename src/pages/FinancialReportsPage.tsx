import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FinancialReportsPage: React.FC = () => {
  return (
    <Layout currentPage="financial-reports">
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Financial reports will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FinancialReportsPage;

