import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import notificationApi from "src/apis/notification.api";
import Popover from "../Popover";

export default function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.getNotifications(),
    refetchInterval: 30000, // polling 30s (không dùng WebSocket cho đồ án)
  });

  const notifications: any[] = data?.data?.data?.notifications || [];
  const unreadCount: number = data?.data?.data?.unreadCount || 0;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  const handleClick = (n: any) => {
    if (!n.isRead) markReadMutation.mutate(n._id);
    if (n.link) navigate(n.link);
  };

  return (
    <Popover
      className="relative flex cursor-pointer items-center py-1 hover:text-gray-300"
      renderPopover={
        <div className="w-[360px] rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-left shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-4 py-2">
            <span className="font-medium text-gray-700 dark:text-gray-200">{t("Thông báo")}</span>
            {unreadCount > 0 && (
              <button onClick={() => markAllMutation.mutate()} className="text-xs text-primary hover:underline">
                {t("Đánh dấu đã đọc tất cả")}
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">{t("Chưa có thông báo")}</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleClick(n)}
                  onKeyDown={(e) => (e.key === "Enter" ? handleClick(n) : null)}
                  className={`cursor-pointer border-b border-gray-50 dark:border-gray-700/50 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    n.isRead ? "" : "bg-primary/5"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
                    <div className={n.isRead ? "pl-4" : ""}>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{n.title}</div>
                      <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{n.message}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
        />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-primary">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Popover>
  );
}
