# 🔍 BÁO CÁO AUDIT & DANH SÁCH TASK CÒN LẠI — Shopee At Home

> **Phạm vi: mức ĐỒ ÁN TỐT NGHIỆP** (không phải production — tránh over-engineering).
> Cập nhật sau khi đợt fix đầu (Antigravity) đã chạy. Phần này = **kết quả duyệt lại độc lập** (đọc code thật, kiểm đối nghịch) + **task còn phải làm**.

---

## 0. Trạng thái hiện tại

| Hạng mục | Kết quả |
|---|---|
| Typecheck server (`tsc --noEmit`) | ✅ pass |
| Đợt fix đầu | ✅ Giải quyết ~80% vấn đề gốc, chất lượng tốt |
| Còn lại | 🔴 5 task phải sửa + 🟡 3 task nên sửa (đều nhẹ) |

---

## 1. ✅ ĐÃ FIX & ĐÃ KIỂM CHỨNG (không cần làm lại)

- ✅ Trừ tồn kho `quantity` + tăng `sold` khi đặt hàng, có check đủ hàng.
- ✅ Voucher áp vào đơn: nhận `voucherCode`, validate `isActive`/hạn/lượt/min-order, tính discount từ giá DB, kẹp ≤ tổng đơn, tăng `used_count`.
- ✅ Flash sale áp `flash_price` khi mua (theo thời gian active).
- ✅ IDOR đơn hàng cơ bản: chỉ chủ đơn / Admin / Store-sở-hữu được đổi trạng thái.
- ✅ `createVoucher` validate `title` + percent ≤ 100; `applyVoucher` check `isActive`.
- ✅ Product list/detail/recommend/suggest lọc `status:'active'`.
- ✅ `createReview` validate rating số nguyên [1,5] + chống đánh giá trùng.
- ✅ `register` validate email + password ≥ 6.
- ✅ Mass-assignment: `createStoreProduct`/`updateStoreProduct` whitelist field (không set được `sold/rating/seller`).
- ✅ `deleteCategory` chặn khi còn sản phẩm.
- ✅ `toggleLockUser` chặn admin tự khóa.
- ✅ Doanh thu store/admin tính theo `status:4` (hoàn thành) — khớp FE.

---

## 2. 🔴 TASK PHẢI SỬA (lỗi sẽ lộ khi demo / phản biện) — ưu tiên cao

