
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import TaskItem from "./projects/[projectId]/TaskItem";
import { ProjectCard } from "./components/ProjectCard";
import { WorkspaceEditModal } from "./components/WorkspaceEditModal";
import { MemberManagementModal } from "./components/MemberManagementModal";
import { ProjectMembersModal } from "./components/ProjectMembersModal";
import { DeleteModal } from "./components/DeleteModal";
import { getWorkspaceMembers, type WorkspaceMember } from "./services/memberService";
import {
  createWorkspace,
  fetchMyWorkspaces,
  deleteWorkspace,
  type Workspace,
} from "./services/workspaceService";
import {
  createProject,
  fetchProjectsByWorkspace,
  type Project,
} from "./services/projectService";
import { createTask, getTasksByProject, type Task } from "./services/taskService";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>("");
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [newProjectDescription, setNewProjectDescription] = useState<string>("");
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskDescription, setNewTaskDescription] = useState<string>("");
  const [newTaskPriority, setNewTaskPriority] = useState<string>("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>("");
  const [newTaskStatus, setNewTaskStatus] = useState<"Todo" | "In Progress" | "Done">("Todo");
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState<string>("");
  const [taskError, setTaskError] = useState<string>("");
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [deletingWorkspace, setDeletingWorkspace] = useState<Workspace | null>(null);
  const [managingMembers, setManagingMembers] = useState<string | null>(null);
  const [managingProjectMembers, setManagingProjectMembers] = useState<string | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [membersError, setMembersError] = useState<string>("");
  const [projectStatusFilter, setProjectStatusFilter] = useState<"All" | "Active" | "Completed">("All");
  const [taskStatusFilter, setTaskStatusFilter] = useState<"All" | "Todo" | "In Progress" | "Done">("All");
  const [projectSearch, setProjectSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");

  const fetchMembersForWorkspace = useCallback(async (workspaceId: string) => {
    if (!workspaceId) return;
    try {
      const members = await getWorkspaceMembers(workspaceId);
      setWorkspaceMembers(members);
      setMembersError("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load members";
      setMembersError(message);
      setWorkspaceMembers([]);
    }
  }, []);

  const handleSelectWorkspace = useCallback(
    (workspaceId: string) => {
      setSelectedWorkspaceId(workspaceId);
      setNewTaskAssignedTo("");
      Promise.resolve().then(() => fetchMembersForWorkspace(workspaceId));
    },
    [fetchMembersForWorkspace]
  );

  useEffect(() => {
    if (!user?.token) {
      router.push("/login");
      return;
    }
    const loadWorkspaces = async () => {
      const ws = await fetchMyWorkspaces();
      setWorkspaces(ws);
      if (ws.length) handleSelectWorkspace(ws[0]._id);
    };
    loadWorkspaces();
  }, [user, router, handleSelectWorkspace]);

  const refreshWorkspaces = async () => {
    const ws = await fetchMyWorkspaces();
    setWorkspaces(ws);
    if (!selectedWorkspaceId && ws.length) setSelectedWorkspaceId(ws[0]._id);
    return ws;
  };

  const refreshProjects = async (workspaceId: string) => {
    const ps = await fetchProjectsByWorkspace(workspaceId);
    setProjects(ps);
    if (ps.length) setSelectedProject(ps[0]._id);
    else setSelectedProject("");
    return ps;
  };

  useEffect(() => {
    if (!selectedWorkspaceId) return;
    const loadProjects = async () => {
      await refreshProjects(selectedWorkspaceId);
    };
    loadProjects();
  }, [selectedWorkspaceId]);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    const ws = await createWorkspace({ name: newWorkspaceName.trim() });
    setNewWorkspaceName("");
    await refreshWorkspaces();
    handleSelectWorkspace(ws._id);
  };

  const handleCreateProject = async () => {
    if (!selectedWorkspaceId) return;
    if (!newProjectName.trim()) return;
    await createProject({
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || undefined,
      workspaceId: selectedWorkspaceId,
    });
    setNewProjectName("");
    setNewProjectDescription("");
    await refreshProjects(selectedWorkspaceId);
  };

  const handleUpdateWorkspace = async () => {
    await refreshWorkspaces();
    setEditingWorkspace(null);
  };

  const handleDeleteWorkspace = async () => {
    if (!deletingWorkspace) return;
    
    try {
      await deleteWorkspace(deletingWorkspace._id);
      setDeletingWorkspace(null);
      
      // If deleted workspace was selected, select first available
      if (selectedWorkspaceId === deletingWorkspace._id) {
        const ws = await refreshWorkspaces();
        if (ws.length > 0) {
          setSelectedWorkspaceId(ws[0]._id);
        } else {
          setSelectedWorkspaceId("");
        }
      } else {
        await refreshWorkspaces();
      }
    } catch (error) {
      console.error("Failed to delete workspace:", error);
    }
  };

  useEffect(() => {
    if (!selectedProject) return;
    const loadTasks = async () => {
      const data = await getTasksByProject(selectedProject);
      setTasks(data);
    };
    loadTasks();
  }, [selectedProject]);

  const refreshTasks = async (projectId: string) => {
    const data = await getTasksByProject(projectId);
    setTasks(data);
    return data;
  };

  const handleCreateTask = async () => {
    if (!selectedProject) return;
    if (!newTaskTitle.trim() || !newTaskDescription.trim()) return;
    setTaskError("");
    try {
      await createTask({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        projectId: selectedProject,
        priority: newTaskPriority || undefined,
        dueDate: newTaskDueDate || undefined,
        assignedTo: newTaskAssignedTo || undefined,
        status: newTaskStatus,
      });

      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPriority("");
      setNewTaskDueDate("");
      setNewTaskStatus("Todo");
      setNewTaskAssignedTo("");

      await refreshTasks(selectedProject);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Task creation failed";
      setTaskError(message);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b0614] text-gray-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_10%_10%,rgba(124,58,237,0.20),transparent_55%),radial-gradient(700px_circle_at_90%_20%,rgba(59,130,246,0.16),transparent_55%),radial-gradient(700px_circle_at_50%_90%,rgba(16,185,129,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
      </div>

      <div className="sticky top-0 z-40 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                TeamFlow
              </h1>
              <p className="mt-1 text-sm text-gray-300">
                Welcome back, <span className="font-medium text-white">{user?.name}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1 sm:flex-none">
                <select
                  value={selectedWorkspaceId}
                  onChange={(e) => handleSelectWorkspace(e.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-0 transition focus:border-purple-500/60 focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-purple-500/30 sm:w-56"
                >
                  {workspaces.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="New workspace"
                  className="h-10 w-full min-w-0 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-gray-400 outline-none transition focus:border-purple-500/60 focus:bg-black/40 focus:ring-2 focus:ring-purple-500/30 sm:w-56"
                />
                <button
                  onClick={handleCreateWorkspace}
                  className="h-10 whitespace-nowrap rounded-lg bg-gradient-to-b from-purple-500 to-purple-700 px-4 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.10)_inset] transition hover:from-purple-400 hover:to-purple-700 active:translate-y-[1px]"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">

      {/* Workspace Cards */}
      {workspaces.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Workspaces</h3>
            <div className="text-xs text-gray-400">{workspaces.length} total</div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workspaces.map((workspace) => (
              <div
                key={workspace._id}
                className={`group cursor-pointer rounded-xl border p-4 shadow-sm backdrop-blur-sm transition-all ${
                  selectedWorkspaceId === workspace._id
                    ? "border-purple-500/60 bg-purple-500/10 shadow-[0_0_0_1px_rgba(124,58,237,0.20)_inset]"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/7"
                }`}
                onClick={() => handleSelectWorkspace(workspace._id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate text-base font-semibold text-white">{workspace.name}</h4>
                    <p className="mt-1 text-sm text-gray-400">
                      {workspace._id === selectedWorkspaceId ? "Selected" : "Select workspace"}
                    </p>
                  </div>
                  {selectedWorkspaceId === workspace._id ? (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {workspaceMembers.some((m) => m.user._id === user?._id && (m.role === "Owner" || m.role === "Admin")) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingWorkspace(workspace);
                          }}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                        </button>
                      ) : null}

                      {workspaceMembers.some((m) => m.user._id === user?._id && m.role === "Owner") ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingWorkspace(workspace);
                          }}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                        >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                        </button>
                      ) : null}

                      {workspaceMembers.some((m) => m.user._id === user?._id && (m.role === "Owner" || m.role === "Admin")) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setManagingMembers(workspace._id);
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
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Projects Sidebar */}
        <div className="min-w-0 lg:col-span-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Projects</h2>
            </div>

            <div className="mb-4 space-y-2">
              <input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-gray-400 outline-none transition focus:border-purple-500/60 focus:bg-black/40 focus:ring-2 focus:ring-purple-500/30"
              />
              <input
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Description (optional)"
                className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-gray-400 outline-none transition focus:border-purple-500/60 focus:bg-black/40 focus:ring-2 focus:ring-purple-500/30"
              />
              <button
                onClick={handleCreateProject}
                className="h-10 w-full rounded-lg bg-gradient-to-b from-gray-800 to-gray-950 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset] transition hover:from-gray-700 hover:to-gray-950 active:translate-y-[1px]"
              >
                Create Project
              </button>
            </div>

          {/* Project Search */}
          <div className="mb-3">
            <input
              type="text"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              placeholder="Search projects..."
              className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-gray-400 outline-none transition focus:border-purple-500/60 focus:bg-black/40 focus:ring-2 focus:ring-purple-500/30"
            />
          </div>

          {/* Project Status Filter */}
          <div className="mb-3">
            <div className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(["All", "Active", "Completed"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setProjectStatusFilter(status)}
                  className={`whitespace-nowrap px-2 py-1 text-xs rounded transition-colors ${
                    projectStatusFilter === status
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Filtered Projects */}
          {projects
            .filter((project) => {
              // Status filter
              if (projectStatusFilter !== "All" && project.status !== projectStatusFilter) {
                return false;
              }
              // Search filter
              if (projectSearch && !project.name.toLowerCase().includes(projectSearch.toLowerCase())) {
                return false;
              }
              return true;
            })
            .map((project) => {
              const currentUserProjectRole = project.members?.find((m) => m.user._id === user?._id)?.role;
              const canManageProjectMembers =
                currentUserProjectRole === "Owner" || currentUserProjectRole === "Admin";

              return (
                <div
                  key={project._id}
                  onClick={() => setSelectedProject(project._id)}
                  className={`mb-2 rounded-xl border p-3 cursor-pointer transition ${
                    selectedProject === project._id
                      ? "border-purple-500/40 bg-purple-500/10"
                      : "border-white/0 hover:border-white/10 hover:bg-white/5"
                  }`}
                >
                  <ProjectCard
                    project={project}
                    refresh={() => refreshProjects(selectedWorkspaceId)}
                    canManageMembers={canManageProjectMembers}
                    onManageMembers={() => setManagingProjectMembers(project._id)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks Area */}
        <div className="min-w-0 lg:col-span-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Tasks</h2>
                <p className="mt-1 text-sm text-gray-400">
                  {selectedProject ? "Create and track tasks for the selected project." : "Select a project to view tasks."}
                </p>
              </div>
              <div className="hidden text-xs text-gray-400 md:block">{tasks.length} tasks</div>
            </div>

            {taskError ? (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {taskError}
              </div>
            ) : null}

            {membersError ? (
              <div className="mb-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                {membersError}
              </div>
            ) : null}

            <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title"
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-gray-400 outline-none transition focus:border-purple-500/60 focus:bg-black/40 focus:ring-2 focus:ring-purple-500/30"
                />
                <select
                  value={newTaskStatus}
                  onChange={(e) => setNewTaskStatus(e.target.value as "Todo" | "In Progress" | "Done")}
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-purple-500/60 focus:bg-black/40 focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="Todo">Status: Todo</option>
                  <option value="In Progress">Status: In Progress</option>
                  <option value="Done">Status: Done</option>
                </select>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-purple-500/60 focus:bg-black/40 focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="">Priority (optional)</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <select
                  value={newTaskAssignedTo}
                  onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-purple-500/60 focus:bg-black/40 focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="">Assignee (optional)</option>
                  {workspaceMembers.map((member) => (
                    <option key={member._id} value={member.user._id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
                <input
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Task description"
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-gray-400 outline-none transition focus:border-purple-500/60 focus:bg-black/40 focus:ring-2 focus:ring-purple-500/30 md:col-span-2"
                />
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-purple-500/60 focus:bg-black/40 focus:ring-2 focus:ring-purple-500/30"
                />
                <button
                  onClick={handleCreateTask}
                  className="h-10 w-full rounded-lg bg-gradient-to-b from-purple-500 to-purple-700 px-3 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.10)_inset] transition hover:from-purple-400 hover:to-purple-700 active:translate-y-[1px]"
                >
                  Create Task
                </button>
              </div>
            </div>

          {/* Task Search */}
            <div className="mb-4">
            <input
              type="text"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              placeholder="Search tasks..."
              className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-gray-400 outline-none transition focus:border-purple-500/60 focus:bg-black/40 focus:ring-2 focus:ring-purple-500/30"
            />
          </div>

          {/* Task Status Filter */}
          <div className="mb-4">
            <div className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(["All", "Todo", "In Progress", "Done"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setTaskStatusFilter(status)}
                  className={`whitespace-nowrap px-2 py-1 text-xs rounded transition-colors ${
                    taskStatusFilter === status
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {tasks.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks
                .filter((task) => {
                  // Status filter
                  if (taskStatusFilter !== "All" && task.status !== taskStatusFilter) {
                    return false;
                  }
                  // Search filter
                  if (taskSearch && !task.title.toLowerCase().includes(taskSearch.toLowerCase()) && 
                      !task.description?.toLowerCase().includes(taskSearch.toLowerCase())) {
                    return false;
                  }
                  return true;
                })
                .map((task) => (
                  <TaskItem key={task._id} task={task} refresh={() => refreshTasks(selectedProject)} />
                ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center">
              <p className="text-sm font-medium text-white">No tasks yet</p>
              <p className="mt-1 text-sm text-gray-400">Create your first task to start tracking work.</p>
            </div>
          )}
          </div>
        </div>
      </div>

      </div>

      {/* Workspace Edit Modal */}
      <WorkspaceEditModal
        isOpen={!!editingWorkspace}
        onClose={() => setEditingWorkspace(null)}
        workspace={editingWorkspace}
        onUpdate={handleUpdateWorkspace}
      />

      <ProjectMembersModal
        isOpen={!!managingProjectMembers}
        onClose={() => setManagingProjectMembers(null)}
        projectId={managingProjectMembers || ""}
      />

      <MemberManagementModal
        isOpen={!!managingMembers}
        onClose={() => setManagingMembers(null)}
        workspaceId={managingMembers || ""}
      />

      <DeleteModal
        isOpen={!!deletingWorkspace}
        onClose={() => setDeletingWorkspace(null)}
        onConfirm={handleDeleteWorkspace}
        title="Delete Workspace"
        message="Are you sure you want to delete this workspace? This will permanently remove all projects and tasks inside it. This action cannot be undone."
        itemName={deletingWorkspace?.name || ""}
      />
    </div>
  );
}
