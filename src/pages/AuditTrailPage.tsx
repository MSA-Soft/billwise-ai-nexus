import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuditTrailPage: React.FC = () => {
  return (
    <Layout currentPage="audit-trail">
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Audit trail will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AuditTrailPage;

