import { TProductListConfig, TProductList, TProduct } from "src/types/product.type";
import { TSuccessApiResponse } from "src/types/utils.types";
import http from "src/utils/http";

const productApi = {
  getProducts: (params: TProductListConfig) =>
    http.get<TSuccessApiResponse<TProductList>>("/products", {
      params,
    }),
  getProductById: (productId: string) => http.get<TSuccessApiResponse<TProduct>>(`/products/${productId}`),
  getRecommendations: (category?: string, recentlyViewed?: string[]) =>
    http.get<TSuccessApiResponse<TProduct[]>>("/products/recommendations", {
      params: { category, recently_viewed: recentlyViewed?.join(",") },
    }),
  suggestProducts: (q: string) => http.get<TSuccessApiResponse<TProduct[]>>("/products/suggest", { params: { q } }),
};

export default productApi;
