import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { projectSchema } from "../libs/validate-schema.js";
import { validateRequest } from "zod-express-middleware";
import { createProject, getProjectDetails, getProjectTasks } from "../controllers/project.js";
import z from "zod";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

/**
 * @route POST /:workspaceId/create-project
 * @desc Create a new project inside a workspace
 */
router.post(
  "/:workspaceId/create-project",
  authMiddleware,
  validateObjectId("workspaceId"), // ✅ Validate workspaceId
  validateRequest({
    params: z.object({
      workspaceId: z.string(),
    }),
    body: projectSchema,
  }),
  createProject
);

/**
 * @route GET /:projectId
 * @desc Get project details by ID
 */
router.get(
  "/:projectId",
  authMiddleware,
  validateObjectId("projectId"), // ✅ Validate projectId
  validateRequest({
    params: z.object({ projectId: z.string() }),
  }),
  getProjectDetails
);

/**
 * @route GET /:projectId/tasks
 * @desc Get all tasks under a specific project
 */
router.get(
  "/:projectId/tasks",
  authMiddleware,
  validateObjectId("projectId"), // ✅ Validate projectId
  validateRequest({
    params: z.object({ projectId: z.string() }),
  }),
  getProjectTasks
);

export default router;
