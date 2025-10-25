import type { ProjectStatus, Task, TaskStatus } from "@/types";

export const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/reset-password",
  "/forgot-password",
  "*",
];


// Function to return Tailwind CSS classes based on task status
export const getTaskStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case "In Progress":
      // Blue color for tasks that are currently in progress
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "Completed":
      // Green color for completed tasks
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "Cancelled":
      // Red color for cancelled tasks
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "On Hold":
      // Yellow color for tasks that are on hold
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "Planning":
      // Purple color for tasks that are in planning stage
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    default:
      // Gray color as fallback for unknown status
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

// Function to calculate project progress percentage based on tasks
export const getProjectProgress = (tasks: { status: TaskStatus }[]) => {
  const totalTasks = tasks.length; // Total number of tasks in the project

  // Count tasks that are completed (status === "Done")
  const completedTasks = tasks.filter((task) => task?.status === "Done").length;

  // Calculate progress as a percentage
  // If there are no tasks, return 0
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return progress; // Return progress percentage (0-100)
};
