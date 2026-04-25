export interface Subject {
  id: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  coefficient: number;
  lectureHours: number;
  practiceHours: number;
  facultyId: number;
  departmentId: number;
  isActive: boolean;
}

export interface SubjectFormData {
  facultyId: number;
  departmentId: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  coefficient: number;
  lectureHours: number;
  practiceHours: number;
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