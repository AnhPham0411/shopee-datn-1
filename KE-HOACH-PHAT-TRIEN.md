# KẾ HOẠCH PHÁT TRIỂN — Shopee At Home

> Mục tiêu: hoàn thiện đủ **16 điểm khung yêu cầu** + **2 tính năng đề xuất**, theo hướng **Backend riêng hoàn toàn** (Express + MongoDB) và **4 role** (Vãng lai / User / Store / Admin).

---

## 0. Quyết định kiến trúc (chốt)

| Hạng mục | Quyết định |
|---|---|
| Dữ liệu / Backend | **Tự xây backend riêng** (Node + Express + TypeScript + MongoDB/Mongoose), thay thế hoàn toàn `api-ecom.duthanhduoc.com` |
| Số role | **4 role**: `Guest` (vãng lai) · `User` · `Store` (seller) · `Admin` |
| Tương thích | Backend mới **giữ nguyên contract cũ** (cùng path, cùng envelope `{ message, data }`, cùng `access_token`/`refresh_token`/`roles[]`) → frontend hiện tại gần như không phải sửa phần product/cart/auth |
| Frontend | Trỏ `VITE_API` + `config.baseURL` sang backend mới; tái sử dụng tối đa code có sẵn |

**Tech stack backend đề xuất:**
- Express + TypeScript, MongoDB + Mongoose
- JWT (access + refresh token) — `bcrypt` cho mật khẩu
- `multer` + lưu file (local `/uploads` hoặc Cloudinary) cho ảnh/video
- `zod` hoặc `express-validator` để validate
- Giữ response envelope khớp `TSuccessApiResponse<T> = { message: string; data: T }`

**Quy ước "Definition of Done" chung cho mọi task:**
- `npm run lint` và `npm run build` (tsc) không lỗi.
- Không có lỗi đỏ trong console trình duyệt khi chạy luồng liên quan.
- Có ít nhất 1 cách kiểm chứng thủ công ghi trong mục **✅ Pass khi**.

---

## 1. Bản đồ 16 điểm khung → trạng thái → Phase

| # | Yêu cầu khung | Hiện trạng | Phase phụ trách |
|---|---|---|---|
| 1 | Hình ảnh & video độ phân giải cao | ⚠️ Có ảnh + zoom, thiếu video | **P2** |
| 2 | Ưu đãi mới nhất | ❌ | **P2** |
| 3 | Gợi ý sản phẩm liên quan | ✅ (nâng cấp cá nhân hóa) | **P2** |
| 4 | Tùy chọn thanh toán & vận chuyển | ❌ | **P6** |
| 5 | Nhận xét & đánh giá sản phẩm | ⚠️ Chỉ hiển thị điểm | **P4** |
| 6 | Trang FAQ | ❌ | **P7** |
| 7 | Trang hỗ trợ & liên hệ | ❌ | **P7** |
| 8 | Trang chính sách đổi trả | ❌ | **P7** |
| 9 | Bảo mật trang web | ⚠️ Cơ bản | **P10** |
| 10 | Lọc & tìm kiếm nâng cao | ✅ (mở rộng) | **P3** |
| 11 | Giỏ hàng & sản phẩm yêu thích | ⚠️ Cart ✅, Wishlist ❌ | **P5** |
| 12 | Thân thiện với người dùng | ✅ (đánh bóng) | **P11** |
| 13 | Thân thiện với di động | ✅ (đánh bóng) | **P11** |
| 14 | Liên kết mạng xã hội | ❌ | **P7** |
| 15 | Admin thống kê doanh thu | ❌ | **P9** |
| 16 | 4 role (vãng lai/user/store/admin) | ❌ (mới 2 trạng thái) | **P1 + P8 + P9** |

---

## PHASE 0 — Dọn dẹp & nền tảng

### T0.1 — Xử lý thư mục lồng trùng lặp
- **Mục tiêu:** loại bỏ thư mục `shopee-at-home-main/` lồng bên trong (bản duplicate), giữ 1 bản gốc duy nhất.
- **Việc làm:** so sánh 2 bản; nếu giống hệt, xóa thư mục con lồng. Xác định đường dẫn làm việc chính là root project.
- **✅ Pass khi:**
  1. Chỉ còn 1 cây `src/` trong project.
  2. `npm install && npm run dev` chạy bình thường, web mở được ở `localhost:3000`.

