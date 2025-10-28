import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  DollarSign,
  Building,
  User,
  RefreshCw
} from 'lucide-react';

interface ClaimsFilterProps {
  filters: {
    status: string;
    payer: string;
    dateRange: string;
    provider: string;
    amountRange: string;
    searchTerm: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export function ClaimsFilter({ filters, onFiltersChange, onClearFilters }: ClaimsFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all' && value !== '');

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter Claims
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-white hover:bg-white/20"
            >
              <Filter className="h-4 w-4 mr-1" />
              {showAdvanced ? 'Simple' : 'Advanced'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Basic Search */}
        <div className="mb-4">
          <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
            Search Claims
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by patient name, claim ID, provider, or payer..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
              Status
            </Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="resubmitted">Resubmitted</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="payer" className="text-sm font-medium text-gray-700 mb-2 block">
              Payer
            </Label>
            <Select value={filters.payer} onValueChange={(value) => handleFilterChange('payer', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Payers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payers</SelectItem>
                <SelectItem value="Blue Cross Blue Shield">Blue Cross Blue Shield</SelectItem>
                <SelectItem value="Aetna">Aetna</SelectItem>
                <SelectItem value="Medicare">Medicare</SelectItem>
                <SelectItem value="Cigna">Cigna</SelectItem>
                <SelectItem value="UnitedHealth">UnitedHealth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="provider" className="text-sm font-medium text-gray-700 mb-2 block">
              Provider
            </Label>
            <Select value={filters.provider} onValueChange={(value) => handleFilterChange('provider', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="Dr. Smith">Dr. Smith</SelectItem>
                <SelectItem value="Dr. Johnson">Dr. Johnson</SelectItem>
                <SelectItem value="Dr. Davis">Dr. Davis</SelectItem>
                <SelectItem value="Dr. Wilson">Dr. Wilson</SelectItem>
                <SelectItem value="Dr. Anderson">Dr. Anderson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dateRange" className="text-sm font-medium text-gray-700 mb-2 block">
              Date Range
            </Label>
            <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="amountRange" className="text-sm font-medium text-gray-700 mb-2 block">
                  Amount Range
                </Label>
                <Select value={filters.amountRange} onValueChange={(value) => handleFilterChange('amountRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Amounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Amounts</SelectItem>
                    <SelectItem value="0-100">$0 - $100</SelectItem>
                    <SelectItem value="100-500">$100 - $500</SelectItem>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000+">$1,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="formType" className="text-sm font-medium text-gray-700 mb-2 block">
                  Form Type
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Forms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Forms</SelectItem>
                    <SelectItem value="HCFA">HCFA</SelectItem>
                    <SelectItem value="UB04">UB-04</SelectItem>
                    <SelectItem value="CMS1500">CMS-1500</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="submissionMethod" className="text-sm font-medium text-gray-700 mb-2 block">
                  Submission Method
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="EDI">EDI</SelectItem>
                    <SelectItem value="Paper">Paper</SelectItem>
                    <SelectItem value="Portal">Portal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFrom" className="text-sm font-medium text-gray-700 mb-2 block">
                    From Date
                  </Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    className="flex items-center"
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo" className="text-sm font-medium text-gray-700 mb-2 block">
                    To Date
                  </Label>
                  <Input
                    id="dateTo"
                    type="date"
                    className="flex items-center"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                <div className="flex flex-wrap gap-2">
                  {filters.status !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Status: {filters.status}
                    </span>
                  )}
                  {filters.payer !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Payer: {filters.payer}
                    </span>
                  )}
                  {filters.provider !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Provider: {filters.provider}
                    </span>
                  )}
                  {filters.dateRange !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Date: {filters.dateRange}
                    </span>
                  )}
                  {filters.searchTerm && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Search: {filters.searchTerm}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
