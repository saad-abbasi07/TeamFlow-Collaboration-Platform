"use client";

import { useState, useEffect } from "react";
import { EditModal } from "./EditModal";
import { Project, updateProject } from "../services/projectService";

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onUpdate: () => void;
}

export function ProjectEditModal({ isOpen, onClose, project, onUpdate }: ProjectEditModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active" as "Active" | "Completed",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        status: project.status || "Active",
      });
    }
    setError("");
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Project name is required");
      return;
    }

    if (!project) return;

    setLoading(true);
    setError("");

    try {
      await updateProject(project._id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
      });
      
      onUpdate();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update project";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  return (
    <EditModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Edit Project"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter project name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Enter project description"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Completed" })}
            className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </EditModal>
  );
}
