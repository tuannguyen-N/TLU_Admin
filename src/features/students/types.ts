export interface Faculty {
  id: number;
  facultyCode: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  image: string;
}

export type Gender = 'Nam' | 'Nữ' | 'Khác';

export type StudentStatus = 'ACTIVE' | 'DELETED';

export interface Student {
  id: number;
  studentCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  classCode: string;
  majorCode: string;
  startYear: number;
  endYear: number;
  status: StudentStatus;
  trainingType: string;
  identityCard: {
    cardNumber: string;
    cardType: string;
    issuedDate: string;
    issuedPlace: string;
  };
  contact: {
    phoneNumber: string;
    address: string;
    email: string;
  };
  academicInfo: {
    cohort: string;
    position: string;
  };
  emergencyContact: {
    name: string;
    phoneNumber: string;
    address: string;
    relationship: string;
  };
}
