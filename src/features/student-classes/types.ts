export interface StudentClass {
  id: number;
  classCode: string;
  startYear: number;
  majorName: string;
  studentCount: number;
}

export interface StudentClassFormData {
  classCode: string;
  majorId: string;
  startYear: number;
}