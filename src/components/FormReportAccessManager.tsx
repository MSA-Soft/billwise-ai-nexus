import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formReportAccessService, SystemFormReport, CompanyFormReportAccess, UserFormReportAccess } from '@/services/formReportAccessService';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  FileText,
  BarChart3,
  Settings,
  Users,
  Building2,
  Check,
  X,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';

interface FormReportAccessManagerProps {
  selectedCompany?: Company | null;
}

const FormReportAccessManager: React.FC<FormReportAccessManagerProps> = ({
  selectedCompany,
}) => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<CompanyUser | null>(null);
  const [isUserAccessDialogOpen, setIsUserAccessDialogOpen] = useState(false);

  // Fetch all forms/reports
  const { data: allFormsReports } = useQuery({
    queryKey: ['system-forms-reports'],
    queryFn: () => formReportAccessService.getAllFormsReports(),
  });

  // Fetch company access
  const { data: companyAccess } = useQuery({
    queryKey: ['company-form-report-access', selectedCompany?.id],
    queryFn: () => formReportAccessService.getCompanyAccess(selectedCompany?.id || ''),
    enabled: !!selectedCompany?.id,
  });

  // Fetch company users
  const { data: companyUsers } = useQuery({
    queryKey: ['company-users', selectedCompany?.id],
    queryFn: async () => {
      if (!selectedCompany?.id) return [];
      return companyService.getCompanyUsers(selectedCompany.id);
    },
    enabled: !!selectedCompany?.id,
  });

  // Fetch user access
  const { data: userAccess } = useQuery({
    queryKey: ['user-form-report-access', selectedUser?.user_id, selectedCompany?.id],
    queryFn: () =>
      formReportAccessService.getUserAccess(
        selectedUser?.user_id || '',
        selectedCompany?.id || ''
      ),
    enabled: !!selectedUser?.user_id && !!selectedCompany?.id,
  });

  // Update company access mutation
  const updateCompanyAccessMutation = useMutation({
    mutationFn: async ({
      formReportId,
      isEnabled,
    }: {
      formReportId: string;
      isEnabled: boolean;
    }) => {
      if (!selectedCompany?.id) throw new Error('No company selected');
      return formReportAccessService.setCompanyAccess(
        selectedCompany.id,
        formReportId,
        isEnabled
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company-form-report-access', selectedCompany?.id],
      });
      toast.success('Access updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update access');
    },
  });

  // Update user access mutation
  const updateUserAccessMutation = useMutation({
    mutationFn: async ({
      formReportId,
      isEnabled,
    }: {
      formReportId: string;
      isEnabled: boolean;
    }) => {
      if (!selectedUser?.user_id || !selectedCompany?.id)
        throw new Error('No user or company selected');
      return formReportAccessService.setUserAccess(
        selectedUser.user_id,
        selectedCompany.id,
        formReportId,
        isEnabled
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user-form-report-access', selectedUser?.user_id, selectedCompany?.id],
      });
      toast.success('User access updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user access');
    },
  });

  // Bulk update company access
  const bulkUpdateCompanyAccessMutation = useMutation({
    mutationFn: async (accesses: Array<{ formReportId: string; isEnabled: boolean }>) => {
      if (!selectedCompany?.id) throw new Error('No company selected');
      return formReportAccessService.bulkUpdateCompanyAccess(
        selectedCompany.id,
        accesses
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company-form-report-access', selectedCompany?.id],
      });
      toast.success('Access updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update access');
    },
  });

  const handleToggleCompanyAccess = (formReportId: string, currentEnabled: boolean) => {
    updateCompanyAccessMutation.mutate({
      formReportId,
      isEnabled: !currentEnabled,
    });
  };

  const handleToggleUserAccess = (formReportId: string, currentEnabled: boolean) => {
    updateUserAccessMutation.mutate({
      formReportId,
      isEnabled: !currentEnabled,
    });
  };

  const handleBulkEnableAll = () => {
    if (!allFormsReports || !selectedCompany) return;
    const accesses = allFormsReports.map((fr) => ({
      formReportId: fr.id,
      isEnabled: true,
    }));
    bulkUpdateCompanyAccessMutation.mutate(accesses);
  };

  const handleBulkDisableAll = () => {
    if (!allFormsReports || !selectedCompany) return;
    const accesses = allFormsReports.map((fr) => ({
      formReportId: fr.id,
      isEnabled: false,
    }));
    bulkUpdateCompanyAccessMutation.mutate(accesses);
  };

  // Get access status for a form/report
  const getCompanyAccessStatus = (formReportId: string): boolean => {
    const access = companyAccess?.find((a) => a.form_report_id === formReportId);
    return access?.is_enabled ?? false;
  };

  const getUserAccessStatus = (formReportId: string): boolean => {
    const access = userAccess?.find((a) => a.form_report_id === formReportId);
    return access?.is_enabled ?? false;
  };

  if (!selectedCompany) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Please select a company to manage form/report access
          </div>
        </CardContent>
      </Card>
    );
  }

  const forms = allFormsReports?.filter((fr) => fr.type === 'form') || [];
  const reports = allFormsReports?.filter((fr) => fr.type === 'report') || [];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
          <TabsTrigger value="company">Company Access</TabsTrigger>
          <TabsTrigger value="users">User Access</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Form & Report Access for {selectedCompany.name}</CardTitle>
                  <CardDescription>
                    Control which forms and reports are available to all users in this company
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkEnableAll}
                    disabled={bulkUpdateCompanyAccessMutation.isPending}
                  >
                    Enable All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDisableAll}
                    disabled={bulkUpdateCompanyAccessMutation.isPending}
                  >
                    Disable All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="forms" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="forms">
                    <FileText className="h-4 w-4 mr-2" />
                    Forms ({forms.length})
                  </TabsTrigger>
                  <TabsTrigger value="reports">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Reports ({reports.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="forms" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Form Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {forms.length > 0 ? (
                        forms.map((form) => {
                          const isEnabled = getCompanyAccessStatus(form.id);
                          return (
                            <TableRow key={form.id}>
                              <TableCell className="font-medium">{form.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{form.category}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {form.description || '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Switch
                                    checked={isEnabled}
                                    onCheckedChange={() =>
                                      handleToggleCompanyAccess(form.id, isEnabled)
                                    }
                                    disabled={updateCompanyAccessMutation.isPending}
                                  />
                                  <Badge variant={isEnabled ? 'default' : 'secondary'}>
                                    {isEnabled ? (
                                      <>
                                        <Check className="h-3 w-3 mr-1" />
                                        Enabled
                                      </>
                                    ) : (
                                      <>
                                        <X className="h-3 w-3 mr-1" />
                                        Disabled
                                      </>
                                    )}
                                  </Badge>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No forms available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.length > 0 ? (
                        reports.map((report) => {
                          const isEnabled = getCompanyAccessStatus(report.id);
                          return (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium">{report.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{report.category}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {report.description || '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Switch
                                    checked={isEnabled}
                                    onCheckedChange={() =>
                                      handleToggleCompanyAccess(report.id, isEnabled)
                                    }
                                    disabled={updateCompanyAccessMutation.isPending}
                                  />
                                  <Badge variant={isEnabled ? 'default' : 'secondary'}>
                                    {isEnabled ? (
                                      <>
                                        <Check className="h-3 w-3 mr-1" />
                                        Enabled
                                      </>
                                    ) : (
                                      <>
                                        <X className="h-3 w-3 mr-1" />
                                        Disabled
                                      </>
                                    )}
                                  </Badge>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No reports available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User-Specific Access</CardTitle>
              <CardDescription>
                Override company-level access for specific users. User-level settings take
                precedence over company-level settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {companyUsers && companyUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.user?.full_name || user.user?.email || 'Unknown User'}
                        </TableCell>
                        <TableCell>{user.user?.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsUserAccessDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Manage Access
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No users found in this company
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Access Dialog */}
      <Dialog open={isUserAccessDialogOpen} onOpenChange={setIsUserAccessDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Access for {selectedUser?.user?.full_name || selectedUser?.user?.email}
            </DialogTitle>
            <DialogDescription>
              Override company-level access for this user. User settings override company
              settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Tabs defaultValue="forms" className="space-y-4">
              <TabsList>
                <TabsTrigger value="forms">
                  <FileText className="h-4 w-4 mr-2" />
                  Forms
                </TabsTrigger>
                <TabsTrigger value="reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Reports
                </TabsTrigger>
              </TabsList>

              <TabsContent value="forms" className="space-y-2">
                {forms.map((form) => {
                  const isEnabled = getUserAccessStatus(form.id);
                  const companyEnabled = getCompanyAccessStatus(form.id);
                  return (
                    <div
                      key={form.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{form.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {form.description || '-'}
                        </div>
                        {!isEnabled && companyEnabled && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Company access enabled, but user access disabled
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => handleToggleUserAccess(form.id, isEnabled)}
                          disabled={updateUserAccessMutation.isPending}
                        />
                        <Badge variant={isEnabled ? 'default' : 'secondary'}>
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="reports" className="space-y-2">
                {reports.map((report) => {
                  const isEnabled = getUserAccessStatus(report.id);
                  const companyEnabled = getCompanyAccessStatus(report.id);
                  return (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {report.description || '-'}
                        </div>
                        {!isEnabled && companyEnabled && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Company access enabled, but user access disabled
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => handleToggleUserAccess(report.id, isEnabled)}
                          disabled={updateUserAccessMutation.isPending}
                        />
                        <Badge variant={isEnabled ? 'default' : 'secondary'}>
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsUserAccessDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormReportAccessManager;

