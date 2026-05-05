import { apiClient } from '../../../lib/api-client';
import type { TuitionFeeConfig, TuitionFeeConfigFormData, TuitionInvoice } from '../types';

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

interface TuitionFeeConfigApiListResponse {
  content: TuitionFeeConfig[];
  page: number;
  size: number;
  total_elements?: number;
  totalElements?: number;
  total_pages?: number;
  totalPages?: number;
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
    invoices: response.data.content.map((invoice): TuitionInvoice => ({
      ...invoice,
      status: invoice.status as TuitionInvoice['status'],
    })),
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

export async function fetchTuitionFeeConfigs(params: { page?: number; size?: number }): Promise<{
  configs: TuitionFeeConfig[];
  totalElements: number;
  totalPages: number;
  page: number;
}> {
  const { page = 0, size = 10 } = params;
  const response = await apiClient<ApiResponse<TuitionFeeConfigApiListResponse>>('/tuition-fee-configs', {
    method: 'GET',
    params: { page, size },
  });

  return {
    configs: response.data.content,
    totalElements: response.data.total_elements ?? response.data.totalElements ?? 0,
    totalPages: response.data.total_pages ?? response.data.totalPages ?? 0,
    page: response.data.page,
  };
}

export async function createTuitionFeeConfig(payload: TuitionFeeConfigFormData): Promise<number> {
  const response = await apiClient<ApiResponse<number>>('/tuition-fee-configs/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateTuitionFeeConfig(id: number, payload: TuitionFeeConfigFormData): Promise<void> {
  await apiClient<ApiResponse<null>>(`/tuition-fee-configs/update/${id}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteTuitionFeeConfig(id: number): Promise<void> {
  await apiClient<ApiResponse<null>>(`/tuition-fee-configs/delete/${id}`, {
    method: 'POST',
  });
}
