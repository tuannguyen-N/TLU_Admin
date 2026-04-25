export type TrainingProgramStatus = 'ACTIVE' | 'ARCHIVED';
export type TrainingType = 'CHINH_QUY' | 'VAO_SANG' | 'TU_TAO';

export interface TrainingProgram {
  id: number;
  studyProgramCode: string;
  studyProgramName: string;
  majorCode: string;
  startYear: number;
  totalCredits: number;
  trainingType: TrainingType;
  status: TrainingProgramStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingProgramFormData {
  studyProgramCode: string;
  studyProgramName: string;
  majorId: number;
  startYear: number;
  totalCredits: number;
  trainingType: TrainingType;
}

export type ExamType = 'THI_KET_THUC' | 'GEMINATE' | 'VH_KTCSDL' | 'TTTN';

// API Response types
export interface PrerequisiteItem {
  subjectCode: string;
  subjectName: string;
}

export interface SubjectPrerequisite {
  minSubjectsRequired: number;
  description: string;
  items: PrerequisiteItem[];
}

export interface SubjectDetail {
  id: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  isRequired: boolean;
  electiveGroup: string | null;
  lectureHours: number;
  practiceHours: number;
  subjectPrerequisite: SubjectPrerequisite[];
  faculty: string;
  department: string;
  semesterId?: number;
}

export interface SemesterDetail {
  semesterId: number;
  semesterName: string;
  semesterStartDate: string;
  semesterEndDate: string;
  subjects: SubjectDetail[];
}

export interface StudyProgramDetail {
  studyProgramName: string;
  studyProgramCode: string;
  yearStart: number;
  totalCredits: number;
  major: {
    majorName: string;
    majorCode: string;
    faculty: string;
  };
  semesters: SemesterDetail[];
}

export interface Subject {
  id: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  theoryHours: number;
  practiceHours: number;
  examType: string;
  studyProgramId: number;
  semester: string;
}
