import http from "src/utils/http";

const orderApi = {
  getOrders: (status?: number) => http.get("/orders", { params: { status } }),
  getOrderById: (id: string) => http.get(`/orders/${id}`),
  updateOrderStatus: (id: string, status: number) => http.put(`/orders/${id}/status`, { status }),
};

export default orderApi;
