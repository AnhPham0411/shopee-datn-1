import http from "src/utils/http";

const voucherApi = {
  applyVoucher: (body: { code: string; order_value: number }) => http.post("/vouchers/apply", body),
  createVoucher: (body: any) => http.post("/vouchers", body),
  getVouchers: () => http.get("/vouchers"),
  getPublicVouchers: () => http.get("/vouchers/public"),
};

export default voucherApi;
