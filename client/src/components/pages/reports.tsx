import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/hono-client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { usePDF } from "react-to-pdf";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  const [userData, setUserData] = useState<any>(null);

  const { toPDF, targetRef } = usePDF({ filename: "Report.pdf" });

  useEffect(() => {
    getUserPayroll();
  }, []);

  const getUserPayroll = async () => {
    try {
      const user = await authClient.getSession();

      if (!user.data) {
        toast.error("Try logging in again!");
        return;
      }

      console.log(user.data);

      const res = await client.api["payroll-user"].$post({
        json: { userId: user.data.user.id },
      });

      if (!res.ok) {
        toast.error("Failed to fetch payroll");
        return;
      }

      const data = await res.json();
      console.log("Payroll Response:", data);

      if (data.success && data.data) {
        setUserData(data.data);
      } else {
        toast.error("No payroll record found.");
      }
    } catch (err) {
      console.error("Error fetching payroll:", err);
      toast.error("Something went wrong while fetching payroll");
    }
  };

  const breakdown = userData
    ? [
        { label: "Basic Salary (50%)", amount: userData.ctc * 0.5 },
        { label: "House Rent Allowance (12.5%)", amount: userData.ctc * 0.125 },
        { label: "Standard Allowance (10%)", amount: userData.ctc * 0.1 },
        { label: "Performance Bonus (10%)", amount: userData.ctc * 0.1 },
        {
          label: "Leave Travel Allowance (7.5%)",
          amount: userData.ctc * 0.075,
        },
        { label: "Fixed Allowance (10%)", amount: userData.ctc * 0.1 },
      ]
    : [];

  const deductions = userData
    ? [
        {
          label: "PF Employee (12% of Basic)",
          amount: userData.ctc * 0.5 * 0.12,
        },
        { label: "Professional Tax", amount: 200 },
        {
          label: "TDS Deduction (~5%)",
          amount: (userData.ctc - userData.ctc * 0.5 * 0.12 - 200) * 0.05,
        },
      ]
    : [];

  const totalEarnings =
    breakdown.reduce((acc, item) => acc + item.amount, 0) || 0;
  const totalDeductions =
    deductions.reduce((acc, item) => acc + item.amount, 0) || 0;
  const netPayable = totalEarnings - totalDeductions;

  return (
    <div className="p-8 space-y-8">
      <Button onClick={() => toPDF()}>Download Report PDF</Button>
      <div ref={targetRef} className="m-4 space-y-5 bg-white p-4">
        <Card className="bg-white text-black p-4">
          <CardHeader>
            <CardTitle>Employee Payroll Details</CardTitle>
          </CardHeader>
          <CardContent>
            {userData ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>{userData.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>{userData.email}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Role</TableCell>
                    <TableCell>{userData.role}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Joined At</TableCell>
                    <TableCell>
                      {new Date(userData.joinedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CTC</TableCell>
                    <TableCell>₹ {userData.ctc?.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Created At</TableCell>
                    <TableCell>
                      {new Date(userData.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No payroll data available.
              </p>
            )}
          </CardContent>
        </Card>

        {userData && (
          <Card className="bg-white text-black p-4">
            <CardHeader>
              <CardTitle>CTC Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breakdown.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.label}</TableCell>
                      <TableCell>{item.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-semibold">
                      Gross Earnings
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹ {totalEarnings.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Deductions</h3>
                <Table>
                  <TableBody>
                    {deductions.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.label}</TableCell>
                        <TableCell>{item.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-semibold">
                        Total Deductions
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹ {totalDeductions.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-6 text-right text-xl font-bold">
                  Net Payable: ₹ {netPayable.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
