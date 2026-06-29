import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "react-toastify";
import adminApi from "src/apis/admin.api";
import { formatCurrency } from "src/utils/formatNumber";

interface VoucherForm {
  code: string;
  title: string;
  discount_type: "percent" | "fixed";
  discount_value: string;
  min_order_value: string;
  max_discount_amount: string;
  expires_at: string;
  usage_limit: string;
}

const EMPTY_FORM: VoucherForm = {
  code: "", title: "", discount_type: "percent",
  discount_value: "", min_order_value: "",
  max_discount_amount: "", expires_at: "", usage_limit: "100",
};

export default function AdminVouchers() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<VoucherForm>(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ["adminVouchers"],
    queryFn: () => adminApi.getVouchers(),
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createVoucher,
    onSuccess: () => {
      toast.success("Tạo voucher thành công!");
      setShowForm(false);
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries(["adminVouchers"]);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Có lỗi xảy ra!"),
  });

  const toggleMutation = useMutation({
    mutationFn: adminApi.toggleVoucher,
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(["adminVouchers"]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteVoucher,
    onSuccess: () => {
      toast.success("Đã xóa voucher!");
      queryClient.invalidateQueries(["adminVouchers"]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      code: form.code.toUpperCase(),
      title: form.title,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_value: Number(form.min_order_value) || 0,
      max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : undefined,
      expires_at: form.expires_at,
      usage_limit: Number(form.usage_limit),
    });
  };

  const vouchers = data?.data?.data || [];
  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Quản lý Voucher</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tạo và quản lý mã giảm giá toàn sàn.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-transform hover:scale-105 hover:bg-orange-600"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Tạo voucher mới
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
          <h3 className="mb-5 text-lg font-bold text-gray-800 dark:text-gray-100">Tạo Voucher Mới</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Mã code *</label>
              <input required placeholder="VD: SALE50" value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value}))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-mono uppercase outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Tên / Mô tả *</label>
              <input required placeholder="VD: Giảm 50% cho đơn từ 200k" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Loại giảm *</label>
              <select value={form.discount_type} onChange={e => setForm(f => ({...f, discount_type: e.target.value as any}))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white">
                <option value="percent">Theo % (phần trăm)</option>
                <option value="fixed">Theo số tiền cố định (₫)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Giá trị giảm * {form.discount_type === "percent" ? "(%)" : "(₫)"}
              </label>
              <input required type="number" min="1" placeholder={form.discount_type === "percent" ? "Nhập % (1-100)" : "Nhập số tiền"} value={form.discount_value} onChange={e => setForm(f => ({...f, discount_value: e.target.value}))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Đơn tối thiểu (₫)</label>
              <input type="number" min="0" placeholder="0 = không giới hạn" value={form.min_order_value} onChange={e => setForm(f => ({...f, min_order_value: e.target.value}))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" />
            </div>
            {form.discount_type === "percent" && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Giảm tối đa (₫)</label>
                <input type="number" min="0" placeholder="Để trống = không giới hạn" value={form.max_discount_amount} onChange={e => setForm(f => ({...f, max_discount_amount: e.target.value}))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Số lượt dùng *</label>
              <input required type="number" min="1" value={form.usage_limit} onChange={e => setForm(f => ({...f, usage_limit: e.target.value}))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Hết hạn lúc *</label>
              <input required type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({...f, expires_at: e.target.value}))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" />
            </div>
            <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3">
              <button type="submit" disabled={createMutation.isLoading}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50">
                {createMutation.isLoading ? "Đang tạo..." : "Tạo voucher"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Voucher List */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-left text-sm dark:text-gray-300">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4 font-semibold">Mã / Tên</th>
              <th className="px-6 py-4 font-semibold">Loại & Giá trị</th>
              <th className="px-6 py-4 font-semibold">Đơn tối thiểu</th>
              <th className="px-6 py-4 font-semibold">Đã dùng / Tổng</th>
              <th className="px-6 py-4 font-semibold">Hết hạn</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400">Đang tải...</td></tr>
            ) : vouchers.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-gray-400">Chưa có voucher nào. Hãy tạo voucher đầu tiên!</td></tr>
            ) : (
              vouchers.map((v: any) => {
                const isExpired = new Date(v.expires_at) < now;
                return (
                  <tr key={v._id} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-700 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-bold tracking-wider text-primary">{v.code}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{v.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      {v.discount_type === "percent" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          -{v.discount_value}%
                          {v.max_discount_amount && <span className="text-blue-400">(tối đa ₫{formatCurrency(v.max_discount_amount)})</span>}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          -₫{formatCurrency(v.discount_value)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {v.min_order_value > 0 ? `₫${formatCurrency(v.min_order_value)}` : "Không giới hạn"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{v.used_count} / {v.usage_limit}</div>
                      <div className="mt-1.5 h-1.5 w-24 rounded-full bg-gray-200">
                        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, (v.used_count / v.usage_limit) * 100)}%` }} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className={isExpired ? "text-red-500 font-medium" : ""}>
                        {new Date(v.expires_at).toLocaleDateString("vi-VN")}
                      </div>
                      {isExpired && <div className="text-red-400">Đã hết hạn</div>}
                    </td>
                    <td className="px-6 py-4">
                      {!v.isActive || isExpired ? (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">Vô hiệu</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Đang hoạt động</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toggleMutation.mutate(v._id)} disabled={toggleMutation.isLoading}
                        className={`mr-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${v.isActive ? "border border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
                        {v.isActive ? "Tắt" : "Bật"}
                      </button>
                      <button onClick={() => { if (confirm("Xóa voucher này?")) deleteMutation.mutate(v._id); }}
                        className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50">
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
