import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { toast } from "sonner";

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await authClient.getSession();
        if (data?.user) {
          setUserId(data.user.id);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleCheckIn = async () => {
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const checkInTime = data.checkInTime
          ? new Date(data.checkInTime)
          : new Date();
        const formattedTime = checkInTime.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });

        toast.success(`Checked in successfully at ${formattedTime}`);
        setCheckInTime(formattedTime);
        setIsCheckedIn(true);
      } else {
        toast.error(data.message || "Failed to check in");
      }
    } catch (error) {
      console.error("Check-in failed:", error);
      toast.error("Network or server error");
    }
  };

  const handleCheckOut = async () => {
    if (!userId) return toast.error("User not found");

    try {
      const res = await client.api["check-out"].$post({
        json: {
          userId,
          checkOutTime: new Date().toISOString(),
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Check-out failed");
        return;
      }

      setIsCheckedIn(false);
      toast.success(
        "Checked out successfully at " + new Date().toLocaleTimeString()
      );
    } catch (err) {
      console.error("Check-out error:", err);
      toast.error("Something went wrong during check-out");
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
              <Button variant="destructive" onClick={handleCheckIn}>Check In</Button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Checked in at:{" "}
                  <span className="font-semibold text-foreground">
                    {checkInTime}
                  </span>
                </span>
                <Button onClick={handleCheckOut}>
                  Check Out
                </Button>
              </div>
            )}
          </div>
        </header>

        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
