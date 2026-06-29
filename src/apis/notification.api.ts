import http from "src/utils/http";

const notificationApi = {
  getNotifications: () => http.get("/notifications"),
  markAsRead: (id: string) => http.put(`/notifications/${id}/read`),
  markAllAsRead: () => http.put("/notifications/read-all"),
};

export default notificationApi;
