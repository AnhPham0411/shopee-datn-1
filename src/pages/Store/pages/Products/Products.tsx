import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import storeApi from "src/apis/store.api";
import Button from "src/components/Button";
import { formatCurrency } from "src/utils/formatNumber";
import { toast } from "react-toastify";

export default function Products() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["storeProducts"],
    queryFn: storeApi.getProducts,
  });

  const products = data?.data.data || [];

  const deleteMutation = useMutation({
    mutationFn: storeApi.deleteProduct,
    onSuccess: () => {
      toast.success("Xóa sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["storeProducts"] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-[600px] rounded-sm bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium">Quản lý sản phẩm</h1>
        <Button
          className="rounded-sm bg-primary px-4 py-2 uppercase text-white"
          onClick={() => toast.info("Tính năng thêm sản phẩm đang hoàn thiện")}
        >
          Thêm sản phẩm mới
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="py-10 text-center text-gray-500">Bạn chưa có sản phẩm nào.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 uppercase text-gray-700">
              <tr>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Kho</th>
                <th className="px-4 py-3">Đã bán</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => (
                <tr
                  key={product._id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="flex items-center gap-3 px-4 py-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-12 w-12 border object-cover"
                    />
                    <div className="max-w-[200px] line-clamp-2">{product.name}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-primary">₫{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3">{product.quantity}</td>
                  <td className="px-4 py-3">{product.sold}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="mr-4 text-blue-500 hover:underline">Sửa</button>
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleDelete(product._id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
