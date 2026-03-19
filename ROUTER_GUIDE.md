# Router Configuration - Hướng dẫn sử dụng

## 📋 Tóm tắt thay đổi

Dự án đã được refactor từ **state-based navigation** sang **file-based routing** với **Expo Router + Tabs Navigation**. Đây là cách tối ưu được khuyến nghị.

## 🏗️ Cấu trúc router mới

```
app/
├── _layout.tsx          # Root layout (Stack)
├── modal.tsx           # Modal screen
└── (tabs)/
    ├── _layout.tsx     # Tab layout (Tabs Navigator)
    ├── index.tsx       # Home tab
    ├── series.tsx      # Series tab
    ├── tvshows.tsx     # TV Shows tab
    ├── cartoon.tsx     # Cartoon tab
    └── cinema.tsx      # Cinema tab
```

## ✅ Ưu điểm của cách làm mới

1. **File-based Routing**: Mỗi file trong `app/` tự động trở thành một route
2. **Type-safe Navigation**: Dễ navigate giữa các screen với Expo Router
3. **Deep Linking**: Tự động hỗ trợ deep linking (vd: `app://home`, `app://series`)
4. **Back Button Handling**: Tự động xử lý back button
5. **Performance**: Tối ưu hơn vì không cần render tất cả page cùng lúc
6. **Dễ bảo trì**: Thêm tab mới = tạo file mới, không cần edit `_layout.tsx`

## 📱 Cách hoạt động

### 1. Root Layout (`app/_layout.tsx`)

- Cung cấp Theme Provider và Redux Store
- Định nghĩa Stack Navigation với 2 screen chính:
  - `(tabs)` - nhóm các tabs
  - `modal` - modal screen

### 2. Tab Layout (`app/(tabs)/_layout.tsx`)

- Cấu hình Bottom Tab Navigator
- Định nghĩa 5 tab: Home, Series, TV Shows, Cartoon, Cinema
- Cài đặt icon, title, màu sắc cho mỗi tab

### 3. Tab Screens (`app/(tabs)/index.tsx`, etc.)

- Mỗi file là một tab screen
- Import và render page component tương ứng

## 🎯 Sử dụng Header (tùy chọn)

Nếu bạn muốn thêm Header vào các tab, import `Header` component:

```tsx
// Ví dụ: app/(tabs)/index.tsx
import { Header } from '@/components/layout';
import { HomePage } from '@/pages/HomePage';
import React from 'react';
import { View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Header
        onMenuPress={() => console.log('Menu pressed')}
        onSearchPress={() => console.log('Search pressed')}
        title="Home"
      />
      <HomePage />
    </View>
  );
}
```

**Lưu ý:** Header component hiện chỉ có nút menu và search, không còn drawer.

## 🔗 Navigation giữa các screens

### Dùng `useRouter` hook:

```tsx
import { useRouter } from 'expo-router';

export function MyComponent() {
  const router = useRouter();

  return <Button onPress={() => router.push('/series')} title="Go to Series" />;
}
```

### Dùng `Link` component:

```tsx
import { Link } from 'expo-router';

export function MyComponent() {
  return <Link href="/series">Go to Series</Link>;
}
```

## 🚀 Thêm tab mới

1. Tạo file mới trong `app/(tabs)/`, ví dụ: `app/(tabs)/search.tsx`
2. Export một component mặc định:
   ```tsx
   export default function SearchScreen() {
     return <SearchPage />;
   }
   ```
3. Thêm `<Tabs.Screen>` trong `app/(tabs)/_layout.tsx`

## 📝 Lưu ý

- **Drawer đã xóa**: Hiện tại dự án sử dụng Tabs Navigation, không cần Drawer
- **ScreenWrapper đã xóa**: Không cần wrapper vì mỗi tab có thể quản lý layout riêng
- **MainLayout đã xóa**: Thay thế bằng Tab Navigation trong `app/(tabs)/_layout.tsx`
- Tất cả pages (`HomePage`, `SeriesPage`, etc.) được giữ nguyên
- Header component vẫn còn nếu bạn muốn sử dụng ở các tab cụ thể

## 🧪 Test router

Để test router, chạy:

```bash
npm start
```

Hoặc:

```bash
expo start
```

Sau đó nhấn:

- `i` để mở iOS simulator
- `a` để mở Android emulator
- `w` để mở web browser