### TASK-1: Khách không xác nhận được "Đã nhận hàng" (3→4)
**Lỗi:** BE chặn buyer ở mọi chuyển trạng thái ≠ hủy, nhưng FE có nút "Đã nhận được hàng" gửi `status=4` → luôn trả **403**.
**File:** [order.controller.ts:225](server/src/controllers/order.controller.ts#L225) ↔ [OrderHistory.tsx:167](src/pages/User/OrderHistory/OrderHistory.tsx#L167)
**Cách sửa (BE):** cho phép buyer chuyển `3 → 4` (đã nhận), ngoài quyền hủy hiện có.
```ts
// Trong nhánh buyer của updateOrderStatus:
const isCancel = Number(status) === 5 && order.status === 1;       // hủy khi đang chờ
const isConfirmReceived = Number(status) === 4 && order.status === 3; // xác nhận đã nhận
if (!isCancel && !isConfirmReceived) {
  return res.status(403).json({ message: 'Bạn chỉ được hủy đơn chờ xác nhận hoặc xác nhận đã nhận hàng' });
}
```
**Tiêu chí đạt:** ✅ Đơn ở status 3, buyer bấm "Đã nhận" → status thành 4, không 403.

---

### TASK-2: FE hiện nút "Hủy" ở status 2 nhưng BE chỉ cho hủy status 1
**Lỗi:** Bấm Hủy ở đơn "chuẩn bị hàng" (status 2) → BE trả **400** (không nhất quán FE/BE).
**File:** [OrderHistory.tsx:149](src/pages/User/OrderHistory/OrderHistory.tsx#L149) ↔ [order.controller.ts:228](server/src/controllers/order.controller.ts#L228)
**Cách sửa:** thống nhất 1 quy tắc. Đề xuất **chỉ cho hủy khi status 1** → sửa FE chỉ hiện nút Hủy khi `order.status === 1` (gỡ status 2 khỏi điều kiện).
**Tiêu chí đạt:** ✅ Nút Hủy chỉ xuất hiện đúng trạng thái BE cho phép; không còn bấm ra lỗi.

---

### TASK-3: `shippingFee` vẫn tin client (claim "N1 đã fix" — chưa thực sự)
**Lỗi:** Server tính `calculatedShippingFee` đúng rồi **ghi đè bằng giá client** nếu client gửi `shippingFee >= 0` → gửi `shippingFee: 0` để né phí ship.
**File:** [order.controller.ts:27](server/src/controllers/order.controller.ts#L27)
**Cách sửa:** bỏ hẳn ưu tiên giá client, luôn dùng giá server tính.
```ts
const shippingFee = calculatedShippingFee; // bỏ điều kiện client override
```
**Tiêu chí đạt:** ✅ Đổi `shippingFee` trong request không ảnh hưởng tổng tiền lưu DB.

---

### TASK-4: Bỏ `email` khách khỏi populate ở đơn của Store (claim "đã bỏ" — chưa)
**Lỗi:** Store vẫn thấy email khách hàng (PII không cần thiết).
**File:** [store.controller.ts:164](server/src/controllers/store.controller.ts#L164)
**Cách sửa:** `.populate('user', 'name address phone')` (bỏ `email`).
**Tiêu chí đạt:** ✅ Response đơn hàng phía Store không chứa email buyer.

---

### TASK-5: Sửa comment mã trạng thái trong model (đang sai, gây hiểu nhầm)
**Lỗi:** Comment cũ ghi `4=đã hủy` trong khi hệ thống đã dùng `4=hoàn thành, 5=hủy`.
**File:** [Order.ts:28](server/src/models/Order.ts#L28) và [Purchase.ts:17](server/src/models/Purchase.ts#L17)
**Cách sửa:** cập nhật comment:
```ts
// status: 1=chờ xác nhận, 2=chuẩn bị hàng, 3=đang giao, 4=hoàn thành, 5=đã hủy
```
**Tiêu chí đạt:** ✅ Comment khớp logic runtime & nhãn FE.

---

## 3. 🟡 TASK NÊN SỬA (rẻ, chắc logic) — làm nếu còn thời gian

### TASK-6: Validate `status` + chặn double-restock khi đổi trạng thái
**Lỗi:** `admin/store updateOrderStatus` không kiểm `status` hợp lệ → set `status=99` được; admin "hồi sinh" đơn `5→1→5` sẽ **cộng kho 2 lần**.
**File:** [admin.controller.ts:190](server/src/controllers/admin.controller.ts#L190) · [order.controller.ts:233](server/src/controllers/order.controller.ts#L233)
**Cách sửa:** whitelist `status ∈ {1,2,3,4,5}`; **không cho chuyển ra khỏi trạng thái cuối** (đã hủy `5` / hoàn thành `4` thì không đổi nữa).
```ts
if (![1,2,3,4,5].includes(Number(status))) return res.status(400).json({ message: 'Status không hợp lệ' });
if (order.status === 5 || order.status === 4) return res.status(400).json({ message: 'Đơn đã kết thúc, không thể đổi trạng thái' });
```
**Tiêu chí đạt:** ✅ Không set được status lạ; ✅ không cộng kho lần 2.

---

### TASK-7: Chặn admin khóa admin khác
**Lỗi:** `toggleLockUser` mới chặn tự khóa, chưa chặn khóa admin khác.
**File:** [admin.controller.ts:103](server/src/controllers/admin.controller.ts#L103)
**Cách sửa:**
```ts
if (targetUser.roles.includes('Admin')) return res.status(403).json({ message: 'Không thể khóa tài khoản Admin' });
```
**Tiêu chí đạt:** ✅ Khóa user role Admin → 403.

---

### TASK-8: Lưu `voucherId` vào Order + hoàn `used_count` khi hủy
**Lỗi:** Hủy đơn hoàn kho product nhưng không hoàn lượt voucher; order không lưu `voucherId` nên không truy ngược được.
**File:** order.controller.ts (createOrder ~158-171, updateOrderStatus ~267)
**Cách sửa:** khi tạo order set `order.voucherId = voucher._id`; khi hủy (status→5) nếu có `voucherId` thì `$inc used_count: -1`.
**Tiêu chí đạt:** ✅ Hủy đơn dùng voucher → `used_count` giảm lại đúng.

---

## 4. ⛔ KHÔNG LÀM cho đồ án (over-engineering — chỉ ghi vào "hướng phát triển")

| Bỏ qua | Lý do |
|---|---|
| ❌ MongoDB transaction / rollback đa-document | Cần replica set, khó demo localhost |
| ❌ Atomic update chống race 2 người mua sản phẩm cuối | Vấn đề tải cao, ngoài phạm vi đồ án |
| ❌ Voucher `scope/seller/storeId` enforcement | Tính năng nâng cao |
| ❌ Kẹp flash-sale theo `stock_limit`, check `starts_at` voucher | Edge case hiếm |
| ❌ Redis blacklist token, refresh rotation, httpOnly cookie | Production auth |
| ❌ Aggregation tối ưu N+1, phân trang toàn bộ list | Data nhỏ, không cần |

> **Lưu ý 1 ngoại lệ rẻ (tùy chọn):** lỗi "đơn dở dang khi 1 item hết hàng giữa chừng" có thể fix **không cần transaction** — validate hết tất cả item *trước* (loop chỉ đọc), rồi mới ghi (trừ kho/tạo Purchase). Nếu muốn chắc chắn, làm thêm bước này.

---

## 5. 🎯 Checklist nghiệm thu (sau khi làm 🔴 + 🟡)

- [ ] Khách xác nhận "đã nhận hàng" (3→4) chạy được — không 403 (TASK-1)
- [ ] Nút Hủy chỉ hiện đúng trạng thái cho phép — không 400 (TASK-2)
- [ ] Đổi `shippingFee` trong request không thay đổi tổng tiền (TASK-3)
- [ ] Đơn phía Store không lộ email buyer (TASK-4)
- [ ] Comment status model khớp thực tế (TASK-5)
- [ ] Không set được status lạ; không cộng kho 2 lần (TASK-6)
- [ ] Không khóa được admin khác (TASK-7)
- [ ] Hủy đơn hoàn lại lượt voucher (TASK-8)

---

## 6. Thứ tự đề xuất

1. **TASK-1, TASK-2** — đồng bộ FE/BE trạng thái đơn (lỗi demo lộ ngay).
2. **TASK-3, TASK-4, TASK-5** — sửa nhẹ, dứt điểm 2 claim chưa làm + comment.
3. **TASK-6, TASK-7, TASK-8** — gia cố logic nếu còn thời gian.

> Ước tính toàn bộ 8 task: **~2–3 giờ code**, gói trong ~5 file (`order.controller.ts`, `admin.controller.ts`, `store.controller.ts`, `Order.ts`, `OrderHistory.tsx`).

---

*Báo cáo duyệt lại độc lập (đọc code thật + kiểm đối nghịch). Mọi task kèm `file:line` và tiêu chí đạt để dễ kiểm.*
