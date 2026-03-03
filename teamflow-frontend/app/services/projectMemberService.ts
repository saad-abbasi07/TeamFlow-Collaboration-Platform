import { apiFetch } from "./apiClient";

export interface ProjectMember {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  role: "Owner" | "Admin" | "Member";
}

export const getProjectMembers = async (projectId: string) => {
  return apiFetch<ProjectMember[]>(`/projects/${projectId}/members`);
};

export const inviteProjectMember = async (
  projectId: string,
  email: string,
  role: "Admin" | "Member" = "Member"
) => {
  const response = await apiFetch<{ success: boolean; data: ProjectMember }>(
    `/projects/${projectId}/members`,
    {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }
  );
  return response.data;
};

export const updateProjectMemberRole = async (
  projectId: string,
  memberId: string,
  role: "Owner" | "Admin" | "Member"
) => {
  const response = await apiFetch<{ success: boolean; data: ProjectMember }>(
    `/projects/${projectId}/members/${memberId}`,
    {
      method: "PUT",
      body: JSON.stringify({ role }),
    }
  );
  return response.data;
};

export const removeProjectMember = async (projectId: string, memberId: string) => {
  const response = await apiFetch<{ success: boolean; message: string }>(
    `/projects/${projectId}/members/${memberId}`,
    {
      method: "DELETE",
    }
  );
  return response;
};
