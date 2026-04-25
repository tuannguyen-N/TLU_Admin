import type { Faculty, Student } from '../types';
import type { StudentStatus } from '../types';
import { apiClient } from '../../../lib/api-client';

interface FacultyApiResponse {
  id: number;
  facultyName: string;
  facultyCode: string;
  isActive: boolean;
}

interface StudentApiResponse {
  id: number;
  studentCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  classCode: string;
  majorCode: string;
  startYear: number;
  endYear: number;
  status: string;
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

interface FacultyApiListResponse {
  code: number;
  message: string;
  data: {
    content: FacultyApiResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

interface StudentApiListResponse {
  code: number;
  message: string;
  data: {
    content: StudentApiResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

const facultyMetaMap: Record<string, Omit<Faculty, 'id' | 'name' | 'facultyCode'> & { name: string; facultyCode: string }> = {
  CNTT: {
    facultyCode: 'CNTT',
    name: 'Công nghệ thông tin',
    description: 'Đào tạo Kỹ sư phần mềm, An toàn thông tin và Hệ thống nhúng chất lượng cao.',
    icon: 'laptop',
    color: '#3B82F6',
    image: 'toan-tin',
  },
  KTQL: {
    facultyCode: 'KTQL',
    name: 'Kinh tế - Quản lý',
    description: 'Cung cấp nguồn nhân lực quản lý, marketing và tài chính chuyên nghiệp.',
    icon: 'bank',
    color: '#10B981',
    image: 'kinh-te'
  },
  KHSK: {
    facultyCode: 'KHSK',
    name: 'Khoa học sức khỏe',
    description: 'Đào tạo cử nhân điều dưỡng có y đức và kỹ năng chăm sóc sức khỏe cộng đồng.',
    icon: 'health',
    color: '#3ac2d8',
    image: 'suc-khoe'
  },
  KNN: {
    facultyCode: 'KNN',
    name: 'Ngoại ngữ',
    description: 'Chương trình chuẩn quốc tế về Ngôn ngữ và Văn hóa các nước trên thế giới.',
    icon: 'translate',
    color: '#EF4444',
    image: 'ngoai-ngu'
  },
  XHNV: {
    facultyCode: 'XHNV',
    name: 'Khoa học xã hội và nhân văn',
    description: 'Nơi khơi nguồn sáng tạo và rèn luyện kỹ năng thiết kế truyền thông nghệ thuật.',
    icon: 'social',
    color: '#6d0102',
    image: 'khoa-hoc-xa-hoi'
  },
  KDL: {
    facultyCode: 'KDL',
    name: 'Du lịch',
    description: 'Nơi khơi nguồn sáng tạo và rèn luyện kỹ năng thiết kế truyền thông nghệ thuật.',
    icon: 'travel',
    color: '#00715f',
    image: 'du-lich'
  },
  KTT: {
    facultyCode: 'KTT',
    name: 'Truyền thông đa phương tiện',
    description: 'Nơi khơi nguồn sáng tạo và rèn luyện kỹ năng thiết kế truyền thông nghệ thuật.',
    icon: 'media',
    color: '#be4510',
    image: 'truyen-thong'
  },
  KAN: {
    facultyCode: 'KAN',
    name: 'Âm nhạc ứng dụng',
    description: 'Nơi khơi nguồn sáng tạo và rèn luyện kỹ năng thiết kế truyền thông nghệ thuật.',
    icon: 'music',
    color: '#8B5CF6',
    image: 'am-nhac'
  },
  PDT: {
    facultyCode: 'PDT',
    name: 'Phòng đào tạo',
    description: 'Quản lý đào tạo và chương trình học.',
    icon: 'users',
    color: '#6B7280',
    image: ''
  },
};

export const faculties: Faculty[] = Object.entries(facultyMetaMap).map(([code, meta]) => ({
  id: parseInt(meta.image),
  facultyCode: meta.facultyCode,
  name: meta.name,
  description: meta.description,
  icon: meta.icon,
  color: meta.color,
  image: meta.image,
}));

function mapApiToFaculty(apiFaculty: FacultyApiResponse): Faculty {
  const meta = facultyMetaMap[apiFaculty.facultyCode];
  return {
    id: apiFaculty.id,
    facultyCode: apiFaculty.facultyCode,
    name: apiFaculty.facultyName,
    description: meta?.description ?? 'Mô tả đang được cập nhật.',
    icon: meta?.icon ?? 'users',
    color: meta?.color ?? '#6B7280',
    image: meta?.image ?? '',
  };
}

function mapApiToStudent(apiStudent: StudentApiResponse): Student {
  const genderMap: Record<string, Student['gender']> = {
    NAM: 'Nam',
    NU: 'Nữ',
  };

  return {
    id: apiStudent.id,
    studentCode: apiStudent.studentCode,
    fullName: apiStudent.fullName,
    dateOfBirth: apiStudent.dateOfBirth,
    gender: genderMap[apiStudent.gender] ?? 'Khác',
    classCode: apiStudent.classCode,
    majorCode: apiStudent.majorCode,
    startYear: apiStudent.startYear,
    endYear: apiStudent.endYear,
    status: apiStudent.status as Student['status'],
    trainingType: apiStudent.trainingType,
    identityCard: apiStudent.identityCard,
    contact: apiStudent.contact,
    academicInfo: apiStudent.academicInfo,
    emergencyContact: apiStudent.emergencyContact,
  };
}

export async function fetchFaculties(): Promise<Faculty[]> {
  const response = await apiClient<FacultyApiListResponse>('/faculty/all', { method: 'GET' });
  return response.data.content
    .filter(f => f.facultyCode !== 'PDT')
    .filter(f => f.isActive)
    .map(mapApiToFaculty);
}

export interface FetchStudentsParams {
  khoa: string;
  page?: number;
  size?: number;
}

export interface FetchStudentsResponse {
  students: Student[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export async function fetchStudentsByFaculty(params: FetchStudentsParams): Promise<FetchStudentsResponse> {
  const { khoa, page = 0, size = 50 } = params;

  const response = await apiClient<StudentApiListResponse>(
    '/students/all',
    {
      method: 'GET',
      params: { khoa, page, size },
    }
  );

  return {
    students: response.data.content.map(mapApiToStudent),
    totalElements: response.data.totalElements,
    totalPages: response.data.totalPages,
    page: response.data.page,
    size: response.data.size,
  };
}

export interface CreateStudentPayload {
  studentCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  studentClassCode: string;
  majorCode: string;
  startYear: number;
  endYear: number;
  trainingType: string;
  identityCard: {
    cardNumber: string;
    cardType: string;
    issuedDate: string | null;
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

interface CreateStudentResponse {
  code: number;
  message: string;
  data: StudentApiResponse;
}

export async function createStudent(payload: CreateStudentPayload): Promise<Student> {
  const response = await apiClient<CreateStudentResponse>(
    '/students/create',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return mapApiToStudent(response.data);
}

export async function importStudentsFromExcel(file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${import.meta.env.VITE_API_DOMAIN || ''}/api/v1/admin/students/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGVzIjpudWxsLCJzaWduIjpudWxsLCJpYXQiOjE3NzU3OTMxNTc1NzksImV4cCI6MTc3NTc5Njc1NzU3OX0.OcuqDvFuHymaB9AB9bHgaAGY04DlYL6pUjKqJWMb328`,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('[API] import error:', text);
    throw new Error(`Import failed: ${response.status}`);
  }

  const json = await response.json();
  return json;
}

export interface UpdateStudentBasicPayload {
  studentCode?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  cardNumber?: string;
  cardType?: string;
  issuedDate?: string | null;
  issuedPlace?: string;
  phoneNumber?: string;
  address?: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactPhoneNumber?: string;
  emergencyContactAddress?: string;
  emergencyContactRelationship?: string;
}

export interface UpdateStudentAcademicPayload {
  studentClassCode?: string;
  majorCode?: string;
  trainingType?: string;
  startYear?: number;
  endYear?: number;
  cohort?: string;
  position?: string;
}

interface UpdateResponse {
  code: number;
  message: string;
  data: null;
}

export async function updateStudentBasic(studentId: number, payload: UpdateStudentBasicPayload): Promise<void> {
  const response = await apiClient<UpdateResponse>(
    `/students/update/${studentId}/basic`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function updateStudentAcademic(studentId: number, payload: UpdateStudentAcademicPayload): Promise<void> {
  const response = await apiClient<UpdateResponse>(
    `/students/update/${studentId}/academic`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteStudent(studentId: number): Promise<void> {
  const response = await apiClient<UpdateResponse>(
    `/students/delete/${studentId}`,
    {
      method: 'POST',
    }
  );
}
