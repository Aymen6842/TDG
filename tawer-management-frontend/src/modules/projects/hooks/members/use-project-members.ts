import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
} from "../../services";
import { AddMemberPayload, UpdateMemberRolePayload } from "../../types/projects";

export default function useProjectMembers(projectId: string) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["project", projectId] });

  async function addMember(data: AddMemberPayload) {
    setIsPending(true);
    try {
      const result = await addProjectMember(projectId, data);
      toast.success("userId" in result ? "Member added" : "Invitation sent");
      invalidate();
      return result;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add member");
      throw err;
    } finally {
      setIsPending(false);
    }
  }

  async function updateRole(memberId: string, data: UpdateMemberRolePayload) {
    setIsPending(true);
    try {
      await updateProjectMemberRole(projectId, memberId, data);
      toast.success("Role updated");
      invalidate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update role");
      throw err;
    } finally {
      setIsPending(false);
    }
  }

  async function removeMember(memberId: string) {
    setIsPending(true);
    try {
      await removeProjectMember(projectId, memberId);
      toast.success("Member removed");
      invalidate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove member");
      throw err;
    } finally {
      setIsPending(false);
    }
  }

  return { addMember, updateRole, removeMember, isPending };
}
