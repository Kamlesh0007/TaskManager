import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { Link, useLoaderData, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Bell, PlusCircle, Wrench } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { WorkspaceAvatar } from "../workspace/workspace-avator";

interface HeaderProps {
  onWorkspaceSelected: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkspace: () => void;
  onToggleSidebar?: () => void; // added for mobile toggle
}

const Header = ({
  onWorkspaceSelected,
  selectedWorkspace,
  onCreateWorkspace,
  onToggleSidebar,
}: HeaderProps) => {
  const navigate = useNavigate();
  const { workspaces } = useLoaderData() as { workspaces: Workspace[] };
  const { user, logout } = useAuth();

  const handleOnClick = (ws: Workspace) => {
    onWorkspaceSelected(ws);
    onToggleSidebar?.(); // close sidebar on mobile when workspace selected
  };

  return (
    <div className="bg-background sticky top-0 z-40 border-b">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Mobile sidebar toggle */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Wrench
                  className="size-6 text-green-600 cursor-pointer"/>
          </Button>
        </div>

        {/* Workspace dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className=" md:flex" variant={"outline"}>
              {selectedWorkspace ? (
                <>
                  {selectedWorkspace.color && (
                    <WorkspaceAvatar
                      color={selectedWorkspace.color}
                      name={selectedWorkspace.name}
                    />
                  )}
                  <span className="font-medium ml-2">{selectedWorkspace?.name}</span>
                </>
              ) : (
                <span className=" md:font-medium">Select Workspace</span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuLabel>Workspace</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {workspaces?.map((ws) => (
                <DropdownMenuItem key={ws._id} onClick={() => handleOnClick(ws)}>
                  {ws.color && <WorkspaceAvatar color={ws.color} name={ws.name} />}
                  <span className="ml-2">{ws.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onCreateWorkspace}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Workspace
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right side: notifications and avatar */}
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost">
            <Bell />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full border-none cursor-pointer p-1 w-8 h-8">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profilePicture} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/user/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Header;
