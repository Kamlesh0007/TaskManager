import Workspace from "../models/workspace.js"; // Import Workspace Mongoose model
import Project from "../models/projects.js";     // Import Project Mongoose model
import Task from "../models/task.js";

//////////////////////////////
// CREATE PROJECT CONTROLLER //
//////////////////////////////
const createProject = async (req, res) => {
  try {
    // Extract workspaceId from URL parameters
    const { workspaceId } = req.params;

    // Extract project details from request body
    const { title, description, status, startDate, dueDate, tags, members } = req.body;

    // Find the workspace by ID
    const workspace = await Workspace.findById(workspaceId);

    // If workspace not found, return 404
    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Check if the current user is a member of the workspace
    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    // If user is not a member, return 403 Forbidden
    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Convert comma-separated tags string into array
    const tagArray = tags ? tags.split(",") : [];

    // Create a new project in the database
    const newProject = await Project.create({
      title,
      description,
      status,
      startDate,
      dueDate,
      tags: tagArray,
      workspace: workspaceId, // associate project with workspace
      members,               // project members (from request)
      createdBy: req.user._id, // track who created the project
    });

    // Add the newly created project ID to workspace's projects array
    workspace.projects.push(newProject._id);
    await workspace.save(); // Save the updated workspace

    // Respond with the newly created project
    return res.status(201).json(newProject);
  } catch (error) {
    console.log(error); // Log any unexpected errors

    // Respond with 500 Internal Server Error
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//////////////////////////////
// GET PROJECT DETAILS       //
//////////////////////////////
const getProjectDetails = async (req, res) => {
  try {
    // Extract projectId from URL parameters
    const { projectId } = req.params;

    // Find the project by ID
    const project = await Project.findById(projectId);

    // If project not found, return 404
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check if the current user is a member of the project
    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    // If user is not a member, return 403 Forbidden
    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    // Respond with project details
    res.status(200).json(project);
  } catch (error) {
    console.log(error); // Log any unexpected errors

    // Respond with 500 Internal Server Error
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("members.user");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const tasks = await Task.find({
      project: projectId,
      isArchived: false,
    })
      .populate("assignees", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      project,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { createProject, getProjectDetails,getProjectTasks };
