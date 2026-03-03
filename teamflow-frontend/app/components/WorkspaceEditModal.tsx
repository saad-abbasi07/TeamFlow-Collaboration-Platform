"use client";

import { useState, useEffect } from "react";
import { EditModal } from "./EditModal";
import { Workspace, updateWorkspace } from "../services/workspaceService";

interface WorkspaceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace | null;
  onUpdate: () => void;
}

export function WorkspaceEditModal({ isOpen, onClose, workspace, onUpdate }: WorkspaceEditModalProps) {
  const [formData, setFormData] = useState({
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (workspace) {
      setFormData({
        name: workspace.name,
      });
    }
    setError("");
  }, [workspace, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Workspace name is required");
      return;
    }

    if (!workspace) return;

    setLoading(true);
    setError("");

    try {
      await updateWorkspace(workspace._id, {
        name: formData.name.trim(),
      });
      
      onUpdate();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update workspace";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!workspace) return null;

  return (
    <EditModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Edit Workspace"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Workspace Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter workspace name"
            required
          />
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
