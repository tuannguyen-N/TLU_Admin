export interface ClassInfo {
  academicAdvisorId: number;
  classCode: string;
  majorCode: string;
  startYear: number;
}

export interface AcademicAdvisorDetail {
  id: number;
  lecturerCode: string;
  lecturerName: string;
  lecturerEmail: string;
  lecturerPhoneNumber: string;
  departmentCode: string;
  lecturerStatus: 'ACTIVE' | 'INACTIVE';
  classInfo: ClassInfo[];
}