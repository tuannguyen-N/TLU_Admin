export interface Lecturer {
  id: number;
  lecturerCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  departmentName: string;
  status: 'ACTIVE' | 'INACTIVE';
  isAcademicAdvisor: boolean;
}

export interface LecturerFormData {
  lecturerCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  departmentId: number;
}

export interface FacultyOption {
  value: string;
  label: string;
  id: number;
}

export interface DepartmentOption {
  value: string;
  label: string;
  id: number;
  facultyCode: string;
}

export interface StudentClass {
  id: number;
  classCode: string;
  startYear: number;
  majorName: string;
  studentCount: number;
}

export interface AdvisedClass {
  id: number;
  classCode: string;
  startYear: number;
  majorName: string;
  studentCount: number;
  lecturerId: number;
}
