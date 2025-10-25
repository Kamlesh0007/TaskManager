import { Loader } from '@/components/loader';
import { useGetMyTasksQuery } from '@/hooks/use-task';
import type { Task } from '@/types';
import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpRight, CheckCircle, Clock, FilterIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
const MyTasks = () => {
  const [searchParams,setSearchParams]=useSearchParams();
   const initialFilter = searchParams.get("filter") || "all";
  const initialSort = searchParams.get("sort") || "desc";
  const initialSearch = searchParams.get("search") || "";

  const [filter, setFilter] = useState<string>(initialFilter);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSort === "asc" ? "asc" : "desc"
  );
  const [search, setSearch] = useState<string>(initialSearch);



    const { data: myTasks, isLoading } = useGetMyTasksQuery() as {
    data: Task[];
    isLoading: boolean;
  };

   // Generate the final list of tasks based on filters and search input
const filteredTasks =
  myTasks?.length > 0 // ✅ Check if there are any tasks first
    ? myTasks
        // 1️⃣ Filter tasks based on the selected filter type
        .filter((task) => {
          // "all" → show all tasks
          if (filter === "all") return true;

          // "todo" → show only tasks with status "To Do"
          if (filter === "todo") return task.status === "To Do";

          // "inprogress" → show tasks currently in progress
          if (filter === "inprogress") return task.status === "In Progress";

          // "done" → show tasks that are completed
          if (filter === "done") return task.status === "Done";

          // "achieved" → show only archived tasks
          if (filter === "achieved") return task.isArchived === true;

          // "high" → show tasks with High priority
          if (filter === "high") return task.priority === "High";

          // Default → if filter doesn't match any case, include the task
          return true;
        })

        // 2️⃣ Further filter tasks by search term (title or description)
        .filter(
          (task) =>
            // Convert both to lowercase for case-insensitive matching
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.description?.toLowerCase().includes(search.toLowerCase())
        )

    // 3️⃣ If there are no tasks at all, return an empty array
    : [];

// 🧮 Sort tasks by their due date
const sortedTasks = [...filteredTasks].sort((a, b) => {
  // If both tasks have a dueDate, compare them
  if (a.dueDate && b.dueDate) {
    // If sorting direction is ascending (earliest first)
    return sortDirection === "asc"
      ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() // earlier date comes first
      : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(); // later date comes first
  }

  // If one or both tasks have no due date, keep their order unchanged
  return 0;
});

    // 🗂️ Separate tasks into columns or groups by their status
const todoTasks = sortedTasks.filter((task) => task.status === "To Do");

const inProgressTasks = sortedTasks.filter(
  (task) => task.status === "In Progress"
);

const doneTasks = sortedTasks.filter((task) => task.status === "Done");
// ✅ This effect runs whenever filter, sortDirection, or search changes
useEffect(() => {
  // Create an empty object to store URL parameters
  const params: Record<string, string> = {};

  // Loop through existing search params in the URL
  // and copy them into the params object
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  // ✅ Update URL parameters with the latest state values
  params.filter = filter; // e.g. "done" or "inprogress"
  params.sort = sortDirection; // "asc" or "desc"
  params.search = search; // user search text

  // ✅ Update the browser URL (without reloading the page)
  // so the current filter/sort/search state is reflected in the URL
  // e.g. ?filter=done&sort=asc&search=login
  setSearchParams(params, { replace: true });
}, [filter, sortDirection, search]);
// ⬆️ Runs every time these dependencies change
// ✅ This effect runs whenever the URL search parameters change
useEffect(() => {
  // Read parameters from the URL
  const urlFilter = searchParams.get("filter") || "all";
  const urlSort = searchParams.get("sort") || "desc";
  const urlSearch = searchParams.get("search") || "";

  // ✅ Update React state from URL if they differ
  if (urlFilter !== filter) setFilter(urlFilter);
  if (urlSort !== sortDirection)
    setSortDirection(urlSort === "asc" ? "asc" : "desc");
  if (urlSearch !== search) setSearch(urlSearch);
}, [searchParams]);
// ⬆️ Runs when the URL query params change

