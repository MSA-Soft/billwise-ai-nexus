import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Search,
  Filter,
  X,
  Save,
  Bookmark,
  Calendar,
  User,
  Building,
  Flag,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface SearchFilter {
  id?: string;
  name: string;
  searchTerm: string;
  statuses: string[];
  priorities: string[];
  types: string[];
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  payer?: string;
  saved: boolean;
}

interface AdvancedSearchFilterProps {
  onFilterChange: (filter: SearchFilter) => void;
  onSaveFilter?: (filter: SearchFilter) => void;
  savedFilters?: SearchFilter[];
  initialFilter?: SearchFilter;
}

export function AdvancedSearchFilter({
  onFilterChange,
  onSaveFilter,
  savedFilters = [],
  initialFilter,
}: AdvancedSearchFilterProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  
  const [filter, setFilter] = useState<SearchFilter>(initialFilter || {
    name: '',
    searchTerm: '',
    statuses: [],
    priorities: [],
    types: [],
    saved: false,
  });

  useEffect(() => {
    if (initialFilter) {
      setFilter(initialFilter);
    }
  }, [initialFilter]);

  const handleFilterChange = (updates: Partial<SearchFilter>) => {
    const newFilter = { ...filter, ...updates };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for this filter',
        variant: 'destructive',
      });
      return;
    }

    const savedFilter: SearchFilter = {
      ...filter,
      name: filterName,
      saved: true,
    };

    if (onSaveFilter) {
      onSaveFilter(savedFilter);
      toast({
        title: 'Filter Saved',
        description: `Filter "${filterName}" has been saved`,
      });
      setFilterName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadFilter = (savedFilter: SearchFilter) => {
    setFilter(savedFilter);
    onFilterChange(savedFilter);
    toast({
      title: 'Filter Loaded',
      description: `Filter "${savedFilter.name}" has been loaded`,
    });
  };

  const handleClearFilter = () => {
    const emptyFilter: SearchFilter = {
      name: '',
      searchTerm: '',
      statuses: [],
      priorities: [],
      types: [],
      saved: false,
    };
    setFilter(emptyFilter);
    onFilterChange(emptyFilter);
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filter.statuses.includes(status)
      ? filter.statuses.filter(s => s !== status)
      : [...filter.statuses, status];
    handleFilterChange({ statuses: newStatuses });
  };

  const togglePriority = (priority: string) => {
    const newPriorities = filter.priorities.includes(priority)
      ? filter.priorities.filter(p => p !== priority)
      : [...filter.priorities, priority];
    handleFilterChange({ priorities: newPriorities });
  };

  const toggleType = (type: string) => {
    const newTypes = filter.types.includes(type)
      ? filter.types.filter(t => t !== type)
      : [...filter.types, type];
    handleFilterChange({ types: newTypes });
  };

  const activeFilterCount = 
    filter.statuses.length +
    filter.priorities.length +
    filter.types.length +
    (filter.assignedTo ? 1 : 0) +
    (filter.dateFrom ? 1 : 0) +
    (filter.dateTo ? 1 : 0) +
    (filter.payer ? 1 : 0) +
    (filter.searchTerm ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, description, patient name, or ID..."
            value={filter.searchTerm}
            onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-blue-600 text-white">
              {activeFilterCount}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 ml-2" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-2" />
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearFilter}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}

        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Filter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Filter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Filter Name</Label>
                <Input
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="e.g., My Pending Tasks"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveFilter}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Quick Filters:</span>
        <Button
          variant={filter.statuses.includes('pending') ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleStatus('pending')}
        >
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Button>
        <Button
          variant={filter.statuses.includes('in_progress') ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleStatus('in_progress')}
        >
          <Activity className="h-3 w-3 mr-1" />
          In Progress
        </Button>
        <Button
          variant={filter.statuses.includes('completed') ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleStatus('completed')}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Button>
        <Button
          variant={filter.statuses.includes('overdue') ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleStatus('overdue')}
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Overdue
        </Button>
        <Button
          variant={filter.priorities.includes('urgent') ? 'default' : 'outline'}
          size="sm"
          onClick={() => togglePriority('urgent')}
        >
          <Flag className="h-3 w-3 mr-1" />
          Urgent
        </Button>
        <Button
          variant={filter.priorities.includes('critical') ? 'default' : 'outline'}
          size="sm"
          onClick={() => togglePriority('critical')}
        >
          <Flag className="h-3 w-3 mr-1" />
          Critical
        </Button>
      </div>

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Saved Filters:</span>
          {savedFilters.map((savedFilter) => (
            <Button
              key={savedFilter.id || savedFilter.name}
              variant="outline"
              size="sm"
              onClick={() => handleLoadFilter(savedFilter)}
            >
              <Bookmark className="h-3 w-3 mr-1" />
              {savedFilter.name}
            </Button>
          ))}
        </div>
      )}

      {/* Expanded Advanced Filters */}
      {isExpanded && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Filter */}
            <div>
              <Label className="mb-3 block">Status</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['pending', 'in_progress', 'on_hold', 'completed', 'overdue', 'cancelled'].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filter.statuses.includes(status)}
                      onCheckedChange={() => toggleStatus(status)}
                    />
                    <Label
                      htmlFor={`status-${status}`}
                      className="text-sm font-normal cursor-pointer capitalize"
                    >
                      {status.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <Label className="mb-3 block">Priority</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {['low', 'medium', 'high', 'urgent', 'critical'].map((priority) => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority}`}
                      checked={filter.priorities.includes(priority)}
                      onCheckedChange={() => togglePriority(priority)}
                    />
                    <Label
                      htmlFor={`priority-${priority}`}
                      className="text-sm font-normal cursor-pointer capitalize"
                    >
                      {priority}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <Label className="mb-3 block">Task Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['submit', 'follow_up', 'appeal', 'documentation', 'review', 'resubmit'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filter.types.includes(type)}
                      onCheckedChange={() => toggleType(type)}
                    />
                    <Label
                      htmlFor={`type-${type}`}
                      className="text-sm font-normal cursor-pointer capitalize"
                    >
                      {type.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={filter.dateFrom || ''}
                  onChange={(e) => handleFilterChange({ dateFrom: e.target.value })}
                />
              </div>
              <div>
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={filter.dateTo || ''}
                  onChange={(e) => handleFilterChange({ dateTo: e.target.value })}
                />
              </div>
            </div>

            {/* Assigned To */}
            <div>
              <Label>Assigned To</Label>
              <Input
                placeholder="User ID or email"
                value={filter.assignedTo || ''}
                onChange={(e) => handleFilterChange({ assignedTo: e.target.value })}
              />
            </div>

            {/* Payer Filter */}
            <div>
              <Label>Payer</Label>
              <Input
                placeholder="Payer name"
                value={filter.payer || ''}
                onChange={(e) => handleFilterChange({ payer: e.target.value })}
              />
            </div>

            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleClearFilter}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {filter.statuses.map(status => (
                    <Badge key={status} variant="secondary">
                      Status: {status}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => toggleStatus(status)}
                      />
                    </Badge>
                  ))}
                  {filter.priorities.map(priority => (
                    <Badge key={priority} variant="secondary">
                      Priority: {priority}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => togglePriority(priority)}
                      />
                    </Badge>
                  ))}
                  {filter.types.map(type => (
                    <Badge key={type} variant="secondary">
                      Type: {type}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => toggleType(type)}
                      />
                    </Badge>
                  ))}
                  {filter.assignedTo && (
                    <Badge variant="secondary">
                      Assigned: {filter.assignedTo}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => handleFilterChange({ assignedTo: undefined })}
                      />
                    </Badge>
                  )}
                  {filter.payer && (
                    <Badge variant="secondary">
                      Payer: {filter.payer}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => handleFilterChange({ payer: undefined })}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

