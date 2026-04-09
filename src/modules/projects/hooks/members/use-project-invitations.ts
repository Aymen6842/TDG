import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProjectInvitation,
  deleteProjectInvitation,
  resendProjectInvitation,
} from "../../services/mutations/project-members";
import { CreateInvitationPayload } from "../../types/projects";

export default function useProjectInvitations(projectId: string) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["project", projectId] });

  async function createInvitation(data: CreateInvitationPayload) {
    setIsPending(true);
    try {
      const result = await createProjectInvitation(projectId, data);
      toast.success("Invitation sent");
      invalidate();
      return result;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send invitation");
      throw err;
    } finally {
      setIsPending(false);
    }
  }

  async function revokeInvitation(invitationId: string) {
    setIsPending(true);
    try {
      await deleteProjectInvitation(projectId, invitationId);
      toast.success("Invitation revoked");
      invalidate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to revoke invitation");
      throw err;
    } finally {
      setIsPending(false);
    }
  }

  async function resendInvitation(invitationId: string) {
    setIsPending(true);
    try {
      await resendProjectInvitation(projectId, invitationId);
      toast.success("Invitation resent");
      invalidate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resend invitation");
      throw err;
    } finally {
      setIsPending(false);
    }
  }

  return { createInvitation, revokeInvitation, resendInvitation, isPending };
}
