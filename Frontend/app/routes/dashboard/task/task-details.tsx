import { BackButton } from '@/components/back-button';
import { Loader } from '@/components/loader';
import { CommentSection } from '@/components/task/comment-section';
import { SubTasksDetails } from '@/components/task/sub-task-details';
import { TaskActivity } from '@/components/task/task-activity';
import { TaskAssigneesSelector } from '@/components/task/task-assignees-selector';
import { TaskDescription } from '@/components/task/task-description';
import { TaskPrioritySelector } from '@/components/task/task-priority-selector';
import { TaskStatusSelector } from '@/components/task/task-status-selector';
import { TaskTitle } from '@/components/task/task-title';
import { Watchers } from '@/components/task/watcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useAchievedTaskMutation,
  useTaskByIdQuery,
  useWatchTaskMutation,
} from "@/hooks/use-task";
import { useAuth } from '@/provider/auth-context';
import type { Project, Task } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner';

const TaskDetails = () => {
  const { taskId, projectId, workspaceId } = useParams<{ taskId: string, projectId: string, workspaceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading } = useTaskByIdQuery(taskId!) as {
    data: {
      task: Task;
      project: Project;
    };
    isLoading: boolean;
  };

    const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
  const { mutate: achievedTask, isPending: isAchieved } =
    useAchievedTaskMutation();


  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!data) {
return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
        {/* 🔴 Custom Error Box */}
        <div className="bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:text-red-300 px-6 py-4 rounded-xl shadow-sm max-w-md w-full">
        <div className="flex justify-center items-center gap-2">
    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
    <p className="text-sm">Task not Found</p>
  </div>

        </div>

        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Go Back
        </Button>
      </div>
    );
  }

  const { task, project } = data;
  const isUserWatching = task?.watchers?.some(
    (watcher) => watcher._id.toString() === user?._id.toString()
  );

  const goBack = () => navigate(-1);

  const handleWatchTask = () => {
    watchTask(
      { taskId: task._id },
      {
        onSuccess: (data) => {
             // Check if the current user is now watching the task
        const isUserWatching = data?.watchers?.some(
          (watcher:string) => watcher.toString() === user?._id.toString()
        );

        // Show toast message based on new watch state
        if (isUserWatching) {
          toast.success("You are now watching this task");
        } else {
          toast.info("You stopped watching this task");
        }
        },
        onError: () => {
          toast.error("Failed to watch task");
        },
      }
    );
  };

  const handleAchievedTask = () => {
    achievedTask(
      { taskId: task._id },
      {
        onSuccess: (data) => {
           // Check if the task is now archived or unarchived
        if (data?.isArchived === true) {
          toast.success("Task Archived");
        } else {
          toast.success("Task unArchived");
        }
        },
        onError: () => {
          toast.error("Failed to Archive task");
        },
      }
    );
  };

  return (
    <div className="container mx-auto p-0 py-4 md:px-4">
      <BackButton />
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">

        <div className="flex flex-col md:flex-row md:items-center">

          <h1 className="text-xl md:text-2xl font-bold">{task.title.charAt(0).toUpperCase() + task.title.slice(1)}</h1>

          {task.isArchived && (
            <Badge className="ml-2" variant={"outline"}>
              Archived
            </Badge>
          )}
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button
            variant={"outline"}
            size="sm"
            onClick={handleWatchTask}
            className="w-fit"
          disabled={isWatching}
          >
            {isUserWatching ? (
              <>
                <EyeOff className="mr-2 size-4" />
                Unwatch
              </>
            ) : (
              <>
                <Eye className="mr-2 size-4" />
                Watch
              </>
            )}
          </Button>

          <Button
            variant={"outline"}
            size="sm"
            onClick={handleAchievedTask}
            className="w-fit"
                disabled={isAchieved}
          >
            {task.isArchived ? "Unarchive" : "Archive"}
          </Button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="md:w-[70%] w-full  lg:col-span-2">
          <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-4">
              <div>
                <Badge
                  variant={
                    task.priority === "High"
                      ? "destructive"
                      : task.priority === "Medium"
                        ? "default"
                        : "outline"
                  }
                  className="mb-2 capitalize"
                >
                  {task.priority} Priority
                </Badge>

                <TaskTitle title={task.title} taskId={task._id} />

                <div className="text-sm md:text-base text-muted-foreground">
                  Created at:{" "}
                  {formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true,
                  })}
                </div>

              </div>
              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <TaskStatusSelector status={task.status} taskId={task._id} />

                <Button
                  variant={"destructive"}
                  size="sm"
                  onClick={() => { }}
                  className=" md:block cursor-pointer"
                >
                  Delete Task
                </Button>
              </div>

            </div>
                 <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-0">
                Description
              </h3>

              <TaskDescription
                description={task.description || ""}
                taskId={task._id}
              />
            </div>
            <TaskAssigneesSelector task={task} assignees={task.assignees} projectMembers={project.members as any}/>
              <TaskPrioritySelector priority={task.priority} taskId={task._id} />
                  <SubTasksDetails subTasks={task.subtasks || []} taskId={task._id} />
          </div>
<CommentSection taskId={task._id} members={project.members as any} />
        </div>
            {/* right side */}
        <div className="md:w-[30%] w-full">
          <Watchers watchers={task.watchers || []} />

          <TaskActivity resourceId={task._id} />
        </div>
      </div>
    </div>


  )
}

export default TaskDetails