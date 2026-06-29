import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import orderApi from "src/apis/order.api";
import paymentApi from "src/apis/payment.api";
import { formatCurrency } from "src/utils/formatNumber";

/**
 * Trang MÔ PHỎNG cổng thanh toán (VNPay/Momo...).
 * Đây là bản demo cho đồ án — production sẽ redirect sang cổng thật.
 */
export default function Payment() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [done, setDone] = useState<null | boolean>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderApi.getOrderById(id),
    enabled: Boolean(id),
  });
  const order = data?.data.data;

  const confirmMutation = useMutation({
    mutationFn: (success: boolean) => paymentApi.confirm(id, success),
    onSuccess: (_res, success) => {
      setDone(success);
      toast[success ? "success" : "error"](success ? t("Thanh toán thành công!") : t("Thanh toán thất bại"));
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || t("Có lỗi xảy ra")),
  });

  if (isLoading) return <div className="py-20 text-center text-gray-500">{t("Đang tải dữ liệu...")}</div>;
  if (isError || !order) return <div className="py-20 text-center text-gray-400">{t("Không tìm thấy đơn hàng")}</div>;

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-neutral-100 dark:bg-gray-900 py-10">
      <Helmet>
        <title>Shopee | Thanh toán</title>
      </Helmet>
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-8 shadow-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">💳</div>
          <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">{t("Cổng thanh toán (Demo)")}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("Mã đơn")}: <span className="font-mono text-primary">#{order._id.slice(-6).toUpperCase()}</span>
          </p>
        </div>

        <div className="mb-6 rounded border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{t("Số tiền cần thanh toán")}</span>
          </div>
          <div className="mt-1 text-center text-3xl font-bold text-primary">₫{formatCurrency(order.totalAmount)}</div>
        </div>

        {done === null && order.paymentStatus === "pending" ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => confirmMutation.mutate(true)}
              disabled={confirmMutation.isLoading}
              className="w-full rounded bg-primary py-3 font-medium text-white hover:bg-orange-600"
            >
              {t("Xác nhận thanh toán")}
            </button>
            <button
              onClick={() => confirmMutation.mutate(false)}
              disabled={confirmMutation.isLoading}
              className="w-full rounded border border-gray-300 dark:border-gray-600 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t("Hủy / Thanh toán thất bại")}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className={`mb-4 text-lg font-medium ${order.paymentStatus === "paid" || done ? "text-green-600" : "text-red-600"}`}>
              {order.paymentStatus === "paid" || done ? `✓ ${t("Đã thanh toán")}` : `✕ ${t("Thanh toán thất bại")}`}
            </div>
            <button
              onClick={() => navigate(`/user/order/${order._id}`)}
              className="w-full rounded bg-primary py-3 font-medium text-white hover:bg-orange-600"
            >
              {t("Xem đơn hàng")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
