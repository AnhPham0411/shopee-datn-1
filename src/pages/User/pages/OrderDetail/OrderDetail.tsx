import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import classNames from "classnames";
import orderApi from "src/apis/order.api";
import { path } from "src/constants/path.enum";
import { formatCurrency } from "src/utils/formatNumber";
import { generateSlug } from "src/utils/slugify";

const STATUS_STEPS = [
  { status: 1, name: "Chờ xác nhận" },
  { status: 2, name: "Chuẩn bị hàng" },
  { status: 3, name: "Đang giao" },
  { status: 4, name: "Hoàn thành" },
];

const PAYMENT_LABEL: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank_transfer: "Chuyển khoản ngân hàng",
  e_wallet: "Ví điện tử",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
};

export default function OrderDetail() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderApi.getOrderById(id),
    enabled: Boolean(id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: number) => orderApi.updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success(t("Cập nhật đơn hàng thành công!"));
      queryClient.invalidateQueries(["order", id]);
      queryClient.invalidateQueries(["orders"]);
    },
  });

  const order = data?.data.data;

  if (isLoading) {
    return <div className="py-20 text-center text-gray-500">{t("Đang tải dữ liệu...")}</div>;
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 py-20 shadow-sm">
        <div className="text-lg font-medium text-gray-400 dark:text-gray-500">{t("Không tìm thấy đơn hàng")}</div>
        <Link to={path.orderHistory} className="mt-4 text-primary hover:underline">
          {t("Quay lại đơn mua")}
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 5;
  const currentStep = STATUS_STEPS.findIndex((s) => s.status === order.status);

  return (
    <div>
      <Helmet>
        <title>Shopee | Chi tiết đơn hàng</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 shadow-sm">
        <Link to={path.orderHistory} className="text-sm text-gray-500 hover:text-primary dark:text-gray-400">
          ‹ {t("Quay lại")}
        </Link>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {t("Mã đơn:")} <span className="font-mono font-semibold text-primary">#{order._id.slice(-6).toUpperCase()}</span>
          <span className="ml-4 font-bold uppercase">
            {isCancelled ? (
              <span className="text-red-600">{t("Đã hủy")}</span>
            ) : (
              <span className="text-primary">{t(STATUS_STEPS[currentStep]?.name || "")}</span>
            )}
          </span>
        </div>
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <div className="bg-white dark:bg-gray-800 px-6 py-8 shadow-sm mt-3">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, idx) => (
              <div key={step.status} className="flex flex-1 flex-col items-center relative">
                {idx > 0 && (
                  <div
                    className={classNames("absolute right-1/2 top-4 h-0.5 w-full -z-0", {
                      "bg-primary": idx <= currentStep,
                      "bg-gray-200 dark:bg-gray-600": idx > currentStep,
                    })}
                  />
                )}
                <div
                  className={classNames("z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold", {
                    "bg-primary text-white": idx <= currentStep,
                    "bg-gray-200 text-gray-500 dark:bg-gray-600": idx > currentStep,
                  })}
                >
                  {idx + 1}
                </div>
                <div className="mt-2 text-center text-xs text-gray-600 dark:text-gray-300">{t(step.name)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipping address */}
      <div className="bg-white dark:bg-gray-800 px-6 py-5 shadow-sm mt-3">
        <h3 className="mb-2 font-medium text-gray-800 dark:text-gray-200">{t("Địa chỉ nhận hàng")}</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="font-medium text-gray-800 dark:text-gray-200">
            {order.recipientName} {order.recipientPhone && `| ${order.recipientPhone}`}
          </div>
          <div className="mt-1">{order.shippingAddress}</div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 shadow-sm mt-3">
        {order.items.map((item: any) => (
          <Link
            key={item._id}
            to={`${path.home}${generateSlug({ name: item.productName, id: item.product?._id || "" })}`}
            className="mb-4 flex border-b border-gray-50 dark:border-gray-700 pb-4 last:mb-0 last:border-0 last:pb-0"
          >
            <img
              className="h-20 w-20 flex-shrink-0 rounded border border-gray-100 dark:border-gray-700 object-cover"
              src={item.productImage}
              alt={item.productName}
            />
            <div className="ml-4 flex-grow overflow-hidden">
              <div className="truncate font-medium text-gray-800 dark:text-gray-200">{item.productName}</div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">x{item.buy_count}</div>
            </div>
            <div className="ml-4 flex-shrink-0 text-right">
              {item.price_before_discount > item.price && (
                <span className="text-sm text-gray-400 line-through">₫{formatCurrency(item.price_before_discount)}</span>
              )}
              <span className="ml-2 font-medium text-primary">₫{formatCurrency(item.price)}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Payment & summary */}
      <div className="bg-white dark:bg-gray-800 px-6 py-5 shadow-sm mt-3">
        <div className="mb-3 flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">{t("Phương thức thanh toán")}</span>
          <span className="text-gray-800 dark:text-gray-200">
            {t(PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod)}
            <span
              className={classNames("ml-2 text-xs font-semibold", {
                "text-green-600": order.paymentStatus === "paid",
                "text-yellow-600": order.paymentStatus === "pending",
                "text-red-600": order.paymentStatus === "failed",
              })}
            >
              ({t(PAYMENT_STATUS_LABEL[order.paymentStatus] || order.paymentStatus)})
            </span>
          </span>
        </div>
        <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t("Tổng tiền hàng")}</span>
            <span className="text-gray-800 dark:text-gray-200">₫{formatCurrency(order.subTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t("Phí vận chuyển")}</span>
            <span className="text-gray-800 dark:text-gray-200">₫{formatCurrency(order.shippingFee)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                {t("Giảm giá")} {order.voucherCode && `(${order.voucherCode})`}
              </span>
              <span className="text-green-600">- ₫{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-2">
            <span className="font-medium text-gray-800 dark:text-gray-200">{t("Thành tiền")}</span>
            <span className="text-2xl font-medium text-primary">₫{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-3">
          {order.status === 1 && (
            <button
              onClick={() => {
                if (confirm(t("Bạn có chắc muốn hủy đơn hàng này?") as string)) {
                  updateStatusMutation.mutate(5);
                }
              }}
              disabled={updateStatusMutation.isLoading}
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t("Hủy đơn")}
            </button>
          )}
          {order.status === 3 && (
            <button
              onClick={() => {
                if (confirm(t("Xác nhận bạn đã nhận được hàng?") as string)) {
                  updateStatusMutation.mutate(4);
                }
              }}
              disabled={updateStatusMutation.isLoading}
              className="rounded bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
            >
              {t("Đã nhận được hàng")}
            </button>
          )}
          {order.paymentStatus === "pending" && order.paymentMethod !== "cod" && order.status !== 5 && (
            <button
              onClick={() => navigate(`/payment/${order._id}`)}
              className="rounded bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
            >
              {t("Thanh toán ngay")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
