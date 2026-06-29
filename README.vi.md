[English](README.md) · **Tiếng Việt**

# Shopee Clone

> Ứng dụng web thương mại điện tử full-stack lấy cảm hứng từ Shopee — xây dựng bằng React + TypeScript ở phía giao diện và REST API Express + MongoDB ở phía máy chủ.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%207-47A248?logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

Kho mã này gồm hai ứng dụng:

- **Giao diện (Front end)** — ứng dụng SPA React 18 + TypeScript dựng bằng Vite, nằm ở thư mục gốc (`src/`).
- **Máy chủ (Back end)** — REST API viết bằng TypeScript với Express và Mongoose/MongoDB, nằm trong thư mục `server/`.

---

## ✨ Tính năng

Các tính năng dưới đây phản ánh đúng các module có thật trong mã nguồn (trang/API phía front-end và route/controller phía back-end).

- **Xác thực & tài khoản** — đăng ký, đăng nhập, đăng xuất, quên mật khẩu, JWT access/refresh token, phân quyền theo vai trò (role) và xử lý khóa tài khoản.
- **Danh mục sản phẩm** — danh sách sản phẩm với tìm kiếm, sắp xếp, lọc và phân trang; trang chi tiết sản phẩm với hiệu ứng phóng to ảnh khi hover, carousel và mô tả dạng HTML (WYSIWYG).
- **Phân loại (Categories)** — duyệt và lọc sản phẩm theo danh mục.
- **Giỏ hàng & đơn mua** — thêm vào giỏ và CRUD giỏ hàng đầy đủ, theo dõi trạng thái đơn mua.
- **Thanh toán & đơn hàng** — tạo đơn hàng và quản lý đơn, theo dõi trạng thái đơn.
- **Thanh toán (mô phỏng)** — endpoint xác nhận thanh toán kiểu IPN mô phỏng callback của cổng thanh toán (dự kiến thay bằng webhook thật của VNPay/Momo khi lên production).
- **Đánh giá & xếp hạng** — đánh giá sản phẩm gắn với đơn đã mua.
- **Danh sách yêu thích (Wishlist)** — lưu/bỏ sản phẩm yêu thích.
- **Voucher & khuyến mãi** — mã giảm giá và các chương trình khuyến mãi.
- **Địa chỉ** — quản lý địa chỉ giao hàng của người dùng (kèm API tra cứu địa giới).
- **Hồ sơ người dùng** — cập nhật thông tin, tải ảnh đại diện, đổi mật khẩu.
- **Thông báo** — thông báo cho người dùng.
- **Liên hệ** — biểu mẫu liên hệ / tin nhắn hỗ trợ.
- **Cửa hàng (Store)** — các endpoint liên quan đến cửa hàng.
- **Trang quản trị (Admin)** — các endpoint quản trị và khu vực quản trị riêng trong giao diện.
- **Đa ngôn ngữ (i18n)** — giao diện đa ngôn ngữ qua i18next.
- **SEO** — quản lý thẻ head động bằng React Helmet.
- **Phát triển component** — Storybook để phát triển component độc lập.

---

## 🛠️ Công nghệ sử dụng

### Giao diện (Front end)
- **React 18** + **TypeScript**
- **Vite 4** (công cụ build & dev server)
- **Tailwind CSS 3** (+ `@tailwindcss/line-clamp`, `prettier-plugin-tailwindcss`)
- **React Router 6** (định tuyến)
- **TanStack React Query 4** (quản lý state bất đồng bộ) + React Context (state cục bộ)
- **React Hook Form 7** + **Yup** + `@hookform/resolvers` (biểu mẫu & kiểm tra dữ liệu)
- **Axios** (gọi HTTP)
- **i18next** / **react-i18next** (đa ngôn ngữ)
- **React Helmet Async** (SEO / thẻ head)
- **Framer Motion** (hiệu ứng), **Swiper** (carousel), **Recharts** (biểu đồ)
- **Immer**, **Lodash**, **classnames**, **DOMPurify**, **html-to-text**, **React Toastify**
- **Storybook 7** (phát triển component)
- **Vitest** (kiểm thử)
- **ESLint** + **Prettier**

