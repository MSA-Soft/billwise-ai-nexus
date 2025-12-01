import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const CompanySelectionPage: React.FC = () => {
  const { userCompanies, currentCompany, setCurrentCompany, companyLoading, refreshCompanies } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user has a company already selected, redirect to dashboard
    if (currentCompany && !companyLoading) {
      navigate('/');
    }
  }, [currentCompany, companyLoading, navigate]);

  const handleSelectCompany = async (companyId: string) => {
    try {
      await setCurrentCompany(companyId);
      toast.success('Company selected successfully');
      navigate('/');
      // Reload to refresh all data with new company context
      window.location.reload();
    } catch (error: any) {
      console.error('Error selecting company:', error);
      toast.error(error.message || 'Failed to select company');
    }
  };

  if (companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Loading Companies...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userCompanies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
            </div>
            <CardTitle className="text-center">No Company Access</CardTitle>
            <CardDescription className="text-center">
              You don't have access to any companies yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Please contact your administrator to be added to a company.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                refreshCompanies();
                setTimeout(() => window.location.reload(), 1000);
              }}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userCompanies.length === 1) {
    // Auto-select if only one company
    const company = userCompanies[0].company;
    if (company && currentCompany?.id !== company.id) {
      handleSelectCompany(company.id);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-center">Loading...</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Select a Company</CardTitle>
          <CardDescription className="text-center">
            Choose which company you want to access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {userCompanies.map((companyUser) => {
              const company = companyUser.company;
              if (!company) return null;

              return (
                <Card
                  key={company.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    currentCompany?.id === company.id
                      ? 'ring-2 ring-primary'
                      : ''
                  }`}
                  onClick={() => handleSelectCompany(company.id)}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {companyUser.role} • {company.subscription_tier || 'basic'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {company.email && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {company.email}
                      </p>
                    )}
                    {companyUser.is_primary && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        Primary
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySelectionPage;

