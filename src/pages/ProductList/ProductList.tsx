import { useQuery } from "@tanstack/react-query";
import categoryApi from "src/apis/category.api";
import productApi from "src/apis/product.api";
import Pagination from "src/components/Pagination";
import { Helmet } from "react-helmet-async";
import useQueryConfig from "src/hooks/useQueryConfig";
import { TProductListConfig } from "src/types/product.type";
import AsideFilter from "./components/AsideFilter";
import Product from "./components/Product";
import Recommendations from "src/components/Recommendations";
import SortProductList from "./components/SortProductList";
import FlashSale from "./components/FlashSale";
import { useTranslation } from "react-i18next";
import Banner from "./components/Banner";
import CategoryIcons from "./components/CategoryIcons";
import MainCategories from "./components/MainCategories";

const ProductList = () => {
  const { t } = useTranslation();
  const queryConfig = useQueryConfig();
  const isHomePage = !queryConfig.name && !queryConfig.category && !queryConfig.price_min && !queryConfig.price_max && !queryConfig.rating_filter;
  const { data: productsData } = useQuery({
    queryKey: ["products", queryConfig],
    queryFn: () => productApi.getProducts(queryConfig as TProductListConfig),
    keepPreviousData: true,
    staleTime: 3 * 60 * 1000,
  });
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getCategories(),
  });
  return (
    <div className="bg-[#f5f5f5] dark:bg-gray-900 py-6">
      <Helmet>
        <title>Shopee At Home | Trang chủ</title>
        <meta
          name="description"
          content="A shopee clone edition used for studying purposes"
          data-react-helmet="true"
        />
      </Helmet>
      <div className="container">
        {isHomePage && <Banner />}
        {isHomePage && <CategoryIcons />}
        {isHomePage && <MainCategories categories={categoriesData?.data.data || []} />}
        <div className="gap-6 md:grid md:grid-cols-12">
          {!isHomePage && (
            <div className="block w-full md:col-span-3">
              <AsideFilter
                queryConfig={queryConfig}
                categories={categoriesData?.data.data || []}
              />
            </div>
          )}
          <div className={`block w-full ${isHomePage ? 'md:col-span-12' : 'md:col-span-9'}`}>
            <FlashSale />
            {productsData && (
              <SortProductList
                queryConfig={queryConfig}
                pageSize={productsData.data.data.pagination.page_size}
              />
            )}
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {productsData ? (
                productsData.data.data.products.length > 0 ? (
                  productsData.data.data.products.map((product) => (
                    <div
                      className="col-span-1"
                      key={product._id}
                    >
                      <Product product={product}></Product>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-sm bg-white dark:bg-gray-800 py-20 text-gray-500 dark:text-gray-400 shadow-sm">
                    <div className="mb-4 h-32 w-32 bg-[url('https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/a60759ad1dabe909c46a817ecbf71878.png')] bg-contain bg-center bg-no-repeat opacity-70" />
                    <div className="text-lg font-medium">{t("Không tìm thấy sản phẩm nào")}</div>
                    <div className="mt-2 text-sm">{t("Hãy thử sử dụng các từ khóa hoặc bộ lọc khác")}</div>
                  </div>
                )
              ) : (
                Array(10)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      className="col-span-1"
                      key={i}
                    >
                      <div className="h-[280px] animate-pulse rounded-sm bg-white dark:bg-gray-800 p-2 shadow-sm">
                        <div className="mb-4 h-40 w-full bg-gray-200 dark:bg-gray-700"></div>
                        <div className="mb-2 h-4 w-3/4 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="mb-4 h-4 w-1/2 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-6 w-full bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                    </div>
                  ))
              )}
            </div>
            {productsData && (
              <Pagination
                queryConfig={queryConfig}
                pageSize={productsData.data.data.pagination.page_size}
              ></Pagination>
            )}
            <Recommendations />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
