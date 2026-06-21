import React, { useContext } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { path } from "src/constants/path.enum";
import { AuthContext } from "src/contexts/auth.context";
import adminApi from "src/apis/admin.api";

const NAV_SECTIONS = [
  {
    section: "Tổng quan",
    items: [
      { name: "Dashboard", path: path.adminDashboard, icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
    ],
  },
  {
    section: "Quản lý bán hàng",
    items: [
      { name: "Đơn hàng", path: path.adminOrders, icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z", badgeKey: "pending" },
      { name: "Sản phẩm", path: path.adminProducts, icon: "M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z" },
      { name: "Danh mục", path: path.adminCategories, icon: "M4 6h16v2H4zm4 5h12v2H8zm4 5h8v2h-8z" },
    ],
  },
  {
    section: "Người dùng & Kênh bán",
    items: [
      { name: "Người dùng", path: path.adminUsers, icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" },
      { name: "Cửa hàng", path: path.adminStores, icon: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" },
    ],
  },
  {
    section: "Marketing",
    items: [
      { name: "Voucher / Mã giảm giá", path: path.adminVouchers, icon: "M20 6h-2.18c.07-.44.18-.88.18-1.35C18 2.53 15.73 0 12.85 0c-1.6 0-3.06.8-4 2.05C7.82.8 6.39 0 4.85 0 2.09 0 0 2.09 0 4.65c0 .47.07.91.18 1.35H0v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8-4c.97 0 1.85.86 1.85 1.65 0 .8-.88 1.35-1.85 1.35s-1.85-.56-1.85-1.35S11.03 2 12 2zm-7.15 0C5.73 2 6.85 3.12 6.85 4.65c0 .97-.76 1.35-1.85 1.35C3.87 6 3 5.5 3 4.65 3 3.12 3.88 2 4.85 2zM20 20H4v-2h16v2zm0-4H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v8z" },
      { name: "Đánh giá sản phẩm", path: path.adminReviews, icon: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z" },
    ],
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { userProfile } = useContext(AuthContext);

  const { data: statsData } = useQuery({
    queryKey: ["adminStats"],
    queryFn: adminApi.getStats,
    refetchInterval: 60000,
  });
  const pendingOrders = statsData?.data?.data?.pendingOrders || 0;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-xl">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center bg-gradient-to-r from-primary to-orange-500">
          <Link to={path.adminDashboard} className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            Shopee Admin
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.section} className="mb-4">
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {section.section}
              </p>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-5 w-5 flex-shrink-0 fill-current transition-colors ${
                          isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      >
                        <path d={item.icon} />
                      </svg>
                      <span className="flex-1">{item.name}</span>
                      {item.badgeKey === "pending" && pendingOrders > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                          {pendingOrders}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={() => navigate(path.home)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-gray-400">
              <path d="M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21v-2z" />
            </svg>
            Về trang chủ
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex min-h-screen flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-end border-b border-gray-100 bg-white/80 px-8 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">{userProfile?.name || "Admin"}</div>
              <div className="text-xs text-gray-400">{userProfile?.email}</div>
            </div>
            <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10">
              {userProfile?.avatar ? (
                <img src={userProfile.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
                  {(userProfile?.name || "A")[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
