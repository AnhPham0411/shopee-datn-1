import { yupResolver } from "@hookform/resolvers/yup";
import classNames from "classnames";
import omit from "lodash/omit";
import { Controller, useForm } from "react-hook-form";
import { createSearchParams, Link, useNavigate } from "react-router-dom";
import Button from "src/components/Button";
import InputNumber from "src/components/InputNumber";
import { path } from "src/constants/path.enum";
import { TCategory } from "src/types/category.type";
import { TQueryConfig } from "src/types/query.type";
import { priceRangeSchema, TPriceRangeType } from "src/schemas/schema";
import RatingFilter from "../RatingFilter";
import { useTranslation } from "react-i18next";

type AsideFilterProps = {
  categories: TCategory[];
  queryConfig: TQueryConfig;
};

type FormData = TPriceRangeType;
const AsideFilter = ({ categories, queryConfig }: AsideFilterProps) => {
  const { t } = useTranslation();
  const { category } = queryConfig;
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      price_min: "",
      price_max: "",
    },
    shouldFocusError: false,
    resolver: yupResolver(priceRangeSchema),
  });

  const handleApplyPriceRange = handleSubmit((values) => {
    navigate({
      pathname: path.home,
      search: createSearchParams({
        ...queryConfig,
        price_min: values.price_min?.toString(),
        price_max: values.price_max?.toString(),
      }).toString(),
    });
  });

  const handleRemoveAllFilter = () => {
    navigate({
      pathname: path.home,
      search: createSearchParams(
        omit(
          {
            ...queryConfig,
          },
          [
            "rating_filter",
            "sort_by",
            "price_min",
            "price_max",
            "category",
            "order",
            "stock_status",
            "has_discount",
            "storeId",
          ],
        ),
      ).toString(),
    });
  };

  const activeCategories = category ? category.split(",") : [];

  const handleToggleCategory = (categoryId: string) => {
    const newCategories = activeCategories.includes(categoryId)
      ? activeCategories.filter((id) => id !== categoryId)
      : [...activeCategories, categoryId];

    navigate({
      pathname: path.home,
      search: createSearchParams(
        newCategories.length > 0
          ? { ...queryConfig, category: newCategories.join(",") }
          : omit(queryConfig, ["category"]),
      ).toString(),
    });
  };

  const handleToggleFilter = (key: keyof TQueryConfig, value: string) => {
    const isActive = queryConfig[key] === value;
    navigate({
      pathname: path.home,
      search: createSearchParams(isActive ? omit(queryConfig, [key]) : { ...queryConfig, [key]: value }).toString(),
    });
  };

  const handleRemoveFilter = (key: keyof TQueryConfig, valueToRemove?: string) => {
    if (key === "category" && valueToRemove) {
      handleToggleCategory(valueToRemove);
    } else {
      navigate({
        pathname: path.home,
        search: createSearchParams(omit(queryConfig, [key])).toString(),
      });
    }
  };

  return (
    <div className="py-4">
      {/* Active Filters Chips */}
      {(activeCategories.length > 0 ||
        queryConfig.stock_status ||
        queryConfig.has_discount ||
        queryConfig.price_min ||
        queryConfig.price_max ||
        queryConfig.rating_filter) && (
        <div className="mb-4">
          <div className="mb-2 text-sm font-semibold text-black dark:text-gray-200">{t("Đang áp dụng:")}</div>
          <div className="flex flex-wrap gap-2">
            {activeCategories.map((id) => {
              const catName = categories.find((c) => c._id === id)?.name || id;
              return (
                <div
                  key={id}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                >
                  <span>{catName}</span>
                  <button
                    onClick={() => handleRemoveFilter("category", id)}
                    className="ml-1 font-bold"
                  >
                    ×
                  </button>
                </div>
              );
            })}
            {queryConfig.stock_status === "in_stock" && (
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                <span>{t("Còn hàng")}</span>
                <button
                  onClick={() => handleRemoveFilter("stock_status")}
                  className="ml-1 font-bold"
                >
                  ×
                </button>
              </div>
            )}
            {queryConfig.stock_status === "out_of_stock" && (
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                <span>{t("Hết hàng")}</span>
                <button
                  onClick={() => handleRemoveFilter("stock_status")}
                  className="ml-1 font-bold"
                >
                  ×
                </button>
              </div>
            )}
            {queryConfig.has_discount === "true" && (
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                <span>{t("Đang giảm giá")}</span>
                <button
                  onClick={() => handleRemoveFilter("has_discount")}
                  className="ml-1 font-bold"
                >
                  ×
                </button>
              </div>
            )}
            {(queryConfig.price_min || queryConfig.price_max) && (
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                <span>
                  {t("Giá:")} {queryConfig.price_min || "0"} - {queryConfig.price_max || t("Max")}
                </span>
                <button
                  onClick={() => {
                    handleRemoveFilter("price_min");
                    setTimeout(() => handleRemoveFilter("price_max"), 0);
                  }}
                  className="ml-1 font-bold"
                >
                  ×
                </button>
              </div>
            )}
            {queryConfig.rating_filter && (
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                <span>≥ {queryConfig.rating_filter} {t("sao")}</span>
                <button
                  onClick={() => handleRemoveFilter("rating_filter")}
                  className="ml-1 font-bold"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Link
        to={{
          pathname: path.home,
          search: createSearchParams(
            omit(
              {
                ...queryConfig,
              },
              ["category"],
            ),
          ).toString(),
        }}
        className={classNames("flex items-center font-bold text-black dark:text-white hover:text-primary dark:hover:text-primary transition-colors", {
          "font-semibold text-primary dark:text-primary": !category,
        })}
      >
        <svg
          viewBox="0 0 12 10"
          className="mr-3 h-4 w-3 fill-current"
        >
          <g
            fillRule="evenodd"
            stroke="none"
            strokeWidth={1}
          >
            <g transform="translate(-373 -208)">
              <g transform="translate(155 191)">
                <g transform="translate(218 17)">
                  <path d="m0 2h2v-2h-2zm4 0h7.1519633v-2h-7.1519633z" />
                  <path d="m0 6h2v-2h-2zm4 0h7.1519633v-2h-7.1519633z" />
                  <path d="m0 10h2v-2h-2zm4 0h7.1519633v-2h-7.1519633z" />
                </g>
              </g>
            </g>
          </g>
        </svg>
        {t("Tất cả danh mục")}
      </Link>
      <div className="my-4 h-[1px] bg-gray-300 dark:bg-gray-700" />
      <ul>
        {categories.map((categoryItem) => {
          const isActive = activeCategories.includes(categoryItem._id);
          return (
            <li
              className="py-2 pl-2"
              key={categoryItem._id}
            >
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={isActive}
                  onChange={() => handleToggleCategory(categoryItem._id)}
                />
                <span
                  className={classNames(
                    "text-sm",
                    {
                      "font-semibold text-primary": isActive,
                    },
                    {
                      "font-normal text-black dark:text-gray-300": !isActive,
                    },
                  )}
                >
                  {categoryItem.name}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <Link
        to={path.home}
        className="mt-4 flex items-center font-bold uppercase text-black dark:text-white"
      >
        <svg
          enableBackground="new 0 0 15 15"
          viewBox="0 0 15 15"
          x={0}
          y={0}
          className="mr-3 h-4 w-3 fill-current stroke-current"
        >
          <g>
            <polyline
              fill="none"
              points="5.5 13.2 5.5 5.8 1.5 1.2 13.5 1.2 9.5 5.8 9.5 10.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeMiterlimit={10}
            />
          </g>
        </svg>
        {t("Bộ lọc tìm kiếm")}
      </Link>
      <div className="my-4 h-[1px] bg-gray-300 dark:bg-gray-700" />

      {/* Tình trạng & Khuyến mãi */}
      <div className="my-5">
        <div className="mb-3 font-semibold text-black dark:text-gray-200">{t("Tình trạng & Khuyến mãi")}</div>
        <ul className="flex flex-col gap-2 text-black dark:text-gray-300">
          <li>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-primary"
                checked={queryConfig.stock_status === "in_stock"}
                onChange={() => handleToggleFilter("stock_status", "in_stock")}
              />
              {t("Còn hàng")}
            </label>
          </li>
          <li>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-primary"
                checked={queryConfig.stock_status === "out_of_stock"}
                onChange={() => handleToggleFilter("stock_status", "out_of_stock")}
              />
              {t("Hết hàng")}
            </label>
          </li>
          <li>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-primary"
                checked={queryConfig.has_discount === "true"}
                onChange={() => handleToggleFilter("has_discount", "true")}
              />
              {t("Đang giảm giá")}
            </label>
          </li>
        </ul>
      </div>

      <div className="my-4 h-[1px] bg-gray-300 dark:bg-gray-700" />
      <div className="my-5">
        <div className="text-black dark:text-gray-200">{t("Khoảng giá")}</div>
        <form
          className="mt-2"
          onSubmit={handleApplyPriceRange}
        >
          <div className="flex items-center">
            {/* <InputControl
              type="number"
              control={control}
              name="price_min"
              placeholder="₫ TỪ"
              containerClassName="grow"
              errorClassName="hidden"
              onChange={() => {
                trigger("price_min");
              }}
            ></InputControl> */}
            <Controller
              control={control}
              name="price_min"
              render={({ field }) => {
                return (
                  <InputNumber
                    type="text"
                    placeholder={t("₫ TỪ") as string}
                    containerClassName="grow"
                    errorClassName="hidden"
                    errorMsg={errors.price_min?.message}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      trigger("price_max");
                    }}
                  />
                );
              }}
            ></Controller>
            <div className="mx-2 shrink-0 text-black dark:text-gray-300">-</div>
            <Controller
              control={control}
              name="price_max"
              render={({ field }) => {
                return (
                  <InputNumber
                    type="text"
                    placeholder={t("₫ ĐẾN") as string}
                    containerClassName="grow"
                    errorClassName="hidden"
                    errorMsg={errors.price_max?.message}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      trigger("price_min");
                    }}
                  />
                );
              }}
            ></Controller>
          </div>
          {errors.price_min?.message ? (
            <div className="mt-1 min-h-[24px] text-center text-base text-red-600">{errors.price_min?.message}</div>
          ) : (
            <div className="mt-1 min-h-[24px] text-center text-base text-red-600"></div>
          )}
          <Button className="flex w-full items-center justify-center bg-primary p-2 text-sm uppercase text-white hover:bg-primary/80">
            {t("Áp dụng")}
          </Button>
        </form>
      </div>
      <div className="my-4 h-[1px] bg-gray-300 dark:bg-gray-700" />
      <RatingFilter queryConfig={queryConfig}></RatingFilter>
      <div className="my-4 h-[1px] bg-gray-300 dark:bg-gray-700" />
      <Button
        onClick={handleRemoveAllFilter}
        className="flex w-full items-center justify-center bg-primary p-2 text-sm uppercase text-white hover:bg-primary/80"
      >
        {t("Xóa tất cả")}
      </Button>
    </div>
  );
};

export default AsideFilter;
