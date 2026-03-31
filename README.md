<p align="center">
  <img src="https://raw.githubusercontent.com/expo/expo/main/docs/public/static/images/expo-logo.png" width="80" alt="Expo Logo"/>
</p>

<h1 align="center">🎬 FilmBox - Dịch vụ Streaming Điện Ảnh</h1>

<p align="center">
  <b>React Native (Expo) - Redux Toolkit - React Query - TypeScript</b>
</p>

<p align="center">
  <i>Dự án phát triển ứng dụng di động xem phim đa nền tảng (iOS & Android) cung cấp trải nghiệm giải trí mượt mà chuẩn điện ảnh.</i>
</p>

---

## 🌟 Chức Năng Nổi Bật (Features)

*   **🎬 Trải Nghiệm Mượt Mà:** Sử dụng thư viện `react-native-reanimated` và Carousel tối ưu hóa 60fps. Cảm giác vuốt mượt mà như Netflix.
*   **📡 Phân Trang & Load Nhanh:** Ứng dụng tích hợp `react-query` xử lý fetch data tự động với "Lazy Loading", tích hợp caching để sử dụng offline-first.
*   **🔒 Bảo Mật & Xác Thực:** Hệ thống Auth JWT toàn diện (Login, Register, OTP Recovery) kết hợp Social Login qua Google/Facebook.
*   **💳 Thanh Toán & Membership:** Cổng tích hợp VNPay và hệ thống VIP Membership tự động cập nhật Database qua Webhook.
*   **⚡ Hiệu Năng Vượt Trội:** Xử lý `FlatList` nâng cao (removeClippedSubviews, batching rendering). Quản lý ram ổn định khi xem danh sách hàng nghìn phim.

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Phân hệ | Công nghệ |
| :--- | :--- |
| **Framework UI** | React Native (Expo v54) / TypeScript Core |
| **Routing & Navigation** | Expo Router / React Navigation v7 |
| **State Management** | Redux Toolkit (`@reduxjs/toolkit`) |
| **Data Fetching/Caching** | TanStack React Query (`@tanstack/react-query`) |
| **API Client** | Axios (Kết nối Gateway `phimapi.com`) |
| **Media Player** | WebView / Expo AV / Animated Slider |

## 🚀 Hướng Dẫn Cài Đặt (Getting Started)

### 1. Yêu cầu hệ thống (Prerequisites)
Bạn cần cài đặt các phần mềm sau trước khi bắt đầu:
- [Node.js](https://nodejs.org/en/) (phiên bản v18.0.0 trở lên)
- [Git](https://git-scm.com/)
- [Expo Go App](https://expo.dev/client) (Cài đặt trên cả iOS hoặc Android)
- Thiết bị giả lập Android Studio hoặc Xcode (Nếu chạy trên PC)

### 2. Cài đặt chi tiết (Installation)

Cloning repository về máy:
```bash
git clone https://github.com/Film-Box-2026/Frontend-App-Public.git
cd Frontend-App-Public
```

Cài đặt các gói thư viện Node.js:
```bash
npm install
```

### 3. Phân chia Môi trường & Khởi chạy (Run the App)

Chạy ứng dụng bằng Expo CLI với mạng LAN cục bộ:
```bash
npx expo start --lan
```
*Hướng camera điện thoại qua ứng dụng **Expo Go** để quét mã QR (Android) hoặc Quẹt Camera (iOS).*

---

## 📂 Kiến Trúc Thư Mục (Folder Structure)

Chúng tôi ứng dụng kiến trúc **Feature-First / Atomic** để dễ dàng maintain mã nguồn:

```text
filmbox-app/
├── app/                  # (Expo Router) Entry point của toàn ứng dụng
├── assets/               # Chứa Font chữ, Hình ảnh tĩnh, Vector Icon
├── components/           # Các component dùng chung (Button, Header, Loading...)
├── constants/            # Các giá trị cố định (Colors theme, Config constants)
├── hooks/                # Custom React Hooks (useColorScheme, useDebounce...)
├── pages/                # Logic UI cho các trang chính (Home, Cinema, Login...)
├── providers/            # Redux Provider, Query Client Provider cấu hình bọc App
├── services/             # API hook layer (Axios instances, vnpay config)
└── store/                # Nơi cấu hình Global State của Redux Toolkit
```

## 👥 Nhóm Phát Triển (Team Members)
Dự án được xây dựng bởi **Nhóm 3**:
1. **Nguyễn Đình Quang Vinh** - System Architect
2. **Đoàn Hoàng Quân** - Performance & List Features
3. **Nguyễn Viết Đức** - Media Flow & Detail UI
4. **Lục Tiến Đạt** - Auth Security & Profiles
5. **Phạm Khắc Đô** - Payment Service & Notifications

---
> ⚠️ **Lưu ý:** Xin vui lòng không commit trực tiếp vào nhánh `main`. Hãy tạo Pull Request mới hoặc tuân thủ nhánh phát triển của từng cá nhân.
