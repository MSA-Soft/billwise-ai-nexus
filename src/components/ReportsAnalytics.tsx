
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, Download, Calendar, DollarSign, FileText, Users, Target } from "lucide-react";

const ReportsAnalytics = () => {
  // Mock data for charts
  const monthlyRevenue = [
    { month: "Jan", revenue: 125000, claims: 234 },
    { month: "Feb", revenue: 132000, claims: 245 },
    { month: "Mar", revenue: 128000, claims: 238 },
    { month: "Apr", revenue: 145000, claims: 267 },
    { month: "May", revenue: 152000, claims: 285 },
    { month: "Jun", revenue: 158000, claims: 298 }
  ];

  const denialsByPayer = [
    { payer: "Medicare", denials: 23, total: 456, rate: 5.0 },
    { payer: "BCBS", denials: 45, total: 567, rate: 7.9 },
    { payer: "Aetna", denials: 34, total: 432, rate: 7.9 },
    { payer: "Cigna", denials: 28, total: 234, rate: 12.0 },
    { payer: "Humana", denials: 19, total: 198, rate: 9.6 }
  ];

  const procedureVolume = [
    { name: "Office Visits", value: 1247, color: "#8884d8" },
    { name: "Lab Tests", value: 892, color: "#82ca9d" },
    { name: "Imaging", value: 654, color: "#ffc658" },
    { name: "Procedures", value: 432, color: "#ff7300" },
    { name: "Consultations", value: 321, color: "#00ff00" }
  ];

  const collectionsData = [
    { month: "Jan", collected: 98000, outstanding: 45000 },
    { month: "Feb", collected: 105000, outstanding: 42000 },
    { month: "Mar", collected: 112000, outstanding: 38000 },
    { month: "Apr", collected: 118000, outstanding: 41000 },
    { month: "May", collected: 125000, outstanding: 39000 },
    { month: "Jun", collected: 132000, outstanding: 36000 }
  ];

  const kpiMetrics = [
    {
      title: "Clean Claim Rate",
      value: "94.2%",
      change: "+2.1%",
      trend: "up",
      icon: Target,
      color: "text-green-600"
    },
    {
      title: "Days in A/R",
      value: "28.5",
      change: "-3.2 days",
      trend: "down",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      title: "Collection Rate",
      value: "87.8%",
      change: "+1.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Net Collection Rate",
      value: "96.3%",
      change: "+0.8%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Reports & Analytics</h2>
        <div className="flex space-x-2">
          <Select defaultValue="last-6-months">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="payer-analysis">Payer Analysis</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {kpiMetrics.map((metric) => (
              <Card key={metric.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className={`text-xs ${metric.color}`}>{metric.change} from last period</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue and Claims Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Claims Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="claims" stroke="#ff7300" strokeWidth={2} name="Claims Count" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Procedure Volume Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Procedure Volume Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={procedureVolume}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {procedureVolume.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Procedures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {procedureVolume.map((procedure, index) => (
                    <div key={procedure.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium">#{index + 1}</div>
                        <div>
                          <div className="font-medium">{procedure.name}</div>
                          <div className="text-sm text-gray-600">{procedure.value} procedures</div>
                        </div>
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(procedure.value / procedureVolume[0].value) * 100}%`,
                            backgroundColor: procedure.color
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collections vs Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={collectionsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="collected" fill="#10b981" name="Collected" />
                  <Bar dataKey="outstanding" fill="#f59e0b" name="Outstanding" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Total Revenue (YTD)</span>
                    <span className="text-lg font-bold text-green-600">$890,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Collections (YTD)</span>
                    <span className="text-lg font-bold text-blue-600">$785,600</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Outstanding A/R</span>
                    <span className="text-lg font-bold text-yellow-600">$104,400</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">Write-offs</span>
                    <span className="text-lg font-bold text-red-600">$23,450</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={procedureVolume} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Claims Processed</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,867</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3 days</div>
                <p className="text-xs text-muted-foreground">-0.5 days from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3,245</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Processing Efficiency Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="claims" stroke="#8884d8" strokeWidth={2} name="Claims Processed" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payer-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Denial Analysis by Payer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {denialsByPayer.map((payer) => (
                  <div key={payer.payer} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{payer.payer}</div>
                      <div className="text-sm text-red-600 font-medium">
                        {payer.rate}% denial rate
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{payer.denials} denials out of {payer.total} claims</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${payer.rate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Build Custom Reports</h3>
                <p className="text-gray-600 mb-4">
                  Create customized reports with specific metrics and date ranges to meet your unique requirements.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Start Report Builder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAnalytics;
