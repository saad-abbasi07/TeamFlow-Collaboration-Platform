"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchMyWorkspaces, type Workspace } from "../services/workspaceService";
import { fetchProjectsByWorkspace, type Project } from "../services/projectService";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const ws = await fetchMyWorkspaces();
      setWorkspaces(ws);
      if (ws.length) setSelectedWorkspaceId(ws[0]._id);
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!selectedWorkspaceId) return;
    const loadProjects = async () => {
      const ps = await fetchProjectsByWorkspace(selectedWorkspaceId);
      setProjects(ps);
    };
    loadProjects();
  }, [selectedWorkspaceId]);

  return (
    <div>
      <div>
        <select
          value={selectedWorkspaceId}
          onChange={(e) => setSelectedWorkspaceId(e.target.value)}
        >
          {workspaces.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      {projects.map((p) => (
        <div key={p._id}>{p.name}</div>
      ))}
    </div>
  );
}