### T0.2 — Khởi tạo backend skeleton
- **Mục tiêu:** dựng project backend chạy được "hello world".
- **Việc làm:** tạo thư mục `server/` (Express + TS + Mongoose), kết nối MongoDB, cấu hình CORS cho frontend, `.env` (DB URI, JWT secrets), script `dev`/`build`/`start`.
- **✅ Pass khi:**
  1. `GET /health` trả `200 { status: "ok" }`.
  2. Server kết nối MongoDB thành công (log xác nhận), restart không lỗi.

### T0.3 — Đồng bộ contract & cấu hình FE↔BE
- **Mục tiêu:** frontend gọi được backend mới.
- **Việc làm:** đặt `VITE_API` = URL backend mới; cập nhật `config.baseURL`; xác nhận envelope `{ message, data }` khớp `TSuccessApiResponse`.
- **✅ Pass khi:**
  1. Mở Network tab: request từ FE đi tới backend mới (không còn gọi `duthanhduoc.com`).
  2. Không có lỗi CORS.

---

## PHASE 1 — Backend core + Auth 4 role (nền cho #16)

### T1.1 — Models cơ bản
- **Mục tiêu:** định nghĩa schema MongoDB.
- **Việc làm:** `User` (thêm `roles: ['User'|'Store'|'Admin']`, `storeId?`), `Category`, `Product` (thêm `video?`, `seller`/`storeId`, `status`), `Purchase/Order`. Giữ field khớp `TUser`, `TProduct`, `TPurchase` ở FE.
- **✅ Pass khi:**
  1. Tạo bản ghi mẫu mỗi model qua script seed, đọc lại đúng shape FE đang dùng (`_id`, `images[]`, `price`, `rating`, `category{_id,name}`...).

### T1.2 — Auth tương thích contract cũ + role
- **Mục tiêu:** đăng ký/đăng nhập/refresh giữ nguyên contract, có role.
- **Việc làm:** `/register`, `/login`, `/logout`, `/refresh-access-token`, `/me` trả `{ access_token, refresh_token, expires, user }`. Đăng ký User mặc định role `User`. Có luồng đăng ký/đăng ký nâng cấp role `Store`. Middleware `requireAuth` + `requireRole`.
- **✅ Pass khi:**
  1. Đăng ký + đăng nhập trên FE hiện tại hoạt động **không sửa code FE auth**.
  2. Token hết hạn → cơ chế refresh token trong `http.ts` tự động hoạt động (request cũ được retry).
  3. Gọi 1 endpoint yêu cầu role Admin bằng tài khoản User → trả `403`.

### T1.3 — API sản phẩm/danh mục/giỏ hàng tương thích
- **Mục tiêu:** thay thế nguồn dữ liệu cũ, FE chạy nguyên vẹn.
- **Việc làm:** implement `GET /products` (đủ params: `page,limit,sort_by,order,price_min,price_max,rating_filter,category,name,exclude`), `GET /products/:id`, `GET /categories`, `/purchases/*`. Seed ≥ 50 sản phẩm + ảnh thật + vài category.
- **✅ Pass khi:**
  1. Trang chủ hiển thị danh sách, phân trang, filter, sort, search — **tất cả hoạt động như cũ** trên dữ liệu backend mới.
  2. Thêm vào giỏ / cập nhật số lượng / xóa / mua hàng đều chạy.

---

## PHASE 2 — Media HD + Ưu đãi + Gợi ý (#1, #2, #3)

### T2.1 — Video độ phân giải cao cho sản phẩm
- **Mục tiêu:** sản phẩm hỗ trợ video bên cạnh ảnh HD.
- **Việc làm:** thêm field `video` vào `Product`; gallery ở `ProductDetails.tsx` render slide video (thẻ `<video controls>` hoặc embed) chung với Swiper ảnh; ảnh dùng `loading="lazy"` + `srcset` nếu có nhiều kích thước.
- **✅ Pass khi:**
  1. Mở 1 sản phẩm có video → slide đầu phát được video, các slide sau là ảnh.
  2. Ảnh đủ nét khi zoom hover; không vỡ layout mobile.