### Máy chủ (Back end)
- **Node.js** + **Express 4** + **TypeScript**
- **MongoDB** qua **Mongoose 7**
- **JSON Web Tokens** (`jsonwebtoken`) cho xác thực
- **bcrypt** (băm mật khẩu)
- **Multer** (tải lên tệp/hình ảnh)
- **Helmet** (header bảo mật), **CORS**, **express-rate-limit**
- **dotenv** (cấu hình biến môi trường)
- **ts-node** + **nodemon** (môi trường phát triển)

---

## 🚀 Bắt đầu

Đây là dự án gồm hai phần: **front end** (thư mục gốc) và **back end** (`server/`) chạy như hai tiến trình riêng biệt khi phát triển.

### Yêu cầu trước
- **Node.js** (khuyến nghị v18+)
- Một trình quản lý gói: **yarn**, **npm**, hoặc **pnpm**
- **MongoDB** chạy cục bộ (hoặc một chuỗi kết nối MongoDB)

### 1. Clone kho mã

```bash
git clone https://github.com/AnhPham0411/shopee-datn-1.git
cd shopee-datn-1
```

### 2. Máy chủ (API)

```bash
cd server
npm install
# tạo file server/.env (xem mục Cấu hình bên dưới)
npm run dev      # khởi động API với nodemon + ts-node
```

Mặc định API lắng nghe ở cổng `PORT` trong `server/.env` (mặc định `4000` nếu không đặt) và kết nối tới `MONGODB_URI` (mặc định `mongodb://localhost:27017/shopee-clone` nếu không đặt).

> Có sẵn endpoint `GET /health` để kiểm tra nhanh tình trạng máy chủ.

### 3. Giao diện (SPA)

Từ thư mục gốc, trong một cửa sổ terminal khác:

```bash
# yarn
yarn
# hoặc npm
npm install
# hoặc pnpm
pnpm install

# tạo file .env (xem mục Cấu hình bên dưới)
npm run dev      # khởi động Vite tại http://localhost:3001
```

Để mở dev server cho các thiết bị khác trong mạng truy cập:

```bash
yarn dev --host
```

### 4. Build cho production

```bash
# Giao diện (từ thư mục gốc)
npm run build      # tsc + vite build  → xuất ra dist/
npm run preview    # xem thử bản build production cục bộ

# Máy chủ (từ thư mục server/)
npm run build      # tsc → xuất ra server/dist/
npm start          # node dist/index.js
```

---

## ⚙️ Cấu hình

Các biến môi trường **không** được commit vào kho mã. Hãy tạo các file dưới đây và điền giá trị của riêng bạn. **Tuyệt đối không commit secret thật.**

### Giao diện — `.env` (thư mục gốc)
Xem `.env.example` để biết mẫu.

| Biến        | Mô tả                                                    |
| ----------- | -------------------------------------------------------- |
| `VITE_API`  | URL gốc của API back-end mà SPA sẽ gọi tới.              |

### Máy chủ — `server/.env`

| Biến                 | Mô tả                                                                    |
| -------------------- | ------------------------------------------------------------------------ |
| `PORT`               | Cổng máy chủ API lắng nghe (mặc định `4000` nếu không đặt).               |
| `MONGODB_URI`        | Chuỗi kết nối MongoDB (mặc định DB cục bộ nếu không đặt).                 |
| `JWT_SECRET`         | Khóa bí mật dùng để ký access token.                                     |
| `JWT_REFRESH_SECRET` | Khóa bí mật dùng để ký refresh token.                                    |
| `CLIENT_URL`         | (Tùy chọn) Origin của front-end được CORS cho phép (mặc định localhost). |

> Cấu hình CORS của máy chủ còn cho phép `http://localhost:3001`, `http://localhost:5173` và `http://localhost:3000` để phục vụ phát triển cục bộ.

---

## 📁 Cấu trúc dự án

