import { TProduct } from "src/types/product.type";
import { TSuccessApiResponse } from "src/types/utils.types";
import http from "src/utils/http";

export type TPromotion = {
  _id: string;
  product: TProduct;
  discount_percent: number;
  start_time: string;
  end_time: string;
};

const promotionApi = {
  getActivePromotions: () => http.get<TSuccessApiResponse<TPromotion[]>>("/promotions/active"),
};

export default promotionApi;
