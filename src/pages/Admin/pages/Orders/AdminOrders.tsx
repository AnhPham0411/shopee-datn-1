import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "react-toastify";
import adminApi from "src/apis/admin.api";
import { formatCurrency } from "src/utils/formatNumber";

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<number>(0);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: () => adminApi.getOrders(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (body: { id: string; status: number }) => adminApi.updateOrderStatus(body.id, body.status),
    onSuccess: () => {
      toast.success("Cập nhật trạng thái thành công");
      queryClient.invalidateQueries(["adminOrders"]);
    },
  });

  const orders = ordersData?.data?.data || [];
  
  const filteredOrders = filterStatus === 0 
    ? orders 
    : orders.filter((o: any) => o.status === filterStatus);

  const handleUpdateStatus = (id: string, newStatus: number) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">Chờ xác nhận</span>;
      case 6:
        return <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">Đã xác nhận</span>;
      case 2:
        return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">Chuẩn bị hàng</span>;
      case 3:
        return <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">Đang giao hàng</span>;
      case 4:
        return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Hoàn thành</span>;
      case 5:
        return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">Đã hủy</span>;
      default:
        return <span>Unknown</span>;
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Quản lý Đơn hàng</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Duyệt và theo dõi trạng thái các đơn hàng trên toàn hệ thống.</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 outline-none focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            value={filterStatus}
            onChange={(e) => setFilterStatus(Number(e.target.value))}
          >
            <option value={0}>Tất cả đơn hàng</option>
            <option value={1}>Chờ xác nhận</option>
            <option value={6}>Đã xác nhận</option>
            <option value={2}>Chuẩn bị hàng</option>
            <option value={3}>Đang giao hàng</option>
            <option value={4}>Hoàn thành (Đã nhận)</option>
            <option value={5}>Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <tr>
              <th className="px-6 py-4 font-semibold">Mã ĐH / Ngày đặt</th>
              <th className="px-6 py-4 font-semibold">Khách hàng</th>
              <th className="px-6 py-4 font-semibold">Sản phẩm</th>
              <th className="px-6 py-4 font-semibold">Tổng tiền</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-500">Đang tải dữ liệu...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-500">Không có đơn hàng nào.</td>
              </tr>
            ) : (
              filteredOrders.map((order: any) => (
                <tr key={order._id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-gray-200">#{order._id.substring(order._id.length - 6).toUpperCase()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {order.createdAt && new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-gray-200">{order.recipientName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{order.recipientPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-600 line-clamp-2 dark:text-gray-300">
                      {order.items.map((i: any) => i.productName).join(", ")}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">{order.items.length} sản phẩm</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-primary">
                    ₫{formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusLabel(order.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {order.status === 1 && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 6)}
                        className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                        disabled={updateStatusMutation.isLoading}
                      >
                        Xác nhận đơn
                      </button>
                    )}
                    {order.status === 6 && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 2)}
                        className="rounded bg-teal-600 px-3 py-1 text-xs font-medium text-white hover:bg-teal-700"
                        disabled={updateStatusMutation.isLoading}
                      >
                        Chuẩn bị hàng
                      </button>
                    )}
                    {order.status === 2 && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 3)}
                        className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                        disabled={updateStatusMutation.isLoading}
                      >
                        Giao cho Shipper
                      </button>
                    )}
                    {order.status === 3 && (
                      <span className="text-xs text-gray-500 italic">Chờ KH nhận hàng</span>
                    )}
                    {(order.status === 1 || order.status === 6 || order.status === 2) && (
                      <button
                        onClick={() => {
                          if (confirm("Bạn có chắc muốn hủy đơn này?")) {
                            handleUpdateStatus(order._id, 5);
                          }
                        }}
                        className="ml-2 rounded border border-red-600 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        disabled={updateStatusMutation.isLoading}
                      >
                        Hủy
                      </button>
                    )}
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
