import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import promotionApi from "src/apis/promotion.api";
import { path } from "src/constants/path.enum";
import { formatCurrency } from "src/utils/formatNumber";
import { generateSlug } from "src/utils/slugify";
import { useTranslation } from "react-i18next";

const FlashSale = () => {
  const { t } = useTranslation();
  const { data: promotionsData } = useQuery({
    queryKey: ["activePromotions"],
    queryFn: () => promotionApi.getActivePromotions(),
    staleTime: 3 * 60 * 1000,
  });

  const promotions = promotionsData?.data.data || [];
  const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string } | null>(null);

  useEffect(() => {
    if (promotions.length === 0) return;

    // Using the end_time of the first promotion as the target
    const targetDate = new Date(promotions[0].end_time).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft(null);
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({
          hours: String(hours).padStart(2, "0"),
          minutes: String(minutes).padStart(2, "0"),
          seconds: String(seconds).padStart(2, "0"),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [promotions]);

  if (!promotions || promotions.length === 0) return null;

  return (
    <div className="mb-6 rounded bg-white dark:bg-gray-800 shadow">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold uppercase italic text-primary">Flash Sale</div>
          {timeLeft && (
            <div className="flex items-center gap-1">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-black dark:bg-gray-600 text-sm font-bold text-white">
                {timeLeft.hours}
              </span>
              <span className="font-bold text-black dark:text-white">:</span>
              <span className="flex h-7 w-7 items-center justify-center rounded bg-black dark:bg-gray-600 text-sm font-bold text-white">
                {timeLeft.minutes}
              </span>
              <span className="font-bold text-black dark:text-white">:</span>
              <span className="flex h-7 w-7 items-center justify-center rounded bg-black dark:bg-gray-600 text-sm font-bold text-white">
                {timeLeft.seconds}
              </span>
            </div>
          )}
        </div>
        <div className="cursor-pointer text-sm text-primary hover:opacity-80">{t("Xem tất cả")} {`>`}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4 lg:grid-cols-5">
        {promotions.slice(0, 5).map((promo) => {
          const product = promo.product;
          const soldPercentage = Math.min(100, (product.sold / (product.quantity + product.sold)) * 100);

          return (
            <Link
              to={`${path.home}${generateSlug({ name: product.name, id: product._id })}`}
              className="col-span-1"
              key={promo._id}
            >
              <div className="relative rounded-sm border border-transparent bg-white dark:bg-gray-800 shadow transition-transform duration-100 hover:-translate-y-[1px] hover:border-primary hover:shadow-md">
                <div className="relative w-full pt-[100%]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute top-0 left-0 h-full w-full bg-white dark:bg-gray-800 object-cover"
                  />
                  <div className="absolute top-0 right-0 rounded-bl-sm rounded-tr-sm bg-[#ffd839] px-1 py-[2px]">
                    <div className="text-center text-xs font-semibold uppercase text-[#ee4d2d]">
                      {promo.discount_percent}% {t("giảm")}
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-center text-lg font-medium text-primary">
                    ₫{formatCurrency(product.price * (1 - promo.discount_percent / 100))}
                  </div>
                  <div className="relative mt-3 h-4 w-full overflow-hidden rounded-full bg-[#ffbda6]">
                    <div
                      className="absolute top-0 left-0 h-full bg-[url('https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/flashsale/ebc2ce8733ea7ba33d7b.png')] bg-cover"
                      style={{ width: `${soldPercentage}%` }}
                    ></div>
                    <div className="absolute inset-0 z-10 flex items-center justify-center text-[10px] font-semibold uppercase text-white drop-shadow-md">
                      {t("Đã bán")} {product.sold}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default FlashSale;
