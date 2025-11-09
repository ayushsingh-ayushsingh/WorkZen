import { client } from "@/lib/hono-client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCcw } from "lucide-react";
import { Button } from "../ui/button";

// Define the shape of a single log entry for better type safety
interface AttendanceLog {
  id: string;
  userId: string;
  userName: string;
  type: "CHECKIN" | "CHECKOUT" | "LEAVE";
  time: string; // ISO Date String
  status: string;
  remarks: string | null;
}

const Settings = () => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendanceLogs = async () => {
    setIsLoading(true);
    try {
      const res = await client.api["attendance-logs"].$post({
        json: {
          userId: "ayushsingh",
        },
      });
      const data = await res.json();

      const logsArray = (data.logs || data.result) as
        | AttendanceLog[]
        | undefined;

      if (data.success && Array.isArray(logsArray)) {
        setLogs(logsArray);
      } else {
        setLogs([]);
        console.error(
          "API response success: ",
          data.success,
          "Logs array is missing or invalid: ",
          data
        );
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceLogs();
  }, []);

  return (
    <div className="p-6">
      <div className="w-full flex justify-end">
        <Button onClick={fetchAttendanceLogs}>
          <RefreshCcw />
        </Button>
      </div>
      <Table className="max-w-5xl w-full mx-auto">
        <TableCaption>
          Chronological list of all attendance events, sorted by user name.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Loading attendance data...
              </TableCell>
            </TableRow>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.userName}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold text-background ${
                      log.type === "CHECKIN"
                        ? "bg-primary"
                        : log.type === "CHECKOUT"
                          ? "bg-destructive"
                          : "bg-yellow-400"
                    }`}
                  >
                    {log.type}
                  </span>
                </TableCell>
                <TableCell>{new Date(log.time).toLocaleTimeString()}</TableCell>
                <TableCell>{new Date(log.time).toLocaleDateString()}</TableCell>
                <TableCell className="text-muted-foreground italic max-w-xs truncate">
                  {log.remarks || "N/A"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No attendance logs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Settings;
