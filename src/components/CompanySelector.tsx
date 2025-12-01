import React, { useState } from 'react';
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

  const handleCompanyChange = async (companyId: string) => {
    try {
      setLoading(true);
      await setCurrentCompany(companyId);
      toast.success('Company switched successfully');
      // Refresh the page to reload data with new company context
      window.location.reload();
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
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{currentCompany?.name || 'No Company'}</span>
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
              {currentCompany?.name || 'Select Company'}
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

