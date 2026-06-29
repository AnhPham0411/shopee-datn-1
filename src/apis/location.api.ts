import axios from "axios";

// API địa giới hành chính VN công khai (miễn phí, không cần key).
// Dùng instance riêng vì không gọi tới backend của app.
const locationHttp = axios.create({
  baseURL: "https://provinces.open-api.vn/api",
  timeout: 10000,
});

export interface LocationUnit {
  code: number;
  name: string;
  districts?: LocationUnit[];
  wards?: LocationUnit[];
}

const locationApi = {
  // Danh sách tỉnh/thành
  getProvinces: () => locationHttp.get<LocationUnit[]>("/p/"),
  // Tỉnh + danh sách huyện (depth=2)
  getDistricts: (provinceCode: number) => locationHttp.get<LocationUnit>(`/p/${provinceCode}?depth=2`),
  // Huyện + danh sách xã (depth=2)
  getWards: (districtCode: number) => locationHttp.get<LocationUnit>(`/d/${districtCode}?depth=2`),
};

export default locationApi;
