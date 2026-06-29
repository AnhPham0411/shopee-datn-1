import http from "src/utils/http";

const paymentApi = {
  // Mô phỏng người dùng thao tác trên cổng thanh toán rồi cổng gọi callback
  confirm: (orderId: string, success: boolean) => http.post(`/payment/${orderId}/confirm`, { success }),
};

export default paymentApi;
