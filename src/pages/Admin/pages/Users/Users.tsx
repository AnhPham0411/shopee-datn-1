import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-toastify";
import adminApi from "src/apis/admin.api";

export default function Users() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: adminApi.getUsers,
  });

  const users = data?.data.data || [];

  const toggleLockMutation = useMutation({
    mutationFn: adminApi.toggleLockUser,
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });

  const handleToggleLock = (id: string, isLocked: boolean) => {
    if (window.confirm(`Bạn có chắc muốn ${isLocked ? "mở khóa" : "khóa"} người dùng này?`)) {
      toggleLockMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-[600px] rounded-sm bg-white p-6 shadow-sm dark:bg-gray-800">
      <h1 className="mb-6 text-2xl font-medium dark:text-gray-100">Quản lý Người dùng & Cửa hàng</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm dark:text-gray-300">
          <thead className="bg-gray-50 uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr
                key={user._id}
                className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3 font-medium dark:text-gray-200">{user.email}</td>
                <td className="px-4 py-3">{user.name || "N/A"}</td>
                <td className="px-4 py-3">
                  {user.roles.includes("Store") ? (
                    <span className="rounded-sm bg-purple-100 px-2 py-1 text-xs text-purple-700">Cửa hàng</span>
                  ) : (
                    <span className="rounded-sm bg-blue-100 px-2 py-1 text-xs text-blue-700">Khách hàng</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {user.isLocked ? (
                    <span className="font-medium text-red-500">Bị khóa</span>
                  ) : (
                    <span className="font-medium text-green-500">Hoạt động</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleToggleLock(user._id, user.isLocked)}
                    className={`${user.isLocked ? "text-green-500" : "text-red-500"} font-medium hover:underline`}
                  >
                    {user.isLocked ? "Mở khóa" : "Khóa"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
