import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { path } from "src/constants/path.enum";

export default function StoreLayout() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link
            to={path.home}
            className="flex items-center gap-2 text-xl font-bold text-primary"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 fill-primary"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            Shopee Kênh Người Bán
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to={path.home}
              className="text-sm text-gray-600 hover:text-primary"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </header>
      <div className="container flex gap-6 py-8">
        <aside className="w-64 flex-shrink-0">
          <div className="overflow-hidden rounded-sm bg-white shadow-sm">
            <div className="border-b border-gray-100 p-4">
              <h2 className="font-bold text-gray-700">Quản lý Shop</h2>
            </div>
            <nav className="flex flex-col py-2">
              <NavLink
                to={path.storeDashboard}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm hover:bg-gray-50 ${
                    isActive ? "border-r-4 border-primary bg-gray-50 font-medium text-primary" : "text-gray-600"
                  }`
                }
              >
                Tổng quan
              </NavLink>
              <NavLink
                to={path.storeProducts}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm hover:bg-gray-50 ${
                    isActive ? "border-r-4 border-primary bg-gray-50 font-medium text-primary" : "text-gray-600"
                  }`
                }
              >
                Quản lý Sản phẩm
              </NavLink>
              <NavLink
                to={path.storeOrders}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm hover:bg-gray-50 ${
                    isActive ? "border-r-4 border-primary bg-gray-50 font-medium text-primary" : "text-gray-600"
                  }`
                }
              >
                Quản lý Đơn hàng
              </NavLink>
              <NavLink
                to={path.storeVouchers}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm hover:bg-gray-50 ${
                    isActive ? "border-r-4 border-primary bg-gray-50 font-medium text-primary" : "text-gray-600"
                  }`
                }
              >
                Mã Giảm Giá
              </NavLink>
            </nav>
          </div>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
