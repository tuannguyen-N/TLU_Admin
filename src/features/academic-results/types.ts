export interface SubjectResult {
  id?: number;
  semesterId?: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  attendanceScore: number;
  midtermScore: number;
  finalScore: number;
  score10: number;
  score4: number;
  letterGrade: string;
  isPass: boolean;
}

export interface SemesterSummary {
  creditsRegistered: number;
  creditsPassed: number;
  semesterGpa: number;
  conductScore: number;
}

export interface SemesterResult {
  semester: string;
  semesterId?: number;
  subjectResults: SubjectResult[];
  semesterSummary: SemesterSummary | null;
}

export interface StudyProgram {
  majorName: string;
  studyProgramCode: string;
  studyProgramName: string;
  semesterResults: SemesterResult[];
}

export interface AcademicResult {
  studentId: number;
  studentCode: string;
  studentName: string;
  startYear: number;
  studyPrograms: StudyProgram[];
}

export interface UpdateAcademicResultPayload {
  semesterId: number;
  attendanceScore: number;
  midtermScore: number;
  finalScore: number;
  score10: number;
  score4: number;
  letterGrade: string;
  isPass: boolean;
}