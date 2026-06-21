import React, { useState } from "react";
import { Helmet } from "react-helmet-async";

const faqs = [
  {
    category: "Đặt hàng",
    question: "Làm thế nào để tôi đặt hàng?",
    answer: "Bạn có thể tìm kiếm sản phẩm, thêm vào giỏ hàng và làm theo các bước thanh toán tại giỏ hàng.",
  },
  {
    category: "Thanh toán",
    question: "Có những phương thức thanh toán nào?",
    answer: "Hiện tại chúng tôi hỗ trợ thanh toán khi nhận hàng (COD) và Chuyển khoản ngân hàng.",
  },
  {
    category: "Vận chuyển",
    question: "Bao lâu thì tôi nhận được hàng?",
    answer: "Thời gian giao hàng phụ thuộc vào phương thức vận chuyển bạn chọn (Nhanh, Hoả tốc, Tiết kiệm).",
  },
  {
    category: "Đổi trả",
    question: "Tôi có thể đổi trả hàng không?",
    answer: "Có. Bạn có thể xem chi tiết tại trang Chính sách đổi trả của chúng tôi.",
  },
  {
    category: "Tài khoản",
    question: "Làm sao để tôi đổi mật khẩu?",
    answer: "Bạn có thể truy cập phần 'Tài khoản của tôi', chọn mục 'Đổi mật khẩu' và làm theo hướng dẫn.",
  },
];

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-neutral-100 py-10">
      <Helmet>
        <title>Shopee At Home | CÂU HỎI THƯỜNG GẶP</title>
      </Helmet>
      <div className="container max-w-3xl">
        <h1 className="mb-8 text-center text-3xl font-medium uppercase">Câu hỏi thường gặp (FAQ)</h1>

        <div className="mb-6 rounded-sm bg-white p-6 shadow-sm">
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            className="w-full rounded-sm border border-gray-300 p-3 outline-none focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-sm bg-white shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left font-medium transition-colors hover:text-primary focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <span className="text-xl font-bold text-gray-400">{openIndex === index ? "-" : "+"}</span>
                </button>
                {openIndex === index && (
                  <div className="border-t border-gray-100 p-5 pt-0 leading-relaxed text-gray-600">
                    <span className="mb-2 inline-block rounded-sm bg-gray-100 px-2 py-1 text-xs">{faq.category}</span>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-gray-500">
              Không tìm thấy câu hỏi nào phù hợp với từ khóa &quot;{searchTerm}&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
