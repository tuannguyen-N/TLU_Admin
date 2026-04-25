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