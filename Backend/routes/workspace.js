import express from "express"
import { validateRequest } from "zod-express-middleware";



import { workspaceSchema } from "../libs/validate-schema.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { createWorkspace, getWorkspaceDetails, getWorkspaceProjects, getWorkspaces, getWorkspaceStats } from "../controllers/workspace.js";
const router =express.Router();

// Define a POST route at "/" to create a new workspace
// Middlewares run in order: authMiddleware -> validateRequest -> create controller
router.post(
  "/",
  authMiddleware,                    // 1️⃣ Check JWT token and attach user to req.user
  validateRequest({ body: workspaceSchema }),  // 2️⃣ Validate request body using workspaceSchema
  createWorkspace                           // 3️⃣ Controller function to create workspace in DB
);


router.get(
  "/",
  authMiddleware,                    // 1️⃣ Check JWT token and attach user to req.user  // 2️⃣ Validate request body using workspaceSchema
  getWorkspaces                           // 3️⃣ Controller function to create workspace in DB
);


router.get(
  "/:workspaceID",
  authMiddleware,                    
  getWorkspaceDetails                           
);

router.get("/:workspaceId/projects", 
    authMiddleware,
     getWorkspaceProjects);


router.get("/:workspaceId/stats", 
    authMiddleware,
     getWorkspaceStats);

export default router