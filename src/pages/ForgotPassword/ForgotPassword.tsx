import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authApi from "src/apis/auth.api";
import Button from "src/components/Button";
import { path } from "src/constants/path.enum";

const inputClass =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const forgotMutation = useMutation({
    mutationFn: () => authApi.forgotPassword({ email }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setDevOtp(res.data?.data?.devOtp || null);
      setStep(2);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Có lỗi xảy ra"),
  });

  const resetMutation = useMutation({
    mutationFn: () => authApi.resetPassword({ email, otp, newPassword }),
    onSuccess: () => {
      toast.success("Đặt lại mật khẩu thành công, mời đăng nhập");
      navigate(path.login);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Có lỗi xảy ra"),
  });

  return (
    <div className="grid grid-cols-1 py-12 lg:grid-cols-5 lg:py-32 lg:pr-10">
      <Helmet>
        <title>Shopee At Home | Quên mật khẩu</title>
      </Helmet>
      <div className="lg:col-span-2 lg:col-start-4">
        <div className="rounded bg-white p-10 shadow-sm text-gray-800">
          <div className="text-2xl">Quên mật khẩu</div>

          {step === 1 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.trim()) return toast.error("Vui lòng nhập email");
                forgotMutation.mutate();
              }}
              className="mt-6"
              noValidate
            >
              <p className="mb-3 text-sm text-gray-500">Nhập email tài khoản để nhận mã OTP đặt lại mật khẩu.</p>
              <input
                type="email"
                className={inputClass}
                placeholder="Địa chỉ e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" isLoading={forgotMutation.isLoading} containerClassName="mt-4">
                Gửi mã OTP
              </Button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!otp.trim() || !newPassword.trim()) return toast.error("Vui lòng nhập đủ thông tin");
                resetMutation.mutate();
              }}
              className="mt-6"
              noValidate
            >
              {devOtp && (
                <div className="mb-3 rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
                  (Demo) Mã OTP của bạn: <span className="font-bold">{devOtp}</span>
                </div>
              )}
              <input
                type="text"
                className={inputClass}
                placeholder="Nhập mã OTP (6 số)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <input
                type="password"
                className={`${inputClass} mt-3`}
                placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button type="submit" isLoading={resetMutation.isLoading} containerClassName="mt-4">
                Đặt lại mật khẩu
              </Button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-3 w-full text-sm text-gray-500 hover:underline"
              >
                ‹ Nhập lại email
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-center">
            <span className="text-gray-400">Nhớ mật khẩu?</span>
            <Link className="ml-1 text-red-400" to={path.login}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
