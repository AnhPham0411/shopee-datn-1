import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "react-toastify";
import voucherApi from "src/apis/voucher.api";
import Button from "src/components/Button";
import { formatCurrency } from "src/utils/formatNumber";

export default function Vouchers() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percent",
    discount_value: 0,
    min_order_value: 0,
    max_discount_amount: 0,
    expires_at: "",
    usage_limit: 100,
  });

  const { data } = useQuery({
    queryKey: ["vouchers"],
    queryFn: voucherApi.getVouchers,
  });

  const vouchers = data?.data.data || [];

  const createMutation = useMutation({
    mutationFn: (body: any) => voucherApi.createVoucher(body),
    onSuccess: () => {
      toast.success("Tạo mã giảm giá thành công");
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      setFormData({
        code: "",
        discount_type: "percent",
        discount_value: 0,
        min_order_value: 0,
        max_discount_amount: 0,
        expires_at: "",
        usage_limit: 100,
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi tạo mã giảm giá");
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.expires_at || formData.discount_value <= 0) {
      toast.error("Vui lòng điền đầy đủ thông tin hợp lệ");
      return;
    }
    createMutation.mutate({
      ...formData,
      expires_at: new Date(formData.expires_at).toISOString(),
    });
  };

  return (
    <div className="min-h-[600px] rounded-sm bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium">Quản lý Mã giảm giá (Vouchers)</h1>
        <Button
          onClick={() => setShowModal(true)}
          className="h-10 rounded-sm bg-primary px-4 text-white"
        >
          Tạo Mã Mới
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 uppercase text-gray-700">
            <tr>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Loại giảm</th>
              <th className="px-4 py-3">Mức giảm</th>
              <th className="px-4 py-3">Đơn tối thiểu</th>
              <th className="px-4 py-3">Lượt dùng</th>
              <th className="px-4 py-3">Ngày hết hạn</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v: any) => {
              const isExpired = new Date(v.expires_at) < new Date();
              const isUsedUp = v.used_count >= v.usage_limit;

              return (
                <tr
                  key={v._id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium uppercase text-primary">{v.code}</td>
                  <td className="px-4 py-3">{v.discount_type === "percent" ? "%" : "VNĐ"}</td>
                  <td className="px-4 py-3">
                    {v.discount_type === "percent" ? `${v.discount_value}%` : `₫${formatCurrency(v.discount_value)}`}
                  </td>
                  <td className="px-4 py-3">₫{formatCurrency(v.min_order_value)}</td>
                  <td className="px-4 py-3">
                    {v.used_count} / {v.usage_limit}
                  </td>
                  <td className="px-4 py-3">{new Date(v.expires_at).toLocaleDateString("vi-VN")}</td>
                  <td className="px-4 py-3">
                    {isExpired ? (
                      <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-500">Hết hạn</span>
                    ) : isUsedUp ? (
                      <span className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-500">Hết lượt</span>
                    ) : (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-500">
                        Đang chạy
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[500px] rounded-sm bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-medium">Tạo Mã Giảm Giá</h2>
            <form
              onSubmit={handleCreate}
              className="space-y-4 text-sm"
            >
              <div>
                <label
                  htmlFor="voucher-code"
                  className="mb-1 block text-gray-600"
                >
                  Mã giảm giá (Code)
                </label>
                <input
                  id="voucher-code"
                  type="text"
                  className="w-full border p-2 uppercase"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="voucher-discount-type"
                    className="mb-1 block text-gray-600"
                  >
                    Loại giảm
                  </label>
                  <select
                    id="voucher-discount-type"
                    className="w-full border p-2"
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền (VNĐ)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="voucher-discount-value"
                    className="mb-1 block text-gray-600"
                  >
                    Mức giảm
                  </label>
                  <input
                    id="voucher-discount-value"
                    type="number"
                    className="w-full border p-2"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="voucher-min-order"
                  className="mb-1 block text-gray-600"
                >
                  Đơn hàng tối thiểu (VNĐ)
                </label>
                <input
                  id="voucher-min-order"
                  type="number"
                  className="w-full border p-2"
                  value={formData.min_order_value}
                  onChange={(e) => setFormData({ ...formData, min_order_value: Number(e.target.value) })}
                />
              </div>
              <div>
                <label
                  htmlFor="voucher-usage-limit"
                  className="mb-1 block text-gray-600"
                >
                  Giới hạn lượt dùng
                </label>
                <input
                  id="voucher-usage-limit"
                  type="number"
                  className="w-full border p-2"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                />
              </div>
              <div>
                <label
                  htmlFor="voucher-expires"
                  className="mb-1 block text-gray-600"
                >
                  Ngày hết hạn
                </label>
                <input
                  id="voucher-expires"
                  type="datetime-local"
                  className="w-full border p-2"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-sm border px-4 py-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="rounded-sm bg-primary px-4 py-2 text-white"
                >
                  Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
