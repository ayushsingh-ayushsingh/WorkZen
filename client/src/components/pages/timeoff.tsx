import { useEffect, useState } from "react";
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
import { client } from "@/lib/hono-client";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";

interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: string;
  time: string;
  status: string;
  remarks: string | null;
}

export default function TimeOff() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await client.api["leave-logs"].$post({
        json: { userId: "ayushsingh" },
      });

      const data = await res.json();
      const logsArray = (data.logs || data.result) as
        | LeaveRequest[]
        | undefined;

      if (data.success && Array.isArray(logsArray)) {
        // Filter only leave requests
        setLeaves(logsArray.filter((l) => l.type === "LEAVE"));
      } else {
        setLeaves([]);
      }
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      setLeaves([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (leaveId: string) => {
    try {
      const res = await client.api["approve-leave"].$post({
        json: { leaveId },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Leave approved!");
        fetchLeaves(); // refresh table
      } else {
        toast.error(data.message || "Failed to approve leave");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve leave");
    }
  };

  const handleReject = async (leaveId: string) => {
    try {
      const res = await client.api["reject-leave"].$post({
        json: { leaveId },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Leave rejected!");
        fetchLeaves(); // refresh table
      } else {
        toast.error(data.message || "Failed to reject leave");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject leave");
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div className="p-6">
      <div className="w-full flex justify-end">
        <Button onClick={fetchLeaves}>
          <RefreshCcw />
        </Button>
      </div>
      {/* Days banner */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4 my-6">
        <div className="text-center bg-muted p-4 rounded-lg">
          <div className="text-muted-foreground font-bold">Paid Time Off</div>
          <div className="text-3xl">24 Days</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-muted-foreground font-bold">Sick Time Off</div>
          <div className="text-3xl">7 Days</div>
        </div>
      </div>

      {/* Leaves Table */}
      <Table className="max-w-5xl w-full mx-auto">
        <TableCaption>List of leave requests from employees</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Loading leave requests...
              </TableCell>
            </TableRow>
          ) : leaves.length > 0 ? (
            leaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell className="font-medium">{leave.userName}</TableCell>
                <TableCell>{leave.type}</TableCell>
                <TableCell>
                  {new Date(leave.time).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-muted-foreground italic max-w-xs truncate">
                  {leave.remarks || "N/A"}
                </TableCell>
                <TableCell>
                  {leave.status === "approved" ? (
                    <span className="text-green-600 font-semibold">
                      Approved
                    </span>
                  ) : leave.status === "rejected" ? (
                    <span className="text-red-600 font-semibold">Rejected</span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">
                      Pending
                    </span>
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" onClick={() => handleApprove(leave.id)}>
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReject(leave.id)}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No leave requests found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
