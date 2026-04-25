export interface Semester {
  id: number;
  semesterCode: string;
  semesterName: string;
  academicYears: string;
  semesterNumber: 1 | 2 | 3;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface SemesterFormData {
  semesterCode: string;
  semesterName: string;
  academicYears: string;
  semesterNumber: 1 | 2 | 3;
  startDate: string;
  endDate: string;
  isActive: boolean;
}