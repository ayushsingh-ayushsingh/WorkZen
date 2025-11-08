"use client";

import { Users } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { client } from "@/lib/hono-client";

export function TeamSwitcher() {
  const [orgData, setOrgData] = useState<any>();

  useEffect(() => {
    getMembersOrganizationByUserId();
  }, []);

  const getMembersOrganizationByUserId = async () => {
    try {
      const session = await authClient.getSession();
      if (!session.data) {
        toast.error("Try logging in again!");
        return;
      }

      const userData = session.data.user;

      const res = await client.api["organisation-members-by-user-id"].$post({
        json: {
          userId: userData.id,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data?.members) {
          setOrgData(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch organization:", error);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            {orgData?.image ? (
              <img src={orgData?.image} className="size-4" />
            ) : (
              <Users className="size-4" />
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {orgData?.name || "HRMS"}
            </span>
            <span className="truncate text-xs">
              {orgData?.slug || "Company"}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
