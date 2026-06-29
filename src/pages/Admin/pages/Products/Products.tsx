import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "react-toastify";
import adminApi from "src/apis/admin.api";
import { formatCurrency } from "src/utils/formatNumber";

interface ProductEditForm {
  name: string;
  price: string;
  price_before_discount: string;
  quantity: string;
  status: string;
  description: string;
}

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProductEditForm>({
    name: "", price: "", price_before_discount: "", quantity: "", status: "active", description: "",
  });
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: adminApi.getProducts,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => adminApi.updateProduct(id, body),
    onSuccess: () => {
      toast.success("Cập nhật sản phẩm thành công!");
      setEditingId(null);
      queryClient.invalidateQueries(["adminProducts"]);
    },
    onError: () => toast.error("Có lỗi xảy ra!"),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteProduct,
    onSuccess: () => {
      toast.success("Gỡ sản phẩm thành công!");
      queryClient.invalidateQueries(["adminProducts"]);
    },
  });

  const products = (data?.data?.data || []).filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditOpen = (product: any) => {
    setEditingId(product._id);
    setEditForm({
      name: product.name || "",
      price: String(product.price || ""),
      price_before_discount: String(product.price_before_discount || ""),
      quantity: String(product.quantity || ""),
      status: product.status || "active",
      description: product.description || "",
    });
  };

  const handleSave = () => {
    if (!editingId) return;
    updateMutation.mutate({
      id: editingId,
      body: {
        name: editForm.name,
        price: Number(editForm.price),
        price_before_discount: Number(editForm.price_before_discount),
        quantity: Number(editForm.quantity),
        status: editForm.status,
        description: editForm.description,
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Đang bán</span>;
      case "hidden": return <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">Đã ẩn</span>;
      case "deleted": return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Đã xóa</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Quản lý Sản phẩm</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Kiểm duyệt, chỉnh sửa và gỡ sản phẩm vi phạm.</p>
        </div>
        <div className="relative">
          <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-gray-400">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-left text-sm dark:text-gray-300">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4 font-semibold">Sản phẩm</th>
              <th className="px-6 py-4 font-semibold">Cửa hàng</th>
              <th className="px-6 py-4 font-semibold">Giá</th>
              <th className="px-6 py-4 font-semibold">Tồn kho / Đã bán</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-400">Đang tải...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-400">Không tìm thấy sản phẩm.</td></tr>
            ) : (
              products.map((product: any) => (
                <React.Fragment key={product._id}>
                  <tr className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-700 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="h-12 w-12 flex-shrink-0 rounded-xl border border-gray-100 object-cover dark:border-gray-700" />
                        <div className="max-w-[200px]">
                          <div className="line-clamp-2 text-sm font-medium text-gray-800 dark:text-gray-200">{product.name}</div>
                          <div className="mt-0.5 text-xs text-gray-400">{product.category?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-purple-600">{product.seller?.email || "Shopee"}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-primary">₫{formatCurrency(product.price)}</div>
                      {product.price_before_discount > product.price && (
                        <div className="text-xs text-gray-400 line-through">₫{formatCurrency(product.price_before_discount)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.quantity} / {product.sold}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => editingId === product._id ? setEditingId(null) : handleEditOpen(product)}
                        className="mr-2 rounded-lg border border-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        {editingId === product._id ? "Thu gọn" : "Sửa"}
                      </button>
                      <button
                        onClick={() => { if (confirm("Gỡ sản phẩm này?")) deleteMutation.mutate(product._id); }}
                        className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                      >
                        Gỡ bỏ
                      </button>
                    </td>
                  </tr>

                  {/* ── Inline Edit Row ── */}
                  {editingId === product._id && (
                    <tr className="border-b border-primary/10 bg-orange-50/50 dark:border-primary/20 dark:bg-gray-800">
                      <td colSpan={6} className="px-6 py-5">
                        <p className="mb-4 text-sm font-bold text-gray-700 dark:text-gray-300">✏️ Chỉnh sửa: {product.name}</p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="lg:col-span-3">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Tên sản phẩm</label>
                            <input value={editForm.name} onChange={e => setEditForm(f => ({...f, name: e.target.value}))}
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Giá bán (₫)</label>
                            <input type="number" min="0" value={editForm.price} onChange={e => setEditForm(f => ({...f, price: e.target.value}))}
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Giá gốc (₫)</label>
                            <input type="number" min="0" value={editForm.price_before_discount} onChange={e => setEditForm(f => ({...f, price_before_discount: e.target.value}))}
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Số lượng tồn kho</label>
                            <input type="number" min="0" value={editForm.quantity} onChange={e => setEditForm(f => ({...f, quantity: e.target.value}))}
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Trạng thái</label>
                            <select value={editForm.status} onChange={e => setEditForm(f => ({...f, status: e.target.value}))}
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                              <option value="active">Đang bán (Active)</option>
                              <option value="hidden">Ẩn khỏi trang chủ (Hidden)</option>
                              <option value="deleted">Đã xóa (Deleted)</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2 lg:col-span-3">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Mô tả (tóm tắt)</label>
                            <textarea rows={2} value={editForm.description} onChange={e => setEditForm(f => ({...f, description: e.target.value}))}
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                          </div>
                        </div>
                        <div className="mt-4 flex gap-3">
                          <button onClick={handleSave} disabled={updateMutation.isLoading}
                            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50">
                            {updateMutation.isLoading ? "Đang lưu..." : "💾 Lưu thay đổi"}
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                            Hủy
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
