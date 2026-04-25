export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Application {
  id: number;
  studentCode: string;
  studentName: string;
  applicationTypeName: string;
  status: ApplicationStatus;
  content?: string;
  attachments?: ApplicationAttachment[];
}

export interface ApplicationAttachment {
  id: number;
  fileKey: string;
  originalFilename: string;
  fileSize: number;
}

export interface ApplicationDetail extends Application {
  content: string;
  attachments: ApplicationAttachment[];
}

export interface ApplicationType {
  id: number;
  code: string;
  name: string;
  isActive?: boolean;
}