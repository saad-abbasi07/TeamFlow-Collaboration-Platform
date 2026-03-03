"use client";

import { useState } from "react";
import { Project, deleteProject } from "../services/projectService";
import { ProjectEditModal } from "./ProjectEditModal";
import { DeleteModal } from "./DeleteModal";

interface ProjectCardProps {
  project: Project;
  onSelect?: () => void;
  refresh?: () => void;
  canManageMembers?: boolean;
  onManageMembers?: () => void;
}

export function ProjectCard({ project, onSelect, refresh, canManageMembers, onManageMembers }: ProjectCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProject(project._id);
      refresh?.();
      setIsDeleteModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete project";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectUpdate = () => {
    refresh?.();
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div onClick={onSelect} className="group cursor-pointer">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                {project.name}
              </h3>
              {project.status && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                  project.status === "Completed" 
                    ? "bg-green-600/20 text-green-400 border border-green-600/30" 
                    : "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                }`}>
                  {project.status}
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditModalOpen(true);
              }}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }}
              disabled={loading}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>

            {canManageMembers ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onManageMembers?.();
                }}
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Members
              </button>
            ) : null}
          </div>
        </div>
        {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
      </div>

      <ProjectEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
        onUpdate={handleProjectUpdate}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? All tasks in this project will also be deleted. This action cannot be undone."
        itemName={project.name}
      />
    </>
  );
}