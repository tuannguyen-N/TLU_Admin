import { apiClient } from '../../../lib/api-client';
import type { TuitionInvoice } from '../types';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface InvoiceApiResponse {
  invoiceId: number;
  studentName: string;
  studentCode: string;
  semesterCode: string;
  totalAmount: number;
  finalAmount: number;
  status: string;
  dueDate: string;
}

interface InvoiceApiListResponse {
  content: InvoiceApiResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export async function fetchTuitionInvoices(params: {
  semesterId: number;
  page?: number;
  size?: number;
  status?: string;
}): Promise<{
  invoices: TuitionInvoice[];
  totalElements: number;
  totalPages: number;
  page: number;
}> {
  const { semesterId, page = 0, size = 10, status } = params;
  const queryParams: Record<string, string | number> = { semesterId, page, size };
  if (status) {
    queryParams.status = status;
  }
  const response = await apiClient<ApiResponse<InvoiceApiListResponse>>('/tuition/invoices', {
    method: 'GET',
    params: queryParams,
  });
  return {
    invoices: response.data.content,
    totalElements: response.data.totalElements,
    totalPages: response.data.totalPages,
    page: response.data.page,
  };
}

export async function generateTuitionInvoices(semesterId: number): Promise<void> {
  await apiClient<ApiResponse<null>>('/tuition/generate', {
    method: 'POST',
    body: JSON.stringify({ semesterId }),
  });
}

export async function regenerateTuitionInvoice(invoiceId: number): Promise<void> {
  await apiClient<ApiResponse<null>>(`/tuition/regenerate/${invoiceId}`, {
    method: 'POST',
  });
}