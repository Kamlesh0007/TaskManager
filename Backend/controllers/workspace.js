import Project from "../models/projects.js";
import Workspace from "../models/workspace.js";


const createWorkspace = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "owner",
          joinedAt: new Date(),
        },
      ],
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(workspaces);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceDetails = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Populate the 'members.user' field with actual user details from the User collection
// Only select the 'name', 'email', and 'profilePicture' fields of the user
const workspace = await Workspace.findById({
      _id: workspaceId,
    }).populate("members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}


const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

  // Find a single Workspace document where:
// 1. The workspace `_id` matches `workspaceId`
// 2. The current user (`req.user._id`) exists in the `members.user` array
const workspace = await Workspace.findOne({
  _id: workspaceId,             // Match the workspace by its unique ID
  "members.user": req.user._id, // Ensure the current user is a member of this workspace
})
// Populate the 'members.user' field with actual user details
// Only include 'name', 'email', and 'profilePicture' fields for each user
.populate("members.user", "name email profilePicture");
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Fetch all active projects in a workspace that the current user is a member of
const projects = await Project.find({
  workspace: workspaceId, // Only projects that belong to this workspace
  isArchived: false,      // Exclude projects that are archived
  // members: { 
  //   $elemMatch: { user: req.user._id } // Only include projects where the user is a member
  // },
})
// Populate the 'tasks' field of each project
// Only include the 'status' field for each task to optimize query performance
// .populate("tasks", "status")
// Sort projects by creation date in descending order (newest first)
.sort({ createdAt: -1 });

    res.status(200).json({ projects, workspace });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// 📊 Controller: Get detailed statistics for a workspace
const getWorkspaceStats = async (req, res) => {
  try {
    // Extract workspaceId from request parameters (e.g., /workspace/:workspaceId/stats)
    const { workspaceId } = req.params;

    // Find the workspace by ID
    const workspace = await Workspace.findById(workspaceId);

    // If workspace not found → return 404
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if the logged-in user is a member of the workspace
    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    // If user is not a workspace member → deny access
    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Fetch both:
    // 1️⃣ Total project count in this workspace
    // 2️⃣ All projects with their tasks populated (only selected fields)
    const [totalProjects, projects] = await Promise.all([
      Project.countDocuments({ workspace: workspaceId }),
      Project.find({ workspace: workspaceId })
        .populate(
          "tasks",
          "title status dueDate project updatedAt isArchived priority"
        )
        .sort({ createdAt: -1 }),
    ]);

    // 🧮 Count total tasks across all projects
    const totalTasks = projects.reduce(
      (acc, project) => acc + project.tasks.length,
      0
    );

    // 🟦 Count projects currently in progress
    const totalProjectInProgress = projects.filter(
      (project) => project.status === "In Progress"
    ).length;

    // ✅ Count tasks by status
    const totalTaskCompleted = projects.reduce(
      (acc, project) =>
        acc + project.tasks.filter((task) => task.status === "Done").length,
      0
    );

    const totalTaskToDo = projects.reduce(
      (acc, project) =>
        acc + project.tasks.filter((task) => task.status === "To Do").length,
      0
    );

    const totalTaskInProgress = projects.reduce(
      (acc, project) =>
        acc +
        project.tasks.filter((task) => task.status === "In Progress").length,
      0
    );

    // Flatten all tasks from all projects into a single array
    const tasks = projects.flatMap((project) => project.tasks);

    // 📅 Get tasks due in the next 7 days (upcoming)
    const upcomingTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      return (
        taskDate > today &&
        taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
    });

    // 📈 Initialize task trend chart data for each weekday
    const taskTrendsData = [
      { name: "Sun", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Mon", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Tue", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Wed", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Thu", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Fri", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Sat", completed: 0, inProgress: 0, toDo: 0 },
    ];

    // Generate an array of the last 7 days (for trend analysis)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    // 🧩 Populate taskTrendsData with how many tasks were updated each day by status
    for (const project of projects) {
      for (const task of project.tasks) {
        const taskDate = new Date(task.updatedAt);

        // Find the index of the day in last7Days that matches task update date
        const dayInDate = last7Days.findIndex(
          (date) =>
            date.getDate() === taskDate.getDate() &&
            date.getMonth() === taskDate.getMonth() &&
            date.getFullYear() === taskDate.getFullYear()
        );

        if (dayInDate !== -1) {
          // Get the short weekday name (Sun, Mon, etc.)
          const dayName = last7Days[dayInDate].toLocaleDateString("en-US", {
            weekday: "short",
          });

          // Find corresponding day object in taskTrendsData
          const dayData = taskTrendsData.find((day) => day.name === dayName);

          // Increment appropriate status counter
          if (dayData) {
            switch (task.status) {
              case "Done":
                dayData.completed++;
                break;
              case "In Progress":
                dayData.inProgress++;
                break;
              case "To Do":
                dayData.toDo++;
                break;
            }
          }
        }
      }
    }

    // 🧭 Project status distribution for pie chart
    const projectStatusData = [
      { name: "Completed", value: 0, color: "#10b981" },
      { name: "In Progress", value: 0, color: "#3b82f6" },
      { name: "Planning", value: 0, color: "#f59e0b" },
    ];

    for (const project of projects) {
      switch (project.status) {
        case "Completed":
          projectStatusData[0].value++;
          break;
        case "In Progress":
          projectStatusData[1].value++;
          break;
        case "Planning":
          projectStatusData[2].value++;
          break;
      }
    }

    // ⚙️ Task priority distribution
    const taskPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];

    for (const task of tasks) {
      switch (task.priority) {
        case "High":
          taskPriorityData[0].value++;
          break;
        case "Medium":
          taskPriorityData[1].value++;
          break;
        case "Low":
          taskPriorityData[2].value++;
          break;
      }
    }

    // 📊 Workspace productivity per project
    const workspaceProductivityData = [];

    for (const project of projects) {
      const projectTask = tasks.filter(
        (task) => task.project.toString() === project._id.toString()
      );

      const completedTask = projectTask.filter(
        (task) => task.status === "Done" && task.isArchived === false
      );

      workspaceProductivityData.push({
        name: project.title,
        completed: completedTask.length,
        total: projectTask.length,
      });
    }

    // 🧾 Summary stats object
    const stats = {
      totalProjects,
      totalTasks,
      totalProjectInProgress,
      totalTaskCompleted,
      totalTaskToDo,
      totalTaskInProgress,
    };

    // ✅ Send final JSON response
    res.status(200).json({
      stats,
      taskTrendsData,
      projectStatusData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks,
      recentProjects: projects.slice(0, 5), // only latest 5 projects
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  createWorkspace,
  getWorkspaces,getWorkspaceDetails,getWorkspaceProjects,getWorkspaceStats
}