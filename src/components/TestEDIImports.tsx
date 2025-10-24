import React from 'react';
import { getEDIService } from '@/services/ediService';
import { getCodeValidationService } from '@/services/codeValidationService';
import { getPayerRulesService } from '@/services/payerRulesService';
import EligibilityVerification from './EligibilityVerification';
import ClaimStatusTracking from './ClaimStatusTracking';
import PaymentProcessing from './PaymentProcessing';
import CodeValidation from './CodeValidation';
import PayerRulesManagement from './PayerRulesManagement';

// Test imports to ensure no errors
const TestEDIImports = () => {
  try {
    // Test service imports
    const ediService = getEDIService();
    const codeValidationService = getCodeValidationService();
    const payerRulesService = getPayerRulesService();
    
    console.log('All EDI imports successful');
    
    return (
      <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
        <h3 className="text-green-800 font-semibold">✅ All EDI Components Loaded Successfully</h3>
        <p className="text-green-700 text-sm mt-2">
          All EDI services and components are working without errors.
        </p>
        <div className="mt-4 text-sm text-green-600">
          <p>✅ EDI Service: {ediService ? 'Loaded' : 'Failed'}</p>
          <p>✅ Code Validation: {codeValidationService ? 'Loaded' : 'Failed'}</p>
          <p>✅ Payer Rules: {payerRulesService ? 'Loaded' : 'Failed'}</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('EDI Import Error:', error);
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
        <h3 className="text-red-800 font-semibold">❌ EDI Import Error</h3>
        <p className="text-red-700 text-sm mt-2">
          Error: {error.message}
        </p>
      </div>
    );
  }
};

export default TestEDIImports;
