import http from "src/utils/http";

export interface AddressBody {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault?: boolean;
}

const addressApi = {
  getAddresses: () => http.get("/user/addresses"),
  addAddress: (body: AddressBody) => http.post("/user/addresses", body),
  updateAddress: (id: string, body: Partial<AddressBody>) => http.put(`/user/addresses/${id}`, body),
  deleteAddress: (id: string) => http.delete(`/user/addresses/${id}`),
  setDefaultAddress: (id: string) => http.put(`/user/addresses/${id}/default`),
};

export default addressApi;
