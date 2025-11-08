import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { toast } from "sonner";
import { ModeToggleSimple } from "../ui/modeToggle";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  // BreadcrumbPage,
  // BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/hono-client";
import { Textarea } from "../ui/textarea";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("An application for leave.");

  useEffect(() => {
    const checkIsCheckedIn = async () => {
      try {
        const { data } = await authClient.getSession();
        if (data?.user) {
          setUserId(data.user.id);
        } else {
          navigate("/login");
        }

        if (data) {
          const res = await client.api["attendance-status"][":userId"].$get({
            param: { userId: data.user.id },
          });

          const userAttendanceData = await res.json();

          if (userAttendanceData.success) {
            setIsCheckedIn(userAttendanceData.memberStatus === "PRESENT");
            setCheckInTime(
              new Date(userAttendanceData.time).toLocaleTimeString()
            );
          }
        }
      } catch (err) {
        console.error(`Error fetching status for ${userId}:`, err);
        return {
          status: "ERROR",
        };
      }
    };
    checkIsCheckedIn();
  }, [navigate]);

  const handleCheckIn = async () => {
    try {
      if (!userId) return toast.error("User not found");
      const res = await client.api.attendance.$post({
        json: { userId, type: "CHECKIN" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message || "Checked in successfully!");
      setIsCheckedIn(true);
      setCheckInTime(new Date(data.time).toLocaleTimeString());
    } catch (error: any) {
      console.error("Check-in error:", error);
      toast.error(error.message || "Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    try {
      if (!userId) return toast.error("User not found");
      const res = await client.api.attendance.$post({
        json: { userId, type: "CHECKOUT" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message || "Checked out successfully!");
      setIsCheckedIn(false);
      setCheckInTime(null);
    } catch (error: any) {
      console.error("Check-out error:", error);
      toast.error(error.message || "Failed to check out");
    }
  };

  const handleLeave = async () => {
    try {
      if (!userId) return toast.error("User not found");

      const res = await client.api.attendance.$post({
        json: {
          userId,
          type: "LEAVE",
          remarks: remarks || "An application for leave.",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message || "Leave request sent!");
    } catch (error: any) {
      console.error("Leave error:", error);
      toast.error(error.message || "Failed to send leave request");
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="floating" />
      <SidebarInset className="px-2">
        <header className="flex h-16 items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                {/* <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem> */}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2">
            {!isCheckedIn ? (
              <div className="space-x-2 flex">
                <Button variant="destructive" onClick={handleCheckIn}>
                  Check In
                </Button>
                <Dialog>
                  <form>
                    <DialogTrigger asChild>
                      <Button>Leave</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                          Make changes to your profile here. Click save when
                          you&apos;re done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor="name-1">Leave Application</Label>
                          <Textarea
                            id="name-1"
                            name="name"
                            value={remarks}
                            placeholder="Start writing here..."
                            onChange={(e) => setRemarks(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" onClick={handleLeave}>
                          Save changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </form>
                </Dialog>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Checked in at:{" "}
                  <span className="font-semibold text-foreground">
                    {checkInTime}
                  </span>
                </span>
                <Button onClick={handleCheckOut}>Check Out</Button>
              </div>
            )}
            <div className="space-x-2">
              <ModeToggleSimple />
            </div>
          </div>
        </header>

        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
