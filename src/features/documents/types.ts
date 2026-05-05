export interface UploadDocumentResult {
  processedFiles: number;
  totalChunks: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
