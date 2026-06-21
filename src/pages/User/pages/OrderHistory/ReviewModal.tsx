import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import reviewApi from "src/apis/review.api";

interface Props {
  order: any;
  onClose: () => void;
}

export default function ReviewModal({ order, onClose }: Props) {
  const [reviews, setReviews] = useState<Record<string, { rating: number; comment: string }>>({});

  const handleRatingChange = (productId: string, rating: number) => {
    setReviews((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], rating: rating || 5, comment: prev[productId]?.comment || "" },
    }));
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setReviews((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], rating: prev[productId]?.rating || 5, comment },
    }));
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const promises = order.items.map((item: any) => {
        const productId = item.product?._id || item.product;
        if (!productId) return Promise.resolve();
        
        const review = reviews[productId] || { rating: 5, comment: "Sản phẩm tốt!" };
        return reviewApi.createReview(productId, {
          rating: review.rating,
          comment: review.comment,
        });
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Đánh giá sản phẩm thành công!");
      onClose();
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi gửi đánh giá.");
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-800">Đánh giá sản phẩm</h2>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {order.items.map((item: any) => {
            const productId = item.product?._id || item.product;
            const currentReview = reviews[productId] || { rating: 5, comment: "" };

            return (
              <div key={item._id} className="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="mb-3 flex items-center gap-3">
                  <img src={item.productImage} alt={item.productName} className="h-12 w-12 rounded object-cover border border-gray-200" />
                  <div className="flex-1 truncate text-sm font-medium text-gray-800">{item.productName}</div>
                </div>
                
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm text-gray-600">Chất lượng:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(productId, star)}
                        className={`text-2xl ${star <= currentReview.rating ? "text-yellow-400" : "text-gray-300"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  placeholder="Hãy chia sẻ nhận xét cho sản phẩm này nhé..."
                  className="w-full rounded border border-gray-300 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={3}
                  value={currentReview.comment}
                  onChange={(e) => handleCommentChange(productId, e.target.value)}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded border border-gray-300 px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            disabled={submitMutation.isLoading}
          >
            Trở lại
          </button>
          <button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isLoading}
            className="rounded bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            {submitMutation.isLoading ? "Đang gửi..." : "Hoàn thành"}
          </button>
        </div>
      </div>
    </div>
  );
}
