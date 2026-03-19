import { User } from '@/store/slices/Auth/authSlice';
import { AuthResponse, LoginParams, SignupParams } from './types';

const mockUsers: { [email: string]: { password: string; user: User } } = {
  'phamdo@dev.com': {
    password: '123456',
    user: {
      id: '1',
      name: 'Phạm Đô',
      email: 'phamdo@dev.com',
      avatar: 'https://i.pravatar.cc/100?img=1',
      createdAt: new Date().toISOString(),
    },
  },
  'demo@example.com': {
    password: '123456',
    user: {
      id: '2',
      name: 'Demo User',
      email: 'demo@example.com',
      avatar: 'https://i.pravatar.cc/100?img=2',
      createdAt: new Date().toISOString(),
    },
  },
};

export const loginMock = async (params: LoginParams): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userData = mockUsers[params.email];

      if (!userData) {
        reject({
          status: false,
          message: 'Email không tồn tại',
        });
        return;
      }

      if (userData.password !== params.password) {
        reject({
          status: false,
          message: 'Mật khẩu không đúng',
        });
        return;
      }

      resolve({
        status: true,
        user: userData.user,
        message: 'Đăng nhập thành công',
      });
    }, 1000); // Simulate network delay
  });
};

export const signupMock = async (params: SignupParams): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (params.password !== params.confirmPassword) {
        reject({
          status: false,
          message: 'Mật khẩu không khớp',
        });
        return;
      }

      if (mockUsers[params.email]) {
        reject({
          status: false,
          message: 'Email đã tồn tại',
        });
        return;
      }

      if (params.password.length < 6) {
        reject({
          status: false,
          message: 'Mật khẩu phải ít nhất 6 ký tự',
        });
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: params.name,
        email: params.email,
        avatar: `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70)}`,
        createdAt: new Date().toISOString(),
      };

      mockUsers[params.email] = {
        password: params.password,
        user: newUser,
      };

      resolve({
        status: true,
        user: newUser,
        message: 'Đăng ký thành công',
      });
    }, 1000); // Simulate network delay
  });
};
