import type { User, Workspace } from "@/types";

import { Button } from "../ui/button";
import { Plus, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { WorkspaceAvatar } from "./workspace-avator";

interface WorkspaceHeaderProps {
  workspace: Workspace;
  members: {
    _id: string;
    user: User;
    role: "admin" | "member" | "owner" | "viewer";
    joinedAt: Date;
  }[];
  onCreateProject: () => void;
  onInviteMember: () => void;
}

export const WorkspaceHeader = ({
  workspace,
  members,
  onCreateProject,
  onInviteMember,
}: WorkspaceHeaderProps) => {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-3">
          <div className="flex md:items-center gap-3">
            {workspace.color && (
              <WorkspaceAvatar color={workspace.color} name={workspace.name} />
            )}

            <h2 className="text-xl md:text-2xl font-semibold">
              {workspace.name.charAt(0).toUpperCase() + workspace.name.slice(1)}
            </h2>
          </div>

          <div className="flex items-center gap-3 justify-between md:justify-start mb-4 md:mb-0">
            <Button variant={"outline"} onClick={onInviteMember}>
              <UserPlus className="size-4 mr-2" />
              Invite
            </Button>
            <Button onClick={onCreateProject}>
              <Plus className="size-4 mr-2" />
              Create Project
            </Button>
          </div>
        </div>

        {workspace.description && (
          <p className="text-sm md:text-base text-muted-foreground">
            {workspace.description}
          </p>
        )}
      </div>

      {members.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Members</span>

          <div className="flex space-x-2">
  {members.map((member) => {
    // Generate a consistent fallback color based on user's name
    const colors = ["bg-red-800","bg-blue-800", "bg-green-800",  "bg-yellow-800", "bg-purple-800"];
    const color = colors[member.user.name.charCodeAt(0) % colors.length];

    return (
      <Avatar
        key={member._id} // Unique key for each member
        className="relative h-8 w-8 rounded-full border-2 border-background overflow-hidden"
        title={member.user.name} // Tooltip on hover
      >
        {/* Display user's profile picture */}
        <AvatarImage
          src={member.user.profilePicture}
          alt={member.user.name}
        />
        {/* Fallback avatar with first letter if image is missing */}
        <AvatarFallback className={`${color} text-white`}>
          {member.user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    );
  })}
</div>
        </div>
      )}
    </div>
  );
};