import { BadRequestException, Injectable } from '@nestjs/common';
import { diskStorage, memoryStorage } from 'multer';

@Injectable()
export class UploadStorage {
  private static basePath = './static';
  private static imagesPath = `${UploadStorage.basePath}/images`;
  private static attachmentsPath = `${UploadStorage.basePath}/attachments`;

  // Allowed file types for attachments
  private static allowedAttachmentTypes = [
    // Images
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    // PDF
    'application/pdf',
    // PowerPoint
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Word
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Text
    'text/plain',
  ];

  // Generic method for any attachment storage
  private static getAttachmentStorageConfig(subFolder: string) {
    return {
      storage: diskStorage({
        destination: `${UploadStorage.attachmentsPath}/${subFolder}/`,
        filename: (
          req: Express.Request,
          file: Express.Multer.File,
          callback,
        ) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExt = '.' + file.originalname.split('.').pop();
          callback(null, `${uniqueSuffix}${fileExt}`);
        },
      }),
      fileFilter: (
        req: Express.Request,
        file: Express.Multer.File,
        callback: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        if (!UploadStorage.allowedAttachmentTypes.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              'Only images (PNG, JPG, JPEG, WEBP), PDF, PowerPoint, Word, and TXT files are allowed.',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
      limits: { fileSize: 4 * 1024 * 1024 },
    };
  }

  // Generic method for image storage
  private static getImageStorageConfig(subFolder: string) {
    return {
      storage: diskStorage({
        destination: `${UploadStorage.imagesPath}/${subFolder}/`,
        filename: (
          req: Express.Request,
          file: Express.Multer.File,
          callback,
        ) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExt = '.' + file.originalname.split('.').pop();
          callback(null, `${uniqueSuffix}${fileExt}`);
        },
      }),
      fileFilter: (
        req: Express.Request,
        file: Express.Multer.File,
        callback: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              'Only PNG, JPEG, JPG, and WEBP images are allowed.',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
      limits: { fileSize: 4 * 1024 * 1024 },
    };
  }

  // Pre-defined configurations
  public static AttachementStorage() {
    return { storage: memoryStorage() };
  }

  public static UserImageConfig() {
    return UploadStorage.getImageStorageConfig('users');
  }

  public static NotificationImageConfig() {
    return UploadStorage.getImageStorageConfig('notifications');
  }

  // Attachment configurations - using generic method
  public static UserPersonalTasksAttachments() {
    return UploadStorage.getAttachmentStorageConfig('personal-tasks');
  }

  public static SprintAttachments() {
    return UploadStorage.getAttachmentStorageConfig('sprints');
  }

  public static TaskAttachments() {
    return UploadStorage.getAttachmentStorageConfig('tasks');
  }

  // Epic and Milestone attachments for future use
  public static EpicAttachments() {
    return UploadStorage.getAttachmentStorageConfig('epics');
  }

  public static MilestoneAttachments() {
    return UploadStorage.getAttachmentStorageConfig('milestones');
  }

  public static ProjectAttachments() {
    return UploadStorage.getAttachmentStorageConfig('projects');
  }
}
