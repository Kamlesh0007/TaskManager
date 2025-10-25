import type { Project } from "@/types";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import { getProjectProgress, getTaskStatusColor } from "@/lib";

import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Progress } from "../ui/progress";

interface ProjectCardProps {
  project: Project;
  progress: number;
  workspaceId: string;
}

export const ProjectCard = ({
  project,
  progress,
  workspaceId,
}: ProjectCardProps) => {


  
  return (
    <Link to={`/workspaces/${workspaceId}/projects/${project._id}`}>
      <Card className="transition-all duration-300 hover:shadow-lg hover:translate-y-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{project.title.charAt(0).toUpperCase()+project.title.slice(1)}</CardTitle>
            <span
              className={cn(
                "text-xs font-medium rounded-full px-1.5 py-0.5",
                getTaskStatusColor(project.status)
              )}
            >
              {project.status}
            </span>
          </div>
          <CardDescription className="line-clamp-2">
            {project.description || "No description"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>

              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm gap-2 text-muted-foreground">
                <span>{project.tasks.length}</span>
                <span>Tasks</span>
              </div>

              {project.dueDate && (
                <div className="flex items-center text-xs text-muted-foreground ">
                  <CalendarDays className="w-4 h-4 pr-0.5" />
                  <span>{format(project.dueDate, "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};