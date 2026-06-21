import React from "react";
import { Link } from "react-router-dom";
import { path } from "src/constants/path.enum";

export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-100">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold text-primary">403</h1>
        <h2 className="mb-8 text-3xl font-medium text-gray-800">Không Có Quyền Truy Cập</h2>
        <p className="mb-8 text-gray-600">Bạn không có quyền truy cập vào trang này.</p>
        <Link
          to={path.home}
          className="rounded-sm bg-primary px-6 py-3 font-medium uppercase text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          Trở Về Trang Chủ
        </Link>
      </div>
    </div>
  );
}