### T2.2 — Ưu đãi / Flash Sale mới nhất
- **Mục tiêu:** khu vực "ưu đãi mới nhất" trên trang chủ.
- **Việc làm:** model `Promotion` (sản phẩm, % giảm, thời gian bắt đầu/kết thúc); `GET /promotions/active`; component `FlashSale` ở đầu `ProductList` với đồng hồ đếm ngược + thanh "đã bán".
- **✅ Pass khi:**
  1. Trang chủ hiển thị banner Flash Sale với ít nhất 4 sản phẩm đang giảm giá + đồng hồ đếm ngược chạy.
  2. Khi hết giờ khuyến mãi → sản phẩm trở lại giá gốc (test bằng cách đặt mốc thời gian ngắn).

### T2.3 — Gợi ý sản phẩm cá nhân hóa
- **Mục tiêu:** nâng cấp "sản phẩm liên quan" thành gợi ý theo hành vi.
- **Việc làm:** lưu lịch sử xem (recently viewed) ở backend/localStorage; `GET /products/recommendations` (cùng category + đã xem + bán chạy); thêm khối "Có thể bạn thích" ở trang chủ và trang chi tiết.
- **✅ Pass khi:**
  1. Sau khi xem vài sản phẩm cùng nhóm, khối gợi ý ưu tiên hiển thị sản phẩm cùng category.
  2. Trang chi tiết vẫn hiển thị "sản phẩm liên quan" như cũ (không regression).

---

## PHASE 3 — Lọc & tìm kiếm nâng cao (#10) ✅

### T3.1 — Bộ lọc nâng cao ✅
- **Mục tiêu:** lọc mạnh hơn hiện tại.
- **Việc làm:** thêm lọc đa tiêu chí: nhiều category, còn hàng/hết hàng, có giảm giá, theo shop; UI chip filter đang áp dụng + nút bỏ từng filter. Mở rộng `AsideFilter.tsx`.
- **✅ Pass khi:**
  1. Chọn nhiều bộ lọc cùng lúc → URL phản ánh đúng query, kết quả khớp.
  2. Mỗi filter đang áp dụng hiển thị dạng chip, bấm X gỡ đúng filter đó.

### T3.2 — Tìm kiếm gợi ý (autocomplete) ✅
- **Mục tiêu:** ô search thông minh hơn.
- **Việc làm:** `GET /products/suggest?q=` (debounce); dropdown gợi ý tên sản phẩm + từ khóa gần đây (localStorage). Nâng cấp `useSearchProducts`.
- **✅ Pass khi:**
  1. Gõ ≥ 2 ký tự → dropdown gợi ý xuất hiện trong < 500ms, bấm vào điều hướng đúng.
  2. Từ khóa đã tìm được lưu và hiện lại khi focus ô trống.


---

## PHASE 4 — Nhận xét & đánh giá (#5) ✅

### T4.1 — Backend review ✅
- **Mục tiêu:** lưu đánh giá gắn với sản phẩm + người mua.
- **Việc làm:** model `Review` (productId, userId, rating 1–5, comment, images?, createdAt); `POST /products/:id/reviews` (chỉ user **đã mua**), `GET /products/:id/reviews` (phân trang + lọc theo số sao); tự tính lại `rating` trung bình của product.
- **✅ Pass khi:**
  1. User chưa mua → không gửi được review (`403`).
  2. Gửi review hợp lệ → `rating` trung bình của sản phẩm cập nhật lại.

### T4.2 — UI đánh giá ở trang chi tiết ✅
- **Mục tiêu:** xem + viết đánh giá.
- **Việc làm:** section "Đánh giá sản phẩm" dưới mô tả: phân bố sao, danh sách review (avatar, tên, sao, ngày, nội dung, ảnh), bộ lọc theo sao, form viết review (chỉ hiện với người đã mua).
- **✅ Pass khi:**
  1. Hiển thị danh sách review thật từ backend, lọc theo số sao hoạt động.
  2. Người đã mua gửi review → xuất hiện ngay trong danh sách (sau invalidate query).

---

## PHASE 5 — Giỏ hàng & Yêu thích (#11) ✅

### T5.1 — Wishlist backend + UI ✅
- **Mục tiêu:** thêm/bỏ sản phẩm yêu thích.
- **Việc làm:** model `Wishlist` (userId, productId[]); `GET/POST/DELETE /wishlist`; nút trái tim trên card `Product` và trang chi tiết; trang `/user/wishlist`.
- **✅ Pass khi:**
  1. Bấm tim trên 1 sản phẩm (đã đăng nhập) → vào `/user/wishlist` thấy sản phẩm đó; bấm lại để gỡ.
  2. Khách vãng lai bấm tim → được nhắc đăng nhập.

