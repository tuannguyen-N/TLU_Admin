export interface Major {
  id: number;
  majorCode: string;
  majorName: string;
  facultyCode: string;
  isActive: boolean;
}

export interface MajorFormData {
  majorCode: string;
  majorName: string;
  facultyId: number;
}
