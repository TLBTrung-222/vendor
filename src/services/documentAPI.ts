import { apiClient } from "./ApiConfig.ts";

export const documentAPI = {
  getDocuments: (vendorId: number) => {
    return apiClient.get(`/documents/vendors/${vendorId}/documents`);
  },
  uploadDocument: (formData: FormData) => {
    return apiClient.post(`/documents/vendors/documents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
