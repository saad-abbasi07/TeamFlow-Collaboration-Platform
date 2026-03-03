const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const fetchProjects = async () => {
  const res = await fetch(`${API_URL}/projects`, {
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch projects");
  return data.data;
};

export const fetchTasksByProject = async (projectId: string) => {
  const res = await fetch(`${API_URL}/tasks/project/${projectId}`, {
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch tasks");
  return data.data;
};
