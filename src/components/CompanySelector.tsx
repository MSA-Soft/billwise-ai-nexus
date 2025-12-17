import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, Check, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const CompanySelector: React.FC = () => {
  const { currentCompany, userCompanies, setCurrentCompany, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('🏢 [CompanySelector] Current Company:', currentCompany);
    console.log('🏢 [CompanySelector] User Companies Count:', userCompanies.length);
    console.log('🏢 [CompanySelector] User Companies:', userCompanies.map(cu => ({
      id: cu.company_id,
      name: cu.company?.name,
      slug: cu.company?.slug,
      is_primary: cu.is_primary
    })));
    const displayName = currentCompany?.name || userCompanies[0]?.company?.name || 'Select Company';
    console.log('🏢 [CompanySelector] Display Name:', displayName);
    
    // Warn if showing "Default Company" when there might be better options
    if (displayName.toLowerCase() === 'default company' && userCompanies.length > 1) {
      console.warn('⚠️ [CompanySelector] Showing "Default Company" but user has', userCompanies.length, 'companies available');
    }
  }, [currentCompany, userCompanies]);

  const handleCompanyChange = async (companyId: string) => {
    try {
      setLoading(true);
      await setCurrentCompany(companyId);
      toast.success('Company switched successfully');
      // Do NOT hard-reload the SPA; it wipes in-progress work and can look like a "refresh" bug.
      // MainAppLayout will remount page components when the company changes (keyed by company id).
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Error switching company:', error);
      toast.error(error.message || 'Failed to switch company');
    } finally {
      setLoading(false);
    }
  };

  if (userCompanies.length === 0) {
    return null;
  }

  if (userCompanies.length === 1) {
    const companyName = currentCompany?.name || userCompanies[0]?.company?.name || 'No Company';
    // Warn if the only company is "Default Company"
    if (companyName.toLowerCase() === 'default company') {
      console.warn('⚠️ [CompanySelector] Only company available is "Default Company"');
    }
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{companyName}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={loading}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-medium">
              {currentCompany?.name || userCompanies[0]?.company?.name || 'Select Company'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Company</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userCompanies.map((companyUser) => (
          <DropdownMenuItem
            key={companyUser.company_id}
            onClick={() => handleCompanyChange(companyUser.company_id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{companyUser.company?.name}</span>
            </div>
            {currentCompany?.id === companyUser.company_id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        {isAdmin() && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/companies')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Manage Companies</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CompanySelector;

