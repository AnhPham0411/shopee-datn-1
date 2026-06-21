import http from "src/utils/http";
import { TSuccessApiResponse } from "src/types/utils.types";
import { TUser } from "src/types/user.types";

export type TReview = {
  _id: string;
  product: string;
  user: TUser;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type TReviewListConfig = {
  page?: number | string;
  limit?: number | string;
  rating?: number | string;
};

export type TReviewListResponse = {
  reviews: TReview[];
  pagination: {
    page: number;
    limit: number;
    page_size: number;
  };
  ratingDistribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
  totalReviews: number;
};

const reviewApi = {
  getReviews: (productId: string, params: TReviewListConfig) =>
    http.get<TSuccessApiResponse<TReviewListResponse>>(`/products/${productId}/reviews`, { params }),
  createReview: (productId: string, body: { rating: number; comment: string; images?: string[] }) =>
    http.post<TSuccessApiResponse<TReview>>(`/products/${productId}/reviews`, body),
};

export default reviewApi;
