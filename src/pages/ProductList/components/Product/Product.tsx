import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductRating from "src/components/ProductRating";
import { TProduct } from "src/types/product.type";
import { formatCurrency, formatNumberToSocialStyle } from "src/utils/formatNumber";
import { generateSlug } from "src/utils/slugify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import wishlistApi from "src/apis/wishlist.api";
import { AuthContext } from "src/contexts/auth.context";
import { toast } from "react-toastify";

type ProductProps = {
  product: TProduct;
};
const Product = ({ product }: ProductProps) => {
  const { isAuthenticated } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.getWishlist,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const wishlistProducts = wishlistData?.data.data || [];
  const isLiked = wishlistProducts.some((p: any) => p === product._id || p._id === product._id);

  const toggleWishlistMutation = useMutation({
    mutationFn: (isLikedNow: boolean) =>
      isLikedNow ? wishlistApi.removeFromWishlist(product._id) : wishlistApi.addToWishlist(product._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const handleToggleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent navigating to product details
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      return;
    }
    toggleWishlistMutation.mutate(isLiked);
  };

  return (
    <Link to={`/${generateSlug({ name: product.name, id: product._id })}`}>
      <div className="relative overflow-hidden rounded-sm bg-white dark:bg-gray-800 shadow transition-all duration-200 hover:translate-y-[-0.09rem] hover:shadow-md">
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 z-10 rounded-full bg-white/80 dark:bg-gray-700/80 p-1 shadow-sm hover:bg-white dark:hover:bg-gray-700"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-5 w-5 ${isLiked ? "fill-primary" : "fill-none stroke-gray-500 stroke-2"}`}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
        <div className="relative w-full pt-[100%]">
          <img
            src={product.image}
            alt={product.name}
            className="absolute top-0 left-0 h-full w-full bg-white dark:bg-gray-800 object-cover"
          />
        </div>
        <div className="overflow-hidden p-2">
          <div className="min-h-[2rem] text-xs line-clamp-2 text-black dark:text-gray-200">{product.name}</div>
          <div className="mt-3 flex items-center gap-x-1">
            <div className="max-w-[50%] truncate text-gray-500 dark:text-gray-400 line-through">
              <span className="text-xs">₫</span>
              <span className="text-sm">{formatCurrency(product.price_before_discount)}</span>
            </div>
            <div className="truncate text-primary">
              <span className="text-xs">₫</span>
              <span className="text-sm">{formatCurrency(product.price)}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-x-2">
            <ProductRating
              rating={product.rating}
              activeClassName="w-3 h-3 fill-[#ffca11] text-[#ffca11]"
              nonActiveClassName="w-3 h-3 fill-gray-300 text-gray-300"
            ></ProductRating>
            <div className="flex gap-x-1 text-sm text-black dark:text-gray-300">
              <span>{formatNumberToSocialStyle(product.sold)}</span>
              <span>Đã bán</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Product;
