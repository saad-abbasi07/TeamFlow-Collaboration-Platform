const express = require("express");
const router = express.Router();
const { 
  createWorkspace, 
  getMyWorkspaces, 
  updateWorkspace, 
  deleteWorkspace,
  getWorkspaceMembers,
  inviteMember,
  updateMemberRole,
  removeMember
} = require("../controllers/workspaceController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, createWorkspace);
router.get("/", protect, getMyWorkspaces);
router.put("/:workspaceId", protect, updateWorkspace);
router.delete("/:workspaceId", protect, deleteWorkspace);

// Member management routes
router.get("/:workspaceId/members", protect, getWorkspaceMembers);
router.post("/:workspaceId/members", protect, inviteMember);
router.put("/:workspaceId/members/:memberId", protect, updateMemberRole);
router.delete("/:workspaceId/members/:memberId", protect, removeMember);

module.exports = router;