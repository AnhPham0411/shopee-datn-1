import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useContext, useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "src/components/Button";
import { path } from "src/constants/path.enum";
import { AuthContext } from "src/contexts/auth.context";
import { formatCurrency } from "src/utils/formatNumber";
import http from "src/utils/http";
import voucherApi from "src/apis/voucher.api";
import addressApi from "src/apis/address.api";

export default function Checkout() {
  const { t } = useTranslation();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useContext(AuthContext);

  const purchases = state?.purchases || [];

  const [manualAddress, setManualAddress] = useState(userProfile?.address || "");
  const [shippingMethod, setShippingMethod] = useState("nhanh");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [voucherCode, setVoucherCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedVoucherId, setAppliedVoucherId] = useState<string | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const { data: addressesData } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.getAddresses(),
  });
  const addresses: any[] = addressesData?.data?.data || [];

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(def._id);
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
  const composedAddress = selectedAddress
    ? `${selectedAddress.detail}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`
    : manualAddress;

  const { data: vouchersData } = useQuery({
    queryKey: ["vouchers", "public"],
    queryFn: voucherApi.getPublicVouchers,
  });
  const vouchers = vouchersData?.data?.data || [];

  const itemsTotal = useMemo(
    () => purchases.reduce((total: number, p: any) => total + p.product.price * p.buy_count, 0),
    [purchases],
  );

  const shippingFee = shippingMethod === "nhanh" ? 30000 : shippingMethod === "hoatoc" ? 50000 : 15000;
  const totalAmount = Math.max(0, itemsTotal + shippingFee - discountAmount);

  const applyVoucherMutation = useMutation({
    mutationFn: (body: { code: string; order_value: number }) => voucherApi.applyVoucher(body),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setDiscountAmount(res.data.data.discount_amount);
      setAppliedVoucherId(res.data.data.voucher_id);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Mã giảm giá không hợp lệ");
      setDiscountAmount(0);
      setAppliedVoucherId(null);
    },
  });

  const handleApplyVoucher = (code?: string) => {
    const codeToApply = code || voucherCode;
    if (!codeToApply.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }
    setVoucherCode(codeToApply);
    applyVoucherMutation.mutate({ code: codeToApply, order_value: itemsTotal });
    setIsVoucherModalOpen(false);
  };

  const checkoutMutation = useMutation({
    mutationFn: (body: any) => http.post("/orders/checkout", body),
    onSuccess: (res) => {
      toast.success("Đặt hàng thành công");
      const order = res.data?.data;
      // Nếu chọn thanh toán online → sang cổng thanh toán (mock)
      if (order?._id && paymentMethod !== "cod") {
        navigate(`/payment/${order._id}`);
      } else {
        navigate(path.orderHistory);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi đặt hàng");
    },
  });

  const handleCheckout = () => {
    if (!composedAddress.trim()) {
      toast.error("Vui lòng chọn hoặc nhập địa chỉ giao hàng");
      return;
    }

    if (purchases.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    const items = purchases.map((p: any) => ({
      product_id: p.product._id,
      buy_count: p.buy_count,
    }));

    checkoutMutation.mutate({
      items,
      shippingAddress: composedAddress,
      shippingMethod,
      shippingFee,
      paymentMethod,
      voucherCode: appliedVoucherId ? voucherCode : undefined,
      recipientName: selectedAddress?.fullName,
      recipientPhone: selectedAddress?.phone,
    });
  };

  if (purchases.length === 0) {
    return (
      <div className="container py-10 text-center">
        <h2>Giỏ hàng của bạn đang trống</h2>
        <Button
          onClick={() => navigate(path.home)}
          className="mt-4 bg-primary px-4 py-2 text-white"
        >
          Tiếp tục mua sắm
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-neutral-100 dark:bg-gray-900 py-10">
      <div className="container">
        <h1 className="mb-6 text-2xl font-medium uppercase text-black dark:text-white">Thanh Toán</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <div className="rounded-sm border-t-4 border-primary bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="mb-4 flex items-center text-lg font-medium text-primary">
                <svg
                  viewBox="0 0 24 24"
                  className="mr-2 h-5 w-5 fill-current"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {t("Địa chỉ nhận hàng")}
              </h2>

              {addresses.length > 0 ? (
                <div className="flex items-start justify-between gap-4">
                  {selectedAddress ? (
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedAddress.fullName} <span className="text-gray-400">|</span> {selectedAddress.phone}
                        {selectedAddress.isDefault && (
                          <span className="ml-2 rounded border border-primary px-1.5 py-0.5 text-xs text-primary">{t("Mặc định")}</span>
                        )}
                      </div>
                      <div className="mt-1">{composedAddress}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">{t("Vui lòng chọn địa chỉ")}</div>
                  )}
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="flex-shrink-0 text-sm text-primary hover:underline"
                  >
                    {t("Thay đổi")}
                  </button>
                </div>
              ) : (
                <div>
                  <textarea
                    className="w-full rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-3 outline-none focus:border-primary"
                    rows={3}
                    placeholder={t("Nhập địa chỉ giao hàng chi tiết...") as string}
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                  />
                  <Link to={path.addresses} className="mt-2 inline-block text-sm text-primary hover:underline">
                    + {t("Thêm vào sổ địa chỉ để dùng lại lần sau")}
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-sm bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-black dark:text-white">{t("Sản phẩm")}</h2>
              {purchases.map((purchase: any) => (
                <div
                  key={purchase._id}
                  className="flex gap-4 border-b border-gray-100 dark:border-gray-700 py-4 last:border-0"
                >
                  <img
                    src={purchase.product.image}
                    alt={purchase.product.name}
                    className="h-16 w-16 object-cover"
                  />
                  <div className="flex-1 text-black dark:text-white">
                    <div className="text-sm line-clamp-2">{purchase.product.name}</div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t("Số lượng:")} {purchase.buy_count}</div>
                  </div>
                  <div className="text-sm font-medium text-black dark:text-white">
                    ₫{formatCurrency(purchase.product.price * purchase.buy_count)}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-sm bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-black dark:text-white">{t("Phương thức vận chuyển")}</h2>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center">
                  <input
                    type="radio"
                    name="shipping"
                    value="nhanh"
                    checked={shippingMethod === "nhanh"}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="ml-3 text-black dark:text-gray-200">{t("Nhanh")} (₫30.000)</span>
                </label>
                <label className="flex cursor-pointer items-center">
                  <input
                    type="radio"
                    name="shipping"
                    value="hoatoc"
                    checked={shippingMethod === "hoatoc"}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="ml-3 text-black dark:text-gray-200">{t("Hỏa tốc")} (₫50.000)</span>
                </label>
                <label className="flex cursor-pointer items-center">
                  <input
                    type="radio"
                    name="shipping"
                    value="tietkiem"
                    checked={shippingMethod === "tietkiem"}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="ml-3 text-black dark:text-gray-200">{t("Tiết kiệm")} (₫15.000)</span>
                </label>
              </div>
            </div>

            <div className="rounded-sm bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-black dark:text-white">{t("Phương thức thanh toán")}</h2>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="ml-3 text-black dark:text-gray-200">{t("Thanh toán khi nhận hàng (COD)")}</span>
                </label>
                <label className="flex cursor-pointer items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === "bank"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="ml-3 text-black dark:text-gray-200">{t("Chuyển khoản ngân hàng")}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-6 rounded-sm bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-black dark:text-white">{t("Đơn hàng")}</h2>

              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t("Nhập mã giảm giá") as string}
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-1 rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 uppercase outline-none focus:border-primary"
                  />
                  <Button
                    onClick={() => handleApplyVoucher()}
                    disabled={applyVoucherMutation.isLoading}
                    className="rounded-sm bg-primary px-4 text-white"
                  >
                    {t("Áp dụng")}
                  </Button>
                </div>
                <button 
                  onClick={() => setIsVoucherModalOpen(true)}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  {t("Hoặc chọn mã giảm giá có sẵn")}
                </button>
                {appliedVoucherId && (
                  <div className="mt-2 text-sm font-medium text-green-600">{t("Đã áp dụng mã giảm giá!")}</div>
                )}
              </div>

              <div className="flex justify-between py-2 text-gray-600 dark:text-gray-300">
                <span>{t("Tổng tiền hàng")}</span>
                <span>₫{formatCurrency(itemsTotal)}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600 dark:text-gray-300">
                <span>{t("Phí vận chuyển")}</span>
                <span>₫{formatCurrency(shippingFee)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between py-2 text-primary">
                  <span>{t("Giảm giá (Voucher)")}</span>
                  <span>- ₫{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-gray-200 dark:border-gray-700 py-4 font-medium text-black dark:text-white">
                <span>{t("Tổng thanh toán")}</span>
                <span className="text-2xl text-primary">₫{formatCurrency(totalAmount)}</span>
              </div>
              <Button
                onClick={handleCheckout}
                isLoading={checkoutMutation.isLoading}
                disabled={checkoutMutation.isLoading}
                className="mt-4 w-full bg-primary py-3 uppercase text-white"
              >
                {t("Đặt hàng")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setIsAddressModalOpen(false)}>
          <div className="w-full max-w-md rounded bg-white dark:bg-gray-800 p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">{t("Chọn địa chỉ nhận hàng")}</h2>
              <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <div className="max-h-[60vh] space-y-3 overflow-y-auto">
              {addresses.map((a) => (
                <label
                  key={a._id}
                  className={`flex cursor-pointer items-start gap-3 rounded border p-3 ${
                    selectedAddressId === a._id ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    className="mt-1"
                    checked={selectedAddressId === a._id}
                    onChange={() => {
                      setSelectedAddressId(a._id);
                      setIsAddressModalOpen(false);
                    }}
                  />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {a.fullName} <span className="text-gray-400">|</span> {a.phone}
                      {a.isDefault && <span className="ml-2 text-xs text-primary">({t("Mặc định")})</span>}
                    </div>
                    <div className="mt-1">
                      {a.detail}, {a.ward}, {a.district}, {a.province}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <Link to={path.addresses} className="mt-3 inline-block text-sm text-primary hover:underline">
              + {t("Quản lý sổ địa chỉ")}
            </Link>
          </div>
        </div>
      )}

      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded bg-white dark:bg-gray-800 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">{t("Chọn Mã Giảm Giá")}</h2>
              <button onClick={() => setIsVoucherModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            
            <div className="max-h-[60vh] space-y-3 overflow-y-auto">
              {vouchers.length === 0 ? (
                <div className="py-6 text-center text-gray-500">{t("Không có mã giảm giá nào.")}</div>
              ) : (
                vouchers.map((voucher: any) => {
                  const isEligible = itemsTotal >= (voucher.min_order_value || 0);
                  return (
                    <div 
                      key={voucher._id} 
                      className={`flex items-center justify-between rounded border p-3 ${isEligible ? 'border-primary/30 bg-primary/5' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60'}`}
                    >
                      <div>
                        <div className="font-medium text-primary">{voucher.code}</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">{voucher.title}</div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("Đơn tối thiểu")} ₫{formatCurrency(voucher.min_order_value || 0)}</div>
                      </div>
                      <Button
                        onClick={() => handleApplyVoucher(voucher.code)}
                        disabled={!isEligible || applyVoucherMutation.isLoading}
                        className={`rounded px-3 py-1 text-sm text-white ${isEligible ? 'bg-primary' : 'bg-gray-400'}`}
                      >
                        {t("Chọn")}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
