export interface Exam {
  id: number;
  subjectCode: string;
  subjectName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  examRoom: string;
  examLocation: string;
  examFormat: 'Online' | 'Offline' | string;
  examType: string;
  note: string;
}

export interface ExamFormData {
  subjectId: number;
  semesterId: number;
  examDate: string;
  startTime: string;
  endTime: string;
  examRoom: string;
  examLocation?: string;
  examFormat?: 'Online' | 'Offline';
  examType?: string;
  note?: string;
}

export interface SemesterOption {
  value: string;
  label: string;
  id: number;
}

export interface SubjectOption {
  value: string;
  label: string;
  id: number;
}
