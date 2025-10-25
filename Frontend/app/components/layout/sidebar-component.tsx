import { cn } from "@/lib/utils";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import {
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  ListCheck,
  LogOut,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarNav } from "./sidebar-nav";

interface SidebarProps {
  currentWorkspace: Workspace | null;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export const SidebarComponent = ({
  currentWorkspace,
  isMobileOpen = false,
  setIsMobileOpen,
}: SidebarProps) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Workspaces", href: "/workspaces", icon: Users },
    { title: "My Tasks", href: "/my-tasks", icon: ListCheck },
    { title: "Members", href: `/members`, icon: Users },
    { title: "Achieved", href: `/achieved`, icon: CheckCircle2 },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Sidebar overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-sidebar transition-transform duration-300 md:relative md:translate-x-0",
          isCollapsed ? "w-16 md:w-[80px]" : "w-16 md:w-[240px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0" // mobile slide
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-14 items-center border-b px-4 mb-4">
          <Link to="/dashboard" className="flex items-center">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <Wrench
                  className="size-6 text-green-600 cursor-pointer"
                  onClick={() => setIsMobileOpen?.(true)}
                />
                <span className="font-semibold text-lg hidden md:block">
                  TaskHub
                </span>
              </div>
            )}
            {isCollapsed && <Wrench className="size-6 text-green-600" />}
          </Link>

          {/* Desktop collapse toggle */}
          <Button
            variant={"ghost"}
            size="icon"
            className="ml-auto hidden md:block"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-2">
          <SidebarNav
            items={navItems.map((item) => ({
              ...item,
              onClick: () => setIsMobileOpen?.(false), // close sidebar on mobile
            }))}
            isCollapsed={isCollapsed}
            className={cn(isCollapsed && "items-center space-y-2")}
            currentWorkspace={currentWorkspace}
          />
        </ScrollArea>

        {/* Logout button */}
        <div className="mt-auto mb-4 px-3">
          <Button
            variant={"ghost"}
            size={isCollapsed ? "icon" : "default"}
            onClick={logout}
            className="cursor-pointer fixed bottom-2 w-full flex items-center justify-start"
          >
            <LogOut className={cn("size-4", isCollapsed && "mr-2")} />
            {!isCollapsed && <span className="hidden md:block">Logout</span>}
          </Button>
        </div>
      </div>
    </>
  );
};
