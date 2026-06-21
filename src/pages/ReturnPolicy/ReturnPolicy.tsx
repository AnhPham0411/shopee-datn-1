import { Helmet } from "react-helmet-async";

export default function ReturnPolicy() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-10">
      <Helmet>
        <title>Shopee At Home | Chính sách đổi trả</title>
      </Helmet>
      <div className="container max-w-4xl">
        <h1 className="mb-8 text-center text-3xl font-medium uppercase">Chính sách đổi trả</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="sticky top-6 rounded-sm bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-lg font-medium">Mục lục</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <button
                    onClick={() => scrollTo("dieu-kien")}
                    className="w-full text-left hover:text-primary"
                  >
                    1. Điều kiện đổi trả
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("thoi-gian")}
                    className="w-full text-left hover:text-primary"
                  >
                    2. Thời gian áp dụng
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("chi-phi")}
                    className="w-full text-left hover:text-primary"
                  >
                    3. Chi phí đổi trả
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("quy-trinh")}
                    className="w-full text-left hover:text-primary"
                  >
                    4. Quy trình đổi trả
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("hoan-tien")}
                    className="w-full text-left hover:text-primary"
                  >
                    5. Chính sách hoàn tiền
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="space-y-8 rounded-sm bg-white p-8 leading-relaxed text-gray-700 shadow-sm">
              <section id="dieu-kien">
                <h2 className="mb-4 text-xl font-medium text-black">1. Điều kiện đổi trả</h2>
                <p>Sản phẩm được chấp nhận đổi trả khi đáp ứng đủ các điều kiện sau:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Sản phẩm còn nguyên vẹn, đầy đủ nhãn mác, nguyên đai kiện, seal (nếu có).</li>
                  <li>
                    Sản phẩm chưa qua sử dụng, giặt ủi, không bị dơ bẩn, hư hỏng bởi những tác nhân bên ngoài sau khi
                    mua hàng.
                  </li>
                  <li>Có đầy đủ hóa đơn mua hàng, phụ kiện, quà tặng kèm theo (nếu có).</li>
                  <li>Sản phẩm không thuộc danh mục hạn chế/không hỗ trợ đổi trả.</li>
                </ul>
              </section>

              <section id="thoi-gian">
                <h2 className="mb-4 text-xl font-medium text-black">2. Thời gian áp dụng</h2>
                <p>
                  Thời gian tối đa để yêu cầu đổi/trả sản phẩm là <strong>7 ngày</strong> kể từ ngày nhận hàng thành
                  công (dựa trên hệ thống của đơn vị vận chuyển).
                </p>
              </section>

              <section id="chi-phi">
                <h2 className="mb-4 text-xl font-medium text-black">3. Chi phí đổi trả</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    <strong>Miễn phí vận chuyển:</strong> Nếu lỗi phát sinh từ nhà sản xuất, hàng giao sai quy cách, sai
                    mẫu mã hoặc bể vỡ do vận chuyển.
                  </li>
                  <li>
                    <strong>Khách hàng chịu phí:</strong> Nếu đổi trả do nhu cầu cá nhân (đổi size, đổi màu, không
                    thích...).
                  </li>
                </ul>
              </section>

              <section id="quy-trinh">
                <h2 className="mb-4 text-xl font-medium text-black">4. Quy trình đổi trả</h2>
                <ol className="mt-2 list-decimal space-y-2 pl-5">
                  <li>
                    <strong>Bước 1:</strong> Liên hệ với Bộ phận CSKH qua Hotline hoặc Email trong thời gian quy định.
                    Cung cấp mã đơn hàng và hình ảnh sản phẩm.
                  </li>
                  <li>
                    <strong>Bước 2:</strong> Sau khi được xác nhận, đóng gói sản phẩm cẩn thận (kèm hóa đơn và quà tặng
                    nếu có).
                  </li>
                  <li>
                    <strong>Bước 3:</strong> Gửi sản phẩm về địa chỉ kho của Shopee theo hướng dẫn của CSKH.
                  </li>
                  <li>
                    <strong>Bước 4:</strong> Shopee nhận hàng, kiểm tra và tiến hành đổi sản phẩm mới hoặc hoàn tiền
                    theo yêu cầu.
                  </li>
                </ol>
              </section>

              <section id="hoan-tien">
                <h2 className="mb-4 text-xl font-medium text-black">5. Chính sách hoàn tiền</h2>
                <p>
                  Đối với đơn hàng đã thanh toán trước (Chuyển khoản, Thẻ, Ví điện tử), tiền sẽ được hoàn lại qua phương
                  thức quý khách đã thanh toán trong vòng <strong>3 - 5 ngày làm việc</strong> sau khi chúng tôi nhận và
                  kiểm tra xong hàng đổi trả.
                </p>
                <p className="mt-2">
                  Đối với đơn hàng COD, chúng tôi sẽ yêu cầu quý khách cung cấp số tài khoản ngân hàng để chuyển khoản
                  hoàn tiền.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
