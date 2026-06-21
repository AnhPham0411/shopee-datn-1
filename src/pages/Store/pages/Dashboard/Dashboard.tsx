import { useQuery } from "@tanstack/react-query";
import React from "react";
import storeApi from "src/apis/store.api";
import { formatCurrency } from "src/utils/formatNumber";

export default function Dashboard() {
  const { data } = useQuery({
    queryKey: ["storeDashboard"],
    queryFn: storeApi.getDashboard,
  });

  const stats = data?.data.data || { totalRevenue: 0, totalOrders: 0 };

  return (
    <div className="min-h-[600px] rounded-sm bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-medium">Tổng quan cửa hàng</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-sm border border-gray-200 bg-orange-50 p-6">
          <div className="mb-2 text-gray-500">Tổng doanh thu</div>
          <div className="text-3xl font-bold text-primary">₫{formatCurrency(stats.totalRevenue)}</div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-sm border border-gray-200 bg-blue-50 p-6">
          <div className="mb-2 text-gray-500">Tổng đơn hàng hoàn thành</div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalOrders} đơn</div>
        </div>
      </div>
    </div>
  );
}
