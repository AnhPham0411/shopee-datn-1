import http from "src/utils/http";

const adminApi = {
  getStats: () => http.get("/admin/stats"),
  // Users
  getUsers: () => http.get("/admin/users"),
  toggleLockUser: (id: string) => http.put(`/admin/users/${id}/lock`),
  // Products
  getProducts: () => http.get("/admin/products"),
  updateProduct: (id: string, body: any) => http.put(`/admin/products/${id}`, body),
  deleteProduct: (id: string) => http.delete(`/admin/products/${id}`),
  // Stores
  getStores: () => http.get("/admin/stores"),
  // Orders
  getOrders: () => http.get("/admin/orders"),
  updateOrderStatus: (id: string, status: number) => http.put(`/admin/orders/${id}/status`, { status }),
  // Categories
  getCategories: () => http.get("/admin/categories"),
  createCategory: (body: { name: string; image?: string }) => http.post("/admin/categories", body),
  updateCategory: (id: string, body: { name: string; image?: string }) => http.put(`/admin/categories/${id}`, body),
  deleteCategory: (id: string) => http.delete(`/admin/categories/${id}`),
  // Vouchers
  getVouchers: () => http.get("/admin/vouchers"),
  createVoucher: (body: any) => http.post("/admin/vouchers", body),
  toggleVoucher: (id: string) => http.put(`/admin/vouchers/${id}/toggle`),
  deleteVoucher: (id: string) => http.delete(`/admin/vouchers/${id}`),
  // Reviews
  getReviews: () => http.get("/admin/reviews"),
  deleteReview: (id: string) => http.delete(`/admin/reviews/${id}`),
};

export default adminApi;

