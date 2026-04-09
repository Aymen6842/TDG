import { USE_MOCK } from "@/lib/mock-config";

// ── Extraction: API implementations ─────────────────────────────────────────
import retrieveProjectsApi from "./api/projects";
import retrieveProjectByIdApi from "./api/project";
import retrieveProjectTasksApi from "./api/project-tasks";
import retrieveProjectCreatorsApi from "./api/project-creators";
import retrieveProjectSprintsApi from "./api/project-sprints";

// ── Extraction: Mock implementations ────────────────────────────────────────
import { mockRetrieveProjects } from "./mock/projects.mock";
import { mockRetrieveProjectById } from "./mock/project.mock";
import { mockRetrieveProjectTasks } from "./mock/project-tasks.mock";
import { mockRetrieveProjectSprints } from "./mock/project-sprints.mock";

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

// ── Mutations: Mock implementations ─────────────────────────────────────────
import {
  mockUploadProject,
  mockUploadProjectTask,
  mockDeleteProjectTask,
  mockAddProjectTaskComment,
  mockDeleteProjectTaskComment,
  mockUploadSprint,
  mockDeleteSprint,
} from "./mock/mutations.mock";

const isMock = USE_MOCK();

// ── Extraction exports ───────────────────────────────────────────────────────
export const retrieveProjects        = isMock ? mockRetrieveProjects       : retrieveProjectsApi;
export const retrieveProjectById     = isMock ? mockRetrieveProjectById    : retrieveProjectByIdApi;
export const retrieveProjectTasks    = isMock ? mockRetrieveProjectTasks   : retrieveProjectTasksApi;
export const retrieveProjectCreators = isMock ? () => Promise.resolve([])  : retrieveProjectCreatorsApi;
export const retrieveProjectSprints  = isMock ? mockRetrieveProjectSprints : retrieveProjectSprintsApi;

// ── Mutation exports ─────────────────────────────────────────────────────────
export const uploadProject            = isMock ? mockUploadProject            : uploadProjectApi;
export const uploadProjectTask        = isMock ? mockUploadProjectTask        : uploadProjectTaskApi;
export const deleteProjectTask        = isMock ? mockDeleteProjectTask        : deleteProjectTaskApi;
export const addProjectTaskComment    = isMock ? mockAddProjectTaskComment    : addProjectTaskCommentApi;
export const deleteProjectTaskComment = isMock ? mockDeleteProjectTaskComment : deleteProjectTaskCommentApi;
export const archiveProject           = isMock ? () => Promise.resolve({} as any) : archiveProjectApi;
export const restoreProject           = isMock ? () => Promise.resolve({} as any) : restoreProjectApi;
export const deleteProject            = isMock ? () => Promise.resolve()           : deleteProjectApi;
export const addProjectMember         = isMock ? () => Promise.resolve({} as any) : addProjectMemberApi;
export const updateProjectMemberRole  = isMock ? () => Promise.resolve({} as any) : updateProjectMemberRoleApi;
export const removeProjectMember      = isMock ? () => Promise.resolve()           : removeProjectMemberApi;
export const createProjectInvitation  = isMock ? () => Promise.resolve({} as any) : createProjectInvitationApi;
export const deleteProjectInvitation  = isMock ? () => Promise.resolve()           : deleteProjectInvitationApi;
export const resendProjectInvitation  = isMock ? () => Promise.resolve({} as any) : resendProjectInvitationApi;
export const uploadSprint             = isMock ? mockUploadSprint             : uploadSprintApi;
export const deleteSprint             = isMock ? mockDeleteSprint             : deleteSprintApi;

// ── Re-export types needed by consumers ─────────────────────────────────────
export type { ProjectTaskPayload } from "./api/project-task-upload";
export type { ProjectCreator } from "./api/project-creators";
