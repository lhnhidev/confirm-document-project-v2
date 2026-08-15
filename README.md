# Hệ Thống Quản Lý & Thẩm Định Minh Chứng Sư Phạm (Confirm Documents App)

Hệ thống quản lý, nộp, theo dõi tiến độ và thẩm định minh chứng đánh giá chuẩn nghề nghiệp dành cho Giáo viên, Tổ trưởng/Tổ phó chuyên môn và Ban Giám Hiệu các trường THPT.

---

## 📁 Cấu Trúc Dự Án (Monorepo)

Dự án được cấu trúc theo mô hình npm workspaces:

```text
confirm-documents-app/
├── apps/
│   ├── backend/            # Express.js API Server (Port: 5000)
│   │   ├── src/
│   │   │   ├── db/         # Kết nối MongoDB Atlas & Seed dữ liệu mẫu
│   │   │   ├── models/     # Mongoose Schemas (User, Evidence, Field...)
│   │   │   ├── routes/     # API routes (auth, evidences, fields...)
│   │   │   └── index.ts    # File khởi chạy server Backend
│   │   └── package.json
│   │
│   └── frontend/web/       # React 19 + Vite + Mantine + Tailwind (Port: 3000)
│       ├── src/
│       │   ├── components/ # Các components dùng chung (Header, Contact...)
│       │   ├── pages/      # Giao diện Teacher, Department Head, School Board...
│       │   ├── services/   # Gọi REST API backend (authApi, evidenceApi)
│       │   └── types/      # Định nghĩa TypeScript Types & Enums
│       └── package.json
│
├── .env.example            # Mẫu file cấu hình biến môi trường
├── package.json            # Quản lý script chung toàn bộ Monorepo
└── README.md
```

---

## ⚙️ Yêu Cầu Hệ Thống

- **Node.js**: Phiên bản `>= 18.0.0` (khuyên dùng Node.js LTS 20+)
- **NPM**: Phiên bản `>= 9.0.0` (hoặc Yarn / Bun / PNPM)
- **MongoDB**: MongoDB Atlas (Cloud) hoặc MongoDB Server cài đặt cục bộ

---

## 🛠️ Hướng Dẫn Cài Đặt & Cấu Hình

### 1. Clone Source Code
```bash
git clone <repository-url>
cd confirm-documents-app
```

### 2. Cài Đặt Dependencies
Cài đặt toàn bộ dependencies cho cả thư mục gốc, backend và frontend:
```bash
npm install
```

### 3. Cấu Hình Biến Môi Trường (`.env`)
Tạo file `.env` tại thư mục gốc của dự án (copy từ `.env.example`):
```bash
cp .env.example .env
```

Nội dung file `.env` mẫu:
```env
# Kết nối MongoDB Atlas (để trống nếu muốn chạy Mock/Offline fallback)
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# Cổng dịch vụ
PORT=3000
BACKEND_PORT=5000

# Cấu hình Cloudflare R2 Storage (tùy chọn lưu trữ file minh chứng)
CLOUDFLARE_R2_TOKEN=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_ENDPOINT=
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_BUCKET_NAME=
CLOUDFLARE_R2_PUBLIC_DOMAIN=
```

---

## 🚀 Hướng Dẫn Khởi Chạy Dự Án

### Cách 1: Khởi chạy đồng thời cả Backend & Frontend (Khuyên dùng)
Tại thư mục gốc, chạy lệnh:
```bash
npm run dev
```
> Lệnh này sẽ sử dụng `concurrently` để chạy:
> - **Backend API**: `http://localhost:5000`
> - **Frontend Web**: `http://localhost:3000` (Vite dev server có cấu hình proxy tự động chuyển tiếp `/api` sang backend `5000`)

---

### Cách 2: Khởi chạy riêng lẻ từng dịch vụ

#### Chạy Backend riêng:
```bash
npm run dev:backend
# hoặc:
npm run dev --workspace=apps/backend
```
Server backend sẽ chạy tại: **`http://localhost:5000`**

#### Chạy Frontend riêng:
```bash
npm run dev:frontend
# hoặc:
npm run dev --workspace=apps/frontend/web
```
Giao diện người dùng sẽ chạy tại: **`http://localhost:3000`**

---

## 👥 Danh Sách Tài Khoản Mẫu Để Đăng Nhập & Thử Nghiệm

Hệ thống đã nạp sẵn danh sách người dùng mẫu tương ứng với 4 cấp độ phân quyền.
**Mật khẩu mặc định cho tất cả tài khoản mẫu là:** `123`

| Vai trò | Họ và tên | Email đăng nhập | Tổ / Bộ phận | Mật khẩu |
| :--- | :--- | :--- | :--- | :--- |
| **Ban Giám Hiệu (Hiệu trưởng)** | Dư Quốc Kiệt | `duquockiet@gmail.com` | Ban Giám Hiệu | `123` |
| **Ban Giám Hiệu (Hiệu phó)** | Lâm Văn Hùng | `lamvanhungdtnt@gmail.com` | Ban Giám Hiệu | `123` |
| **Tổ trưởng Chuyên môn** | Lê Phú Quốc | `phuoc.ipebl@gmail.com` | Tổ Tổng Hợp | `123` |
| **Tổ trưởng Chuyên môn** | Châu Vương Anh Hùng | `chauvuonganhhung@gmail.com` | Tổ Ngoại Ngữ | `123` |
| **Tổ phó Chuyên môn** | Danh Sung | `danhsung1991@gmail.com` | Tổ Tổng Hợp | `123` |
| **Tổ phó Chuyên môn** | Nguyễn Thị Yến | `thiyennguyen1981@gmail.com` | Tổ Tự Nhiên | `123` |
| **Giáo viên** | Lê Thị Ngọc Hơn | `lethingochon.dtnt@gmail.com` | Tổ Tổng Hợp (Tin học) | `123` |
| **Giáo viên** | Tống Thị Tuyết Huệ | `ttthuedtnt@gmail.com` | Tổ Tổng Hợp (QPAN) | `123` |

---

## 📦 Build Cho Môi Trường Production

Để build bản đóng gói tối ưu hóa cho Frontend:
```bash
npm run build
```
File tĩnh sau khi build sẽ được tạo trong thư mục `apps/frontend/web/dist/`.

---

## 🔍 Kiểm Tra Mã Nguồn (Linter)
```bash
npm run lint
```
