"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { EditModal } from "./EditModal";
import {
  getProjectMembers,
  inviteProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
  type ProjectMember,
} from "../services/projectMemberService";

interface ProjectMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function ProjectMembersModal({ isOpen, onClose, projectId }: ProjectMembersModalProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Admin" | "Member">("Member");

  const currentUserMember = members.find((m) => m.user._id === user?._id);
  const currentUserRole = currentUserMember?.role;
  const canInvite = currentUserRole === "Owner" || currentUserRole === "Admin";
  const canManageRolesAndRemoval = currentUserRole === "Owner";

  const loadMembers = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingMembers(true);
    try {
      const data = await getProjectMembers(projectId);
      setMembers(data);
      setError("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load members";
      setError(message);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen && projectId) {
      loadMembers();
    }
  }, [isOpen, projectId, loadMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      await inviteProjectMember(projectId, inviteEmail.trim(), inviteRole);
      setInviteEmail("");
      setInviteRole("Member");
      await loadMembers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to invite member";
      setError(message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: "Owner" | "Admin" | "Member") => {
    setBusyMemberId(memberId);
    try {
      await updateProjectMemberRole(projectId, memberId, newRole);
      await loadMembers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update role";
      setError(message);
    } finally {
      setBusyMemberId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member from this project?")) return;

    setBusyMemberId(memberId);
    try {
      await removeProjectMember(projectId, memberId);
      await loadMembers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to remove member";
      setError(message);
    } finally {
      setBusyMemberId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <EditModal isOpen={isOpen} onClose={onClose} title="Manage Project Members">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {canInvite ? (
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Invite Member</h3>
            <form onSubmit={handleInvite} className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="h-10 w-full min-w-0 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "Admin" | "Member")}
                  className="h-10 w-full rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:w-40"
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="h-10 w-full rounded-lg bg-purple-600 px-4 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {isInviting ? "Inviting..." : "Invite"}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        <div>
          <h3 className="text-lg font-medium text-white mb-3">Current Members</h3>
          {isLoadingMembers ? (
            <div className="text-gray-400 text-center py-4">Loading...</div>
          ) : members.length === 0 ? (
            <div className="text-gray-400 text-center py-4">No members found</div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="flex flex-col gap-3 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium">{member.user.name}</div>
                      <div className="text-gray-400 text-sm">{member.user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member._id, e.target.value as "Owner" | "Admin" | "Member")
                      }
                      className="px-2 py-1 bg-[#1a1a1a] border border-[#333] rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={!canManageRolesAndRemoval || busyMemberId === member._id || member.user._id === user?._id}
                    >
                      <option value="Owner">Owner</option>
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                    </select>
                    {canManageRolesAndRemoval && member.role !== "Owner" && member.user._id !== user?._id ? (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        disabled={busyMemberId === member._id}
                        className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {busyMemberId === member._id ? "Working..." : "Remove"}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </EditModal>
  );
}
