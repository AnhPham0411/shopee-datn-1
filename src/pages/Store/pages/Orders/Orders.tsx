import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-toastify";
import storeApi from "src/apis/store.api";
import orderApi from "src/apis/order.api";
import { formatCurrency } from "src/utils/formatNumber";

export default function Orders() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["storeOrders"],
    queryFn: storeApi.getOrders,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (body: { id: string; status: number }) => orderApi.updateOrderStatus(body.id, body.status),
    onSuccess: () => {
      toast.success("Cập nhật trạng thái thành công!");
      queryClient.invalidateQueries(["storeOrders"]);
    },
    onError: () => {
      toast.error("Cập nhật trạng thái thất bại!");
    }
  });

  const orders = data?.data.data || [];

  const handleStatusChange = (id: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    updateStatusMutation.mutate({ id, status: Number(e.target.value) });
  };

  return (
    <div className="min-h-[600px] rounded-sm bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-medium">Quản lý Đơn hàng</h1>

      {orders.length === 0 ? (
        <div className="py-10 text-center text-gray-500">Chưa có đơn hàng nào.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 uppercase text-gray-700">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Tổng tiền</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr
                  key={order._id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-xs text-gray-500">{order._id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.user?.name || "Khách hàng"}</div>
                    <div className="text-xs text-gray-500">{order.user?.phone}</div>
                  </td>
                  <td className="flex items-center gap-2 px-4 py-3">
                    <img
                      src={order.product?.image}
                      alt=""
                      className="h-8 w-8 border object-cover"
                    />
                    <div className="max-w-[150px] line-clamp-1">{order.product?.name}</div>
                    <div className="text-gray-500">x{order.buy_count}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-primary">
                    ₫{formatCurrency(order.price * order.buy_count)}
                  </td>
                  <td className="px-4 py-3">
                    {order.status === 1 && <span className="text-yellow-600">Chờ xác nhận</span>}
                    {order.status === 2 && <span className="text-blue-600">Chuẩn bị hàng</span>}
                    {order.status === 3 && <span className="text-indigo-600">Đang giao</span>}
                    {order.status === 4 && <span className="text-green-600">Hoàn thành</span>}
                    {order.status === 5 && <span className="text-red-600">Đã hủy</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e)}
                      disabled={updateStatusMutation.isLoading}
                      className="rounded-sm border border-gray-300 px-2 py-1 text-xs outline-none focus:border-primary"
                    >
                      <option value="1">Chờ xác nhận</option>
                      <option value="2">Chuẩn bị hàng</option>
                      <option value="3">Đang giao</option>
                      <option value="4">Hoàn thành</option>
                      <option value="5">Đã hủy</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
