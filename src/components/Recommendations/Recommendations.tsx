import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import productApi from "src/apis/product.api";
import { path } from "src/constants/path.enum";
import { formatCurrency, formatNumberToSocialStyle } from "src/utils/formatNumber";
import { generateSlug } from "src/utils/slugify";
import ProductRating from "../ProductRating";
import { useTranslation } from "react-i18next";

interface Props {
  categoryId?: string;
  title?: string;
}

const Recommendations = ({ categoryId, title }: Props) => {
  const { t } = useTranslation();
  const displayTitle = title || t("Có thể bạn cũng thích");
  const recentlyViewedStr = localStorage.getItem("recentlyViewed") || "[]";
  const recentlyViewed = JSON.parse(recentlyViewedStr) as string[];

  const { data: recommendationsData } = useQuery({
    queryKey: ["recommendations", categoryId, recentlyViewed],
    queryFn: () => productApi.getRecommendations(categoryId, recentlyViewed),
    staleTime: 3 * 60 * 1000,
  });

  const products = recommendationsData?.data.data;

  if (!products || products.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="border-b-4 border-primary pb-2 text-lg font-medium uppercase text-gray-600">{displayTitle}</div>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        {products.map((product) => (
          <Link
            to={`${path.home}${generateSlug({ name: product.name, id: product._id })}`}
            key={product._id}
            className="col-span-1 block rounded-sm bg-white shadow transition-transform duration-100 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative w-full pt-[100%]">
              <img
                src={product.image}
                alt={product.name}
                className="absolute top-0 left-0 h-full w-full bg-white object-cover"
                loading="lazy"
              />
            </div>
            <div className="overflow-hidden p-2">
              <div className="min-h-[2rem] text-xs line-clamp-2">{product.name}</div>
              <div className="mt-3 flex items-center">
                <div className="max-w-[50%] truncate text-primary">
                  <span className="text-xs">₫</span>
                  <span className="text-sm">{formatCurrency(product.price)}</span>
                </div>
                <div className="ml-1 truncate text-gray-500 line-through">
                  <span className="text-xs">₫{formatCurrency(product.price_before_discount)}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <ProductRating rating={product.rating} />
                <div className="text-xs text-gray-500">{formatNumberToSocialStyle(product.sold)} {t("Đã bán")}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
