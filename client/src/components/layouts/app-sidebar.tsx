import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  SquareTerminal,
  Zap,
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
// import { NavLinks } from "./sidebar-links";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
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
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
  // links: [
  //   {
  //     name: "Payments",
  //     url: "/dashboard/payment",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Upload File",
  //     url: "/dashboard/upload",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavLinks projects={data.links} /> */}
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser
            user={{
              name: user.name,
              avatar:
                user.image ||
                "https://cdn.pixabay.com/photo/2025/10/12/16/36/sunset-glow-9890310_640.jpg",
              email: user.email,
            }}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
