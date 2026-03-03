const mongoose = require("mongoose");
const Workspace = require("../models/Workspace");
const Project = require("../models/Project");
const User = require("../models/User");

// @desc    Create workspace
// @route   POST /api/workspaces
// @access  Private
exports.createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;

    const workspace = await Workspace.create({
      name,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "Owner" }],
    });

    res.status(201).json({ success: true, data: workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my workspaces
// @route   GET /api/workspaces
// @access  Private
exports.getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user._id,
    }).populate("owner", "name email");

    res.status(200).json({ success: true, data: workspaces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update workspace
// @route   PUT /api/workspaces/:workspaceId
// @access  Private
exports.updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name } = req.body;

    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ success: false, message: "Invalid workspaceId" });
    }

    // Check if user is owner or admin
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
      "members.role": { $in: ["Owner", "Admin"] },
    });

    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found or insufficient permissions" });
    }

    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { name },
      { new: true, runValidators: true }
    ).populate("owner", "name email");

    res.status(200).json({ success: true, data: updatedWorkspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:workspaceId
// @access  Private
exports.deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ success: false, message: "Invalid workspaceId" });
    }

    // Check if user is owner
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
      "members.role": "Owner",
    });

    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found or insufficient permissions" });
    }

    // Delete all projects in this workspace
    await Project.deleteMany({ workspace: workspaceId });

    // Delete the workspace
    await Workspace.findByIdAndDelete(workspaceId);

    res.status(200).json({ success: true, message: "Workspace deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get workspace members
// @route   GET /api/workspaces/:workspaceId/members
// @access  Private
exports.getWorkspaceMembers = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ success: false, message: "Invalid workspaceId" });
    }

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
    }).populate({
      path: "members.user",
      select: "name email"
    });

    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found or access denied" });
    }

    res.status(200).json({ success: true, data: workspace.members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Invite member to workspace
// @route   POST /api/workspaces/:workspaceId/members
// @access  Private
exports.inviteMember = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role = "Member" } = req.body;

    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ success: false, message: "Invalid workspaceId" });
    }

    // Check if user is owner or admin
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
      "members.role": { $in: ["Owner", "Admin"] },
    });

    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found or insufficient permissions" });
    }

    // Find user to invite
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if user is already a member
    const existingMember = workspace.members.find(
      member => member.user.toString() === userToInvite._id.toString()
    );

    if (existingMember) {
      return res.status(400).json({ success: false, message: "User is already a member" });
    }

    // Add member
    workspace.members.push({ user: userToInvite._id, role });
    await workspace.save();

    await workspace.populate({
      path: "members.user",
      select: "name email"
    });

    const newMember = workspace.members[workspace.members.length - 1];
    res.status(201).json({ success: true, data: newMember });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update member role
// @route   PUT /api/workspaces/:workspaceId/members/:memberId
// @access  Private
exports.updateMemberRole = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;
    const { role } = req.body;

    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ success: false, message: "Invalid workspaceId" });
    }

    // Check if user is owner
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
      "members.role": "Owner",
    });

    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found or insufficient permissions" });
    }

    // Find and update member
    const member = workspace.members.id(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    // Prevent owner from changing their own role
    if (member.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot change your own role" });
    }

    member.role = role;
    await workspace.save();

    await workspace.populate({
      path: "members.user",
      select: "name email"
    });

    const updatedMember = workspace.members.id(memberId);
    res.status(200).json({ success: true, data: updatedMember });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove member from workspace
// @route   DELETE /api/workspaces/:workspaceId/members/:memberId
// @access  Private
exports.removeMember = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;

    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ success: false, message: "Invalid workspaceId" });
    }

    // Check if user is owner
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
      "members.role": "Owner",
    });

    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found or insufficient permissions" });
    }

    // Find member to remove
    const member = workspace.members.id(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    // Prevent owner from removing themselves
    if (member.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot remove yourself from workspace" });
    }

    // Remove member
    workspace.members.pull(memberId);
    await workspace.save();

    res.status(200).json({ success: true, message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};