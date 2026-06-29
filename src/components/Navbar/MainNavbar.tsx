import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authApi from "src/apis/auth.api";
import productApi from "src/apis/product.api";
import purchaseAPI from "src/apis/purchase.api";
import EmptyCartIcon from "src/assets/images/empty-cart.png";
import { path } from "src/constants/path.enum";
import { purchasesStatus } from "src/constants/purchaseStatus.enum";
import { AuthContext } from "src/contexts/auth.context";
import { ThemeContext } from "src/contexts/theme.context";
import useSearchProducts from "src/hooks/useSearchProducts";
import { formatCurrency } from "src/utils/formatNumber";
import getAvatarUrl from "src/utils/getAvatarUrl";
import useDebounce from "src/hooks/useDebounce";
import getDeviceType from "src/utils/getDeviceType";
import { generateSlug } from "src/utils/slugify";
import { ArrowDownIcon, EarthIcon, ShopeeLogoIcon } from "../Icon";
import ShopeeLogoIcon2 from "../Icon/ShopeeLogoIcon2";
import Popover from "../Popover";
import NotificationBell from "../NotificationBell/NotificationBell";

type TMainNavbar = {
  bottomCropped?: boolean;
};
const MAX_PURCHASES_PER_CART = 5;
const MainNavbar = ({ bottomCropped = false }: TMainNavbar) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { handleSearch, register, watch, setValue } = useSearchProducts();
  const searchValue = watch("search") || "";
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const { isAuthenticated, userProfile, setIsAuthenticated, setUserProfile } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logOutAccountMutation = useMutation({
    mutationFn: () => authApi.logoutAccount(),
    onSuccess: () => {
      toast.success("Đăng xuất thành công", {
        autoClose: 2000,
      });
      queryClient.removeQueries({
        queryKey: ["cart", { status: purchasesStatus.inCart }],
      });
    },
  });
  const { data: purchasesInCartData } = useQuery({
    queryKey: ["cart", { status: purchasesStatus.inCart }],
    queryFn: () => purchaseAPI.getCart({ status: purchasesStatus.inCart }),
    enabled: isAuthenticated,
  });
  const purchasesInCart = purchasesInCartData?.data.data;
  const { data: suggestionsData } = useQuery({
    queryKey: ["suggest", debouncedSearchValue],
    queryFn: () => productApi.suggestProducts(debouncedSearchValue),
    enabled: debouncedSearchValue.trim().length >= 2,
  });
  const suggestions = suggestionsData?.data.data || [];

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem("search_history") || "[]");
      setSearchHistory(history);
    } catch (e) {
      console.error(e);
    }
  }, [searchValue]); // Re-fetch when search changes (after submit)

  const handleLogOut = () => {
    logOutAccountMutation.mutate();
    setIsAuthenticated(false);
    setUserProfile(null);

    navigate("/login");
  };

  return (
    <div
      className={`bg-[linear-gradient(-180deg,#f53d2d,#f63)] text-white ${
        bottomCropped ? "items-center py-1" : "pt-2 pb-5"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between">
          <div className="flex gap-x-4 text-sm font-light">
            <Link
              to={path.storeDashboard}
              className="hover:text-gray-300"
            >
              {t("Kênh Người Bán")}
            </Link>
          </div>
          <div className="flex justify-end gap-x-6 text-sm font-light">
            <Popover
              className="flex cursor-pointer items-center gap-x-1 py-1 hover:text-gray-300"
              as="span"
              renderPopover={
                <div className="flex flex-col items-start bg-white dark:bg-gray-800 shadow-lg">
                  <button className="py-3 pl-4 pr-36 hover:text-orange-400 dark:text-white dark:hover:text-orange-400" onClick={() => i18n.changeLanguage('vi')}>{t("Tiếng Việt")}</button>
                  <button className="py-3 pl-4 pr-36 hover:text-orange-400 dark:text-white dark:hover:text-orange-400" onClick={() => i18n.changeLanguage('en')}>{t("English")}</button>
                </div>
              }
            >
              <EarthIcon></EarthIcon>
              <span>{i18n.language.includes('en') ? 'English' : 'Tiếng Việt'}</span>
              <ArrowDownIcon></ArrowDownIcon>
            </Popover>
            <button onClick={toggleTheme} className="flex cursor-pointer items-center py-1 hover:text-gray-300">
              {theme === "light" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              )}
            </button>
            {isAuthenticated && <NotificationBell />}
            {isAuthenticated && (
              <Popover
                className="flex cursor-pointer items-center py-1 hover:text-gray-300"
                renderPopover={
                  <div className="relative rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                    <Link
                      to={path.home}
                      className="block w-full bg-white dark:bg-gray-800 dark:text-white py-3 px-4 text-left hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-cyan-500"
                    >
                      {t("Trang chủ")}
                    </Link>
                    <Link
                      to={path.profile}
                      className="block w-full bg-white dark:bg-gray-800 dark:text-white py-3 px-4 text-left hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-cyan-500"
                    >
                      {t("Tài khoản của tôi")}
                    </Link>
                    <Link
                      to={path.orderHistory}
                      className="block w-full bg-white dark:bg-gray-800 dark:text-white py-3 px-4 text-left hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-cyan-500"
                    >
                      {t("Đơn mua")}
                    </Link>
                    <button
                      onClick={handleLogOut}
                      className="block w-full bg-white dark:bg-gray-800 dark:text-white py-3 px-4 text-left hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-cyan-500"
                    >
                      {t("Đăng xuất")}
                    </button>
                  </div>
                }
              >
                <div className="mr-2 h-6 w-6 flex-shrink-0">
                  <img
                    src={getAvatarUrl(userProfile?.avatar, userProfile?.email)}
                    alt="avatar"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <div>{userProfile?.name || "Chưa có tên"}</div>
              </Popover>
            )}
            {!isAuthenticated && (
              <div className="flex items-center gap-x-3">
                <Link
                  to={path.register}
                  className="capitalize hover:text-white/70"
                >
                  {t("Đăng ký")}
                </Link>
                <div className="h-4 border-r-[1px] border-r-white/40" />
                <Link
                  to={path.login}
                  className="capitalize hover:text-white/70"
                >
                  {t("Đăng nhập")}
                </Link>
              </div>
            )}
          </div>
        </div>
        {!bottomCropped && (
          <div className="mt-4 flex items-center gap-x-4">
            <Link to={path.home}>
              <ShopeeLogoIcon
                className="hidden sm:block"
                fillColor="secondary"
              ></ShopeeLogoIcon>
              <ShopeeLogoIcon2
                fillColor="secondary"
                className="block sm:hidden"
              ></ShopeeLogoIcon2>
            </Link>
            <form
              className="relative w-full"
              onSubmit={handleSearch}
            >
              <div className="flex rounded-sm bg-white dark:bg-gray-800 p-1">
                <input
                  type="text"
                  className="w-full flex-grow-0 border-none bg-transparent px-3 py-2 text-black dark:text-white outline-none"
                  placeholder={t("Free Ship Đơn Từ 0Đ") as string}
                  {...register("search")}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                />
                <button className="rounded-sm bg-primary py-2 px-4 hover:opacity-90 lg:px-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </button>
              </div>
              {isInputFocused && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-sm bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm">
                  {!debouncedSearchValue.trim() && searchHistory.length > 0 && (
                    <div className="py-2">
                      <div className="px-3 pb-1 text-sm text-gray-500">{t("Lịch sử tìm kiếm")}</div>
                      {searchHistory.map((h, index) => (
                        <div
                          key={index}
                          className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setValue("search", h);
                            setTimeout(() => {
                              handleSearch();
                            }, 0);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              setValue("search", h);
                              setTimeout(() => handleSearch(), 0);
                            }
                          }}
                        >
                          {h}
                        </div>
                      ))}
                    </div>
                  )}
                  {debouncedSearchValue.trim().length >= 2 && suggestions.length > 0 && (
                    <div className="py-2">
                      <div className="px-3 pb-1 text-sm text-gray-500">{t("Gợi ý sản phẩm")}</div>
                      {suggestions.map((p) => (
                        <Link
                          key={p._id}
                          to={`/${generateSlug({ name: p.name, id: p._id })}`}
                          className="flex items-center gap-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-8 w-8 rounded-sm object-cover"
                          />
                          <div className="flex-1 truncate text-sm">{p.name}</div>
                          <div className="text-sm text-primary">₫{formatCurrency(p.price)}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>
            <div className="col-span-1 justify-self-end">
              <Popover
                renderPopover={
                  <div className="relative max-w-[380px] rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm shadow-md sm:max-w-[400px]">
                    {purchasesInCart && purchasesInCart.length > 0 ? (
                      <>
                        <div className="m-2 capitalize text-gray-400">{t("Sản phẩm mới thêm")}</div>
                        <div className="mt-5">
                          {purchasesInCart.slice(0, MAX_PURCHASES_PER_CART).map((purchase) => (
                            <Link
                              className="flex py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                              key={purchase._id}
                              to={`/${generateSlug({ name: purchase.product.name, id: purchase.product._id })}`}
                            >
                              <div className="flex-shrink-0">
                                <img
                                  src={purchase.product.image}
                                  alt="anh"
                                  className="h-11 w-11 object-cover"
                                />
                              </div>
                              <div className="ml-2 flex-grow overflow-hidden">
                                <div className="truncate text-black dark:text-white">{purchase.product.name}</div>
                              </div>
                              <div className="ml-2 flex-shrink-0">
                                <span className="text-primary">₫{formatCurrency(purchase.product.price)}</span>
                              </div>
                            </Link>
                          ))}
                          <div className="mx-2 mb-2 mt-6 flex items-center justify-between">
                            {purchasesInCart.length - MAX_PURCHASES_PER_CART > 0 && (
                              <div>{t("Còn")} {purchasesInCart.length - MAX_PURCHASES_PER_CART} {t("sản phẩm trong giỏ")}</div>
                            )}
                            <button
                              className="rounded-sm bg-primary px-4 py-2 capitalize text-white hover:bg-opacity-90"
                              onClick={() => navigate("/cart")}
                            >
                              {t("Xem giỏ hàng")}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-y-3 py-10 px-16 sm:py-12 sm:px-28">
                        <img
                          src={EmptyCartIcon}
                          alt="Empty"
                          className="h-20 w-20 sm:h-40 sm:w-40"
                        />
                        <span className="text-sm sm:text-base text-black dark:text-white">{t("Chưa có sản phẩm")}</span>
                      </div>
                    )}
                  </div>
                }
              >
                <Link
                  className="relative"
                  to={getDeviceType() === "mobile" || getDeviceType() === "tablet" ? location.pathname : path.cart}
                >
                  {purchasesInCart && purchasesInCart.length > 0 && (
                    <span className="absolute -top-3 -right-3 flex h-7 w-7 scale-75 items-center justify-center rounded-full bg-white px-3 py-4 text-primary">
                      {purchasesInCart.length}
                    </span>
                  )}

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-8 w-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                </Link>
              </Popover>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainNavbar;
