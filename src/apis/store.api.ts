import http from "src/utils/http";

const storeApi = {
  registerStore: () => http.post("/store/register"),
  getProducts: () => http.get("/store/products"),
  createProduct: (body: any) => http.post("/store/products", body),
  updateProduct: (id: string, body: any) => http.put(`/store/products/${id}`, body),
  deleteProduct: (id: string) => http.delete(`/store/products/${id}`),
  getOrders: () => http.get("/store/orders"),
  getDashboard: () => http.get("/store/dashboard"),
};

export default storeApi;
