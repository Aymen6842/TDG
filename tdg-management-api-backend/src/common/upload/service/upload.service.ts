import { Injectable } from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  // Base paths
  private static baseImagePath = '/static/images/';
  private static baseAttachmentPath = '/static/attachments/';

  // Generic method to set attachment path
  setAttachmentPath(
    filename: string,
    module:
      | 'personal-tasks'
      | 'sprints'
      | 'tasks'
      | 'epics'
      | 'milestones'
      | 'projects',
  ): string {
    return `${UploadService.baseAttachmentPath}${module}/${filename}`;
  }

  // Generic method to set image path
  setImagePath(filename: string, module: 'users' | 'notifications'): string {
    return `${UploadService.baseImagePath}${module}/${filename}`;
  }

  // Legacy methods for backward compatibility
  setImagePathForNotification(filename: string) {
    return this.setImagePath(filename, 'notifications');
  }

  setAttachmentPathForPersonalTask(filename: string) {
    return this.setAttachmentPath(filename, 'personal-tasks');
  }

  setImagePathForUser(filename: string) {
    return this.setImagePath(filename, 'users');
  }

  // Sprint attachments
  setAttachmentPathForSprint(filename: string) {
    return this.setAttachmentPath(filename, 'sprints');
  }

  // Task attachments
  setAttachmentPathForTask(filename: string) {
    return this.setAttachmentPath(filename, 'tasks');
  }

  // Epic attachments
  setAttachmentPathForEpic(filename: string) {
    return this.setAttachmentPath(filename, 'epics');
  }

  // Milestone attachments
  setAttachmentPathForMilestone(filename: string) {
    return this.setAttachmentPath(filename, 'milestones');
  }

  // Project attachments
  setAttachmentPathForProject(filename: string) {
    return this.setAttachmentPath(filename, 'projects');
  }

  deleteImageByPath(path: string) {
    if (path && existsSync(path)) unlinkSync(path);
  }

  deleteImageByPathInDb(pathInDb: string) {
    if (pathInDb && existsSync(join('.', pathInDb)))
      unlinkSync(join('.', pathInDb));
  }
}
