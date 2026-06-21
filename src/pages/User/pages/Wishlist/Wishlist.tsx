import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import wishlistApi from "src/apis/wishlist.api";
import Product from "src/pages/ProductList/components/Product";

export default function Wishlist() {
  const { t } = useTranslation();
  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.getWishlist,
  });

  const wishlistProducts = wishlistData?.data.data || [];

  return (
    <div className="rounded-sm bg-white dark:bg-gray-800 px-2 pb-10 shadow md:px-7 md:pb-20">
      <div className="border-b border-b-gray-200 dark:border-b-gray-700 py-6">
        <h1 className="text-lg font-medium capitalize text-gray-900 dark:text-gray-100">{t("Sản phẩm yêu thích")}</h1>
        <div className="mt-1 text-sm text-gray-700 dark:text-gray-400">{t("Quản lý những sản phẩm bạn đã yêu thích")}</div>
      </div>
      <div className="mt-8">
        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {wishlistProducts.map((product) => (
              <div
                className="col-span-1"
                key={product._id}
              >
                <Product product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 text-gray-500 dark:text-gray-400">{t("Bạn chưa có sản phẩm yêu thích nào")}</div>
          </div>
        )}
      </div>
    </div>
  );
}
