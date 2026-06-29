import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "react-toastify";
import adminApi from "src/apis/admin.api";

const STARS = [5, 4, 3, 2, 1];

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const [filterStar, setFilterStar] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["adminReviews"],
    queryFn: () => adminApi.getReviews(),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteReview,
    onSuccess: () => {
      toast.success("Đã xóa đánh giá!");
      queryClient.invalidateQueries(["adminReviews"]);
    },
  });

  const reviews = data?.data?.data || [];
  const filtered = filterStar === 0 ? reviews : reviews.filter((r: any) => r.rating === filterStar);

  const starCount = (s: number) => reviews.filter((r: any) => r.rating === s).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Quản lý Đánh giá</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Xem và gỡ bỏ các đánh giá vi phạm chính sách.</p>
      </div>

      {/* Filter by stars */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStar(0)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filterStar === 0 ? "bg-primary text-white dark:bg-primary/90" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
        >
          Tất cả ({reviews.length})
        </button>
        {STARS.map(s => (
          <button key={s}
            onClick={() => setFilterStar(s === filterStar ? 0 : s)}
            className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filterStar === s ? "bg-primary text-white dark:bg-primary/90" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
          >
            {"⭐".repeat(1)} {s} sao ({starCount(s)})
          </button>
        ))}
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
            ))
          : filtered.length === 0
          ? (
            <div className="py-20 text-center text-gray-400">
              <svg viewBox="0 0 24 24" className="mx-auto mb-4 h-12 w-12 fill-current opacity-30"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
              <p className="text-sm">Không có đánh giá nào.</p>
            </div>
          )
          : filtered.map((review: any) => (
            <div key={review._id} className="group flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800">
              {/* Avatar */}
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <img src={review.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${review.user?.name}`} alt="" className="h-full w-full object-cover dark:opacity-80" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{review.user?.name || "Ẩn danh"}</span>
                    <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{review.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-sm ${i < review.rating ? "text-yellow-400" : "text-gray-200 dark:text-gray-700"}`}>★</span>
                    ))}
                  </div>
                </div>

                {/* Product */}
                <div className="mt-1.5 flex items-center gap-2">
                  <img src={review.product?.image} alt="" className="h-6 w-6 rounded object-cover bg-gray-100 dark:bg-gray-800" />
                  <span className="truncate text-xs text-gray-500 dark:text-gray-400">{review.product?.name}</span>
                </div>

                <p className="mt-2 text-sm text-gray-700 leading-relaxed dark:text-gray-300">{review.comment}</p>

                {review.images?.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {review.images.map((img: string, i: number) => (
                      <img key={i} src={img} alt="" className="h-16 w-16 rounded-xl border border-gray-200 object-cover dark:border-gray-700" />
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                  <span>{new Date(review.createdAt).toLocaleDateString("vi-VN")}</span>
                  <span>👍 {review.helpfulCount} lượt thấy hữu ích</span>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => { if (confirm("Xóa đánh giá này?")) deleteMutation.mutate(review._id); }}
                className="hidden flex-shrink-0 self-start rounded-xl border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 group-hover:block dark:border-red-900/50 dark:hover:bg-red-900/20"
              >
                Xóa
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
