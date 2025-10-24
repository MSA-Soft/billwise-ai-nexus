import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LayoutDashboard,
  Users,
  Activity,
  Mail,
  HandshakeIcon,
  Scale,
  AlertTriangle,
  FileBarChart,
  Phone,
  Plus,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { CollectionsAccountDialog } from "./collections/CollectionsAccountDialog";
import { ContactActivityDialog } from "./collections/ContactActivityDialog";
import { SendLetterDialog } from "./collections/SendLetterDialog";
import { SettlementOfferDialog } from "./collections/SettlementOfferDialog";
import { AttorneyReferralDialog } from "./collections/AttorneyReferralDialog";
import { DisputeDialog } from "./collections/DisputeDialog";
import { useCollections } from "@/hooks/useCollections";

export function CollectionsManagement() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    accounts,
    activities,
    loading,
    error,
    fetchAccounts,
    fetchActivities,
    createAccount,
    updateAccount,
    deleteAccount,
    addActivity,
  } = useCollections();

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "early_collection": return "bg-yellow-500";
      case "mid_collection": return "bg-orange-500";
      case "late_collection": return "bg-red-500";
      case "pre_legal": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "payment_plan": return "secondary";
      case "settled": return "outline";
      case "attorney_referral": return "destructive";
      case "closed": return "outline";
      default: return "default";
    }
  };

  const dashboardMetrics = {
    totalInCollections: accounts.length,
    totalBalance: accounts.reduce((sum, acc) => sum + Number(acc.current_balance), 0),
    earlyStage: accounts.filter(a => a.collection_stage === "early_collection").length,
    midStage: accounts.filter(a => a.collection_stage === "mid_collection").length,
    lateStage: accounts.filter(a => a.collection_stage === "late_collection").length,
    preLegal: accounts.filter(a => a.collection_stage === "pre_legal").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Collections Management</h2>
          <p className="text-muted-foreground">
            Comprehensive collections workflow from initial contact to attorney referral
          </p>
        </div>
        <Button onClick={() => setDialogOpen("account")}>
          <Plus className="mr-2 h-4 w-4" />
          Add to Collections
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="letters">
            <Mail className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Letters</span>
          </TabsTrigger>
          <TabsTrigger value="settlements">
            <HandshakeIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Settlements</span>
          </TabsTrigger>
          <TabsTrigger value="attorney">
            <Scale className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Attorney</span>
          </TabsTrigger>
          <TabsTrigger value="disputes">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Disputes</span>
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileBarChart className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total in Collections</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardMetrics.totalInCollections}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${dashboardMetrics.totalBalance.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Early/Mid Stage</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardMetrics.earlyStage + dashboardMetrics.midStage}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late/Pre-Legal</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardMetrics.lateStage + dashboardMetrics.preLegal}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Collections Pipeline by Stage</CardTitle>
              <CardDescription>Distribution of accounts across collection stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Early Collection (30-60 days)</span>
                  <Badge className={getStageColor("early_collection")}>
                    {dashboardMetrics.earlyStage}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mid Collection (60-90 days)</span>
                  <Badge className={getStageColor("mid_collection")}>
                    {dashboardMetrics.midStage}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Late Collection (90-120 days)</span>
                  <Badge className={getStageColor("late_collection")}>
                    {dashboardMetrics.lateStage}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pre-Legal (120+ days)</span>
                  <Badge className={getStageColor("pre_legal")}>
                    {dashboardMetrics.preLegal}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Collections Accounts</CardTitle>
              <CardDescription>All accounts currently in collections</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.patient_name}</TableCell>
                      <TableCell>${Number(account.current_balance).toFixed(2)}</TableCell>
                      <TableCell>{account.days_overdue} days</TableCell>
                      <TableCell>
                        <Badge className={getStageColor(account.collection_stage)}>
                          {account.collection_stage.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(account.collection_status)}>
                          {account.collection_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {account.last_contact_date
                          ? format(new Date(account.last_contact_date), "MM/dd/yyyy")
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAccount(account.id);
                              setDialogOpen("contact");
                            }}
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAccount(account.id);
                              setDialogOpen("letter");
                            }}
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAccount(account.id);
                              setDialogOpen("settlement");
                            }}
                          >
                            <HandshakeIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAccount(account.id);
                              setDialogOpen("attorney");
                            }}
                          >
                            <Scale className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAccount(account.id);
                              setDialogOpen("dispute");
                            }}
                          >
                            <AlertTriangle className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Collection Activities</CardTitle>
              <CardDescription>Timeline of all collection attempts and communications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Activity Type</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        {format(new Date(activity.created_at), "MM/dd/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{activity.collections_accounts.patient_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {activity.activity_type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{activity.contact_method || "-"}</TableCell>
                      <TableCell>{activity.outcome || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {activity.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="letters">
          <Card>
            <CardHeader>
              <CardTitle>Collection Letters</CardTitle>
              <CardDescription>Send and track collection letters</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Select an account from the Accounts tab to send letters</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlements">
          <Card>
            <CardHeader>
              <CardTitle>Settlement Negotiations</CardTitle>
              <CardDescription>Manage settlement offers and negotiations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Select an account from the Accounts tab to create settlement offers</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attorney">
          <Card>
            <CardHeader>
              <CardTitle>Attorney Referrals</CardTitle>
              <CardDescription>Track accounts referred to legal/attorney</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Select an account from the Accounts tab to create attorney referrals</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes">
          <Card>
            <CardHeader>
              <CardTitle>Dispute Management</CardTitle>
              <CardDescription>Handle patient disputes and investigations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Select an account from the Accounts tab to file disputes</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>Collections performance and compliance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon: Detailed analytics and reporting</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CollectionsAccountDialog
        open={dialogOpen === "account"}
        onOpenChange={(open) => !open && setDialogOpen(null)}
        onSuccess={fetchAccounts}
      />

      {selectedAccount && (
        <>
          <ContactActivityDialog
            open={dialogOpen === "contact"}
            onOpenChange={(open) => !open && setDialogOpen(null)}
            accountId={selectedAccount}
            onSuccess={fetchAccounts}
          />
          <SendLetterDialog
            open={dialogOpen === "letter"}
            onOpenChange={(open) => !open && setDialogOpen(null)}
            accountId={selectedAccount}
            onSuccess={fetchAccounts}
          />
          <SettlementOfferDialog
            open={dialogOpen === "settlement"}
            onOpenChange={(open) => !open && setDialogOpen(null)}
            accountId={selectedAccount}
            onSuccess={fetchAccounts}
          />
          <AttorneyReferralDialog
            open={dialogOpen === "attorney"}
            onOpenChange={(open) => !open && setDialogOpen(null)}
            accountId={selectedAccount}
            onSuccess={fetchAccounts}
          />
          <DisputeDialog
            open={dialogOpen === "dispute"}
            onOpenChange={(open) => !open && setDialogOpen(null)}
            accountId={selectedAccount}
            onSuccess={fetchAccounts}
          />
        </>
      )}
    </div>
  );
}