```
shopee-at-home-main/
├── index.html              # Điểm vào HTML của Vite
├── vite.config.ts          # Cấu hình Vite (dev server cổng 3001)
├── tailwind.config.cjs     # Cấu hình Tailwind
├── tsconfig.json           # Cấu hình TypeScript phía front-end
├── .env.example            # Mẫu biến môi trường front-end
├── .storybook/             # Cấu hình Storybook
├── public/                 # Tài nguyên tĩnh (logo, ...)
├── src/                    # Mã nguồn front-end
│   ├── main.tsx            # Khởi tạo ứng dụng
│   ├── App.tsx             # Component gốc
│   ├── apis/               # Client API dùng Axios (auth, product, cart, order, ...)
│   ├── assets/             # Hình ảnh & tài nguyên tĩnh
│   ├── components/         # Component UI tái sử dụng
│   ├── constants/          # Enum & cấu hình (path, mã trạng thái, ...)
│   ├── contexts/           # Các React Context provider
│   ├── hooks/              # Custom hook
│   ├── i18n/               # Tài nguyên đa ngôn ngữ
│   ├── layouts/            # Bố cục trang
│   ├── pages/              # Các trang theo route (Login, ProductList, Cart, Checkout, User, Admin, ...)
│   ├── routes/             # Định nghĩa route (useRouteElements)
│   ├── schemas/            # Schema kiểm tra dữ liệu Yup
│   ├── stories/            # Story cho Storybook
│   ├── types/              # Kiểu TypeScript dùng chung
│   └── utils/              # Hàm tiện ích
└── server/                 # Mã nguồn back-end
    ├── tsconfig.json
    ├── package.json
    └── src/
        ├── index.ts        # Điểm vào Express, gắn route, kết nối DB
        ├── controllers/    # Xử lý route (auth, product, order, payment, ...)
        ├── models/         # Model Mongoose (User, Product, Order, Purchase, ...)
        ├── routes/         # Các router Express
        ├── middlewares/    # auth.middleware (requireAuth, requireRole)
        ├── utils/          # Tiện ích jwt
        ├── seed.ts         # Khởi tạo dữ liệu mẫu
        ├── import_data.ts  # Nhập dữ liệu
        └── export_data.ts  # Xuất dữ liệu
```

---

## 📜 Các lệnh có sẵn

### Giao diện (thư mục gốc)

| Lệnh                      | Mô tả                                            |
| ------------------------- | ------------------------------------------------ |
| `npm run dev`             | Khởi động Vite dev server (cổng 3001).           |
| `npm run build`           | Kiểm tra kiểu (`tsc`) và build cho production.   |
| `npm run preview`         | Xem thử bản build production cục bộ.             |
| `npm run test`            | Chạy unit test với Vitest.                        |
| `npm run coverage`        | Chạy test kèm báo cáo coverage.                  |
| `npm run lint`            | Kiểm tra `src/` bằng ESLint.                      |
| `npm run lint:fix`        | Kiểm tra và tự sửa.                               |
| `npm run prettier`        | Kiểm tra định dạng.                              |
| `npm run prettier:fix`    | Tự động định dạng.                               |
| `npm run storybook`       | Khởi động Storybook ở cổng 6006.                 |
| `npm run build-storybook` | Build Storybook tĩnh.                            |

### Máy chủ (`server/`)

| Lệnh              | Mô tả                                                  |
| ----------------- | ------------------------------------------------------ |
| `npm run dev`     | Khởi động API ở chế độ watch (nodemon + ts-node).      |
| `npm run build`   | Biên dịch TypeScript ra `dist/`.                       |
| `npm start`       | Chạy bản đã biên dịch (`node dist/index.js`).          |

---

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh. Để đóng góp:

1. Fork kho mã và tạo một nhánh tính năng.
2. Tuân theo phong cách code hiện có — chạy `npm run lint` và `npm run prettier` trước khi commit.
3. Mở pull request mô tả các thay đổi của bạn.

---

## 📄 Giấy phép

Dự án này nhằm mục đích học tập/portfolio (đồ án tốt nghiệp). Kho mã chưa kèm file giấy phép cụ thể; nếu muốn tái sử dụng, vui lòng liên hệ tác giả. MIT được đề xuất làm mặc định.

---

<p align="center">Thực hiện với ❤️ như một đồ án tốt nghiệp — ứng dụng thương mại điện tử lấy cảm hứng từ Shopee.</p>
