import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RecentActivityPage: React.FC = () => {
  return (
    <Layout currentPage="recent-activity">
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Recent activity will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RecentActivityPage;