### T5.2 — Tinh chỉnh giỏ hàng ✅
- **Mục tiêu:** sửa các điểm chưa mượt hiện có.
- **Việc làm:** kiểm tra & sửa lỗi `draft[productIndex].disabled === true;` (so sánh thừa, không gán) trong `Cart.tsx`; thêm trạng thái loading khi cập nhật số lượng; xác nhận trước khi xóa.
- **✅ Pass khi:**
  1. Tăng/giảm số lượng phản hồi mượt, không nhảy số sai.
  2. Xóa sản phẩm có hộp xác nhận; tổng tiền luôn khớp với các item đang chọn.

---

## PHASE 6 — Thanh toán & Vận chuyển (#4) ✅

### T6.1 — Backend đơn hàng + địa chỉ ✅
- **Mục tiêu:** mô hình đơn hàng đầy đủ.
- **Việc làm:** mở rộng `Order` (items, địa chỉ giao, phương thức vận chuyển, phí ship, phương thức thanh toán, trạng thái: `chờ xác nhận → đang giao → hoàn thành → đã hủy`); `Address` của user; endpoints checkout & cập nhật trạng thái.
- **✅ Pass khi:**
  1. Đặt 1 đơn → đơn lưu kèm địa chỉ + phương thức ship + phương thức thanh toán + tổng tiền (gồm phí ship).
  2. Trạng thái đơn đổi được và phản ánh trong `OrderHistory`.

### T6.2 — Luồng checkout nhiều bước (FE) ✅
- **Mục tiêu:** trang thanh toán đúng nghĩa.
- **Việc làm:** trang `/checkout`: (1) chọn/nhập địa chỉ, (2) chọn vận chuyển (Nhanh/Tiết kiệm/Hỏa tốc — phí khác nhau), (3) chọn thanh toán (COD / chuyển khoản / ví — demo), (4) xem lại & đặt hàng. Nút "Mua hàng" ở Cart dẫn sang đây.
- **✅ Pass khi:**
  1. Đi hết 4 bước từ giỏ hàng → tạo đơn thành công → chuyển sang trang "đặt hàng thành công".
  2. Thay đổi phương thức vận chuyển làm tổng tiền cập nhật đúng.
  3. Thiếu địa chỉ → chặn bước tiếp theo kèm thông báo.

---

## PHASE 7 — Trang tĩnh + Social (#6, #7, #8, #14) ✅

### T7.1 — Trang FAQ ✅
- **Việc làm:** route `/faq`, accordion câu hỏi thường gặp (đặt hàng, thanh toán, vận chuyển, đổi trả, tài khoản); có ô tìm trong FAQ.
- **✅ Pass khi:** mở `/faq`, click 1 câu → mở/đóng đáp án; tìm từ khóa lọc đúng danh sách câu hỏi.

### T7.2 — Trang Hỗ trợ & Liên hệ ✅
- **Việc làm:** route `/contact`, form (tên, email, nội dung) gửi về `POST /contact` (lưu DB hoặc gửi mail), kèm thông tin hotline/email/bản đồ.
- **✅ Pass khi:** gửi form hợp lệ → thông báo thành công + bản ghi liên hệ được lưu; bỏ trống trường bắt buộc → báo lỗi validate.

### T7.3 — Trang Chính sách đổi trả ✅
- **Việc làm:** route `/return-policy`, nội dung chính sách rõ ràng, mục lục nhảy nhanh.
- **✅ Pass khi:** mở `/return-policy` hiển thị đầy đủ nội dung; link ở footer trỏ tới đúng trang.

### T7.4 — Liên kết mạng xã hội + hoàn thiện Footer ✅
- **Việc làm:** thêm icon + link Facebook/Instagram/YouTube/TikTok vào `Footer.tsx`; thêm cụm link điều hướng tới FAQ/Liên hệ/Chính sách.
- **✅ Pass khi:** footer hiển thị các icon MXH (mở tab mới, có `rel="noreferrer"`) + link tới 3 trang tĩnh trên, hoạt động ở cả mobile.

---

## PHASE 8 — Store / Seller dashboard (#16 phần Store) ✅

