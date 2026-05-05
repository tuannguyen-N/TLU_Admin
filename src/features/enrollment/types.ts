export interface EnrollmentPeriod {
  id: number;
  semesterId: number;
  startTime: string;
  endTime: string;
  maxCredits: number;
  createdAt: string;
}

export interface EnrollmentPeriodFormData {
  semesterId: number;
  startTime: string;
  endTime: string;
  maxCredits: number;
}

export interface StudentEnrollment {
  id: number;
  studentCode: string;
  studentName: string;
  classCode: string;
  className: string;
  subjectCode: string;
  subjectName: string;
  semesterCode: string;
  semesterName: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | string;
  isRetake: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentEnrollmentFilter {
  majorId?: number;
  semesterId?: number;
  studentId?: number;
}
