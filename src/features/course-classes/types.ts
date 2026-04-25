export interface CourseClass {
  id: number;
  classCode: string;
  className: string;
  capacity: number;
  lecturerCode: string;
  subjectCode: string;
  semesterCode: string;
  isActive: boolean;
}

export interface CourseClassDetail {
  id: number;
  lecturerCode: string;
  lecturerName: string;
  subjectCode: string;
  subjectName: string;
  semester: SemesterDetail;
  classCode: string;
  className: string;
  capacity: number;
  isActive: boolean;
}

export interface SemesterDetail {
  id: number | null;
  semesterName: string;
  semesterCode: string;
  academicYears: string;
  semesterNumber: number;
  startDate: string;
  endDate: string;
  isActive: boolean | null;
}

export interface CourseClassResponse {
  content: CourseClass[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CourseClassFormData {
  classCode: string;
  className: string;
  capacity: number;
  lecturerCode: string;
  subjectCode: string;
  semesterCode: string;
}

export interface Schedule {
  id: number;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  startTime: string;
  endTime: string;
  room: string;
}
