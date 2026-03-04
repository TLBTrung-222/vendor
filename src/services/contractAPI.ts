import { apiClient } from "./ApiConfig.ts";

export const contractAPI = {
  refreshToken: () => {
    return apiClient.get(`/auth/refresh`);
  },
  getContracts: (vendorId: number) => {
    return apiClient.get(`/contracts/vendor?vendor_id=${vendorId}`);
  },
  requestOTP: (body: any) => {
    return apiClient.post(`/mfa/request-otp`, body);
  },
  verifyOTP: (body: any) => {
    return apiClient.post(`/mfa/verify-otp`, body);
  },
};
