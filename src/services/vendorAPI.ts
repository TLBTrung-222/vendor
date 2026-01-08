import { apiClient } from "./ApiConfig.ts";

export const vendorAPI = {
  getVendorByContactEmail: (email: string) => {
    return apiClient.get(
      `/vendors/contact-email?email=${encodeURIComponent(email)}`
    );
  },
  updateVendor: (vendorId: string, data: any) => {
    return apiClient.put(`/vendors/update?vendor_id=${vendorId}`, data);
  },
  updateUser: (data: any) => {
    return apiClient.put(`/users/update`, data);
  },
  getCountries: () => {
    return apiClient.get(`/countries`);
  },
  getLegalForms: (countryId: number) => {
    return apiClient.get(`/legal-forms/country?country_id=${countryId}`);
  },
  getTrades: () => {
    return apiClient.get(`/gewerks/assign`);
  },
  getPositions: () => {
    return apiClient.get(`/representative_positions/representative-positions`);
  },
};
