# 📐 KẾ HOẠCH BỔ SUNG TÍNH NĂNG — Shopee At Home

> Phạm vi: **đồ án tốt nghiệp** (monolith, không tách microservices). 5 tính năng phụ trợ cần thiết.
> Nguyên tắc: ưu tiên đúng logic + demo được, tránh over-engineering.

---

## Tổng quan & thứ tự ưu tiên

| # | Tính năng | Độ khó | File chạm | Phụ thuộc |
|---|---|---|---|---|
| 1 | Sổ địa chỉ + Tỉnh/Huyện/Xã | TB | ~8 | — |
| 2 | Chi tiết đơn hàng | Thấp | ~4 | — |
| 3 | Thông báo (Notification) | TB | ~7 | — |
| 4 | Quên mật khẩu (OTP đơn giản) | Thấp-TB | ~5 | — |
| 5 | Thanh toán online (mock/test) | TB | ~6 | #2 nên có trước |

**Thứ tự đề xuất:** 2 → 1 → 5 → 3 → 4 (làm cái nền & dễ trước, rồi đến cái phụ thuộc).

---

## Tính năng 1 — Sổ địa chỉ + chọn Tỉnh/Huyện/Xã

### Backend
- **Model `User`**: thêm mảng `addresses[]`:
  ```ts
  addresses: [{
    _id, fullName, phone,
    province, district, ward,   // tên + (mã nếu cần)
    detail,                     // số nhà, đường
    isDefault: boolean
  }]
  ```
  Giữ field `address: string` cũ để tương thích (hoặc migrate dữ liệu seed). Quy tắc: chỉ 1 địa chỉ `isDefault=true`.
- **API mới** (`user.controller.ts` + `user.routes.ts`):
  - `GET /user/addresses` — danh sách
  - `POST /user/addresses` — thêm (nếu là địa chỉ đầu tiên → tự set default)
  - `PUT /user/addresses/:id` — sửa
  - `DELETE /user/addresses/:id` — xóa (không cho xóa nếu chỉ còn 1? hoặc cho, rồi bỏ default)
  - `PUT /user/addresses/:id/default` — đặt mặc định (bỏ default các cái khác)
  - Mọi API kiểm `address thuộc user` (chống IDOR).

### Frontend
- **Data tĩnh**: thêm file `src/constants/vietnam-locations.json` (Tỉnh→Huyện→Xã). Dùng bộ dữ liệu đơn vị hành chính VN (tải sẵn, không gọi API ngoài).
- **Component** `AddressSelector` (cascading 3 dropdown Tỉnh/Huyện/Xã).
- **Trang quản lý địa chỉ** trong User (`/user/addresses`): list + thêm/sửa/xóa + chọn mặc định.
- **Checkout**: thay ô text bằng **khối hiển thị địa chỉ đã chọn** + nút "Thay đổi" → modal chọn từ sổ địa chỉ (hoặc thêm mới). Mặc định lấy địa chỉ `isDefault`.
- **API client** `address.api.ts`.

### Tiêu chí đạt
- ✅ Lưu nhiều địa chỉ, chọn mặc định, không phải gõ lại khi mua.
- ✅ Checkout lấy đúng địa chỉ chọn; `shippingAddress` gửi lên là chuỗi ghép đầy đủ.

---

## Tính năng 2 — Chi tiết đơn hàng

### Backend
- **API** `GET /orders/:id` (`order.controller.ts`):
  - Kiểm quyền: chủ đơn / Admin / Store-sở-hữu-item (chống IDOR — hiện đang THIẾU endpoint này).
  - Trả đầy đủ: items (snapshot tên/ảnh/giá), địa chỉ giao, recipient, phí ship, discount, voucher, tổng tiền, trạng thái, mốc thời gian.

### Frontend
- **Trang** `OrderDetail` route `/user/order/:id`.
- Link "Xem chi tiết" từ `OrderHistory`.
- Hiển thị timeline trạng thái đơn (1→2→3→4 hoặc 5).

### Tiêu chí đạt
- ✅ Bấm vào đơn xem được chi tiết; người khác không xem được đơn không phải của mình.

---

## Tính năng 3 — Thông báo (Notification)

### Backend
- **Model mới `Notification`**: `{ user, type, title, message, link, isRead, createdAt }`.
- **Tạo thông báo** tại các sự kiện:
  - Đơn đổi trạng thái (trong `updateOrderStatus`) → thông báo cho buyer.
  - Có đơn mới → thông báo cho seller.
  - (tùy) Voucher mới công khai.
