// ── Extraction: API implementations ─────────────────────────────────────────
import retrieveProjectsApi from "./api/projects";
import retrieveProjectByIdApi from "./api/project";
import retrieveProjectTasksApi, {
  retrieveProjectTask as retrieveProjectTaskApi,
} from "./api/project-tasks";
import retrieveProjectCreatorsApi from "./api/project-creators";
import retrieveProjectSprintsApi from "./api/project-sprints";

// ── Mutations: API implementations ──────────────────────────────────────────
import { uploadProject as uploadProjectApi } from "./api/project-upload";
import uploadProjectTaskApi from "./api/project-task-upload";
import { deleteProjectTask as deleteProjectTaskApi } from "./api/project-task-deletion";
import {
  addProjectTaskComment as addProjectTaskCommentApi,
  deleteProjectTaskComment as deleteProjectTaskCommentApi,
} from "./api/project-task-comment";
import {
  archiveProject as archiveProjectApi,
  restoreProject as restoreProjectApi,
  deleteProject as deleteProjectApi,
} from "./api/project-lifecycle";
import {
  addProjectMember as addProjectMemberApi,
  updateProjectMemberRole as updateProjectMemberRoleApi,
  removeProjectMember as removeProjectMemberApi,
  createProjectInvitation as createProjectInvitationApi,
  deleteProjectInvitation as deleteProjectInvitationApi,
  resendProjectInvitation as resendProjectInvitationApi,
} from "./api/project-members";
import { uploadSprint as uploadSprintApi } from "./api/sprint-upload";
import { deleteSprint as deleteSprintApi } from "./api/sprint-deletion";

// ── Extraction exports ───────────────────────────────────────────────────────
export const retrieveProjects        = retrieveProjectsApi;
export const retrieveProjectById     = retrieveProjectByIdApi;
export const retrieveProjectTasks    = retrieveProjectTasksApi;
export const retrieveProjectTask     = retrieveProjectTaskApi;
export const retrieveProjectCreators = retrieveProjectCreatorsApi;
export const retrieveProjectSprints  = retrieveProjectSprintsApi;

// ── Mutation exports ─────────────────────────────────────────────────────────
export const uploadProject            = uploadProjectApi;
export const uploadProjectTask        = uploadProjectTaskApi;
export const deleteProjectTask        = deleteProjectTaskApi;
export const addProjectTaskComment    = addProjectTaskCommentApi;
export const deleteProjectTaskComment = deleteProjectTaskCommentApi;
export const archiveProject           = archiveProjectApi;
export const restoreProject           = restoreProjectApi;
export const deleteProject            = deleteProjectApi;
export const addProjectMember         = addProjectMemberApi;
export const updateProjectMemberRole  = updateProjectMemberRoleApi;
export const removeProjectMember      = removeProjectMemberApi;
export const createProjectInvitation  = createProjectInvitationApi;
export const deleteProjectInvitation  = deleteProjectInvitationApi;
export const resendProjectInvitation  = resendProjectInvitationApi;
export const uploadSprint             = uploadSprintApi;
export const deleteSprint             = deleteSprintApi;

// ── Re-export types needed by consumers ─────────────────────────────────────
export type { ProjectTaskPayload } from "./api/project-task-upload";
export type { ProjectCreator } from "./api/project-creators";
