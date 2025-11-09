import {
  ClipboardPlus,
  Clock8,
  Frame,
  Settings,
  SquareTerminal,
  Zap,
  Users,
  DollarSign,
} from "lucide-react";
import { NavMain } from "@/components/layouts/nav-main";
import { NavProjects } from "@/components/layouts/nav-projects";
import { NavUser } from "@/components/layouts/nav-user";
import { TeamSwitcher } from "@/components/layouts/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { client } from "@/lib/hono-client";
import { toast } from "sonner";

const data = {
  navMain: [
    {
      title: "Frequent",
      url: "#",
      icon: Zap,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "Home",
          url: "/",
        },
        {
          title: "Profile",
          url: "/dashboard/profile",
        },
      ],
    },
    {
      title: "Github",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Creator",
          url: "https://www.github.com/ayushsingh-ayushsingh/",
        },
        {
          title: "This Project",
          url: "https://github.com/ayushsingh-ayushsingh/WorkZen",
        },
        {
          title: "All Creations",
          url: "https://github.com/ayushsingh-ayushsingh?tab=repositories",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Employees",
      url: "/dashboard/employees",
      icon: Users,
    },
    {
      name: "Attendance",
      url: "/dashboard/attendance",
      icon: Frame,
    },
    {
      name: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
    {
      name: "Reports",
      url: "/dashboard/reports",
      icon: ClipboardPlus,
    },
  ],
};

const adminData = {
  navMain: [
    {
      title: "Frequent",
      url: "#",
      icon: Zap,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "Home",
          url: "/",
        },
        {
          title: "Profile",
          url: "/dashboard/profile",
        },
      ],
    },
    {
      title: "Github",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Creator",
          url: "https://www.github.com/ayushsingh-ayushsingh/",
        },
        {
          title: "This Project",
          url: "https://github.com/ayushsingh-ayushsingh/WorkZen",
        },
        {
          title: "All Creations",
          url: "https://github.com/ayushsingh-ayushsingh?tab=repositories",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Employees",
      url: "/dashboard/employees",
      icon: Users,
    },
    {
      name: "Attendance",
      url: "/dashboard/attendance",
      icon: Frame,
    },
    {
      name: "Time Off",
      url: "/dashboard/timeoff",
      icon: Clock8,
    },
    {
      name: "Payroll",
      url: "/dashboard/payroll",
      icon: DollarSign,
    },
    {
      name: "Reports",
      url: "/dashboard/reports",
      icon: ClipboardPlus,
    },
    {
      name: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await authClient.getSession();
      if (data?.user) {
        setUser(data.user);
      }
    };
    fetchUser();
  }, []);

  const [_membersList, setMembersList] = useState<any[]>([]);
  const [_orgId, setOrgId] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");

  useEffect(() => {
    getOrganizationMembersByUserId();
    init();
  }, []);

  const init = async () => {
    const members = await getOrganizationMembersByUserId();
    if (members?.length) await fetchMemberStatuses(members);
  };

  const getOrganizationMembersByUserId = async () => {
    try {
      const user = await authClient.getSession();
      if (!user.data) {
        toast.error("Try logging in again!");
        return [];
      }

      const res = await client.api["organisation-members-by-user-id"].$post({
        json: { userId: user.data.user.id },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data?.members) {
          setOrgId(data.data.id);
          setMembersList(data.data.members);
          return data.data.members;
        }
      }
    } catch (error) {
      console.error("Failed to fetch organization:", error);
    }
    return [];
  };

  const fetchMemberStatuses = async (membersList: any[]) => {
    try {
      const updatedMembers = await Promise.all(
        membersList.map(async (member: any) => {
          try {
            const res = await client.api["attendance-status"][":userId"].$get({
              param: { userId: member.user?.id },
            });
            const data = await res.json();

            if (data.success) {
              return {
                ...member,
                status: data.memberStatus ?? "ABSENT",
              };
            }
          } catch (err) {
            console.error(`Error fetching status for ${member.user?.id}:`, err);
            return {
              ...member,
              status: "ERROR",
            };
          }
        })
      );

      setMembersList(updatedMembers);

      const session = await authClient.getSession();
      if (!session.data) {
        toast.error("Try logging in again!");
        return;
      }

      const userData = session.data.user;

      const userRole = updatedMembers.find(
        (member) => member.user?.id === userData.id
      );
      setCurrentUserRole(userRole.role);
    } catch (error) {
      console.error("Error fetching member statuses:", error);
      toast.error("Failed to update member statuses");
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      {currentUserRole === "admin" ||
      currentUserRole === "payrollNamager" ||
      currentUserRole === "owner" ? (
        <SidebarContent>
          <NavMain items={adminData.navMain} />
          <NavProjects projects={adminData.projects} />
        </SidebarContent>
      ) : (
        <SidebarContent>
          <NavMain items={data.navMain} />
          <NavProjects projects={data.projects} />
        </SidebarContent>
      )}
      <SidebarFooter>
        {user && (
          <NavUser
            user={{
              name: user.name,
              avatar: user.image,
              email: user.email,
            }}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
