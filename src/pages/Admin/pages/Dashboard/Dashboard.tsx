import { useQuery } from "@tanstack/react-query";
import React from "react";
import adminApi from "src/apis/admin.api";
import { formatCurrency } from "src/utils/formatNumber";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { data } = useQuery({
    queryKey: ["adminStats"],
    queryFn: adminApi.getStats,
  });

  const stats = data?.data.data || {
    totalUsers: 0,
    totalStores: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    chartData: [],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Tổng Quan</h1>
        <p className="mt-2 text-sm text-gray-500">
          Theo dõi doanh thu, người dùng và hoạt động mua bán trên toàn hệ thống Shopee.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Doanh thu */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-orange-500 p-6 shadow-lg shadow-orange-200">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/20 blur-2xl"></div>
          <div className="relative">
            <p className="text-sm font-medium text-orange-100">Tổng doanh thu</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white">₫{formatCurrency(stats.totalRevenue)}</p>
            <div className="mt-4 flex items-center text-xs font-medium text-orange-100">
              <svg viewBox="0 0 24 24" className="mr-1 h-4 w-4 fill-current"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" /></svg>
              <span>+15.3% so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Đơn hàng (Chờ/Hoàn thành)</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
            </div>
          </div>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-gray-900">{stats.totalOrders}</span>
            <span className="text-sm font-semibold text-gray-500">tổng</span>
          </p>
          <div className="mt-4 flex gap-4 text-xs font-medium">
            <span className="flex items-center gap-1 text-yellow-600">
              <span className="h-2 w-2 rounded-full bg-yellow-500"></span> {stats.pendingOrders} Chờ duyệt
            </span>
            <span className="flex items-center gap-1 text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500"></span> {stats.completedOrders} Hoàn thành
            </span>
          </div>
        </div>

        {/* Người dùng */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Khách hàng</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{stats.totalUsers}</p>
          <div className="mt-4 flex items-center text-xs font-medium text-green-600">
            <svg viewBox="0 0 24 24" className="mr-1 h-4 w-4 fill-current"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" /></svg>
            <span>+3 user mới hôm nay</span>
          </div>
        </div>

        {/* Cửa hàng */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Gian hàng (Stores)</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" /></svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{stats.totalStores}</p>
          <div className="mt-4 flex items-center text-xs font-medium text-gray-500">
            <span>Đối tác bán hàng trên sàn</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-gray-900">Biểu đồ doanh thu 7 ngày gần nhất</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ee4d2d" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ee4d2d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickFormatter={(value) => `₫${formatCurrency(value)}`}
                width={80}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`₫${formatCurrency(value as number)}`, "Doanh thu"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ee4d2d"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#ee4d2d" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
