"use client";

import { useState, useEffect } from "react";
import { EditModal } from "./EditModal";
import { Task, updateTask } from "../services/taskService";
import { getWorkspaceMembers, type WorkspaceMember } from "../services/memberService";

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdate: () => void;
}

export function TaskEditModal({ isOpen, onClose, task, onUpdate }: TaskEditModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    assignedTo: "",
    status: "Todo" as "Todo" | "In Progress" | "Done",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority || "Medium",
        dueDate: task.dueDate || "",
        assignedTo: task.assignedTo || "",
        status: task.status || "Todo",
      });
      
      // Load workspace members for assignment dropdown
      if (task.workspace) {
        loadMembers(task.workspace);
      }
    }
    setError("");
  }, [task, isOpen]);

  const loadMembers = async (workspaceId: string) => {
    try {
      const data = await getWorkspaceMembers(workspaceId);
      setMembers(data);
    } catch (err) {
      console.error("Failed to load members:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!task) return;

    setLoading(true);
    setError("");

    try {
      await updateTask(task._id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        assignedTo: formData.assignedTo || undefined,
        status: formData.status,
      });
      
      onUpdate();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update task";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  return (
    <EditModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Edit Task"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter task title"
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
            placeholder="Enter task description"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Assigned To
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member._id} value={member.user._id}>
                  {member.user.name} ({member.user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "Todo" | "In Progress" | "Done" })}
              className="w-full px-4 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
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