- **API** (`notification.controller.ts` + routes):
  - `GET /notifications` (phân trang nhẹ) + số chưa đọc.
  - `PUT /notifications/:id/read`, `PUT /notifications/read-all`.

### Frontend
- **Chuông thông báo** ở Navbar + badge số chưa đọc + dropdown danh sách.
- Bấm vào → đánh dấu đã đọc + điều hướng tới `link` (vd chi tiết đơn).
- Polling đơn giản (refetch mỗi ~30s) — **không** dùng WebSocket (tránh over-engineering).

### Tiêu chí đạt
- ✅ Khi seller đổi trạng thái đơn → buyer thấy thông báo + badge tăng.

---

## Tính năng 4 — Quên mật khẩu (OTP đơn giản)

### Backend
- **Model `User`**: thêm `resetOtp`, `resetOtpExpires`.
- **API** (`auth.controller.ts`):
  - `POST /auth/forgot-password` `{email}` → tạo OTP 6 số, hạn 10 phút, "gửi".
    - **Gửi mail thật** (nodemailer + Gmail app password) **HOẶC** chế độ dev: trả OTP trong response/log để demo. → Chọn lúc làm.
  - `POST /auth/reset-password` `{email, otp, newPassword}` → verify OTP còn hạn → hash mật khẩu mới → xóa OTP.
  - Rate-limit để chống spam OTP.

### Frontend
- Trang `ForgotPassword` (nhập email) → `ResetPassword` (nhập OTP + mật khẩu mới).
- Link "Quên mật khẩu?" ở trang Login.

### Tiêu chí đạt
- ✅ Reset được mật khẩu qua OTP; OTP sai/hết hạn → báo lỗi.

---

## Tính năng 5 — Thanh toán online (MOCK / test, không cổng thật)

> Yêu cầu: "test thôi không cần thật quá" → **mô phỏng** luồng cổng thanh toán để minh hoạ kiến trúc, KHÔNG cần key VNPay/Momo thật.

### Backend
- Tận dụng field `paymentStatus` có sẵn ở `Order` (`pending/paid/failed`).
- **API**:
  - Khi checkout chọn "Thanh toán online" → tạo order `paymentStatus: 'pending'`, trả về `paymentUrl` (trỏ tới trang mock).
  - `POST /payment/mock-callback` `{orderId, result}` → cập nhật `paymentStatus = 'paid' | 'failed'` (mô phỏng IPN/callback của cổng thật).

### Frontend
- Trang `PaymentMock` (`/payment/:orderId`): hiển thị thông tin đơn + 2 nút **"Thanh toán thành công"** / **"Hủy/Thất bại"** (mô phỏng người dùng thao tác trên cổng).
- Sau khi bấm → gọi callback → điều hướng về trang kết quả (thành công/thất bại).
- COD vẫn giữ nguyên như cũ.

### Tiêu chí đạt
- ✅ Demo được trọn vòng: chọn thanh toán online → trang cổng (mock) → callback → đơn cập nhật `paid`.
- ✅ Giải thích được "production sẽ thay trang mock bằng VNPay/Momo thật" (ghi vào hướng phát triển).

---

## ⛔ KHÔNG làm (over-engineering cho đồ án)

- ❌ Microservices thật (tách service, API gateway, message queue) — giữ monolith.
- ❌ WebSocket realtime cho thông báo/chat — polling là đủ.
- ❌ Tích hợp cổng thanh toán thật với chữ ký bảo mật đầy đủ — mock là đủ minh hoạ.
- ❌ Chat buyer-seller, return/refund workflow, product variants.

---

## Ước lượng & cách triển khai

- Mỗi tính năng làm thành **1 commit riêng** (dễ chấm, dễ rollback).
- Sau mỗi tính năng: typecheck + tự kiểm tiêu chí đạt.
- Ước tính: mỗi tính năng ~30–60 phút code. Tổng ~3–5 giờ.

### Thứ tự thực thi
1. **Chi tiết đơn hàng** (nền, dễ, bổ luôn endpoint còn thiếu)
2. **Sổ địa chỉ + Tỉnh/Huyện/Xã**
3. **Thanh toán online (mock)**
4. **Thông báo**
5. **Quên mật khẩu**
