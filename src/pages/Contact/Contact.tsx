import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import Button from "src/components/Button";
import http from "src/utils/http";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });

  const contactMutation = useMutation({
    mutationFn: (body: typeof formData) => http.post("/contact", body),
    onSuccess: () => {
      toast.success("Gửi liên hệ thành công. Chúng tôi sẽ sớm phản hồi bạn!");
      setFormData({ name: "", email: "", message: "" });
      setErrors({ name: "", email: "", message: "" });
    },
    onError: () => {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    },
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", email: "", message: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = "Vui lòng nhập nội dung liên hệ";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      contactMutation.mutate(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-10">
      <Helmet>
        <title>Shopee At Home | Liên Hệ</title>
      </Helmet>
      <div className="container max-w-5xl">
        <h1 className="mb-8 text-center text-3xl font-medium uppercase">Hỗ trợ & Liên hệ</h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-sm bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-medium">Gửi tin nhắn cho chúng tôi</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-gray-700"
                >
                  Họ và tên *
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full rounded-sm border p-3 outline-none focus:border-primary ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && <div className="mt-1 text-sm text-red-500">{errors.name}</div>}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="contact-email"
                  className="mb-2 block text-gray-700"
                >
                  Email *
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-sm border p-3 outline-none focus:border-primary ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && <div className="mt-1 text-sm text-red-500">{errors.email}</div>}
              </div>
              <div className="mb-6">
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-gray-700"
                >
                  Nội dung *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full rounded-sm border p-3 outline-none focus:border-primary ${
                    errors.message ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.message && <div className="mt-1 text-sm text-red-500">{errors.message}</div>}
              </div>
              <Button
                type="submit"
                isLoading={contactMutation.isLoading}
                disabled={contactMutation.isLoading}
                className="w-full rounded-sm bg-primary py-3 uppercase text-white hover:bg-primary/90"
              >
                Gửi liên hệ
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-sm bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-medium">Thông tin liên hệ</h2>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-start">
                  <svg
                    className="mr-3 mt-1 h-5 w-5 fill-primary"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <div>
                    <strong className="block text-gray-800">Địa chỉ:</strong>
                    Toà nhà Shopee, 123 Đường ABC, Quận 1, TP. HCM
                  </div>
                </div>
                <div className="flex items-start">
                  <svg
                    className="mr-3 mt-1 h-5 w-5 fill-primary"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  <div>
                    <strong className="block text-gray-800">Hotline:</strong>
                    1900 1234
                  </div>
                </div>
                <div className="flex items-start">
                  <svg
                    className="mr-3 mt-1 h-5 w-5 fill-primary"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  <div>
                    <strong className="block text-gray-800">Email:</strong>
                    support@shopee.vn
                  </div>
                </div>
              </div>
            </div>

            <div className="h-64 rounded-sm bg-white p-2 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m3!1d3919.4602324217315!2d106.69748631480076!3d10.776019492321856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f40a3b49e59%3A0xa1bd14e483a602bd!2sHo%20Chi%20Minh%20City!5e0!3m2!1sen!2s!4v1622822920194!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                title="Google Maps"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
