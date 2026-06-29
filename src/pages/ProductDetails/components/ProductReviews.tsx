import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useContext } from "react";
import { AuthContext } from "src/contexts/auth.context";
import { toast } from "react-toastify";
import reviewApi from "src/apis/review.api";
import Button from "src/components/Button";
import { useTranslation } from "react-i18next";
import ProductRating from "src/components/ProductRating";
import getAvatarUrl from "src/utils/getAvatarUrl";

type ProductReviewsProps = {
  productId: string;
  productRating: number;
};

export default function ProductReviews({ productId, productRating }: ProductReviewsProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState("");

  const queryClient = useQueryClient();

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", productId, { rating: ratingFilter, page }],
    queryFn: () => reviewApi.getReviews(productId, { rating: ratingFilter, page, limit: 5 }),
    keepPreviousData: true,
  });

  const reviewsInfo = reviewsData?.data.data;
  const reviews = reviewsInfo?.reviews || [];
  const ratingDistribution = reviewsInfo?.ratingDistribution;

  const createReviewMutation = useMutation({
    mutationFn: (body: { rating: number; comment: string }) => reviewApi.createReview(productId, body),
    onSuccess: () => {
      toast.success(t("Đánh giá sản phẩm thành công"));
      setShowReviewForm(false);
      setNewComment("");
      setNewRating(5);
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
    onError: (error: any) => {
      if (error.response?.status === 403) {
        toast.error(t("Bạn chưa mua sản phẩm này nên không thể đánh giá"));
      } else {
        toast.error(t("Có lỗi xảy ra khi gửi đánh giá"));
      }
    },
  });

  const handlePostReview = () => {
    if (!isAuthenticated) {
      toast.error(t("Bạn phải đăng nhập tài khoản"));
      return;
    }
    if (!newComment.trim()) {
      toast.error(t("Vui lòng nhập nội dung đánh giá"));
      return;
    }
    createReviewMutation.mutate({ rating: newRating, comment: newComment });
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 p-4 shadow">
      <div className="container">
        <div className="rounded bg-gray-50 dark:bg-gray-700 p-4 text-lg capitalize text-slate-700 dark:text-gray-300">{t("Đánh giá sản phẩm")}</div>

        <div className="mt-4 flex flex-col gap-8 rounded-sm border border-primary/20 bg-primary/5 p-6 md:flex-row">
          <div className="flex min-w-[150px] flex-col items-center justify-center">
            <div className="text-4xl font-bold text-primary">
              <span className="text-5xl">{productRating}</span>
              <span className="text-2xl"> {t("trên 5")}</span>
            </div>
            <div className="mt-2">
              <ProductRating
                rating={productRating}
                activeClassName="fill-primary text-primary h-6 w-6"
                nonActiveClassName="fill-gray-300 text-gray-300 h-6 w-6"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-2">
            <button
              onClick={() => {
                setRatingFilter(0);
                setPage(1);
              }}
              className={`rounded-sm border px-5 py-2 ${
                ratingFilter === 0 ? "border-primary bg-white dark:bg-gray-800 text-primary" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-gray-300"
              }`}
            >
              {t("Tất cả")} ({reviewsInfo?.totalReviews || 0})
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => {
                  setRatingFilter(star);
                  setPage(1);
                }}
                className={`rounded-sm border px-5 py-2 ${
                  ratingFilter === star ? "border-primary bg-white dark:bg-gray-800 text-primary" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-gray-300"
                }`}
              >
                {star} {t("Sao")} ({ratingDistribution?.[star as unknown as keyof typeof ratingDistribution] || 0})
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center">
            <Button
              className="rounded-sm bg-primary px-6 py-2 text-white hover:bg-primary/90"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {t("Viết đánh giá")}
            </Button>
          </div>
        </div>

        {showReviewForm && (
          <div className="mt-4 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="mb-3 font-medium text-black dark:text-white">{t("Gửi đánh giá của bạn")}</h3>
            <div className="mb-4 flex items-center gap-2 text-black dark:text-gray-300">
              <span>{t("Chất lượng sản phẩm:")}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    onClick={() => setNewRating(star)}
                    className={`h-8 w-8 cursor-pointer ${
                      star <= newRating ? "fill-primary text-primary" : "fill-gray-300 text-gray-300"
                    }`}
                    viewBox="0 0 15 15"
                  >
                    <polygon
                      points="7.5 .8 9.7 5.4 14.5 5.9 10.7 9.1 11.8 14.2 7.5 11.6 3.2 14.2 4.3 9.1 .5 5.9 5.3 5.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeMiterlimit="10"
                    />
                  </svg>
                ))}
              </div>
            </div>
            <textarea
              className="w-full rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-3 outline-none focus:border-primary"
              rows={4}
              placeholder={t("Chia sẻ nhận xét của bạn về sản phẩm này...") as string}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <Button
                className="rounded-sm bg-primary px-6 py-2 text-white"
                onClick={handlePostReview}
                isLoading={createReviewMutation.isLoading}
                disabled={createReviewMutation.isLoading}
              >
                {t("Gửi")}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6">
          {reviews.length === 0 ? (
            <div className="py-10 text-center text-gray-500">{t("Chưa có đánh giá nào")}</div>
          ) : (
            <div className="flex flex-col gap-6">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="flex gap-4 border-b border-gray-100 dark:border-gray-700 pb-6"
                >
                  <img
                    src={getAvatarUrl(review.user.avatar, review.user.email)}
                    alt={review.user.name || "avatar"}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1 text-black dark:text-white">
                    <div className="text-sm font-medium">{review.user.name || review.user.email}</div>
                    <div className="mt-1">
                      <ProductRating
                        rating={review.rating}
                        activeClassName="fill-primary text-primary h-3 w-3"
                        nonActiveClassName="fill-gray-300 text-gray-300 h-3 w-3"
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleString("vi-VN")}
                    </div>
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-6">{review.comment}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {reviewsInfo && reviewsInfo.pagination.page_size > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: reviewsInfo.pagination.page_size }).map((_, i) => {
              const pageNumber = i + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`rounded-sm border px-3 py-1 ${
                    page === pageNumber
                      ? "border-primary bg-primary text-white"
                      : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
