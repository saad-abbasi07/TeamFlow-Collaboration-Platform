const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  getProjectMembers,
  inviteProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
} = require("../controllers/projectController");
const protect = require("../middleware/authMiddleware");

// Create project
router.post("/", protect, createProject);

// Project member management routes
router.get("/:projectId/members", protect, getProjectMembers);
router.post("/:projectId/members", protect, inviteProjectMember);
router.put("/:projectId/members/:memberId", protect, updateProjectMemberRole);
router.delete("/:projectId/members/:memberId", protect, removeProjectMember);

// Get projects in workspace
router.get("/:workspaceId", protect, getProjects);

// Update project
router.put("/:projectId", protect, updateProject);

// Delete project
router.delete("/:projectId", protect, deleteProject);

module.exports = router;