const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

router.post("/", protect, createTask);
router.get("/project/:projectId", protect, getTasksByProject);
router.put("/:taskId", protect, updateTask);
router.delete("/:taskId", protect, deleteTask);

module.exports = router;