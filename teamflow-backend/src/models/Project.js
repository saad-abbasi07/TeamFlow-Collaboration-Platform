const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["Owner", "Admin", "Member"], default: "Member" },
      },
    ],
    description: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Completed"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);