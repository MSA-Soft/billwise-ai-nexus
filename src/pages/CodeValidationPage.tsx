import React from 'react';
import Layout from '@/components/Layout';
import CodeValidation from '@/components/CodeValidation';

const CodeValidationPage: React.FC = () => {
  return (
    <Layout currentPage="code-validation">
      <CodeValidation />
    </Layout>
  );
};

export default CodeValidationPage;

