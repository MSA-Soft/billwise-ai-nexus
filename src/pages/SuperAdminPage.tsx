import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { companyService, Company, CompanyUser } from '@/services/companyService';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Users,
  TrendingUp,
  DollarSign,
  FileText,
  UserPlus,
  BarChart3,
  Shield,
  Check,
  X,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FormReportAccessManager from '@/components/FormReportAccessManager';

const SuperAdminPage: React.FC = () => {
  const { isSuperAdmin, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isViewStatsOpen, setIsViewStatsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    subscription_tier: 'basic',
  });
  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'user' as 'admin' | 'manager' | 'user' | 'viewer',
  });

  // Fetch all companies
  const { data: allCompanies, isLoading } = useQuery({
    queryKey: ['all-companies-super-admin'],
    queryFn: () => companyService.getAllCompanies(),
    enabled: isSuperAdmin,
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ['company-statistics'],
    queryFn: () => companyService.getCompanyStatistics(),
    enabled: isSuperAdmin,
  });

  // Create company mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Company>) => companyService.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-companies-super-admin'] });
      queryClient.invalidateQueries({ queryKey: ['company-statistics'] });
      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        slug: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        subscription_tier: 'basic',
      });
      toast.success('Company created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create company');
    },
  });

  // Update company mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) =>
      companyService.updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-companies-super-admin'] });
      queryClient.invalidateQueries({ queryKey: ['company-statistics'] });
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      toast.success('Company updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update company');
    },
  });

  // Delete company mutation
  const deleteMutation = useMutation({
    mutationFn: (companyId: string) => companyService.deleteCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-companies-super-admin'] });
      queryClient.invalidateQueries({ queryKey: ['company-statistics'] });
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
      toast.success('Company deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete company');
    },
  });

  // Toggle company status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      companyService.toggleCompanyStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['all-companies-super-admin'] });
      queryClient.invalidateQueries({ queryKey: ['company-statistics'] });
      toast.success(`Company ${variables.isActive ? 'enabled' : 'disabled'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update company status');
    },
  });

  // Create user for company mutation
  const createUserMutation = useMutation({
    mutationFn: ({ companyId, userData }: { companyId: string; userData: any }) =>
      companyService.createUserForCompany(companyId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      setIsUserDialogOpen(false);
      setUserFormData({
        email: '',
        password: '',
        fullName: '',
        role: 'user',
      });
      toast.success('User created and added to company successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create user');
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      slug: company.slug,
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      city: company.city || '',
      state: company.state || '',
      zip_code: company.zip_code || '',
      subscription_tier: company.subscription_tier || 'basic',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedCompany) return;
    updateMutation.mutate({ id: selectedCompany.id, data: formData });
  };

  const handleDelete = () => {
    if (!selectedCompany) return;
    deleteMutation.mutate(selectedCompany.id);
  };

  const handleToggleStatus = (company: Company) => {
    toggleStatusMutation.mutate({
      id: company.id,
      isActive: !company.is_active,
    });
  };

  const handleCreateUser = () => {
    if (!selectedCompany) return;
    createUserMutation.mutate({
      companyId: selectedCompany.id,
      userData: userFormData,
    });
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  if (!isSuperAdmin) {
    return (
      <Layout currentPage="super-admin">
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Access Denied</p>
                <p className="text-muted-foreground">
                  You need super admin privileges to access this page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const totalStats = statistics?.reduce(
    (acc: any, stat: any) => ({
      totalCompanies: (acc.totalCompanies || 0) + 1,
      totalUsers: (acc.totalUsers || 0) + (stat.total_users || 0),
      totalPatients: (acc.totalPatients || 0) + (stat.total_patients || 0),
      totalClaims: (acc.totalClaims || 0) + (stat.professional_claims_count || 0) + (stat.institutional_claims_count || 0),
      totalRevenue: (acc.totalRevenue || 0) + (stat.paid_amount || 0),
      pendingRevenue: (acc.pendingRevenue || 0) + (stat.pending_amount || 0),
    }),
    {}
  ) || {};

  return (
    <Layout currentPage="super-admin">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Super Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage all companies, users, and system-wide settings
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Company</DialogTitle>
                <DialogDescription>
                  Create a new company account in the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Acme Medical Group"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="acme-medical"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="State"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="zip_code">ZIP Code</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                      placeholder="12345"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subscription_tier">Subscription Tier</Label>
                  <Select
                    value={formData.subscription_tier}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subscription_tier: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Company'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allCompanies?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {allCompanies?.filter(c => c.is_active).length || 0} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Across all companies</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(totalStats.totalRevenue || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                ${(totalStats.pendingRevenue || 0).toLocaleString()} pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalClaims || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="companies" className="space-y-4">
          <TabsList>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="access">Form/Report Access</TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Companies</CardTitle>
                <CardDescription>
                  Manage all companies in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : allCompanies && allCompanies.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allCompanies.map((company) => {
                        const stats = statistics?.find((s: any) => s.company_id === company.id);
                        return (
                          <TableRow key={company.id}>
                            <TableCell className="font-medium">{company.name}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {company.slug}
                              </code>
                            </TableCell>
                            <TableCell>{company.email || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {company.subscription_tier || 'basic'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={company.is_active ? 'default' : 'secondary'}
                              >
                                {company.is_active ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <X className="h-3 w-3 mr-1" />
                                    Inactive
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>{stats?.total_users || 0}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCompany(company);
                                    setIsViewStatsOpen(true);
                                  }}
                                  title="View Statistics"
                                >
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCompany(company);
                                    setIsUserDialogOpen(true);
                                  }}
                                  title="Add User"
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(company)}
                                  title="Edit Company"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(company)}
                                  disabled={toggleStatusMutation.isPending}
                                  title={company.is_active ? 'Disable' : 'Enable'}
                                >
                                  {company.is_active ? (
                                    <PowerOff className="h-4 w-4 text-destructive" />
                                  ) : (
                                    <Power className="h-4 w-4 text-green-600" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCompany(company);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  title="Delete Company"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No companies found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Statistics</CardTitle>
                <CardDescription>
                  Detailed statistics for all companies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statistics && statistics.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Patients</TableHead>
                        <TableHead>Claims</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Pending</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statistics.map((stat: any) => (
                        <TableRow key={stat.company_id}>
                          <TableCell className="font-medium">{stat.company_name}</TableCell>
                          <TableCell>{stat.total_users || 0}</TableCell>
                          <TableCell>{stat.total_patients || 0}</TableCell>
                          <TableCell>
                            {(stat.professional_claims_count || 0) + (stat.institutional_claims_count || 0)}
                          </TableCell>
                          <TableCell>${(stat.paid_amount || 0).toLocaleString()}</TableCell>
                          <TableCell>${(stat.pending_amount || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={stat.is_active ? 'default' : 'secondary'}>
                              {stat.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No statistics available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Form & Report Access Management</CardTitle>
                <CardDescription>
                  Control which forms and reports each company and user can access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="company-select">Select Company</Label>
                  <Select
                    value={selectedCompany?.id || ''}
                    onValueChange={(value) => {
                      const company = allCompanies?.find((c) => c.id === value);
                      setSelectedCompany(company || null);
                    }}
                  >
                    <SelectTrigger id="company-select">
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCompanies?.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FormReportAccessManager selectedCompany={selectedCompany} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Company Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Company</DialogTitle>
              <DialogDescription>
                Update company information and settings.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Company Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-slug">Slug *</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-state">State</Label>
                  <Input
                    id="edit-state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-zip_code">ZIP Code</Label>
                  <Input
                    id="edit-zip_code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-subscription_tier">Subscription Tier</Label>
                <Select
                  value={formData.subscription_tier}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subscription_tier: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Company'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Company Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the company "{selectedCompany?.name}" and all its data.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Company'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add User to Company Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User to {selectedCompany?.name}</DialogTitle>
              <DialogDescription>
                Create a new user and add them to this company.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="user-email">Email *</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, email: e.target.value })
                  }
                  placeholder="user@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-password">Password *</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={userFormData.password}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, password: e.target.value })
                  }
                  placeholder="Minimum 6 characters"
                  minLength={6}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-fullName">Full Name *</Label>
                <Input
                  id="user-fullName"
                  value={userFormData.fullName}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, fullName: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-role">Role *</Label>
                <Select
                  value={userFormData.role}
                  onValueChange={(value: any) =>
                    setUserFormData({ ...userFormData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUserDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Statistics Dialog */}
        <Dialog open={isViewStatsOpen} onOpenChange={setIsViewStatsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Statistics for {selectedCompany?.name}</DialogTitle>
              <DialogDescription>
                Detailed statistics and metrics for this company.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedCompany && (
                <>
                  {(() => {
                    const stats = statistics?.find(
                      (s: any) => s.company_id === selectedCompany.id
                    );
                    if (!stats) {
                      return <p className="text-muted-foreground">No statistics available</p>;
                    }
                    return (
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Users</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{stats.total_users || 0}</div>
                            <p className="text-xs text-muted-foreground">
                              {stats.admin_count || 0} admins
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Patients</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{stats.total_patients || 0}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Claims</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {(stats.professional_claims_count || 0) +
                                (stats.institutional_claims_count || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Professional: {stats.professional_claims_count || 0} | Institutional:{' '}
                              {stats.institutional_claims_count || 0}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Billing</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              ${(stats.paid_amount || 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              ${(stats.pending_amount || 0).toLocaleString()} pending
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsViewStatsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default SuperAdminPage;

