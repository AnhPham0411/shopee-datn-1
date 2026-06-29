import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import { createSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { path } from "src/constants/path.enum";
import useQueryParams from "src/hooks/useQueryParams";
import { formatCurrency } from "src/utils/formatNumber";
import { generateSlug } from "src/utils/slugify";
import orderApi from "src/apis/order.api";
import { toast } from "react-toastify";
import { useState } from "react";
import ReviewModal from "./ReviewModal";

const orderTabs = [
  { status: 0, name: "Tất cả" },
  { status: 1, name: "Chờ xác nhận" },
  { status: 2, name: "Chuẩn bị hàng" },
  { status: 3, name: "Đang giao" },
  { status: 4, name: "Hoàn thành" },
  { status: 5, name: "Đã hủy" },
];

export default function HistoryPurchase() {
  const { t } = useTranslation();
  const queryParams: { status?: string } = useQueryParams();
  const status: number = Number(queryParams.status) || 0;
  const queryClient = useQueryClient();
  const [reviewingOrder, setReviewingOrder] = useState<any>(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", { status }],
    queryFn: () => orderApi.getOrders(status),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (body: { id: string; status: number }) => orderApi.updateOrderStatus(body.id, body.status),
    onSuccess: () => {
      toast.success(t("Cập nhật đơn hàng thành công!"));
      queryClient.invalidateQueries(["orders"]);
    },
  });

  const orders = ordersData?.data.data || [];

  const handleUpdate = (id: string, newStatus: number) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const getStatusText = (st: number) => {
    switch (st) {
      case 1: return <span className="text-yellow-600">{t("Chờ xác nhận").toUpperCase()}</span>;
      case 2: return <span className="text-blue-600">{t("Chuẩn bị hàng").toUpperCase()}</span>;
      case 3: return <span className="text-indigo-600">{t("Đang giao").toUpperCase()}</span>;
      case 4: return <span className="text-green-600">{t("Hoàn thành").toUpperCase()}</span>;
      case 5: return <span className="text-red-600">{t("Đã hủy").toUpperCase()}</span>;
      default: return "";
    }
  };

  const purchaseTabsLink = orderTabs.map((tab) => (
    <Link
      key={tab.status}
      to={{
        pathname: path.orderHistory,
        search: createSearchParams({
          status: String(tab.status),
        }).toString(),
      }}
      className={classNames("flex flex-1 items-center justify-center border-b-2 bg-white dark:bg-gray-800 py-4 text-center font-medium transition-colors dark:border-gray-700", {
        "border-b-primary text-primary": status === tab.status,
        "border-b-transparent text-gray-500 dark:text-gray-400 hover:text-primary": status !== tab.status,
      })}
    >
      {t(tab.name)}
    </Link>
  ));

  return (
    <div>
      <Helmet>
        <title>Shopee | Đơn mua</title>
      </Helmet>
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="sticky top-0 flex rounded-t-sm shadow-sm">{purchaseTabsLink}</div>
          <div className="mt-4 flex flex-col gap-4">
            {isLoading ? (
              <div className="py-10 text-center text-gray-500">{t("Đang tải dữ liệu...")}</div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 py-20 shadow-sm">
                <svg viewBox="0 0 24 24" className="mb-4 h-16 w-16 fill-gray-200 dark:fill-gray-600"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
                <div className="text-lg font-medium text-gray-400 dark:text-gray-500">{t("Chưa có đơn hàng")}</div>
              </div>
            ) : (
              orders.map((order: any) => (
                <div key={order._id} className="rounded-sm bg-white dark:bg-gray-800 p-6 shadow-sm">
                  {/* Order Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {t("Mã đơn:")} <span className="font-mono text-primary">#{order._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold uppercase">
                      {getStatusText(order.status)}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="py-4">
                    {order.items.map((item: any) => (
                      <Link
                        key={item._id}
                        to={`${path.home}${generateSlug({ name: item.productName, id: item.product?._id || "" })}`}
                        className="mb-4 flex last:mb-0"
                      >
                        <div className="flex-shrink-0">
                          <img
                            className="h-20 w-20 rounded border border-gray-100 dark:border-gray-700 object-cover"
                            src={item.productImage}
                            alt={item.productName}
                          />
                        </div>
                        <div className="ml-4 flex-grow overflow-hidden">
                          <div className="truncate font-medium text-gray-800 dark:text-gray-200">{item.productName}</div>
                          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">x{item.buy_count}</div>
                        </div>
                        <div className="ml-4 flex-shrink-0 text-right">
                          {item.price_before_discount > item.price && (
                            <span className="truncate text-sm text-gray-400 line-through">
                              ₫{formatCurrency(item.price_before_discount)}
                            </span>
                          )}
                          <span className="ml-2 truncate font-medium text-primary">₫{formatCurrency(item.price)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-col items-end border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t("Thành tiền:")}</span>
                      <span className="text-2xl font-medium text-primary">
                        ₫{formatCurrency(order.totalAmount)}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Link
                        to={`/user/order/${order._id}`}
                        className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {t("Xem chi tiết")}
                      </Link>
                      {order.status === 1 && (
                        <button
                           onClick={() => {
                            if (confirm(t("Bạn có chắc muốn hủy đơn hàng này?") as string)) {
                              handleUpdate(order._id, 5);
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
                              handleUpdate(order._id, 4);
                            }
                          }}
                          disabled={updateStatusMutation.isLoading}
                          className="rounded bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
                        >
                          {t("Đã nhận được hàng")}
                        </button>
                      )}

                      {order.status === 4 && (
                        <button 
                          onClick={() => setReviewingOrder(order)}
                          className="rounded border border-primary bg-primary/5 px-6 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                          {t("Đánh giá sản phẩm")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {reviewingOrder && (
        <ReviewModal 
          order={reviewingOrder} 
          onClose={() => setReviewingOrder(null)} 
        />
      )}
    </div>
  );
}