if (isLoading)
  return (
    <div>
      <Loader />
    </div>
  );

  return (
<div className="space-y-6">
      <div className="flex items-start md:items-center justify-between">
        <h1 className="text-2xl font-bold">My Tasks</h1>

        <div
          className="flex flex-col items-start md:flex-row md"
          itemScope
          gap-2
        >
          <Button
            variant={"outline"}
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
          >
            {sortDirection === "asc" ? "Oldest First" : "Newest First"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                <FilterIcon className="w-4 h-4" /> Filter
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("todo")}>
                To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("inprogress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("done")}>
                Done
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("achieved")}>
  Archived
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("high")}>
                High
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
       <Input
        placeholder="Search tasks ...."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <Tabs defaultValue="list">
   <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
        </TabsList>
  {/* LIST VIEW */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>
                {sortedTasks?.length} tasks assigned to you
              </CardDescription>
            </CardHeader>

      <CardContent>
              <div className="divide-y">
                {sortedTasks?.map((task) => (
                  <div key={task._id} className="p-4 hover:bg-muted/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-3">
                      <div className="flex">
                        <div className="flex gap-2 mr-2">
                          {task.status === "Done" ? (
                            <CheckCircle className="size-4 text-green-500" />
                          ) : (
                            <Clock className="size-4 text-yellow-500" />
                          )}
                        </div>

                        <div>
                          <Link
                            to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                            className="font-medium hover:text-primary hover:underline transition-colors flex items-center"
                          >
                            {task.title}
                            <ArrowUpRight className="size-4 ml-1" />
                          </Link>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant={
                                task.status === "Done" ? "default" : "outline"
                              }
                            >
                              {task.status}
                            </Badge>

                            {task.priority && (
                              <Badge
                                variant={
                                  task.priority === "High"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {task.priority}
                              </Badge>
                            )}

                            {task.isArchived && (
                              <Badge variant={"outline"}>Archived</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        {task.dueDate && (
                          <div>Due: {format(task.dueDate, "PPPP")}</div>
                        )}

                        <div>
                          Project:{" "}
                          <span className="font-medium">
                            {task.project.title}
                          </span>
                        </div>

                        <div>Modified on: {format(task.updatedAt, "PPPP")}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {sortedTasks?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No tasks found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
<TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-3  gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  To Do
                  <Badge variant={"outline"}>{todoTasks?.length}</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                {todoTasks?.map((task) => (
                  <Card
                    key={task._id}
                    className="px-3 hover:shadow-md transition-shadow"
                  >
                    <Link
                      to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                      className="block"
                    >
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {task.description || "No description "}
                      </p>

                      <div className="flex items-center mt-2 gap-2">
                        <Badge
                          variant={
                            task.priority === "High"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {task.priority}
                        </Badge>

                        {task.dueDate && (
                          <span className="text-sm text-muted-foreground">
                            {format(task.dueDate, "PPPP")}
                          </span>
                        )}
                      </div>
                    </Link>
                  </Card>
                ))}

                {todoTasks?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No tasks found
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  In Progress
                  <Badge variant={"outline"}>{inProgressTasks?.length}</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                {inProgressTasks?.map((task) => (
                  <Card
                    key={task._id}
                    className="px-3 hover:shadow-md transition-shadow"
                  >
                    <Link
                      to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                      className="block"
                    >
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {task.description || "No description "}
                      </p>

                      <div className="flex items-center mt-2 gap-2">
                        <Badge
                          variant={
                            task.priority === "High"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {task.priority}
                        </Badge>

                        {task.dueDate && (
                          <span className="text-sm text-muted-foreground">
                            {format(task.dueDate, "PPPP")}
                          </span>
                        )}
                      </div>
                    </Link>
                  </Card>
                ))}

                {inProgressTasks?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No tasks found
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Done
                  <Badge variant={"outline"}>{doneTasks?.length}</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                {doneTasks?.map((task) => (
                  <Card
                    key={task._id}
                    className="px-3 hover:shadow-md transition-shadow"
                  >
                    <Link
                      to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                      className="block"
                    >
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {task.description || "No description "}
                      </p>

                      <div className="flex items-center mt-2 gap-2">
                        <Badge
                          variant={
                            task.priority === "High"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {task.priority}
                        </Badge>

                        {task.dueDate && (
                          <span className="text-sm text-muted-foreground">
                            {format(task.dueDate, "PPPP")}
                          </span>
                        )}
                      </div>
                    </Link>
                  </Card>
                ))}

                {doneTasks?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No tasks found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
</div>
  )
}

export default MyTasks