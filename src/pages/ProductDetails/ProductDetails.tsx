import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import React, { useState, useContext } from "react";
import { convert } from "html-to-text";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import productApi from "src/apis/product.api";
import purchaseAPI from "src/apis/purchase.api";
import wishlistApi from "src/apis/wishlist.api";
import ProductRating from "src/components/ProductRating";
import QuantityController from "src/components/QuantityController";
import { AuthContext } from "src/contexts/auth.context";
import { path } from "src/constants/path.enum";
import { purchasesStatus } from "src/constants/purchaseStatus.enum";
import { calculateSalePercent, formatCurrency, formatNumberToSocialStyle } from "src/utils/formatNumber";
import { getIdFromSlug } from "src/utils/slugify";
import { FreeMode, Navigation, Thumbs } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
// eslint-disable-next-line import/no-unresolved
import { Swiper as SwiperType } from "swiper/types";
import Product from "../ProductList/components/Product";
import Recommendations from "src/components/Recommendations";
import ProductReviews from "./components/ProductReviews";
import { isAxiosError } from "axios";

const ProductDetails = () => {
  const { t } = useTranslation();
  const [thumbSwiper, setThumbSwiper] = useState<SwiperType | null>(null);
  const [currentImageState, setCurrentImageState] = useState<HTMLImageElement | null>(null);
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);
  const navigate = useNavigate();
  const { slug } = useParams();
  const id = getIdFromSlug(slug as string);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useContext(AuthContext);
  const { data: productDetailData } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getProductById(id as string),
    staleTime: 3 * 60 * 1000,
  });
  const product = productDetailData?.data.data;
  const { data: relevantProductListData } = useQuery({
    queryKey: ["relevantProducts", product?.category._id],
    queryFn: () =>
      productApi.getProducts({ category: product?.category._id, sort_by: "sold", order: "desc", limit: "12" }),
    staleTime: 3 * 60 * 1000,
    enabled: Boolean(product),
  });

  React.useEffect(() => {
    if (product) {
      const recentlyViewedStr = localStorage.getItem("recentlyViewed") || "[]";
      let recentlyViewed = JSON.parse(recentlyViewedStr) as string[];
      // Remove if exists and push to top
      recentlyViewed = recentlyViewed.filter((item) => item !== product._id);
      recentlyViewed.unshift(product._id);
      // Keep only last 10
      if (recentlyViewed.length > 10) recentlyViewed = recentlyViewed.slice(0, 10);
      localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
    }
  }, [product]);

  const addToCartMutation = useMutation({
    mutationFn: () => purchaseAPI.addToCart({ buy_count: currentQuantity, product_id: product?._id as string }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", { status: purchasesStatus.inCart }] });
      toast.dismiss();
      toast.success("Thêm vào giỏ hàng thành công", {
        hideProgressBar: true,
        autoClose: 1000,
        draggable: false,
        position: "top-center",
        className: "add-to-cart-successfully-toast",
        closeOnClick: false,
      });
    },
    onError: () => {
      toast.error("Vui lòng đăng nhập!");
    },
  });
  const handleCurrentQuantity = (value: number) => {
    setCurrentQuantity(value);
  };

  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập!");
      return;
    }
    navigate(path.checkout, {
      state: {
        purchases: [
          {
            _id: `buy_now_${new Date().getTime()}`,
            product: product,
            buy_count: currentQuantity,
          },
        ],
      },
    });
  };

  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.getWishlist,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const wishlistProducts = wishlistData?.data.data || [];
  const isLiked = wishlistProducts.some((p: any) => p === product?._id || p._id === product?._id);

  const toggleWishlistMutation = useMutation({
    mutationFn: (isLikedNow: boolean) =>
      isLikedNow ? wishlistApi.removeFromWishlist(product!._id) : wishlistApi.addToWishlist(product!._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      return;
    }
    toggleWishlistMutation.mutate(isLiked);
  };

  const handleEnterZoomMode = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    setCurrentImageState(e.currentTarget);
  };

  const handleZoom = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (currentImageState) {
      const image = currentImageState as HTMLImageElement;
      const { naturalHeight, naturalWidth } = image;
      const offsetX = event.pageX - (rect.x + window.scrollX);
      const offsetY = event.pageY - (rect.y + window.scrollY);

      const top = offsetY * (1 - naturalHeight / rect.height);
      const left = offsetX * (1 - naturalWidth / rect.width);
      image.style.width = naturalWidth + "px";
      image.style.height = naturalHeight + "px";
      image.style.maxWidth = "unset";
      image.style.top = top + "px";
      image.style.left = left + "px";
    }
  };

  const handleRemoveZoom = () => {
    const image = currentImageState as HTMLImageElement;
    setCurrentImageState(null);
    image.removeAttribute("style");
  };

  if (!product) {
    return (
      <div className="bg-gray-200 dark:bg-gray-900 py-6">
        <div className="bg-white dark:bg-gray-800 p-4 shadow">
          <div className="container">
            <div className="animate-pulse lg:grid lg:grid-cols-12 lg:gap-9">
              <div className="block lg:col-span-5">
                <div className="w-full rounded-sm bg-gray-200 pt-[100%]"></div>
                <div className="mt-4 flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gray-200 pt-[20%]"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="mt-5 block lg:col-span-7">
                <div className="mb-6 h-8 w-3/4 rounded bg-gray-200"></div>
                <div className="mb-6 flex gap-4">
                  <div className="h-5 w-20 rounded bg-gray-200"></div>
                  <div className="h-5 w-20 rounded bg-gray-200"></div>
                </div>
                <div className="mb-8 h-16 w-full rounded bg-gray-200"></div>
                <div className="mb-8 h-10 w-32 rounded bg-gray-200"></div>
                <div className="flex gap-4">
                  <div className="h-12 flex-1 rounded bg-gray-200"></div>
                  <div className="h-12 flex-1 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 dark:bg-gray-900 py-6">
      <Helmet>
        <title>{product.name}</title>
        <meta
          name="description"
          content={`${convert(product.description, {
            limits: { maxInputLength: 170 },
            preserveNewlines: false,
          })}`}
        />
      </Helmet>
      <div className="bg-white dark:bg-gray-800 p-4 shadow">
        <div className="container">
          <div className="lg:grid lg:grid-cols-12 lg:gap-9">
            <div className="block lg:col-span-5">
              <Swiper
                thumbs={{ swiper: thumbSwiper && !thumbSwiper.destroyed ? thumbSwiper : null }}
                spaceBetween={10}
                grabCursor={true}
                preventInteractionOnTransition={true}
                modules={[Thumbs]}
                className="transition-all duration-200 hover:shadow-bottom-spread active:pointer-events-none"
              >
                {product.video && (
                  <SwiperSlide key="video">
                    <div className="relative flex w-full items-center justify-center overflow-hidden bg-black pt-[100%]">
                      <video
                        src={product.video}
                        controls
                        className="absolute top-0 left-0 h-full w-full object-contain"
                      >
                        <track
                          kind="captions"
                          srcLang="vi"
                          label="Tiếng Việt"
                        />
                      </video>
                    </div>
                  </SwiperSlide>
                )}
                {product.images.map((image) => {
                  return (
                    <SwiperSlide key={image}>
                      <div
                        className="relative w-full overflow-hidden pt-[100%]"
                        onMouseMove={handleZoom}
                        onMouseLeave={handleRemoveZoom}
                      >
                        <img
                          src={image}
                          alt={product.name}
                          onMouseEnter={handleEnterZoomMode}
                          aria-hidden={true}
                          className="absolute top-0 left-0 h-full w-full cursor-zoom-in bg-white dark:bg-gray-800 object-cover"
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
              <Swiper
                onSwiper={setThumbSwiper}
                className="mt-4"
                grabCursor={true}
                breakpoints={{
                  320: {
                    slidesPerView: 3,
                    spaceBetween: 10,
                    freeMode: true,
                  },
                  1024: {
                    slidesPerView: 5,
                    spaceBetween: 10,
                  },
                }}
                navigation={true}
                modules={[Navigation, Thumbs, FreeMode]}
              >
                {product.video && (
                  <SwiperSlide key="video-thumb">
                    <div className="relative flex w-full cursor-pointer items-center justify-center bg-black pt-[100%]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="white"
                        className="absolute z-10 h-8 w-8 opacity-80"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <video
                        src={product.video}
                        className="absolute top-0 left-0 h-full w-full object-cover opacity-60"
                      >
                        <track
                          kind="captions"
                          srcLang="vi"
                          label="Tiếng Việt"
                        />
                      </video>
                    </div>
                  </SwiperSlide>
                )}
                {product.images.map((image) => {
                  return (
                    <SwiperSlide key={image}>
                      <div className="relative w-full pt-[100%]">
                        <img
                          src={image}
                          alt={product.name}
                          className="absolute top-0 left-0 h-full w-full cursor-pointer bg-white dark:bg-gray-800 object-cover"
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
            <div className="mt-5 block lg:col-span-7">
              <h1 className="text-xl font-medium uppercase text-black dark:text-white">{product.name}</h1>
              <div className="mt-8 flex items-center">
                <div className="flex items-center">
                  <span className="mr-1 border-b border-b-primary text-primary">{product.rating}</span>
                  <ProductRating
                    rating={product.rating}
                    activeClassName="fill-primary text-primary h-4 w-4"
                    nonActiveClassName="fill-gray-300 text-gray-300 h-4 w-4"
                  />
                </div>
                <div className="mx-4 h-4 w-[1px] bg-gray-300"></div>
                <div>
                  <span>{formatNumberToSocialStyle(product.sold)}</span>
                  <span className="ml-1 text-gray-500">{t("Đã bán")}</span>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-x-4 bg-gray-50 dark:bg-gray-700 px-5 py-4">
                <div className="text-gray-500 dark:text-gray-400 line-through">₫{formatCurrency(product.price_before_discount)}</div>
                <div className="text-2xl font-medium text-primary sm:text-3xl">₫{formatCurrency(product.price)}</div>
                <div className="rounded-sm bg-primary px-1 py-[2px] text-xs font-semibold uppercase text-white">
                  {calculateSalePercent(product.price_before_discount, product.price)} {t("giảm")}
                </div>
              </div>
              <div className="mt-8 flex items-center">
                <div className="capitalize text-gray-500 dark:text-gray-400">{t("Số lượng")}</div>
                <QuantityController
                  type="text"
                  onDecrease={handleCurrentQuantity}
                  onIncrease={handleCurrentQuantity}
                  onType={handleCurrentQuantity}
                  value={currentQuantity}
                  max={product.quantity}
                  containerClassName="ml-10"
                ></QuantityController>
                <div className="ml-6 text-sm text-gray-500 dark:text-gray-400">{product.quantity} {t("sản phẩm có sẵn")}</div>
              </div>
              <div className="mt-8 sm:flex sm:items-center sm:gap-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex h-12 w-full items-center justify-center rounded-sm border border-primary bg-primary/10 px-5 capitalize text-primary shadow-sm hover:bg-primary/5 sm:w-auto"
                >
                  <svg
                    enableBackground="new 0 0 15 15"
                    viewBox="0 0 15 15"
                    x={0}
                    y={0}
                    className="mr-[10px] h-5 w-5 fill-current stroke-primary text-primary"
                  >
                    <g>
                      <g>
                        <polyline
                          fill="none"
                          points=".5 .5 2.7 .5 5.2 11 12.4 11 14.5 3.5 3.7 3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeMiterlimit={10}
                        />
                        <circle
                          cx={6}
                          cy="13.5"
                          r={1}
                          stroke="none"
                        />
                        <circle
                          cx="11.5"
                          cy="13.5"
                          r={1}
                          stroke="none"
                        />
                      </g>
                      <line
                        fill="none"
                        strokeLinecap="round"
                        strokeMiterlimit={10}
                        x1="7.5"
                        x2="10.5"
                        y1={7}
                        y2={7}
                      />
                      <line
                        fill="none"
                        strokeLinecap="round"
                        strokeMiterlimit={10}
                        x1={9}
                        x2={9}
                        y1="8.5"
                        y2="5.5"
                      />
                    </g>
                  </svg>
                  {t("Thêm vào giỏ hàng")}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="mt-5 flex h-12 w-full min-w-[5rem] items-center justify-center rounded-sm bg-primary px-5 capitalize text-white shadow-sm outline-none hover:bg-primary/90 sm:mt-0 sm:w-auto"
                >
                  {t("Mua ngay")}
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className="mt-5 flex h-12 w-full min-w-[5rem] items-center justify-center gap-2 rounded-sm border border-gray-300 px-5 capitalize text-gray-600 shadow-sm outline-none hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-5 w-5 ${isLiked ? "fill-primary" : "fill-none stroke-gray-500 stroke-2"}`}
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {t("Yêu thích")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white dark:bg-gray-800 p-4 shadow">
        <div className="container">
          <div className="rounded bg-gray-50 dark:bg-gray-700 p-4 text-lg capitalize text-slate-700 dark:text-gray-300">{t("Mô tả sản phẩm")}</div>
          <div className="mx-4 mt-12 mb-4 text-sm leading-loose text-black dark:text-gray-200">
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(product.description),
              }}
            />
          </div>
        </div>
      </div>
      <ProductReviews
        productId={product._id}
        productRating={product.rating}
      />
      <div className="container mt-8">
        <Recommendations categoryId={product.category._id} />
      </div>
      <div className="container">
        <h2 className="mt-5 uppercase text-black dark:text-white">{t("Các sản phẩm liên quan khác")}</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {relevantProductListData &&
            relevantProductListData.data.data.products.map((product) => (
              <div
                className="col-span-1"
                key={product._id}
              >
                <Product product={product}></Product>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
