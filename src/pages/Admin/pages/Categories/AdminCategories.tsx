import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "react-toastify";
import adminApi from "src/apis/admin.api";

interface EditState {
  id: string;
  name: string;
}

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: () => adminApi.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createCategory,
    onSuccess: () => {
      toast.success("Tạo danh mục thành công!");
      setNewName("");
      setIsAdding(false);
      queryClient.invalidateQueries(["adminCategories"]);
    },
    onError: () => toast.error("Có lỗi xảy ra!"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      adminApi.updateCategory(id, { name }),
    onSuccess: () => {
      toast.success("Đã cập nhật danh mục!");
      setEditState(null);
      queryClient.invalidateQueries(["adminCategories"]);
    },
    onError: () => toast.error("Có lỗi xảy ra!"),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteCategory,
    onSuccess: () => {
      toast.success("Đã xóa danh mục!");
      queryClient.invalidateQueries(["adminCategories"]);
    },
  });

  const categories = data?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h2>
          <p className="mt-1 text-sm text-gray-500">Quản lý các danh mục sản phẩm trên toàn sàn.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-transform hover:scale-105 hover:bg-orange-600"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Thêm danh mục
        </button>
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="rounded-2xl border border-primary/20 bg-orange-50 p-5">
          <p className="mb-3 text-sm font-semibold text-gray-700">Thêm danh mục mới</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nhập tên danh mục..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && newName.trim() && createMutation.mutate({ name: newName })}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              autoFocus
            />
            <button onClick={() => newName.trim() && createMutation.mutate({ name: newName })}
              disabled={createMutation.isLoading}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50">
              {createMutation.isLoading ? "Đang lưu..." : "Lưu"}
            </button>
            <button onClick={() => { setIsAdding(false); setNewName(""); }}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Category grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
            ))
          : categories.map((cat: any) => (
              <div
                key={cat._id}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-primary"><path d="M4 6h16v2H4zm4 5h12v2H8zm4 5h8v2h-8z"/></svg>
                </div>

                {editState?.id === cat._id ? (
                  /* ── inline edit mode ── */
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      autoFocus
                      value={editState.name}
                      onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") updateMutation.mutate({ id: editState.id, name: editState.name });
                        if (e.key === "Escape") setEditState(null);
                      }}
                      className="flex-1 rounded-lg border border-primary px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/10"
                    />
                    <button
                      onClick={() => updateMutation.mutate({ id: editState.id, name: editState.name })}
                      disabled={updateMutation.isLoading}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                      Lưu
                    </button>
                    <button onClick={() => setEditState(null)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                      Hủy
                    </button>
                  </div>
                ) : (
                  /* ── display mode ── */
                  <>
                    <span className="flex-1 text-sm font-medium text-gray-800">{cat.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditState({ id: cat._id, name: cat.name })}
                        title="Sửa tên"
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => { if (confirm(`Xóa "${cat.name}"?`)) deleteMutation.mutate(cat._id); }}
                        title="Xóa danh mục"
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
      </div>

      {!isLoading && categories.length === 0 && (
        <div className="py-20 text-center text-gray-400">
          <svg viewBox="0 0 24 24" className="mx-auto mb-4 h-12 w-12 fill-current opacity-30"><path d="M4 6h16v2H4zm4 5h12v2H8zm4 5h8v2h-8z"/></svg>
          <p className="text-sm">Chưa có danh mục. Hãy thêm ngay!</p>
        </div>
      )}
    </div>
  );
}
