const mongoose = require("mongoose");
const Project = require("../models/Project");
const Workspace = require("../models/Workspace");
const Task = require("../models/Task");
const User = require("../models/User");

// Create a project inside a workspace
exports.createProject = async (req, res) => {
  try {
    const { name, workspaceId, description } = req.body;

    // Validate workspaceId
    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ success: false, message: "Invalid workspaceId" });
    }

    // Check workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    const project = await Project.create({
      name,
      workspace: workspaceId,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "Owner" }],
      description,
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all projects in a workspace
exports.getProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Validate workspaceId
    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ success: false, message: "Invalid workspaceId" });
    }

    const projects = await Project.find({
      workspace: workspaceId,
      "members.user": req.user._id,
    })
      .populate("owner", "name email")
      .populate({
        path: "members.user",
        select: "name email",
      });

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid projectId" });
    }

    const canEdit = await Project.findOne({
      _id: projectId,
      "members.user": req.user._id,
      "members.role": { $in: ["Owner", "Admin"] },
    });

    if (!canEdit) {
      return res.status(404).json({ success: false, message: "Project not found or insufficient permissions" });
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      { name, description, status },
      { new: true, runValidators: true }
    )
      .populate("owner", "name email")
      .populate({
        path: "members.user",
        select: "name email",
      });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid projectId" });
    }

    const canDelete = await Project.findOne({
      _id: projectId,
      "members.user": req.user._id,
      "members.role": "Owner",
    });

    if (!canDelete) {
      return res.status(404).json({ success: false, message: "Project not found or insufficient permissions" });
    }

    // First delete all tasks in this project
    await Task.deleteMany({ project: projectId });

    // Then delete the project
    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid projectId" });
    }

    const project = await Project.findOne({
      _id: projectId,
      "members.user": req.user._id,
    }).populate({
      path: "members.user",
      select: "name email",
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or access denied" });
    }

    res.status(200).json({ success: true, data: project.members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.inviteProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role = "Member" } = req.body;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid projectId" });
    }

    const project = await Project.findOne({
      _id: projectId,
      "members.user": req.user._id,
      "members.role": { $in: ["Owner", "Admin"] },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or insufficient permissions" });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const workspace = await Workspace.findOne({
      _id: project.workspace,
      "members.user": userToInvite._id,
    });

    if (!workspace) {
      return res.status(400).json({ success: false, message: "User must be a workspace member before being added to the project" });
    }

    const existingMember = project.members.find(
      (m) => m.user.toString() === userToInvite._id.toString()
    );

    if (existingMember) {
      return res.status(400).json({ success: false, message: "User is already a project member" });
    }

    project.members.push({ user: userToInvite._id, role });
    await project.save();

    await project.populate({
      path: "members.user",
      select: "name email",
    });

    const newMember = project.members[project.members.length - 1];
    res.status(201).json({ success: true, data: newMember });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProjectMemberRole = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid projectId" });
    }

    const project = await Project.findOne({
      _id: projectId,
      "members.user": req.user._id,
      "members.role": "Owner",
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or insufficient permissions" });
    }

    const member = project.members.id(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    if (member.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot change your own role" });
    }

    member.role = role;
    await project.save();

    await project.populate({
      path: "members.user",
      select: "name email",
    });

    const updatedMember = project.members.id(memberId);
    res.status(200).json({ success: true, data: updatedMember });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeProjectMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid projectId" });
    }

    const project = await Project.findOne({
      _id: projectId,
      "members.user": req.user._id,
      "members.role": "Owner",
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or insufficient permissions" });
    }

    const member = project.members.id(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    if (member.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot remove yourself from project" });
    }

    if (member.role === "Owner") {
      return res.status(400).json({ success: false, message: "Cannot remove an Owner from the project" });
    }

    project.members.pull(memberId);
    await project.save();

    res.status(200).json({ success: true, message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};