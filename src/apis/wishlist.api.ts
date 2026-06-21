import http from "src/utils/http";
import { TProduct } from "src/types/product.type";
import { TSuccessApiResponse } from "src/types/utils.types";

const wishlistApi = {
  getWishlist: () => http.get<TSuccessApiResponse<TProduct[]>>("/wishlist"),
  addToWishlist: (productId: string) => http.post<TSuccessApiResponse<TProduct[]>>("/wishlist", { productId }),
  removeFromWishlist: (productId: string) => http.delete<TSuccessApiResponse<TProduct[]>>(`/wishlist/${productId}`),
};

export default wishlistApi;
