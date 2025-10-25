import express from "express";
import { validateRequest } from "zod-express-middleware";
import { taskSchema } from "../libs/validate-schema.js";
import authMiddleware from "../middleware/auth-middleware.js";
import z from "zod";
import {
  achievedTask,
  addComment,
  addSubTask,
  createTask,
  getActivityByResourceId,
  getCommentsByTaskId,
  getMyTasks,
  getTaskById,
  updateSubTask,
  updateTaskAssignees,
  updateTaskDescription,
  updateTaskPriority,
  updateTaskStatus,
  updateTaskTitle,
  watchTask,
} from "../controllers/task.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

/**
 * @route POST /:projectId/create-task
 * @desc Create a new task under a project
 */
router.post(
  "/:projectId/create-task",
  authMiddleware,
  validateObjectId("projectId"), // ✅ Validate projectId
  validateRequest({
    params: z.object({
      projectId: z.string(),
    }),
    body: taskSchema,
  }),
  createTask
);

/**
 * @route GET /:taskId
 * @desc Get task details by ID
 */
router.get(
  "/:taskId",
  authMiddleware,
  validateObjectId("taskId"), // ✅ Validate taskId
  validateRequest({
    params: z.object({
      taskId: z.string(),
    }),
  }),
  getTaskById
);

/**
 * @route PUT /:taskId/title
 * @desc Update task title
 */
router.put(
  "/:taskId/title",
  authMiddleware,
  validateObjectId("taskId"), // ✅ Validate taskId
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ title: z.string().min(1, "Title is required") }),
  }),
  updateTaskTitle
);

/**
 * @route PUT /:taskId/description
 * @desc Update task description
 */
router.put(
  "/:taskId/description",
  authMiddleware,
  validateObjectId("taskId"),
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ description: z.string().min(1, "Description is required") }),
  }),
  updateTaskDescription
);

/**
 * @route PUT /:taskId/status
 * @desc Update task status
 */
router.put(
  "/:taskId/status",
  authMiddleware,
  validateObjectId("taskId"),
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ status: z.string().min(1, "Status is required") }),
  }),
  updateTaskStatus
);

/**
 * @route PUT /:taskId/assignees
 * @desc Update task assignees
 */
router.put(
  "/:taskId/assignees",
  authMiddleware,
  validateObjectId("taskId"),
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ assignees: z.array(z.string()).min(1, "At least one assignee is required") }),
  }),
  updateTaskAssignees
);

/**
 * @route PUT /:taskId/priority
 * @desc Update task priority
 */
router.put(
  "/:taskId/priority",
  authMiddleware,
  validateObjectId("taskId"),
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ priority: z.string().min(1, "Priority is required") }),
  }),
  updateTaskPriority
);


router.post(
  "/:taskId/add-subtask",
  authMiddleware,  validateObjectId("taskId"),
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ title: z.string() }),
  }),
  addSubTask
);
router.put(
  "/:taskId/update-subtask/:subTaskId",
  authMiddleware,  validateObjectId("taskId"),
  validateRequest({
    params: z.object({ taskId: z.string(), subTaskId: z.string() }),
    body: z.object({ completed: z.boolean() }),
  }),
  updateSubTask
);

router.get(
  "/:resourceId/activity",validateObjectId("resourceId"),
  authMiddleware,
  validateRequest({
    params: z.object({ resourceId: z.string() }),
  }),
  getActivityByResourceId
);

router.post(
  "/:taskId/add-comment",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
    body: z.object({ text: z.string() }),
  }),
  addComment
);

router.get(
  "/:taskId/comments",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  getCommentsByTaskId
);



router.post(
  "/:taskId/watch",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  watchTask
);

router.post(
  "/:taskId/achieved",
  authMiddleware,
  validateRequest({
    params: z.object({ taskId: z.string() }),
  }),
  achievedTask
);



router.get(
  "/user/my-tasks",
  authMiddleware,
  getMyTasks
);


export default router;
