import { Activity, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import Payroll from "@/components/layouts/payroll";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Reports() {
  const chartData1 = [
    { month: "June", employees: 0 },
    { month: "Jusly", employees: 0 },
    { month: "August", employees: 0 },
    { month: "September", employees: 0 },
    { month: "October", employees: 0 },
    { month: "November", employees: 6 * 100000 },
  ];

  const chartData2 = [
    { month: "June", employees: 0 },
    { month: "Jusly", employees: 0 },
    { month: "August", employees: 0 },
    { month: "September", employees: 0 },
    { month: "October", employees: 0 },
    { month: "November", employees: 6 },
  ];

  const chartConfig1 = {
    employees: {
      label: "Employees",
      color: "var(--chart-1)",
      icon: Activity,
    },
  } satisfies ChartConfig;

  const chartConfig2 = {
    employees: {
      label: "Employees",
      color: "var(--chart-1)",
      icon: Activity,
    },
  } satisfies ChartConfig;

  return (
    <div className="p-6">
      <div className="flex w-full flex-col gap-6">
        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="payrun">Pay-run</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <div className="grid-cols-2 grid gap-6">
              <div className="p-6 w-full bg-muted rounded-xl border font-black text-lg text-center">
                Warnings: none
              </div>
              <div className="p-6 w-full bg-muted rounded-xl border font-black text-lg text-center">
                Pay-runs: none
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Employer Cost - Chart</CardTitle>
                  <CardDescription>
                    Showing total cost to company.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig1}>
                    <AreaChart
                      accessibilityLayer
                      data={chartData1}
                      margin={{
                        left: 12,
                        right: 12,
                      }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Area
                        dataKey="employees"
                        type="step"
                        fill="var(--color-employees)"
                        fillOpacity={0.4}
                        stroke="var(--color-employees)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter>
                  <div className="text-muted-foreground flex items-center gap-2 leading-none">
                    <TrendingUp className="h-4 w-4" /> June - November 2025
                  </div>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Number of Employees</CardTitle>
                  <CardDescription>
                    Showing total employees for the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig2}>
                    <AreaChart
                      accessibilityLayer
                      data={chartData2}
                      margin={{
                        left: 12,
                        right: 12,
                      }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Area
                        dataKey="employees"
                        type="step"
                        fill="var(--color-employees)"
                        fillOpacity={0.4}
                        stroke="var(--color-employees)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter>
                  <div className="text-muted-foreground flex items-center gap-2 leading-none">
                    <TrendingUp className="h-4 w-4" /> June - November 2025
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="payrun">
            <Card>
              <CardContent className="grid gap-6">
                <Payroll />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
