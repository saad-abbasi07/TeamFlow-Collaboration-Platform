"use client";

import { useState } from "react";
import { Task, deleteTask } from "../../services/taskService";
import { TaskEditModal } from "../../components/TaskEditModal";
import { DeleteModal } from "../../components/DeleteModal";

export default function TaskItem({ task, refresh }: { task: Task; refresh: () => void }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      await deleteTask(task._id);
      refresh();
      setIsDeleteModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete task";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = () => {
    refresh();
    setIsEditModalOpen(false);
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <>
      <div className="border border-gray-700 rounded-lg p-4 mb-3 bg-gray-800 hover:border-gray-600 transition-all duration-200 group">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{task.description}</p>
          </div>
          <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleEditClick}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={loading}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
        
        <div className="flex gap-3 text-sm">
          {task.priority && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              task.priority === "High" ? "bg-red-600/20 text-red-400 border border-red-600/30" :
              task.priority === "Medium" ? "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30" :
              "bg-green-600/20 text-green-400 border border-green-600/30"
            }`}>
              {task.priority}
            </span>
          )}
          {task.status && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              task.status === "Done" ? "bg-green-600/20 text-green-400 border border-green-600/30" :
              task.status === "In Progress" ? "bg-blue-600/20 text-blue-400 border border-blue-600/30" :
              "bg-gray-600/20 text-gray-400 border border-gray-600/30"
            }`}>
              {task.status}
            </span>
          )}
          {task.assignedTo && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-600/20 text-purple-400 border border-purple-600/30">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Assigned
            </span>
          )}
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${
              new Date(task.dueDate) < new Date() && task.status !== "Done" 
                ? "text-red-400 font-medium" 
                : "text-gray-400"
            }`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(task.dueDate).toLocaleDateString()}
              {new Date(task.dueDate) < new Date() && task.status !== "Done" && (
                <span className="text-xs"> (Overdue)</span>
              )}
            </span>
          )}
        </div>
        
        {error && <div className="text-red-400 text-sm mt-3">{error}</div>}
      </div>

      <TaskEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        onUpdate={handleTaskUpdate}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        itemName={task.title}
      />
    </>
  );
}