### T8.1 — Đăng ký & không gian Store ✅
- **Mục tiêu:** user trở thành Store, có khu quản lý riêng.
- **Việc làm:** luồng "Đăng ký bán hàng" (nâng role lên `Store`, tạo `Store` profile); layout `/store/*` chỉ cho role Store; `requireRole('Store')`.
- **✅ Pass khi:**
  1. User đăng ký bán hàng → role thành `Store`, truy cập được `/store`.
  2. Tài khoản User thường vào `/store` → bị chặn/redirect.

### T8.2 — Quản lý sản phẩm của shop (CRUD) ✅
- **Việc làm:** `/store/products`: tạo/sửa/xóa sản phẩm (tên, giá, mô tả, ảnh, video, kho, category); chỉ thao tác trên sản phẩm thuộc shop mình.
- **✅ Pass khi:**
  1. Store tạo sản phẩm mới → xuất hiện ở trang chủ và ở danh sách của shop.
  2. Store A không sửa/xóa được sản phẩm của Store B (`403`).

### T8.3 — Đơn hàng & doanh thu của shop ✅
- **Việc làm:** `/store/orders` (đơn chứa sản phẩm của shop, đổi trạng thái giao hàng); `/store/dashboard` (doanh thu shop theo ngày/tháng, số đơn, sản phẩm bán chạy).
- **✅ Pass khi:**
  1. Khi có người mua sản phẩm của shop → đơn hiện trong `/store/orders`.
  2. Dashboard hiển thị tổng doanh thu shop khớp với tổng các đơn hoàn thành.

---

## PHASE 9 — Admin dashboard & thống kê doanh thu (#15, #16 phần Admin) ✅

### T9.1 — Khu vực Admin ✅
- **Việc làm:** layout `/admin/*` cho role `Admin`; menu: Tổng quan, Người dùng, Cửa hàng, Sản phẩm, Đơn hàng.
- **✅ Pass khi:** chỉ Admin vào được `/admin`; role khác bị chặn.

### T9.2 — Thống kê doanh thu ✅
- **Việc làm:** `GET /admin/stats` (doanh thu theo ngày/tuần/tháng, tổng đơn, người dùng mới, top sản phẩm/shop); trang `/admin/dashboard` với biểu đồ (line/bar) + thẻ số liệu. Dùng thư viện chart (vd `recharts`).
- **✅ Pass khi:**
  1. Dashboard hiển thị biểu đồ doanh thu theo thời gian + ít nhất 4 thẻ KPI.
  2. Số liệu khớp dữ liệu thật (đối chiếu tổng đơn hoàn thành trong DB).

### T9.3 — Quản trị người dùng / cửa hàng / sản phẩm ✅
- **Việc làm:** bảng danh sách + tìm kiếm + phân trang; khóa/mở user; duyệt/khóa shop; gỡ sản phẩm vi phạm.
- **✅ Pass khi:**
  1. Admin khóa 1 user → user đó không đăng nhập được.
  2. Admin gỡ 1 sản phẩm → sản phẩm biến mất khỏi trang chủ.

---

## PHASE 10 — Bảo mật (#9) ✅

### T10.1 — Bảo mật backend ✅
- **Việc làm:** `helmet`, rate-limit cho `/login`/`/register`, validate toàn bộ input, hash mật khẩu `bcrypt`, kiểm tra phân quyền ở **mọi** route nhạy cảm, giới hạn loại/dung lượng file upload, không trả thông tin nhạy cảm trong error.
- **✅ Pass khi:**
  1. Spam sai mật khẩu vượt ngưỡng → bị chặn tạm thời (`429`).
  2. Gọi API của role khác bằng token sai quyền luôn trả `403` (kiểm thử ≥ 3 endpoint).
  3. Upload file > giới hạn hoặc sai định dạng → bị từ chối.

### T10.2 — Bảo mật frontend ✅
- **Việc làm:** rà soát toàn bộ `dangerouslySetInnerHTML` đã bọc `DOMPurify`; cân nhắc chuyển token sang cách lưu an toàn hơn / thêm cảnh báo; ẩn route theo role; thêm trang `403`.
- **✅ Pass khi:**
  1. Nội dung mô tả/đánh giá có chèn `<script>` → không thực thi (đã sanitize).
  2. Truy cập thẳng URL `/admin` khi không đủ quyền → ra trang `403`/redirect, không lộ UI.

