import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavThreads } from "@/components/nav-threads"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Settings2Icon, FrameIcon, PieChartIcon, MapIcon, BookKey } from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Kiri AI",
      logo: (
        <BookKey />
      ),
      plan: "Free",
    },
  ],
  navMain: [
    // {
    //   title: "Playground",
    //   url: "#",
    //   icon: (
    //     <TerminalSquareIcon
    //     />
    //   ),
    //   isActive: true,
    //   items: [
    //     {
    //       title: "History",
    //       url: "#",
    //     },
    //     {
    //       title: "Starred",
    //       url: "#",
    //     },
    //     {
    //       title: "Settings",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Models",
    //   url: "#",
    //   icon: (
    //     <BotIcon
    //     />
    //   ),
    //   items: [
    //     {
    //       title: "Genesis",
    //       url: "#",
    //     },
    //     {
    //       title: "Explorer",
    //       url: "#",
    //     },
    //     {
    //       title: "Quantum",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: (
    //     <BookOpenIcon
    //     />
    //   ),
    //   items: [
    //     {
    //       title: "Introduction",
    //       url: "#",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "#",
    //     },
    //   ],
    // },
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  threads: [
    {
      name: "Design Engineering",
      url: "#",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: (
        <PieChartIcon
        />
      ),
    },
    {
      name: "Travel",
      url: "#",
      icon: (
        <MapIcon
        />
      ),
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  chatHistroy: any;
  handleThreadNavigate: (id: string) => void;
  handleThreadDelete: (mongoThreadId: string) => void;
  handleLogout: () => void;
  auth: any;
}

export function AppSidebar({ chatHistroy, handleThreadNavigate, handleLogout, handleThreadDelete, auth, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavThreads chatHistroy={chatHistroy} handleThreadNavigate={handleThreadNavigate} handleThreadDelete={handleThreadDelete} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} auth={auth} handleLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
