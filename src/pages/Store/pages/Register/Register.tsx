import { useMutation } from "@tanstack/react-query";
import React, { useContext } from "react";
import { toast } from "react-toastify";
import storeApi from "src/apis/store.api";
import Button from "src/components/Button";
import { AuthContext } from "src/contexts/auth.context";

export default function StoreRegister() {
  const { userProfile, setUserProfile } = useContext(AuthContext);

  const registerMutation = useMutation({
    mutationFn: storeApi.registerStore,
    onSuccess: (data) => {
      toast.success("Đăng ký Kênh Người Bán thành công!");
      setUserProfile(data.data.data);
      // Reload page to apply new role
      window.location.reload();
    },
    onError: () => {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    },
  });

  const handleRegister = () => {
    registerMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 py-10">
      <div className="w-full max-w-lg rounded-sm bg-white p-10 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          <svg
            viewBox="0 0 24 24"
            className="h-16 w-16 fill-primary"
          >
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z" />
            <path d="M12 7l-4 4h3v4h2v-4h3z" />
          </svg>
        </div>
        <h1 className="mb-4 text-2xl font-bold text-gray-800">Chào mừng đến với Kênh Người Bán</h1>
        <p className="mb-8 leading-relaxed text-gray-600">
          Đăng ký để trở thành Người Bán trên Shopee ngay hôm nay. Mở rộng cơ hội kinh doanh và tiếp cận hàng triệu
          khách hàng!
        </p>
        <Button
          isLoading={registerMutation.isLoading}
          disabled={registerMutation.isLoading}
          onClick={handleRegister}
          className="w-full bg-primary py-3 text-lg uppercase text-white"
        >
          Đăng ký ngay
        </Button>
      </div>
    </div>
  );
}
