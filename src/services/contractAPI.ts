import { apiClient } from "./ApiConfig.ts";

export const contractAPI = {
  refreshToken: () => {
    return apiClient.get(`/auth/refresh`, { withCredentials: true });
  },
  getContracts: (vendorId: number) => {
    return apiClient.get(`/contracts/vendor?vendor_id=${vendorId}`);
  },
};
