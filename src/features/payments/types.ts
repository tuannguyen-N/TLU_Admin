export interface TuitionInvoice {
  invoiceId: number;
  studentName: string;
  studentCode: string;
  semesterCode: string;
  totalAmount: number;
  finalAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE' | 'UNPAID';
  dueDate: string;
}

export interface TuitionInvoicesResponse {
  invoices: TuitionInvoice[];
  totalElements: number;
  totalPages: number;
  page: number;
}

export interface TuitionFeeConfig {
  id: number;
  basePricePerCredit: number;
  academicYear: string;
  cohort: number;
  createdAt: string;
  updatedAt: string;
}

export interface TuitionFeeConfigFormData {
  basePricePerCredit: number;
  academicYear: string;
  cohort: number;
}
