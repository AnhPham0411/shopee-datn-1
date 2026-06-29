import React from "react";

const SeoFooter = () => {
  return (
    <div className="border-t-4 border-primary bg-white dark:bg-gray-900 pt-10 pb-8 mt-10">
      <div className="container">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-8 space-y-4">
          <h2 className="font-bold text-gray-700 dark:text-gray-300">SHOPEE - GÌ CŨNG CÓ, MUA HẾT Ở SHOPEE</h2>
          <p>
            Shopee - ứng dụng mua sắm trực tuyến thú vị, tin cậy, an toàn và miễn phí! Shopee là một trong những nền tảng giao dịch trực tuyến hàng đầu ở Đông Nam Á. Với sự đảm bảo của Shopee, bạn sẽ mua hàng trực tuyến an tâm và nhanh chóng hơn bao giờ hết!
          </p>
          <h2 className="font-bold text-gray-700 dark:text-gray-300 mt-4">MUA SẮM VÀ BÁN HÀNG ONLINE ĐƠN GIẢN, NHANH CHÓNG VÀ AN TOÀN</h2>
          <p>
            Nếu bạn đang tìm kiếm một trang web để mua và bán hàng trực tuyến thì Shopee là một sự lựa chọn tuyệt vời dành cho bạn. Shopee là trang thương mại điện tử cho phép người mua và người bán tương tác và trao đổi dễ dàng thông tin về sản phẩm và chương trình khuyến mãi của shop. Do đó, việc mua bán trên Shopee trở nên nhanh chóng và đơn giản hơn.
          </p>
          <p>
            Bên cạnh đó, Shopee hợp tác với nhiều đơn vị vận chuyển uy tín trên thị trường nhằm cung cấp dịch vu giao nhận và vận chuyển tiện lợi cho cả khách hàng và người bán. Cùng với nhiều ưu đãi với chi phí giao hàng hợp lý, Shopee đảm bảo cho khách hàng trải nghiệm mua sắm thuận tiện.
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-4">Danh Mục</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div>
              <h3 className="font-bold text-gray-600 dark:text-gray-300 mb-2">Thời Trang Nam</h3>
              <ul className="space-y-1">
                <li><a href="#" className="hover:text-primary">Áo Khoác</a></li>
                <li><a href="#" className="hover:text-primary">Áo Vest và Blazer</a></li>
                <li><a href="#" className="hover:text-primary">Áo Hoodie, Áo Len</a></li>
                <li><a href="#" className="hover:text-primary">Quần Jeans</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-600 dark:text-gray-300 mb-2">Thời Trang Nữ</h3>
              <ul className="space-y-1">
                <li><a href="#" className="hover:text-primary">Chân váy</a></li>
                <li><a href="#" className="hover:text-primary">Quần jeans</a></li>
                <li><a href="#" className="hover:text-primary">Đầm/Váy</a></li>
                <li><a href="#" className="hover:text-primary">Áo khoác, Vest</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-600 dark:text-gray-300 mb-2">Điện Thoại & Phụ Kiện</h3>
              <ul className="space-y-1">
                <li><a href="#" className="hover:text-primary">Điện thoại</a></li>
                <li><a href="#" className="hover:text-primary">Máy tính bảng</a></li>
                <li><a href="#" className="hover:text-primary">Pin Dự Phòng</a></li>
                <li><a href="#" className="hover:text-primary">Ốp lưng, bao da</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-600 dark:text-gray-300 mb-2">Đồng Hồ</h3>
              <ul className="space-y-1">
                <li><a href="#" className="hover:text-primary">Đồng Hồ Nam</a></li>
                <li><a href="#" className="hover:text-primary">Đồng Hồ Nữ</a></li>
                <li><a href="#" className="hover:text-primary">Đồng Hồ Trẻ Em</a></li>
                <li><a href="#" className="hover:text-primary">Phụ Kiện Đồng Hồ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-600 dark:text-gray-300 mb-2">Balo & Túi Ví Nam</h3>
              <ul className="space-y-1">
                <li><a href="#" className="hover:text-primary">Ba Lô Nam</a></li>
                <li><a href="#" className="hover:text-primary">Ba Lô Laptop Nam</a></li>
                <li><a href="#" className="hover:text-primary">Túi & Cặp Đựng</a></li>
                <li><a href="#" className="hover:text-primary">Ví Cầm Tay Nam</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeoFooter;
