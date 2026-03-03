const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");

// Create task inside project
exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, priority, dueDate, assignedTo, status } = req.body;

    // validate projectId
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid projectId" });
    }

    // check project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      workspace: project.workspace,
      createdBy: req.user._id,
      assignedTo,
      status,
      priority,
      dueDate,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get tasks by project
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid projectId" });
    }

    const tasks = await Task.find({ project: projectId })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority, dueDate, assignedTo, status } = req.body;

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, message: "Invalid taskId" });
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      { title, description, priority, dueDate, assignedTo, status },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email")
     .populate("assignedTo", "name email");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, message: "Invalid taskId" });
    }

    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};