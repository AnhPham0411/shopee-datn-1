export type TProduct = {
  _id: string;
  images: string[];
  price: number;
  rating: number;
  price_before_discount: number;
  quantity: number;
  sold: number;
  view: number;
  name: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  image: string;
  video?: string;
  createdAt: string;
  updatedAt: string;
};

export type TProductList = {
  products: TProduct[];
  pagination: {
    page: number;
    limit: number;
    page_size: number;
  };
};

export type TProductListConfig = {
  page?: number | string;
  limit?: number | string;
  sort_by?: "createdAt" | "view" | "sold" | "price";
  order?: "asc" | "desc";
  exclude?: string;
  rating_filter?: number | string;
  price_max?: number | string;
  price_min?: number | string;
  name?: string;
  category?: string; // Can be comma separated
  stock_status?: "in_stock" | "out_of_stock";
  has_discount?: "true" | "false" | boolean;
  storeId?: string;
};
