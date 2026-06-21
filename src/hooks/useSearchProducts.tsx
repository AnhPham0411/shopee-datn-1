import { yupResolver } from "@hookform/resolvers/yup";
import omit from "lodash/omit";
import { useForm } from "react-hook-form";
import { createSearchParams, useNavigate } from "react-router-dom";
import { path } from "src/constants/path.enum";
import { searchQuerySchema, TSearchQueryType } from "src/schemas/schema";
import useQueryConfig from "./useQueryConfig";

const useSearchProducts = () => {
  const queryConfig = useQueryConfig();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue } = useForm<TSearchQueryType>({
    resolver: yupResolver(searchQuerySchema),
    defaultValues: {
      search: "",
    },
  });
  const handleSearch = handleSubmit((data) => {
    const searchString = data.search.toString().trim();
    if (searchString) {
      try {
        const history = JSON.parse(localStorage.getItem("search_history") || "[]");
        const newHistory = [searchString, ...history.filter((h: string) => h !== searchString)].slice(0, 5);
        localStorage.setItem("search_history", JSON.stringify(newHistory));
      } catch (e) {
        console.error(e);
      }
    }
    navigate({
      pathname: path.home,
      search: createSearchParams(
        omit(
          {
            ...queryConfig,
            page: "1",
            search: searchString,
          },
          ["rating_filter", "sort_by", "price_min", "price_max", "order"],
        ),
      ).toString(),
    });
  });
  return {
    register,
    handleSearch,
    watch,
    setValue,
  };
};

export default useSearchProducts;
