import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-toastify";
import adminApi from "src/apis/admin.api";

export default function AdminStores() {
  const queryClient = useQueryClient();

  const { data: storesData, isLoading } = useQuery({
    queryKey: ["adminStores"],
    queryFn: () => adminApi.getStores(),
  });

  const toggleLockMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleLockUser(id),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(["adminStores"]);
    },
  });

  const stores = storesData?.data?.data || [];

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Cửa hàng</h2>
        <p className="mt-1 text-sm text-gray-500">Xem danh sách đối tác bán hàng và kiểm soát trạng thái hoạt động.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Tên Shop</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Số điện thoại</th>
              <th className="px-6 py-4 font-semibold">Ngày đăng ký</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-500">Đang tải dữ liệu...</td>
              </tr>
            ) : stores.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-500">Không có cửa hàng nào.</td>
              </tr>
            ) : (
              stores.map((store: any) => (
                <tr key={store._id} className="border-b bg-white hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                        <img
                          src={store.avatar || "https://picsum.photos/200"}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="font-medium text-gray-900">{store.name || "Cửa hàng mới"}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{store.email}</td>
                  <td className="px-6 py-4">{store.phone || "---"}</td>
                  <td className="px-6 py-4">
                    {store.createdAt && new Date(store.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4">
                    {store.isLocked ? (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                        Bị khóa
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        Đang hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleLockMutation.mutate(store._id)}
                      disabled={toggleLockMutation.isLoading}
                      className={`rounded px-3 py-1 text-xs font-medium text-white transition-colors ${
                        store.isLocked 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {store.isLocked ? "Mở khóa" : "Khóa shop"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