---

## PHASE 11 — Thân thiện người dùng & di động (#12, #13) ✅

### T11.1 — Trải nghiệm người dùng ✅
- **Việc làm:** skeleton loading cho danh sách/chi tiết; empty state nhất quán; thông báo lỗi rõ ràng; nút back-to-top; giữ scroll khi đổi trang filter.
- **✅ Pass khi:**
  1. Khi tải dữ liệu hiện skeleton (không nhảy layout).
  2. Mọi trang danh sách rỗng đều có empty state + hành động gợi ý.

### T11.2 — Tối ưu di động & accessibility ✅
- **Việc làm:** rà toàn bộ trang ở breakpoint 360–414px; menu/giỏ hàng/checkout dùng tốt 1 tay; kiểm tra `aria-label`, focus state, tương phản màu; chạy Lighthouse.
- **✅ Pass khi:**
  1. Không có tràn ngang ở màn 375px trên các trang chính (chủ, chi tiết, giỏ, checkout, store, admin).
  2. Lighthouse Mobile: Performance ≥ 80, Accessibility ≥ 90.

---

## PHASE 12 — 2 tính năng đề xuất nổi bật

### ⭐ Đề xuất B — Voucher / Mã giảm giá + Flash Sale đếm ngược ✅
- **Ý tưởng:** hệ thống mã giảm giá rất "Shopee": Admin/Store tạo voucher (theo %, theo số tiền, đơn tối thiểu, hạn dùng); user nhập mã ở checkout; gắn với Flash Sale đếm ngược thời gian thực.
- **Việc làm:** model `Voucher`; `POST /vouchers/apply` (kiểm tra hợp lệ, trừ tiền); ô nhập mã ở `/checkout`; trang quản lý voucher cho Store/Admin.
- **✅ Pass khi:**
  1. Nhập voucher hợp lệ ở checkout → tổng tiền giảm đúng công thức; voucher hết hạn/không đủ điều kiện → báo lỗi rõ ràng.
  2. Voucher có giới hạn lượt dùng → hết lượt thì không áp dụng được nữa.

> *Có thể chọn 1 trong 2, hoặc làm cả hai. Gợi ý ưu tiên: A (gây ấn tượng, hiện đại) hoặc B (sát nghiệp vụ e-commerce).*

---

## 2. Lộ trình & thứ tự ưu tiên

| Thứ tự | Phase | Lý do | Ước lượng |
|---|---|---|---|
| 1 | P0, P1 | Nền tảng — mọi thứ phụ thuộc | Lớn |
| 2 | P2, P3 | Hoàn thiện trải nghiệm xem/mua cốt lõi | Vừa |
| 3 | P4, P5, P6 | Nghiệp vụ chính (review, wishlist, checkout) | Lớn |
| 4 | P7 | Trang tĩnh — nhanh, tăng độ hoàn thiện | Nhỏ |
| 5 | P8, P9 | Store + Admin — phần "nặng" nhưng là điểm nhấn | Lớn |
| 6 | P10, P11 | Bảo mật + đánh bóng UX (xuyên suốt, chốt cuối) | Vừa |
| 7 | P12 | Tính năng điểm nhấn | Vừa |

**Phụ thuộc chính:** P1 mở khóa tất cả; P6 cần P1+P5; P8/P9 cần P1+P6; P12-B cần P6.

---

## 3. Rủi ro & lưu ý

- **Mất dữ liệu API gốc:** vì thay backend, cần seed đủ sản phẩm/category để web không trống. → T1.3 seed ≥ 50 sản phẩm.
- **Tương thích contract:** giữ đúng envelope `{ message, data }` và tên field, nếu lệch sẽ vỡ nhiều chỗ FE. → kiểm thử regression sau P1.
- **Upload ảnh/video:** chọn sớm local vs Cloudinary; video nặng cần giới hạn dung lượng.
- **Thư mục lồng (T0.1):** xử lý trước khi code để tránh sửa nhầm bản.
- **Claude API (P12-A):** cần API key + giới hạn chi phí; để key ở backend, không lộ ra FE.

---

*Tài liệu này là kế hoạch tổng. Mỗi Phase nên được tách thành các task nhỏ hơn khi bắt tay làm, và cập nhật trạng thái ✅/⬜ trực tiếp tại đây.*
