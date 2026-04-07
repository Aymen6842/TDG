import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD
import { POST, PATCH, DELETE } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import {
  AddMemberPayload,
  UpdateMemberRolePayload,
  CreateInvitationPayload,
  CreatedProjectMemberDto,
  CreatedInvitationDto,
  UpdatedProjectMemberDto,
} from "@/modules/projects/types/projects";

// POST /projects/:projectId/members — direct add or invitation path
export async function addProjectMember(
  projectId: string,
  data: AddMemberPayload
): Promise<CreatedProjectMemberDto | CreatedInvitationDto> {
  if (USE_MOCK()) return { id: "mock", isManager: data.isManager, projectId, userId: data.userId || "", createdAt: new Date().toISOString() }; // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await POST(`/projects/${projectId}/members`, headers, data);
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 401) return await refreshToken(() => addProjectMember(projectId, data));
    throw error;
  }
}

// PATCH /projects/:projectId/members/:memberId
export async function updateProjectMemberRole(
  projectId: string,
  memberId: string,
  data: UpdateMemberRolePayload
): Promise<UpdatedProjectMemberDto> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await PATCH(`/projects/${projectId}/members/${memberId}`, headers, data);
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 401) return await refreshToken(() => updateProjectMemberRole(projectId, memberId, data));
    throw error;
  }
}

// DELETE /projects/:projectId/members/:memberId
export async function removeProjectMember(projectId: string, memberId: string): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await DELETE(`/projects/${projectId}/members/${memberId}`, headers);
  } catch (error: any) {
    if (error?.response?.status === 401) return await refreshToken(() => removeProjectMember(projectId, memberId));
    throw error;
  }
}

// POST /projects/:projectId/invitations
export async function createProjectInvitation(
  projectId: string,
  data: CreateInvitationPayload
): Promise<CreatedInvitationDto> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await POST(`/projects/${projectId}/invitations`, headers, data);
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 401) return await refreshToken(() => createProjectInvitation(projectId, data));
    throw error;
  }
}

// DELETE /projects/:projectId/invitations/:invitationId
export async function deleteProjectInvitation(projectId: string, invitationId: string): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await DELETE(`/projects/${projectId}/invitations/${invitationId}`, headers);
  } catch (error: any) {
    if (error?.response?.status === 401) return await refreshToken(() => deleteProjectInvitation(projectId, invitationId));
    throw error;
  }
}

// POST /projects/:projectId/invitations/:invitationId/resend
export async function resendProjectInvitation(
  projectId: string,
  invitationId: string
): Promise<CreatedInvitationDto> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await POST(`/projects/${projectId}/invitations/${invitationId}/resend`, headers, {});
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 401) return await refreshToken(() => resendProjectInvitation(projectId, invitationId));
    throw error;
  }
}
