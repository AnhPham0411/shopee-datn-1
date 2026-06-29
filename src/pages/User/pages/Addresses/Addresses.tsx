import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import addressApi, { AddressBody } from "src/apis/address.api";
import AddressSelector from "src/components/AddressSelector/AddressSelector";

interface Address extends AddressBody {
  _id: string;
}

const emptyForm: AddressBody = {
  fullName: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  detail: "",
  isDefault: false,
};

const inputClass =
  "w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-primary";

export default function Addresses() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressBody>(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.getAddresses(),
  });
  const addresses: Address[] = data?.data.data || [];

  const invalidate = () => queryClient.invalidateQueries(["addresses"]);

  const addMutation = useMutation({
    mutationFn: (body: AddressBody) => addressApi.addAddress(body),
    onSuccess: () => {
      toast.success(t("Thêm địa chỉ thành công"));
      invalidate();
      closeForm();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || t("Có lỗi xảy ra")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: AddressBody }) => addressApi.updateAddress(id, body),
    onSuccess: () => {
      toast.success(t("Cập nhật địa chỉ thành công"));
      invalidate();
      closeForm();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || t("Có lỗi xảy ra")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressApi.deleteAddress(id),
    onSuccess: () => {
      toast.success(t("Đã xóa địa chỉ"));
      invalidate();
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => addressApi.setDefaultAddress(id),
    onSuccess: () => invalidate(),
  });

  const closeForm = () => {
    setOpenForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpenForm(true);
  };

  const openEdit = (a: Address) => {
    setForm({ ...a });
    setEditingId(a._id);
    setOpenForm(true);
  };

  const handleSubmit = () => {
    if (!form.fullName || !form.phone || !form.detail) {
      toast.error(t("Vui lòng nhập đủ họ tên, số điện thoại và địa chỉ cụ thể"));
      return;
    }
    if (!form.province || !form.district || !form.ward) {
      toast.error(t("Vui lòng chọn Tỉnh / Quận / Phường"));
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, body: form });
    } else {
      addMutation.mutate(form);
    }
  };

  return (
    <div className="rounded-sm bg-white dark:bg-gray-800 px-7 py-6 shadow">
      <Helmet>
        <title>Shopee | Sổ địa chỉ</title>
      </Helmet>

      <div className="flex items-center justify-between border-b border-b-gray-200 dark:border-b-gray-700 pb-4">
        <h1 className="text-lg font-medium capitalize text-gray-900 dark:text-gray-100">{t("Sổ địa chỉ")}</h1>
        <button
          onClick={openAdd}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          + {t("Thêm địa chỉ mới")}
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {isLoading ? (
          <div className="py-10 text-center text-gray-500">{t("Đang tải dữ liệu...")}</div>
        ) : addresses.length === 0 ? (
          <div className="py-10 text-center text-gray-400">{t("Bạn chưa có địa chỉ nào")}</div>
        ) : (
          addresses.map((a) => (
            <div key={a._id} className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700 py-4 last:border-0">
              <div className="text-sm">
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {a.fullName} <span className="text-gray-400">|</span> {a.phone}
                  {a.isDefault && (
                    <span className="ml-2 rounded border border-primary px-1.5 py-0.5 text-xs text-primary">{t("Mặc định")}</span>
                  )}
                </div>
                <div className="mt-1 text-gray-500 dark:text-gray-400">{a.detail}</div>
                <div className="text-gray-500 dark:text-gray-400">
                  {a.ward}, {a.district}, {a.province}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-3 text-sm">
                  <button onClick={() => openEdit(a)} className="text-blue-600 hover:underline">
                    {t("Sửa")}
                  </button>
                  {!a.isDefault && (
                    <button
                      onClick={() => {
                        if (confirm(t("Xóa địa chỉ này?") as string)) deleteMutation.mutate(a._id);
                      }}
                      className="text-red-600 hover:underline"
                    >
                      {t("Xóa")}
                    </button>
                  )}
                </div>
                {!a.isDefault && (
                  <button
                    onClick={() => setDefaultMutation.mutate(a._id)}
                    className="rounded border border-gray-300 dark:border-gray-600 px-3 py-1 text-xs text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary"
                  >
                    {t("Đặt làm mặc định")}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form modal */}
      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeForm}>
          <div
            className="w-full max-w-lg rounded bg-white dark:bg-gray-800 p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              {editingId ? t("Cập nhật địa chỉ") : t("Thêm địa chỉ mới")}
            </h2>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  className={inputClass}
                  placeholder={t("Họ và tên") as string}
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                />
                <input
                  className={inputClass}
                  placeholder={t("Số điện thoại") as string}
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>

              {editingId && (
                <div className="rounded bg-gray-50 dark:bg-gray-700/50 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                  {t("Khu vực hiện tại")}: {form.ward}, {form.district}, {form.province}. {t("Chọn lại bên dưới nếu muốn đổi.")}
                </div>
              )}

              <AddressSelector onChange={(loc) => setForm((f) => ({ ...f, ...loc }))} />

              <textarea
                className={inputClass}
                rows={2}
                placeholder={t("Số nhà, tên đường cụ thể") as string}
                value={form.detail}
                onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
              />

              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={form.isDefault || false}
                  onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                />
                {t("Đặt làm địa chỉ mặc định")}
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={closeForm} className="rounded border border-gray-300 dark:border-gray-600 px-5 py-2 text-sm text-gray-600 dark:text-gray-300">
                {t("Hủy")}
              </button>
              <button
                onClick={handleSubmit}
                disabled={addMutation.isLoading || updateMutation.isLoading}
                className="rounded bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                {t("Lưu")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
